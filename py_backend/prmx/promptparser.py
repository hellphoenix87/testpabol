""" Parse replacements and logic from prompt input files

Usage:
This is {{GENRE}} movie for {{AGE_GROUP}}.
Movie Duration: <<MOVIE_DURATION, prompt parameters, ...>>
Movie Plot: <<PLOT, prompt parameters, ...>>

This example will translate with { "GENRE": "horror", "AGE_GROUP": "adults"} into the following string for the first prompt:
"This is horror movie for adults.
Movie Duration:"

This will replace {{GENRE}} with the dict entry of "GENRE" and trigger the LLM for each <<...>> prompt.
The options for the LLM query are:
<<NAME, prompt parameters, ...>>

    NAME is the name of the LLM prompt. The return value of the eval() function contains a dict with {"NAME", llm_return_value}.
Optional
    parameters for the LLM Api call. They must resemble existing parameters for the LLM Api call, see:
    https://platform.openai.com/docs/api-reference/chat/create
"""

from prmx.llm import llm_api_call
import re


def prompt_preprocess(prompt_text, replacement_dict):
    # replace {{key}} with value
    for key, value in replacement_dict.items():
        if type(value) in [str, int]:
            prompt_text = prompt_text.replace("{{" + key + "}}", str(value))
        elif type(value) is dict:
            insertion_text = "\n".join([f"{k}: {v}" for k, v in value.items()])
            prompt_text = prompt_text.replace("{{" + key + "}}", insertion_text)
        else:
            raise TypeError("Type of replacement value not supported.")
    # ensure that no {{key}} is left in the prompt
    assert len(re.findall(r"{{(.+?)}}", prompt_text)) == 0, (
        "Found remaining {{...}} keys in prompt:\nSTART <<<<<\n\n"
        + prompt_text
        + "\n\n>>>>> END\n{{...}} keys should not be left in the prompt.\n"
    )
    return prompt_text


def parse_parameter_list(test_str: str):
    if len(test_str) == 0:
        return {}
    items = [item.strip() for item in test_str.split(",")]
    items = [item.split("=") for item in items]
    items = [(item[0].strip(), eval(item[1].strip())) for item in items]
    return dict(items)


def eval_prompt(
    prompt_text, replacement_dict, llm_fun=llm_api_call, additional_params={}
):
    # Evaluates the prompt text and returns a dict with all LLM return values.
    prompt_text = prompt_preprocess(prompt_text, replacement_dict)

    # find all <<...>> queries in prompt_text
    splitted_prompt_text = re.split(r"<<(.+?)>>", prompt_text)
    # even parts are the prompt segments, odd parts are the LLM queries
    prompt_segments = splitted_prompt_text[::2]
    llm_queries = splitted_prompt_text[1::2]

    prompt_status = prompt_segments.pop(0)
    llm_return_values = {}
    for query in llm_queries:
        # split query into name and parameters
        name = query.split(",")[0]
        parameter_part = query[len(name) + 1 :].strip()
        # call LLM Api with name and parameters
        parameters = parse_parameter_list(parameter_part)
        # add "additional_params" to parameters
        parameters.update(additional_params)
        llm_return_values[name] = llm_fun(prompt_status.strip(), parameters).strip(
            " \n\r"
        )

        # concat the llm result to the prompt_status
        prompt_status += llm_return_values[name]
        # concat the next prompt segment to the prompt_status
        prompt_status += prompt_segments.pop(0)
    assert (
        len(prompt_segments) == 0
    ), "There are more prompt segments than LLM queries. This should not happen."

    return llm_return_values
