import { useReducer } from "react";

export default function useReducerWithActions(actionHandlers, initialState) {
  const reducer = (state, { type, payload, meta }) =>
    actionHandlers[type](state)(payload, meta);

  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = Object.keys(actionHandlers).reduce(
    (acc, type) => ({
      ...acc,
      [type]: (payload, meta) => dispatch({ type, payload, meta })
    }),
    {}
  );

  return [state, actions];
}
