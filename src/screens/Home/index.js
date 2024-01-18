// src/screens/Home/index.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import logo from '../../images/logo.png'; // Importação da logo
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";

const androidAdUnitId_banner = "ca-app-pub-0562149345323036/2113244946";
const iosAdUnitId_banner = "ca-app-pub-0562149345323036/8222628770";


const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === "ios"
  ? iosAdUnitId_banner
  : androidAdUnitId_banner;


function Home({ navigation }) {



  return (
    <SafeAreaView >
    <ScrollView>
    <View style={styles.container}>
            <Image source={logo} style={styles.logo} /> 

      <Text style={styles.header}>Jogo do Bicho</Text>
        <View style={styles.centerAd}>
                 </View>
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

      <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              networkExtras: {
                collapsible: "bottom",
              },
            }}
          />

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
  centerAd: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },
});

export default Home;
