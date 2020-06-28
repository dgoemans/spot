import fetchMock from "jest-fetch-mock";

import { initializeSpot } from "../src";
import { buildUrl } from "../src/build-url";

const users = {
  'id-one': {
    name: "Spot",
    role: "Good Boy",
    age: 7,
  },
  'id-two': {
    name: "Rufus",
    role: "Home Security",
    age: 3,
  }
};

const baseUrl = "http://example.com";

const waitForLoadingDone = (spot) => new Promise(spot.subscribeOnce);

describe("spot", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockIf(/^http:\/\/example.com.*$/, async (req) => {
      if (req.url.startsWith(`${baseUrl}/fetch-user`)) {
        const tokens = req.url.split('=');
        return {
          status: 200,
          body: JSON.stringify(users[tokens[1]]),
        };
      } else if (req.url.startsWith(`${baseUrl}/update-user`)) {
        const tokens = req.url.split('=').map(token => token.split('&')).reduce((acc, val) => acc.concat(val), []);
        console.log(tokens);
        users[tokens[1]].age = Number.parseInt(tokens[3]);
        return {
          body: "",
          status: 200,
        };
      } else if (req.url.startsWith(`${baseUrl}/invalid-json`)) {
        return {
          body: "<>.aspojdas <XMC98yyfdbshbx hjbgas",
          status: 200,
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

    {
      spot.query("fetch-user", { userId: 'id-one' }, ['users', 'id-one']);
      expect(spot.getState().data).toStrictEqual({loading: true});
      
      await waitForLoadingDone(spot);

      const expectedResult = {
        "users": { 
            ['id-one']: {"age": 7, "name": "Spot", "role": "Good Boy"}
        },
        loading: false
      };

      expect(spot.getState().data).toStrictEqual(expectedResult);
    }

    {
      spot.query("fetch-user", { userId: 'id-two' }, ['users', 'id-two']);

      await waitForLoadingDone(spot);
      const expectedResult = {
        "users": { 
            'id-one': {"age": 7, "name": "Spot", "role": "Good Boy"},
            'id-two': {"age": 3, "name": "Rufus", "role": "Home Security"}
        },
        loading: false
      };
      expect(spot.getState().data).toStrictEqual(expectedResult);
    }
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

    {
      spot.query("fetch-user", { userId: 'id-two' }, ['users', 'id-two']);

      await waitForLoadingDone(spot);
      const expectedResult = {
        "users": { 
            'id-two': {"age": 3, "name": "Rufus", "role": "Home Security"}
        },
        loading: false
      };
      expect(spot.getState().data).toStrictEqual(expectedResult);
    }

    {
      spot.command("update-user", { userId: "id-two", age: 4 });

      await waitForLoadingDone(spot);
    }

    {
      spot.query("fetch-user", { userId: 'id-two' }, ['users', 'id-two']);

      await waitForLoadingDone(spot);
      const expectedResult = {
        "users": { 
            'id-two': {"age": 4, "name": "Rufus", "role": "Home Security"}
        },
        loading: false
      };
      expect(spot.getState().data).toStrictEqual(expectedResult);
    }
  });
});
