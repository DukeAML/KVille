import * as React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Dimensions,} from 'react-native';
import { useTheme } from '../context/ThemeProvider';
import coachkangrymeme from '../assets/coachkangrymeme.jpg'

const window = Dimensions.get('window'); 

export function ErrorPage({navigation}) {

  const ratioImg = window.width*0.8 / 551;
  const { theme } = useTheme();

  return (
    <View style={styles(theme).fill}>
        <View style={{height: '20%', justifyContent: 'center'}}>
            <Text style={styles(theme).infoText}>Sorry, Looks like an error occured.</Text>
            <Text style={styles(theme).infoText}>Please return to the home page</Text>  
        </View>
        <View style = {{width:'100%', height: '50%', justifyContent: 'center'}}>
          <Image
            style={{
              width: window.width*.8,
              height: 448*ratioImg,
              borderRadius: 20,
              alignSelf: 'center',
            }}
            source={coachkangrymeme}
          />
        </View>
        
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
    //justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: theme.backgroundColor,
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
    marginTop: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
});