# This script loads the script and scenes from runtime folder and outputs a score how well the script follows the scene descriptions.
# call with python -m eval.eval_script_coherency

from prmx import util, datastore_local
from prmx.promptparser import eval_prompt
from prmx.util import load_txt

util.setup_env_secrets()

uid = "api_test"
cid = "default"
ds = datastore_local.DatastoreLocal()

script, scenes = util.loader(uid, cid, ds, [f"script", "scenes"])

for scene_summary, scene_script in zip(scenes, script):
    scene_desc = scene_summary["desc"]

    llm_res = eval_prompt(
        load_txt("eval/prompts/eval_script.txt"),
        {"SCENE_SUMMARY": scene_desc, "SCRIPT": scene_script},
    )
    print(llm_res)
