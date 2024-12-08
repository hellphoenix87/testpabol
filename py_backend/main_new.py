from flask import Flask, request, jsonify
from flask_openapi3 import OpenAPI
from openapi_core import create_spec
from openapi_core.validation.request.validators import RequestValidator
from openapi_core.validation.response.validators import ResponseValidator
import yaml

# Initialize Flask app
app = Flask(__name__)

# Initialize OpenAPI
openapi = OpenAPI(app)

# Load OpenAPI specification
with open('open_api_specs/openapi_spec.yaml', 'r') as spec_file:
    spec_dict = yaml.safe_load(spec_file)

spec = create_spec(spec_dict)
request_validator = RequestValidator(spec)
response_validator = ResponseValidator(spec)

# Import director module
import movie_generation.director as director

# Define make_movie route
@app.route("/generate_movie", methods=["POST"])
@openapi.response(200)
@openapi.request
def generate_movie_route():
    data = request.get_json()
    director.generate_movie(data['genre'], data['attributes'], data['audience'], data['title'], data['scenes'])
    return jsonify(success=True), 200

# Run Flask app
if __name__ == "__main__":
    app.run(debug=True)