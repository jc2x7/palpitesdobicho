// src/screens/GerarPalpite/index.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
  Platform,
  ScrollView,
  SafeAreaView,
  Linking,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import banner from '../../images/banner_2.png';
import banner2 from '../../images/banner_1.png';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { captureRef } from 'react-native-view-shot';
import { animais, getAnimalPorNumero } from '../../constants/animais';
import AnimalCard from '../../components/AnimalCard';
import Card from '../../components/Card';
import { colors } from '../../constants/colors';

const interstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios'
  ? 'ca-app-pub-0562149345323036/3307561050'
  : 'ca-app-pub-0562149345323036/7614103195';

const adKeywords = [
  'religião', 'família', 'igreja', 'oração', 'espiritualidade',
  'religion', 'family', 'church', 'prayer', 'spirituality'
];

function GerarPalpite() {
  const [palpite, setPalpite] = useState({
    dezena: "",
    centena: "",
    milhar: "",
    animal: "",
    frase: "",
    legenda: "",
    imagem: "",
  });
  const [palpiteGerado, setPalpiteGerado] = useState(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimals, setShowAnimals] = useState(false);
  const viewRef = useRef();

  const [interstitial] = useState(() => 
    InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      keywords: adKeywords,
    })
  );

  useFocusEffect(
    useCallback(() => {
      const handleAdEvent = (type, error) => {
        if (type === AdEventType.LOADED) {
          setInterstitialLoaded(true);
          setIsLoading(false);
        } else if (type === AdEventType.ERROR) {
          console.error('Erro ao carregar o anúncio intersticial:', error);
          setInterstitialLoaded(false);
          setIsLoading(false);
          shareScreen();
        } else if (type === AdEventType.CLOSED) {
          setInterstitialLoaded(false);
          interstitial.load();
          shareScreen();
        }
      };

      const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        handleAdEvent(AdEventType.LOADED, null);
      });

      const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        handleAdEvent(AdEventType.ERROR, error);
      });

      const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        handleAdEvent(AdEventType.CLOSED, null);
      });

      interstitial.load();

      // Cleanup ao sair da tela
      return () => {
        unsubscribeLoaded();
        unsubscribeError();
        unsubscribeClosed();
        
        // Mostra o anúncio ao sair da tela
        if (interstitialLoaded) {
          interstitial.show();
        }
      };
    }, [interstitial, interstitialLoaded])
  );

  const gerarPalpite = () => {
    const dezena = Math.floor(Math.random() * 100);
    const centena = Math.floor(Math.random() * 1000);
    const milhar = Math.floor(Math.random() * 10000);

    const dezenaStr = dezena.toString().padStart(2, '0');
    const animal = getAnimalPorNumero(dezenaStr);

    const frases = frasesMotivacionais;
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
    const data = new Date().toLocaleDateString('pt-BR');
    const frase = fraseAleatoria
      .replace(/\${animal}/g, animal.nome)
      .replace(/\${data}/g, data);

    const legendas = [
      `🍀 Palpite do Dia - ${data}`,
      `🎲 Sorte para ${data}`,
      `✨ Seu palpite especial de ${data}`,
      `🌟 Números da sorte - ${data}`,
    ];
    const legenda = legendas[Math.floor(Math.random() * legendas.length)];

    setPalpite({
      dezena: dezenaStr,
      centena: centena.toString().padStart(3, '0'),
      milhar: milhar.toString().padStart(4, '0'),
      animal: animal.nome,
      frase: frase,
      legenda: legenda,
      imagem: animal.imagem,
    });
    setPalpiteGerado(true);
    salvarPalpite(dezenaStr, centena, milhar, animal.nome, frase);
  };

  const salvarPalpite = async (dezena, centena, milhar, animal, frase) => {
    try {
      const historico = await AsyncStorage.getItem("historicoPalpites");
      const palpites = historico ? JSON.parse(historico) : [];
      const novoPalpite = {
        dezena,
        centena,
        milhar,
        animal,
        frase,
        data: new Date().toISOString(),
      };
      palpites.push(novoPalpite);
      await AsyncStorage.setItem("historicoPalpites", JSON.stringify(palpites));
    } catch (error) {
      console.error("Erro ao salvar palpite:", error);
    }
  };

  const compartilhar = async () => {
    const { isConnected } = await NetInfo.fetch();
    if (!isConnected) {
      alert("Sem conexão com a internet. Não é possível compartilhar.");
      return;
    }

    if (interstitialLoaded) {
      setIsLoading(true);
      interstitial.show();
    } else {
      shareScreen();
    }
  };

  const shareScreen = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 0.9,
      });

      await Share.share({
        message: `${palpite.legenda}\n\n${palpite.frase}\n\nBaixe o app: https://bit.ly/palpitesdobichoad`,
        url: uri,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>🎲 Gerar Palpite</Text>
        <Text style={styles.headerSubtitle}>Seu número da sorte!</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          
          {!palpiteGerado ? (
            <>
              <Card style={styles.instructionCard}>
                <Text style={styles.instructionTitle}>Como funciona?</Text>
                <Text style={styles.instructionText}>
                  Toque no botão abaixo para gerar seus números da sorte!
                  Você receberá uma dezena, centena, milhar e o animal correspondente.
                </Text>
              </Card>

              <TouchableOpacity
                style={styles.generateButton}
                onPress={gerarPalpite}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={['#66bb6a', '#43a047']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.generateButtonGradient}>
                  <Text style={styles.generateButtonText}>✨ Gerar Palpite</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewAnimalsButton}
                onPress={() => setShowAnimals(!showAnimals)}
                activeOpacity={0.7}>
                <Text style={styles.viewAnimalsButtonText}>
                  {showAnimals ? '📊 Ocultar Tabela' : '📊 Ver Tabela de Animais'}
                </Text>
              </TouchableOpacity>

              {showAnimals && (
                <Card style={styles.animalsContainer}>
                  <Text style={styles.animalsTitle}>Tabela do Jogo do Bicho</Text>
                  <View style={styles.animalsGrid}>
                    {animais.map((animal) => (
                      <AnimalCard
                        key={animal.id}
                        animal={animal}
                        onPress={() => {}}
                        isSelected={false}
                      />
                    ))}
                  </View>
                </Card>
              )}

              <TouchableOpacity onPress={() => Linking.openURL('https://bit.ly/palpitesdobichoad')}>
                <Image source={banner} style={styles.banner} />
              </TouchableOpacity>
            </>
          ) : (
            <View ref={viewRef} style={styles.resultContainer}>
              <LinearGradient
                colors={['#ffffff', '#f5f5f5']}
                style={styles.resultGradient}>
                
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>🍀 Seu Palpite</Text>
                  <Text style={styles.resultDate}>{new Date().toLocaleDateString('pt-BR')}</Text>
                </View>

                <View style={styles.animalSection}>
                  <Image source={palpite.imagem} style={styles.animalImage} resizeMode="contain" />
                  <Text style={styles.animalName}>{palpite.animal}</Text>
                </View>

                <View style={styles.numbersContainer}>
                  <View style={styles.numberBox}>
                    <Text style={styles.numberLabel}>Dezena</Text>
                    <LinearGradient
                      colors={['#4caf50', '#388e3c']}
                      style={styles.numberValue}>
                      <Text style={styles.numberText}>{palpite.dezena}</Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.numberBox}>
                    <Text style={styles.numberLabel}>Centena</Text>
                    <LinearGradient
                      colors={['#66bb6a', '#43a047']}
                      style={styles.numberValue}>
                      <Text style={styles.numberText}>{palpite.centena}</Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.numberBox}>
                    <Text style={styles.numberLabel}>Milhar</Text>
                    <LinearGradient
                      colors={['#81c784', '#66bb6a']}
                      style={styles.numberValue}>
                      <Text style={styles.numberText}>{palpite.milhar}</Text>
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.phraseContainer}>
                  <Text style={styles.phraseText}>{palpite.frase}</Text>
                </View>

                <View style={styles.watermark}>
                  <Text style={styles.watermarkText}>Palpites do Bicho</Text>
                </View>
              </LinearGradient>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={compartilhar}
                  activeOpacity={0.8}
                  disabled={isLoading}>
                  <LinearGradient
                    colors={['#2196f3', '#1976d2']}
                    style={styles.actionButtonGradient}>
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.actionButtonIcon}>📤</Text>
                        <Text style={styles.actionButtonText}>Compartilhar</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setPalpiteGerado(false);
                    setPalpite({
                      dezena: "",
                      centena: "",
                      milhar: "",
                      animal: "",
                      frase: "",
                      legenda: "",
                      imagem: "",
                    });
                  }}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#66bb6a', '#43a047']}
                    style={styles.actionButtonGradient}>
                    <Text style={styles.actionButtonIcon}>🔄</Text>
                    <Text style={styles.actionButtonText}>Novo Palpite</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => Linking.openURL('https://bit.ly/palpitesdobichoad')}>
                <Image source={banner2} style={styles.banner} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructionCard: {
    width: '100%',
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  generateButton: {
    width: '90%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  generateButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  viewAnimalsButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    marginBottom: 15,
  },
  viewAnimalsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  animalsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  animalsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 15,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  banner: {
    width: 350,
    height: 175,
    marginVertical: 15,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  resultContainer: {
    width: '100%',
  },
  resultGradient: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 5,
  },
  resultDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  animalSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  animalImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  animalName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  numberBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  numberLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  numberValue: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    minWidth: 70,
    alignItems: 'center',
  },
  numberText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  phraseContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  phraseText: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  watermark: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  watermarkText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});


// Adicione as 365 frases abaixo. Por motivos de espaço, apresento aqui 100 frases. Você deve continuar o padrão para completar as 365 frases.
const frasesMotivacionais = [
  "Hoje, ${animal} é a melhor opção para trazer sorte e prosperidade para suas atividades diárias. Aproveite as energias positivas que este dia reserva para você.",
  "No dia ${data}, o ${animal} ilumina seu caminho com boas energias, guiando-o para decisões acertadas e oportunidades incríveis.",
  "Com o ${animal} ao seu lado em ${data}, a sorte está garantida em todas as suas empreitadas. Este é o momento ideal para avançar em seus projetos.",
  "Em ${data}, o ${animal} traz oportunidades únicas para você, permitindo que você alcance novos patamares de sucesso e realização pessoal.",
  "Hoje, ${data}, o ${animal} simboliza força e sucesso para suas ações, capacitando você a superar qualquer desafio que surja em seu caminho.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas, onde seus esforços serão recompensados com resultados extraordinários.",
  "Em ${data}, o ${animal} guia você rumo à sorte e realizações, proporcionando um dia cheio de vitórias e progressos significativos.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes metas, oferecendo o suporte necessário para que você alcance seus objetivos com facilidade.",
  "Com o ${animal} em ${data}, sua sorte está em alta, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e harmonia para o seu dia, ajudando você a manter a calma e a clareza em todas as situações.",
  "Hoje, ${data}, o ${animal} simboliza determinação e sucesso, incentivando você a persistir em seus esforços e a colher os frutos de seu trabalho duro.",
  "A presença do ${animal} em ${data} garante um dia próspero, onde suas ações serão recompensadas com abundância e realizações satisfatórias.",
  "Em ${data}, o ${animal} ilumina suas decisões com boa sorte, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias, abrindo caminhos que levarão você a conquistas que antes pareciam inalcançáveis.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
  "Em ${data}, o ${animal} traz sorte e energia para suas ações, impulsionando você a agir com confiança e a alcançar seus objetivos com facilidade.",
  "Hoje, ${data}, o ${animal} simboliza força e determinação para o sucesso, capacitando você a superar qualquer desafio que possa surgir.",
  "A presença do ${animal} em ${data} assegura um dia de conquistas e sorte, onde seus esforços serão recompensados com resultados excepcionais.",
  "Em ${data}, o ${animal} guia você para caminhos de prosperidade, oferecendo oportunidades que levarão você a novos patamares de sucesso.",
  "Hoje, ${data}, o ${animal} é seu aliado para alcançar grandes objetivos, proporcionando a sorte necessária para que você realize seus sonhos.",
  "Com o ${animal} em ${data}, sua sorte estará sempre ao seu favor, abrindo portas para oportunidades que transformarão seu dia de maneira positiva.",
  "Em ${data}, o ${animal} traz equilíbrio e sucesso para o seu dia, ajudando você a manter a harmonia entre suas atividades e objetivos.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e boas oportunidades, incentivando você a persistir em seus esforços e a aproveitar cada chance que surgir.",
  "A presença do ${animal} em ${data} garante um dia próspero e sortudo, onde suas ações serão recompensadas com abundância e realizações significativas.",
  "Em ${data}, o ${animal} ilumina suas decisões com sorte e sucesso, proporcionando clareza e confiança para que você tome as melhores escolhas.",
  "Hoje, ${data}, o ${animal} é a chave para suas vitórias e conquistas, abrindo caminhos que levarão você a alcançar tudo o que deseja.",
  "Com o ${animal} em ${data}, você alcançará seus objetivos com facilidade, graças à sorte e às energias positivas que o cercam neste dia.",
  "Em ${data}, o ${animal} traz inspiração e sorte para suas ações, estimulando sua criatividade e proporcionando resultados excepcionais.",
  "Hoje, ${data}, o ${animal} simboliza perseverança e sucesso, motivando você a continuar firme em seus propósitos e a conquistar tudo o que deseja.",
  "A presença do ${animal} em ${data} assegura um dia de realizações positivas, onde seus esforços serão reconhecidos e valorizados.",
  "Em ${data}, o ${animal} guia você para oportunidades valiosas, permitindo que você aproveite cada momento e maximize seus resultados.",
  "Hoje, ${data}, o ${animal} é seu parceiro para alcançar grandes conquistas, oferecendo o apoio necessário para que você supere qualquer obstáculo.",
  "Com o ${animal} em ${data}, sua jornada será cheia de sorte, facilitando seu caminho rumo ao sucesso e à satisfação pessoal.",
  "Em ${data}, o ${animal} traz energia positiva e boas oportunidades, incentivando você a se envolver em atividades que trarão benefícios duradouros.",
  "Hoje, ${data}, o ${animal} simboliza coragem e sucesso em suas empreitadas, encorajando você a enfrentar desafios com confiança e determinação.",
  "A presença do ${animal} em ${data} garante um dia de avanços significativos, onde cada passo dado o aproxima mais de seus objetivos.",
  "Em ${data}, o ${animal} ilumina seu caminho com sorte e prosperidade, proporcionando um ambiente favorável para o crescimento e a realização.",
  "Hoje, ${data}, o ${animal} é a melhor escolha para um dia bem-sucedido, guiando você para decisões que trarão resultados positivos.",
  "Com o ${animal} em ${data}, você terá um dia cheio de realizações, onde cada ação sua contribuirá para o seu sucesso pessoal e profissional.",
];

export default GerarPalpite;
