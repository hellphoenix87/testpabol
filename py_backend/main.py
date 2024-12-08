from prmx import web
from flask import jsonify
from prmx.errors import MockMismatchError
import json
import firebase_admin
import traceback
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
# allow CORS for all domains on all routes
CORS(app)
firebase_admin.initialize_app()


@app.route("/", methods=["POST"])
def main():
    """Entry point of Paramax Python backend:
    it centralizes all calls from the client, and routes them to the appropriate api function.

    HTTP return codes should be defined in this file, at the highest level of a request response.
    """

    # parse request body coming from the frontend
    request_json = request.get_json()
    print(f"@request_json: {request_json}")

    # first, authenticate the user: any unauthorized request returns None instead of a uid
    uid = web.authenticate(request)
    if uid is None:
        return "Unauthorized", 401

    try:
        # while py_cloud_fun is the entry point, web.gen is the second door leading to the api
        response_dict = web.gen(uid, **request_json)

    except MockMismatchError as e:
        # use the e.print_diff() method to print the colored difference between the prompt and the mocked data
        print(e.message)
        return e.message, 404

    except KeyError:
        traceback.print_exc()
        return traceback.format_exc(), 500

    response = jsonify({"success": True})
    response.data = json.dumps(response_dict)
    headers = {"Access-Control-Allow-Origin": "*"}
    return (response, 200, headers)


@app.route("/health")
def health():
    """Health endpoint"""

    response = jsonify(health="healthy")
    response.status_code = 200

    return response
