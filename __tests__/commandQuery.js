import { initializeSpot } from "../src";
import fetchMock, { enableFetchMocks } from "jest-fetch-mock";

const baseUrl = "http://example.com";

describe("spot", () => {
  beforeEach(() => {
    // if you have an existing `beforeEach` just add the following lines to it
    fetchMock.mockIf(/^http:\/\/example.com.*$/, (req) => {
      console.log(`Mocking Url: ${req.url}`);
      if (req.url.endsWith("fetch-user")) {
        return {
          status: 200,
          body: JSON.stringify({
            name: "Spot",
            role: "Good Boy",
            age: 7,
          }),
        };
      } else if (req.url.endsWith("/invalid-json")) {
        return {
          body: "<>.aspojdas <XMC98yyfdbshbx hjbgas",
          status: 200,
        };
      } else if (req.url.endsWith("/update-user")) {
        return {
          body: "",
          status: 200,
          headers: {
            "X-Some-Response-Header": "Some header value",
          },
        };
      } else {
        return {
          status: 404,
          body: "Not Found",
        };
      }
    });
  });

  it("Sets up a store", async () => {
    const spot = initializeSpot(baseUrl);

    const awaiter = new Promise((resolve) => {
      spot.subscribe((data) => {
        console.log(`Got change ${JSON.stringify(data)}`);
        resolve(data);
      });
    });

    const result = await spot.query("fetch-user", { one: "One", two: 2 });
    const data = await awaiter;
    expect(data).toBe(null);
  });
});
