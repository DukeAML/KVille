//UUID generator, used for group codes
// import firebase from "firebase/compat/app";
// import "firebase/compat/auth";
// import "firebase/compat/firestore";


export function generateGroupCode(digits) {
  let uuid = generateUUID(digits);
  // firebase
  //   .firestore()
  //   .collection("groups")
  //   .doc(uuid)
  //   .get()
  //   .then((doc) => {
  //     console.log(doc.exists);
  //     if (!doc.exists) {
  //       return uuid;
  //     }
  //   });
  return uuid;
}

const generateUUID = (digits) => {
  let str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ";
  let uuid = [];
  for (let i = 0; i < digits; i++) {
    uuid.push(str[Math.floor(Math.random() * str.length)]);
  }
  return uuid.join("");
};
