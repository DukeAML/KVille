import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeProvider';


export function ErrorPage({navigation}) {

  const { theme } = useTheme();

  return (
    <View style={styles(theme).fill}>
        <View>
            <Text style={styles(theme).infoText}>Sorry, Looks like an error occured.</Text>
            <Text style={styles(theme).infoText}>Please return to the home page</Text>  
        </View>
        <Text>Insert meme</Text>
        <TouchableOpacity
            style ={styles(theme).returnBtn}
            onPress = {()=> navigation.navigate('Home')}
        >
            <Text style={{color:'white', fontSize: 25, fontWeight: '700'}}>Return Home</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = (theme) =>
StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  infoText:{
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 6,
  },
  returnBtn: {
    backgroundColor: theme.primary,
    width: '90%',
    height: '7%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
});