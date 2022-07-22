import React from 'react';
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

//DATA for The TABLES
const NIGHTHOURS = {
  tableHead: ['', 'Sunday-Thursday', 'Friday and Saturday'],
  tableTitle: ['Night'],
  tableData: [['1 am - 7 am', '2:30 am - 7 am']],
};

const BLACKTENT = {
  tableData: [
    ['Starting Dates', 'Jan *, 2023 - Feb *, 2023'],
    [
      'Occupancy Requirements',
      ' \u25CF TWO members of the tent must be on duty during the day.\n\u25CF TEN members during night hours',
    ],
  ],
};
const BLUETENT = {
  tableData: [
    ['Starting Dates', 'Jan *, 2023 - Feb *, 2023'],
    [
      'Occupancy Requirements',
      ' \u25CF ONE member of the tent must be on duty during the day.\n\u25CF SIX members during night hours',
    ],
  ],
};
const WHITETENT = {
  tableData: [
    ['Starting Dates', 'Feb *, 2023 - Feb *, 2023'],
    [
      'Occupancy Requirements',
      ' \u25CF ONE member of the tent must be on duty during the day.\n\u25CF TWO members during night hours',
    ],
  ],
};

export default function Info() {
  const { theme } = useTheme();
  //Variables for sizing images
  const win = Dimensions.get('window');
  const ratioSignImg = win.width / 1000;
  //const ratioBoundaryImg = win.width / 1450;
  //variables for geting y-position of headers
  let hourPos, tentCheckPos, missPos, gracePos, tentPos, pCheckPos;
  const ref = React.useRef(); //creates reference for scrollView

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
              width: win.width,
              height: 568 * ratioSignImg,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
            source={kvillesign}
          />
        </View>

        <Text style={styles(theme).contentText}>
          A tent is comprised of a maximum of 12 people. Occupancy requirements
          for each tenting period remain the same regardless of the number of
          people in the tent.
        </Text>

        <Text
          style={styles(theme).header}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            hourPos = layout.y;
          }}
        >
          Daytime Hours and Curfew
        </Text>
        <Text style={styles(theme).contentText}>
          Tenters on duty must be within the K-Ville city limits at all times.
          The number of tenters required at a given time varies based on the
          current tenting period and the time of day.
        </Text>

        <Text style={styles(theme).contentText}>
          Each day is divided into day and night hours. A different number of
          tenters on duty is necessary from day to night.
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
          The Line Monitors may announce a tent check at their discretion. A
          check will be signaled by the sounding of a bullhorn siren.
        </Text>

        <Text style={styles(theme).contentText}>
          To check in, gather all members of your tent in the area between the
          Card parking lot and the Schwartz-Butters plaza. Wait until the
          required number of tenters are present to check in — we cannot check
          in your tent until all required members are present.
        </Text>

        <Text style={styles(theme).contentText}>
          Tents who have yet to be checked but appear to be missing will — at a
          minimum — be given three warning calls over the bullhorn before being
          marked as absent. After the final warning call, an additional 2
          minutes will be given to allow for tenters to check in. After this
          time elapses, the check is officially over.
        </Text>

        <Text style={[styles(theme).contentText, { fontWeight: '700' }]}>
          Tenters must stay within K-Ville boundaries to be counted.
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
              width: win.width,
              height: 568 * ratioSignImg,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
            source={kvilleBoundary}
          />
        </View>

        <Text style={styles(theme).contentText}>
          Line Monitors cannot be held responsible for checks missed due to
          tenters using the bathroom, failing to hear the siren, being asleep in
          the tent, or similar related circumstances.
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
          Checking in entails each present group member presenting their Duke
          Card to a Line Monitor. If the tent fails to complete this, the check
          will be counted as a missed check for that tent.
        </Text>

        <Text style={styles(theme).contentText}>
          Each tent is allowed one missed check per tenting period. Missing a
          second check will result in the tent being bumped to the end of the
          line, behind all registered tents.
        </Text>

        <Text style={styles(theme).contentText}>
          An email from headlinemonitor@gmail.com to your tent captain within 24
          hours will inform you of your miss. If you feel a miss has been
          assigned in error, please contact the Head Line Monitors at
          headlinemonitor@gmail.com to discuss your circumstances.
        </Text>
        <Text style={styles(theme).contentText}>
          If K-Ville is at a maximum capacity, the tent will be dropped to the
          end of the resultant wait list.
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
          Flex Tenting abides by the same rules and regulations as White
          Tenting, but Flex tents are NOT GUARANTEED a spot in the Carolina
          game.
        </Text>
        <Text style={styles(theme).contentText}>
          These tenting spots will be filled through the Race to the Secret
          Spots. The 31st to 60th groups to complete the Race to the Secret
          Spots will receive Flex Tenting spots.
        </Text>
        <Text style={styles(theme).contentText}>
          All groups after the 60th group to complete the Race to the Secret
          Spots will be added to the Flex Tenting wait list.
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
          P-Checks are conducted on an individual basis. Therefore, an entire
          tent will not be penalized should a member of their tent miss too many
          Personal Checks.
        </Text>
        <Text style={styles(theme).contentText}>
          Five Personal Checks will be called at any time on **insert date**
        </Text>
        <Text style={[styles(theme).contentText, { fontWeight: '700' }]}>
          To obtain a wristband for the Carolina game, a tenter must check in at
          THREE of the FIVE checks.
        </Text>
        <Text style={styles(theme).contentText}>
          Individuals who fail to report to three of the five Personal Checks
          will be ineligible to receive a wristband for the Carolina game. Those
          students will not, however, penalize the other members in their tent
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
      width: '17%',
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
