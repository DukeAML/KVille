import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { Table, TableWrapper, Row, Col, Cell } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import * as SplashScreen from 'expo-splash-screen';
import { Snackbar} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { BottomSheetModal } from '../component/BottomSheetModal';
import { ActionSheetModal } from '../component/ActionSheetModal';

const window = Dimensions.get('window');

// prettier-ignore
const agenda = {
  tableHead: ['', 'Sun', 'Mon', 'Tu', 'Wed', 'Th', 'Fri', 'Sat'],
  tableTime: [ ' 1 am', ' 2 am', ' 3 am', ' 4 am', ' 5 am', ' 6 am', ' 7 am',' 8 am', ' 9 am', '10 am', '11 am', 
  '12 pm',' 1 pm', ' 2 pm', ' 3 pm', ' 4 pm', ' 5 pm', ' 6 pm', ' 7 pm', ' 8 pm', ' 9 pm', '10 pm', '11 pm',],
};

//const tableData = Array.from(Array(24).fill(""), () => new Array(7).fill(""));
const tableData = [];
for (let i = 0; i < 48; i += 1) {
  const rowData = [];
  for (let j = 0; j < 7; j += 1) {
    rowData.push('');
  }
  tableData.push(rowData);
}

const cellHeight = 35;

let currIndex;

let availability;
// let availabilityUI = new Array(336);
// availabilityUI.fill([true, 0]);

export default function Availability({ route }) {
  const { groupCode } = route.params;
  //console.log('availability params', route.params);

  const [dimensions, setDimensions] = useState({ window });
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isSnackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [selectedDay, setSelectedDay] = useState(7);
  const [startTime, setStartTime] = useState({
    hour: 0,
    minute: 0,
    day: 0,
  });
  const [endTime, setEndTime] = useState({
    hour: 0,
    minute: 0,
    day: 0,
  });
  const { theme } = useTheme();

  const { isLoading, isError, error, data, refetch } = useQuery(
    ['availability', firebase.auth().currentUser.uid, groupCode],
    () => fetchAvailability(groupCode)
  );
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  //useRefreshOnFocus(refetch);

  async function fetchAvailability(groupCode) {
    await SplashScreen.preventAutoHideAsync();
    //let availability;
    let availabilityUI = new Array(336);
    availabilityUI.fill([true, 0]);
    await firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        availability = doc.data().availability;
        console.log('availability fetched from firebase', availability);
      });
    for (let i = 0; i < availability.length; i++) {
      if (!availability[i]) {
        let j = i;
        while (j < availability.length && !availability[j]) {
          availabilityUI[j] = [true, 0];
          j++;
        }
        availabilityUI[j - 1] = [false, j - i];
        i = j;
      } else {
        availabilityUI[i] = [true, 0];
      }
    }
    return availabilityUI;
  }

  const useUpdateAvailability = (groupCode) => {
    const queryClient = useQueryClient();
    return useMutation(() => updateAvailability(groupCode), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['availability', firebase.auth().currentUser.uid, groupCode]);
      },
    });
  };

  const postAvailability = useUpdateAvailability(groupCode);

  const updateAvailability = (groupCode) => {
    const memberRef = firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(firebase.auth().currentUser.uid);
    if (selectedDay == 7) {
      toggleSnackBar();
      setSnackMessage('Please select a day');
      return;
    }
    let startIdx =
      parseInt(selectedDay) * 48 + parseInt(startTime.day) + parseInt(startTime.minute) + parseInt(startTime.hour) * 2;
    let endIdx =
      parseInt(selectedDay) * 48 + parseInt(endTime.day) + parseInt(endTime.minute) + parseInt(endTime.hour) * 2;
    if (endIdx == parseInt(selectedDay) * 48) {
      endIdx += 48;
    }
    if (startIdx >= endIdx) {
      toggleSnackBar();
      setSnackMessage('Invalid time slot');
      return;
    }
    for (let i = startIdx; i < endIdx; i++) {
      availability[i] = false;
    }
    //availabilityUI[endIdx - 1] = [false, endIdx - startIdx];
    console.log('availability', availability);
    memberRef.update({
      availability: availability,
    });
    toggleModal();
  };

  //const queryClient = useQueryClient();
  const useDeleteAvailability = (groupCode) => {
    const queryClient = useQueryClient();
    return useMutation(() => deleteCell(groupCode), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['availability', firebase.auth().currentUser.uid, groupCode]);
      },
    });
  };

  const deleteAvailability = useDeleteAvailability(groupCode);

  const deleteCell = (groupCode) => {
    const memberRef = firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(firebase.auth().currentUser.uid);
    console.log('currIndex', currIndex);
    let startIdx = currIndex - data[currIndex][1];
    console.log('startIdx', startIdx);
    for (let i = startIdx; i <= currIndex; i++) {
      availability[i] = true;
    }
    memberRef.update({
      availability: availability,
    });
    toggleDeleteModal();
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleDeleteModal = () => {
    setDeleteModalVisible(!isDeleteModalVisible);
  };
  const toggleSnackBar = () => {
    setSnackVisible(!isSnackVisible);
  };

  const element = (cellData, index, availability) => (
    <TouchableOpacity
      style={[styles(theme).btn, { height: cellHeight * parseInt(availability[index][1]) }]}
      onPress={() => {
        console.log(index);
        toggleDeleteModal();
        currIndex = index;
      }}
    ></TouchableOpacity>
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  if (isError) {
    console.error(error);
    return null;
  }

  return (
    <View style={styles(theme).container} onLayout={onLayoutRootView}>
      <ActionSheetModal
        isVisible={isDeleteModalVisible}
        onBackdropPress={toggleDeleteModal}
        height = {55}
        userStyle = 'light'
      >
        <TouchableOpacity
          onPress={() => deleteAvailability.mutate()}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name={'trash-can-outline'} color={theme.error} size={26} />
          <Text style={{ textAlign: 'center', color: theme.error, fontSize: 26, fontWeight: '600', marginLeft: 10 }}>
            Delete
          </Text>
        </TouchableOpacity>
      </ActionSheetModal>

      <BottomSheetModal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onSwipeComplete={toggleModal}
        height='80%'
        userStyle='dark'
      >
        <Snackbar
          visible={isSnackVisible}
          onDismiss={() => setSnackVisible(false)}
          wrapperStyle={{ top: 0 }}
          duration={2000}
        >
          <Text style={{ textAlign: 'center', color: theme.text1 }}>{snackMessage}</Text>
        </Snackbar>
        <BottomSheetModal.Header>Add New Busy Time</BottomSheetModal.Header>

        <View style={styles(theme).modalBody}>
          <View style={styles(theme).selectDay}>
            <Text style={styles(theme).modalText}>Select Day: </Text>
            <Picker
              selectedValue={selectedDay}
              
              onValueChange={(itemValue, itemIndex) => {
                setSelectedDay(itemValue);
              }}
              style={
                Platform.OS === 'ios' ? { height: '100%', width: '80%' } : { height: 30, width: '70%', marginTop: 15 }
              }
              itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
            >
              <Picker.Item label='' value={7}/>
              <Picker.Item label='Sunday' value={0} />
              <Picker.Item label='Monday' value={1} />
              <Picker.Item label='Tuesday' value={2} />
              <Picker.Item label='Wednesday' value={3} />
              <Picker.Item label='Thursday' value={4} />
              <Picker.Item label='Friday' value={5} />
              <Picker.Item label='Saturday' value={6} />
            </Picker>
          </View>

          <View style={styles(theme).selectTime}>
            <Text style={styles(theme).modalText}>Start Time: </Text>
            <View style={styles(theme).timePickerBody}>
              <Picker
                selectedValue={startTime.hour}
                onValueChange={(itemValue, itemIndex) => {
                  setStartTime({ ...startTime, hour: itemValue });
                }}
                style={Platform.OS === 'ios' ? styles(theme).picker : { height: 30, width: '30%', marginTop: 15 }}
                itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
              >
                <Picker.Item label='12' value={0} />
                <Picker.Item label='1' value={1} />
                <Picker.Item label='2' value={2} />
                <Picker.Item label='3' value={3} />
                <Picker.Item label='4' value={4} />
                <Picker.Item label='5' value={5} />
                <Picker.Item label='6' value={6} />
                <Picker.Item label='7' value={7} />
                <Picker.Item label='8' value={8} />
                <Picker.Item label='9' value={9} />
                <Picker.Item label='10' value={10} />
                <Picker.Item label='11' value={11} />
              </Picker>
              <Picker
                selectedValue={startTime.minute}
                onValueChange={(itemValue, itemIndex) => {
                  setStartTime({ ...startTime, minute: itemValue });
                }}
                style={Platform.OS === 'ios' ? styles(theme).picker : { height: 30, width: '30%', marginTop: 15 }}
                itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
              >
                <Picker.Item label='00' value={0} />
                <Picker.Item label='30' value={1} />
              </Picker>
              <Picker
                selectedValue={startTime.day}
                onValueChange={(itemValue, itemIndex) => {
                  setStartTime({ ...startTime, day: itemValue });
                }}
                style={Platform.OS === 'ios' ? styles(theme).picker : { height: 30, width: '30%', marginTop: 15 }}
                itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
              >
                <Picker.Item label='AM' value={0} />
                <Picker.Item label='PM' value={24} />
              </Picker>
            </View>
          </View>

          <View style={styles(theme).selectTime}>
            <Text style={styles(theme).modalText}>End Time: </Text>

            <View style={styles(theme).timePickerBody}>
              <Picker
                selectedValue={endTime.hour}
                onValueChange={(itemValue, itemIndex) => {
                  setEndTime({ ...endTime, hour: itemValue });
                }}
                style={Platform.OS === 'ios' ? styles(theme).picker : { height: 30, width: '30%', marginTop: 15 }}
                itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
              >
                <Picker.Item label='12' value={0} />
                <Picker.Item label='1' value={1} />
                <Picker.Item label='2' value={2} />
                <Picker.Item label='3' value={3} />
                <Picker.Item label='4' value={4} />
                <Picker.Item label='5' value={5} />
                <Picker.Item label='6' value={6} />
                <Picker.Item label='7' value={7} />
                <Picker.Item label='8' value={8} />
                <Picker.Item label='9' value={9} />
                <Picker.Item label='10' value={10} />
                <Picker.Item label='11' value={11} />
              </Picker>
              <Picker
                selectedValue={endTime.minute}
                onValueChange={(itemValue, itemIndex) => {
                  setEndTime({ ...endTime, minute: itemValue });
                }}
                style={Platform.OS === 'ios' ? styles(theme).picker : { height: 30, width: '30%', marginTop: 15 }}
                itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
              >
                <Picker.Item label='00' value={0} />
                <Picker.Item label='30' value={1} />
              </Picker>
              <Picker
                selectedValue={endTime.day}
                onValueChange={(itemValue, itemIndex) => {
                  setEndTime({ ...endTime, day: itemValue });
                }}
                style={Platform.OS === 'ios' ? styles(theme).picker : { height: 30, width: '30%', marginTop: 15 }}
                itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
              >
                <Picker.Item label='AM' value={0} />
                <Picker.Item label='PM' value={24} />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles(theme).modalFooter}>
          <TouchableOpacity style={styles(theme).addBtn} onPress={toggleModal}>
            <Text style={styles(theme).btnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles(theme).addBtn} onPress={() => postAvailability.mutate()}>
            <Text style={styles(theme).btnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>



      <Table borderStyle={{ borderColor: 'transparent' }}>
        <Row
          data={agenda.tableHead}
          style={StyleSheet.flatten(styles(theme).head)}
          widthArr = {[dimensions.window.width/15, dimensions.window.width*(2/15), dimensions.window.width*(2/15), dimensions.window.width*(2/15), 
            dimensions.window.width*(2/15), dimensions.window.width*(2/15), dimensions.window.width*(2/15), dimensions.window.width*(2/15)]}
          textStyle={{ textAlign: 'center', fontWeight: '700' }}
        />
      </Table>



      <ScrollView
        showsVerticalScrollIndicator={false}
        //onScroll = {onScroll}
        //scrollEventThrottle = {16}
        refreshControl={<RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />}
      >
        <Table borderStyle={{ borderWidth: 0, borderColor: 'transparent'}} style={{ flexDirection: 'row' }}>
          <TableWrapper style={StyleSheet.flatten([{ width: dimensions.window.width / 15, marginTop:30/* , borderWidth:1 */}])}>
            <Col
              data={agenda.tableTime}
              //heightArr={[ 60,60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60]}
              heightArr = {new Array(23).fill(cellHeight*2)}
              //style={StyleSheet.flatten(styles(theme).time)}
              //style={{alignSelf: 'center'}}
              textStyle={{ textAlign: 'center', fontWeight:'700', fontSize: 12, width: '100%', color: '#717573'/* , borderWidth:1, */ }}
            />
          </TableWrapper>

          <TableWrapper style={{ flex: 1 }}>
            {tableData.map((rowData, index) => (
              <TableWrapper
                key={index}
                //style={StyleSheet.flatten([styles(theme).row, index % 2 && { backgroundColor: theme.white2 }])}
                style={StyleSheet.flatten(styles(theme).row)}
              >
                {rowData.map((cellData, cellIndex) => (
                  <Cell
                    key={cellIndex}
                    data={data[48 * cellIndex + index][0] ? cellData : element(cellData, 48 * cellIndex + index, data)}
                    //{data[48 * cellIndex + index].toString()}

                    style={StyleSheet.flatten([styles(theme).cell, { width: dimensions.window.width *(2/15) }])}
                  />
                ))}
              </TableWrapper>
            ))}
          </TableWrapper>
        </Table>
      </ScrollView>
      <View style={styles(theme).addContainer}>
        <TouchableOpacity onPress={toggleModal}>
          <View
            style={{
              height: 50,
              width: 50,
              backgroundColor: theme.background,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name={'plus'} color={theme.text2} size={30} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 0,
      //backgroundColor: theme.background,
      backgroundColor :  '#f5f5f5'
    },
    text: {
      textAlign: 'center',
    },
    modalText: {
      fontSize: 18,
      color: theme.text1,
      marginBottom: 3,
      //width: '100%',
    },
    modalBody: {
      alignItems: 'center',
      width: '100%',
      height: '80%',
      justifyContent: 'space-evenly',
    },
    picker: {
      height: '100%',
      width: '35%',
    },
    pickerItem: {
      height: '100%',
    },
    selectDay: {
      alignItems: 'center',
      width: '70%',
      height: '20%',
      //borderWidth:1,
      borderColor: 'white',
    },
    selectTime: {
      alignItems: 'center',
      height: '30%',
      width: '90%',
      /* borderWidth:1,
      borderColor: 'white', */
    },
    timePickerBody: {
      flexDirection: 'row',
      width: '100%',
      height: '90%',
      justifyContent: 'center',
      /* borderWidth:1,
      borderColor: 'white', */
    },
    modalFooter: {
      flexDirection: 'row',
      width: '100%',
      height: '10%',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    addBtn: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnText: {
      color: theme.text1,
      fontSize: 24,
      fontWeight: '600',
      //textAlign: 'center',
    },
    head: {
      backgroundColor: theme.background,
      height: 35,
      //borderWidth:1,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,

      shadowColor: '#171717',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.9,
      shadowRadius: 20,
      elevation: 5,
    },
    row: {
      height: cellHeight,
      //backgroundColor: theme.grey3,
      flexDirection: 'row',
      borderBottomWidth:1,
      borderColor: '#cfcfcf',
    },
    cell: {
      height: cellHeight,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      borderRightWidth: 1,
      borderColor: '#cfcfcf',
      margin: 0,
    },
    btn: {
      width: '92%',
      height: 42,
      backgroundColor: theme.primary,
      borderRadius: 7,
      borderWidth :1,
      alignSelf: 'center',
    },
    addContainer: {
      position: 'absolute',
      backgroundColor: '#00000000',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      /* height: 50,
      width: 50,
      //borderRadius: 25, */
      //backgroundColor: theme.background,
      right: 25,
      bottom: 15,
    },
  });