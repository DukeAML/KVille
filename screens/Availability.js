import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
  Cols,
} from "react-native-table-component";
import { IconButton } from "react-native-paper";
import Modal from "react-native-modal";
import { Picker } from "@react-native-picker/picker";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const window = Dimensions.get("window");

const agenda = {
  tableHead: ["", "Sun", "Mon", "Tu", "Wed", "Th", "Fri", "Sat"],
  tableTime: [
    "12 AM",
    "1 AM",
    "2 AM",
    "3 AM",
    "4 AM",
    "5 AM",
    "6 AM",
    "7 AM",
    "8 AM",
    "9 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
    "9 PM",
    "10 PM",
    "11 PM",
  ],
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    //justifyContent:"center"
  },
  wrapper: {
    flexDirection: "row",
  },
  title: {
    flex: 1,
  },
  row: {
    height: 40,
    backgroundColor: "#E7E6E1",
  },
  text: {
    textAlign: "center",
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    borderRadius: 25,
    borderWidth: 1,
    borderStyle: "solid",
    alignItems: "center",
    //justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  selectTime: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
});

//const tableData = Array.from(Array(24).fill(""), () => new Array(7).fill(""));
const tableData = [];
for (let i = 0; i < 46; i += 1) {
  const rowData = [];
  for (let j = 0; j < 7; j += 1) {
    rowData.push("");
  }
  tableData.push(rowData);
}

const availability = new Array(336);
availability.fill(true);

export default function Availability({ route }) {
  const { code } = route.params;

  const [dimensions, setDimensions] = useState({ window });
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState();
  const [startTime, setStartTime] = useState({
    hour: 0,
    minute: 0,
    day: 0,
  });
  const [endTime, setEndTime] = useState({
    hour: 0,
    minute: 0,
    day: 0,
  });

  const updateAvailability = () => {
    let startIdx =
      selectedDay * 48 + startTime.day + startTime.minute + startTime.hour * 2;
    let endIdx =
      selectedDay * 48 + endTime.day + endTime.minute + endTime.hour * 2;
    console.log("startIdx", startIdx);
    console.log("endIdx", endIdx);
    for (let i = startIdx; i < endIdx; i++) {
      availability[i] = false;
    }
    console.log("availability", availability);
    firebase
      .firestore()
      .collection("groups")
      .doc(code)
      .collection("members")
      .doc(firebase.auth().currentUser.uid)
      .update({
        availability: availability,
      });
    toggleModal();
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        visible={isModalVisible}
        backdropOpacity={0.1}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text>Add New Busy Time</Text>
          </View>

          <View style={styles.modalBody}>
            <View>
              <Text>Day: </Text>
              <Picker
                selectedValue={selectedDay}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedDay(itemValue);
                }}
              >
                <Picker.Item label="Monday" value={1} />
                <Picker.Item label="Tuesday" value={2} />
                <Picker.Item label="Wednesday" value={3} />
                <Picker.Item label="Thursday" value={4} />
                <Picker.Item label="Friday" value={5} />
                <Picker.Item label="Saturday" value={6} />
                <Picker.Item label="Sunday" value={0} />
              </Picker>
            </View>
            <View style={styles.selectTime}>
              <Picker
                selectedValue={startTime.hour}
                onValueChange={(itemValue, itemIndex) => {
                  setStartTime({ ...startTime, hour: itemValue });
                }}
              >
                <Picker.Item label="12" value={0} />
                <Picker.Item label="1" value={1} />
                <Picker.Item label="2" value={2} />
                <Picker.Item label="3" value={3} />
                <Picker.Item label="4" value={4} />
                <Picker.Item label="5" value={5} />
                <Picker.Item label="6" value={6} />
                <Picker.Item label="7" value={7} />
                <Picker.Item label="8" value={8} />
                <Picker.Item label="9" value={9} />
                <Picker.Item label="10" value={10} />
                <Picker.Item label="11" value={11} />
              </Picker>
              <Picker
                selectedValue={startTime.minute}
                onValueChange={(itemValue, itemIndex) => {
                  setStartTime({ ...startTime, minute: itemValue });
                }}
              >
                <Picker.Item label="00" value={0} />
                <Picker.Item label="30" value={1} />
              </Picker>
              <Picker
                selectedValue={startTime.day}
                onValueChange={(itemValue, itemIndex) => {
                  setStartTime({ ...startTime, day: itemValue });
                }}
              >
                <Picker.Item label="AM" value={0} />
                <Picker.Item label="PM" value={12} />
              </Picker>
            </View>
            <View style={styles.selectTime}>
              <Picker
                selectedValue={endTime.hour}
                onValueChange={(itemValue, itemIndex) => {
                  setEndTime({ ...endTime, hour: itemValue });
                }}
              >
                <Picker.Item label="12" value={0} />
                <Picker.Item label="1" value={1} />
                <Picker.Item label="2" value={2} />
                <Picker.Item label="3" value={3} />
                <Picker.Item label="4" value={4} />
                <Picker.Item label="5" value={5} />
                <Picker.Item label="6" value={6} />
                <Picker.Item label="7" value={7} />
                <Picker.Item label="8" value={8} />
                <Picker.Item label="9" value={9} />
                <Picker.Item label="10" value={10} />
                <Picker.Item label="11" value={11} />
              </Picker>
              <Picker
                selectedValue={endTime.minute}
                onValueChange={(itemValue, itemIndex) => {
                  setEndTime({ ...endTime, minute: itemValue });
                }}
              >
                <Picker.Item label="00" value={0} />
                <Picker.Item label="30" value={1} />
              </Picker>
              <Picker
                selectedValue={endTime.day}
                onValueChange={(itemValue, itemIndex) => {
                  setEndTime({ ...endTime, day: itemValue });
                }}
              >
                <Picker.Item label="AM" value={0} />
                <Picker.Item label="PM" value={12} />
              </Picker>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={updateAvailability}
            >
              <Text style={styles.btnTxt}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row
          data={agenda.tableHead}
          style={styles.head}
          textStyle={styles.text}
        />
      </Table>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Table
          borderStyle={{ borderWidth: 1 }}
          style={{ flexDirection: "row" }}
        >
          <TableWrapper style={{ width: dimensions.window.width / 8 }}>
            <Col
              data={agenda.tableTime}
              style={styles.time}
              //heightArr={[28, 28]}
              textStyle={styles.text}
            />
          </TableWrapper>
          <TableWrapper style={{ flex: 1 }}>
            {tableData.map((rowData, index) => (
              <Row
                key={index}
                data={rowData}
                style={[
                  styles.row,
                  index % 2 && { backgroundColor: "#F7F6E7" },
                ]}
                textStyle={styles.text}
              />
            ))}
          </TableWrapper>
        </Table>
      </ScrollView>
      <IconButton
        icon="plus-circle"
        color={"#00f"}
        size={20}
        onPress={toggleModal}
      />
    </View>
  );
}
