from prmx import llm
from prmx.util import inference_url, oidc_token, setup_env_secrets
import text_generation
import unittest

SCENE_VALID = "'Training Montage\nDescription: <Character 0> and <Character 1> train intensely for their next heist in <Location 4>. They practice lock picking, sneaking, and distracting security systems. As they finish their training, they share a tense moment, revealing the conflict of morals in their lives.\nPurpose: Establishes the skills of the main characters and their growing inner conflict as the story progresses.\nMusic: Heist Montage. Fast-paced, tense, instrumental.'"
SCENE_INVALID_CHAR = "'Training Montage\nDescription: <Character 14> and <Character 1> train intensely for their next heist in <Location 4>. They practice lock picking, sneaking, and distracting security systems. As they finish their training, they share a tense moment, revealing the conflict of morals in their lives.\nPurpose: Establishes the skills of the main characters and their growing inner conflict as the story progresses.\nMusic: Heist Montage. Fast-paced, tense, instrumental.'"
SCENE_INVALID_LOC = "'Training Montage\nDescription: <Character 0> and <Character 1> train intensely for their next heist in <Location 10>. They practice lock picking, sneaking, and distracting security systems. As they finish their training, they share a tense moment, revealing the conflict of morals in their lives.\nPurpose: Establishes the skills of the main characters and their growing inner conflict as the story progresses.\nMusic: Heist Montage. Fast-paced, tense, instrumental.'"

CHARACTERS = [
    {
        "desc": "35 year old male. Short, black hair. Brown, intense eyes. Lean, muscular build. Wears black clothing. Conflicted expression.",
        "name": "John",
    },
    {
        "desc": "30 year old female. Long, curly blonde hair. Green, mischievous eyes. Slender, athletic build. Wears tight leather clothing. Seductive expression.",
        "name": "Sally",
    },
    {
        "desc": "Middle-aged man with a stern face and muscular build. Wears a security uniform and carries a gun. Takes his job seriously and is always on high alert.",
        "name": "Bank Security Guard",
    },
    {
        "desc": "Toddler boy with curly hair and chubby cheeks. Wears a onesie and has a playful demeanor. Loves his parents and is curious about the world around him.",
        "name": "Noah's son",
    },
    {
        "desc": "Male in his late 20s. Has short, brown hair and a serious expression. Wears a police uniform and carries a gun. Follows Detective Sarah's lead and is determined to catch Frank.",
        "name": "Police Officer",
    },
    {
        "desc": "Male in his mid-30s. Has a bald head and a thick beard. Wears a leather vest and has several tattoos. Has a rough demeanor and a violent temper.",
        "name": "Co-leader of the rival gang's hench",
    },
    {
        "desc": "50 year old male. Salt and pepper hair. Cold, calculating eyes. Tall, imposing build. Wears expensive suits. Intimidating expression.",
        "name": "Vincent",
    },
    {
        "desc": "25 year old male. Messy brown hair. Hazel, curious eyes. Average build. Wears casual clothing. Curious expression.",
        "name": "Noah",
    },
    {
        "desc": "40 year old female. Short, red hair. Blue, kind eyes. Petite, delicate build. Wears professional clothing. Caring expression.",
        "name": "Linda",
    },
    {
        "desc": "45 year old male. Bald head. Brown, shifty eyes. Stocky, muscular build. Wears flashy jewelry. Sneaky expression.",
        "name": "Tony",
    },
    {
        "desc": "40 year old male. Gray, receding hairline. Brown, serious eyes. Average build. Wears a police uniform. Stern expression.",
        "name": "Mark",
    },
    {
        "desc": "Middle-aged man with a neat appearance. Wears a suit and tie. Has a professional demeanor and takes his job seriously.",
        "name": "Bank Manager",
    },
    {
        "desc": "Young mother in her mid-20s. Has long, curly hair and a friendly face. Wears a simple dress and has a caring demeanor. Struggles to make ends meet but is determined to provide for her family.",
        "name": "Noah's wife",
    },
    {
        "desc": "Male in his early 20s. Has short, spiky hair and a thin build. Wears baggy clothes and has a cocky attitude. Follows the co-leader's orders without question.",
        "name": "Co-leader of the rival gang's hench",
    },
]

LOCATIONS = [
    {
        "desc": "Interior: Small, cluttered apartment. Old furniture. Dusty. Poor lighting.",
        "name": "John's apartment",
    },
    {
        "desc": "Interior: High-security bank vault. Thick metal doors. Bright fluorescent lighting. Rows of safety deposit boxes.",
        "name": "Bank vault",
    },
    {
        "desc": "Interior: Elegant and modern jewelry store. Bright lighting. Glass display cases showcasing expensive jewelry. Security cameras and alarms. ",
        "name": "Jewelry store",
    },
    {
        "desc": "Interior/Exterior: Large, luxurious mansion. Marble floors and walls. Expensive furniture. Chandeliers and dim lighting. Beautiful gardens and fountains outside. High walls and security guards.",
        "name": "Vincent's mansion",
    },
    {
        "desc": "Interior: Dark and dusty warehouse. Broken windows and graffiti on the walls. Poor lighting. Stacks of crates and boxes.",
        "name": "Abandoned warehouse",
    },
    {
        "desc": "Exterior/Interior: Large, imposing courthouse building with columns and steps leading up to the entrance. Bright lighting in the daytime, dim lighting in the evening. Courtroom with wooden benches and a judge's bench at the front. Bright lighting.",
        "name": "The courthouse",
    },
]


class Test_TestLLM(unittest.TestCase):
    def __init__(self, methodName: str = ...) -> None:
        self.path = "assets/io/llm/"
        super().__init__(methodName)

    def test_invalid_asset_names(self):
        self.assertEqual(llm.is_invalid_asset_name("None."), True)
        self.assertEqual(llm.is_invalid_asset_name("none"), True)
        self.assertEqual(llm.is_invalid_asset_name("N/A "), True)
        self.assertEqual(llm.is_invalid_asset_name("  "), True)
        self.assertEqual(llm.is_invalid_asset_name(" "), True)
        self.assertEqual(llm.is_invalid_asset_name("\n"), True)
        self.assertEqual(llm.is_invalid_asset_name("\n\n"), True)

        self.assertEqual(llm.is_invalid_asset_name("X"), False)
        self.assertEqual(llm.is_invalid_asset_name("Nonebert Jackson"), False)
        self.assertEqual(llm.is_invalid_asset_name("Thankful Mike"), False)

    @unittest.skip("External API call")
    def test_llm_server(self):
        setup_env_secrets()
        headers = {"Authorization": "Bearer {}".format(oidc_token())}
        # an async client is also available: see AsyncClient (could combine with continuous batching)
        client = text_generation.Client(inference_url("falcon-40"), headers, timeout=30)
        # by default, do_sample is False and returns deterministic results for a given prompt
        completion = client.generate(
            "Summary of a thrilling movie plot:",
            max_new_tokens=500,
            do_sample=True,
            seed=1,
        )
        print(completion.generated_text)

    def test_parse_dialog_line(self):
        # Correct dialog lines
        self.assertEqual(
            llm.parse_dialog_line("<Character 0>: Hello, 123!"), (0, "Hello, 123!")
        )
        self.assertEqual(
            llm.parse_dialog_line("Character 5: Hello, 123! "), (5, "Hello, 123!")
        )
        self.assertEqual(
            llm.parse_dialog_line("<Character 0>:Hello, 123!  "), (0, "Hello, 123!")
        )
        self.assertEqual(
            llm.parse_dialog_line("Character 15:Hello, 123!"), (15, "Hello, 123!")
        )

        # Faulty dialog lines
        self.assertEqual(
            llm.parse_dialog_line("Character 5, Character 3: Hello, 123!"),
            (5, "Hello, 123!"),
        )
        self.assertEqual(llm.parse_dialog_line("No dialog"), (-1, ""))
        self.assertEqual(llm.parse_dialog_line("none"), (-1, ""))
        self.assertEqual(llm.parse_dialog_line("  "), (-1, ""))

        # Fallback character ID:
        FALLBACK = 1337
        self.assertEqual(
            llm.parse_dialog_line("Tv Speaker: Hello, 123!", FALLBACK),
            (FALLBACK, "Hello, 123!"),
        )
        self.assertEqual(
            llm.parse_dialog_line("<Tv Speaker>: Hello, 123!", FALLBACK),
            (FALLBACK, "Hello, 123!"),
        )

    def test_invalid_asset_name(self):
        self.assertTrue(llm.is_invalid_asset_name(" "))
        self.assertTrue(llm.is_invalid_asset_name("\n"))
        self.assertTrue(llm.is_invalid_asset_name("None "))
        self.assertTrue(llm.is_invalid_asset_name("N/A"))

        self.assertFalse(llm.is_invalid_asset_name("Thomas"))
        self.assertFalse(llm.is_invalid_asset_name("No Man's Land"))

    def test_remove_duplicate_shots(self):
        self.assertTrue(llm.remove_duplicate_shots(["a", "b"]), ["a", "b"])
        self.assertTrue(llm.remove_duplicate_shots(["a", "b", "a"]), ["a", "b", "a"])
        self.assertTrue(llm.remove_duplicate_shots(["a", "b", "b"]), ["a", "b"])
        self.assertTrue(llm.remove_duplicate_shots(["a", "a", "b"]), ["a", "b"])

    def test_parse_scenes(self):
        parsed_scenes = llm.parse_scenes(
            "aaa\nMusic: \n\nScene 2: bbb\nMusic: xx\n\nScene3:ccc\nMusic: yy\n\nScene 4: a\nddd\nMusic:zz\n\nScene 5: eee",
            min_desc_len=2,
        )
        scene_descs = [scene["desc"] for scene in parsed_scenes]
        scene_musics = [scene["music_desc"] for scene in parsed_scenes]
        self.assertEqual(
            scene_descs,
            ["aaa", "bbb", "ccc", "ddd", "eee"],
        )
        self.assertEqual(
            scene_musics,
            ["", "xx", "yy", "zz", ""],
        )

    def test_find_closest_asset(self):
        assets = [
            {"name": "a big tree in the woods"},
            {"name": "anton's house"},
            {"name": "green wodden bench"},
        ]

        self.assertEqual(llm.find_closest_asset("a big tree in the woods", assets), 0)
        self.assertEqual(llm.find_closest_asset("anton", assets), 1)
        self.assertEqual(llm.find_closest_asset("the bench", assets), 2)
        self.assertEqual(llm.find_closest_asset("alien spaceship", assets), None)

    def test_remove_parenthesized_content(self):
        examples = [
            ("test (silent) abc (screams!)", "test abc"),
            ("(silent) WHAT?", "WHAT?"),
            # Sometimes, the whole line is in parentheses, which means whispering
            ("(What are you doing.)", "What are you doing."),
        ]
        for example in examples:
            self.assertEqual(llm.remove_parenthesized_content(example[0]), example[1])


if __name__ == "__main__":
    unittest.main()
