import Joi from "joi";
import { validateBody } from "./validateBody";
import { NextFunction, Response, Request } from "express";

const mockRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn().mockImplementation(res => res),
  };
  res.status.mockReturnValue(res);
  return res as unknown as Response;
};
const mockReq = (body: Record<string, any>) => {
  return { body } as Request;
};

const mockNext = jest.fn() as NextFunction;

const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().integer().min(0).required(),
  email: Joi.string().email().required(),
});
const validator = validateBody(schema);

describe("validateBody middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should validate a valid object with no additional props", () => {
    const validObject = {
      name: "John Doe",
      age: 25,
      email: "john@test.com",
    };
    const req = mockReq(validObject);

    validator(req, mockRes(), mockNext);
    expect(req.body).toEqual(validObject);
  });

  it("should validate a valid object with no additional props in data prop", () => {
    const validObject = {
      name: "John Doe",
      age: 25,
      email: "john@test.com",
    };
    const req = mockReq({ data: validObject });

    validator(req, mockRes(), mockNext);
    expect(req.body).toEqual(validObject);
  });

  it("should validate a valid object with additional props", () => {
    const validObject = {
      name: "John Doe",
      age: 25,
      email: "john@test.com",
      additionalProps: "mock-prop",
    };
    const req = mockReq(validObject);

    validator(req, mockRes(), mockNext);
    expect(req.body).toEqual({ ...validObject, additionalProps: undefined });
  });

  it("should throw BadRequest if data not valid (wrong data type)", () => {
    const validObject = {
      name: "John Doe",
      age: "wrong format",
      email: "john@test.com",
    };
    const req = mockReq(validObject);
    const res = validator(req, mockRes(), mockNext) as any;
    expect(res.message).toEqual('"age" must be a number');
    expect(res.statusCode).toEqual(400);
  });

  it("should throw BadRequest if data not valid (missing required value)", () => {
    const validObject = {
      name: "John Doe",
      age: 25,
    };
    const req = mockReq(validObject);
    const res = validator(req, mockRes(), mockNext) as any;

    expect(res.message).toEqual('"email" is required');
    expect(res.statusCode).toEqual(400);
  });
});
