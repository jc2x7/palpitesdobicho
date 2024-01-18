// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Importando as telas
import Home from "./src/screens/Home";
import GerarPalpite from "./src/screens/GerarPalpite";
import Resultados from "./src/screens/Resultados";
import Historico from "./src/screens/Historico";
import Sobre from "./src/screens/Sobre";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }} // Oculta o cabeçalho para a tela Home
        />
        <Stack.Screen
          name="Gerar Palpite"
          component={GerarPalpite}
          
        />
        <Stack.Screen name="Resultados" component={Resultados} />
        <Stack.Screen name="Historico" component={Historico} />
        <Stack.Screen name="Sobre" component={Sobre} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
