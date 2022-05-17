import React, { useState } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { divide } from "react-native-reanimated";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C2C6D0",
  },
  header: {
    height: "20%",
    width: "100%",
    fontSize: 28,
    fontWeight: "bold",
  },
});

// let members = [
//   {
//     id: '',
//     name: User1,
//   },
//   {
//     id: '',
//     name: User2,
//   },
//   {
//     id: '',
//     name: User3,
//   },
//   {
//     id: '',
//     name: User4,
//   },
//   {
//     id: '',
//     name: User5,
//   },
//   {
//     id: '',
//     name: User6,
//   },
//   {
//     id: '',
//     name: User7,
//   },
// ];

// const GroupList = () =>{
  
// }

export default function GroupInfo() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.header}>Black Tent</Text>
      </View>
    </View>
  );
}
