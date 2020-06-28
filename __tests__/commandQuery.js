import fetchMock from "jest-fetch-mock";

import { initializeSpot } from "../src";
import { buildUrl } from "../src/build-url";

const baseUrl = "http://example.com";
const query = buildUrl(baseUrl, "fetch-user", { one: "One", two: 2 });
const invalid = buildUrl(baseUrl, "invalid-json");
const command = buildUrl(baseUrl, "update-user", { one: "One", two: 2 });

describe("spot", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockIf(/^http:\/\/example.com.*$/, async (req) => {
      if (req.url.endsWith(query)) {
        return {
          status: 200,
          body: JSON.stringify({
            name: "Spot",
            role: "Good Boy",
            age: 7,
          }),
        };
      } else if (req.url.endsWith(invalid)) {
        return {
          body: "<>.aspojdas <XMC98yyfdbshbx hjbgas",
          status: 200,
        };
      } else if (req.url.endsWith(command)) {
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

    const params = { one: "One", two: 2 };
    spot.query("fetch-user", params);
    
    const data = await awaiter;

    const expectedResult = {
      "fetch-user": { 
        [btoa(JSON.stringify(params))]: {"age": 7, "name": "Spot", "role": "Good Boy"}
      }
    };

    expect(data).toStrictEqual(expectedResult);
  });
});
