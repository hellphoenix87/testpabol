import tiktoken  # for token counting
import numpy as np
from collections import defaultdict
from prmx.promptparser import prompt_preprocess
from prmx.util import load_txt
from prmx.api import (
    get_block_representation,
    get_meta,
)
from prmx.imagen import shot_type_desc
from openai import OpenAI
import random, json
from prmx import api, util, llm
import os, shutil, time
import threading
from tqdm import tqdm
from functools import cache


@cache
def openai_client() -> OpenAI:
    return OpenAI(
        max_retries=1,
        timeout=90,
    )


def confirm_finetune():
    # ask user to input yes
    print(
        "WARNING: You are about to trigger an expensive finetune command. Are you sure you want to do that?"
    )
    print("Type 'yes' to confirm.")
    if input() != "yes":
        print("Aborting.")
        exit()


# Use GPT4 to generate reference results for the finetune API
def generate_finetune_raw(api_test):
    confirm_finetune()
    # Uncomment to regenerate all data
    # shutil.rmtree(f"assets/finetune_data", ignore_errors=True)

    # The finetune data is generated similar to generating the test assets. We shuffle
    # the movie generation attributes and generate a number of movie scenes.
    NUM_MOVIES = 100  # https://platform.openai.com/docs/guides/fine-tuning/example-count-recommendations

    for _ in tqdm(range(NUM_MOVIES)):
        shutil.rmtree("runtime", ignore_errors=True)
        # set random genre from api.genres list of strings
        api_test.genre = random.randint(0, len(api.genres) - 1)
        api_test.attributes = []
        for key in api.attribute_prompts.keys():
            # 50% chance
            if random.randint(0, 1) == 0:
                api_test.attributes.append(key)
        api_test.audience = random.randint(0, len(api.audience_prompts) - 1)
        api_test.user_text = ""

        # Generate the movie data
        api_test.test_generate_title_plot()

        movie_name = util.load_json(f"runtime/{api_test.uid}/{api_test.cid}/title.json")
        # replace spaces with underscores
        movie_name = "_".join(movie_name.split(" "))

        movie_folder = f"assets/finetune_data/{movie_name}"
        # copy only the *.json files
        os.makedirs(movie_folder, exist_ok=True)
        os.makedirs(f"{movie_folder}/reference_results", exist_ok=True)
        os.makedirs(f"{movie_folder}/prompts", exist_ok=True)

        for file in os.listdir(f"runtime/{api_test.uid}/{api_test.cid}"):
            if file.endswith(".json"):
                shutil.copy(
                    f"runtime/{api_test.uid}/{api_test.cid}/{file}", movie_folder
                )

        meta = get_meta(api_test.genre, api_test.attributes, api_test.audience)
        util.save_to_txt(json.dumps(meta), f"{movie_folder}/meta.json")

        util.save_to_txt(
            json.dumps(
                {
                    "genre": api_test.genre,
                    "attributes": api_test.attributes,
                    "audience": api_test.audience,
                    "user_text": api_test.user_text,
                }
            ),
            f"{movie_folder}/meta_data.json",
        )


def calc_gpt4_ref(
    reference_prompt: str,
    role: llm.Llm_model,
) -> None | str:
    try:
        # now call GPT4 to generate the reference results
        response = openai_client().chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": llm.get_llm_role(role),
                },
                {
                    "role": "user",
                    "content": reference_prompt,
                },
            ],
            temperature=0,
            max_tokens=4000,  # the max. length for finetuning is 4096
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
        )
    except:
        time.sleep(10)
        return None
    return response.choices[0].message.content


def generate_reference_results(
    movie_folder, category, identifier: str, replacement_dict, llm_model
):
    """
    Generate and save reference results for a given category if they don't already exist.

    :param movie_folder: The base folder for the movie.
    :param category: The category for which to generate results (e.g., 'characters', 'locations').
    :param replacement_dict: Dictionary with data to replace in the prompt templates.
    :param llm_model: The language model to use for generation.
    """
    template_folder = "prmx/prompts"
    result_folder = os.path.join(movie_folder, "reference_results")
    prompts_folder = os.path.join(movie_folder, "prompts")

    # Create the directory if it does not exist
    if not os.path.exists(result_folder):
        os.makedirs(result_folder)

    prompt_txt_identifier = category if identifier == "" else f"{category}_{identifier}"

    reference_prompt = prompt_preprocess(
        load_txt(os.path.join(template_folder, f"{category}_reference.txt")),
        replacement_dict,
    )
    finetuned_prompt = prompt_preprocess(
        load_txt(os.path.join(template_folder, f"{category}.txt")), replacement_dict
    )
    result_filename = f"{result_folder}/reference_results_{prompt_txt_identifier}.txt"
    prompt_filename = f"{prompts_folder}/finetuned_prompt_{prompt_txt_identifier}.txt"

    with open(prompt_filename, "w") as f:
        f.write(finetuned_prompt)

    if not os.path.exists(result_filename):
        ref_result = calc_gpt4_ref(
            reference_prompt,
            llm_model,
        )
        if ref_result is None:
            return None, None

        with open(result_filename, "w") as f:
            f.write(ref_result)
    else:
        # Read the reference results from the file
        with open(result_filename, "r") as f:
            ref_result = f.read()
    return ref_result, result_filename


def generate_finetune_reference_data_folder(movie_name):
    # continue if it's not a folder
    if not os.path.isdir(f"assets/finetune_data/{movie_name}"):
        return

    movie_folder = f"assets/finetune_data/{movie_name}"

    # Call GPT4 to generate reference results and bundle everything to make it usable with the finetune API
    scenes = util.load_json(f"{movie_folder}/scenes.json")
    meta = util.load_json(f"{movie_folder}/meta.json")

    # first assets
    replacement_dict_assets = {"PLOT": api.get_plot_block(scenes)}

    # Generate character reference results
    characters_llm, _ = generate_reference_results(
        movie_folder,
        "characters",
        "",
        replacement_dict_assets,
        llm.Llm_model.CHAR_FINETUNE,
    )
    if characters_llm is None:
        print(f"Error while generating characters for {movie_name}")
        return
    characters = llm.parse_assets("character", characters_llm)

    # Generate location reference results
    locations_llm, _ = generate_reference_results(
        movie_folder,
        "locations",
        "",
        replacement_dict_assets,
        llm.Llm_model.LOC_FINETUNE,
    )
    if locations_llm is None:
        print(f"Error while generating locations for {movie_name}")
        return
    locations = llm.parse_assets("location", locations_llm)

    # Create the script and shot reference results per scene
    for scene_id in range(len(scenes)):
        script, _ = generate_reference_results(
            movie_folder,
            "script",
            str(scene_id),
            {
                "META": meta,
                "SCENES": get_block_representation("Scene", scenes),
                "LOCATIONS": get_block_representation(None, locations),
                "CHARACTERS": get_block_representation(None, characters),
                "SCENE_ID": str(scene_id),
            },
            llm.Llm_model.SCRIPT_FINETUNE,
        )

        if script is None:
            print(f"Error while generating script for {movie_name}, {scene_id}")
            continue

        # Now the shots
        shots_result, shots_filename = generate_reference_results(
            movie_folder,
            "shots",
            str(scene_id),
            {
                "LOCATIONS": get_block_representation(
                    "Location", locations, name_only=True
                ),
                "CHARACTERS": get_block_representation(
                    "Character", characters, name_only=True
                ),
                "SCRIPT": script,
            }
            | shot_type_desc,
            llm.Llm_model.SHOT_FINETUNE,
        )

        if shots_result is None:
            print(f"Error while generating shots for {movie_name}, {scene_id}")
            continue

        _, num_errors = llm.parse_shots(shots_result, characters, locations)

        if num_errors > 0:
            print(
                f"LLM output contains {num_errors} errors. See failed_reference_{movie_name}_{scene_id}.txt"
            )
            with open(f"failed_reference_{movie_name}_{scene_id}.txt", "w") as f:
                f.write(shots_result)
            # delete the reference results file
            os.remove(shots_filename)


def generate_finetune_reference_data():
    confirm_finetune()
    if False:  # SINGLE THREADED
        for folder in os.listdir("assets/finetune_data"):
            generate_finetune_reference_data_folder(folder)
    else:  # MULTI THREADED, with pool of 8 threads
        threads = []
        for folder in os.listdir("assets/finetune_data"):
            t = threading.Thread(
                target=generate_finetune_reference_data_folder, args=(folder,)
            )
            threads.append(t)
            t.start()
            while len(threads) >= 8:
                threads = [t for t in threads if t.is_alive()]
                time.sleep(1)
        for t in threads:
            t.join()


# Bundle the reference data for the finetune in the appropriate format for OpenAI API
def dataprep(llm_type_list: list[llm.Llm_model], upload: bool = True):
    train_data = []
    # iterate through all folders in assets/finetune_data/...
    for folder in os.listdir("assets/finetune_data"):
        # continue if it's not a folder
        if not os.path.isdir(f"assets/finetune_data/{folder}"):
            continue
        # for each scene, open the finetuned prompt and the reference_result
        for reference_file in os.listdir(
            f"assets/finetune_data/{folder}/reference_results"
        ):
            reference_path = (
                f"assets/finetune_data/{folder}/reference_results/" + reference_file
            )
            # replace reference_results/reference_results_ with prompts/fine_tuned_prompt_ to get the finetuned prompt file
            finetuned_file = reference_path.replace(
                "reference_results/reference_results_", "prompts/finetuned_prompt_"
            )

            # check if both files exist
            if not os.path.exists(finetuned_file) or not os.path.exists(reference_path):
                print("Missing file:", finetuned_file, reference_path)
                continue

            with open(finetuned_file, "r") as finetuned_prompt_file:
                finetuned_prompt = finetuned_prompt_file.read()
            with open(reference_path, "r") as reference_results_file:
                reference_results = reference_results_file.read()

            model_type = None
            if "_characters" in reference_file:
                model_type = llm.Llm_model.CHAR_FINETUNE
            elif "_locations" in reference_file:
                model_type = llm.Llm_model.LOC_FINETUNE
            elif "script_" in reference_file:
                model_type = llm.Llm_model.SCRIPT_FINETUNE
            else:
                assert (
                    "shots_" in reference_file
                ), f"Unknown reference file type: {reference_file}"
                model_type = llm.Llm_model.SHOT_FINETUNE

            if model_type not in llm_type_list:
                continue

            # append to train_data
            train_data.append(
                {
                    "messages": [
                        {
                            "role": "system",
                            "content": llm.get_llm_role(model_type),
                        },
                        {"role": "user", "content": finetuned_prompt},
                        {"role": "assistant", "content": reference_results},
                    ]
                }
            )

    format_error_checks(train_data)
    token_error_checks(train_data)

    random.shuffle(train_data)
    train_data_path = "assets/finetune_data/train_data.jsonl"

    # save train_data to assets/finetune_data/train_data.jsonl
    with open(train_data_path, "w") as f:
        for item in train_data:
            f.write(json.dumps(item) + "\n")

    if not upload:
        return

    train_file = openai_client().files.create(
        file=open(train_data_path, "rb"), purpose="fine-tune"
    )

    # save both id's to assets/finetune_data/openai_file_ids.json
    with open("assets/finetune_data/openai_file_ids.json", "w") as f:
        f.write(json.dumps({"train_file_id": train_file.id}))


# Create a finetune job and run it
def finetune(suffix: str = ""):
    confirm_finetune()
    with open("assets/finetune_data/openai_file_ids.json", "r") as f:
        file_ids = json.load(f)

    train_response = openai_client().fine_tuning.create(
        training_file=file_ids["train_file_id"], model="gpt-3.5-turbo", suffix=suffix
    )
    print("Train response:", train_response)


# Error checks from https://github.com/openai/openai-cookbook/blob/main/examples/Chat_finetuning_data_prep.ipynb
def format_error_checks(dataset: list[dict]):
    # Format error checks
    format_errors = defaultdict(int)

    for ex in dataset:
        if not isinstance(ex, dict):
            format_errors["data_type"] += 1
            continue

        messages = ex.get("messages", None)
        if not messages:
            format_errors["missing_messages_list"] += 1
            continue

        for message in messages:
            if "role" not in message or "content" not in message:
                format_errors["message_missing_key"] += 1

            if any(k not in ("role", "content", "name") for k in message):
                format_errors["message_unrecognized_key"] += 1

            if message.get("role", None) not in ("system", "user", "assistant"):
                format_errors["unrecognized_role"] += 1

            content = message.get("content", None)
            if not content or not isinstance(content, str):
                format_errors["missing_content"] += 1

        if not any(message.get("role", None) == "assistant" for message in messages):
            format_errors["example_missing_assistant_message"] += 1

    if format_errors:
        print("Found errors:")
        for k, v in format_errors.items():
            print(f"{k}: {v}")
    else:
        print("No errors found")


encoding = tiktoken.get_encoding("cl100k_base")


# not exact!
# simplified from https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
def num_tokens_from_messages(messages, tokens_per_message=3, tokens_per_name=1):
    num_tokens = 0
    for message in messages:
        num_tokens += tokens_per_message
        for key, value in message.items():
            num_tokens += len(encoding.encode(value))
            if key == "name":
                num_tokens += tokens_per_name
    num_tokens += 3
    return num_tokens


def num_assistant_tokens_from_messages(messages):
    num_tokens = 0
    for message in messages:
        if message["role"] == "assistant":
            num_tokens += len(encoding.encode(message["content"]))
    return num_tokens


def print_distribution(values, name):
    print(f"\n#### Distribution of {name}:")
    print(f"min / max: {min(values)}, {max(values)}")
    print(f"mean / median: {np.mean(values)}, {np.median(values)}")
    print(f"p5 / p95: {np.quantile(values, 0.1)}, {np.quantile(values, 0.9)}")


def token_error_checks(dataset: list[dict]):
    # Warnings and tokens counts
    n_missing_system = 0
    n_missing_user = 0
    n_messages = []
    convo_lens = []
    assistant_message_lens = []

    for ex in dataset:
        messages = ex["messages"]
        if not any(message["role"] == "system" for message in messages):
            n_missing_system += 1
        if not any(message["role"] == "user" for message in messages):
            n_missing_user += 1
        n_messages.append(len(messages))
        convo_lens.append(num_tokens_from_messages(messages))
        assistant_message_lens.append(num_assistant_tokens_from_messages(messages))

    print("Num examples (recommendation min. 50-100):", len(dataset))
    print("Num examples missing system message:", n_missing_system)
    print("Num examples missing user message:", n_missing_user)
    print_distribution(n_messages, "num_messages_per_example")
    print_distribution(convo_lens, "num_total_tokens_per_example")
    print_distribution(assistant_message_lens, "num_assistant_tokens_per_example")
    n_too_long = sum(l > 4096 for l in convo_lens)
    print(
        f"\n{n_too_long} examples may be over the 4096 token limit, they will be truncated during fine-tuning"
    )

    # Pricing and default n_epochs estimate
    MAX_TOKENS_PER_EXAMPLE = 4096

    TARGET_EPOCHS = 3
    MIN_TARGET_EXAMPLES = 100
    MAX_TARGET_EXAMPLES = 25000
    MIN_DEFAULT_EPOCHS = 1
    MAX_DEFAULT_EPOCHS = 25

    n_epochs = TARGET_EPOCHS
    n_train_examples = len(dataset)
    if n_train_examples * TARGET_EPOCHS < MIN_TARGET_EXAMPLES:
        n_epochs = min(MAX_DEFAULT_EPOCHS, MIN_TARGET_EXAMPLES // n_train_examples)
    elif n_train_examples * TARGET_EPOCHS > MAX_TARGET_EXAMPLES:
        n_epochs = max(MIN_DEFAULT_EPOCHS, MAX_TARGET_EXAMPLES // n_train_examples)

    n_billing_tokens_in_dataset = sum(
        min(MAX_TOKENS_PER_EXAMPLE, length) for length in convo_lens
    )
    print(
        f"Dataset has ~{n_billing_tokens_in_dataset} tokens that will be charged for during training"
    )
    print(f"By default, you'll train for {n_epochs} epochs on this dataset")
    PRICE_PER_1k = 0.008  # https://openai.com/pricing
    print(
        f"By default, you'll be charged for ~{n_epochs * n_billing_tokens_in_dataset} tokens, resulting in {n_epochs * n_billing_tokens_in_dataset* PRICE_PER_1k/1000}$"
    )
