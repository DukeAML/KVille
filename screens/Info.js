import React from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList
} from "react-native";

export default function Info() {
  const BulletPoint = ({ data }) => (
    <View style={{ flexDirection: "row" }}>
      <Text style={{ fontSize: 30, paddingLeft: 45 }}>{"\u25CF"}</Text>
      <Text style={[styles.contentText, { flex: 1 }]}>{data}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ marginHorizontal: 20 }}>
        <Text style={styles.header}>Tenting Overview:</Text>

        <Text style={styles.contentText}>
          A tent is comprised of a maximum of 12 people. Occupancy requirements
          for each tenting period remain the same regardless of the number of
          people in the tent.
        </Text>

        <Text style={styles.header}>Daytime Hours and Curfew</Text>
        <Text style={styles.contentText}>
          Tenters on duty must be within the K-Ville city limits at all times.
          The number of tenters required at a given time varies based on the
          current tenting period and the time of day.
        </Text>

        <Text style={styles.contentText}>
          Each day is divided into day and night hours. A different number of
          tenters on duty is necessary from day to night.
        </Text>

        <Text style={styles.contentText}>
          Night Hours are defined as: **insert table
        </Text>

        <Text style={styles.contentText}>
          *All other times will count as Day Hours
        </Text>

        <Text style={styles.header}>Tent Checks</Text>
        <Text style={styles.contentText}>
          The Line Monitors may announce a tent check at their discretion. A
          check will be signaled by the sounding of a bullhorn siren.
        </Text>

        <Text style={styles.contentText}>
          To check in, gather all members of your tent in the area between the
          Card parking lot and the Schwartz-Butters plaza. Wait until the
          required number of tenters are present to check in — we cannot check
          in your tent until all required members are present.
        </Text>

        <Text style={styles.contentText}>
          Tents who have yet to be checked but appear to be missing will — at a
          minimum – be given three warning calls over the bullhorn before being
          marked as absent. After the final warning call, an additional 2
          minutes will be given to allow for tenters to check in. After this
          time elapses, the check is officially over.
        </Text>

        <Text style={[styles.contentText, { fontWeight: "700" }]}>
          Tenters must stay within K-Ville boundaries to be counted.
        </Text>

        <Text style={styles.contentText}>
          **insert image of boundaries ** Line Monitors cannot be held
          responsible for checks missed due to tenters using the bathroom,
          failing to hear the siren, being asleep in the tent, or similar
          related circumstances.
        </Text>

        <Text style={styles.header}>Missed Checks</Text>

        <Text style={styles.contentText}>
          Checking in entails each present group member presenting their Duke
          Card to a Line Monitor. If the tent fails to complete this, the check
          will be counted as a missed check for that tent.
        </Text>

        <Text style={styles.contentText}>
          Each tent is allowed one missed check per tenting period. Missing a
          second check will result in the tent being bumped to the end of the
          line, behind all registered tents.
        </Text>

        <Text style={styles.contentText}>
          An email from headlinemonitor@gmail.com to your tent captain within 24
          hours will inform you of your miss. If you feel a miss has been
          assigned in error, please contact the Head Line Monitors at
          headlinemonitor@gmail.com to discuss your circumstances.
        </Text>
        <Text style={styles.contentText}>
          If K-Ville is at a maximum capacity, the tent will be dropped to the
          end of the resultant wait list.
        </Text>

        <Text style={styles.header}>Grace</Text>

        <Text style={styles.contentText}>
          A grace period may be announced in which no tent checks will be
          called. During grace, tenters need not be on duty in K-Ville.
        </Text>

        <Text style={styles.contentText}>
          Grace shall be given on the following occasions:
        </Text>

        <BulletPoint data="For one hour after a tent check is completed." />
        <BulletPoint data="Two hours before and after a men’s or women’s home basketball game." />
        <BulletPoint data="One hour before and after a men’s or women’s away basketball game." />
        <BulletPoint data="For some heavy weather-related incidents." />

        <Text style={styles.header}>Black Tent</Text>
        <Text style={styles.header}>Blue Tenting</Text>
        <Text style={styles.header}>White Tenting</Text>
        <Text style={styles.header}>Flex Tenting</Text>
        <Text style={styles.header}>Personal Checks</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C2C6D0"
  },
  header: {
    marginVertical: 10,
    marginHorizontal: 15,
    fontSize: 32,
    fontWeight: "700"
  },
  contentText: {
    fontSize: 20,
    fontWeight: "400",
    marginHorizontal: 30,
    marginVertical: 10
  },
  listText: {
    fontSize: 16,
    fontFamily: "sans-serif",
    fontWeight: "550",
    color: "white"
  }
});
