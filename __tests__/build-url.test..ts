import { buildUrl } from "../src/build-url";

describe("build url", () => {
  it("Builds a url correctly", async () => {
    const result = buildUrl("http://some-stuff.com", "api/test", {
      param1: "one",
      param2: 2,
    });
    expect(result).toBe("http://some-stuff.com/api/test?param1=one&param2=2");
  });
});
