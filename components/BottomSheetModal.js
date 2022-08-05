import React, { createContext, useContext } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeProvider';

let ModalContext = createContext();

//Function for creating context for interior components
function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used in or within a Modal Component');
  }
  return context;
}

/** Parent function for BottomSheetModal
 *
 * @param {string (%) | number } height -- percent size of modal (or pixel size)
 * @param {color} color -- overwrite background color of modal from dark or light theme
 * @param {boolean} swipeDown -- if you want the modal to be swipeable
 *      * would recommend false if modal has scrollable components such as a picker
 *      * if true, must add onSwipeComplete prop to the modal
 * @param {string ('default' | 'small' | 'none') } barSize -- depending on the size of the modal, determine the size of toggle bar
 * @param {string} userStyle -- options: ('dark' | 'light') background color of modal and text color
 * @param {Component} children -- components inside modal component;
 *
 * @param {props} props --
 *   **NOTE: must include normal modal props in the props of the Modal such as:
 *       isVisible={isModalVisible}
 *       onBackdropPress={() => setModalVisible(false)}
 *       onSwipeComplete = {toggleModal}
 *       ...
 * @returns {Component} Modal Component
 */

const BottomSheetModal = ({
  height = '50%',
  color,
  swipeDown = true,
  barSize = 'default',
  userStyle,
  children,
  ...props
}) => {
  {
    const { theme } = useTheme();

    //set up default styles for light and dark themes
    let background, headerColor;
    userStyle == 'light'
      ? ((background = '#fff'), (headerColor = 'black'))
      : ((background = '#565656'), (headerColor = '#fff'));

    //overwrite dark|light theme background colors if defined
    if (color !== undefined) background = color;

    return (
      <ModalContext.Provider value={{ headerColor }}>
        <Modal
          style={styles(theme).BottomModalView}
          swipeDirection= {swipeDown ? 'down' : null}
          backdropTransitionOutTiming={0}
          keyboardDismissMode={'on-drag'}
          {...props}
        >
          <SafeAreaView style={[styles(theme).ModalContainer, { height: height, backgroundColor: background }]}>
            {barSize == 'default' ? (
              <View style={[styles(theme).modalBar, { backgroundColor: headerColor }]}></View>
            ) : barSize == 'small' ? (
              <View style={[styles(theme).modalSmallBar, { backgroundColor: headerColor }]}></View>
            ) : null}

            {children}
          </SafeAreaView>
        </Modal>
      </ModalContext.Provider>
    );
  }
};

/**Component for adding a second bottom layer on modal
 *
 * @param {color} color -- background color of modal ;
 * @param {string ('default' | 'small') } size -- depending on the size of the modal, determine the size of second layer
 * @param {Component} children -- components inside bottom container component;
 *
 */
const ModalSecondContainer = ({ children, color, size = 'default' }) => {
  let height, background;
  {
    size == 'default' ? (height = '85%') : (height = '70%');
  }
  const { theme } = useTheme();
  let { headerColor } = useModal();
  headerColor == 'black' ? (background = '#f5f5f5') : (background = '#757575');

  //overwrite dark|light theme background colors if defined
  if (color !== undefined) background = color;

  return (
    <View style={[styles(theme).ModalSecondaryView, { backgroundColor: background, height: height }]}>{children}</View>
  );
};
BottomSheetModal.SecondContainer = ModalSecondContainer;

/**Component for adding a top header
 *
 * @param {number} verticalMargin -- depending on the size of the modal, determine the margin of text
 * @param {number} fontSize -- depending on the size of the modal, determine the fontSize of text
 *
 * @param {string} children -- text of header;
 *
 * */
const ModalHeader = ({ children, verticalMargin = 10, fontSize = 20 }) => {
  const { theme } = useTheme();
  let { headerColor } = useModal();
  return (
    <Text
      style={[styles(theme).ModalHeader, { marginVertical: verticalMargin, fontSize: fontSize, color: headerColor }]}
    >
      {children}
    </Text>
  );
};
BottomSheetModal.Header = ModalHeader;

const styles = (theme) =>
  StyleSheet.create({
    BottomModalView: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    ModalContainer: {
      width: '100%',
      height: '45%',
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalSmallBar: {
      height: 2,
      marginTop: 4,
      width: '15%',
      borderRadius: 25,
      backgroundColor: 'white',
    },
    modalBar: {
      height: 4,
      marginTop: 8,
      width: '22%',
      borderRadius: 25,
      backgroundColor: 'white', //theme.grey1,
    },
    ModalHeader: {
      //style for text at the top of the popup
      fontWeight: '700',
      color: 'white',
      textAlign: 'center',
      fontSize: 20,
    },
    ModalSecondaryView: {
      width: '100%',
      height: '85%',
      paddingHorizontal: 35,
      paddingVertical: 20,
      borderTopRightRadius: 40,
      borderTopLeftRadius: 40,
      marginBottom: 0,
    },
    ModalText: {
      color: 'white',
      marginVertical: 5,
      textAlign: 'left',
      fontSize: 16,
    },
  });

export { BottomSheetModal };
