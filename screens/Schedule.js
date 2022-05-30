import React from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { createGroupSchedule } from "../backend/CreateGroupSchedule";

export default function Schedule() {
  return (
    <View>
      <Button
        title="Create Group Schedule"
        onPress={() =>
          console.log(
            "Group Schedule",
            createGroupSchedule("BtycLIprkN3EmC9wmpaE", "black")
          )
        }
      />
    </View>
  );
}
