import { initializeSpot } from "../src";

describe("spot", () => {
  it("Sets up a store", async () => {
    const spot = initializeSpot("http://base.url/api");
    const result = await spot.query("myEndpoint", { one: "One", two: 2 });
    expect(result).toBe(null);
  });
});
