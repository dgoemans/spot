import { buildUrl } from "./build-url";

const fetchJson = async (url, config = { method: "GET" }) => {
  const response = await fetch(url, config);
  // console.log(await response.text());
  const result = await response.json();
  return result;
};

export const fetchMiddleware = (store) => (next) => async (action) => {
  if (action.type === "QUERY") {
    const url = buildUrl(
      store.getState().config.baseUrl,
      action.payload.endpoint,
      action.payload.params
    );
    try {
      const result = await fetchJson(url);
      store.dispatch({
        type: "QUERY_COMPLETE",
        payload: {
          [action.payload.endpoint]: {
            [action.payload.params]: {
              ...result,
            },
          },
        },
      });
    } catch (e) {
      store.dispatch({ type: "ERROR", payload: e });
    }
  } else if (action.type === "COMMAND") {
    const url = buildUrl(
      store.getState().config.baseUrl,
      action.payload.endpoint,
      action.payload.params
    );
    try {
      const result = await fetchJson(url);
      store.dispatch({
        type: "COMMAND_COMPLETE",
        payload: {
          [action.payload.endpoint]: {
            [action.payload.params]: {
              ...result,
            },
          },
        },
      });
    } catch (e) {
      store.dispatch({ type: "ERROR", payload: e });
    }
  }

  return next(action);
};
