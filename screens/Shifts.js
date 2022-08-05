import React, { useState, useRef, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SectionList, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SplashScreen from 'expo-splash-screen';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorPage } from '../components/ErrorPage';


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
  1: 'PM',
};
const minMapping = {
  0: '00',
  1: '30',
};
const colorMapping = {
  'Morning Shift': '#FDF1DB',
  'Afternoon Shift': '#FCEBE5',
  'Night Shift': '#E5DBFF',
};

export default function Shifts() {
  const groupCode = useSelector((state) => state.user.currGroupCode);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const { theme } = useTheme();
  const shifts = useRef();

  const { isLoading, isError, error, data, refetch } = useQuery(
    ['shifts', firebase.auth().currentUser.uid, groupCode],
    () => fetchCurrentUserShifts(groupCode),
    { initialData: [] }
  );
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  //useRefreshOnFocus(refetch);

  async function fetchCurrentUserShifts(groupCode) {
    await SplashScreen.preventAutoHideAsync();
    //let shifts;
    await firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        shifts.current = doc.data().shifts;
        //console.log('shifts fetched from firebase', shifts);
      });
    let parsedShifts = [
      {
        title: 'Sunday',
        data: [],
      },
      {
        title: 'Monday',
        data: [],
      },
      {
        title: 'Tuesday',
        data: [],
      },
      {
        title: 'Wednesday',
        data: [],
      },
      {
        title: 'Thursday',
        data: [],
      },
      {
        title: 'Friday',
        data: [],
      },
      {
        title: 'Saturday',
        data: [],
      },
    ];
    for (let i = 0; i < shifts.current.length; i++) {
      if (shifts.current[i]) {
        const start = i;
        const startDay = Math.floor(start / 48);

        while (i < shifts.current.length && shifts.current[i]) {
          i++;
        }
        const end = i - 1;
        parsedShifts[startDay].data.push({ start: start, end: end });
      }
    }
    //console.log(parsedShifts);
    return parsedShifts;
  }

  const postShiftUpdate = useShiftUpdate(groupCode);

  function useShiftUpdate(groupCode) {
    const queryClient = useQueryClient();
    return useMutation((options) => markComplete(options), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: (data) => {
        //console.log('new shift', newParsedShifts.current);
        queryClient.setQueryData(['shifts', firebase.auth().currentUser.uid, groupCode], data);
      },
    });
  }

  function markComplete(options) {
    const { item, groupCode } = options;

    let newShifts = shifts.current;
    for (let i = item.start; i <= item.end; i++) {
      newShifts[i] = false;
    }
    firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(firebase.auth().currentUser.uid)
      .update({
        shifts: newShifts,
      });

    let parsedShifts = data;
    parsedShifts.splice(item.id, 1);

    return parsedShifts;
  }

  function toggleModal() {
    setModalVisible(!isModalVisible);
  }
  function toggleDeleteModal() {
    setDeleteModalVisible(!isDeleteModalVisible);
  }

  const RenderShift = ({ item }) => {
    const startDay = Math.floor(item.start / 48);
    const startTime = item.start - 48 * startDay;
    const startTimeOfDay = Math.floor(startTime / 24);
    const startHour =
      Math.floor((startTime - 24 * startTimeOfDay) / 2) == 0 ? 12 : Math.floor((startTime - 24 * startTimeOfDay) / 2);
    const startMin = startTime % 2;
    // console.log('item start time', item.start);
    // console.log('startDay: ' + startDay + '; startTime: ' +  startTime);

    const endDay = Math.floor(item.end / 48);
    const endTime = item.end - 48 * endDay;
    const endTimeOfDay = Math.floor(endTime / 24);
    const endHour =
      Math.floor((endTime - 24 * endTimeOfDay) / 2) == 0 ? 12 : Math.floor((endTime - 24 * endTimeOfDay) / 2);
    const endMin = endTime % 2;

    const shiftTime =
      startHour > 6 && startTimeOfDay == 0
        ? 'Morning Shift'
        : startHour > 0 && startHour <= 5 && startTimeOfDay == 1
        ? 'Afternoon Shift'
        : 'Night Shift';
    //const sameDay = dayMapping[startDay] != dayMapping[endDay];

    return (
      <View style={[styles(theme).listItem, styles(theme).shadowProp, { backgroundColor: colorMapping[shiftTime] }]}>
        <View style={{ borderBottomWidth: 1, width: '100%', height: '60%' }}>
          <Text style={styles(theme).listText}>{shiftTime}</Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 10 }}>
          <Icon name='clock-outline' color={theme.icon2} size={20} />
          <Text style={{ color: theme.text2, textAlign: 'center', marginLeft: 10 }}>
            {startHour} : {minMapping[startMin]} {timeOfDayMapping[startTimeOfDay]} - {endHour} : {minMapping[endMin]}{' '}
            {timeOfDayMapping[endTimeOfDay]}
          </Text>
        </View>
      </View>
    );
  };

  const EmptyComponent = () => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 30, fontWeight: '700' }}> Create Group Schedule First</Text>
      </View>
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
    return <ErrorPage navigation={navigation}/>;
  }

  return (
    <View style={styles(theme).screenContainer} onLayout={onLayoutRootView}>
      <SectionList
        sections={data}
        keyExtractor={(item, index) => item + index}
        renderItem={RenderShift}
        renderSectionHeader={({ section: { title, data } }) =>
          data.length != 0 ? <Text style={styles(theme).sectionHeader}>{title}</Text> : null
        }
        refreshControl={<RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        //ListEmptyComponent={<EmptyComponent />}
      />
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.background, //'#D2D5DC',
      paddingVertical: 15,
      // flexGrow: 1,
      // overflow: 'hidden',
    }, //for the entire page's container
    listItem: {
      //for the items for each group
      flexDirection: 'column',
      //justifyContent: 'space-between',
      alignItems: 'start',
      backgroundColor: theme.grey3,
      padding: 8,
      marginVertical: 7,
      borderRadius: 10,
      alignSelf: 'center',
      width: '90%',
      height: 90,
    },
    listText: {
      //for the text inside the group cards
      fontSize: 15,
      fontWeight: '500',
      color: theme.text2,
    },
    sectionHeader: {
      fontSize: 24,
      marginLeft: '6%',
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
