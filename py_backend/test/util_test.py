from prmx import util
from prmx import text_embeddings as util_te
import unittest


class Test_TestUtil(unittest.TestCase):
    def __init__(self, methodName: str = ...) -> None:
        super().__init__(methodName)

    def test_replace_reference(self):
        characters = [{"name": "Alice"}, {"name": "Bob"}]
        string = "<Character 0> <Location 0> <Character 1>"
        output = util.replace_reference(string, "Character", characters)
        self.assertEqual(output, "Alice <Location 0> Bob")

    def test_replace_references(self):
        characters = [{"name": "Alice"}, {"name": "Bob"}]
        locations = [{"name": "NY"}, {"name": "LA"}]
        string = "<Character 0> <Location 0> <Character 1>"
        output = util.replace_references(string, characters, locations)
        self.assertEqual(output, "Alice NY Bob")

    def test_replace_references_for_shot_image_prompting(self):
        characters = [
            {
                "embedding_ids": [10, 20],
                "selected_image_index": 1,
                "id": 20,
            },
            {
                "embedding_ids": [100, 200],
                "selected_image_index": 0,
                "id": 100,
            },
        ]
        locations = [{"name": "NY"}, {"name": "LA"}]
        string = "<Character 0> <Location 1> <Character 1>"
        output = util.replace_references_for_shot_image_prompting(
            string, characters, locations
        )
        prompt_output, char_id_mapping = output
        char_id_mapping_expected = {"<Character 20>": 20, "<Character 100>": 100}
        self.assertEqual(prompt_output, "<Character 0> LA <Character 1>")
        self.assertEqual(char_id_mapping, char_id_mapping_expected)

    def test_replace_references_for_shot_image_prompting(self):
        characters = [
            {
                "embedding_ids": [10, 20],
                "selected_image_index": 1,
                "id": 20,
            },
            {
                "embedding_ids": [100, 200],
                "selected_image_index": 0,
                "id": 100,
            },
        ]
        locations = [{"name": "NY"}, {"name": "LA"}]
        string = "<Character 0> <Location 1> <Character 1>"
        output = util.replace_references_for_shot_image_prompting(
            string, characters, locations
        )
        prompt_output, char_id_mapping = output
        char_id_mapping_expected = {"<Character 20>": 20, "<Character 100>": 100}
        self.assertEqual(prompt_output, "<Character 0> LA <Character 1>")
        self.assertEqual(char_id_mapping, char_id_mapping_expected)

    def test_k_nearest_vectors(self):
        # create some test data
        import numpy as np

        input_vec = np.array([1, 2, 3])
        candidates = np.array([[3, 2, 1], [-1, -2, -3], [4, 5, 6]])

        # test with k=2
        k = 2
        expected_output = [2, 0]
        actual_output = util_te.k_nearest_vectors(input_vec, candidates, k)
        assert (
            actual_output == expected_output
        ), f"Expected {expected_output}, but got {actual_output}"

        # test with k=1
        k = 1
        expected_output = [2]
        actual_output = util_te.k_nearest_vectors(input_vec, candidates, k)
        assert (
            actual_output == expected_output
        ), f"Expected {expected_output}, but got {actual_output}"

        # test for empty candidates
        candidates = np.array([])
        expected_output = []
        actual_output = util_te.k_nearest_vectors(input_vec, candidates, k)
        assert (
            actual_output == expected_output
        ), f"Expected {expected_output}, but got {actual_output}"

    def test_get_scenes_from_plot(self):
        self.assertEqual(util.split_paragraphs("\n\nabc\n\n123 "), ["abc", "123"])


if __name__ == "__main__":
    unittest.main()
