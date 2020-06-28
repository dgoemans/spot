import { makeStore } from "./store";

const initializeSpot = (baseUrl) => {
  const store = makeStore();
  const subscriptions = {};

  store.dispatch({
    type: "SETUP",
    payload: { baseUrl },
  });

  store.subscribe(() => {
    if(!store.getState().data.loading) {
      Object.values(subscriptions).forEach((sub) => {
        sub(store.getState());
      });
    }
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
    subscribeOnce: (subscription) => {
      const hash = subscription.toString();
      subscriptions[`${hash}_once`] = (state) => {
        subscription(state);
        delete subscriptions[hash];
      };
    },
    subscribe: (subscription) => {
      const hash = subscription.toString();
      subscriptions[hash] = subscription;
    },
    unsubscribe: (subscription) => {
      const hash = subscription.toString();
      delete subscriptions[hash];
    },
    getState: () => {
      return store.getState();
    }
  };

  return spot;
};

export { initializeSpot };
