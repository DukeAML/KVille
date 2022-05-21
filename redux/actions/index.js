import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { USER_STATE_CHANGE } from "../constants/index";

export function fetchUser() {
  return (dispatch) => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() });
        } else {
          console.log("does not exist");
        }
      });
  };
}

export function fetchGroupCode() {
  return (dispatch) => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          dispatch({ type: GROUP_CODE_STATE_CHANGE, groupCode: snapshot.data().groupCode });
        } else {
          console.log("does not exist");
        }
      });
  }
}

export const inGroup = () => {
  return {
    type: "IN_GROUP",
  };
};

export const notInGroup = () => {
  return {
    type: "NOT_IN_GROUP",
  };
};
