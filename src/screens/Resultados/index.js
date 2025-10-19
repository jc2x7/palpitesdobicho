// src/screens/Resultados/index.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  ActivityIndicator, 
  View, 
  Text, 
  ScrollView, 
  Alert,
  Dimensions,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ResultCard from '../../components/ResultCard';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === 'ios'
  ? 'ca-app-pub-0562149345323036/8222628770'
  : 'ca-app-pub-0562149345323036/2113244946';

const Resultados = () => {
  const bannerRef = useRef(null);

  useForeground(() => {
    if (Platform.OS === 'ios') {
      bannerRef.current?.load();
    }
  });

  const [loading, setLoading] = useState(true);
  const [tableDataAtual, setTableDataAtual] = useState({ headers: [], rows: [] });
  const [tableDataAnterior, setTableDataAnterior] = useState({ headers: [], rows: [] });
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await fetchResultadosAtual();
      await fetchResultadosAnteriores();
      setLoading(false);
    };

    initializeData();
  }, []);

  const fetchResultadosAtual = async () => {
    try {
      const response = await fetch(
        `https://correcaodesolo.com.br/teste/resultados_atual.json?t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const json = await response.json();
      setTableDataAtual({
        headers: json.headers,
        rows: json.rows,
      });
    } catch (error) {
      console.error('Erro ao buscar resultados atuais:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar os resultados atuais.');
    }
  };

  const fetchResultadosAnteriores = async () => {
    try {
      const response = await fetch(
        `https://correcaodesolo.com.br/teste/resultados_anteriores.json?t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const json = await response.json();
      setTableDataAnterior({
        headers: json.headers,
        rows: json.rows,
      });
    } catch (error) {
      console.error('Erro ao buscar resultados anteriores:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar os resultados anteriores.');
    }
  };

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

  const generatePDFHTML = () => {
    const generateTableHTML = (data, title) => {
      if (!data || !data.headers || !data.rows) return '';

      let headerHTML = data.headers.map(h => `<th>${h}</th>`).join('');
      let rowsHTML = data.rows.map((row, index) => {
        const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
        const cells = row.map(cell => `<td>${cell}</td>`).join('');
        return `<tr class="${rowClass}">${cells}</tr>`;
      }).join('');

      return `
        <div class="table-section">
          <h2>${title}</h2>
          <table>
            <thead>
              <tr>${headerHTML}</tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      `;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
          }
          .header {
            text-align: center;
            background: linear-gradient(135deg, #4caf50, #388e3c);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
          }
          .header h1 { font-size: 24px; margin-bottom: 8px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .table-section {
            margin-bottom: 30px;
            background: white;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            page-break-inside: avoid;
          }
          .table-section h2 {
            color: #2e7d32;
            font-size: 18px;
            margin-bottom: 15px;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 2px solid #4caf50;
          }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th {
            background-color: #4caf50;
            color: white;
            padding: 8px 6px;
            text-align: center;
            font-weight: 700;
            border: 1px solid #388e3c;
          }
          td {
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #e0e0e0;
          }
          .even-row { background-color: #f5f5f5; }
          .odd-row { background-color: #ffffff; }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            background-color: #4caf50;
            color: white;
            border-radius: 10px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏆 Resultados</h1>
          <p>${getFormattedDate()}</p>
        </div>
        ${generateTableHTML(tableDataAtual, 'Resultados do Dia')}
        ${generateTableHTML(tableDataAnterior, 'Resultados Anteriores')}
        <div class="footer">
          <p>Palpites do Bicho - ${new Date().getFullYear()}</p>
          <p style="margin-top: 5px; font-size: 11px;">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;
  };

  const shareScreen = async () => {
    try {
      setIsSharing(true);

      const htmlContent = generatePDFHTML();
      
      const options = {
        html: htmlContent,
        fileName: `Resultados_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`,
        directory: 'Documents',
        base64: true,
      };

      const pdf = await RNHTMLtoPDF.convert(options);

      if (!pdf.filePath) {
        Alert.alert('Erro', 'Não foi possível gerar o PDF.');
        return;
      }

      const shareOptions = {
        title: 'Compartilhar Resultados',
        url: `file://${pdf.filePath}`,
        type: 'application/pdf',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error) {
      if (error && error.message !== 'User did not share') {
        Alert.alert('Erro', 'Não foi possível compartilhar os resultados.');
        console.error('Erro ao compartilhar:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando resultados...</Text>
          <Text style={styles.loadingSubText}>Aguarde um momento</Text>
          
          <View style={styles.loadingBannerContainer}>
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.MEDIUM_RECTANGLE}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
          
          <Text style={styles.loadingErrorText}>
            Se der erro, volte depois em alguns minutos.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>🏆 Resultados</Text>
            <Text style={styles.headerDate}>{getFormattedDate()}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={shareScreen} 
            disabled={isSharing}
            activeOpacity={0.8}>
            {isSharing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.shareButtonIcon}>📄</Text>
                <Text style={styles.shareButtonText}>PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Banner superior */}
        <View style={styles.bannerContainer}>
          <BannerAd
            ref={bannerRef}
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>

        {/* Resultados do Dia */}
        <View style={styles.tableSection}>
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>👉 Arraste para o lado para ver todos os dados</Text>
          </View>
          <ResultCard title="Resultados do Dia" data={tableDataAtual} />
        </View>

        {/* Banner intermediário */}
        <View style={styles.bannerContainer}>
          <BannerAd
            ref={bannerRef}
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>

        {/* Resultados Anteriores */}
        <View style={styles.tableSection}>
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>👉 Arraste para o lado para ver todos os dados</Text>
          </View>
          <ResultCard title="Resultados Anteriores" data={tableDataAnterior} />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  loadingBannerContainer: {
    marginTop: 30,
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingErrorText: {
    marginTop: 20,
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shareButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  tableSection: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  hintCard: {
    backgroundColor: colors.primaryLight,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  hintText: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 30,
  },
});

export default Resultados;