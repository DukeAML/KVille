import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeProvider';


const ConfirmationModal = ({ toggleModal , buttonAction, body, buttonText, backgroundColor, ...props  }) => {
  {
    const {theme} = useTheme();
    return (
        <Modal
            style={styles(theme).BottomModalView}
            swipeDirection={['down']}
            {...props}
        >
            <View>
            <View style={styles(theme).confirmationPop}>
            <View style = {{height: '60%', width: '100%', justifyContent:'center', borderBottomWidth: 1,
                borderBottomColor: 'white', padding: 10}}>
                <Text style={styles(theme).confirmationText}>
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
                    <Text 
                    style={[
                        styles(theme).confirmationHeader, 
                        { color: theme.error, }
                    ]}>
                    {buttonText}
                    </Text>
                </View>
                
            </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress= {()=> toggleModal()}
                style={styles(theme).confirmationBottomBtn}
            >
            <Text style= {[styles(theme).confirmationHeader, { color: theme.text1 }]}>Cancel</Text>
            </TouchableOpacity>
        </View>
        
        </Modal>
        
      
    );
  }
};


const styles = (theme) => StyleSheet.create({
    BottomModalView:{
        margin: 0,
        //position: 'absolute',
        justifyContent: 'flex-end',
    },
    confirmationPop: {
        width: '90%',
        height: 130,
        backgroundColor: '#424242',//theme.primary,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 20,
        margin: 15,
    },
    confirmationHeader: {
        //style for text at the top of the popup
        fontWeight: '700',
        //color: theme.text1,
        textAlign: 'center',
        fontSize: 20,
    },
    confirmationText: {
        //backgroundColor: '#424242',
        color: theme.text1,
        textAlign: 'center',
        justifyContent: 'center',
        //height: '50%',
        //width: '100%',
        padding: 5,
        //borderRadius: 15,
    },
    confirmationBottomBtn: {
        color: theme.text1,
        backgroundColor: '#424242',
        alignSelf: 'center',
        width: '90%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        height: 65,
        marginBottom: 15,
    },
});


export { ConfirmationModal };
