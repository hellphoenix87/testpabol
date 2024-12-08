""" Workflow to manually test and/or develop around the filmmaking API.
Methods are not tests in the traditional sense, but rather a way to run the API in a local environment.

- Methods in the `reference_workflow` are designed to be run in order, but can be run individually.
- To re-run an earlier step (out-of-order), reset the completion "state" of the movie by deleting the runtime folder.

Other notable methods:
- `test_regenerate_test_assets` re-generates all test assets, including images and speech
    -> the mock assets it generates are used to run web_test.py
- `test_preview` lets you preview a video, refer to its docstring for more details
- `test_full_pipeline` runs the entire movie pipeline (the reference workflow) at once, against generative APIs
- `test_offline_pipeline` runs the entire movie pipeline (the reference workflow) at once, but with mock assets
"""

import pytest
import os
import shutil
from preview_test import downloadPreviewVideo, prepare_test_media_files, preview_video
from conftest import populate_characters_with_voice


# if running in the cloud, skip tests
if os.environ.get("CI") == "true":
    pytest.skip("skipping reference-tests", allow_module_level=True)

from prmx import api, context, datastore_local, finetuning, llm, speech, util
import unittest


# some stored resources, such as music, can be accessed through the default app
app = util.unit_test_app_init()

# If true, overlay the dialog lines and image desc
DRAW_DIALOG = True


class Test_TestApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        util.setup_env_secrets()
        cls.ds = datastore_local.DatastoreLocal()
        cls.uid = "api_test"
        cls.cid = "default"
        cls.config = context.Config(profile="test", cid=cls.cid, force=True)
        cls.reference_workflow = [
            cls.test_generate_title_plot,
            cls.test_scene_captions,
            cls.test_generate_summary,
            cls.test_characters,
            cls.test_locations,
            cls.test_script,
            cls.test_music,
            cls.test_all_shots,
            cls.test_all_shots_img,
            cls.test_all_speeches,
        ]
        cls.genre = api.genres.index(context.MOCK_CONFIG["genre"])
        cls.attributes = context.MOCK_CONFIG["attributes"]
        cls.audience = context.MOCK_CONFIG["audience"]
        cls.user_text = context.MOCK_CONFIG["user_text"]

    def test_generate_finetune_raw(self):
        finetuning.generate_finetune_raw(self)

    def test_generate_finetune_reference_data(self):
        finetuning.generate_finetune_reference_data()

    def test_finetune_shot(self):
        finetuning.dataprep([llm.Llm_model.SHOT_FINETUNE])
        finetuning.finetune("shot")

    def test_finetune_script(self):
        finetuning.dataprep([llm.Llm_model.SCRIPT_FINETUNE])
        finetuning.finetune("script")

    def test_finetune_char(self):
        finetuning.dataprep([llm.Llm_model.CHAR_FINETUNE])
        finetuning.finetune("char")

    def test_finetune_loc(self):
        finetuning.dataprep([llm.Llm_model.LOC_FINETUNE])
        finetuning.finetune("loc")

    def test_regenerate_test_assets(self):
        # remove folder "runtime" and all its contents
        shutil.rmtree("runtime", ignore_errors=True)
        shutil.rmtree(f"assets/{self.cid}", ignore_errors=True)

        # regenerate all test assets
        for test in self.reference_workflow:
            test(self)

        # copy content of runtime/api_test/default to assets/default
        shutil.copytree(f"runtime/{self.uid}/{self.cid}", f"assets/{self.cid}")

    def test_generate_title_plot(self):
        response = api.get_title_plot(
            self.genre, self.attributes, self.audience, self.user_text
        )
        self.ds.save(self.uid, self.cid, "title", response["title"])
        self.ds.save(self.uid, self.cid, "scenes", response["scenes"])

    def test_scene_captions(self):
        (scenes,) = util.loader(self.uid, self.cid, self.ds, ["scenes"])
        captions = api.get_captions(scenes)
        self.ds.save(self.uid, self.cid, "captions", captions)

    def test_generate_summary(self):
        title, scenes = util.loader(self.uid, self.cid, self.ds, ["title", "scenes"])
        summary = api.get_summary(
            self.genre, self.attributes, self.audience, title, scenes
        )
        self.assertGreater(len(summary), 0)
        plot_char_len = sum([len(scene["desc"]) for scene in scenes])
        self.assertLess(len(summary), plot_char_len)
        self.ds.save(self.uid, self.cid, "summary", summary)

    def test_characters(self):
        (scenes,) = util.loader(self.uid, self.cid, self.ds, ["scenes"])
        characters = api.get_characters(
            self.genre, self.attributes, self.audience, scenes
        )
        self.assertGreater(len(characters), 0)
        self.ds.save(self.uid, self.cid, "characters", characters)
        speech.debug_character_pitch_distribution(characters)

    def test_locations(self):
        title, scenes = util.loader(self.uid, self.cid, self.ds, ["title", "scenes"])
        locations = api.get_locations(title, scenes)
        self.assertGreater(len(locations), 0)
        self.ds.save(self.uid, self.cid, "locations", locations)

    def test_script(self):
        scenes, characters, locations = util.loader(
            self.uid, self.cid, self.ds, ["scenes", "characters", "locations"]
        )
        script = []
        for scene_id in range(len(scenes)):
            script.append(
                api.get_script(
                    self.genre,
                    self.attributes,
                    self.audience,
                    scenes,
                    locations,
                    characters,
                    scene_id,
                )
            )
        self.ds.save(self.uid, self.cid, "script", script)

    def test_music(self):
        (scenes,) = util.loader(self.uid, self.cid, self.ds, ["scenes"])
        # get the music strings from the scene data
        music_data = api.get_music(scenes)
        self.ds.save(self.uid, self.cid, "music_data", music_data)
        # add music urls to scenes to mock the app and include music in the preview
        for index in range(len(scenes)):
            scenes[index]["music_url"] = music_data[index][0]["id"]
        self.ds.save(self.uid, self.cid, "scenes", scenes)

    def test_shot_for_single_scene(self):
        scene = 3
        characters, locations, script = util.loader(
            self.uid, self.cid, self.ds, ["characters", "locations", "script"]
        )
        shots = api.get_shots(script, locations, characters, scene)
        self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_shot_img_for_single_shot(self):
        scene = 0
        shot_id = 1
        shots, characters, locations = util.loader(
            self.uid, self.cid, self.ds, [f"shots_{scene}", "characters", "locations"]
        )
        characters = populate_characters_with_voice(characters)
        shot = shots[shot_id]
        result = api.get_shot_image(
            shot, characters, locations, draw_dialog=DRAW_DIALOG
        )[0]
        img, hash, bounding_boxes = (
            result["image"],
            result["hash"],
            result["bounding_boxes"],
        )
        self.ds.put_image(self.uid, self.cid, img, hash)
        self.ds.save(self.uid, self.cid, f"bbox_{hash}", bounding_boxes)
        shot["image_hash"] = hash
        self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_hash_for_edited_shot(self):
        scene = 0
        shot_id = 1
        # load shots from scene 0, shot 1
        shot = util.load_json(f"assets/default/shots_{scene}.json")[shot_id]
        characters, locations = util.loader(
            self.uid, self.cid, self.ds, ["characters", "locations"]
        )
        hash = shot["image_hash"]
        # edit a parameter in shot
        # camera_lens ranges from 0 to 3
        shot["camera_lens"] = (shot["camera_lens"] + 1) % 4
        new_hash = api.get_shot_image(shot, characters, locations)[0]["hash"]
        # check that the hash is different
        self.assertNotEquals(hash, new_hash)

    def test_shot_img_for_single_scene(self):
        scene = 0
        shots, characters, locations = util.loader(
            self.uid, self.cid, self.ds, [f"shots_{scene}", "characters", "locations"]
        )
        results = api.get_shot_images(
            shots, characters, locations, draw_dialog=DRAW_DIALOG
        )
        for shot, result in zip(shots, results):
            img, hash, bounding_boxes = (
                result["image"],
                result["hash"],
                result["bounding_boxes"],
            )
            self.ds.put_image(self.uid, self.cid, img, hash)
            self.ds.save(self.uid, self.cid, f"bbox_{hash}", bounding_boxes)
            shot["image_hash"] = hash
        self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_hash_for_edited_shot_speech(self):
        scene = 0
        shot_id = 2
        line_id = 1
        # load line from scene 0, shot 2, line 1
        dialog = util.load_json(f"assets/default/shots_{scene}.json")[shot_id][
            "dialog"
        ][line_id]
        characters, locations = util.loader(
            self.uid, self.cid, self.ds, ["characters", "locations"]
        )
        characters = populate_characters_with_voice(characters)
        hash = dialog["speech_hash"]
        # edit a parameter in dialog
        dialog["line"] += " edit"
        _, new_hash = api.get_line_speech(dialog, characters, locations)
        # check that the hash is different
        self.assertNotEquals(hash, new_hash)

    def test_speech_for_single_shot(self):
        scene = 0
        shot_id = 1
        shots, characters, locations = util.loader(
            self.uid, self.cid, self.ds, [f"shots_{scene}", "characters", "locations"]
        )
        characters = populate_characters_with_voice(characters)
        shot = shots[shot_id]
        lines, hashes = api.get_shot_speech(shot, characters, locations)
        for line_id, (line, hash) in enumerate(zip(lines, hashes)):
            self.ds.put_speech(self.uid, self.cid, line, hash)
            shot["dialog"][line_id]["speech_hash"] = hash
        self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_speech_for_single_scene(self):
        scene = 0
        shots, characters, locations = util.loader(
            self.uid, self.cid, self.ds, [f"shots_{scene}", "characters", "locations"]
        )
        characters = populate_characters_with_voice(characters)
        dialog_lines, hashes_list = api.get_shot_speeches(shots, characters, locations)
        for shot, lines, hashes in zip(shots, dialog_lines, hashes_list):
            for line_id, (line, hash) in enumerate(zip(lines, hashes)):
                self.ds.put_speech(self.uid, self.cid, line, hash)
                shot["dialog"][line_id]["speech_hash"] = hash
        self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_all_shots(self):
        characters, locations, script = util.loader(
            self.uid, self.cid, self.ds, ["characters", "locations", "script"]
        )
        for scene in range(len(script)):
            shots = api.get_shots(script, locations, characters, scene)
            self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_all_shots_img(self):
        script = self.ds.load(self.uid, self.cid, "script")
        for scene in range(len(script)):
            shots, characters, locations = util.loader(
                self.uid,
                self.cid,
                self.ds,
                [f"shots_{scene}", "characters", "locations"],
            )

            results = api.get_shot_images(
                shots, characters, locations, draw_dialog=DRAW_DIALOG
            )
            for shot, result in zip(shots, results):
                img, hash, bounding_boxes = (
                    result["image"],
                    result["hash"],
                    result["bounding_boxes"],
                )
                self.ds.put_image(self.uid, self.cid, img, hash)
                self.ds.save(self.uid, self.cid, f"bbox_{hash}", bounding_boxes)
                shot["image_hash"] = hash
            self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_all_speeches(self):
        script, characters, locations = util.loader(
            self.uid, self.cid, self.ds, [f"script", "characters", "locations"]
        )
        characters = populate_characters_with_voice(characters)

        for scene in range(len(script)):
            shots = self.ds.load(self.uid, self.cid, f"shots_{scene}")
            dialog_lines, hashes_list = api.get_shot_speeches(
                shots, characters, locations
            )
            for shot, lines, hashes in zip(shots, dialog_lines, hashes_list):
                for line_id, (line, hash) in enumerate(zip(lines, hashes)):
                    self.ds.put_speech(self.uid, self.cid, line, hash)
                    shot["dialog"][line_id]["speech_hash"] = hash
            self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_preview(self):
        """
        To preview a video, the runtime folder should already contain movie files. This can be done by...
            1. running `test_offline_pipeline` to simply run a preview on mock assets;
            2. running `test_full_pipeline` to generate a new movie;
            3. manually iterate over tests defined in `cls.reference_workflow`.
        """
        APP_HASH = "R0b5fb3c"
        remote_cid = prepare_test_media_files(self)
        res = preview_video(self.uid, remote_cid, APP_HASH)
        print(res)
        assert (
            "url" in res
        ), f"No url key in {res}: if 'Unauthorized', refresh your personal token with `gcloud auth login`."
        downloadPreviewVideo(res["url"])

    def test_full_pipeline(self):
        for test in self.reference_workflow:
            test(self)

    def test_offline_pipeline(self):
        # override test config with mock
        self.config = context.Config(profile="mock", cid=self.cid, force=True)
        for func in self.reference_workflow:
            func(self)


if __name__ == "__main__":
    unittest.main()
