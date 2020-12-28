import deepmerge from 'deepmerge';
import { Store } from 'redux';

import { uuidv4 } from './uuid';
import { makeStore } from './store';

import { Subscription, ActionConfig } from './types';

interface DataType {
  loading: boolean;
  spot: {
    active: { [k: string]: boolean }
  };
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
      metadata: {
        correlationId: uuidv4(),
      },
    });
    await this.waitForQuery();
  }

  command = async (endpoint: string, params: { [k: string]: unknown }, config?: ActionConfig) => {
    this.store.dispatch({
      type: 'COMMAND',
      payload: { params, endpoint },
      config,
      metadata: {
        correlationId: uuidv4(),
      },
    });
    await this.waitForQuery();
  }

  subscribeOnce = (subscription: Subscription) => {
    const hash = subscription.toString();
    this.subscriptions[`${hash}_once`] = (state) => {
      subscription(state);
      delete this.subscriptions[`${hash}_once`];
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
    return [...this.store.getState().errors];
  }
}

export const initializeSpot = <T>(baseUrl: string, debug = false) => new Spot<T>(baseUrl, debug);
