import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions} from 'react-native';
import {useQuery} from 'react-query';
import { useSelector } from 'react-redux';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { AvailabilityCell, cellStyles } from './AvailabilityCell';
import { TimeColumn } from '../../components/TimeColumn';
import { setDBAvailability, fetchAvailability } from '../../services/db_services';
import { getNumDaysBetweenDates, getNumSlotsBetweenDates, getDayAbbreviation } from '../../services/dates_services';
import { LoadingIndicator } from '../../components/LoadingIndicator';




/**
 * Get the day abbreviations for each day in the schedule
 * @param {Date} startDate
 * @param {int} numTimeSlots
 * @returns {Array<String>} something like ["Mon. 1/15", "Tue. 1/16", "Wed. 1/17"]
 */
const getColumnTitles = (startDate, endDate) =>{
    let numDays = getNumDaysBetweenDates(startDate, endDate);

    let titles= [];
    for (let i = 0; i < numDays; i++){
        let newDate = new Date(startDate.getTime() + i*24*60*60*1000);
        titles.push(getDayAbbreviation(newDate));
    }
    return titles;
}

//this component is the entire table in the Availability page
const AvailabilityTable = forwardRef((props, ref) => {
  console.log("rendering Availability table");
  let availabilityRef = useRef([...props.originalAvailability]);
  availabilityRef.current = [...props.originalAvailability];
  //const { isLoading, data: originalAvailability, refetch: refetchAvailability } = useQuery(['getAvailability', groupCode, userId], () => fetchAvailability(groupCode, userId));
  //let availabilityRef = useRef([originalAvailability]);
  //availabilityRef.current = [originalAvailability];
  //the useEffect below is a hack that patches up an issue I (Keith) had when changing the date range, probably due to an issue with the cellRefs thing
  useEffect(() => {

    for (let i = getNumSlotsBetweenDates(displayStartDateRef.current, availabilityRef.current[0].startDate); i < cellRefs.current.length; i+= 1){
      try{
        cellRefs.current[i].setAvailableHere(availabilityRef.current[i].available);
        cellRefs.current[i].setAvailableHere(availabilityRef.current[i].available);

      } catch (error) {

      }
    }
  });
  useImperativeHandle(ref, () => ({
    getAvailability() {
        return [...availabilityRef.current];

    }
   }));

  let displayStartDateRef = useRef(props.displayStartDate);
  displayStartDateRef.current = props.displayStartDate;
  let topLeftXRef = useRef(0);
  let topLeftYRef = useRef(0);

  let columns = getColumnTitles(displayStartDateRef.current, props.endDate);
  let rows = new Array(48).fill(new Array(columns.length).fill(''));

  let cellRefs = useRef([]);
  cellRefs.current = [];

  const windowDimensions = Dimensions.get('window');
  const nRows = rows.length;
  const nCols = columns.length;
  let nColsRef = useRef(null);
  nColsRef.current = nCols;

  let cellWidthRef = useRef(windowDimensions.width / columns.length);
  let cellHeightRef = useRef(cellStyles.Cell.height);
  cellWidthRef.current = windowDimensions.width / columns.length;


  //const { mutate: mutateDBAvailability } = useSetDBAvailability();

  let yToRow = (y) => {
    let dy = y - topLeftYRef.current;
    return Math.floor(dy / (cellHeightRef.current));
  }

  let xToCol = (x) => {
    let dx = x - topLeftXRef.current;
    return Math.floor(dx / (cellWidthRef.current));
  }
  let xyToIndex = (x, y) => {
    let row = yToRow(y);
    let col = xToCol(x);
    return rowColToIndex(row, col);
  }

  let rowColToIndex = (row, col) => {

    let indexOffset = getNumSlotsBetweenDates(availabilityRef.current[0].startDate, displayStartDateRef.current);

    let index = col * nRows + row;
    index = index + indexOffset;
    return index;
  }

  function changeAvailability(index, newValue){
    if ((index >= 0) && (index < availabilityRef.current.length)){
        //need to check if cell refs is defined and non-null
        
        cellRefs.current[index].setAvailableHere(newValue);
        availabilityRef.current[index].available = newValue;
    }
  }

  const startRowIndexRef = useRef(null);
  const startColIndexRef = useRef(null);
  const previousRowIndexRef = useRef(null);
  const previousColIndexRef = useRef(null);
  const newValueRef = useRef(null);
  //panResponder is used to track events related to finger/mouse dragging as the user drags over the table to change availability
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let x = gestureState.x0 + gestureState.dx;
        let y = gestureState.y0 + gestureState.dy;
        let row = yToRow(y);
        let col = xToCol(x);
        let index = rowColToIndex(x, y);


        if (row != previousRowIndexRef.current){
            //dragged vertically
            let rowMovedCloser = Math.abs(row - startRowIndexRef.current) < Math.abs(previousRowIndexRef.current - startRowIndexRef.current);
            let newValue = newValueRef.current;
            let rowToChange = row;
            if (rowMovedCloser){
                newValue = !newValueRef.current;
                rowToChange = previousRowIndexRef.current;
            }
            for (let i = Math.min(startColIndexRef.current, col); i <= Math.max(startColIndexRef.current, col); i += 1){               
                let indexToChange = rowColToIndex(rowToChange, i);
                changeAvailability(indexToChange, newValue);
            }



        }
        if (col != previousColIndexRef.current){
            let colMovedCloser = Math.abs(col - startColIndexRef.current) < Math.abs(previousColIndexRef.current - startColIndexRef.current);
            let newValue = newValueRef.current;
            let colToChange = col;
            if (colMovedCloser){
                newValue = !newValueRef.current;
                colToChange = previousColIndexRef.current;
            }
            for (let i = Math.min(startRowIndexRef.current, row); i <= Math.max(startRowIndexRef.current, row); i += 1){                
                let indexToChange = rowColToIndex(i, colToChange);
                changeAvailability(indexToChange, newValue);
            }

        }
        previousRowIndexRef.current = yToRow(y);
        previousColIndexRef.current = xToCol(x);
      },
      onPanResponderGrant: (evt, gestureState) =>{
        //start of a dragging/press motion
        console.log("pan responder grant at (x, y) " + gestureState.x0 + ", " + gestureState.y0);
        let row = yToRow(gestureState.y0);
        let col = xToCol(gestureState.x0);
        startRowIndexRef.current = row;
        previousRowIndexRef.current = row;
        startColIndexRef.current = col;
        previousColIndexRef.current = col;
        let index = rowColToIndex(row, col);
        if (index >= 0 && index < availabilityRef.current.length){
            newValueRef.current = !(availabilityRef.current[index].available);
        }
        changeAvailability(index, newValueRef.current);
      },
      onPanResponderRelease: (evt, gestureState) => {
        startRowIndexRef.current = null;
        previousRowIndexRef.current = null;
        setDBAvailability(props.groupCode, firebase.auth().currentUser.uid, availabilityRef.current);
      }
    })
  ).current;



  return (
    <View style={styles.table}>
        <TimeColumn cellHeight={30} borderWidth={1} includeTopRow={true}/>
        <View style={styles.tableWithoutColLabel}>
          <View style={styles.headerRow}>
              {columns.map((column, index) => (

              <Text key={index} style={styles.headerCell}>
                  {column}
              </Text>
              ))}
          </View>
          <View {...(panResponder.panHandlers)}>
              {rows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.dataRow}>
                  {row.map((cell, colIndex) => {

                      let index = rowColToIndex(rowIndex, colIndex);
                      let availableHere = false;
                      if ((index >= 0) && (index < availabilityRef.current.length)){
                          availableHere = availabilityRef.current[index].available;
                      }
                      return (
                      <AvailabilityCell
                      colIndex={colIndex}
                      rowIndex={rowIndex}
                      cellData={cell}
                      availableHere={availableHere}
                      key={colIndex * nRows + rowIndex}
                      ref={r => {cellRefs.current[index] = r}}
                      availabilityRef={availabilityRef}
                      topLeftXRef={topLeftXRef}
                      topLeftYRef={topLeftYRef}
                      cellWidthRef={cellWidthRef}
                      cellHeightRef={cellHeightRef}
                      rowColToIndex={rowColToIndex}
                      />
                      )
                  })}
                  </View>
          ))}
          </View>
        </View>
    </View>

  );
});

const styles = StyleSheet.create({
  table: {
    marginVertical: 10,
    width: '80%',
    flex: 1,
    flexDirection: 'row'
  },
  tableWithoutColLabel: {
    width: '100%'
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
  dataRow: {
    flexDirection: 'row',
    borderColor: '#000',
    paddingVertical: 0,

  },
  availabilityColumn: {
    flex: 1,
    flexDirection: 'column'
  }
});

export { AvailabilityTable};