import Joi from "joi";
import { validateSchema } from "./validation";

describe("validateSchema", () => {
  const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().integer().min(0).required(),
    email: Joi.string().email().required(),
  });

  it("validate a valid object", () => {
    const validObject = {
      name: "John Doe",
      age: 25,
      email: "john@test.com",
    };

    const validationResult = validateSchema(validObject, schema);
    expect(validationResult).toEqual(validObject);
  });

  it("throw an error for an empty object", () => {
    const emptyObject = {};

    expect(() => validateSchema(emptyObject, schema)).toThrow(
      '"name" is required. "age" is required. "email" is required'
    );
  });

  it("throw an error for an object with missing required fields", () => {
    const incompleteObject = {
      name: "Alice",
    };

    expect(() => validateSchema(incompleteObject, schema)).toThrow(/"age" is required/);
  });

  it("handle unknown fields", () => {
    const objectWithUnknownFields = {
      name: "Bob",
      age: 30,
      email: "john@test.com",
      extraField: "extra",
    };

    const expectedResult = {
      name: "Bob",
      age: 30,
      email: "john@test.com",
    };

    const validationResult = validateSchema(objectWithUnknownFields, schema);
    expect(validationResult).toEqual(expectedResult);
  });
});
