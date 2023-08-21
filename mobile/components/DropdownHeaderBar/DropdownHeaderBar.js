import React, { useState } from 'react';
import { View, StyleSheet, Text, Picker, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeProvider';



const DropdownHeaderBar = ({labels, components}) => {
  const DEFAULT = -1;
  let [dropdownState, setDropdownState] = useState(DEFAULT);
  const theme = useTheme();

  const onLabelPress = (labelIndex) => {
    if (labelIndex == dropdownState){
      setDropdownState(DEFAULT);
    } else {
      setDropdownState(labelIndex);
    }
  }
  return (
  <View >
    <View style={styles(theme).buttonContainer}>
      {labels.map((label, labelIndex) => {
        return (
        <TouchableOpacity key={"DropdownOption"+labelIndex} onPress={() => {onLabelPress(labelIndex)}} style={styles(theme).button}>
          <Text style={styles(theme).buttonText}>{label}</Text>
        </TouchableOpacity>
        );
      })}

    </View>
    {dropdownState != DEFAULT ? components[dropdownState] : <></>}
  </View>
  );

}

const styles = (theme) =>
  StyleSheet.create({



    buttonContainer: {
      //container for the top buttons
      flexDirection: 'row',
      justifyContent: 'center',
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
      backgroundColor: theme.primaryContainer,
    },
    button: {
      //for the day buttons at top of screen
      backgroundColor: theme.grey3,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 20
    },
    buttonText: {
      //text for day buttons
      fontSize: 'auto',
      fontWeight: '500',
      textAlign: 'center',
      color: 'black',
    },



  });


export {DropdownHeaderBar};