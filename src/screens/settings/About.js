import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,

} from 'react-native';


import { useTheme } from '../../context/ThemeProvider';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenStackHeaderSearchBarView } from 'react-native-screens';
import { ScrollView } from 'react-native-gesture-handler';

export default function About({navigation}) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
        <View style={styles(theme).topBanner}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name='arrow-back' color={theme.primary} size={30} style={{ marginTop: 3 }} />
          </TouchableOpacity>
          <Text style={[styles(theme).titleText, { color: theme.text2, fontSize: 26 }]}>Meet the Creators</Text>
        </View>

        <View style={styles(theme).section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 15 }}>
            <Text style={styles(theme).headerText}>{'\u25CF'} Kevin Fu</Text>
            <Text style={styles(theme).headerText}>Class of '25</Text>
          </View>

          <View style={{ width: '85%' }}>
            <Text style={[styles(theme).normalText, { marginLeft: 6 }]}>CS and Math Major</Text>

            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('https://github.com/kevinfu1');
                }}
              >
                <Icon name='logo-github' color={theme.primary} size={22} style={{ marginTop: 3 }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('https://www.linkedin.com/in/kevin-fu1/');
                }}
              >
                <Icon name='logo-linkedin' color={theme.primary} size={22} style={{ marginTop: 3 }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('mailto:kevin.fu366@duke.edu');
                }}
              >
                <Icon name='mail-outline' color={theme.primary} size={22} style={{ marginTop: 3 }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('https://www.instagram.com/kevinfu_1/');
                }}
              >
                <Icon name='logo-instagram' color={theme.primary} size={22} style={{ marginTop: 3 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 15 }}>
            <Text style={styles(theme).headerText}>{'\u25CF'} Alvin Hong</Text>
            <Text style={styles(theme).headerText}>Class of '25</Text>
          </View>

          <View style={{ width: '85%' }}>
            <Text style={[styles(theme).normalText, { marginLeft: 6 }]}>ECE and CS Major</Text>

            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('https://github.com/alvin-hong');
                }}
              >
                <Icon name='logo-github' color={theme.primary} size={22} style={{ marginTop: 3 }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('https://www.linkedin.com/in/alvin-hong-2a0763225/');
                }}
              >
                <Icon name='logo-linkedin' color={theme.primary} size={22} style={{ marginTop: 3 }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('mailto:alvin.hong@duke.edu');
                }}
              >
                <Icon name='mail-outline' color={theme.primary} size={22} style={{ marginTop: 3 }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL('https://www.instagram.com/alvin.hong_/');
                }}
              >
                <Icon name='logo-instagram' color={theme.primary} size={22} style={{ marginTop: 3 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ width: '90%', marginTop: 18 }}>
            <Text style={[styles(theme).normalText, { marginBottom: 10 }]}>
              Feel free to email us at <Text style={{ color: theme.quaternary }} onPress={()=>Linking.openURL('mailto:kvilletenting@gmail.com')}>kvilletenting@gmail.com</Text> if you
              have any questions about the project or any other inquiries.
            </Text>
            <Text style={[styles(theme).normalText, { marginBottom: 10 }]}>
              We would love to hear any feedback or suggestions you have for us.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    
    section: {
      width: '100%',
      alignItems: 'center'
    },

    headerText: {
      fontSize: 18,
      color: theme.grey2,
      fontWeight: '600',
      marginBottom: 5,
    },

    normalText:{
      fontSize: 15,
      fontWeight: '400',
      marginBottom: 5,
    }
});
