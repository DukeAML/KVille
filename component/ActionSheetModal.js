import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeProvider';



/*Parent Function for Confirmation Modal component

This Modal has little to no customization for uniform look

Parameters: 
    @param {function} toggleModal -- if cancelButton is true, set parameter to toggleModal function
    @param {number} height -- vertical size of modal
    @param {string (color | hex) } backgroundColor -- background color of modal 

    @type {compoenents} children -- components inside component; 

props --
    **NOTE: must include normal modal props in the props of the BottomSheetModal such as:
        isVisible={isModalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete = {toggleModal} 
*/ 
const ActionSheetModal = ({ toggleModal , backgroundColor = '#565656', height = 130, 
                            cancelButton = false, cancelButtonColor = '#fff', children, ...props  }) => {
  {
    const {theme} = useTheme();

    const adjustedHeight = cancelButton ? height+110 : height+30; 
    return (
        <Modal
            style={styles(theme).BottomModalView}
            swipeDirection={['down']}
            {...props}
        >
            <View style = {{width: '95%', alignSelf: 'center', height: adjustedHeight}}>
                <View style={[styles(theme).TopSectionView, {backgroundColor: backgroundColor, height: height}]}>
                    {children}
                </View>
                {cancelButton ? (
                    <TouchableOpacity
                        onPress= {()=> toggleModal()}
                        style={[styles(theme).CancelBtn, {backgroundColor: backgroundColor}]}
                    >
                    <Text style= {[styles(theme).CancelBtnText, { color: cancelButtonColor }]}>Cancel</Text>
                    </TouchableOpacity>
                ): null}
                
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
    TopSectionView: {
        width: '100%',
        //height: 130,
        //backgroundColor: '#565656',//theme.primary,
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
/*     confirmationHeader: {
        //style for text of buttons
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
        padding: 5,
    }, */
    CancelBtn: {
        color: theme.text1,
        //backgroundColor: '#565656',
        alignSelf: 'center',
        width: '100%',
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
    CancelBtnText: {
        //style for text of buttons
        fontWeight: '700',
        //color: theme.text1,
        textAlign: 'center',
        fontSize: 24,
    },
});


export { ActionSheetModal };