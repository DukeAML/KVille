import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Table,
  TableWrapper,
  Row,
  Col,
  Cell,
} from "react-native-table-component";

import { useFocusEffect } from "@react-navigation/native";
import AppLoading from "expo-app-loading";

import { createGroupSchedule } from "../backend/CreateGroupSchedule";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const times = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12am",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
  "12am",
];

const colors = ["blue"];

let colorCodes = [
  {
    name: "null",
    color: "red",
  },
];

/* let group = [
  "poop1", "poop2", "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ", 
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "null",
];  */
//let SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY = new Array();
let SUNDAY = new Array();
let MONDAY = new Array();
let TUESDAY = new Array();
let WEDNESDAY = new Array();
let THURSDAY = new Array();
let FRIDAY = new Array();
let SATURDAY = new Array();

const OneCell = ({ index, person }) => {
  //const backgroundColor = "pink";
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => console.log("index: ", index)}>
        <View style={styles.btn}>
          <Text style={styles.btnText}>{person}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const TimeColumn = () => {
  return (
    <Table>
      <Col
        data={times}
        heightArr={[
          60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60,
          60, 60, 60, 60, 60, 60, 60, 60,
        ]}
        textStyle={StyleSheet.flatten(styles.timesText)}
      />
    </Table>
  );
};

const RenderCell = (data, index, members, numDay, numNight) => {
  const people = members.split(" ");
  const isNight = index >= 2 && index <= 13;
  //console.log("index ", index);
  if (!isNight && numDay === 1) {
    return (
      <View style={styles.row}>
        <OneCell index={index} person={people[0]} />
      </View>
    );
  } else if ((isNight && numNight === 2) || (!isNight && numDay === 2)) {
    return (
      <View style={styles.row}>
        <OneCell index={index} person={people[0]} />
        <OneCell index={index} person={people[1]} />
      </View>
    );
  } else if (isNight && numNight === 6) {
    return (
      <View style={styles.row}>
        <OneCell index={index} person={people[0]} />
        <OneCell index={index} person={people[1]} />
        <OneCell index={index} person={people[2]} />
        <OneCell index={index} person={people[3]} />
        <OneCell index={index} person={people[4]} />
        <OneCell index={index} person={people[5]} />
      </View>
    );
  } else {
    return (
      <View style={styles.row}>
        <OneCell index={index} person={people[0]} />
        <OneCell index={index} person={people[1]} />
        <OneCell index={index} person={people[2]} />
        <OneCell index={index} person={people[3]} />
        <OneCell index={index} person={people[4]} />
        <OneCell index={index} person={people[5]} />
        <OneCell index={index} person={people[6]} />
        <OneCell index={index} person={people[7]} />
        <OneCell index={index} person={people[8]} />
        <OneCell index={index} person={people[9]} />
      </View>
    );
  }
};

const DailyTable = ({ day }) => {
  return (
    <Table borderStyle={{ borderWidth: 1 }}>
      {day.map((rowData, index) => (
        <TableWrapper key={index} style={StyleSheet.flatten(styles.row)}>
          <Cell
            data={RenderCell(1, index, day[index], 2, 10)}
            textStyle={StyleSheet.flatten(styles.text)}
          />
        </TableWrapper>
      ))}
    </Table>
  );
};
const win = Dimensions.get("window");
const tableLength = win.width * 0.85;

export default function Schedule({ route }) {
  const { code, tentType } = route.params;
  console.log("Schedule screen params", route.params);
  const [loaded, setLoaded] = useState(false); // for checking if firebase is read before rendering

  let sunPos, monPos, tuesPos, wedPos, thurPos, friPos, satPos;
  const ref = useRef(); //creates reference for scrollView

  function autoScroll(yPos) {
    //for auto-scolling to certain y-position
    ref.current.scrollTo({ x: 0, y: yPos, animated: true });
  }

  const groupRef = firebase.firestore().collection("groups").doc(code);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      if (mounted) {
        groupRef
          .get()
          .then((doc) => {
            let schedule = doc.data().groupSchedule;

            console.log("Here is Schedule from firebase: ", schedule);
            /* console.log('value: ', schedule[120]);
          MONDAY.push(schedule[0]); */

            SUNDAY = schedule.splice(0, 48);
            MONDAY = schedule.splice(0, 48);
            TUESDAY = schedule.splice(0, 48);
            WEDNESDAY = schedule.splice(0, 48);
            THURSDAY = schedule.splice(0, 48);
            FRIDAY = schedule.splice(0, 48);
            SATURDAY = schedule.splice(0, 48);

            /* console.log('Schedules: \n', SUNDAY, '\n', MONDAY,  '\n', TUESDAY, '\n', WEDNESDAY, 
            '\n', THURSDAY, '\n', FRIDAY, '\n', SATURDAY,); */
          })
          .then((doc) => {
            //for making sure firebase is done reading
            setLoaded(true);
          })
          .catch((error) => {
            console.log("Error getting documents: ", error);
          });
      }
      return () => {
        mounted = false;
      };
    }, [])
  );

  if (!loaded) {
    //if firebase reading done, then render
    return <AppLoading />;
  } else {
    return (
      <View style={styles.bigContainer}>
        <View>
          <Button
            title="Create Group Schedule"
            onPress={() => {
              createGroupSchedule(code, tentType).then(
                (groupSchedule) => {
                  console.log("Group Schedule", groupSchedule);

                  groupRef
                    .set({
                      groupSchedule: groupSchedule,
                    });
                }
              );
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              { borderTopLeftRadius: 7, borderBottomLeftRadius: 7 },
            ]}
            onPress={() => autoScroll(sunPos)}
          >
            <Text style={styles.buttonText}>Sunday</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => autoScroll(monPos)}
          >
            <Text style={styles.buttonText}>Monday</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => autoScroll(tuesPos)}
          >
            <Text style={styles.buttonText}>Tuesday</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => autoScroll(wedPos)}
          >
            <Text style={styles.buttonText}>Wednesday</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => autoScroll(thurPos)}
          >
            <Text style={styles.buttonText}>Thursday</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => autoScroll(friPos)}
          >
            <Text style={styles.buttonText}>Friday</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { borderTopRightRadius: 7, borderBottomRightRadius: 7 },
            ]}
            onPress={() => autoScroll(satPos)}
          >
            <Text style={styles.buttonText}>Saturday</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ marginHorizontal: 10, marginVertical: 50 }}
          ref={ref}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={styles.dayHeader}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              sunPos = layout.y;
            }}
          >
            {" "}
            SUNDAY{" "}
          </Text>

          <View style={{ flexDirection: "row" }}>
            <TimeColumn />
            <DailyTable day={SUNDAY} />
          </View>

          <Text
            style={styles.dayHeader}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              monPos = layout.y;
            }}
          >
            {" "}
            MONDAY{" "}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TimeColumn />
            <DailyTable day={MONDAY} />
          </View>

          <Text
            style={styles.dayHeader}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              tuesPos = layout.y;
            }}
          >
            {" "}
            TUESDAY{" "}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TimeColumn />
            <DailyTable day={TUESDAY} />
          </View>

          <Text
            style={styles.dayHeader}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              wedPos = layout.y;
            }}
          >
            {" "}
            WEDNESDAY{" "}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TimeColumn />
            <DailyTable day={WEDNESDAY} />
          </View>

          <Text
            style={styles.dayHeader}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              thurPos = layout.y;
            }}
          >
            {" "}
            THURSDAY{" "}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TimeColumn />
            <DailyTable day={THURSDAY} />
          </View>

          <Text
            style={styles.dayHeader}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              friPos = layout.y;
            }}
          >
            {" "}
            FRIDAY{" "}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TimeColumn />
            <DailyTable day={FRIDAY} />
          </View>

          <Text
            style={styles.dayHeader}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              satPos = layout.y;
            }}
          >
            {" "}
            SATURDAY{" "}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TimeColumn />
            <DailyTable day={SATURDAY} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bigContainer: { flex: 1, backgroundColor: "#C2C6D0" },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: "#C2C6D0",
  },
  head: { height: 40, backgroundColor: "#808B97" },
  text: { margin: 6 },
  timesText: {
    fontWeight: 800,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 2,
  },
  button: {
    backgroundColor: "#1f509a",
    width: "14.5%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: "auto",
    fontWeight: "500",
    textAlign: "center",
    color: "white",
  },
  dayHeader: {
    marginVertical: 20,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  row: {
    //flex: 1,
    flexDirection: "row",
    backgroundColor: "lavender",
    width: tableLength,
    alignItems: "center",
    //justifyContent: "space-around"
  },
  btn: {
    //width: 58,
    height: 30,
    backgroundColor: "#78B7BB",
    //borderRadius: 2,
    alignSelf: "stretch",
  },
  btnText: { textAlign: "center", color: "#fff" },
});
