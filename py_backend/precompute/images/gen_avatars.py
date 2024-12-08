from diffusers import StableDiffusionPipeline
import os
from tqdm import tqdm

# Source: https://civitai.com/models/81270?modelVersionId=117986
pipeline = StableDiffusionPipeline.from_single_file(
    "samaritan3dCartoon_samaritan3dCartoonV3.safetensors"
)
pipeline.safety_checker = None

from diffusers import EulerAncestralDiscreteScheduler

pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(
    pipeline.scheduler.config
)

pipeline.to("cuda")

out_avatars = "avatars"

# check if the folder exists
if not os.path.exists(out_avatars):
    os.mkdir(out_avatars)

# Generated with GPT4
"""
write me a python array of strings with a short sentence each. The sentence should visually describe an avatar, used for an account of a movie streaming page for film enthusiasts.

Don't describe objects, describe persons.

Eg:
descs = [ "Movie director wearing sunglasses", "Cartoon man with a hat eating popcorn", "3D rendering of a face with a camcorder", "A woman wearing an elf custome", ..."""
descs = [
    "Movie director wearing sunglasses",
    "Cartoon man with a hat eating popcorn",
    "3D rendering of a face with a camcorder",
    "A woman wearing an elf costume",
    "Silhouette of a man holding a clapperboard",
    "Retro actress with feathered boa and pearls",
    "Animated film critic with a monocle and notepad",
    "Young girl with 3D glasses and a tub of popcorn",
    "Silent film actor with exaggerated expressions",
    "Gentleman with a bow tie and old-timey projector",
    "Lone cowboy holding a film reel in the sunset",
    "Lady in a vintage dress holding a golden trophy",
    "Character inspired by classic horror films with a cape",
    "Mysterious detective with a film noir backdrop",
    "Energetic dancer from a musical with sparkly dress",
    "Superhero with a cinema reel as a shield",
    "Film student with a backpack full of DVDs and books",
    "Action star holding a clapperboard like a weapon",
    "Bollywood actress in a vibrant dance pose",
    "Old-timey aviator filming with a hand-cranked camera",
    "Samurai with a sword replaced by a filmstrip",
    "Jazz singer against a backdrop of classic movie posters",
    "1920s flapper dancing next to a film canister",
    "Man in a spacesuit holding a vintage camera",
    "Queen in a royal robe holding a movie ticket",
    "Adventurer with a hat, standing next to a vintage film reel",
    "Lady with a tiara made of film strips",
    "Hipster with beard and suspenders, holding a vintage video camera",
    "Young boy dreaming with a director's megaphone in hand",
    "Animated princess with a crown shaped like a film reel",
    "Bearded wizard casting a spell on a cinema screen",
    "Film noir detective holding a smoking pipe and a ticket",
    "Cyberpunk hacker with holographic movie posters around",
    "Pirate with a parrot replaced by a movie projector",
    "Steampunk enthusiast with gears and a film canister",
    "Martial artist breaking a board, which is actually a film strip",
    "Diva in a spotlight holding an Oscar-like award",
    "Warrior with armor made of film reels and cinema tickets",
    "Mad scientist with a potion turning into a movie sequence",
    "Renaissance artist painting a classic movie scene",
    "Astronaut floating in space with floating popcorn around",
    "Mummy coming out of a sarcophagus, holding a DVD",
    "Rockstar with a guitar showcasing a filmstrip design",
    "Mermaid holding a shell with a cinema screen inside",
    "Roman gladiator with a shield shaped like a play button",
    "Gothic vampire with a cloak made of movie tickets",
    "Angel with wings made of classic film scenes",
    "Ninja with throwing stars replaced by film reels",
    "Wild west sheriff with a badge in the shape of a camera",
    "Fairy sprinkling magic dust over a vintage projector",
    "Explorer with a map leading to cinema's golden age",
    "Teenager with headphones, immersed in a film on a tablet",
    "Classic monster (like Frankenstein) holding a vintage camera",
    "Gamer with VR headset watching 3D movies",
    "Chef with a plate serving mini film reels as delicacies",
    "Knight in shining armor, with a crest of a film reel and clapperboard",
    "Alien being, watching a movie from its multiple eyes",
    "Victorian lady with a telescope focusing on a movie star",
    "Zombie munching on filmstrips instead of brains",
    "Caveman with a primitive drawing of a cinema scene",
    "Rapper with gold chain featuring a cinema reel pendant",
    "Jungle explorer with binoculars focused on a big movie premiere",
    "Viking with a ship's sail made of a film screen",
    "Robot with a heart made of movie reels and filmstrips",
    "Egyptian pharaoh with a headdress shaped like a cinema auditorium",
    "Snowboarder leaving a trail of iconic movie scenes in the snow",
    "Surfer riding a wave shaped like a classic movie curve",
    "Cowgirl with lasso capturing a runaway film reel",
    "Magician pulling a cinema screen out of a hat",
    "Tribal chief with a mask inspired by film genres",
    "Future traveler with holograms of movie icons around",
    "Gymnast performing on a beam made of filmstrip",
    "Firefighter rescuing classic films from a blaze",
    "Deep-sea diver discovering a treasure chest full of movie gems",
    "Botanist with plants that have flowers shaped like movie equipment",
    "Mountain climber scaling a peak shaped like a film award",
    "Race car driver with a helmet reflecting iconic movie scenes",
    "Ballerina pirouetting on a stage made of film reels",
    "Lumberjack chopping a log that reveals a filmstrip inside",
    "Matador with a cape showcasing legendary movie posters",
    "Olympian with a medal made of a golden film reel",
    "Bird watcher spotting birds that resemble famous film characters",
    "DJ mixing tracks with sounds from iconic movies",
    "Astronomer gazing at stars shaped like film equipment",
    "Fisherman catching a fish that plays a movie when opened",
    "Detective following clues from famous film plots",
    "Fashion designer with dresses inspired by movie genres",
    "Train conductor aboard a locomotive playing movies in each cabin",
    "Circus performer juggling film reels and popcorn",
    "Safari guide with binoculars showcasing movie scenes in the wild",
    "Kite flyer with a kite that displays a movie when it soars",
    "Archer aiming an arrow that projects film scenes in its trail",
    "Ice skater drawing film plots on a frozen cinema lake",
    "Conductor leading an orchestra playing iconic movie scores",
    "Biker with a jacket patched with movie references",
    "Skydiver free falling through clouds shaped like movie icons",
    "Mime trapped in an invisible box screening silent films",
    "Auctioneer selling rare and classic movie memorabilia",
    "Farmer with crops shaped like cinema equipment and characters",
    "Pilot flying a plane with smoke trails of movie scenes",
]

img_counter = 0
IMGS_PER_PROMPT = 5

for desc in descs:
    for _ in range(IMGS_PER_PROMPT):
        img = pipeline(
            "User portrait image. "
            + desc
            + ". Portrait close up. Masterpiece, Best quality, 3d, 3d cartoon. Subsurface scattering.",
            num_inference_steps=50,
        ).images[0]
        # save img to file
        img.save(os.path.join(out_avatars, f"{img_counter}.jpg"), quality=95)
        img_counter += 1
