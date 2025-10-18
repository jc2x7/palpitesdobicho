// src/components/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const Card = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    width: '90%',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
});

export default Card;