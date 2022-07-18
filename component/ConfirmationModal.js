import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeProvider';

/*Parent Function for Confirmation Modal component

This Modal has little to no customization for uniform look

Parameters: 
    @param {function} toggleModal -- function for toggling the modal
    @param {string ('dark' | 'light')}  userStyle -- background color of modal and text color
    @param {function} buttonAction -- action taken the confirmation button 
        **note: should be a function 
            ex] 
                () = > {
                    function();
                    action2();
                    ...
                }
    @param {string} body -- text prompt for the confirmation
    @param {string} buttonText -- text for confirmation button

props --
    **NOTE: must include normal modal props in the props of the BottomSheetModal such as:
        isVisible={isModalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete = {toggleModal} 
*/
const ConfirmationModal = ({ toggleModal, buttonAction, body, buttonText, userStyle, ...props }) => {
  {
    const { theme } = useTheme();
    return (
      <Modal style={styles(theme).BottomModalView} swipeDirection={['down']} {...props}>
        <View>
          <View style={styles(theme).confirmationPop}>
            <View
              style={{
                height: '60%',
                width: '100%',
                justifyContent: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#cfcfcf',
                padding: 10,
              }}
            >
              <Text style={styles(theme).confirmationText}>{body}</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                buttonAction();
                toggleModal();
              }}
              style={{ height: '40%', width: '100%' }}
            >
              <View style={{ height: '100%', width: '100%', justifyContent: 'center' }}>
                <Text style={[styles(theme).confirmationHeader, { color: theme.error }]}>{buttonText}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => toggleModal()} style={styles(theme).confirmationBottomBtn}>
            <Text style={[styles(theme).confirmationHeader, { color: theme.text1 }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
};

const styles = (theme) =>
  StyleSheet.create({
    BottomModalView: {
      margin: 0,
      //position: 'absolute',
      justifyContent: 'flex-end',
    },
    confirmationPop: {
      width: '95%',
      height: 130,
      backgroundColor: '#565656', //theme.primary,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      borderRadius: 20,
      margin: 15,

      shadowColor: '#171717',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 5,
    },
    confirmationHeader: {
      //style for text of buttons
      fontWeight: '600',
      //color: theme.text1,
      textAlign: 'center',
      fontSize: 23,
    },
    confirmationText: {
      //backgroundColor: '#424242',
      flex: 1,
      flexWrap: 'wrap',
      flexShrink: 1,
      color: theme.text1,
      textAlign: 'center',
      justifyContent: 'center',
      padding: 5,
    },
    confirmationBottomBtn: {
      color: theme.text1,
      backgroundColor: '#565656',
      alignSelf: 'center',
      width: '95%',
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      height: 65,
      marginBottom: 15,
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 5,
    },
  });

export { ConfirmationModal };
