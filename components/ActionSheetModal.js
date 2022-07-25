import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeProvider';


/**
 * Parent Function for ActionSheet Modal component
 * 
 * @param {function} toggleModal -- if cancelButton is true, set parameter to toggleModal function
 * @param {number} height -- vertical size of modal
 * @param {color} backgroundColor -- background color of modal 
 * @param {boolean} swipeDown -- if you want the modal to be swipeable 
 *      * would recommend false if modal has scrollable components such as a picker
 *      * if true, must add onSwipeComplete prop to the modal
 * @param {string} userStyle -- options: ('dark' | 'light') background color of modal and text color
 * @param {boolean} cancelButton  -- if a cancel button should be added to the modal
 * @param {Component} children -- components inside modal component; 
 * 
 *
 * @param {props} props --
 *   **NOTE: must include normal modal props in the props of the Modal such as:
 *       isVisible={isModalVisible} 
 *       onBackdropPress={() => setModalVisible(false)}
 *       onSwipeComplete = {toggleModal} 
 *       ...
 * @returns Modal Component
 */

const ActionSheetModal = ({ toggleModal , backgroundColor, swipeDown = true, height = 130, userStyle,
                            cancelButton = false,  children, ...props  }) => {
  {
    const {theme} = useTheme();

    //set up default styles for light and dark themes
    let background, opacity;
    userStyle == 'light' ? (background = '#fff', opacity= '96%') : 
            (background= '#565656', opacity = '100%');

    //overwrite dark|light theme background colors if defined
    if (backgroundColor !== undefined) background = backgroundColor; 

    //Height of entire modal based on if cancel button is added or not
    const adjustedHeight = cancelButton ? height+110 : height+30; //accounts for vertical margin and cancel button

    return (
        <Modal
            style={styles(theme).BottomModalView}
            swipeDirection={swipeDown ? ['down'] : null}
            {...props}
        >
            <SafeAreaView style = {{width: '95%', alignSelf: 'center', height: adjustedHeight}}>
                <View style={[styles(theme).TopSectionView, {backgroundColor: background, height: height, opacity: opacity}]}>
                    {children}
                </View>
                {cancelButton ? (
                    <TouchableOpacity
                        onPress= {()=> toggleModal()}
                        style={[styles(theme).CancelBtn, {backgroundColor: background, opacity:opacity}]}
                    >
                    <Text style= {[styles(theme).CancelBtnText, { color: '#1988f8' }]}>Cancel</Text>
                    </TouchableOpacity>
                ): null}
                
            </SafeAreaView>
        </Modal>
    );
  }
};


const styles = (theme) => StyleSheet.create({
    BottomModalView:{
        margin: 0,
        justifyContent: 'flex-end',
    },
    TopSectionView: { //Style for top view of action sheet
        width: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 20,
        margin: 15,
    },
    CancelBtn: { //style for Cancel Button
        alignSelf: 'center',
        width: '100%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        height: 65,
        marginBottom: 15,
    },
    CancelBtnText: { //style for text of Cancel Button
        fontWeight: '700',
        textAlign: 'center',
        fontSize: 24,
    },
});


export { ActionSheetModal };