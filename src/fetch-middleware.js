import { buildUrl } from "./build-url";
const defaultFetchConfig = { 
  method: 'GET',
  mode: 'cors',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json'
  }, 
  referrerPolicy: 'no-referrer',
};

export const fetchMiddleware = (store) => (next) => async (action) => {
  const nextResult = next(action);

  if (action.type === "QUERY") {
    const url = buildUrl(
      store.getState().config.baseUrl,
      action.payload.endpoint,
      action.payload.params
    );
    try {
      const response = await fetch(url, { ...defaultFetchConfig, method: 'GET' });
      
      if(response.status < 200 || response.status >= 400) {
        throw new Error(`QUERY FAILED ${response.status}: ${response.statusText}`)
      }

      const result = await response.json();
      
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
    } finally {
      store.dispatch({ type: "STATE_UPDATED" });
    }
  } else if (action.type === "COMMAND") {
    const url = buildUrl(
      store.getState().config.baseUrl,
      action.payload.endpoint,
      action.payload.params
    );
    try {
      const response = await fetch(url, { ...defaultFetchConfig, method: 'POST' });

      if(response.status < 200 || response.status >= 400) {
        throw new Error(`COMMAND FAILED ${response.status}: ${response.statusText}`)
      }

      store.dispatch({ type: "COMMAND_COMPLETE" });
    } catch (e) {
      console.error(e);
      store.dispatch({ type: "ERROR", payload: e });
    } finally {
      store.dispatch({ type: "STATE_UPDATED" });
    }
  }

  return nextResult;
};
