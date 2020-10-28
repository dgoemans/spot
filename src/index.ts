import deepmerge from 'deepmerge';
import { makeStore } from './store';

import { Subscription, ActionConfig, Action } from './types';

/**
 * Subscription callback type
 * @callback SpotSubscriptionCallback
 * @param {any} state
 * @returns {void}
 */

/**
 * Spot instance
 * @type {Spot}
 */
export class Spot {
  store: any;
  subscriptions: { [k: string]: (data: any) => unknown };
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

  /**
   * Perform a query, will result in a state update
   * @param {string} endpoint
   * @param {any=} params default: {}
   * @param {string[]=} path default: [endpoint, JSON.stringify(params)]
   */
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

  /**
   * Perform a command, will not result in a state update
   * @param {string} endpoint
   * @param {any=} params default: {}
   */
  command = async (endpoint: string, params: { [k: string]: unknown }, config?: { method?: string }) => {
    this.store.dispatch({
      type: 'COMMAND',
      payload: { params, endpoint },
      config,
    });
    await this.waitForQuery();
  }

  /**
   * Subscribe once to changes
   * @param {SpotSubscriptionCallback} subscription
   */
  subscribeOnce = (subscription: Subscription) => {
    const hash = subscription.toString();
    this.subscriptions[`${hash}_once`] = (state) => {
      subscription(state);
      delete this.subscriptions[hash];
    };
  }

  /**
   * Subscribe to changes
   * @param {SpotSubscriptionCallback} subscription
   */
  subscribe = (subscription: Subscription) => {
    const hash = subscription.toString();
    this.subscriptions[hash] = subscription;
  }

  /**
   * Unsubscribe from changes
   * @param {SpotSubscriptionCallback} subscription
   */
  unsubscribe = (subscription: Subscription) => {
    const hash = subscription.toString();
    delete this.subscriptions[hash];
  }

  /**
   * Get data stored at path
   * @param {string[]} path
   */
  get = (path: string[]) => {
    let state = this.store.getState().data;
    while (path.length) {
      const next = path.shift();
      state = state[next!];
    }
    return deepmerge({}, state);
  }

  /**
   * All the data
   * @readonly
   * @property {any} data
   */
  get data() {
    return deepmerge({}, this.store.getState().data);
  }

  /**
   * List of errors
   * @readonly
   * @property {Error[]} errors
   */
  get errors() {
    return deepmerge([], this.store.getState().errors);
  }
}

/**
 * Initialize a spot instance
 * @param {string} baseUrl
 * @param {boolean} debug default: false
 */
export const initializeSpot = (baseUrl: string, debug: boolean = false) => new Spot(baseUrl, debug);
