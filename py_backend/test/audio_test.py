import unittest
from prmx import audio, util


class Test_TestAudio(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        util.setup_env_secrets()

    def test_get_acoustic_env_embedding(self):
        audio.calculate_acoustic_env_embeddings()

    def test_get_acoustic_env(self):
        tasks = [
            {
                "location_name": "Tony's children's room",
                "location_desc": "A small room with a bed and a desk.",
                "shot_content": "Tony is playing with his toys.",
                "expected": ["small_room"],
            },
            {
                "location_name": "Living Room",
                "location_desc": "A cozy living room with a fireplace.",
                "shot_content": "Samantha is playing the piano.",
                "expected": ["small_room"],
            },
            {
                "location_name": "Concert Hall",
                "location_desc": "A grand concert hall with ornate architecture.",
                "shot_content": "The orchestra is performing a symphony.",
                "expected": ["hall"],
            },
            {
                "location_name": "Cathedral",
                "location_desc": "A majestic cathedral with towering stained glass windows.",
                "shot_content": "A choir is singing hymns during a wedding.",
                "expected": ["hall"],
            },
            {
                "location_name": "Sports Stadium",
                "location_desc": "A large sports stadium with a grass field.",
                "shot_content": "The crowd is cheering for their team.",
                "expected": ["hall"],
            },
            {
                "location_name": "Office",
                "location_desc": "A modern office space with cubicles and fluorescent lighting.",
                "shot_content": "John is listening to Michaels voice at the phone at his desk.",
                "expected": ["telephone"],
            },
            {
                "location_name": "The Forest",
                "location_desc": "Green forest in western Europe.",
                "shot_content": "Alan and his friend are lighting a fire.",
                "expected": ["outside"],
            },
            {
                "location_name": "Island Beach",
                "location_desc": "Sandy beach, palm trees, blue sky, ocean waves. Bright and sunny.",
                "shot_content": "Lily Turner and Alex Johnson running towards the shore, carrying an old, tattered map. The sun shines brightly on the beach.",
                "expected": ["outside"],
            },
            {
                "location_name": "Island Forest",
                "location_desc": "Dense tropical forest, tall trees, thick undergrowth. Dappled sunlight.",
                "shot_content": "Lily Turner and Alex Johnson emerge from the dense forest, clutching an old map, their eyes wide with excitement.",
                "expected": ["outside"],
            },
            {
                "location_name": "Cave",
                "location_desc": "Inside of the cave, rocky terrain, cliffs.",
                "shot_content": "Max and Jane step cautiously into the cave, holding a flickering lantern. Stalactites and stalagmites create eerie shadows.",
                "expected": ["large_room"],
            },
            {
                "location_name": "Supermarket",
                "location_desc": "Bustling supermarket. Bright lighting. Shopping carts and shelves of food. People talking and laughing.",
                "shot_content": "Kai is running through the crowd in the marketplace.",
                "expected": ["large_room"],
            },
            {
                "location_name": "Basement Laboratory",
                "location_desc": "Cluttered basement. Various computer and electronic equipment. Bright lighting.",
                "shot_content": "Max Johnson is hunched over a workbench cluttered with electronic equipment, soldering tiny wires onto a microchip.",
                "expected": ["small_room"],
            },
            {
                "location_name": "High School (Hallway)",
                "location_desc": "Inside of the school. Lockers lining the walls. Fluorescent lighting.",
                "shot_content": "Max Johnson walking down the hallway, head down, carrying a heavy backpack.",
                "expected": ["hall"],
            },
            {
                "location_name": "Rural Town",
                "location_desc": "Old, quiet town. Few houses. Tree-lined streets. Sunshine. Children playing.",
                "shot_content": "Tom Johnson standing in a peaceful old town with children playing in the background. He is carrying a helmet and racing gloves.",
                "expected": ["outside"],
            },
            {
                "location_name": "Uncle's Study",
                "location_desc": "Inside the mansion. Antique furniture. Books lining the walls. Dim lighting.",
                "shot_content": "Uncle is sitting behind a large desk in a study. He looks up as Mary enters.",
                "expected": ["small_room", "large_room"],
            },
            {
                "location_name": "Colin's Bedroom",
                "location_desc": "Bedroom. Toys scattered. Soft, warm lighting.",
                "shot_content": "Colin is playing with her toys in his bedroom. She looks up as her mother enters the room.",
                "expected": ["small_room"],
            },
        ]

        for task in tasks:
            res = audio.get_acoustic_env(
                task["location_name"], task["location_desc"], task["shot_content"]
            )
            print(
                f"input: { task['location_name']+task['location_desc']+task['shot_content']}"
            )
            print(f"res: {res}")
            self.assertIn(res, task["expected"])
