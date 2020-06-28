import { makeStore } from "./store";
import "isomorphic-fetch";

const initializeSpot = (baseUrl) => {
  const store = makeStore();
  const subscriptions = {};

  store.dispatch({
    type: "SETUP",
    payload: { baseUrl },
  });

  const subscriber = (hash) => {
    return () => {
      const state = store.getState();
      subscriptions[hash](state.data);
    };
  };

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
    subscribe: (subscription) => {
      const hash = subscription.toString();
      subscriptions[hash] = subscription;
      store.subscribe(subscriber(hash));
    },
    unsubscribe: (subscription) => {
      const hash = subscription.toString();
      delete subscriptions[hash];
      store.unsubscribe(subscriber(hash));
    },
  };

  return spot;
};

export { initializeSpot };
