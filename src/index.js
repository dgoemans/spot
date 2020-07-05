import deepmerge from 'deepmerge';
import { makeStore } from './store';

export class Spot {
  constructor(baseUrl, debug) {
    this.store = makeStore(debug);
    this.subscriptions = {};

    this.store.dispatch({
      type: 'SETUP',
      payload: { baseUrl },
    });

    this.store.subscribe(() => {
      if (!this.store.getState().data.loading) {
        Object.values(this.subscriptions).forEach((sub) => {
          sub(this.store.getState());
        });
      }
    });
  }

  query = (
    endpoint,
    params = {},
    path = [endpoint, JSON.stringify(params)],
  ) => {
    this.store.dispatch({
      type: 'QUERY',
      payload: { params, endpoint, path },
    });
  }

  command = (endpoint, params) => {
    this.store.dispatch({
      type: 'COMMAND',
      payload: { params, endpoint },
    });
  }

  subscribeOnce = (subscription) => {
    const hash = subscription.toString();
    this.subscriptions[`${hash}_once`] = (state) => {
      subscription(state);
      delete this.subscriptions[hash];
    };
  }

  subscribe = (subscription) => {
    const hash = subscription.toString();
    this.subscriptions[hash] = subscription;
  }

  unsubscribe = (subscription) => {
    const hash = subscription.toString();
    delete this.subscriptions[hash];
  }

  get = (path) => {
    let state = this.store.getState().data;
    while (path.length) {
      const next = path.shift();
      state = state[next];
    }
    return deepmerge({}, state);
  }

  get data() {
    return deepmerge({}, this.store.getState().data);
  }

  get errors() {
    return deepmerge([], this.store.getState().errors);
  }
}

export const initializeSpot = (baseUrl, debug = false) => new Spot(baseUrl, debug);
