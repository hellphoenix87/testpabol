## Audio generation

We generate a list of audio descriptions with GPT and then use the a text2audio model to generate wav files.

> Remember to call util.setup_env_secrets() to setup your API secrets

Generate their descriptions with a LLM

    generate_audio_descriptions()

Generate their embeddings to match them

    calculate_embeddings()
