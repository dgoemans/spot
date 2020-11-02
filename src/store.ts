import { createStore, applyMiddleware } from 'redux';
import { reducer } from './reducer';
import { fetchMiddleware } from './fetch-middleware';

export const makeStore = (debug = false) => createStore(
  reducer,
  {
    config: { debug },
    data: { loading: false, spot: { active: {} } },
    errors: [],
  },
  applyMiddleware(fetchMiddleware),
);
