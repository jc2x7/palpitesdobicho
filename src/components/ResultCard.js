// src/components/ResultCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';

const ResultCard = ({ title, data, isExpanded = true }) => {
  if (!data || !data.headers || !data.rows || data.rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#ffffff', '#f9f9f9']}
        style={styles.cardGradient}>
        <View style={styles.titleContainer}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}>
            <Text style={styles.cardTitle}>{title}</Text>
          </LinearGradient>
        </View>

        <View style={styles.tableWrapper}>
          {/* Header */}
          <View style={styles.headerRow}>
            {data.headers.map((header, index) => (
              <View key={index} style={styles.headerCell}>
                <Text style={styles.headerText} numberOfLines={2}>
                  {header}
                </Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {data.rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.dataRow,
                rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}>
              {row.map((cell, cellIndex) => (
                <View key={cellIndex} style={styles.dataCell}>
                  <Text style={styles.cellText} numberOfLines={2}>
                    {cell}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 16,
  },
  titleContainer: {
    marginBottom: 12,
  },
  titleGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  tableWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  evenRow: {
    backgroundColor: '#f5f5f5',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  dataCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  cellText: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default ResultCard;