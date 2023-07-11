import React, { useState, useRef } from 'react';
import { Text, View, StyleSheet, SectionList, RefreshControl, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';

import { firestore, auth } from '../../common/services/db/firebase_config';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorPage } from '../components/ErrorPage';
import tentemoji from '../assets/tentemoji.png';

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

export default function Shifts({ navigation }) {
  const groupCode = useSelector((state) => state.user.currGroupCode);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { theme } = useTheme();
  const shifts = useRef();

  const { isLoading, isError, error, data, refetch } = useQuery(
    ['shifts', auth.currentUser.uid, groupCode],
    () => fetchCurrentUserShifts(groupCode),
    { initialData: [], onSuccess: () => setIsReady(true) }
  );
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

  async function fetchCurrentUserShifts(groupCode) {
    //let shifts;
    await firestore
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(auth.currentUser.uid)
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
    return parsedShifts;
  }

  function isEmpty(shifts) {
    for (let i = 0; i < shifts.length; i++) {
      if (shifts[i].data.length != 0) {
        return false;
      }
    }
    return true;
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
        queryClient.setQueryData(['shifts', auth.currentUser.uid, groupCode], data);
      },
    });
  }

  function markComplete(options) {
    const { item, groupCode } = options;

    let newShifts = shifts.current;
    for (let i = item.start; i <= item.end; i++) {
      newShifts[i] = false;
    }
    firestore
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(auth.currentUser.uid)
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
        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', height: '60%' }}>
          <Icon name='clock-outline' color={theme.grey1} size={20} />
          <Text style={styles(theme).timeText}>
            {startHour} : {minMapping[startMin]} {timeOfDayMapping[startTimeOfDay]} - {endHour} : {minMapping[endMin]}{' '}
            {timeOfDayMapping[endTimeOfDay]}
          </Text>
        </View>
        <View style={{ borderTopWidth: 1, width: '100%', height: '40%', justifyContent: 'center' }}>
          <Text style={styles(theme).listText}>{shiftTime}</Text>
        </View>
      </View>
    );
  };

  if (isLoading || !isReady) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage navigation={navigation} />;
  }

  if (isEmpty(data)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '30%',
          backgroundColor: theme.background,
        }}
      >
        <Text>No Shifts have been assigned to you</Text>
        <Image style={{ opacity: 0.5, height: '30%', width: '50%' }} resizeMode='contain' source={tentemoji} />
      </View>
    );
  }

  return (
    <View style={styles(theme).screenContainer}>
      <SectionList
        sections={data}
        keyExtractor={(item, index) => item + index}
        renderItem={RenderShift}
        renderSectionHeader={({ section: { title, data } }) =>
          data.length != 0 ? <Text style={styles(theme).sectionHeader}>{title}</Text> : null
        }
        renderSectionFooter={() => <View style={{ marginBottom: 10 }}></View>}
        refreshControl={<RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.background, //'#D2D5DC',
      //paddingVertical: 15,
    }, //for the entire page's container
    listItem: {
      //for the items for each group
      flexDirection: 'column',
      //justifyContent: 'space-between',
      alignItems: 'start',
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
      fontWeight: '400',
      color: theme.grey1,
    },
    timeText: {
      color: theme.grey1,
      textAlign: 'center',
      marginLeft: 10,
      fontSize: 15,
      fontWeight: '500',
    },
    sectionHeader: {
      fontSize: 24,
      marginLeft: '6%',
      marginTop: 10,
      color: theme.grey1,
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
