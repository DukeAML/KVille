// import firebase from "firebase/compat/app";
// import "firebase/compat/auth";
// import "firebase/compat/firestore";

// import { setCurrentUser, reset } from "../reducers/userSlice";

// export function clearData(dispatch) {
//   dispatch(reset());
// }

// export function fetchUser(dispatch) {
//   firebase
//     .firestore()
//     .collection("users")
//     .doc(firebase.auth().currentUser.uid)
//     .get()
//     .then((snapshot) => {
//       if (snapshot.exists) {
//         dispatch(setCurrentUser(snapshot.data()));
//       } else {
//         console.log("does not exist");
//       }
//     });
// }
