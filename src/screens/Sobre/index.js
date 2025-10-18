// src/screens/Sobre/index.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Linking, 
  SafeAreaView,
  ScrollView,
  StatusBar 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../constants/colors';

const Sobre = () => {
  const handleOpenLink = (url) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}>
        <Text style={styles.headerTitle}>ℹ️ Sobre o App</Text>
        <Text style={styles.headerSubtitle}>Gerador de Números da Sorte</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Card de Descrição */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#ffffff', '#f9f9f9']}
            style={styles.cardGradient}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎲</Text>
            </View>
            <Text style={styles.cardTitle}>O que é este app?</Text>
            <Text style={styles.cardText}>
              Este aplicativo é um gerador de números da sorte que utiliza 
              uma tabela tradicional de animais e números. É uma ferramenta 
              de entretenimento para gerar combinações aleatórias.
            </Text>
          </LinearGradient>
        </View>

        {/* Card de Aviso Importante */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#fff3e0', '#ffe0b2']}
            style={styles.cardGradient}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>
            <Text style={styles.cardTitle}>Aviso Importante</Text>
            <Text style={styles.cardText}>
              Este aplicativo NÃO faz apologia a jogos de azar. Trata-se 
              apenas de um gerador de números aleatórios baseado em uma 
              tabela de animais para fins de entretenimento e curiosidade.
            </Text>
            <Text style={[styles.cardText, styles.highlightText]}>
              Não incentivamos ou promovemos qualquer tipo de aposta ou jogo.
            </Text>
          </LinearGradient>
        </View>

        {/* Card de Funcionalidades */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#e8f5e9', '#c8e6c9']}
            style={styles.cardGradient}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✨</Text>
            </View>
            <Text style={styles.cardTitle}>Funcionalidades</Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Geração aleatória de números</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Histórico de palpites gerados</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Compartilhamento de resultados</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Consulta de resultados anteriores</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Botões */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => handleOpenLink('https://bit.ly/3tylw3r')}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}>
            <Text style={styles.buttonIcon}>🔒</Text>
            <Text style={styles.buttonText}>Política de Privacidade</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => handleOpenLink('https://bit.ly/TercosGratisCelular')}
          activeOpacity={0.8}>
          <LinearGradient
            colors={['#2196f3', '#1976d2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}>
            <Text style={styles.buttonIcon}>🙏</Text>
            <Text style={styles.buttonText}>Aplicativo para rezar o Terço</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Versão 1.0.0</Text>
          <Text style={styles.footerText}>© 2025 - Todos os direitos reservados</Text>
          <Text style={styles.footerSubText}>
            Desenvolvido com 💚 para entretenimento
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 48,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  highlightText: {
    fontWeight: '700',
    color: '#d32f2f',
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 10,
  },
  featureBullet: {
    fontSize: 18,
    color: colors.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  buttonWrapper: {
    marginBottom: 12,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default Sobre;