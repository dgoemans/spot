import { makeStore } from "./store";

const initializeSpot = (baseUrl) => {
  const store = makeStore();
  const subscriptions = {};

  store.dispatch({
    type: "SETUP",
    payload: { baseUrl },
  });

  const spot = {
    query: (endpoint, params) => {
      store.dispatch({
        type: "QUERY",
        payload: { params, endpoint },
      });
    },
    command: (endpoint, params) => {
      store.dispatch({
        type: "COMMAND",
        payload: { params, endpoint },
      });
    },
    getState: () => {
      return store.getState();
    }
  };

  return spot;
};

export { initializeSpot };
