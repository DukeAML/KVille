import React, {useRef} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from 'react-native-table-component';
import { useTheme } from '../context/ThemeProvider';

import kvilleBoundary from '../assets/kvilleBoundary.jpg';
import kvillesign from '../assets/kvillesign.jpg';
import text from '../../common/data/tentingInfo.json';


//DATA for The TABLES
const NIGHTHOURS = {
  tableHead: ['', 'Sunday-Thursday', 'Friday and Saturday'],
  tableTitle: ['Night'],
  tableData: [['1 am - 7 am', '2:30 am - 7 am']],
};

const BLACKTENT = {
  tableData: [
    ['Starting Dates', text["blackTent"]["dates"]],
    [
      'Occupancy Requirements',
      ' \u25CF TWO members of the tent must be on duty during the day.\n\u25CF TEN members during night hours',
    ],
  ],
};
const BLUETENT = {
  tableData: [
    ['Starting Dates', text["blueTent"]["dates"]],
    [
      'Occupancy Requirements',
      ' \u25CF ONE member of the tent must be on duty during the day.\n\u25CF SIX members during night hours',
    ],
  ],
};
const WHITETENT = {
  tableData: [
    ['Starting Dates', text["whiteTent"]["dates"]],
    [
      'Occupancy Requirements',
      ' \u25CF ONE member of the tent must be on duty during the day.\n\u25CF TWO members during night hours',
    ],
  ],
};

const window = Dimensions.get('window'); 

export default function Info() {
  const { theme } = useTheme();
  const ratioSignImg = window.width / 1000;
  //const ratioBoundaryImg = window.width / 1450;
  //variables for geting y-position of headers
  let hourPos, tentCheckPos, missPos, gracePos, tentPos, pCheckPos;
  const ref = useRef(); //creates reference for scrollView

  //render item for bullet points
  const BulletPoint = ({ data }) => (
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ fontSize: 30, paddingLeft: 30 }}>{'\u25CF'}</Text>
      <Text style={[styles(theme).contentText, { flex: 1 }]}>{data}</Text>
    </View>
  );

  function autoScroll(yPos) {
    //for auto-scolling to certain y-position
    ref.current.scrollTo({ x: 0, y: yPos, animated: true });
  }

  return (
    <SafeAreaView style={styles(theme).container}>
      <View style={styles(theme).buttonContainer}>
        <TouchableOpacity
          style={styles(theme).button}
          onPress={() => autoScroll(hourPos)}
        >
          <Text style={styles(theme).buttonText}>Hours</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles(theme).button}
          onPress={() => autoScroll(tentCheckPos)}
        >
          <Text style={styles(theme).buttonText}>Tent Checks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles(theme).button}
          onPress={() => autoScroll(missPos)}
        >
          <Text style={styles(theme).buttonText}>Missed Checks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles(theme).button}
          onPress={() => autoScroll(gracePos)}
        >
          <Text style={styles(theme).buttonText}>Grace</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles(theme).button}
          onPress={() => autoScroll(tentPos)}
        >
          <Text style={styles(theme).buttonText}>Tent Types</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles(theme).button}
          onPress={() => autoScroll(pCheckPos)}
        >
          <Text style={styles(theme).buttonText}>P-Checks</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ marginHorizontal: 20, marginTop: 50 }}
        ref={ref}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles(theme).header}>Tenting Overview:</Text>

        <View
          style={{
            width: '100%',
            marginBottom: 10,
          }}
        >
          <Image
            style={{
              width: window.width,
              height: 568 * ratioSignImg,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
            source={kvillesign}
          />
        </View>

        <Text style={styles(theme).contentText}>
          {text["tentingOverview"]}
        </Text>

        <Text
          style={styles(theme).header}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            hourPos = layout.y;
          }}
        >
          {text["hours"]["header"]}
        </Text>
        <Text style={styles(theme).contentText}>
          {text["hours"]["paragraph1"]}
        </Text>

        <Text style={styles(theme).contentText}>
          {text["hours"]["paragraph2"]}
        </Text>

        <Text style={styles(theme).contentText}>
          Night Hours are defined as:
        </Text>

        <View style={{ marginHorizontal: 20 }}>
          <Table borderStyle={{ borderWidth: 1.3 }}>
            <Row
              data={NIGHTHOURS.tableHead}
              flexArr={[1.00001, 2, 2]}
              style={StyleSheet.flatten(styles(theme).tableHead)}
              textStyle={StyleSheet.flatten(styles(theme).tableText)}
            />
            <TableWrapper style={styles(theme).tableWrapper}>
              <Col
                data={NIGHTHOURS.tableTitle}
                style={StyleSheet.flatten(styles(theme).tableTitle)}
                heightArr={[28, 28]}
                textStyle={StyleSheet.flatten(styles(theme).tableText)}
              />
              <Rows
                data={NIGHTHOURS.tableData}
                flexArr={[1.987, 1.987]}
                style={StyleSheet.flatten(styles(theme).tableRow)}
                textStyle={StyleSheet.flatten(styles(theme).tableText)}
              />
            </TableWrapper>
          </Table>
        </View>

        <Text style={styles(theme).contentText}>
          *All other times will count as Day Hours
        </Text>
        <View style={{ marginVertical: 15 }}></View>

        <Text
          style={styles(theme).header}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            tentCheckPos = layout.y;
          }}
        >
          Tent Checks
        </Text>
        <Text style={styles(theme).contentText}>
          {text["tentChecks"]["paragraph1"]}
        </Text>

        <Text style={styles(theme).contentText}>
          {text["tentChecks"]["paragraph2"]}
        </Text>

        <Text style={styles(theme).contentText}>
          {text["tentChecks"]["paragraph3"]}
        </Text>

        <Text style={[styles(theme).contentText, { fontWeight: '700' }]}>
          {text["tentChecks"]["paragraph4"]}
        </Text>

        <View
          style={{
            //flex: 1,
            width: '100%',
            marginBottom: 10,
          }}
        >
          <Image
            style={{
              width: window.width,
              height: 568 * ratioSignImg,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
            source={kvilleBoundary}
          />
        </View>

        <Text style={styles(theme).contentText}>
          {text["tentChecks"]["paragraph5"]}
        </Text>
        <View style={{ marginVertical: 12 }}></View>

        <Text
          style={styles(theme).header}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            missPos = layout.y;
          }}
        >
          Missed Checks
        </Text>

        <Text style={styles(theme).contentText}>
          {text["missedChecks"]["paragraph1"]}
        </Text>

        <Text style={styles(theme).contentText}>
          {text["missedChecks"]["paragraph2"]}
        </Text>

        <Text style={styles(theme).contentText}>
          {text["missedChecks"]["paragraph3"]}
        </Text>
        <Text style={styles(theme).contentText}>
          {text["missedChecks"]["paragraph4"]}
        </Text>
        <View style={{ marginVertical: 12 }}></View>

        <Text
          style={styles(theme).header}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            gracePos = layout.y;
          }}
        >
          Grace
        </Text>

        <Text style={styles(theme).contentText}>
          A grace period may be announced in which no tent checks will be
          called. During grace, tenters need not be on duty in K-Ville.
        </Text>

        <Text style={styles(theme).contentText}>
          Grace shall be given on the following occasions:
        </Text>

        <BulletPoint data='For one hour after a tent check is completed.' />
        <BulletPoint data='Two hours before and after a men’s or women’s home basketball game.' />
        <BulletPoint data='One hour before and after a men’s or women’s away basketball game.' />
        <BulletPoint data='For some heavy weather-related incidents.' />
        <View style={{ marginVertical: 18 }}></View>

        <Text
          style={[
            styles(theme).header,
            styles(theme).tentHeaderBox,
            { backgroundColor: theme.text2, color: theme.text1},
          ]}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            tentPos = layout.y;
          }}
        >
          Black Tent
        </Text>

        <Text style={styles(theme).contentText}>
          Black Tenting is the first period of the Tenting season. Following the
          conclusion of Black Tenting, missed checks will clear and all Black
          Tents will begin following Blue Tenting rules.
        </Text>

        <View style={{ marginHorizontal: 20 }}>
          <Table borderStyle={{ borderWidth: 1.3 }}>
            <TableWrapper style={styles(theme).tableWrapper}>
              <Rows
                data={BLACKTENT.tableData}
                flexArr={[1, 1.987]}
                style={StyleSheet.flatten(styles(theme).tentTableRow)}
                textStyle={StyleSheet.flatten(styles(theme).tableText)}
              />
            </TableWrapper>
          </Table>
        </View>
        <View style={{ marginVertical: 18 }}></View>

        <Text
          style={[
            styles(theme).header,
            styles(theme).tentHeaderBox,
            { backgroundColor: 'blue', color: theme.text1 },
          ]}
        >
          Blue Tent
        </Text>
        <Text style={styles(theme).contentText}>
          Blue Tenting is the second period of the Tenting season. Following the
          conclusion of Blue Tenting, missed checks will clear and all Black and
          Blue Tents will begin following White Tenting rules.
        </Text>

        <View style={{ marginHorizontal: 20 }}>
          <Table borderStyle={{ borderWidth: 1.3 }}>
            <TableWrapper style={styles(theme).tableWrapper}>
              <Rows
                data={BLUETENT.tableData}
                flexArr={[1, 1.987]}
                style={StyleSheet.flatten(styles(theme).tentTableRow)}
                textStyle={StyleSheet.flatten(styles(theme).tableText)}
              />
            </TableWrapper>
          </Table>
        </View>
        <View style={{ marginVertical: 18 }}></View>

        <Text
          style={[
            styles(theme).header,
            styles(theme).tentHeaderBox,
            { backgroundColor: theme.text1 },
          ]}
        >
          White Tent
        </Text>
        <Text style={styles(theme).contentText}>
          White Tenting is the third period of the Tenting season.
        </Text>
        <Text style={styles(theme).contentText}>
          Given the high demand for White tents, the order of White tents will
          be determined by a scavenger hunt.
        </Text>

        <View style={{ marginHorizontal: 20 }}>
          <Table borderStyle={{ borderWidth: 1.3 }}>
            <TableWrapper style={styles(theme).tableWrapper}>
              <Rows
                data={WHITETENT.tableData}
                flexArr={[1, 1.987]}
                style={StyleSheet.flatten(styles(theme).tentTableRow)}
                textStyle={StyleSheet.flatten(styles(theme).tableText)}
              />
            </TableWrapper>
          </Table>
        </View>
        <View style={{ marginVertical: 18 }}></View>

        <Text
          style={[
            styles(theme).header,
            styles(theme).tentHeaderBox,
            { backgroundColor: theme.grey6 },
          ]}
        >
          Flex Tent
        </Text>
        <Text style={styles(theme).contentText}>
          {text["flexTent"]["paragraph1"]}
        </Text>
        <Text style={styles(theme).contentText}>
          {text["flexTent"]["paragraph2"]}
        </Text>
        <Text style={styles(theme).contentText}>
          {text["flexTent"]["paragraph3"]}
        </Text>

        <Text
          style={styles(theme).header}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            pCheckPos = layout.y;
          }}
        >
          Personal Checks
        </Text>
        <Text style={styles(theme).contentText}>
          {text["pChecks"]["paragraph1"]}
        </Text>
        <Text style={styles(theme).contentText}>
          {text["pChecks"]["paragraph2"]}
        </Text>
        <Text style={[styles(theme).contentText, { fontWeight: '700' }]}>
          {text["pChecks"]["paragraph3"]}
        </Text>
        <Text style={styles(theme).contentText}>
          {text["pChecks"]["paragraph4"]}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      flexDirection: 'column',
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      //marginHorizontal: 20,
      //marginTop: 2,
      width: '100%'
    },
    button: {
      backgroundColor: theme.primary,
      width: window.width/6,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      //fontSize: 'auto',
      fontWeight: '500',
      textAlign: 'center',
      color: theme.text1,
    },
    header: {
      marginVertical: 10,
      marginHorizontal: 15,
      fontSize: 28,
      fontWeight: '700',
    },
    contentText: {
      fontSize: 18,
      fontWeight: '400',
      marginHorizontal: 24,
      marginVertical: 10,
      color: theme.text2,
    },

    tentHeaderBox: {
      width: '',
      height: 40,
      borderRadius: 20,
      textAlign: 'center',
    },
    tableHead: { height: 40, backgroundColor: 'lavender' },
    tableWrapper: { flexDirection: 'row' },
    tableTitle: { flex: 1, backgroundColor: 'lavender' },
    tableRow: { height: 28 },
    tableText: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    tentTableRow: { height: 95 },
  });
