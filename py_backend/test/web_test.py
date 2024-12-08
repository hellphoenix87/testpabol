"""web api tests run against actual cloud storage with no emulation"""

# NOTE: The UID that is used to store the data on FireStore is generated from the git commit hash.
# This means, if you run into "old" data in FireStore, try commiting to get a new UID.

import os
from prmx import web, context, util, api
from unittest import TestCase, main
import git

from conftest import get_first_dialog_shot


# initialize app for underlying access to firestore and storage
app = util.unit_test_app_init()


class Test_TestWeb(TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        repo = git.Repo(".")
        # matches the short hash output of `git log --oneline -1`
        sha = repo.head.object.hexsha[:7]
        uid_root = "web_test"
        # avoid conflicts with CI runs
        uid_suffix = "_ci" if os.environ.get("CI") == "true" else ""
        # the uid is unique per commit and runtime environment (local or CI)
        cls.uid = uid_root + uid_suffix + "_" + sha
        cls.cid = "default"
        cls.media_path = f"{cls.uid}/{cls.cid}"
        cls.config = context.Config(profile="mock", cid=cls.cid, force=True)
        cls.num_scenes = len(util.load_json(f"assets/{cls.cid}/scenes.json"))

    def assert_text_gen(self, call, extra_kwargs={}):
        asset = call.split("_")[-1]
        data = {
            "cid": self.cid,
            "call": call,
        }
        data.update(extra_kwargs)
        response = web.gen(self.uid, **data)
        expected = util.load_json(f"assets/{self.cid}/{asset}.json")

        # assign expected id to generated in web test for comparison.
        # Because they are randomly
        # generated each time and can't be compared
        if asset == "characters":
            for expected_object, response_object in zip(expected, response[asset]):
                response_object["id"] = expected_object["id"]
        self.assertEqual(response[asset], expected)
        web.ds().save(self.uid, self.cid, "", response)

    def save_shot_with_speech_data_to_web(
        self, response, scene_id, shot_id, line_id=None
    ):
        shot_ref = (
            web.ds()
            .runtime_path(self.uid, self.cid, "creations")
            .collection("scenes")
            .document(str(scene_id))
            .collection("shots")
            .document(str(shot_id))
        )
        data = shot_ref.get().to_dict()
        if isinstance(response, list):
            for line_id, url in enumerate(response):
                data["dialog"][line_id]["line_url"] = url
        else:
            data["dialog"][line_id]["line_url"] = response
        shot_ref.set(data)

    def get_speech_hashes(self, hashes_list):
        urls = []
        for hashes in hashes_list:
            curr_shot_urls = []
            for hash in hashes:
                curr_shot_urls.append(f"{self.media_path}/{hash}.mp3")
            urls.append(curr_shot_urls)
        return urls

    # only test running in CI to order the movie creation workflow
    def test_full_pipeline(self):
        self.title_plot_gen_test()
        self.summary_gen_test()
        self.character_gen_test()
        self.single_character_gen_test()
        self.location_gen_test()
        self.script_gen_test()
        self.shot_gen_test()
        self.music_gen_test()
        self.image_gen_test()
        self.image_gen_for_single_shot_test()
        self.speech_gen_test()
        self.speech_gen_for_single_shot_test()
        self.speech_gen_for_single_line_test()

    def title_plot_gen_test(self):
        meta = {
            "genre": api.genres.index(context.MOCK_CONFIG["genre"]),
            "attributes": context.MOCK_CONFIG["attributes"],
            "audience": context.MOCK_CONFIG["audience"],
            "user_text": context.MOCK_CONFIG["user_text"],
        }
        # add metadata in Firestore for the title and scenes generator
        web.ds().save(self.uid, self.cid, "", meta)
        # web request data
        data = {
            "cid": self.cid,
            "call": "get_title_plot",
        }
        response = web.gen(self.uid, **data)
        title = util.load_json(f"assets/{self.cid}/title.json")
        scenes = util.load_json(f"assets/{self.cid}/scenes.json")
        # remove music_url from mocked scenes for comparison: the api adds it later
        for scene in scenes:
            del scene["music_url"]
        self.assertEqual(response["title"], title)
        self.assertEqual(response["scenes"], scenes)
        # persisting the response in Firestore like the app would do
        web.ds().save(self.uid, self.cid, "", response)

    def summary_gen_test(self):
        # web request data: by default, title and scenes are retrieved from Firestore
        data = {"cid": self.cid, "call": "get_summary"}
        response = web.gen(self.uid, **data)
        summary = util.load_json(f"assets/{self.cid}/summary.json")
        self.assertEqual(response["summary"], summary)
        # persisting the response in Firestore like the app would do
        web.ds().save(self.uid, self.cid, "", response)

    def character_gen_test(self):
        self.assert_text_gen("get_characters")

    def single_character_gen_test(self):
        # get the first character to create a new character without new mock data
        first_char = util.load_json(f"assets/{self.cid}/characters.json")[0]
        params = {
            "name": first_char["name"],
            "desc": first_char["desc"],
        }
        data = {"cid": self.cid, "call": "get_character"}
        data.update(params)
        response = web.gen(self.uid, **data)["character"][0]
        # a user-defined character's role is neither required nor sent for get_character
        first_char.pop("role")
        # except for the id, the response should be the same as the first character
        first_char.pop("id")
        response.pop("id")
        self.assertEqual(response, first_char)

    def location_gen_test(self):
        self.assert_text_gen("get_locations")

    def script_gen_test(self):
        expected = util.load_json(f"assets/{self.cid}/script.json")
        script = []
        for scene_id in range(self.num_scenes):
            data = {"cid": self.cid, "call": "get_script", "scene_id": scene_id}
            response = web.gen(self.uid, **data)
            script.append(response["script"])
        self.assertEqual(script, expected)
        web.ds().save(self.uid, self.cid, "script", script)

    def shot_gen_test(self):
        # loop over all scenes to save all shots in db
        for scene in range(self.num_scenes):
            data = {"cid": self.cid, "call": "get_shots", "scene": scene}
            response = web.gen(self.uid, **data)["shots"]
            shots = util.load_json(f"assets/{self.cid}/shots_{scene}.json")
            # remove hashes from response for comparison. These hashes are generated by the api tests
            # after running the image and speech generation tests. However, the shots dont contain
            # this data after the shots generation first step
            for shot in shots:
                shot.pop("image_hash", None)
                for dialog in shot["dialog"]:
                    dialog.pop("speech_hash", None)
            self.assertEqual(response, shots)
            web.ds().save(self.uid, self.cid, f"scenes.{scene}.shots", response)

    def music_gen_test(self):
        data = {
            "cid": self.cid,
            "call": "get_music",
            # gen_media requires a scene argument, but music is currently retrieved for all scenes
            "scene": "*",
        }
        response = web.gen(self.uid, **data)["music"]
        for musics_for_scene in response:
            if musics_for_scene is None:
                continue
            for music in musics_for_scene:
                # ensure that each music piece has an "id" with an mp3 file if the music is present
                self.assertIn("id", music)
                self.assertIn(".mp3", music["id"])

        for scene, meta in enumerate(response):
            if meta is None:
                web.ds().save(self.uid, self.cid, f"scenes.{scene}.music_url", "")
                web.ds().save(self.uid, self.cid, f"scenes.{scene}.musics", [])
            else:
                web.ds().save(
                    self.uid, self.cid, f"scenes.{scene}.music_url", meta[0]["id"]
                )
                web.ds().save(self.uid, self.cid, f"scenes.{scene}.musics", meta)

    def image_gen_for_single_shot_test(self):
        scene = 0
        shot_id = 1
        shots = util.load_json(f"assets/{self.cid}/shots_{scene}.json")
        hash = shots[shot_id]["image_hash"]
        data = {
            "cid": self.cid,
            "call": "get_shot_image",
            "scene": scene,
            "shot_id": shot_id,
        }
        response = web.gen(self.uid, **data)["shot_image"][0]
        # check the response
        url = f"{self.media_path}/{hash}.png"
        bounding_boxes = util.load_json(f"assets/{self.cid}/bbox_{hash}.json")
        self.assertEqual(response, {"url": url, "bounding_boxes": bounding_boxes})
        # save shot fields in Firestore like the app would do
        web.ds().save(
            self.uid,
            self.cid,
            f"scenes.{scene}.shots.{shot_id}.image_url",
            response["url"],
        )
        web.ds().save(
            self.uid,
            self.cid,
            f"scenes.{scene}.shots.{shot_id}.bounding_boxes",
            response["bounding_boxes"],
        )

    def image_gen_test(self):
        """only checking urls at this api level, they're returned upon successful upload:
        see urls.append(ds.put_image(...)) in web.py"""
        for scene in range(self.num_scenes):
            data = {
                "cid": self.cid,
                "call": "get_shot_images",
                "scene": scene,
            }
            response = web.gen(self.uid, **data)["shot_images"]
            shots = util.load_json(f"assets/{self.cid}/shots_{scene}.json")
            hashes = [shot["image_hash"] for shot in shots]
            expected = [
                {
                    "url": f"{self.media_path}/{hash}.png",
                    "bounding_boxes": util.load_json(
                        f"assets/{self.cid}/bbox_{hash}.json"
                    ),
                }
                for hash in hashes
            ]
            self.assertEqual(response, expected)
            # save shot fields in Firestore like the app would do
            for shot_id, image_meta in enumerate(response):
                web.ds().save(
                    self.uid,
                    self.cid,
                    f"scenes.{scene}.shots.{shot_id}.image_url",
                    image_meta["url"],
                )
                web.ds().save(
                    self.uid,
                    self.cid,
                    f"scenes.{scene}.shots.{shot_id}.bounding_boxes",
                    image_meta["bounding_boxes"],
                )

    def speech_gen_for_single_line_test(self):
        scene, shot_id = get_first_dialog_shot(self.cid)
        line_id = 0
        shots = util.load_json(f"assets/{self.cid}/shots_{scene}.json")
        hash = shots[shot_id]["dialog"][line_id]["speech_hash"]
        data = {
            "cid": self.cid,
            "call": "get_line_speech",
            "scene": scene,
            "shot_id": shot_id,
            "line_id": line_id,
        }
        response = web.gen(self.uid, **data)["line_speech"]
        self.save_shot_with_speech_data_to_web(response, scene, shot_id, line_id)

        urls = f"{self.media_path}/{hash}.mp3"
        self.assertEqual(response, urls)

    def speech_gen_for_single_shot_test(self):
        scene = 0
        shot_id = 0
        shots = util.load_json(f"assets/{self.cid}/shots_{scene}.json")
        hashes = [dialog["speech_hash"] for dialog in shots[shot_id]["dialog"]]
        data = {
            "cid": self.cid,
            "call": "get_shot_speech",
            "scene": scene,
            "shot_id": shot_id,
        }
        response = web.gen(self.uid, **data)["shot_speech"]
        self.save_shot_with_speech_data_to_web(response, scene, shot_id)
        urls = [f"{self.media_path}/{hash}.mp3" for hash in hashes]
        self.assertEqual(response, urls)

    def speech_gen_test(self):
        scene = 0
        shots = util.load_json(f"assets/{self.cid}/shots_{scene}.json")
        hashes_list = []
        for shot in shots:
            hashes = [dialog["speech_hash"] for dialog in shot["dialog"]]
            hashes_list.append(hashes)
        data = {
            "cid": self.cid,
            "call": "get_shot_speeches",
            "scene": scene,
        }
        response = web.gen(self.uid, **data)["shot_speeches"]
        for shot_id, urls in enumerate(response):
            self.save_shot_with_speech_data_to_web(urls, scene, shot_id)

        urls = self.get_speech_hashes(hashes_list)
        self.assertEqual(response, urls)


if __name__ == "__main__":
    main()
