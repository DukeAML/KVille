import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  Button,
  SafeAreaView,
} from 'react-native';

import { useFonts, NovaCut_400Regular } from '@expo-google-fonts/nova-cut';
import Icon from 'react-native-vector-icons/Ionicons';
import DukeBasketballLogo from '../assets/DukeBasketballLogo.png';
import Modal from 'react-native-modal';
import * as SplashScreen from 'expo-splash-screen';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useDispatch } from 'react-redux';
import {
  setGroupCode,
  setGroupName,
  setUserName,
  setTentType,
} from '../redux/reducers/userSlice';
import { createGroupSchedule } from '../backend/CreateGroupSchedule';
import { createTestCases } from '../backend/firebaseAdd';

const window = Dimensions.get('window');

let GROUPS = new Array();

//const for list Items of Groups List
const Group = ({ groupName, groupCode, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.listItem, styles.shadowProp]}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'left' }}>
      <Image source={DukeBasketballLogo} style={styles.image} />
      <View style={{ flexDirection: 'column' }}>
        <Text style={[styles.listText, { fontSize: 20 }]}>{groupName}</Text>
        <Text style={[styles.listText, { color: '#555555' }]}>{groupCode}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function Start({ navigation }) {
  /* let [fontsLoaded] = useFonts({
    NovaCut_400Regular,
  }); */

  const [isModalVisible, setModalVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const dispatch = useDispatch();

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  //for rendering list items of Groups
  const renderGroup = ({ item }) => {
    return (
      <Group
        groupName={item.groupName}
        groupCode={item.code}
        onPress={() => {
          const updateRedux = async () => {
            await firebase
              .firestore()
              .collection('groups')
              .doc(item.code)
              .get()
              .then((doc) => {
                console.log('tent type', doc.data().tentType);
                dispatch(setTentType(doc.data().tentType));
              });
            await firebase
              .firestore()
              .collection('groups')
              .doc(item.code)
              .collection('members')
              .doc(firebase.auth().currentUser.uid)
              .get()
              .then((memDoc) => {
                dispatch(setUserName(memDoc.data().name));
              });

            dispatch(setGroupCode(item.code));
            dispatch(setGroupName(item.groupName));
            // navigation.dispatch(
            //   StackActions.replace('GroupInfo', {
            //     //pass groupcode and group name parameters
            //     groupCode: item.code,
            //     groupName: item.groupName,
            //   })
            // );
            navigation.navigate('GroupInfo', {
              //pass groupcode and group name parameters
              groupCode: item.code,
              groupName: item.groupName,
            });
          };
          updateRedux();
        }}
      />
    );
  };

  //firebase reference to current user
  const userRef = firebase
    .firestore()
    .collection('users')
    .doc(firebase.auth().currentUser.uid);

  let mounted;
  useFocusEffect(
    useCallback(() => {
      mounted = true;

      async function prepare() {
        try {
          await SplashScreen.preventAutoHideAsync();

          //Accesses Names of Members from firebase and adds them to the array
          await userRef.get().then((doc) => {
            if (mounted) {
              //setIsReady(false);
              let currGroup = doc.data().groupCode;
              console.log("Current user's groups", currGroup);

              if (mounted && currGroup.length !== 0) {
                currGroup.forEach((group) => {
                  let current = {
                    code: group.groupCode,
                    groupName: group.groupName,
                  };
                  let codeExists;
                  if (GROUPS.length === 0) codeExists = false;
                  else {
                    codeExists = GROUPS.some((e) => e.code === group.code);
                  }

                  if (mounted && !codeExists) {
                    GROUPS.push(current);
                  }
                });
              }
            }
          });
        } catch (e) {
          console.warn(e);
        } finally {
          // Tell the application to render
          setIsReady(true);
        }
      }
      prepare();

      return () => {
        mounted = false;
        GROUPS = [];
        setIsReady(false);
        console.log('start screen was unfocused');
      };
    }, [])
  );

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }
  return (
    <View style={styles.startContainer} onLayout={onLayoutRootView}>
      <View style={styles.topBanner}>
        <Text style={styles.topText}>Welcome to Krzyzewskiville!</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: "space-between",
          width: '90%',
          alignItems: 'center',
          marginBottom: 5,
        }}
      >
        <Text style={styles.groupText}>Groups</Text>
        <TouchableOpacity onPress={toggleModal}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name='add-circle-outline' color={'#1f509a'} size={20} />
            <Text
              style={[
                styles.groupText,
                {
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#1f509a',
                  marginLeft: 4,
                },
              ]}
            >
              Add Group
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* 
      <ScrollView showsVerticalScrollIndicator={false}> */}
      <SafeAreaView>
        <FlatList
          data={GROUPS}
          renderItem={renderGroup}
          keyExtractor={(item) => item.code}
        />
      </SafeAreaView>
      {/* </ScrollView> */}

      <View>
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setModalVisible(false)}
          //customBackdrop={<View style={{ flex: 1 }} />}
        >
          <View style={styles.popUp}>
            <Text style={styles.popUpHeader}>Add Group</Text>
            <TouchableOpacity onPress={() => navigation.navigate('JoinGroup')}>
              <View
                style={[
                  styles.popButton,
                  {
                    borderBottomLeftRadius: 3,
                    borderBottomRightRadius: 3,
                    borderTopLeftRadius: 11,
                    borderTopRightRadius: 11,
                  },
                ]}
              >
                <Icon
                  name='person-add-outline'
                  color={'white'}
                  size={20}
                  style={{ marginLeft: 10 }}
                />
                <Text style={styles.buttonText}>Join Group</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <View
                style={[
                  styles.popButton,
                  {
                    borderBottomLeftRadius: 11,
                    borderBottomRightRadius: 11,
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                  },
                ]}
              >
                <Icon
                  name='people-circle-outline'
                  color={'white'}
                  size={20}
                  style={{ marginLeft: 10 }}
                />
                <Text style={styles.buttonText}>Create New Group</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/* <Button
              title="Create Group Schedule"
              onPress={() =>
                createGroupSchedule("BtycLIprkN3EmC9wmpaE", "blue").then(
                  (groupSchedule) => {
                    console.log(groupSchedule);
                  }
                )
              }
            /> */}
        {/* <Button
              title="Add test case"
              onPress={() => createTestCases()}
            /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  startContainer: {
    //Overarching Container
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#C2C6D0',
    alignItems: 'center',
    marginTop: '0%',
  },
  /*   header: {
    left: "0%",
    width: "100%"
  }, */
  topBanner: {
    //for the top container holding "welcome to k-ville"
    alignItems: 'flex-start',
    marginTop: 50,
    marginBottom: 35,
    width: '90%',
    //borderWidth: 2
  },
  topText: {
    //"welcome to kville" text
    //fontFamily: 'Arial',
    textAlign: 'left',
    fontWeight: '800',
    fontSize: 28,
  },
  groupText: {
    //text for 'Groups' and '+ Add Group'
    //fontFamily: 'sans-serif',
    //textAlign: 'left',
    //width: '90%',
    fontSize: 24,
    fontWeight: '700',
    color: '#656565',
  },
  popUp: {
    //style for popup menu of add group
    width: '90%',
    height: 160,
    backgroundColor: '#1E3F66',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 20,
    margin: 15,
  },
  popUpHeader: {
    //style for text at the top of the popup
    //fontFamily: 'Arial',
    fontWeight: '600',
    color: 'white',
    height: 40,
    width: window.width * 0.8,
    marginTop: 15,
    textAlign: 'center',
    fontSize: 24,
    //borderWidth: 1
  },
  popButton: {
    //style for the buttons in the popup
    flexDirection: 'row',
    width: window.width * 0.7,
    height: 40,
    marginVertical: 2,
    alignSelf: 'stretch',
    backgroundColor: '#2E5984',
    justifyContent: 'flex-start',
    alignItems: 'center',
    //borderWidth: 1
  },
  buttonText: {
    //popup buttons' text
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    marginLeft: 15,
  },

  /*   banner: {
    color: "#fff",
    fontFamily: "NovaCut_400Regular",
    fontSize: 36,
    left: "0%"
  }, */
  image: {
    //for the duke basketball logos
    width: 45,
    height: 39,
    alignSelf: 'center',
    //borderWidth: 1,
    marginLeft: 10,
    marginRight: 20,
  },

  listItem: {
    //for the items for each group
    backgroundColor: '#e5e5e5',
    padding: 8,
    marginVertical: 7,
    borderRadius: 10,
    width: window.width * 0.9,
    justifyContent: 'flex-start',
  },
  listText: {
    //for the text inside the group cards
    fontSize: 15,
    //fontFamily: "sans-serif",
    fontWeight: '500',
    color: 'black',
  },
  shadowProp: {
    //shadow for the group cards
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 20,
  },
});
