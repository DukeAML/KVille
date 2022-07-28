import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeProvider';
//import { Divider } from 'react-native-paper';

/**
 * Parent Function for Confirmation Modal component
 * This Modal has little to no customization for uniform look
 * @param {function} toggleModal --  unction for toggling the modal
 * @param {string} userStyle -- options: ('dark' | 'light') background color of modal and text color
 * @param {function} buttonAction -- action taken the confirmation button 
 * @param {string} body -- text prompt for the confirmation
 * @param {string} buttonText -- text for confirmation button
 * 
 * @param {props} props --
    **NOTE: must include normal modal props in the props of the Modal such as:
        isVisible={isModalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete = {toggleModal} 

 * @returns Modal Component
 */
const ConfirmationModal = ({ toggleModal , buttonAction, body, buttonText, userStyle, ...props  }) => {
  {
    const {theme} = useTheme();

    //set up default styles for light and dark themes
    let backgroundColor, opacity, bodyText;
    userStyle == 'light' ? (backgroundColor = '#fff', opacity= '92%', bodyText = 'black') : 
            (backgroundColor= '#565656', opacity = '100%', bodyText = '#fff')

    return (
        <Modal
            style={styles(theme).BottomModalView}
            swipeDirection={['down']}
            backdropTransitionOutTiming={0}
            {...props}
        >
            <View>
                <View style={[styles(theme).confirmationPop, {backgroundColor: backgroundColor, opacity: opacity}]}>
                    <View style = {{height: '60%', width: '100%', justifyContent:'center', borderBottomWidth: 1,
                        borderBottomColor: '#cfcfcf', padding: 10}}>
                        <Text style={[styles(theme).confirmationText, {color: bodyText}]}>
                            {body}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            buttonAction();
                            toggleModal();
                        }}
                        style = {{height: '40%', width: '100%'}}
                    >
                        <View style = {{height: '100%', width: '100%', justifyContent:'center'}}>
                            <Text style={[styles(theme).confirmationHeader, { color: theme.error}]}>
                                {buttonText}
                            </Text>
                        </View>
                        
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress= {()=> toggleModal()}
                    style={[styles(theme).confirmationBottomBtn, {backgroundColor: backgroundColor, opacity: opacity}]}
                >
                    <Text style= {[styles(theme).confirmationHeader, { color: '#1988f8' }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
      </Modal>
    );
  }
};


const styles = (theme) => StyleSheet.create({
    BottomModalView:{ //Modal Style for placing at bottom
        margin: 0,
        justifyContent: 'flex-end',
    },
    confirmationPop: { //Style for top part container
        width: '95%',
        height: 130,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 20,
        margin: 15,

      // shadowColor: '#171717',
      // shadowOffset: { width: 0, height: -5 },
      // shadowOpacity: 0.5,
      // shadowRadius: 20,
      // elevation: 5,
    },
    confirmationHeader: { //style for text of buttons
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 23,
    },
    confirmationText: { //style for prompt text
        textAlign: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    confirmationBottomBtn: { //style for cancel button
        color: theme.text1,
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
