import React, { useState } from "react";
import { View, Button, TextInput, Text, StyleSheet } from "react-native";
import { Snackbar } from "react-native-paper";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

require("firebase/firestore");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCenter: {
    justifyContent: "center",
    flex: 1,
    margin: 25,
  },
  textInput: {
    marginBottom: 10,
    borderColor: "gray",
    backgroundColor: "whitesmoke",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  bottomButton: {
    alignContent: "center",
    borderTopColor: "gray",
    borderTopWidth: 1,
    padding: 10,
    textAlign: "center",
    marginBottom: 30,
  },
});

export default function Register(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [groupCode, setGroupCode] = useState([]);
  const [inGroup, setInGroup] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const onRegister = () => {
    if (
      name.length == 0 ||
      username.length == 0 ||
      email.length == 0 ||
      password.length == 0
    ) {
      setIsValid({
        bool: true,
        boolSnack: true,
        message: "Please fill out everything",
      });
      return;
    }
    if (password.length < 6) {
      setIsValid({
        bool: true,
        boolSnack: true,
        message: "passwords must be at least 6 characters",
      });
      return;
    }
    if (password.length < 6) {
      setIsValid({
        bool: true,
        boolSnack: true,
        message: "passwords must be at least 6 characters",
      });
      return;
    }
    firebase
      .firestore()
      .collection("users")
      .where("username", "==", username)
      .get()
      .then((snapshot) => {
        if (!snapshot.exist) {
          firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
              if (snapshot.exist) {
                return;
              }
              firebase
                .auth()
                .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(function () {});
              firebase
                .firestore()
                .collection("users")
                .doc(firebase.auth().currentUser.uid)
                .set({
                  name,
                  email,
                  username,
                  groupCode,
                });
            })
            .catch(() => {
              setIsValid({
                bool: true,
                boolSnack: true,
                message: "Something went wrong",
              });
            });
        }
      })
      .catch(() => {
        setIsValid({
          bool: true,
          boolSnack: true,
          message: "Something went wrong",
        });
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCenter}>
        <TextInput
          style={styles.textInput}
          placeholder="Username"
          value={username}
          keyboardType="twitter"
          onChangeText={(username) =>
            setUsername(
              username
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9]/gi, "")
            )
          }
        />
        <TextInput
          style={styles.textInput}
          placeholder="name"
          onChangeText={(name) => setName(name)}
        />
        <TextInput
          style={styles.textInput}
          placeholder="email"
          onChangeText={(email) => setEmail(email)}
        />
        <TextInput
          style={styles.textInput}
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />

        <Button
          style={styles.button}
          onPress={() => onRegister()}
          title="Register"
        />
      </View>

      <View style={styles.bottomButton}>
        <Text
          style={{ textAlign: "center" }}
          onPress={() => props.navigation.navigate("Login")}
        >
          Already have an account? SignIn.
        </Text>
      </View>
      <Snackbar
        visible={isValid.boolSnack}
        duration={2000}
        onDismiss={() => {
          setIsValid({ boolSnack: false });
        }}
      >
        {isValid.message}
      </Snackbar>
    </View>
  );
}
