import fetchMock from "jest-fetch-mock";

import { initializeSpot } from "../src";
import { buildUrl } from "../src/build-url";
import { delay } from "../src/delay";

const baseUrl = "http://example.com";
const query = buildUrl(baseUrl, "fetch-user", { one: "One", two: 2 });
const invalid = buildUrl(baseUrl, "invalid-json");
const command = buildUrl(baseUrl, "update-user", { one: "One", two: 2 });

const waitForLoadingDone = (spot) => new Promise(spot.subscribeOnce);

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

  it("Can fetch data", async () => {
    const spot = initializeSpot(baseUrl);

    const params = { one: "One", two: 2 };
    spot.query("fetch-user", params);
    expect(spot.getState().data).toStrictEqual({loading: true});
    
    await waitForLoadingDone(spot);

    const expectedResult = {
      "fetch-user": { 
        [btoa(JSON.stringify(params))]: {"age": 7, "name": "Spot", "role": "Good Boy"}
      },
      loading: false
    };

    expect(spot.getState().data).toStrictEqual(expectedResult);
  });

  it("Adds errors when the fetch fails", async () => {
    const spot = initializeSpot(baseUrl);

    spot.query("invalid-json");
    expect(spot.getState().data).toStrictEqual({loading: true});

    await waitForLoadingDone(spot);

    expect(spot.getState().data).toStrictEqual({loading: false});
    expect(spot.getState().errors).toHaveLength(1);
    expect(spot.getState().errors[0]).toMatchSnapshot();
  });

  it("Can execute commands data", async () => {
    const spot = initializeSpot(baseUrl);

    const orignalState = spot.getState();

    const params = { one: "One", two: 2 };
    spot.command("update-user", params);
    expect(spot.getState().data).toStrictEqual({loading: true});

    await waitForLoadingDone(spot);

    const expectedResult = { loading: false };

    expect(spot.getState().data).toStrictEqual(expectedResult);
  });
});
