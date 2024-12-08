""" stateful execution context holding:
- runtime configuration
- function call tracker for dynamic mock path routing
"""

from prmx import util
import os
import yaml
import sys
from PIL import Image
from pydub import AudioSegment
from typing import Any
from prmx.datastore_local import DatastoreLocal
import pickle

MOCK_CONFIG = {
    "genre": "crime",
    "attributes": ["hero"],
    "audience": 2,  # Adults
    "user_text": "",
}


# runtime configuration managing environment variables for loose function coupling
class Config:
    """Entrypoint to runtime configuration.

    If no profile name is provided, the environment variable PRMX_PROFILE is used.
    A name provided at the start of the application will also set PRMX_PROFILE if undefined.
    Subsequent calls to Config() will use the same name through the environment variable.
    When PRMX_PROFILE is already set, calling Config(name="name") works in isolated mode:
       it doesn't override the environment variable.

    The same applies to PRMX_CID.
    """

    def __init__(self, profile: str = None, cid: str = None, force: bool = False):
        """instantiates a runtime configuration

        Parameters
        ----------
        profile : str, optional
            name of the configuration profile in config.yml
        cid : str, optional
            unique Creation Id of a work-in-progress movie
        force : bool, optional
            override PRMX_PROFILE if already set, useful while testing
        """
        profile = self.set(profile, "PRMX_PROFILE", force=force)
        assert profile in ["mock", "test", "default"]
        self.name = profile
        with open("prmx/config.yml") as file:
            self.profiles = yaml.safe_load(file)["profiles"]
        self.profile = self.profiles[self.name]

        self.cid = self.set(cid, "PRMX_CID", force=force)

        # settings always determined by PRMX_PROFILE: currently, they cannot be set by env var.
        self.log_llm_prompts = self.profile["log_llm_prompts"]
        self.mock = self.profile["mock_generative_apis"]

    def set(
        self, value: str, variable: str, default: str = "default", force: bool = False
    ) -> str:
        if value:
            if variable not in os.environ or force:
                # do not override runtime config but share it when not set, unless force is True
                os.environ[variable] = value
        else:
            value = os.environ.get(variable, default).lower()
        return value


# wrapper over Config & Tracker to resolve logged output path & mock input routing of API calls
class Context:
    ASSETS_DIR = "assets"
    MEDIA_DIR = "media"
    MOCK_INPUT_FLAG = "_prompt"

    def __init__(self, config: Config):
        self.config = config
        """The origin is the caller's caller, e.g. api.get_character for llm_api_call;
        skipping the middle layer (2nd frame), e.g. promptparser in LLM calls.
           This integer selects an upstream function where calls will be indexed to iterate through mock assets.
        """
        self.origin_level = 3  # i.e. 2 stack frames up the current function call
        self.local_ds = DatastoreLocal()
        self.mock_dir_path = f"{self.ASSETS_DIR}/{self.config.cid}/"

    def get_all_mocked_shot_ambient_desc(self) -> list[str]:
        FILE_NAME = "shots"
        FILE_EXT = ".json"
        files = os.listdir(self.mock_dir_path)
        ambient_desc_list = []

        for filename in files:
            if filename.startswith(FILE_NAME) and filename.endswith(FILE_EXT):
                for shot in util.load_json(f"{self.mock_dir_path}/{filename}"):
                    ambient_desc_list.append(shot["sound"])

        return ambient_desc_list

    def get_all_mocked_scene_music_desc(self) -> list[str]:
        file = util.load_json(f"{self.mock_dir_path}/scenes.json")
        return [item["music_desc"] for item in file]

    def get_all_mocked_assets_desc(self, file_name) -> list[str]:
        file = util.load_json(f"{self.mock_dir_path}/{file_name}.json")
        return [item["name"] + ". " + item["desc"] for item in file]

    def get_mocked_media_prompts(self) -> list[str]:
        # Load the expected input from the mocked json output
        MAP_METHOD_TO_INPUT_FILENAME = {
            "get_music": "scenes",
            "get_ambient_sound_url": "shots",
            "attribute_voices": "characters",
        }

        initial_method = sys._getframe(self.origin_level).f_code.co_name
        file_name = MAP_METHOD_TO_INPUT_FILENAME[initial_method]

        get_list_by_filename = {
            "scenes": self.get_all_mocked_scene_music_desc,
            "shots": self.get_all_mocked_shot_ambient_desc,
            "characters": lambda: self.get_all_mocked_assets_desc("characters"),
        }

        return get_list_by_filename[file_name]()

    # The function returns all files in the assets folder that match the origin function name.
    def get_mocked_prompts(self) -> list[str]:
        origin = sys._getframe(self.origin_level).f_code.co_name

        # get all files in the assets folder
        path = f"{self.mock_dir_path}/{origin}"
        files = os.listdir(path)
        caller = sys._getframe(1).f_code.co_name

        # Return content of the filtered files in the assets folder
        files_content = []

        for file in files:
            if file.startswith(caller) and file.endswith(
                self.MOCK_INPUT_FLAG + ".json"
            ):
                content = util.load_json(f"{path}/{file}")
                files_content.append(content)

        return files_content

    def load(self, parameters: Any, binary=False) -> Any:
        origin = sys._getframe(self.origin_level).f_code.co_name
        hash = util.hash(parameters)
        origin = f"{self.mock_dir_path}/{origin}/"
        # function calling this method: sys._getframe(0) is context()
        caller = sys._getframe(1).f_code.co_name
        filename = f"{origin}{caller}_{hash}"

        if binary:  # use pickle
            path = f"{filename}.pkl"

            # The error is handled in the calling function
            if not os.path.exists(path):
                return None

            return pickle.load(open(path, "rb"))

        else:
            path = f"{filename}.json"
            return util.load_json(path)

    def save(self, data: any, parameters: Any, prompt="", binary=False) -> None:
        # persist return value only if running tests
        if not "unittest" in sys.modules:
            return

        origin = sys._getframe(self.origin_level).f_code.co_name
        hash = util.hash(parameters)
        origin = f"{self.config.cid}/{origin}"

        if not os.path.exists(origin):
            os.makedirs(origin)

        caller = sys._getframe(1).f_code.co_name
        filename = f"{caller}_{hash}"

        self.local_ds.save("api_test", origin, filename, data, binary=binary)

        if prompt:
            self.local_ds.save(
                "api_test",
                origin,
                f"{filename}{self.MOCK_INPUT_FLAG}",
                prompt,
                binary=binary,
            )

    def get_image(self, hash: str) -> Image:
        bboxes = util.load_json(f"assets/{self.config.cid}/bbox_{hash}.json")
        return Image.open(f"assets/{self.config.cid}/media/{hash}.png"), bboxes

    def get_line(self, hash: str) -> AudioSegment:
        file = f"{self.mock_dir_path}/{self.MEDIA_DIR}/{hash}.mp3"
        return AudioSegment.from_mp3(file)


def localContext():
    return Context(Config())
