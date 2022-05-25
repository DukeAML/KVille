import React, { useState , useEffect } from "react";
import { Text, View, StyleSheet, FlatList, SafeAreaView} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

require("firebase/firestore");

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
    width: "80%",
    alignSelf: "center",
    alignItems: "center"
  },
  listText: {
    fontSize: 16,
    fontFamily: "sans-serif",
    fontWeight: "550",
    color: "white"
  },
  boxText: {
    marginBottom: 10,
    width: "90%",
    backgroundColor: "#FFFAFACC",
    alignSelf:"center"  
  }
});



/* let currentUserName;

firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid)
.get().then((doc) => {
  if (doc.exists) currentUserName = doc.data().username;
}).catch((error) => {
  console.log("Error getting document:", error);
});*/

//let members = [{id:'filler', name: 'filler', inTent: null}]; 

let members = new Array();


const Member = ({name, backgroundColor}) => (
  <View style={[styles.listItem, backgroundColor]}>
    <Text style={styles.listText}>{name}</Text>
  </View>
);


export default function GroupInfo() {
  const [groupName,setGroupName]= useState('');
  const groupCode = useSelector((state) => state.user.groupInfo.groupCode);

  const GroupRef = firebase.firestore().collection("groups").doc(groupCode); 

  useEffect(() => {
    let mounted = true;

    //Accesses Names of Members from firebase and adds them to the array
    GroupRef.collection("members").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let currName = doc.data().name;
        //add condition here: 
        let tentCondition = doc.data().inTent;
        let current = {
          id: currName,
          name: currName,
          inTent: tentCondition
        };

        let nameExists;
        if (members.length === 0) nameExists = false;
        else {nameExists = (members.some(e => e.name === currName));}

        if (mounted && !nameExists){
          members.push(current);
        }
          // doc.data() is never undefined for query doc snapshots
      });
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    }); 

    //Gets GroupName from firebase
    GroupRef.get().then((doc)=> {
      if (mounted) setGroupName(doc.data().name)
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

      return () => (mounted = false);
  }, []);


/*   //trying to access groupName
  useEffect(() => {
    let mounted = true;
    GroupRef.get().then((doc) => {
      if (doc.exist && mounted) groupName = doc.data().name;
    })
    return () => (mounted = false);
  }, []); */


  //variable for each name box
  const renderMember = ({item}) => {
    const backgroundColor = item.inTent ? "#3eb489" : "#1f509a";
    return (
      <Member 
      name={item.name}
      backgroundColor = {{backgroundColor}}
      />
    );
  }
  

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Group Name:</Text>

      <View style={styles.boxText}>
        <Text style={styles.contentText}>{groupName}</Text>
      </View>

      <Text style={styles.header}>Group Code</Text>
      <View style={styles.boxText}>
        <Text style={styles.contentText}>{groupCode}</Text>
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
