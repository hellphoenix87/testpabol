from fastapi import FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from director import make_movie
from pydantic_models import Movie


# Initialize FastAPI app
app = FastAPI()

# allow CORS for all domains on all routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define make_movie route
@app.post("/make_movie")
def make_movie_route(movie: Movie):
    result = make_movie(movie.genre, movie.attributes, movie.audience, movie.title, movie.scenes)
    return {"success": True, "result": result}