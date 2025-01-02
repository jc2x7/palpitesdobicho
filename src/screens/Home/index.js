// src/screens/Home/index.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  ScrollView, 
  Linking, 
  Platform 
} from 'react-native';
import logo from '../../images/logo.png'; // Importação da logo
import bannerImage from '../../images/banner_2.png'; // Importação do banner
import { 
  InterstitialAd, 
  AdEventType, 
  TestIds 
} from 'react-native-google-mobile-ads';

const interstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios'
  ? 'ca-app-pub-0562149345323036/3395876993'
  : 'ca-app-pub-0562149345323036/9542002948';

const adKeywords = [
  'Aposta', 'Jogos', 'Loteria', 'Bingo', 'Futebol',
  'Bet', 'Flamengo', 'Amazon', 'Shoppe', 'Aliexpress'
];

function Home({ navigation }) {
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
    keywords: adKeywords,
  });

  useEffect(() => {
    const loadInterstitial = () => {
      interstitial.load();
    };

    const onAdLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
    });

    const onAdClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      loadInterstitial();
      navigation.navigate('Resultados');
    });

    const onAdError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Erro ao carregar o anúncio intersticial:', error);
      navigation.navigate('Resultados');
    });

    loadInterstitial();

    return () => {
      onAdLoaded();
      onAdClosed();
      onAdError();
    };
  }, [interstitial, navigation]);

  const handleResultadosPress = () => {
    if (interstitialLoaded) {
      interstitial.show();
    } else {
      navigation.navigate('Resultados');
    }
  };

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
            onPress={handleResultadosPress}>
            <Text style={styles.buttonText}>Resultados</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL('https://bit.ly/palpitesdobichoad')}>
            <Image source={bannerImage} style={styles.banner} />
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
  banner: {
    width: 400,
    height: 200, // Ajuste a altura conforme necessário
    marginVertical: 20,
    resizeMode: 'contain',
  },
});

export default Home;
