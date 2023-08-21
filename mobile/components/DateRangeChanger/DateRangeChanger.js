import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { DateChanger } from './DateChanger';
import { toggleSnackBar, setSnackMessage } from '../../redux/reducers/snackbarSlice';
import { useDispatch} from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';

const defaultValidation = (newStartDate, newEndDate) => {
  if (newEndDate <= newStartDate){
    return {successful: false, message: "End date must be later than the start date"};
  } else {
    return {successful: true, messgae: "Date Range is valid"};
  }
}
const DateRangeChanger = ({startDate: externalStartDate, endDate: externalEndDate, title="Change Date Range", includeHours=true, validateDateRange=defaultValidation, onSuccess =(newStartDate, newEndDate) => {}}) => {

  const {theme} = useTheme();
  const styles = style(theme);
  let [startMonth, setStartMonth] = useState(externalStartDate.getMonth());
  let [startDay, setStartDay] = useState(externalStartDate.getDate());
  let [startHourIndex, setStartHourIndex] = useState(externalStartDate.getHours() + externalStartDate.getMinutes() / 30);
  
  let [endMonth, setEndMonth] = useState(externalEndDate.getMonth());
  let [endDay, setEndDay] = useState(externalEndDate.getDate());
  let [endHourIndex, setEndHourIndex] = useState(externalEndDate.getHours() + externalEndDate.getMinutes() / 30);
  const dispatch = useDispatch();
  


  const handleSubmit = () => {
    // Handle submit logic here
    let newStartDate = new Date(externalStartDate.getFullYear(), startMonth, startDay, Math.floor(startHourIndex / 2), 30 * (startHourIndex % 2));
    let newEndDate = new Date(externalEndDate.getFullYear(), endMonth, endDay, Math.floor(endHourIndex / 2), 30 * (endHourIndex % 2));

    let validation = validateDateRange(newStartDate, newEndDate);
    if (!validation.successful){
        console.log(validation.message);
        dispatch(setSnackMessage(validation.message));
        dispatch(toggleSnackBar());
    } else {
        onSuccess(newStartDate, newEndDate);           
    }
  };

  return (
    <View style={styles.container}>
        <Text style={theme.header2}>{title}</Text>
        <View style={styles.row}>
            <DateChanger title={"Start Time"} monthIndexState={[startMonth, setStartMonth]}
            dayState={[startDay, setStartDay]} hourIndexState={[startHourIndex, setStartHourIndex]} includeHours={includeHours} key={"StartDateChanger"}/>
            <DateChanger title={"End Time"} monthIndexState={[endMonth, setEndMonth]}
            dayState={[endDay, setEndDay]} hourIndexState={[endHourIndex, setEndHourIndex]} includeHours={includeHours} key={"EndDateChanger"}/>
        </View>

        <TouchableOpacity onPress={handleSubmit}>
          <View style={styles.submitButton}> 
            <Text style={styles.submitButtonText}>Submit</Text>
          </View>
        </TouchableOpacity>
    </View>
  );
};

const style = (theme) => StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  warning: {
    fontSize: 16,
    color: 'red'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center'

  },
  submitButton: {
    backgroundColor: '#00539B',
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export {DateRangeChanger};
