import 'isomorphic-fetch';

import { buildUrl } from './build-url';

const defaultFetchConfig = {
  method: 'GET',
  mode: 'cors',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
  referrerPolicy: 'no-referrer',
};

export const fetchMiddleware = (store) => (next) => async (action) => {
  const nextResult = next(action);

  if (action.type === 'QUERY') {
    const url = buildUrl(
      store.getState().config.baseUrl,
      action.payload.endpoint,
      action.payload.params,
    );
    try {
      const response = await fetch(url, {
        ...defaultFetchConfig,
        method: action?.config?.method ?? 'GET',
      });

      if (response.status < 200 || response.status >= 400) {
        throw new Error(
          `QUERY FAILED ${response.status}: ${response.statusText}`,
        );
      }

      const result = await response.json();

      const payload = {};
      let depth = payload;
      const { path } = action.payload;
      path.forEach((current, index) => {
        depth[current] = index === path.length - 1 ? result : {};
        depth = depth[current];
      });

      store.dispatch({
        type: 'QUERY_COMPLETE',
        payload,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      store.dispatch({ type: 'ERROR', payload: e });
    } finally {
      store.dispatch({ type: 'STATE_UPDATED' });
    }
  } else if (action.type === 'COMMAND') {
    const url = buildUrl(
      store.getState().config.baseUrl,
      action.payload.endpoint,
    );
    try {
      const response = await fetch(url, {
        ...defaultFetchConfig,
        method: action?.config?.method ?? 'POST',
        body: JSON.stringify(action.payload.params),
      });

      if (response.status < 200 || response.status >= 400) {
        throw new Error(
          `COMMAND FAILED ${response.status}: ${response.statusText}`,
        );
      }

      store.dispatch({ type: 'COMMAND_COMPLETE' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      store.dispatch({ type: 'ERROR', payload: e });
    } finally {
      store.dispatch({ type: 'STATE_UPDATED' });
    }
  }

  return nextResult;
};
