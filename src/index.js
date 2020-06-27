import { makeStore } from "./store";
import "isomorphic-fetch";

const initializeSpot = (baseUrl) => {
  const store = makeStore();
  store.dispatch({
    type: "SETUP",
    payload: { baseUrl },
  });

  const spot = {
    store,
    query: async (endpoint, params) => {
      return await store.dispatch({
        type: "QUERY",
        payload: { params, endpoint },
      });
    },
    command: async (endpoint, params) => {
      return await store.dispatch({
        type: "COMMAND",
        payload: { params, endpoint },
      });
    },
  };

  return spot;
};

export { initializeSpot };
