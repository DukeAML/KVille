import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useSelector } from "react-redux";
import AppLoading from "expo-app-loading";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

require("firebase/firestore");

/* let currentUserName;

firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid)
.get().then((doc) => {
  if (doc.exists) currentUserName = doc.data().username;
}).catch((error) => {
  console.log("Error getting document:", error);
});*/

let members = new Array(); //members array for list

//Render Item for Each List Item of group members
const Member = ({ name, backgroundColor }) => (
  <View style={[styles.listItem, backgroundColor, styles.shadowProp]}>
    <Text style={styles.listText}>{name}</Text>
  </View>
);

export default function GroupInfo({ route, navigation }) {
  const [loaded, setLoaded] = useState(false); // for checking if firebase is read before rendering

  const { groupCode, groupName } = route.params; // take in navigation parameters
  console.log("Group code passed to GroupInfo:", groupCode);

  /* const [groupName,setGroupName]= useState('');
  const groupCode = useSelector((state) => state.user.currentUser.groupCode); */

  //const GroupRef = firebase.firestore().collection("groups").doc(groupCode);

  const GroupRef = firebase.firestore().collection("groups").doc(groupCode);

  //useEffect(() => {
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      //Accesses Names of Members from firebase and adds them to the array
      if (mounted) {
        GroupRef.collection("members")
          .get()
          .then((querySnapshot) => {
            setLoaded(false);
            querySnapshot.forEach((doc) => {
              let currName = doc.data().name; //gets current name in list
              //console.log("current name:", currName);

              let tentCondition = doc.data().inTent; //gets tent status as well
              //console.log("tentcondition:", tentCondition);

              let current = {
                //create new object for the current list item
                id: currName,
                name: currName,
                inTent: tentCondition,
              };

              let nameExists, tentStatusChanged; //checks if member is already in list array
              if (members.length === 0) nameExists = false;
              else {
                nameExists = members.some((e) => e.name === currName);
              }

              if (mounted && !nameExists) {
                // if not already in, add to the array
                members.push(current);
              }

              let indexOfUser = members.findIndex((member) => {
                return member.id === currName;
              });
              tentStatusChanged = !(
                members[indexOfUser].inTent == tentCondition
              );
              /* console.log("status1: ",members[indexOfUser].inTent); 
        console.log("status: ",tentStatusChanged); 
        console.log("ARRAY: ",members); */

              // checks if tent status changed after refresh and updates list
              if (mounted && nameExists && tentStatusChanged) {
                members.splice(indexOfUser, 1);
                members.insert(indexOfUser, current);
              }

              // doc.data() is never undefined for query doc snapshots
            });
          })
          .then((doc) => {
            //for making sure firebase is done reading
            setLoaded(true);
          })
          .catch((error) => {
            console.log("Error getting documents: ", error);
          });
      }
      return () => {
        members = [];
        //setLoaded(false);
        mounted = false;
      };
    }, [groupCode])
  );
  //}, [navigation]);

  //variable for each name box, change color to green if status is inTent
  const renderMember = ({ item }) => {
    const backgroundColor = item.inTent ? "#3eb489" : "#1f509a";
    return <Member name={item.name} backgroundColor={{ backgroundColor }} />;
  };

  if (!loaded) {
    //if firebase reading done, then render
    return <AppLoading />;
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Group Name</Text>

        <View style={styles.boxText}>
          <Text style={styles.contentText}>{groupName}</Text>
        </View>

        <Text style={styles.header}>Group Code</Text>
        <View style={styles.boxText}>
          <Text style={styles.contentText}>{groupCode}</Text>
        </View>

        <SafeAreaView>
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
          />
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C2C6D0",
  },
  header: {
    marginVertical: 10,
    marginHorizontal: 50,
    fontSize: 28,
    fontWeight: "700",
  },
  contentText: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  listItem: {
    backgroundColor: "#1f509a",
    padding: 8,
    marginVertical: 4,
    borderRadius: 7,
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
  },
  listText: {
    fontSize: 16,
    //fontFamily: "sans-serif",
    fontWeight: "500",
    color: "white",
  },
  boxText: {
    marginBottom: 10,
    width: "90%",
    backgroundColor: "#FFFAFACC",
    borderRadius: 8,
    alignSelf: "center",
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  }
});
