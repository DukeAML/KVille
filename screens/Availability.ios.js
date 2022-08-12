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
import { Snackbar, Divider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { BottomSheetModal } from '../components/BottomSheetModal';
import { ActionSheetModal } from '../components/ActionSheetModal';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorPage } from '../components/ErrorPage';

const window = Dimensions.get('window');

// prettier-ignore
const agenda = {
  tableHead: ['', 'Sun', 'Mon', 'Tu', 'Wed', 'Th', 'Fri', 'Sat'],
  tableTime: [ ' 1 am', ' 2 am', ' 3 am', ' 4 am', ' 5 am', ' 6 am', ' 7 am',' 8 am', ' 9 am', '10 am', '11 am', 
  '12 pm',' 1 pm', ' 2 pm', ' 3 pm', ' 4 pm', ' 5 pm', ' 6 pm', ' 7 pm', ' 8 pm', ' 9 pm', '10 pm', '11 pm',],
};

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

export default function Availability({navigation}) {
  const groupCode = useSelector((state) => state.user.currGroupCode);

  const [dimensions, setDimensions] = useState({ window });
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [startTime, setStartTime] = useState(new Date(Date.now()));
  const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000));
  const [isDisabled, setIsDisabled] = useState(false);
  
  const { theme } = useTheme();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  const { isLoading, isError, error, data, refetch } = useQuery(
    ['availability', firebase.auth().currentUser.uid, groupCode],
    () => fetchAvailability(groupCode)
  );
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

  async function fetchAvailability(groupCode) {
    //await SplashScreen.preventAutoHideAsync();

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
        //console.log('availability fetched from firebase', availability);
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
    let startIdx =
      parseInt(selectedDay) * 48 + Math.floor(startTime.getMinutes()/30) + startTime.getHours() * 2;
    let endIdx =
      parseInt(selectedDay) * 48 + Math.floor(endTime.getMinutes()/30) + endTime.getHours() * 2;
    console.log(startIdx)
    if (endIdx == parseInt(selectedDay) * 48) {
      endIdx += 48;
    }
    if (startIdx >= endIdx) {
      return;
    }
    for (let i = startIdx; i < endIdx; i++) {
      availability[i] = false;
    }
    toggleModal();
    memberRef.update({
      availability: availability,
    }).catch((error)=>console.error(error));
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

  function toggleModal() {
    setModalVisible(!isModalVisible);
  }
  function toggleDeleteModal() {
    setDeleteModalVisible(!isDeleteModalVisible);
  }

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

  function onStartChange(event, selectedDate) {
    //setShow(false);
    if (selectedDate.getTime() >= endTime.getTime()) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
    setStartTime(selectedDate);
  }
  function onEndChange(event, selectedDate) {
    if (selectedDate.getTime() <= startTime.getTime()) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
    setEndTime(selectedDate);
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage navigation={navigation} />;
  }

  return (
    <View style={styles(theme).container}>
      <Table borderStyle={{ borderColor: 'transparent' }}>
        <Row
          data={agenda.tableHead}
          style={StyleSheet.flatten(styles(theme).head)}
          widthArr={[
            dimensions.window.width / 12,
            dimensions.window.width * (11 / 84),
            dimensions.window.width * (11 / 84),
            dimensions.window.width * (11 / 84),
            dimensions.window.width * (11 / 84),
            dimensions.window.width * (11 / 84),
            dimensions.window.width * (11 / 84),
            dimensions.window.width * (11 / 84),
          ]}
          textStyle={{ textAlign: 'center', fontWeight: '700' }}
        />
      </Table>

      <ScrollView
        showsVerticalScrollIndicator={false}
        //onScroll = {onScroll}
        //scrollEventThrottle = {16}
        refreshControl={<RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />}
      >
        <Table borderStyle={{ borderWidth: 0, borderColor: 'transparent' }} style={{ flexDirection: 'row' }}>
          <TableWrapper
            style={StyleSheet.flatten([
              { width: dimensions.window.width / 12, marginTop: 34, alignItems: 'center' /* , borderWidth:1 */ },
            ])}
          >
            <Col
              data={agenda.tableTime}
              heightArr={new Array(23).fill(cellHeight * 2)}
              textStyle={{
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 10,
                width: '70%',
                color: '#717573',
                marginLeft: 2,
              }}
            />
          </TableWrapper>

          <TableWrapper style={{ flex: 1 }}>
            {tableData.map((rowData, index) => (
              <TableWrapper key={index} style={StyleSheet.flatten(styles(theme).row)}>
                {rowData.map((cellData, cellIndex) => (
                  <Cell
                    key={cellIndex}
                    data={data[48 * cellIndex + index][0] ? cellData : element(cellData, 48 * cellIndex + index, data)}
                    //{data[48 * cellIndex + index].toString()}

                    style={StyleSheet.flatten([styles(theme).cell, { width: dimensions.window.width * (11 / 84) }])}
                  />
                ))}
              </TableWrapper>
            ))}
          </TableWrapper>
        </Table>
      </ScrollView>

      <View style={styles(theme).addContainer}>
        <TouchableOpacity onPress={toggleModal}>
          <View style={styles(theme).FAB}>
            <Icon name={'plus'} color={theme.text2} size={30} />
          </View>
        </TouchableOpacity>
      </View>

      <ActionSheetModal
        isVisible={isDeleteModalVisible}
        onBackdropPress={toggleDeleteModal}
        height={55}
        userStyle='light'
      >
        <TouchableOpacity
          onPress={() => deleteAvailability.mutate()}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            borderRadius: 20,
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
        swipeDown={false}
        barSize={'none'}
        height='90%'
        userStyle='light'
      >
        <View style={styles(theme).modalBanner}>
          <TouchableOpacity style={styles(theme).addBtn} onPress={toggleModal}>
            <Text style={styles(theme).btnText}>Cancel</Text>
          </TouchableOpacity>
          <BottomSheetModal.Header fontSize={20} verticalMargin={0}>
            New Time
          </BottomSheetModal.Header>
          <TouchableOpacity
            style={[styles(theme).addBtn, { alignItems: 'flex-end' }]}
            onPress={() => postAvailability.mutate()}
            disabled={isDisabled}
          >
            <Text style={[styles(theme).btnText, {color: isDisabled ? '#00000050': theme.primary}]}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles(theme).modalBody}>
          <View style={styles(theme).selectDay}>
            <Text style={styles(theme).modalText}>Day</Text>

            <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
              <Picker
                selectedValue={selectedDay}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedDay(itemValue);
                }}
                style={
                  Platform.OS === 'ios'
                    ? { height: '100%', width: '100%' }
                    : { height: 30, width: '70%', marginTop: 20 }
                }
                itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
              >
                <Picker.Item label='Sunday' value={0} />
                <Picker.Item label='Monday' value={1} />
                <Picker.Item label='Tuesday' value={2} />
                <Picker.Item label='Wednesday' value={3} />
                <Picker.Item label='Thursday' value={4} />
                <Picker.Item label='Friday' value={5} />
                <Picker.Item label='Saturday' value={6} />
              </Picker>
            </View>
          </View>
          <View style={styles(theme).selectTime}>
            <Text style={styles(theme).modalText}>Starts</Text>
            <DateTimePicker
              value={startTime}
              mode='time'
              onChange={onStartChange}
              display='compact'
              minuteInterval={30}
              style={{ width: '50%', justifyContent: 'center', alignItems: 'center' }}
            />
          </View>
          <View style={styles(theme).selectTime}>
            <Text style={styles(theme).modalText}>Ends</Text>
            <DateTimePicker
              value={endTime}
              mode='time'
              onChange={onEndChange}
              display='compact'
              minuteInterval={30}
              style={{ width: '50%', justifyContent: 'center', alignItems: 'center' }}
            />
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 0,
      backgroundColor: theme.background,
    },
    text: {
      textAlign: 'center',
    },
    modalText: {
      fontSize: 18,
      color: theme.text2,
      textAlign: 'center',
      padding: 0,
    },
    modalBanner: {
      height: '8%',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      borderBottomWidth: 0.5,
      borderColor: theme.popOutBorder,
    },
    modalBody: {
      alignItems: 'center',
      width: '90%',
      height: '90%',
      marginTop: 10,
      borderRadius: 15,
      backgroundColor: '#fff',
      justifyContent: 'space-evenly',
      //borderWidth:1,
    },
    pickerItem: {
      height: '100%',
    },
    selectDay: {
      alignItems: 'center',
      width: '80%',
      height: '30%',
      //borderWidth:1,
    },
    selectTime: {
      flexDirection: 'row',
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalFooter: {
      flexDirection: 'row',
      width: '100%',
      height: '10%',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    addBtn: {
      justifyContent: 'center',
      width: '20%',
      height: '60%',
      borderRadius: 15,
    },
    btnText: {
      color: theme.primary,
      fontSize: 18,
      fontWeight: '600',
    },
    head: {
      backgroundColor: theme.background,
      height: 35,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.9,
      shadowRadius: 10,
      elevation: 3,
      overflow: 'visible',
    },
    row: {
      height: cellHeight,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: '#cfcfcf',
      //borderColor: '#a7aebe',
    },
    cell: {
      height: cellHeight,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      borderRightWidth: 1,
      borderColor: '#cfcfcf',
      //borderColor: '#a7aebe',
      margin: 0,
    },
    btn: {
      width: '92%',
      height: 42,
      backgroundColor: theme.primary,
      borderRadius: 7,
      borderWidth: 1,
      alignSelf: 'center',
    },
    addContainer: {
      position: 'absolute',
      backgroundColor: '#00000000',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      right: 25,
      bottom: 20,
    },
    FAB: {
      height: 50,
      width: 50,
      backgroundColor: '#D2D5DC',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
