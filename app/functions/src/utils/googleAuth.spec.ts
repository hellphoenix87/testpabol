import { generateToken, getToken, getUserFromToken, validateGCPToken } from "./googleAuth";

const payloadMock = jest.fn();
const fetchIdTokenMock = jest.fn();
const firebaseVerifyTokenMock = jest.fn();
jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: () => ({
      getPayload: payloadMock,
    }),
  })),
  GoogleAuth: jest.fn().mockImplementation(() => ({
    getIdTokenClient: () => ({
      idTokenProvider: {
        fetchIdToken: fetchIdTokenMock,
      },
    }),
  })),
}));
jest.mock("firebase-admin", () => ({
  auth: jest.fn().mockImplementation(() => ({
    verifyIdToken: firebaseVerifyTokenMock,
  })),
}));

describe("getToken", () => {
  it("should be valid token", () => {
    expect(getToken("Bearer <token>")).toEqual("<token>");
    expect(getToken("bearer <token>")).toEqual("<token>");
  });

  it("should be broken token", () => {
    expect(getToken("wrongType <token>")).toEqual("wrongType <token>");
    expect(getToken("<token>")).toEqual("<token>");
    expect(getToken(undefined)).toEqual(undefined);
  });
});

describe("validateGCPToken", () => {
  it("should be broken token", async () => {
    expect(await validateGCPToken({ token: "" })).toEqual(false);
    expect(await validateGCPToken({})).toEqual(false);
  });
  it("should be a valid token", async () => {
    payloadMock.mockReturnValueOnce({ email: "test@pabolo.ai" });
    expect(await validateGCPToken({ token: "Bearer <token>" })).toEqual(true);
  });
  it("Non supported email should return false", async () => {
    payloadMock.mockReturnValueOnce({ email: "test@wrong.ai" });
    expect(await validateGCPToken({ token: "Bearer <token>" })).toEqual(false);
  });
  it("should be not valid token", async () => {
    payloadMock.mockReturnValueOnce(undefined);
    expect(await validateGCPToken({ token: "Bearer <token>" })).toEqual(false);
  });
});

describe("getUserFromToken", () => {
  it("should return null if token is broken", async () => {
    firebaseVerifyTokenMock.mockImplementation(() => {
      throw new Error();
    });
    expect(await getUserFromToken("Bearer <token>")).toEqual(null);
  });
  it("should return null if no token passed", async () => {
    expect(await getUserFromToken("")).toEqual(null);
    expect(await getUserFromToken(undefined)).toEqual(null);
  });
  it("should return null if verify return empty signed body", async () => {
    firebaseVerifyTokenMock.mockImplementation(() => undefined);
    expect(await getUserFromToken(undefined)).toEqual(null);
  });
  it("should return the user id for a valid token", async () => {
    firebaseVerifyTokenMock.mockImplementation(() => ({ user_id: "mock-id", email: "mock-mail" }));
    expect(await getUserFromToken("Bearer <token>")).toEqual({ uid: "mock-id", email: "mock-mail" });
  });
});

describe("generateToken", () => {
  it("generate a token", async () => {
    fetchIdTokenMock.mockResolvedValueOnce("mocked token");
    expect(await generateToken("audience")).toEqual("mocked token");
    expect(fetchIdTokenMock).toHaveBeenCalledWith("audience");
  });
});
