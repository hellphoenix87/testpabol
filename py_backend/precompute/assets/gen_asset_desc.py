from prmx.genres import genres
from prmx.llm import generate_descriptions
from prmx.assets import character_prompt_path, location_prompt_path

char_prompt = """The character descriptions describe the visual description of a particular movie character. Be creative about accessories, clothing, and other details. Don't repeat previous descriptions. Don't describe the character's personality or emotions, only their physical appearance. Don't describe background objects. Only one character per line. Don't repeat the genre in the description.

General examples:
"94 year old male archeologist. Wrinkles. pale. tired. Wearing a hat. Blue Scarf.",
"15 year old girl. Wearing a red dress. Blonde hair. Blue eyes. Wearing a necklace. Purple earrings.",
"65 year old man, dressed as a cowboy. Wearing a hat, red shirt and blue jeans.",
"35 year old nazi guard, wearing a SS uniform. Bald. Scar on his face.",
"44 year old male prison guard. Wearing a uniform and badge. Bald and scars with plaster on his chin.",
"3 year old boy. Green eyes. Dressed as a t-rex dinosaur. Freckles.",
"55 year old woman. Cigarette in mouth. Angry face. Leather jacket.",
"91 year old veteran. Wearing a military cap and a white shirt. Missing an arm.",
"person in an elephant costume. Wearing a red shirt.",
"27 year old male alcoholic. Underwear. Hairy chest and unshaven face.\""""


def generate_char_descriptions() -> None:
    generate_descriptions(
        prompt=char_prompt,
        type_name="character",
        prompt_path=character_prompt_path,
        num_desc=10000,
        genres=genres,
    )


loc_prompt = """The location descriptions describe the set of a particular movie scene. Be creative about the location's attributes. Don't repeat previous descriptions. Add lighting, weather and outdoor/indoor details. Don't describe sounds, only visual information. No foreground subjects.

General examples:
"Pub in the desert. Outdoor. Palm trees. Motorcycles parked in front. At night.",
"American diner. Indoor. Neon light. Beverages on the table. At night.",
"Office. Clean desks. Modern furniture. Indoor. Fluorescent light. At night.",
"Playground. Outdoor. At day. Happy children in the background.",
"Californian Beach. Outdoor. At day. Sunny. People in the background.",
"Battle field in a european forest. Outdoor. At day. Sunny. Smoke in the background.",
"Desert. Outdoor. At day. Sunny. Cacti in the background.",
"European Kitchen with dishes in the sink. At day. Swedish furniture.",
"Sitcom living room. Indoor. At day. 90s furniture with a teddy bear.",
"Hotel lobby. Indoor. At day. White marble floor.\""""


def generate_loc_descriptions() -> None:
    generate_descriptions(
        prompt=loc_prompt,
        type_name="location",
        prompt_path=location_prompt_path,
        num_desc=10000,
        genres=genres,
    )
