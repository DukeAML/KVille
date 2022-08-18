import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { useTheme } from '../../context/ThemeProvider';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ChangePassword({navigation}) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: theme.background }}>

      <View style={styles(theme).topBanner}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name='arrow-back' color={theme.primary} size={30} style = {{marginTop:3}}/>
        </TouchableOpacity>
        <Text style={[styles(theme).titleText, { color: theme.text2, alignSelf: 'center', fontSize: 26 }]}>
          Change Account Password
        </Text>
      </View>


      <View style={styles(theme).BottomView}>
            <TouchableOpacity
                style = {[styles(theme).bottomBtn, {backgroundColor: theme.grey3}]}
                onPress= {()=>navigation.goBack()}
            >
                <Text style={{fontSize: 16, fontWeight: '500', color: theme.grey1}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style = {[styles(theme).bottomBtn, {backgroundColor: theme.primary}]}
                onPress= {()=>navigation.goBack()}
            >
                <Text style={{fontSize: 16, fontWeight: '500', color: theme.text1}}>Save</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({

    topBanner: {
      //for the top container holding top 'settings' and save button
      flexDirection: 'row',
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 30,
      width: '100%',
      height: 70,
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderColor: theme.popOutBorder,
      paddingHorizontal: 20,
    },

    titleText: {
      //text for different setting headers
      fontSize: 16,
      fontWeight: '600',
      color: theme.grey2,
      marginLeft: 25,
    },

    BottomView: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      position: 'absolute',
      bottom: '2%',
      width: '100%',
      alignItems: 'center',
      //borderWidth: 0.5,
      borderColor: theme.popOutBorder,
    },
    bottomBtn:{
      width: '45%',
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    }
});