import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useQuery } from 'react-query';
import { View, Text, StyleSheet, PanResponder, Dimensions, TouchableOpacity, Touchable } from 'react-native';

import { auth } from '../../../common/services/db/firebase_config';
import { useSelector} from 'react-redux';
import { DateRangeChanger } from '../../components/DateRangeChanger/DateRangeChanger';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { AvailabilityTable } from './AvailabilityTable';
import { fetchAvailability } from '../../../common/services/db_services';

import { DropdownHeaderBar } from '../../components/DropdownHeaderBar/DropdownHeaderBar';
import { useTheme } from '../../context/ThemeProvider';
const Helpers = require("../../../common/Scheduling/helpers");

const getInitialStartDate = (tentType) => {
    //TODO: use context to get tentType and specify the start date more closely
    //use current day, if in tenting range. Else, use first day of tenting
    const currDate = new Date(Date.now());
    let startDateNow = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDay(), 0, 0);
    let firstDay = Helpers.getTentingStartDate(tentType);
    let endDay = Helpers.getTentingEndDate();
    if ((startDateNow > firstDay) && (startDateNow < endDay)){
        return startDateNow;
    } else {
        return firstDay;
    }


}

const getInitialEndDate = (tentType) => {
    let startDate = getInitialStartDate(tentType);
    let tentingEndDate = Helpers.getTentingEndDate();
    let startDatePlusWeek = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (startDatePlusWeek < tentingEndDate){
        return startDatePlusWeek;
    } else {
        return tentingEndDate;
    }
}

//the main parent component on the Availability page
const AvailabilityScreen = () => {
    const groupCode = useSelector((state) => state.user.currGroupCode);
    const tentType = useSelector((state) => state.user.currTentType);

    const {theme} = useTheme();

    let [startDate, setStartDate] = useState(getInitialStartDate(tentType));
    let [endDate, setEndDate] = useState(getInitialEndDate(tentType));
    const tableRef = useRef(null);
    let userId = auth.currentUser.uid;
    const { isLoading, data: availability, refetch: refetchAvailability } = useQuery(['getAvailability', groupCode, userId], () => fetchAvailability(groupCode, userId));

    if (isLoading){
        return <LoadingIndicator/>;
    }
    return (
        <View style={{backgroundColor: theme.background}}>
            <View>
                <Text style={theme.header1}>Adjust your availability</Text>
                <DropdownHeaderBar labels={["Change Date Range"]} components={[<DateRangeChanger startDate={startDate} endDate={endDate} includeHours={false} onSuccess={(newStart, newEnd) => {
                    setStartDate(newStart);
                    setEndDate(newEnd);
                    }}/>]} 
                />
                <AvailabilityTable originalAvailability={availability} displayStartDate={startDate} groupCode={groupCode} ref={tableRef} endDate={endDate}/>
            </View>
        </View>

    );

}


const styles = StyleSheet.create({

  outermostView: {
    
  }
});

export default AvailabilityScreen;