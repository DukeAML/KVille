import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SplashScreen from 'expo-splash-screen';
import { Snackbar } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { BottomSheetModal } from '../component/BottomSheetModal';
import { ActionSheetModal } from '../component/ActionSheetModal';
import { LoadingIndicator } from '../component/LoadingIndicator';


const dayMapping = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
const timeOfDayMapping = {
  0: 'AM',
  1: 'PM'
};
const minMapping = {
  0: '00',
  1: '30',
}

export default function Availability({ route }) {
  const { groupCode } = route.params;
  //console.log('availability params', route.params);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isSnackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const { theme } = useTheme();

  const { isLoading, isError, error, data, refetch } = useQuery(
    ['shifts', firebase.auth().currentUser.uid, groupCode],
    () => fetchCurrentUserShifts(groupCode)
  );
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  //useRefreshOnFocus(refetch);

  async function fetchCurrentUserShifts(groupCode) {
    await SplashScreen.preventAutoHideAsync();
    let shifts;
    await firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        shifts = doc.data().shifts;
        //console.log('shifts fetched from firebase', shifts);
      });
    let parsedShifts = [];
    for (let i = 0; i < shifts.length; i++) {
      if (shifts[i]) {
        const start = i;
        while (i < shifts.length && shifts[i]) {
          i++;
        }
        const end = i - 1;
        parsedShifts.push({ id: parsedShifts.length, start: start, end: end});
      }
    }
    console.log(parsedShifts);
    return parsedShifts;
  }

  function toggleModal() {
    setModalVisible(!isModalVisible);
  }
  function toggleDeleteModal() {
    setDeleteModalVisible(!isDeleteModalVisible);
  }
  function toggleSnackBar() {
    setSnackVisible(!isSnackVisible);
  }

  const renderShift = ({ item }) => {
    const startDay = Math.floor(item.start / 48);
    const startTime = item.start - 48 * startDay;
    const startTimeOfDay = Math.floor(startTime / 24);
    const startHour = Math.floor((startTime - 24 * startTimeOfDay) / 2) == 0 ? 12 :  Math.floor((startTime - 24 * startTimeOfDay)/2);
    const startMin = startTime % 2;
    // console.log('item start time', item.start);
    // console.log('startDay: ' + startDay + '; startTime: ' +  startTime);

    const endDay = Math.floor(item.end / 48);
    const endTime = item.end - 48 * endDay;
    const endTimeOfDay = Math.floor(endTime / 24);
    const endHour = Math.floor((endTime - 24 * endTimeOfDay) / 2) == 0 ? 12 :  Math.floor((endTime - 24 * endTimeOfDay)/2);
    const endMin = endTime % 2;

    return (
      <TouchableOpacity
        onPress={() => {
          toggleModal();
        }}
      >
        <View
          style={[
            styles(theme).listItem,
            styles(theme).shadowProp,
            { flexDirection: 'column', justifyContent: 'space-between' },
          ]}
        >
          <View style={{ width: '100%' }}>
            <Text style={styles(theme).listText}>{dayMapping[startDay]}</Text>
            <Text style={{ color: theme.text2 }}>
              {startHour} : {minMapping[startMin]} {timeOfDayMapping[startTimeOfDay]}
            </Text>
          </View>
          <View style={{ width: '100%' }}>
            <Text style={styles(theme).listText}>{dayMapping[endDay]}</Text>
            <Text style={{ color: theme.text2 }}>
              {endHour} : {minMapping[endMin]} {timeOfDayMapping[endTimeOfDay]}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    console.error(error);
    return null;
  }

  return (
    <View style={styles(theme).screenContainer} onLayout={onLayoutRootView}>
      <FlatList
        data={data}
        renderItem={renderShift}
        refreshControl={<RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />}
        //ItemSeparatorComponent={() => <Divider />}
        //keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: '#D2D5DC',
      // flexGrow: 1,
      // overflow: 'hidden',
    }, //for the entire page's container
    listItem: {
      //for the items for each group
      backgroundColor: theme.grey3,
      padding: 8,
      marginVertical: 7,
      borderRadius: 10,
      alignSelf: 'center',
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
