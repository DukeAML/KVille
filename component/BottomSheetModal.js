import React, { createContext, useContext, useState }  from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeProvider';

let ModalContext = createContext();

function useModal() {
    const context = React.useContext(ModalContext);
    if (!context) {
      throw new Error("useModal must be used in or within a Modal Component");
    }
    return context;
  }

const BottomSheetModal = ({ height = '50%', color = '#424242', barSize = 'default', children, ...props}) => {
    {
      const {theme} = useTheme();
      return (
        <ModalContext.Provider value={{}}>
            <Modal
                style={styles(theme).BottomModalView}
                swipeDirection={['down']}
                {...props}
            >
                <View style={[styles(theme).ModalContainer, {height: height, backgroundColor:color}]}>
                    {barSize == 'default' ? (<View style={styles(theme).modalBar}></View>) : 
                        (<View style={styles(theme).modalSmallBar}></View>)}

                        {children}
                </View>
            </Modal>
        </ModalContext.Provider>
      );
    }
  };
  
  const ModalSecondContainer = ({ children, color='#757575', size = 'default'}) => {
    let height;
    {size == 'default' ? height = '85%': height='70%'}
    const {theme} = useTheme();
    let context = useModal();
    return(
        <View style={[styles(theme).ModalSecondaryView, {backgroundColor: color, height: height}]}>
            {children}
        </View>
    )
  };
 
  BottomSheetModal.SecondContainer = ModalSecondContainer;


  const ModalHeader = ({ children, verticalMargin = 10, fontSize = 20}) => {
    const {theme} = useTheme();
    let context = useModal();
    return(
        <Text style={[styles(theme).ModalHeader,{marginVertical: verticalMargin, fontSize: fontSize}]}>{children}</Text>
    )
  };

  BottomSheetModal.Header = ModalHeader;
  
  const styles = (theme) => StyleSheet.create({
    BottomModalView:{
        margin: 0,
        justifyContent: 'flex-end',
      },
      modalSmallBar:{
        height: 2,
        marginTop: 4,
        width: '18%',
        borderRadius: 25,
        backgroundColor: 'white',
      },
      modalBar:{
        height: 4,
        marginTop: 8,
        width: '22%',
        borderRadius: 25,
        backgroundColor: 'white', //theme.grey1,
      },
      ModalContainer: {
        width: '100%',
        height: '45%',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        backgroundColor: '#424242',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      ModalHeader: {
        //style for text at the top of the popup
        fontWeight: '700',
        color:'white', //theme.text2,
        //marginVertical: 10,
        textAlign: 'center',
        fontSize: 20,
      },
      ModalSecondaryView: {
        backgroundColor: '#757575', //'#bebebe',
        width: '100%',
        height: '85%',
        paddingHorizontal: 35,
        paddingVertical: 20,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        marginBottom: 0,
      },
      ModalText: {
        color:'white', //theme.text2,
        marginVertical: 5,
        textAlign: 'left',
        fontSize: 16,
      },
  });
  
  
  export { BottomSheetModal };