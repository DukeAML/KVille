import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import * as SplashScreen from 'expo-splash-screen';
import { Menu, Provider, IconButton } from 'react-native-paper';
import { useQuery } from 'react-query';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { useDispatch } from 'react-redux';
import CountDown from 'react-native-countdown-component';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import DukeBasketballLogo from '../assets/DukeBasketballLogo.png';
import { setGroupCode, setGroupName, setUserName, setTentType, setGroupRole, reset } from '../redux/reducers/userSlice';
import { createGroupSchedule } from '../backend/CreateGroupSchedule';
import { createTestCases } from '../backend/firebaseAdd';
import { useTheme } from '../context/ThemeProvider';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorPage } from '../components/ErrorPage';
import { ActionSheetModal } from '../components/ActionSheetModal';

const window = Dimensions.get('window');

export default function Home({ navigation }) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCountVisible, setCountVisible] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const time = useRef(Math.round((new Date(2023, 1, 5).getTime() - Date.now()) / 1000));

  const { theme } = useTheme();
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (mounted) {
        setIsDisabled(false);
      }
      return () => {
        mounted = false;
      };
    }, [])
  );

  const { isLoading, isError, error, refetch, data } = useQuery(
    ['groups', firebase.auth().currentUser.uid],
    fetchGroups,
    { initialData: [], onSuccess: () => setIsReady(true) }
  );

  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

  async function fetchGroups() {
    let data;

    await firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        let currGroup = doc.data().groupCode;
        //console.log("Current user's groups", currGroup);
        data = currGroup.map((group) => ({
          code: group.groupCode,
          groupName: group.groupName,
        }));
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return data;
  }

  async function updateRedux(groupName, groupCode) {
    setIsDisabled(true);
    let groupRole;
    await firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .get()
      .then((doc) => {
        //console.log('tent type', doc.data().tentType);
        dispatch(setTentType(doc.data().tentType));
      })
      .catch((e) => {
        console.error(e);
      });
    await firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((memDoc) => {
        groupRole = memDoc.data().groupRole;
        dispatch(setUserName(memDoc.data().name));
        dispatch(setGroupRole(groupRole));
      })
      .catch((e) => {
        console.error(e);
      });

    dispatch(setGroupCode(groupCode));
    dispatch(setGroupName(groupName));
    try {
      navigation.navigate('GroupInfo', {
        //pass groupcode and group name parameters
        groupCode: groupCode,
        groupName: groupName,
        groupRole: groupRole,
      });
    } catch (error) {
      console.error(error);
    }
  }

  function toggleModal() {
    setModalVisible(!isModalVisible);
  }

  function toggleCount() {
    setCountVisible(!isCountVisible);
  }

  function openMenu() {
    setMenuVisible(true);
  }

  function closeMenu() {
    setMenuVisible(false);
  }

  const EmptyGroup = () => {
    return (
      <View
        style={[
          styles(theme).listItem,
          styles(theme).shadowProp,
          { flexDirection: 'row', justifyContent: 'left', opacity: 0.5, width: '60%', height: '10%', marginRight: 50 },
        ]}
      >
        <Image source={DukeBasketballLogo} style={styles(theme).image} />
        <View style={{ flexDirection: 'column', width: '70%', justifyContent: 'space-between' }}>
          <View style={{ backgroundColor: theme.grey5, width: '80%', height: '50%', borderRadius: 15 }} />
          <View style={{ backgroundColor: theme.grey3, width: '50%', height: '30%', borderRadius: 15 }} />
        </View>
      </View>
    );
  };

  const Arrow = (props) => (
    <Svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 700 700' {...props}>
      <Path
        fill='#3a3b3c'
        d='M423.06 204.3v-68.762l144.13 109.09-141.49 113.06-1.984-50.91c-86.613-13.223-217.52 31.734-291.57 117.02 37.023-124.3 103.14-223.47 290.91-219.5z'
        fillRule='evenodd'
      />
    </Svg>
  );

  //const for list Items of Groups List
  const Group = ({ groupName, groupCode }) => (
    <TouchableOpacity
      onPress={() => updateRedux(groupName, groupCode)}
      style={[styles(theme).listItem, styles(theme).shadowProp]}
      disabled={isDisabled}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'left' }}>
        <Image source={DukeBasketballLogo} style={styles(theme).image} />
        <View style={{ flexDirection: 'column' }}>
          <Text style={[styles(theme).listText, { fontSize: 20, color: theme.grey1 }]}>{groupName}</Text>
          <Text style={[styles(theme).listText, { color: theme.grey4 }]}>{groupCode}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  //for rendering list items of Groups
  const renderGroup = ({ item }) => {
    return <Group groupName={item.groupName} groupCode={item.code} />;
  };

  async function onLogout() {
    await AsyncStorage.multiRemove(['USER_EMAIL', 'USER_PASSWORD']);
    await firebase.auth().signOut();
    dispatch(reset());
  }

  if (isLoading || !isReady) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return <ErrorPage navigation={navigation} />;
  }
  return (
    <Provider>
      <View style={styles(theme).startContainer}>
        <View style={styles(theme).topBanner}>
          <Text style={styles(theme).topText}>Welcome to Krzyzewskiville!</Text>
          <IconButton icon='cog-outline' color={theme.grey1} size={25} onPress={()=>navigation.navigate('AccountSettingsScreen')} />
          {/* <Menu
            visible={isMenuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu}>
                <Icon name='dots-vertical' color={theme.icon2} size={25} />
              </TouchableOpacity>
            }
          >
            <Menu.Item icon={'logout'} onPress={onLogout} title='Log Out' />
            <Menu.Item
              icon={'information-outline'}
              onPress={() => {
                closeMenu();
                navigation.navigate('AboutScreen');
              }}
              title='About'
            />
            <Menu.Item
              icon={'cog-outline'}
              onPress={() => {
                closeMenu();
                navigation.navigate('AccountSettingsScreen');
              }}
              title='Settings'
            />
          </Menu> */}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '90%',
            alignItems: 'center',
            marginBottom: 5,
          }}
        >
          <Text style={styles(theme).groupText}>Groups</Text>
          <TouchableOpacity onPress={toggleModal}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name='plus-circle-outline' color={theme.primary} size={20} />
              <Text
                style={[
                  styles(theme).groupText,
                  {
                    fontSize: 16,
                    fontWeight: '700',
                    color: theme.primary,
                    marginLeft: 4,
                  },
                ]}
              >
                Add Group
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <SafeAreaView style={{ width: '100%', height: '60%' }}>
          {data.length == 0 ? (
            <View style={{ flex: 1, justifyContent: 'start', alignItems: 'center', paddingTop: '10%' }}>
              <View
                style={{
                  position: 'absolute',
                  height: 80,
                  width: 80,
                  transform: [{ rotateX: '180deg' }, { rotate: '90deg' }],
                  right: '10%',
                  top: '0%',
                }}
              >
                <Arrow />
              </View>
              <EmptyGroup />
              <EmptyGroup />
              <EmptyGroup />
              <Text style={{ color: theme.grey1, fontSize: 20, fontWeight: '700', marginTop: '10%' }}>
                Create or Join a Group
              </Text>
            </View>
          ) : (
            <FlatList
              data={data}
              renderItem={renderGroup}
              keyExtractor={(item) => item.code}
              refreshControl={
                <RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />
              }
              style={{ width: '100%', flexGrow: 1, height: '100%' /* , borderWidth:1 */ }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>

        {/* <View
          style={{
            width: '100%',
            height: '20%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              width: '85%',
              height: '40%',
              backgroundColor: theme.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 20,
            }}
            onPress={toggleCount}
          >
            <Text style={{ fontSize: 26, fontWeight: '700', color: theme.text1 }}>Countdown to UNC</Text>
          </TouchableOpacity>
        </View> */}

        <ActionSheetModal
          isVisible={isCountVisible}
          onBackdropPress={toggleCount}
          swipeDown={false}
          height={200}
          userStyle={'light'}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, width: '100%' }}>
            <Text style={{ position: 'absolute', top: 0 }}>Countdown to UNC</Text>
            <CountDown
              size={30}
              until={time.current}
              onFinish={() => alert('Finished')}
              digitStyle={{
                backgroundColor: '#FFF',
                borderWidth: 2,
                borderColor: theme.primary,
              }}
              digitTxtStyle={{ color: theme.primary }}
              timeLabelStyle={{ color: 'black', fontWeight: 'bold' }}
              separatorStyle={{
                color: theme.primary,
                alignSelf: 'center',
                flex: 1,
                paddingTop: 15,
                justifyContent: 'center',
              }}
              showSeparator={true}
            />
          </View>
        </ActionSheetModal>

        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setModalVisible(false)}
          backdropTransitionOutTiming={0}
          keyboardDismissMode={'on-drag'}
          //customBackdrop={<View style={{ flex: 1 }} />}
        >
          <SafeAreaView style={styles(theme).popUp}>
            <Text style={styles(theme).popUpHeader}>Add Group</Text>
            <TouchableOpacity
              onPress={() => {
                toggleModal();
                navigation.navigate('JoinGroup');
              }}
              style={{ width: '100%', alignSelf: 'center' }}
            >
              <View
                style={[
                  styles(theme).popButton,
                  {
                    borderBottomLeftRadius: 3,
                    borderBottomRightRadius: 3,
                    borderTopLeftRadius: 11,
                    borderTopRightRadius: 11,
                  },
                ]}
              >
                <Icon name='account-plus-outline' color={'white'} size={20} style={{ marginLeft: 10 }} />
                <Text style={styles(theme).buttonText}>Join Group</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                toggleModal();
                navigation.navigate('CreateGroup');
              }}
              style={{ width: '100%', alignSelf: 'center' }}
            >
              <View
                style={[
                  styles(theme).popButton,
                  {
                    borderBottomLeftRadius: 11,
                    borderBottomRightRadius: 11,
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                  },
                ]}
              >
                <Icon name='account-circle-outline' color={'white'} size={20} style={{ marginLeft: 10 }} />
                <Text style={styles(theme).buttonText}>Create New Group</Text>
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
        {/* <Button
          title='Create Group Schedule'
          onPress={() =>
            createGroupSchedule('sX5bkvgE', 'Black').then((groupSchedule) => {
              firebase
                .firestore()
                .collection('groups')
                .doc('sX5bkvgE')
                .update({
                  groupSchedule: groupSchedule,
                })
                .then(() => console.log('update successfull'))
                .catch((error) => console.log(error));
              console.log(groupSchedule);
            })
          }
        /> */}
        {/* <Button
              title="Add test case"
              onPress={() => createTestCases()}
            /> */}
      </View>
    </Provider>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    startContainer: {
      //Overarching Container
      flexDirection: 'column',
      flex: 1,
      //backgroundColor: theme.background,
      backgroundColor: '#f5f7fa',
      alignItems: 'center',
      marginTop: '0%',
    },
    topBanner: {
      //for the top container holding "welcome to k-ville"
      alignItems: 'center',
      marginTop: 50,
      marginBottom: 35,
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    topText: {
      //"welcome to kville" text
      textAlign: 'left',
      fontWeight: '800',
      fontSize: 28,
      color: theme.grey1,
    },
    groupText: {
      //text for 'Groups' and '+ Add Group'
      fontSize: 24,
      fontWeight: '700',
      color: theme.grey1,
    },
    popUp: {
      //style for popup menu of add group
      width: '90%',
      height: 160,
      backgroundColor: theme.secondary,
      alignSelf: 'center',
      alignItems: 'center',
      borderRadius: 20,
      margin: 15,
    },
    popUpHeader: {
      //style for text at the top of the popup
      fontWeight: '600',
      color: theme.text1,
      height: 40,
      width: '89%',
      marginTop: 15,
      textAlign: 'center',
      fontSize: 24,
    },
    popButton: {
      //style for the buttons in the popup
      flexDirection: 'row',
      width: '85%',
      height: 40,
      marginVertical: 2,
      alignSelf: 'center',
      backgroundColor: theme.tertiary,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    buttonText: {
      //popup buttons' text
      fontSize: 16,
      color: theme.text1,
      textAlign: 'left',
      marginLeft: 15,
    },
    image: {
      //for the duke basketball logos
      width: 45,
      height: 39,
      alignSelf: 'center',
      marginLeft: 10,
      marginRight: 20,
    },

    listItem: {
      //for the items for each group
      //backgroundColor: theme.grey3,
      backgroundColor: '#fff',
      padding: 8,
      marginVertical: 7,
      borderRadius: 10,
      alignSelf: 'center',
      borderWidth: 0.3,
      borderColor: '#d8d9dc',
      //width: window.width * 0.9,
      width: '90%',
      justifyContent: 'flex-start',
    },
    listText: {
      //for the text inside the group cards
      fontSize: 15,
      fontWeight: '500',
      color: theme.text2,
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
