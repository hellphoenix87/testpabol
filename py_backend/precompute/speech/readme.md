## speech precompute

We use precomputed embeddings to match the voices with a voice description string and also precompute emotion embeddings to predict an emotion for each dialog line.

    generate_text2voice_mapping(metadata_filepath, pitch_shift_ratios)
    save_emotion_embeddings()

`metadata_filepath` contains basic information about the speakers, such as their age, gender, location, voice tone etc. `pitch_shift_ratios` is a list of pitch ratios that is used to artifically increase the number of speakers.

The voice samples are used to show the user a preview of the voice.

    generate_voice_samples()

> Remember to call util.setup_env_secrets() to setup your API secrets
