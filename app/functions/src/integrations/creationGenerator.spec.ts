import Joi from "joi";
import { logger } from "firebase-functions/v1";

import { Character } from "../schema/Character.schema";
import { Location } from "../schema/Location.schema";
import { Shot } from "../schema/Shot.schema";

import { validateResponse, creationGeneratorMethods } from "./creationGenerator";
import AcousticEnvironments from "../../../shared/constants/acousticEnvironments";

jest.mock("firebase-functions/v1", () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

describe("creationGenerator", () => {
  describe("validateResponse", () => {
    describe("for GET_SHOT_SPEECHES", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should validate a valid response", () => {
        const data = { shot_speeches: [["Some speech"]] };
        const call = creationGeneratorMethods.GET_SHOT_SPEECHES;
        const validatedData = validateResponse(data, call);
        expect(validatedData).toEqual(data);
      });

      it("should throw an error for an empty response", () => {
        const data = {};
        const call = creationGeneratorMethods.GET_SHOT_SPEECHES;
        expect(() => validateResponse(data, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data,
          message: `Validation of the response failed for method ${call}`,
        });
      });

      it("should throw an error for the response with unknown properties", () => {
        const data = { shot_speeches: [["Some speech"]], unknown: "Unknown property" };
        const call = creationGeneratorMethods.GET_SHOT_SPEECHES;
        expect(() => validateResponse(data, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data,
          message: `Validation of the response failed for method ${call}`,
        });
      });
    });

    describe("for GET_CHARACTERS", () => {
      let validData: { characters: Array<Omit<Character, "user_created">> };

      beforeEach(() => {
        validData = {
          characters: [
            {
              id: "char_id",
              name: "Character 1",
              desc: "Description 1",
              role: "Role 1",
              voice_desc: "",
              voice_sample_urls: ["url1", "url2"],
              pitch: 1,
              voices: [1, 2],
              images: ["image1", "image2"],
              embedding_ids: [1, 2],
              selected_image_index: 0,
              selected_voice_index: 0,
            },
            {
              id: "char_id",
              name: "Character 2",
              desc: "Description 2",
              role: "Role 2",
              voice_desc: "",
              voice_sample_urls: ["url3", "url4"],
              pitch: 2,
              voices: [3, 4],
              images: ["image3", "image4"],
              embedding_ids: [3, 4],
              selected_image_index: 1,
              selected_voice_index: 0,
            },
          ],
        };

        jest.clearAllMocks();
      });

      it("should validate a valid response", () => {
        const call = creationGeneratorMethods.GET_CHARACTERS;
        expect(validateResponse(validData, call)).toEqual(validData);
      });

      it("should throw an error if there are forbidden properties in response", () => {
        const invalidData: { characters: Character[] } = {
          // Add properties to the response
          characters: validData.characters.map((character, i) => ({
            ...character,
            id: `${i}`,
            user_created: i === 0,
          })),
        };
        const call = creationGeneratorMethods.GET_CHARACTERS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });

      it("should throw an error if some required properties are missing", () => {
        // Provide an invalid response to trigger a validation error
        const invalidData = {
          characters: [
            {
              // Missing required fields
              name: "Character 1",
            },
          ],
        };

        const call = creationGeneratorMethods.GET_CHARACTERS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });

      it("should throw an error for the response with unknown properties", () => {
        const invalidData = {
          characters: validData.characters.map(character => ({
            ...character,
            // Add an unknown property
            unknown: "Unknown property",
          })),
        };

        const call = creationGeneratorMethods.GET_CHARACTERS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });
    });

    describe("for GET_LOCATIONS", () => {
      let validData: { locations: Array<Omit<Location, "id" | "user_created">> };

      beforeEach(() => {
        validData = {
          locations: [
            {
              name: "Location 1",
              desc: "Description 1",
              images: ["image1", "image2"],
              selected_image_index: 0,
            },
            {
              name: "Location 2",
              desc: "Description 2",
              images: ["image3", "image4"],
              selected_image_index: 1,
            },
          ],
        };

        jest.clearAllMocks();
      });

      it("should validate a valid response", () => {
        const call = creationGeneratorMethods.GET_LOCATIONS;
        expect(validateResponse(validData, call)).toEqual(validData);
      });

      it("should throw an error if there are forbidden properties in response", () => {
        const invalidData: { locations: Location[] } = {
          // Add properties to the response
          locations: validData.locations.map((character, i) => ({
            ...character,
            id: `${i}`,
            user_created: i === 0,
          })),
        };
        const call = creationGeneratorMethods.GET_LOCATIONS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });

      it("should throw an error if some required properties are missing", () => {
        // Provide an invalid response to trigger a validation error
        const invalidData = {
          locations: [
            {
              // Missing required fields
              name: "Character 1",
            },
          ],
        };

        const call = creationGeneratorMethods.GET_LOCATIONS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });

      it("should throw an error for the response with unknown properties", () => {
        const invalidData = {
          locations: validData.locations.map(location => ({
            ...location,
            // Add an unknown property
            unknown: "Unknown property",
          })),
        };

        const call = creationGeneratorMethods.GET_LOCATIONS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });
    });

    describe("for GET_SHOTS", () => {
      let validData: { shots: Array<Omit<Shot, "id" | "image_url" | "user_created">> };

      beforeEach(() => {
        validData = {
          shots: [
            {
              content: "Content 1",
              location: 1,
              shot_type: 1,
              sound: "Sound 1",
              sound_urls: ["url1", "url2"],
              selected_sound_index: 0,
              acoustic_env: AcousticEnvironments.HALL,
              dialog: [
                {
                  character_id: "mock-char-1",
                  line: "Line 1",
                },
              ],
              bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
            },
            {
              content: "Content 2",
              location: 2,
              shot_type: 2,
              sound: "Sound 2",
              sound_urls: ["url1", "url2"],
              acoustic_env: AcousticEnvironments.HALL,
              selected_sound_index: 0,
              dialog: [
                {
                  character_id: "mock-char-2",
                  line: "Line 1",
                },
              ],
              bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
            },
          ],
        };

        jest.clearAllMocks();
      });

      it("should validate a valid response", () => {
        const call = creationGeneratorMethods.GET_SHOTS;
        expect(validateResponse(validData, call)).toEqual(validData);
      });

      it("should throw an error if there are forbidden properties in response", () => {
        const invalidData = {
          // Add properties to the response
          shots: validData.shots.map((shot, i) => ({
            ...shot,
            image_url: "image_url",
            user_created: i === 0,
          })),
        };
        const call = creationGeneratorMethods.GET_SHOTS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });

      it("should throw an error if some required properties are missing", () => {
        // Provide an invalid response to trigger a validation error
        const invalidData = {
          shots: [
            {
              // Missing required fields
              content: "Content 1",
            },
          ],
        };

        const call = creationGeneratorMethods.GET_SHOTS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });

      it("should throw an error for the response with unknown properties", () => {
        const invalidData = {
          shots: validData.shots.map(location => ({
            ...location,
            // Add an unknown property
            unknown: "Unknown property",
          })),
        };

        const call = creationGeneratorMethods.GET_SHOTS;
        expect(() => validateResponse(invalidData, call)).toThrowError(Joi.ValidationError);
        expect(logger.error).toHaveBeenCalledWith({
          data: invalidData,
          message: `Validation of the response failed for method ${call}`,
        });
      });
    });
  });
});
