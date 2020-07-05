import deepmerge from 'deepmerge';
import { makeStore } from './store';

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
  constructor(baseUrl, debug) {
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
    endpoint,
    params = {},
    path = [endpoint, JSON.stringify(params)],
  ) => {
    this.store.dispatch({
      type: 'QUERY',
      payload: { params, endpoint, path },
    });
    await this.waitForQuery();
  }

  /**
   * Perform a command, will not result in a state update
   * @param {string} endpoint
   * @param {any=} params default: {}
   */
  command = async (endpoint, params) => {
    this.store.dispatch({
      type: 'COMMAND',
      payload: { params, endpoint },
    });
    await this.waitForQuery();
  }

  /**
   * Subscribe once to changes
   * @param {SpotSubscriptionCallback} subscription
   */
  subscribeOnce = (subscription) => {
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
  subscribe = (subscription) => {
    const hash = subscription.toString();
    this.subscriptions[hash] = subscription;
  }

  /**
   * Unsubscribe from changes
   * @param {SpotSubscriptionCallback} subscription
   */
  unsubscribe = (subscription) => {
    const hash = subscription.toString();
    delete this.subscriptions[hash];
  }

  /**
   * Get data stored at path
   * @param {string[]} path
   */
  get = (path) => {
    let state = this.store.getState().data;
    while (path.length) {
      const next = path.shift();
      state = state[next];
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
export const initializeSpot = (baseUrl, debug = false) => new Spot(baseUrl, debug);
