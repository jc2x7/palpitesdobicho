// src/screens/Home/index.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import logo from '../../images/logo.png'; // Importação da logo

function Home({ navigation }) {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} />

          <Text style={styles.header}>Gerador de Números</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Gerar Palpite')}>
            <Text style={styles.buttonText}>Gerar Palpite</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Resultados')}>
            <Text style={styles.buttonText}>Resultados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Historico')}>
            <Text style={styles.buttonText}>Histórico</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Sobre')}>
            <Text style={styles.buttonText}>Sobre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#2e7d32', // Um tom escuro de verde
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4caf50', // Um tom médio de verde
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 250, // Defina o tamanho conforme necessário
    height: 250, // Defina o tamanho conforme necessário
    marginBottom: 20,
    borderRadius: 20, // Arredonda as bordas da imagem
  },
});

export default Home;
