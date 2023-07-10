import React from 'react';
import {StyleSheet,} from 'react-native';
import { Table, Col} from 'react-native-table-component';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useTheme } from '../context/ThemeProvider';



const TimeColumn = ({cellHeight, borderWidth, includeTopRow}) => {
    //component for side table of 12am-12am time segments
    const { theme } = useTheme();
    let times = [];
    for (let i = 0; i < 24; i += 1){
        let half = "am";
        if (i >= 12){
            half = "pm";
        }
        let hour = (i % 12).toString();
        if ((i % 12) == 0){
            hour = "12";
        }
        times.push(hour + half);
    }
    let heightArr = new Array(times.length).fill(cellHeight * 2 );

    if (includeTopRow){
        times = ["", ...times];
        heightArr = [cellHeight, ...heightArr];
    }

    return (
      <Table style={{ width: '7%', marginTop: -31 }}>
        <Col
          data={times}
          heightArr={heightArr}
          textStyle={{ fontWeight: '800',
          fontSize: 9,
          width: '100%',
          textAlign: 'center'}}
        />
      </Table>
    );
  };






export { TimeColumn };