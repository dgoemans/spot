import 'isomorphic-fetch';
import { Dispatch, MiddlewareAPI } from 'redux';

import { Action } from './types';
import { buildUrl } from './build-url';

const defaultFetchConfig: RequestInit = {
  method: 'GET',
  mode: 'cors',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
  referrerPolicy: 'no-referrer',
};

export const fetchMiddleware = (api: MiddlewareAPI) => (next: Dispatch) => async (action: Action) => {
  const nextResult = next(action);

  if (action.type === 'QUERY') {
    const url = buildUrl(
      api.getState().config.baseUrl,
      action.payload.endpoint,
      action.payload.params,
    );

    const correlationId = action.metadata?.correlationId;
    try {
      const response = await fetch(url, {
        ...defaultFetchConfig,
        method: action?.config?.method ?? 'GET',
        headers: {
          ...defaultFetchConfig.headers,
          authorization: action.config?.authorization || '',
        },
      });

      if (response.status < 200 || response.status >= 400) {
        throw new Error(
          `QUERY FAILED ${response.status}: ${response.statusText}`,
        );
      }

      const result = await response.json();

      const payload = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let depth = payload as any;
      const { path } = action.payload;
      path.forEach((current: string, index: number) => {
        depth[current] = index === path.length - 1 ? result : {};
        depth = depth[current];
      });

      api.dispatch({
        type: 'QUERY_COMPLETE',
        payload,
        metadata: {
          path,
          correlationId,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      api.dispatch({ type: 'ERROR', payload: err.toString(), metadata: { correlationId } });
    } finally {
      api.dispatch({ type: 'STATE_UPDATED', metadata: { correlationId } });
    }
  } else if (action.type === 'COMMAND') {
    const url = buildUrl(
      api.getState().config.baseUrl,
      action.payload.endpoint,
    );

    const correlationId = action.metadata?.correlationId;

    try {
      const response = await fetch(url, {
        ...defaultFetchConfig,
        method: action?.config?.method ?? 'POST',
        body: JSON.stringify(action.payload.params),
        headers: {
          ...defaultFetchConfig.headers,
          authorization: action.config?.authorization || '',
        },
      });

      if (response.status < 200 || response.status >= 400) {
        throw new Error(
          `COMMAND FAILED ${response.status}: ${response.statusText}`,
        );
      }

      api.dispatch({ type: 'COMMAND_COMPLETE', metadata: { correlationId } });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      api.dispatch({ type: 'ERROR', payload: e, metadata: { correlationId } });
    } finally {
      api.dispatch({ type: 'STATE_UPDATED', metadata: { correlationId } });
    }
  }

  return nextResult;
};
