import unittest
from prmx import promptparser, llm


class Test_TestPromptparser(unittest.TestCase):
    def test_replacement(self):
        prompt_text = "A {{replacement_a}}, and then a {{replacement_b}}."
        target_text = "A bird, and then a dog."

        result_text = promptparser.prompt_preprocess(
            prompt_text, {"replacement_a": "bird", "replacement_b": "dog"}
        )
        self.assertEqual(target_text, result_text)

    def test_dict_replacement(self):
        prompt_text = "Here's a list:\n{{LIST_DATA}}"
        target_text = "Here's a list:\nDog: Steak\nCat: Fish\nBird: Seeds"
        replacement_dict = {
            "LIST_DATA": {"Dog": "Steak", "Cat": "Fish", "Bird": "Seeds"}
        }
        result_text = promptparser.prompt_preprocess(prompt_text, replacement_dict)
        self.assertEqual(target_text, result_text)

    def test_missing_replacement(self):
        prompt_text = "A {{replacement_a}}, and then a {{replacement_b}}."
        replacement_dict = {"replacement_a": "bird"}
        with self.assertRaises(AssertionError):
            promptparser.prompt_preprocess(prompt_text, replacement_dict)

    def test_sanitize(self):
        text_from_llm = "A <<replacement_a>>, and then a {{replacement_b}}."
        target_text = "A replacement_a, and then a replacement_b."
        result_text = llm.sanitize_prompt(text_from_llm)
        self.assertEqual(target_text, result_text)

    def test_eval(self):
        prompt_text = 'A {{replacement_a}}, and then a {{replacement_b}}.\nName of the dog: <<dog_name, int_test=15, str_test="hello">>\nName of the bird: <<bird_name, int_test=20, str_test="world">>'
        prompt_list = []
        test_parameters = [
            {"int_test": 15, "str_test": "hello"},
            {"int_test": 20, "str_test": "world"},
        ]

        def llm_wrap_test(prompt, parameters):
            self.assertEqual(test_parameters[len(prompt_list)], parameters)
            prompt_list.append(prompt)
            return "call#" + str(len(prompt_list))

        llm_results = promptparser.eval_prompt(
            prompt_text,
            {"replacement_a": "bird", "replacement_b": "dog"},
            llm_wrap_test,
        )
        self.assertEqual(2, len(llm_results))
        self.assertEqual("call#1", llm_results["dog_name"])
        self.assertEqual("call#2", llm_results["bird_name"])
        print(prompt_list[0])
        self.assertEqual(prompt_list[0], "A bird, and then a dog.\nName of the dog:")
        self.assertEqual(
            prompt_list[1],
            "A bird, and then a dog.\nName of the dog: call#1\nName of the bird:",
        )

    def test_parse_parameter_list(self):
        test_str = "a=123, b='bla', c=\"abc\", d=1.23, e=True, f=None"
        expected_dict = {
            "a": 123,
            "b": "bla",
            "c": "abc",
            "d": 1.23,
            "e": True,
            "f": None,
        }
        result_dict = promptparser.parse_parameter_list(test_str)
        self.assertEqual(expected_dict, result_dict)
