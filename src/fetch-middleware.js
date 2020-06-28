import { buildUrl } from "./build-url";

const fetchJson = async (url, config = { 
  method: 'GET',
  mode: 'cors',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json'
  }, 
  referrerPolicy: 'no-referrer',
}) => {
  const response = await fetch(url, config);
  return response.json();
};

export const fetchMiddleware = (store) => (next) => async (action) => {
  console.log(`middleware ${JSON.stringify(action, null, 2)}`);
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
            [btoa(JSON.stringify(action.payload.params))]: {
              ...result,
            },
          },
        },
      });
    } catch (e) {
      console.error(e);
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
