import deepmerge from 'deepmerge';
import { Store } from 'redux';

import { makeStore } from './store';

import { Subscription, ActionConfig } from './types';

interface DataType {
  loading: boolean;
}

export class Spot<T = unknown> {
  store: Store;

  subscriptions: { [k: string]: (data: T & DataType) => unknown };

  waitForQuery: () => Promise<unknown>;

  constructor(baseUrl: string, debug?: boolean) {
    this.store = makeStore(debug);
    this.subscriptions = {};
    this.waitForQuery = () => new Promise(this.subscribeOnce);

    this.store.dispatch({
      type: 'SETUP',
      payload: { baseUrl },
    });

    this.store.subscribe(() => {
      if (!this.store.getState().data.loading) {
        Object.values(this.subscriptions).forEach((sub) => {
          sub(this.data);
        });
      }
    });
  }

  query = async (
    endpoint: string,
    params: { [k: string]: unknown } = {},
    path = [endpoint, JSON.stringify(params)],
    config?: ActionConfig,
  ) => {
    this.store.dispatch({
      type: 'QUERY',
      payload: { params, endpoint, path },
      config,
    });
    await this.waitForQuery();
  }

  command = async (endpoint: string, params: { [k: string]: unknown }, config?: { method?: string }) => {
    this.store.dispatch({
      type: 'COMMAND',
      payload: { params, endpoint },
      config,
    });
    await this.waitForQuery();
  }

  subscribeOnce = (subscription: Subscription) => {
    const hash = subscription.toString();
    this.subscriptions[`${hash}_once`] = (state) => {
      subscription(state);
      delete this.subscriptions[hash];
    };
  }

  subscribe = (subscription: Subscription) => {
    const hash = subscription.toString();
    this.subscriptions[hash] = subscription;
  }

  unsubscribe = (subscription: Subscription) => {
    const hash = subscription.toString();
    delete this.subscriptions[hash];
  }

  get = (path: string[]) => {
    let state = this.data as T & DataType;
    while (path.length) {
      const next = path.shift();
      // Ye, these are nasty, but i'm abusing json objects here and need the flexibility. -dgoemans
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      state = (state as any)[next!];
    }
    return deepmerge({}, state);
  }

  get data() {
    return deepmerge({}, this.store.getState().data) as T & DataType;
  }

  get errors() {
    return deepmerge([], this.store.getState().errors);
  }
}

export const initializeSpot = <T>(baseUrl: string, debug = false) => new Spot<T>(baseUrl, debug);
