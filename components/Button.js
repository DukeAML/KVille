import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const Button = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'blue',
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
});

export { Button };
