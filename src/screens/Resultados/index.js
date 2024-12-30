import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  View, 
  Text, 
  ScrollView, 
  Alert,
  Dimensions 
} from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';

const App = () => {
  const [loadingAtual, setLoadingAtual] = useState(true);
  const [tableDataAtual, setTableDataAtual] = useState({
    headers: [],
    rows: [],
  });

  const [loadingAnterior, setLoadingAnterior] = useState(true);
  const [tableDataAnterior, setTableDataAnterior] = useState({
    headers: [],
    rows: [],
  });

  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    fetchResultadosAtual();
    fetchResultadosAnteriores();

    const handleChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    Dimensions.addEventListener('change', handleChange);

    return () => {
      Dimensions.removeEventListener('change', handleChange);
    };
  }, []);

  const fetchResultadosAtual = async () => {
    try {
      const response = await fetch('https://correcaodesolo.com.br/teste/resultados_atual.json');
      const json = await response.json();

      setTableDataAtual({
        headers: json.headers,
        rows: json.rows,
      });
      setLoadingAtual(false);
    } catch (error) {
      console.error('Erro ao buscar ou processar resultados atuais:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar os resultados atuais.');
      setLoadingAtual(false);
    }
  };

  const fetchResultadosAnteriores = async () => {
    try {
      const response = await fetch('https://correcaodesolo.com.br/teste/resultados_anteriores.json');
      const json = await response.json();

      setTableDataAnterior({
        headers: json.headers,
        rows: json.rows,
      });
      setLoadingAnterior(false);
    } catch (error) {
      console.error('Erro ao buscar ou processar resultados anteriores:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar os resultados anteriores.');
      setLoadingAnterior(false);
    }
  };

  const calculateColumnWidths = (numColumns) => {
    const padding = 16; // padding total das laterais
    const availableWidth = screenWidth - padding * 2;
    const minWidth = 100;
    const calculatedWidth = Math.max(availableWidth / numColumns, minWidth);
    return new Array(numColumns).fill(calculatedWidth);
  };

  const renderTable = (data, loading, title) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A5AB9" />
          <Text style={styles.loadingText}>Carregando resultados...</Text>
        </View>
      ) : (
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
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            Segunda-Feira, 30 de Dezembro de 2024
          </Text>
        </View>
        {renderTable(tableDataAtual, loadingAtual, "Resultados do Dia")}
        {renderTable(tableDataAnterior, loadingAnterior, "Resultados Anteriores")}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  dateHeader: {
    backgroundColor: '#4A5AB9',
    padding: 16,
    marginBottom: 16,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loadingText: {
    marginTop: 12,
    color: '#4A5AB9',
    fontSize: 16,
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
    backgroundColor: '#4A5AB9',
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
});

export default App;
