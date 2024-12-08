import { isEmail, isServiceAccountId } from "./regex";

describe("isEmail", () => {
  it("should return true if email is valid", () => {
    expect(isEmail("abc@gg.co")).toEqual(true);
    expect(isEmail("abc@gmail.com")).toEqual(true);
    expect(isEmail("abc_123@gmail.com")).toEqual(true);
  });
  it("should return false if email is not valid", () => {
    expect(isEmail("abc@gg")).toEqual(false);
    expect(isEmail("abc")).toEqual(false);
    expect(isEmail("123")).toEqual(false);
  });
});

describe("isServiceAccountId", () => {
  it("should return true if service id is valid", () => {
    expect(isServiceAccountId("213546848465135146")).toEqual(true);
    expect(isServiceAccountId("797853213286542211")).toEqual(true);
    expect(isServiceAccountId("111656700057369019")).toEqual(true);
  });
  it("should return false if service id not valid", () => {
    expect(isServiceAccountId("pnJEKKDkqDheBoUFVIKAA312ks11")).toEqual(false);
    expect(isServiceAccountId("Ca86JhbGciOiJSUzI1NiIsImoo1c")).toEqual(false);
    expect(isServiceAccountId("Cmo9xOUGGjhyxscixUQk4Op7UXi1")).toEqual(false);
  });
});
