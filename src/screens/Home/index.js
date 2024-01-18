// src/screens/Home/index.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import logo from '../../images/logo.png'; // Importação da logo

function Home({ navigation }) {
  return (
    <View style={styles.container}>
            <Image source={logo} style={styles.logo} /> 

      <Text style={styles.header}>Jogo do Bicho</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9', // Um tom claro de verde
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#2e7d32', // Um tom escuro de verde
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
    width: 250,  // Defina o tamanho conforme necessário
    height: 250, // Defina o tamanho conforme necessário
    marginBottom: 20,
    borderRadius: 20, // Arredonda as bordas da imagem
  },
});

export default Home;
