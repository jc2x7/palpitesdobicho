// src/components/ResultCard.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ResultCard = ({ title, data }) => {
  if (!data || !data.headers || !data.rows || data.rows.length === 0) {
    return null;
  }

  const numColumns = data.headers.length;
  const columnWidth = Math.max(90, (SCREEN_WIDTH - 64) / numColumns);

  return (
    <View style={styles.container}>
      {/* Título - Fixo, sempre visível */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </LinearGradient>

      {/* Tabela - Com scroll horizontal */}
      <View style={styles.tableContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          persistentScrollbar={true}
          contentContainerStyle={styles.scrollContent}>
          
          <View>
            {/* Header da Tabela */}
            <View style={styles.headerRow}>
              {data.headers.map((header, index) => (
                <View 
                  key={index} 
                  style={[styles.headerCell, { width: columnWidth }]}>
                  <Text 
                    style={styles.headerText} 
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}>
                    {header}
                  </Text>
                </View>
              ))}
            </View>

            {/* Linhas da Tabela */}
            <ScrollView 
              style={styles.verticalScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}>
              {data.rows.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={[
                    styles.dataRow,
                    rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}>
                  {row.map((cell, cellIndex) => (
                    <View 
                      key={cellIndex} 
                      style={[styles.dataCell, { width: columnWidth }]}>
                      <Text style={styles.cellText} numberOfLines={2}>
                        {cell}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
    marginBottom: 8,
  },
  titleContainer: {
    marginBottom:5,
  
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
     marginBottom:5,
  },
  tableContainer: {
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    marginTop: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 50,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  verticalScroll: {
    maxHeight: 400,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    minHeight: 40,
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  dataCell: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  cellText: {
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default ResultCard;