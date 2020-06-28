import { createStore, applyMiddleware } from "redux";
import { reducer } from "./reducer";
import { fetchMiddleware } from "./fetch-middleware";

export const makeStore = () =>
  createStore(
    reducer,
    { config: {}, data: { loading: false }, errors: [] },
    applyMiddleware(fetchMiddleware)
  );
