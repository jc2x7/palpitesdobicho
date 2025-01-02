// src/screens/App/index.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  View, 
  Text, 
  ScrollView, 
  Alert,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Table, Row } from 'react-native-table-component';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios'
  ? 'ca-app-pub-0562149345323036/8222628770'
  : 'ca-app-pub-0562149345323036/2113244946';

const App = () => {
  const bannerRef = useRef(null);
  const screenRef = useRef();

  useForeground(() => {
    if (Platform.OS === 'ios') {
      bannerRef.current?.load();
    }
  });

  const [loading, setLoading] = useState(true);
  const [tableDataAtual, setTableDataAtual] = useState({ headers: [], rows: [] });
  const [tableDataAnterior, setTableDataAnterior] = useState({ headers: [], rows: [] });
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setTableDataAtual({ headers: [], rows: [] });
      setTableDataAnterior({ headers: [], rows: [] });
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await fetchResultadosAtual();
      await fetchResultadosAnteriores();
      setLoading(false);
    };

    initializeData();

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const fetchResultadosAtual = async () => {
    try {
      const response = await fetch(`https://correcaodesolo.com.br/teste/resultados_atual.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const json = await response.json();
      setTableDataAtual({
        headers: json.headers,
        rows: json.rows,
      });
    } catch (error) {
      console.error('Erro ao buscar ou processar resultados atuais:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar os resultados atuais.');
    }
  };

  const fetchResultadosAnteriores = async () => {
    try {
      const response = await fetch(`https://correcaodesolo.com.br/teste/resultados_anteriores.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const json = await response.json();
      setTableDataAnterior({
        headers: json.headers,
        rows: json.rows,
      });
    } catch (error) {
      console.error('Erro ao buscar ou processar resultados anteriores:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar os resultados anteriores.');
    }
  };

  const calculateColumnWidths = (numColumns) => {
    const padding = 16;
    const availableWidth = screenWidth - padding * 2;
    const minWidth = 100;
    return new Array(numColumns).fill(Math.max(availableWidth / numColumns, minWidth));
  };

  const renderTable = (data, title) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <Table>
            <Row
              data={data.headers}
              style={styles.header}
              textStyle={styles.headerText}
              widthArr={calculateColumnWidths(data.headers.length)}
            />
            {data.rows.map((rowData, index) => (
              <Row
                key={index}
                data={rowData}
                style={[
                  styles.row,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow
                ]}
                textStyle={styles.rowText}
                widthArr={calculateColumnWidths(rowData.length)}
              />
            ))}
          </Table>
        </View>
      </ScrollView>
    </View>
  );

  const getFormattedDate = () => {
    const currentDate = new Date();
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    let formattedDate = currentDate.toLocaleDateString('pt-BR', options);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  const shareScreen = async () => {
    if (!screenRef.current) {
      Alert.alert('Erro', 'Não foi possível capturar a tela.');
      return;
    }

    try {
      setIsSharing(true);
      const uri = await captureRef(screenRef, {
        format: 'png',
        quality: 0.8,
      });

      const shareOptions = {
        title: 'Compartilhar Tela',
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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} ref={screenRef}>
        <ActivityIndicator size="large" color="#4A5AB9" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.MEDIUM_RECTANGLE}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          style={styles.loadingBanner}
        />
                <Text style={styles.loadingText}>Se der erro, volte depois alguns minutos.</Text>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} ref={screenRef}>
      <TouchableOpacity style={styles.shareButtonHeader} onPress={shareScreen} disabled={isSharing}>
        {isSharing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.shareButtonHeaderText}>Compartilhar</Text>
        )}
      </TouchableOpacity>
      <ScrollView>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{getFormattedDate()}</Text>
          <BannerAd
            ref={bannerRef}
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
        <Text style={{margin:5}}>Arraste as tabelas para o lado para poder ler todos os resultados!</Text>
        {renderTable(tableDataAtual, "Resultados do Dia")}
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
                <Text style={{margin:5}}>Arraste as tabelas para o lado para poder ler todos os resultados!</Text>

        {renderTable(tableDataAnterior, "Resultados Anteriores")}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2e7d32',
  },
  loadingBanner: {
    marginTop: 20,
  },
  dateHeader: {
    backgroundColor: '#2e7d32',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2C3E50',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    height: 50,
    backgroundColor: '#2e7d32',
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 14,
    padding: 5,
  },
  row: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  evenRow: {
    backgroundColor: '#F8FAFC',
  },
  oddRow: {
    backgroundColor: '#FFFFFF',
  },
  rowText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#374151',
    padding: 5,
  },
  shareButtonHeader: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#25D366',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 1,
  },
  shareButtonHeaderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default App;
