import unittest
from prmx import assets, context
from prmx.util import load_json
from prmx.api import genres, get_characters


class Test_TestAssets(unittest.TestCase):
    def test_get_asset_url(self):
        res0, indices0 = assets.get_asset_url("characters", "John", 1)

        # Must be deterministic
        self.assertEqual(res0, assets.get_asset_url("characters", "John", 1)[0])

        # if we pass indices0, we should get a different result
        res_1, indices1 = assets.get_asset_url("characters", "John", 1, indices0)
        self.assertNotEqual(indices1[0], indices0[0])

        # test if we pass an arbitrary indices list, we expect the same result
        res_2, indices2 = assets.get_asset_url("characters", "John", 1, [-123])
        self.assertEqual(indices2[0], indices0[0])

    def test_get_clip_text(self):
        # must be deterministic
        res0 = assets.get_clip_text("John", emb_type="characters")
        res1 = assets.get_clip_text("John", emb_type="characters")
        self.assertEqual(res0.tolist(), res1.tolist())

        # try a large text (ensure truncation)
        large = assets.get_clip_text(100 * "John", emb_type="characters")

    @unittest.mock.patch.dict("os.environ", {"PRMX_PROFILE": "mock"})
    def test_mock_character_consistency(self):
        expected = load_json(f"assets/default/characters.json")
        actual = get_characters(
            genres.index(context.MOCK_CONFIG["genre"]),
            context.MOCK_CONFIG["attributes"],
            context.MOCK_CONFIG["audience"],
            load_json(f"assets/default/scenes.json"),
        )
        # the character id should not be random in mock mode
        self.assertEqual(actual, expected)
