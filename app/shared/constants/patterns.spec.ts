import { passwordPattern, socialMediaPattern, webPattern } from "./patterns";

describe("Patterns", () => {
  it("webPattern (success)", () => {
    expect(webPattern.test("www.test.com")).toEqual(true);
    expect(webPattern.test("test.com")).toEqual(true);
    expect(webPattern.test("test.co")).toEqual(true);
    expect(webPattern.test("www.test.co.uk")).toEqual(true);
    expect(webPattern.test("www.test.co.uk/path1")).toEqual(true);
    expect(webPattern.test("www.test.co.uk/path1/path2")).toEqual(true);
    expect(webPattern.test("www.test.co.uk/path1/path2?q=param1")).toEqual(true);
    expect(webPattern.test("test.co.uk/path1/path2?q=param1")).toEqual(true);
    expect(webPattern.test("images.test.co.uk/path1/path2?q=param1")).toEqual(true);
    expect(webPattern.test("m.test.co.uk/path1/path2?q=param1")).toEqual(true);
    expect(webPattern.test("https://test.com")).toEqual(true);
    expect(webPattern.test("http://test.com")).toEqual(true);
  });
  it("webPattern (failed)", () => {
    expect(webPattern.test("wrong-protocol://test.com")).toEqual(false);
    expect(webPattern.test("https://test")).toEqual(false);
    expect(webPattern.test("test")).toEqual(false);
    expect(webPattern.test("wrong-url-pattern")).toEqual(false);
    expect(webPattern.test("wrong/url/pattern")).toEqual(false);
    expect(webPattern.test(".test")).toEqual(false);
    expect(webPattern.test(".test.")).toEqual(false);
  });

  it("socialMediaPattern (success)", () => {
    expect(socialMediaPattern.test("@name")).toEqual(true);
    expect(socialMediaPattern.test("@two_names")).toEqual(true);
    expect(socialMediaPattern.test("name")).toEqual(true);
    expect(socialMediaPattern.test("two_name")).toEqual(true);
    expect(socialMediaPattern.test("@has_n0")).toEqual(true);
    expect(socialMediaPattern.test("has_n0")).toEqual(true);
  });
  it("socialMediaPattern (failed)", () => {
    expect(socialMediaPattern.test("@more_than_fifteen_characters")).toEqual(false);
    expect(socialMediaPattern.test("more_than_fifteen_characters")).toEqual(false);
    expect(socialMediaPattern.test("wrong$char$")).toEqual(false);
    expect(socialMediaPattern.test("has space")).toEqual(false);
    expect(socialMediaPattern.test("@has space")).toEqual(false);
  });

  it("passwordPattern (success)", () => {
    expect(passwordPattern.test("1234Abcd")).toEqual(true);
    expect(passwordPattern.test("passWord1")).toEqual(true);
    expect(passwordPattern.test("pass$1Word")).toEqual(true);
  });
  it("passwordPattern (failed)", () => {
    expect(passwordPattern.test("short")).toEqual(false);
    expect(passwordPattern.test("onlyCharacters")).toEqual(false);
    expect(passwordPattern.test("1234567890")).toEqual(false);
    expect(passwordPattern.test("hasSpecialChar&Numbers")).toEqual(false);
    expect(passwordPattern.test("no_upper_case")).toEqual(false);
    expect(passwordPattern.test("noNumbers")).toEqual(false);
  });
});
