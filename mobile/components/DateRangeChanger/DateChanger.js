import React, { useState } from 'react';
import { View, StyleSheet, Text, Picker } from 'react-native';

const monthLabels = ['Jan.', 'Feb.', 'Mar.'];

const dayLabels = [];
for (var i = 1; i < 32; i+=1)
    dayLabels.push(i.toString());

const hourLabels = [];
for (var i = 0; i < 48; i += 1){
    var hour = (Math.floor(i/2) % 12);
    if (hour == 0){
        hour = 12;
    }
    var label = (hour).toString();
    if (i % 2 == 0){
        label += ":00";
    }else{
        label += ":30";
    }
    if (i >= 24){
        label = label + "pm";
    } else {
        label = label + "am";
    }
    hourLabels.push(label);
}


/**
 * this component represents one set of inputs for month, day, hour to change the start or end time for the availability
 * @param {State} monthIndexState represents an int from 0 to 11
 * @param {State} dayState represents a day from 1 to 31
 * @param {State} hourIndexState ranges from 0 to 47, representing a 30 minute chunk
 * @param {String} title denotes whether this component is for changing the start date or the end date
 * @param {boolean} includeHours should be true if you want to select hours, false if only want to select year/month/day
 * @returns 
 */
const DateChanger = ({monthIndexState, dayState, hourIndexState, title, includeHours=true } ) => {
 const [monthIndex, setMonthIndex] = monthIndexState;
 const [day, setDay] = dayState;
 const [hourIndex, setHourIndex] = hourIndexState;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.column}>
        <View style={styles.row}>
          <Text style={styles.label}>Month:</Text>
          <Picker
            style={styles.dropdown}
            selectedValue={monthIndex}
            onValueChange={(itemValue) => {
                setMonthIndex(itemValue)}
            }
            key={"Picker1"}
          >
            {monthLabels.map((month, monthIndex) => {
            return (<Picker.Item label={month} value={monthIndex} key={"monthItem"+monthIndex}/>);
            })}
          </Picker>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Day:</Text>
          <Picker
            style={styles.dropdown}
            selectedValue={day}
            onValueChange={(itemValue) => setDay(itemValue)}
            key={"Picker2"}
          >
            {dayLabels.map((dayLabel, dayIndex) => {
                return (<Picker.Item label={dayLabel} value = {dayIndex + 1} key={"dayItem"+dayIndex}/>);
            })}
          </Picker>
        </View>
        {includeHours &&
          <View style={styles.row}>
            <Text style={styles.label}>Hour:</Text>
            <Picker
              style={styles.dropdown}
              selectedValue={hourIndex}
              onValueChange={(itemValue) => setHourIndex(itemValue)}
              key={"Picker3"}
            >

              {hourLabels.map((hourLabel, hourIndex) => {
                  return (<Picker.Item label={hourLabel} value={hourIndex} key={"hourItem"+hourIndex}/>);
              })}
            </Picker>
          </View>
        }
      </View>

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  column: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  dropdown: {
    width: 100,
  }
});

export { DateChanger };
