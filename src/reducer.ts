import merge from 'deepmerge';

import { State, Action } from './types';

export function commandQuery(state: State, action: Action) {
  switch (action.type) {
    case 'QUERY_COMPLETE':
    {
      let current = state;
      // eslint-disable-next-line no-unused-expressions
      action.metadata?.path?.forEach((segment, index) => {
        if (index + 1 < (action.metadata?.path?.length ?? 0)) {
          current = current[segment] || {};
        } else {
          delete current[segment];
        }
      });
      const newState = merge(state, action.payload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (newState as any).spot.active[`${action.metadata?.correlationId}`];
      return newState;
    }
    case 'COMMAND_COMPLETE':
    {
      const newState = {
        ...state,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (newState as any).spot.active[`${action.metadata?.correlationId}`];
      return newState;
    }
    case 'QUERY':
      return {
        ...state,
        loading: true,
        spot: {
          ...state.spot,
          active: { ...state.spot.active, [`${action.metadata?.correlationId}`]: true },
        },
      };
    case 'COMMAND':
      return {
        ...state,
        loading: true,
        spot: {
          ...state.spot,
          active: { ...state.spot.active, [`${action.metadata?.correlationId}`]: true },
        },
      };
    case 'ERROR':
    {
      const newState = {
        ...state,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (newState as any).spot.active[`${action.metadata?.correlationId}`];
      return newState;
    }
    case 'STATE_UPDATED':
      return {
        ...state,
        loading: false, // (Object.keys(state.spot.active).length > 0),
      };
    default:
      return {
        ...state,
      };
  }
}

export function configure(state: State, action: Action) {
  if (action.type === 'SETUP') {
    const { baseUrl } = action.payload;
    return {
      ...state,
      baseUrl,
    };
  }

  return { ...state };
}

function errors(state: State, action: Action) {
  if (action.type === 'ERROR') {
    return [...state, action.payload];
  }
  return [...state];
}

export const reducer = (state: State, action: Action) => {
  if (state.config && state.config.debug) {
    // eslint-disable-next-line no-console
    console.log(
      `Got Action:\n${JSON.stringify(
        action,
        null,
        2,
      )}\nCurrent State:\n${JSON.stringify(state, null, 2)}`,
    );
  }

  return {
    config: configure(state.config, action),
    data: commandQuery(state.data, action),
    errors: errors(state.errors, action),
  };
};
