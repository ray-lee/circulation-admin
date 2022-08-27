import produce from "immer";
import { FeatureFlags } from "../interfaces";
import ActionCreator from "../actions";

export interface ConfigState {
  featureFlags: FeatureFlags;
}

const initialState: ConfigState = {
  featureFlags: {},
};

const handleSetFeatureFlags = (state: ConfigState, action): ConfigState => {
  const { value = {} } = action;

  return produce(state, (draftState) => {
    draftState.featureFlags = value;
  });
};

const handleUpdateFeatureFlag = (state: ConfigState, action): ConfigState => {
  const { name, value } = action;

  return produce(state, (draftState) => {
    draftState.featureFlags[name] = value;
  });
};

export default (state: ConfigState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.SET_FEATURE_FLAGS:
      return handleSetFeatureFlags(state, action);
    case ActionCreator.UPDATE_FEATURE_FLAG:
      return handleUpdateFeatureFlag(state, action);
    default:
      return state;
  }
};
