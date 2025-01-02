// src/screens/Historico/index.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

const { width, height } = Dimensions.get('window');

const imagensAnimais = {
  Avestruz: require('../../images/animais/Avestruz.png'),
  Aguia: require('../../images/animais/Aguia.png'),
  Burro: require('../../images/animais/Burro.png'),
  Borboleta: require('../../images/animais/Borboleta.png'),
  Cachorro: require('../../images/animais/Cachorro.png'),
  Cabra: require('../../images/animais/Cabra.png'),
  Carneiro: require('../../images/animais/Carneiro.png'),
  Camelo: require('../../images/animais/Camelo.png'),
  Cobra: require('../../images/animais/Cobra.png'),
  Coelho: require('../../images/animais/Coelho.png'),
  Cavalo: require('../../images/animais/Cavalo.png'),
  Elefante: require('../../images/animais/Elefante.png'),
  Galo: require('../../images/animais/Galo.png'),
  Gato: require('../../images/animais/Gato.png'),
  Jacare: require('../../images/animais/Jacare.png'),
  Leao: require('../../images/animais/Leao.png'),
  Macaco: require('../../images/animais/Macaco.png'),
  Porco: require('../../images/animais/Porco.png'),
  Pavao: require('../../images/animais/Pavao.png'),
  Peru: require('../../images/animais/Peru.png'),
  Touro: require('../../images/animais/Touro.png'),
  Tigre: require('../../images/animais/Tigre.png'),
  Urso: require('../../images/animais/Urso.png'),
  Veado: require('../../images/animais/Veado.png'),
  Vaca: require('../../images/animais/Vaca.png'),
};

function Historico() {
  const [historico, setHistorico] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPalpite, setSelectedPalpite] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const modalViewRef = useRef();

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (e, gestureState) => {
      if (Math.abs(gestureState.dx) > 50) {
        if (gestureState.dx > 0 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          setSelectedPalpite(historico[currentIndex - 1]);
        } else if (gestureState.dx < 0 && currentIndex < historico.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setSelectedPalpite(historico[currentIndex + 1]);
        }
      }
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  });

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const historicoSalvo = await AsyncStorage.getItem('historicoPalpites_teste3');
        if (historicoSalvo) {
          setHistorico(JSON.parse(historicoSalvo));
        } else {
          setHistorico([]);
        }
      } catch (error) {
        console.error('Erro ao carregar o histórico', error);
        setHistorico([]);
      }
    };

    carregarHistorico();
  }, []);

  const abrirModal = (palpite, index) => {
    setSelectedPalpite(palpite);
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setSelectedPalpite(null);
    setModalVisible(false);
  };

  const shareScreen = async () => {
    if (!modalViewRef.current) {
      Alert.alert('Erro', 'Não foi possível capturar a tela.');
      return;
    }

    try {
      setIsSharing(true);
      const uri = await captureRef(modalViewRef, {
        format: 'png',
        quality: 0.8,
      });

      const shareOptions = {
        title: 'Compartilhar Palpite',
        url: uri,
        type: 'image/png',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error) {
      if (error && error.message !== 'User did not share') {
        Alert.alert('Erro', 'Não foi possível compartilhar a tela.');
        console.error('Erro ao compartilhar a tela:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {historico.length > 0 ? (
          historico.map((palpite, index) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => abrirModal(palpite, index)}>
              <Text style={styles.dataText}>Data: {palpite.data}</Text>
              <Text style={styles.animalText}>Animal: {palpite.animal}</Text>
              <Text style={styles.numerosText}>
                Dezena: {palpite.dezena} | Centena: {palpite.centena} | Milhar: {palpite.milhar}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum histórico disponível.</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={fecharModal}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            ref={modalViewRef}
            style={[
              styles.modalContainer,
              { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
            ]}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity style={styles.closeButton} onPress={fecharModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            {selectedPalpite && (
              <>
                {selectedPalpite.animal && imagensAnimais[selectedPalpite.animal] && (
                  <Image source={imagensAnimais[selectedPalpite.animal]} style={styles.modalImage} />
                )}
                <Text style={styles.modalAnimalText}>{selectedPalpite.animal}</Text>
                <Text style={styles.modalNumerosText}>
                  Dezena: {selectedPalpite.dezena} | Centena: {selectedPalpite.centena} | Milhar: {selectedPalpite.milhar}
                </Text>
                <Text style={styles.modalFraseText}>{selectedPalpite.frase}</Text>
                {selectedPalpite.legenda !== "" && (
                  <Text style={styles.modalLegendaText}>{selectedPalpite.legenda}</Text>
                )}
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={shareScreen}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.shareButtonText}>Compartilhar Tela</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
            {historico.length > 0 && (
              <View style={styles.storyIndicatorContainer}>
                {historico.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.storyIndicator,
                      { backgroundColor: index === currentIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)' }
                    ]}
                  />
                ))}
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
  },
  modalImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
    marginBottom: 20,
  },
  modalAnimalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalNumerosText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalFraseText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalLegendaText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  shareButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyIndicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    justifyContent: 'center',
  },
  storyIndicator: {
    width: 10,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 2,
  },
});

export default Historico;
