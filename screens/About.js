import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,

} from 'react-native';

export default function About({navigation}) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={()=>navigation.navigate('Home')} style={{backgroundColor: '#00f'}}>
        <Text style={{color:'#fff'}}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
