## Asset precomputation

With these scripts, we precompute asset descriptions for characters and locations that are then used to generate preview images with an image model.
The images are then matched via CLIP to the user's or LLMs asset descriptions.

    generate_char_descriptions()
    generate_loc_descriptions()

> Remember to call util.setup_env_secrets() to setup your API secrets
