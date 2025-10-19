// src/screens/GerarPalpite/index.js
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
  Platform,
  ScrollView,
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

      return () => {
        unsubscribeLoaded();
        unsubscribeError();
        unsubscribeClosed();
        
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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}>
        
        {!palpiteGerado ? (
          <>
            {/* Card Instruções */}
            <View style={styles.whiteCard}>
              <Text style={styles.cardTitle}>✨ Como funciona?</Text>
              <Text style={styles.cardText}>
                Toque no botão abaixo para gerar seus números da sorte!
              </Text>
            </View>

            {/* Botão Gerar Palpite */}
            <TouchableOpacity 
              style={styles.bigButton}
              onPress={gerarPalpite}
              activeOpacity={0.7}>
              <Text style={styles.bigButtonText}>🎲 Gerar Palpite</Text>
            </TouchableOpacity>

            {/* Botão Ver Tabela */}
            <TouchableOpacity 
              style={[styles.smallButton, showAnimals && styles.smallButtonDanger]}
              onPress={() => setShowAnimals(!showAnimals)}
              activeOpacity={0.7}>
              <Text style={styles.smallButtonText}>
                {showAnimals ? '✕ Ocultar Tabela' : '📊 Ver Tabela de Animais'}
              </Text>
            </TouchableOpacity>

            {/* Tabela de Animais */}
            {showAnimals && (
              <View style={styles.whiteCard}>
                <Text style={styles.cardTitle}>Tabela dos Bichos</Text>
                <View style={styles.animalsGrid}>
                  {animais.map((animal) => (
                    <AnimalCard
                      key={animal.id}
                      animal={animal}
                      style={styles.animalCard}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Banner */}
            <View style={styles.bannerContainer}>
              <TouchableOpacity onPress={() => Linking.openURL('https://bit.ly/palpitesdobichoad')}>
                <Image source={banner} style={styles.banner} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Resultado para Captura */}
            <View ref={viewRef} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultHeaderTitle}>🍀 Seu Palpite</Text>
                <Text style={styles.resultHeaderDate}>
                  {new Date().toLocaleDateString('pt-BR')}
                </Text>
              </View>

              <View style={styles.animalSection}>
                <View style={styles.animalCircle}>
                  <Image 
                    source={palpite.imagem} 
                    style={styles.animalImg} 
                    resizeMode="contain" 
                  />
                </View>
                <Text style={styles.animalNameText}>{palpite.animal}</Text>
              </View>

              <View style={styles.numbersRow}>
                <View style={styles.numBox}>
                  <Text style={styles.numLabel}>Dezena</Text>
                  <View style={styles.numValue}>
                    <Text style={styles.numText}>{palpite.dezena}</Text>
                  </View>
                </View>

                <View style={styles.numBox}>
                  <Text style={styles.numLabel}>Centena</Text>
                  <View style={styles.numValue}>
                    <Text style={styles.numText}>{palpite.centena}</Text>
                  </View>
                </View>

                <View style={styles.numBox}>
                  <Text style={styles.numLabel}>Milhar</Text>
                  <View style={styles.numValue}>
                    <Text style={styles.numText}>{palpite.milhar}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.phraseBox}>
                <Text style={styles.phraseText}>{palpite.frase}</Text>
              </View>

              <View style={styles.watermarkBox}>
                <Text style={styles.watermarkText}>Palpites do Bicho</Text>
              </View>
            </View>

            {/* Botões de Ação */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={compartilhar}
                disabled={isLoading}
                activeOpacity={0.7}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>📤 Compartilhar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.actionBtnGreen]}
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
                activeOpacity={0.7}>
                <Text style={styles.actionBtnText}>🔄 Novo Palpite</Text>
              </TouchableOpacity>
            </View>

            {/* Banner */}
            <View style={styles.bannerContainer}>
              <TouchableOpacity onPress={() => Linking.openURL('https://bit.ly/palpitesdobichoad')}>
                <Image source={banner2} style={styles.banner} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bigButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bigButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  smallButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  smallButtonDanger: {
    backgroundColor: '#f44336',
  },
  smallButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  animalCard: {
    width: '48%',
    marginBottom: 10,
  },
  bannerContainer: {
    marginVertical: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 160,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  resultHeader: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  resultHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  resultHeaderDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  animalSection: {
  alignItems: 'center',
  marginBottom: 24,
},
animalCircle: {
  width: 160,
  height: 160,
  backgroundColor: colors.primaryLight,
  borderRadius: 80,
  padding: 20,
  marginBottom: 16,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: colors.primary,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 8,
  borderWidth: 4,
  borderColor: '#fff',
},
animalImg: {
  width: '100%',
  height: '100%',
  borderRadius: 60,
},
animalNameText: {
  fontSize: 28,
  fontWeight: '800',
  color: colors.primary,
  textTransform: 'uppercase',
  letterSpacing: 1,
},
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  numBox: {
    alignItems: 'center',
    flex: 1,
  },
  numLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  numValue: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  numText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  phraseBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  phraseText: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  watermarkBox: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  watermarkText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#25D366',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionBtnGreen: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
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
