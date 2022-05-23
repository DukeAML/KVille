import React, { useState } from "react";
import { Text, View, StyleSheet, FlatList, SafeAreaView} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C2C6D0",
  },
  header: {
    marginVertical: 10,
    marginHorizontal: 15,    
    fontSize: 32,
    fontWeight: "700",
  },
  contentText:{
    fontSize: 28,
    fontWeight: "700",
    textAlign:"center"
  },
  listItem:{
    backgroundColor: '#1f509a',
    padding: 8,
    marginVertical: 4,
    marginLeft: 30,
    width: "20%",
    alignItems: "center"
  },
  listText: {
    fontSize: "auto",
    fontFamily: "sans-serif",
    fontWeight: "600",
    color: "white"
  },
  boxText: {
    marginBottom: 10,
    width: "90%",
    backgroundColor: "#FFFAFACC",
    alignSelf:"center"  
  }
});

let members = [
  {
    id: '1',
    name: 'User1',
  },
  {
    id: '2',
    name: 'User2',
  },
  {
    id: '3',
    name: 'User3',
  },
  {
    id: '4',
    name: 'User4',
  },
  {
    id: '5',
    name: 'User5',
  },
  {
    id: '6',
    name: 'User6',
  },
  {
    id: '7',
    name: 'User7',
  },
];
 
const membersRef = firebase.firestore().collection("groups").doc(firebase.auth().currentUser.uid).collection("members");

membersRef.collection("cities").where("capital", "==", true)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });



const Member = ({name}) => (
  <View style={styles.listItem}>
    <Text style={styles.listText}>{name}</Text>
  </View>
);

let groupName = "Poopers";
  

export default function GroupInfo() {
  

  const renderMember = ({item}) => (
    <Member name={item.name}/>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Group Name:</Text>
      <View style={styles.boxText}>
        <Text style={styles.contentText}>{groupName}</Text>
      </View>
      <Text style={styles.header}>Group Code</Text>
      <View style={styles.boxText}>
        <Text style={styles.contentText}>F65E78</Text>
      </View>
      <SafeAreaView>
        <FlatList
          data = {members}
          renderItem={renderMember}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
      
        
    </View>
  );
}
