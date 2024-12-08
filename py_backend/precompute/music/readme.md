## Music precompute

We precalculate strings as music descriptions via LLM based on the title and tags from the scraped music. We then use embeddings to match them.

    generate_embeds("assets/music/scrape_results")

A lookup file is generated to match the order of embeddings with filenames.

    generate_lookup_files("assets/music/scrape_results")

> Remember to call util.setup_env_secrets() to setup your API secrets
