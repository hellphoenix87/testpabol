"""Call inference servers"""

import shutil
from unittest import TestCase, main
from prmx import api, context, util, datastore_local
from conftest import get_first_dialog_shot, populate_characters_with_voice

# If true, overlay the dialog lines and image desc
DRAW_DIALOG = True


class TestInference(TestCase):
    """Call inference servers"""

    @classmethod
    def setUpClass(cls) -> None:
        util.setup_env_secrets()
        cls.ds = datastore_local.DatastoreLocal()
        cls.uid = "inference_test"
        cls.cid = "default"
        cls.config = context.Config(profile="test", cid=cls.cid, force=True)

        # Copy current asset to avoid OpenAI calls
        shutil.rmtree(f"runtime/{cls.uid}", ignore_errors=True)
        shutil.copytree(f"assets/{cls.cid}", f"runtime/{cls.uid}/{cls.cid}")

    def test_shot_img_for_single_shot(self):
        """Test image inference"""

        scene = 0
        shot_id = 1
        shots, characters, locations = util.loader(
            self.uid, self.cid, self.ds, [f"shots_{scene}", "characters", "locations"]
        )
        characters = populate_characters_with_voice(characters)
        shot = shots[shot_id]
        res = api.get_shot_image(shot, characters, locations, draw_dialog=DRAW_DIALOG)[
            0
        ]
        self.ds.put_image(self.uid, self.cid, res["image"], res["hash"])
        shot["image_hash"] = res["hash"]
        self.ds.save(self.uid, self.cid, f"shots_{scene}", shots)

    def test_speech_for_single_line(self):
        """Test voice inference"""

        line_id = 0

        scene_id, shot_id = get_first_dialog_shot(self.cid)

        shots, characters, locations = util.loader(
            self.uid,
            self.cid,
            self.ds,
            [f"shots_{scene_id}", "characters", "locations"],
        )
        characters = populate_characters_with_voice(characters)
        shot = shots[shot_id]
        line = shot["dialog"][line_id]
        speech, hash = api.get_line_speech(line, characters, locations)
        self.ds.put_speech(self.uid, self.cid, speech, hash)
        shot["dialog"][line_id]["speech_hash"] = hash
        self.ds.save(self.uid, self.cid, f"shots_{scene_id}", shots)


if __name__ == "__main__":
    main()
