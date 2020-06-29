import merge from "deepmerge";

export function commandQuery(state, action) {
  switch (action.type) {
    case "QUERY_COMPLETE":
      return merge(state, action.payload);
    case "COMMAND_COMPLETE":
      return {
        ...state,
      };
    case "QUERY":
    case "COMMAND":
      return {
        ...state,
        loading: true,
      };
    case "STATE_UPDATED":
      return {
        ...state,
        loading: false,
      };
    default:
      return {
        ...state,
      };
  }
}

export function configure(state, action) {
  if (action.type === "SETUP") {
    const { baseUrl } = action.payload;
    return {
      ...state,
      baseUrl,
    };
  }

  return { ...state };
}

function errors(state, action) {
  if (action.type === "ERROR") {
    return [...state, action.payload];
  }
  return [...state];
}

export const reducer = (state, action) => {
  if (state.config && state.config.debug) {
    console.log(
      `Got Action:\n${JSON.stringify(
        action,
        null,
        2
      )}\nCurrent State:\n${JSON.stringify(state, null, 2)}`
    );
  }

  return {
    config: configure(state.config, action),
    data: commandQuery(state.data, action),
    errors: errors(state.errors, action),
  };
};
