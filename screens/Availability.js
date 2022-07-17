import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Table,
  TableWrapper,
  Row,
  Col,
  Cell,
} from 'react-native-table-component';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
//import RNPickerSelect from 'react-native-picker-select';
import { Picker } from '@react-native-picker/picker';
import * as SplashScreen from 'expo-splash-screen';
import { Snackbar } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';

const window = Dimensions.get('window');

// prettier-ignore
const agenda = {
  tableHead: ['', 'Sun', 'Mon', 'Tu', 'Wed', 'Th', 'Fri', 'Sat'],
  tableTime: ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM','8 AM', '9 AM', '10 AM', '11 AM', '12 PM',' 1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',],
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

let currIndex;

let availability
// let availabilityUI = new Array(336);
// availabilityUI.fill([true, 0]);

export default function Availability({ route }) {
  const { groupCode } = route.params;
  //console.log('availability params', route.params);

  const [isReady, setIsReady] = useState(false);
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
        queryClient.invalidateQueries([
          'availability',
          firebase.auth().currentUser.uid,
          groupCode,
        ]);
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
      parseInt(selectedDay) * 48 +
      parseInt(startTime.day) +
      parseInt(startTime.minute) +
      parseInt(startTime.hour) * 2;
    let endIdx =
      parseInt(selectedDay) * 48 +
      parseInt(endTime.day) +
      parseInt(endTime.minute) +
      parseInt(endTime.hour) * 2;
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
        queryClient.invalidateQueries([
          'availability',
          firebase.auth().currentUser.uid,
          groupCode,
        ]);
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
      style={[
        styles(theme).btn,
        { height: 40 * parseInt(availability[index][1]) },
      ]}
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
      <Modal
        isVisible={isDeleteModalVisible}
        onBackdropPress={toggleDeleteModal}
        style={styles(theme).deleteModalView}
      >
        <TouchableOpacity onPress={()=>deleteAvailability.mutate()}>
          <View style = {styles(theme).deleteModal}>
            <Icon name={'trash-can-outline'} color={theme.error} size={26} />
            <Text
              style={{ textAlign: 'center', color: theme.error, fontSize: 26, fontWeight: '600', marginLeft: 10}}
            >
              Delete
            </Text>
          </View>
          
        </TouchableOpacity>
      </Modal>

      
      <Modal 
        //MAIN MODAL HERE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        isVisible={isModalVisible} 
        onBackdropPress={toggleModal}
        style={styles(theme).deleteModalView}
        onSwipeComplete={toggleModal}
        swipeDirection={['down']}
      >
        <Snackbar
          visible={isSnackVisible}
          onDismiss={() => setSnackVisible(false)}
          wrapperStyle={{ top: 0 }}
          duration={2000}
        >
          <Text style={{ textAlign: 'center', color: theme.text1 }}>
            {snackMessage}
          </Text>
        </Snackbar>
        <View style={styles(theme).modalContainer}>

          <View style={styles(theme).modalHeader}>
            <View style={styles(theme).modalBar}></View>
            <Text style={styles(theme).headerText}>Add New Busy Time</Text>
          </View>

          <View style={styles(theme).modalBody}>
            <View style={styles(theme).selectDay}>
              <Text  style = {styles(theme).modalText}>Select Day: </Text>
              <Picker
                selectedValue={selectedDay}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedDay(itemValue);
                }}
                style={
                  Platform.OS === 'ios'
                    ? { height: '100%', width: '80%' }
                    : { height: 30, width: '70%' }
                }
                itemStyle={
                  Platform.OS === 'ios' ? styles(theme).pickerItem : {}
                }
              >
                <Picker.Item label='Sunday' value={0} />
                <Picker.Item label='Monday' value={1} />
                <Picker.Item label='Tuesday' value={2} />
                <Picker.Item label='Wednesday' value={3} />
                <Picker.Item label='Thursday' value={4} />
                <Picker.Item label='Friday' value={5} />
                <Picker.Item label='Saturday' value={6} />
              </Picker>
              {/* <RNPickerSelect
                onValueChange={(value) => setSelectedDay(value)}
                placeholder={{ label: 'Select a day...', value: 7 }}
                style={pickerSelectStyles}
                items={[
                  { label: 'Sunday', value: 0 },
                  { label: 'Monday', value: 1 },
                  { label: 'Tuesday', value: 2 },
                  { label: 'Wednesday', value: 3 },
                  { label: 'Thursday', value: 4 },
                  { label: 'Friday', value: 5 },
                  { label: 'Saturday', value: 6 },
                ]}
              /> */}
            </View>
            
            <View style={styles(theme).selectTime}>
              <Text style = {styles(theme).modalText}>Start Time: </Text>
              <View style = {styles(theme).timePickerBody}>
                <Picker
                  selectedValue={startTime.hour}
                  onValueChange={(itemValue, itemIndex) => {
                    setStartTime({ ...startTime, hour: itemValue });
                  }}
                  style={
                    Platform.OS === 'ios'
                      ? styles(theme).picker
                      : { height: 30, width: '30%' }
                  }
                  itemStyle={
                    Platform.OS === 'ios' ? styles(theme).pickerItem : {}
                  }
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
                  style={
                    Platform.OS === 'ios'
                      ? styles(theme).picker
                      : { height: 30, width: '30%' }
                  }
                  itemStyle={
                    Platform.OS === 'ios' ? styles(theme).pickerItem : {}
                  }
                >
                  <Picker.Item label='00' value={0} />
                  <Picker.Item label='30' value={1} />
                </Picker>
                <Picker
                  selectedValue={startTime.day}
                  onValueChange={(itemValue, itemIndex) => {
                    setStartTime({ ...startTime, day: itemValue });
                  }}
                  style={
                    Platform.OS === 'ios'
                      ? styles(theme).picker
                      : { height: 30, width: '30%' }
                  }
                  itemStyle={
                    Platform.OS === 'ios' ? styles(theme).pickerItem : {}
                  }
                >
                  <Picker.Item label='AM' value={0} />
                  <Picker.Item label='PM' value={24} />
                </Picker>
              </View>
              
            </View>
            
            <View style={styles(theme).selectTime}>
              
              <Text style = {styles(theme).modalText}>End Time: </Text>

              <View style = {styles(theme).timePickerBody}>
                <Picker
                  selectedValue={endTime.hour}
                  onValueChange={(itemValue, itemIndex) => {
                    setEndTime({ ...endTime, hour: itemValue });
                  }}
                  style={
                    Platform.OS === 'ios'
                      ? styles(theme).picker
                      : { height: 30, width: '30%' }
                  }
                  itemStyle={
                    Platform.OS === 'ios' ? styles(theme).pickerItem : {}
                  }
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
                  style={
                    Platform.OS === 'ios'
                      ? styles(theme).picker
                      : { height: 30, width: '30%' }
                  }
                  itemStyle={
                    Platform.OS === 'ios' ? styles(theme).pickerItem : {}
                  }
                >
                  <Picker.Item label='00' value={0} />
                  <Picker.Item label='30' value={1} />
                </Picker>
                <Picker
                  selectedValue={endTime.day}
                  onValueChange={(itemValue, itemIndex) => {
                    setEndTime({ ...endTime, day: itemValue });
                  }}
                  style={
                    Platform.OS === 'ios'
                      ? styles(theme).picker
                      : { height: 30, width: '30%'}
                  }
                  itemStyle={
                    Platform.OS === 'ios' ? styles(theme).pickerItem : {}
                  }
                >
                  <Picker.Item label='AM' value={0} />
                  <Picker.Item label='PM' value={24} />
                </Picker>
              </View>
              
            </View>
          </View>

          <View style={styles(theme).modalFooter}>
            <TouchableOpacity
              style={styles(theme).addBtn}
              onPress={toggleModal}
            >
              <Text style={styles(theme).btnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles(theme).addBtn}
              onPress={() => postAvailability.mutate()}
            >
              <Text style={styles(theme).btnText}>Add</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Modal>

      <Table borderStyle={{ borderWidth: 1 }}>
        <Row
          data={agenda.tableHead}
          style={StyleSheet.flatten(styles(theme).head)}
          textStyle={{ textAlign: 'center' }}
        />
      </Table>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Table
          borderStyle={{ borderWidth: 1 }}
          style={{ flexDirection: 'row' }}
        >
          <TableWrapper
            style={StyleSheet.flatten([{ width: dimensions.window.width / 8 }])}
          >
            <Col
              data={agenda.tableTime}
              style={StyleSheet.flatten(styles(theme).time)}
              textStyle={{ textAlign: 'center', marginBottom: 40 }}
            />
          </TableWrapper>

          <TableWrapper style={{ flex: 1 }}>
            {tableData.map((rowData, index) => (
              <TableWrapper
                key={index}
                style={StyleSheet.flatten([
                  styles(theme).row,
                  index % 2 && { backgroundColor: '#F7F6E7' },
                ])}
              >
                {rowData.map((cellData, cellIndex) => (
                  <Cell
                    key={cellIndex}
                    data={
                      data[48 * cellIndex + index][0]
                        ? cellData
                        : element(cellData, 48 * cellIndex + index, data)
                    }
                    //{data[48 * cellIndex + index].toString()}

                    style={StyleSheet.flatten([
                      styles(theme).cell,
                      { width: dimensions.window.width / 8 },
                    ])}
                  />
                ))}
              </TableWrapper>
            ))}
          </TableWrapper>
        </Table>
      </ScrollView>
      <View
        style={[
          styles(theme).addContainer,
          { width: dimensions.window.width / 8 },
        ]}
      >
        <TouchableOpacity onPress={toggleModal}>
          <Icon name={'plus-circle'} color={theme.greyModal} size={50} />
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
    },
    row: {
      height: 40,
      backgroundColor: '#E7E6E1',
      flexDirection: 'row',
    },
    text: {
      textAlign: 'center',
    },
    modalContainer: {
      width: '100%',
      height: '80%',
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      /*borderRadius: 25,
      borderWidth: 1,
      borderStyle: 'solid', */
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'space-around',
      backgroundColor: theme.greyModal,//theme.background,
      //opacity: '95%'
    },

    modalHeader: {
      //borderBottomWidth: 1,
      borderBottomColor: 'white',
      alignItems: 'center',
      width: '100%',
      height: '10%'
    },
    modalBar:{
      height: 4,
      marginTop: 8,
      marginBottom: 8,
      width: '22%',
      borderRadius: 25,
      backgroundColor: 'white', //theme.grey1,
    },
    headerText: {
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 5,
      color: 'white',
    },
    modalText:{
      fontSize: 18,
      color: 'white',
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
      //justifyContent: 'center',
      width: '70%',
      height: '20%',
      borderWidth:1,
      borderColor: 'white',
    },
    selectTime: {
      //flex: 1,
      //flexDirection: 'row',
      //justifyContent: 'center',
      alignItems: 'center',
      height: '30%',
      width: '90%',
      /* borderWidth:1,
      borderColor: 'white', */
    },
    timePickerBody:{
      flexDirection: 'row', 
      width: '100%', 
      height: '90%', 
      justifyContent: 'center', 
      //alignItems: 'center',
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
      //width: '95%',
      //height: '50%',
      //backgroundColor: theme.primary,
      //borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnText: {
      //color: theme.text1,
      color: 'white',
      fontSize: 24,
      fontWeight: '600'
      //textAlign: 'center',
    },
    cell: {
      height: 40,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      margin: 0,
    },
    btn: {
      //margin: 0,
      width: '95%',
      height: 42,
      backgroundColor: theme.primary,
      borderRadius: 5,
      alignSelf: 'center',
    },
    addContainer: {
      position: 'absolute',
      backgroundColor: '#00000000',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      right: 8,
      bottom: 15,
    },
    deleteModalView:{
      margin: 0,
      //position: 'absolute',
      justifyContent: 'flex-end',
    },
    deleteModal: {
      //margin: 0,
      //position: 'absolute',
      //justifyContent: 'flex-end',
      alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.grey4,
      opacity: '100%',
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 5,
      borderRadius: 20,
      width: '90%',
      height: 55,
      bottom: 20,
    },
  });

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
