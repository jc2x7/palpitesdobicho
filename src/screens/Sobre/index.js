import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

const AboutPage = () => {
  const handleOpenLink = (url) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sobre o Aplicativo</Text>

      <TouchableOpacity
        style={[styles.button, styles.privacyButton]}
        onPress={() => handleOpenLink('https://bit.ly/3tylw3r')}>
        <Text style={styles.buttonText}>Política de Privacidade</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.privacyButton]}
        onPress={() => handleOpenLink('https://TercosGratisCelular')}>
        <Text style={styles.buttonText}>Aplicativo para rezar o Terço.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.instagramButton]}
        onPress={() => handleOpenLink('https://instagram.com/juliolemosdf')}>
        <Text style={styles.buttonText}>Siga-me no Instagram</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.linkedinButton]}
        onPress={() => handleOpenLink('https://linkedin.com/in/juliolemosdf')}>
        <Text style={styles.buttonText}>LinkedIn</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Cor de fundo leve
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333', // Cor do texto
  },
  button: {
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  privacyButton: {
    backgroundColor: '#4CAF50', // Cor verde
  },
  instagramButton: {
    backgroundColor: '#E1306C', // Cor característica do Instagram
  },
  linkedinButton: {
    backgroundColor: '#0077B5', // Cor característica do LinkedIn
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AboutPage;
