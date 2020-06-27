import { buildUrl } from "./build-url";

export async function reducer(state, config, action) {
  switch (action.type) {
    case "QUERY":
      const url = buildUrl(
        config.baseUrl,
        action.payload.endpoint,
        action.payload.params
      );
      try {
        const data = await fetch(url);
        return {
          ...state,
          data,
        };
      } catch (e) {
        console.error(`QUERY Error: ${e}`);
        return {
          ...state,
          errors: [...(state.errors || []), e],
        };
      }
      break;
    case "COMMAND":
      break;
    default:
      return {
        ...state,
      };
  }
}

export function configure(state, action) {
  if (action.type === "SETUP") {
    return {
      ...state,
      baseUrl: action.payload.baseUrl,
    };
  }

  return state;
}

export const data = async (state, action) => {
  return {
    config: configure(state.config, action),
    data: await reducer(state.data, state.config, action),
  };
};
