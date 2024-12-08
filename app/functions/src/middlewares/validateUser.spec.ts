import { Request, Response, NextFunction } from "express";
import { firestoreAdmin } from "../test-utils/firebase-mock";
import { validateUser, strictValidateUser } from "./validateUser";
import * as logger from "firebase-functions/logger";

jest.mock("firebase-admin", () => firestoreAdmin);
jest.mock("firebase-functions/logger");

const mockResponse = { status: jest.fn(() => ({ json: jest.fn() })) } as unknown as Response;
const mockNext = jest.fn() as NextFunction;

describe("validateUser middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should set req.user when a valid token is provided", async () => {
    const mockRequest = {
      headers: {
        authorization: "Bearer validToken",
      },
    } as Request;

    const verifiedToken = {
      uid: "validUserId",
    };
    const mockUser = { uid: "validUserId" };

    firestoreAdmin.dataSpy.mockReturnValue(mockUser);
    firestoreAdmin.verifyIdTokenSpy.mockResolvedValue(verifiedToken);

    await validateUser(mockRequest, mockResponse, mockNext);

    expect(firestoreAdmin.verifyIdTokenSpy).toHaveBeenCalledWith("validToken");
    expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith("users");
    expect(firestoreAdmin.docSpy).toHaveBeenCalledWith(verifiedToken.uid);
    expect(firestoreAdmin.getSpy).toHaveBeenCalled();

    expect(mockRequest.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should not set req.user when token is not provided", async () => {
    const mockRequest = {} as Request;

    await validateUser(mockRequest, mockResponse, mockNext);

    expect(firestoreAdmin.verifyIdTokenSpy).not.toHaveBeenCalled();
    expect(mockRequest.user).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it("should not set req.user when token is invalid", async () => {
    const mockRequest = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    } as Request;

    // Make verifyIdToken throw an error to indicate an invalid token
    firestoreAdmin.verifyIdTokenSpy.mockRejectedValue(new Error("Invalid token"));

    await validateUser(mockRequest, mockResponse, mockNext);

    expect(firestoreAdmin.verifyIdTokenSpy).toHaveBeenCalledTimes(1);
    expect(firestoreAdmin.getSpy).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(mockRequest.user).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });
});

describe("strictValidateUser middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should set req.user when a valid token is provided", async () => {
    const mockRequest = {
      headers: {
        authorization: "Bearer validToken",
      },
    } as Request;

    const verifiedToken = {
      uid: "validUserId",
    };
    const mockUser = { uid: "validUserId" };

    firestoreAdmin.dataSpy.mockReturnValue(mockUser);
    firestoreAdmin.verifyIdTokenSpy.mockResolvedValue(verifiedToken);

    await strictValidateUser(mockRequest, mockResponse, mockNext);

    expect(firestoreAdmin.verifyIdTokenSpy).toHaveBeenCalledWith("validToken");
    expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith("users");
    expect(firestoreAdmin.docSpy).toHaveBeenCalledWith(verifiedToken.uid);
    expect(firestoreAdmin.getSpy).toHaveBeenCalled();

    expect(mockRequest.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should set response status to UNAUTHORIZED (401) when token is not provided", async () => {
    const mockRequest = {} as Request;

    await strictValidateUser(mockRequest, mockResponse, mockNext);

    expect(firestoreAdmin.verifyIdTokenSpy).not.toHaveBeenCalled();
    expect(mockRequest.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });

  it("should set response status to UNAUTHORIZED (401) when token is invalid", async () => {
    const mockRequest = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    } as Request;

    // Make verifyIdToken throw an error to indicate an invalid token
    firestoreAdmin.verifyIdTokenSpy.mockRejectedValue(new Error("Invalid token"));

    await strictValidateUser(mockRequest, mockResponse, mockNext);

    expect(firestoreAdmin.verifyIdTokenSpy).toHaveBeenCalledTimes(1);
    expect(firestoreAdmin.getSpy).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(mockRequest.user).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });
});
