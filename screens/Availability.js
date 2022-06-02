import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
  Cols,
} from "react-native-table-component";

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

export default function Availability() {
  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row
          data={agenda.tableHead}
          style={styles.head}
          textStyle={styles.text}
        />
      </Table>
      <ScrollView>
        <Table
          borderStyle={{ borderWidth: 1 }}
          style={{ flexDirection: "row" }}
        >
          <TableWrapper style={{ width: 80 }}>
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
    </View>
  );
}
