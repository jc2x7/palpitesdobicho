// src/components/AnimalCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';

const AnimalCard = ({ animal, onPress, isSelected }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(animal)}
      style={styles.cardContainer}>
      <LinearGradient
        colors={isSelected ? ['#66bb6a', '#43a047'] : ['#ffffff', '#f5f5f5']}
        style={styles.gradient}>
        <View style={styles.numberBadge}>
          <Text style={styles.animalId}>{animal.id.toString().padStart(2, '0')}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image source={animal.imagem} style={styles.animalImage} resizeMode="contain" />
        </View>

        <View style={styles.numerosContainer}>
          {animal.numeros.map((numero, index) => (
            <View key={index} style={styles.numeroBox}>
              <Text style={styles.numeroText}>{numero}</Text>
            </View>
          ))}
        </View>

        <View style={styles.nomeContainer}>
          <Text style={[styles.animalNome, isSelected && styles.animalNomeSelected]}>
            {animal.nome}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  gradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 200,
  },
  numberBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  animalId: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 80,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalImage: {
    width: '80%',
    height: '100%',
  },
  numerosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 8,
    gap: 4,
  },
  numeroBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  numeroText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#424242',
  },
  nomeContainer: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
  },
  animalNome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  animalNomeSelected: {
    color: '#fff',
  },
});

export default AnimalCard;