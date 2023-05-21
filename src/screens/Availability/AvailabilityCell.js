import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, TouchableOpacity, Touchable } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


//One cell in the Availabilty Table
const AvailabilityCell = forwardRef((props, ref) => {
    const componentRef = useRef(null);
    let correspondingIndex = props.rowColToIndex(props.rowIndex, props.colIndex);
    let inBounds = (correspondingIndex >= 0) && (correspondingIndex < props.availabilityRef.current.length);
    let UNSCROLLEDTLY_NOTSET = -99;

    let [availableHere, setAvailableHere] = useState(props.availableHere);
    let [unscrolledTLY, setUnscrolledTLY] = useState(UNSCROLLEDTLY_NOTSET);
    let unscrolledTLYRef = useRef(UNSCROLLEDTLY_NOTSET);
    
    useImperativeHandle(ref, () => ({
        setAvailableHere(newValue) {
            setAvailableHere(newValue);
        }, getAvailableHere(){
            return availableHere;
        }
    }));
      

   
    const handleLayoutAndUpdateTableMeasurements = () => {
      if (componentRef.current != null){
        componentRef.current.measure((x, y, width, height, pageX, pageY) => {
            if ((props.colIndex == 0) && (props.rowIndex == 0)){
                if (unscrolledTLYRef.current < 0){
                    unscrolledTLYRef.current = pageY;
                }
                props.cellWidthRef.current = width;
                props.cellHeightRef.current = height;
                props.topLeftXRef.current = pageX;
                console.log("unscrolledTLY is " + unscrolledTLYRef.current);
                console.log("pageY of the cell is " + pageY + " and tlY is " + props.topLeftYRef.current);
                if (pageY < unscrolledTLYRef.current){
                    //change in pageY is just due to scrolling, so ignore it
                } else {
                    props.topLeftYRef.current = pageY;
                }
            }
      })};
    };

    if ((props.rowIndex == 0) && (props.colIndex == 0)){

        useEffect(() => {
            const MS_DELAY = 1000;
            const interval = setInterval(() => {
              handleLayoutAndUpdateTableMeasurements();
            }, MS_DELAY);
            return () => clearInterval(interval);
          }, []);
    }


    //should probably get rid of the useEffect below
    useEffect(() => {
        handleLayoutAndUpdateTableMeasurements();
    });

    let color = (inBounds) ? ((availableHere) ? 'green' : 'red') : 'gray';
    let cellStyle = StyleSheet.flatten([cellStyles.Cell, {backgroundColor: color}]);
    return ( 
        <View 
            ref={componentRef} 
            onLayout={handleLayoutAndUpdateTableMeasurements}
            key={props.colIndex}
            style={cellStyle}
        >
        </View>

    );
});

const cellStyles = StyleSheet.create({
    Cell: {
      flex: 1,
      textAlign: 'center',
      paddingHorizontal: 5,
      height: 30,
      borderLeftWidth: 1,
      borderBottomWidth: 1,
      borderColor: 'black',
    }
  });
  
  export { AvailabilityCell,  cellStyles};
  