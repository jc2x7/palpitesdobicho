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
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import logo from '../../images/logo.png';
import bannerImage from '../../images/banner_2.png';
import GradientButton from '../../components/GradientButton';
import Card from '../../components/Card';
import { colors } from '../../constants/colors';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const interstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios'
  ? 'ca-app-pub-0562149345323036/3395876993'
  : 'ca-app-pub-0562149345323036/9542002948';

const adKeywords = [
  'Aposta',
  'Jogos',
  'Loteria',
  'Bingo',
  'Futebol',
  'Bet',
  'Flamengo',
  'Amazon',
  'Shoppe',
  'Aliexpress',
];

function Home({ navigation }) {
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [interstitial] = useState(() =>
    InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      keywords: adKeywords,
    })
  );

  useEffect(() => {
    const loadInterstitial = () => {
      interstitial.load();
    };

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setInterstitialLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setInterstitialLoaded(false);
        loadInterstitial();
        navigation.navigate('Resultados');
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Erro ao carregar o anúncio intersticial:', error);
        navigation.navigate('Resultados');
      }
    );

    loadInterstitial();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [interstitial, navigation]);

  const handleResultadosPress = () => {
    if (interstitialLoaded) {
      interstitial.show();
    } else {
      navigation.navigate('Resultados');
    }
  };

  const handleBannerPress = () => {
    Linking.openURL('https://bit.ly/palpitesdobichoad');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.background, '#e8f5e9', '#f1f8f4']}
        style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Logo com Card */}
            <Card style={styles.logoCard}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.header}>Gerador de Números</Text>
              <Text style={styles.subtitle}>
                Seus palpites de sorte! 🍀
              </Text>
            </Card>

            {/* Botões principais */}
            <View style={styles.buttonsContainer}>
              <GradientButton
                title="Gerar Palpite"
                icon="🎲"
                onPress={() => navigation.navigate('Gerar Palpite')}
              />

              <GradientButton
                title="Resultados"
                icon="🏆"
                onPress={handleResultadosPress}
              />

              {/* Banner com Card */}
              <Card style={styles.bannerCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleBannerPress}>
                  <Image source={bannerImage} style={styles.banner} />
                </TouchableOpacity>
              </Card>

              <GradientButton
                title="Histórico"
                icon="📊"
                onPress={() => navigation.navigate('Historico')}
              />

              <GradientButton
                title="Sobre"
                icon="ℹ️"
                onPress={() => navigation.navigate('Sobre')}
              />
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  logoCard: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 15,
    borderRadius: 90,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  bannerCard: {
    padding: 10,
    marginVertical: 15,
  },
  banner: {
    width: '100%',
    height: 160,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  footer: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
});

export default Home;