import { combineReducers } from "redux";
import { user } from "./user";
import groupStatus from "./groupStatus";

const Reducers = combineReducers({
  userState: user,
  inGroup: groupStatus,
});

export default Reducers;
