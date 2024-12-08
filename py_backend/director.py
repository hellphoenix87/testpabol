#from prmx.api import get_characters, get_locations, get_script, get_music, get_shots, get_shot_images, get_shot_speeches
from prmx import api

from prmx import api

def make_movie(genre, attributes, audience, title, scenes):
    try:
        characters = api.get_characters(genre, attributes, audience, scenes)
        locations = api.get_locations(title, scenes)
        scripts = [api.get_script(genre, attributes, audience, scenes, locations, characters, scene_id) for scene_id, scene in enumerate(scenes)]

        music = api.get_music(scenes)
        shots = api.get_shots(scripts, locations, characters, scenes)
        images = api.get_shot_images(shots, characters, locations)
        speeches = api.get_shot_speeches(shots, characters)

        return {"success": True}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"success": False, "error": str(e)}