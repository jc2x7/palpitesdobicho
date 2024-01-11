// src/screens/Historico/index.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Historico() {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const historicoSalvo = await AsyncStorage.getItem('historicoPalpites_teste3');
        if (historicoSalvo) {
          setHistorico(JSON.parse(historicoSalvo));
        }
      } catch (error) {
        console.error('Erro ao carregar o histórico', error);
      }
    };

    carregarHistorico();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {historico.map((palpite, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.dataText}>Data: {palpite.data}</Text>
          <Text style={styles.animalText}>Animal: {palpite.animal}</Text>
          <Text style={styles.numerosText}>Dezena: {palpite.dezena} | Centena: {palpite.centena} | Milhar: {palpite.milhar}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dataText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  animalText: {
    fontSize: 16,
    color: '#4caf50',
    marginTop: 5,
  },
  numerosText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default Historico;
