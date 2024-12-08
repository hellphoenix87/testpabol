""" web api and integration tests run against actual cloud storage with no emulation
"""

import os
from prmx import util, web
from unittest import TestCase, main
import git


app = util.unit_test_app_init()


class Test_TestFirestore(TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        repo = git.Repo(".")
        # matches the short hash output of `git log --oneline -1`
        sha = repo.head.object.hexsha[:7]
        uid_root = "firestore_test"
        # avoid conflicts with CI runs
        uid_suffix = "_ci" if os.environ.get("CI") == "true" else ""
        # see /creators/firestore_test_dce7d1e for test data in Firebase console,
        # when `git log --oneline -1` returns dce7d1e as the HEAD commit
        #
        cls.uid = uid_root + uid_suffix + "_" + sha
        cls.mock_cid = "default"

    def __init__(self, methodName: str = ...) -> None:
        super().__init__(methodName)
        self.cid = methodName

    # call to delete previous test data
    def delete_creation(self):
        web.ds().runtime_path(self.uid, self.cid, "creations").delete()

    def test_keyed_fields(self):
        self.delete_creation()
        data = {"a": 1, "b": 2}
        web.ds().save(self.uid, self.cid, "", data)
        self.assertEqual(web.ds().load(self.uid, self.cid, ["a", "b"]), data)

    def test_named_field(self):
        self.delete_creation()
        data = 3
        web.ds().save(self.uid, self.cid, "my_field", data)
        self.assertEqual(
            web.ds().load(self.uid, self.cid, "my_field"), {"my_field": data}
        )

    def test_keyed_collection(self):
        self.delete_creation()
        locations = {
            "locations": util.load_json(f"assets/{self.mock_cid}/locations.json")
        }
        # a dict key should be used as the name of a list-of-dict value (collection):
        web.ds().save(
            self.uid, self.cid, "", locations
        )  # hence, name is an empty string
        self.assertEqual(web.ds().load(self.uid, self.cid, "locations"), locations)

    def test_named_collection(self):
        self.delete_creation()
        script = util.load_json(f"assets/{self.mock_cid}/script.json")
        # a list of dicts must be passed a name to be saved as an expected collection
        web.ds().save(self.uid, self.cid, "script", script)
        self.assertEqual(
            web.ds().load(self.uid, self.cid, "script"), {"script": script}
        )

    def test_nested_collection(self):
        self.delete_creation()
        scene = 0
        shots = util.load_json(f"assets/{self.mock_cid}/shots_{scene}.json")
        path = f"scenes.{scene}.shots"
        web.ds().save(self.uid, self.cid, path, shots)
        loaded_data = web.ds().load(self.uid, self.cid, path)
        ref_data = {"shots": shots}
        # remove unhashable dialog dict from each shot for debugging info below
        [d.pop("dialog") for d in ref_data["shots"]]
        [d.pop("dialog") for d in loaded_data["shots"] if "dialog" in d]
        print("DIFFERENCE between actual and expected shots:")
        for expected, actual in zip(ref_data["shots"], loaded_data["shots"]):
            print(set(expected) - set(actual))
        self.assertEqual(loaded_data, ref_data)

    def test_nested_field(self):
        self.delete_creation()
        url = "https://domain.com/music.mp3"
        path = "scenes.0.music_url"
        web.ds().save(self.uid, self.cid, path, url)
        self.assertEqual(web.ds().load(self.uid, self.cid, path), {"music_url": url})

    # an obvious failure case is not covered in this test but can be verified in Firebase/Firestore UI:
    # keys must be effectively nested and not stored as a string under the firestore_test user
    def test_deep_nested_field(self):
        self.delete_creation()
        url = "https://domain.com/image.png"
        path = "scenes.0.shots.0.image_url"
        web.ds().save(self.uid, self.cid, path, url)
        self.assertEqual(web.ds().load(self.uid, self.cid, path), {"image_url": url})


if __name__ == "__main__":
    main()
