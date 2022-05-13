import React, { useState } from "react";
import { View, Button, TextInput, Text, StyleSheet } from "react-native";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";

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
    marginBottom: 30 
  },
});

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignUp = () => {
    firebase.auth().signInWithEmailAndPassword(email, password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCenter}>
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
          onPress={() => onSignUp()}
          title="Sign In"
        />
      </View>

      <View style={styles.bottomButton}>
        <Text
          title="Register"
          onPress={() => props.navigation.navigate("Register")}
          style = {{textAlign: "center"}}
        >
          Don't have an account? SignUp.
        </Text>
      </View>
    </View>
  );
}
// export class Login extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       email: "",
//       password: "",
//       name: "",
//     };

//     this.onSignUp = this.onSignUp.bind(this);
//   }

//   onSignUp() {
//     const { email, password } = this.state;
//     firebase
//       .auth()
//       .signInWithEmailAndPassword(email, password)
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   }

//   render() {
//     return (
//       <View>
//         <TextInput
//           placeholder="email"
//           onChangeText={(email) => this.setState({ email })}
//         />
//         <TextInput
//           placeholder="password"
//           secureTextEntry={true}
//           onChangeText={(password) => this.setState({ password })}
//         />
//         <Button onPress={() => this.onSignUp()} title="Sign in" />
//       </View>
//     );
//   }
// }

// export default Login;
