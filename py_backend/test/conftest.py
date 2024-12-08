from prmx import util

"""Common test functions"""


def populate_characters_with_voice(characters):
    """
    This function is used to populate the characters with voice field to simulate the API calls from App.
    The endpoints that require the voice field in characters:
    - get_shot_speech
    - get_shot_speeches
    - get_line_speech
    """
    for character in characters:
        character["voice"] = character["voices"][character["selected_voice_index"]]
    return characters


def get_first_dialog_shot(cid):
    """
    returns the first scene and shot id that have dialog
    """
    num_scenes = 3
    for scene_id in range(num_scenes):
        shots = util.load_json(f"assets/{cid}/shots_{scene_id}.json")
        for shot_id, shot in enumerate(shots):
            if shot["dialog"]:
                return scene_id, shot_id
