// src/components/GradientButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';

const GradientButton = ({ onPress, title, style, icon }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.button, style]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}>
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 8,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradient: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
});

export default GradientButton;