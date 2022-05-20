import React, { useState } from "react";
import { Text, View, StyleSheet, FlatList, SafeAreaView} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";



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
  listItem:{
    backgroundColor: '#1f509a',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  listText: {
    font: 20,
  },
  boxText: {
    height:20,
    width: 80,
    backgroundColor: "#FFFAFACC",
    textAlign: "center"
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

const Member = ({name}) => (
  <View style={styles.listItem}>
    <Text style={styles.listText}>{name}</Text>
  </View>
);
  

export default function GroupInfo() {
  

  const renderMember = ({item}) => (
    <Member name={item.name}/>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.header}>Black Tent</Text>
      </View>
      <View style={styles.boxText}>
        <Text style={styles.header}>Group Name</Text>
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
