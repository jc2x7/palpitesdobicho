// src/screens/Home/index.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import logo from '../../images/logo.png'; // Importação da logo
import { AppOpenAd, TestIds, AdEventType, BannerAdSize } from 'react-native-google-mobile-ads';




function Home({ navigation }) {
  const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-0562149345323036/2113244946';



  return (
    <SafeAreaView>
    <ScrollView style={styles.container}>
    <View >
            <Image source={logo} style={styles.logo} /> 

      <Text style={styles.header}>Jogo do Bicho</Text>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.SMART_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
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
