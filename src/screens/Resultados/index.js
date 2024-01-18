//https://bit.ly/loteriasbrbicho

import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import WebView from 'react-native-webview';

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: 'https://bit.ly/loteriasbrbicho' }}
        style={styles.webview}
        onLoad={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
