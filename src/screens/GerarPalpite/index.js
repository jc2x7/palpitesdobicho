// src/screens/GerarPalpite/index.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';


function GerarPalpite() {
  const [palpite, setPalpite] = useState({ dezena: '', centena: '', milhar: '', animal: '', frase: '', imagem:'' });
  const [palpiteGerado, setPalpiteGerado] = useState(false);

  useEffect(() => {
    verificarPalpiteDoDia();
  }, []);

  const verificarPalpiteDoDia = async () => {
    try {
      const dataAtual = new Date().toLocaleDateString();
      const palpiteSalvo = await AsyncStorage.getItem('palpiteDoDia_teste3');
      if (palpiteSalvo) {
        const { data, palpite } = JSON.parse(palpiteSalvo);
        if (data === dataAtual) {
          setPalpite(palpite);
          setPalpiteGerado(true);
          return;
        }
      }
      setPalpiteGerado(false);
    } catch (error) {
      console.error('Erro ao verificar o palpite do dia', error);
    }
  };

  const salvarPalpite = async (novoPalpite) => {
    try {
      const dataAtual = new Date().toLocaleDateString();
      const palpiteDoDia = JSON.stringify({ data: dataAtual, palpite: novoPalpite });
      await AsyncStorage.setItem('palpiteDoDia_teste3', palpiteDoDia);
      setPalpite(novoPalpite);
      setPalpiteGerado(true);
      const historicoSalvo = await AsyncStorage.getItem('historicoPalpites_teste3');
    const historico = historicoSalvo ? JSON.parse(historicoSalvo) : [];
    historico.unshift({ data: dataAtual, ...novoPalpite }); // Adiciona ao início da lista
    if (historico.length > 14) {
      historico.pop(); // Mantém apenas os últimos 14 palpites
    }
    await AsyncStorage.setItem('historicoPalpites_teste3', JSON.stringify(historico));
    } catch (error) {
      console.error('Erro ao salvar o palpite', error);
    }
  };


  /*
const salvarPalpite = async (novoPalpite) => {
  try {
    const dataAtual = new Date().toLocaleDateString();
    const palpiteDoDia = JSON.stringify({ data: dataAtual, ...novoPalpite });
    await AsyncStorage.setItem('palpiteDoDia', palpiteDoDia);

    // Atualizar o histórico
    const historicoSalvo = await AsyncStorage.getItem('historicoPalpites');
    const historico = historicoSalvo ? JSON.parse(historicoSalvo) : [];
    historico.unshift({ data: dataAtual, ...novoPalpite }); // Adiciona ao início da lista
    if (historico.length > 14) {
      historico.pop(); // Mantém apenas os últimos 14 palpites
    }
    await AsyncStorage.setItem('historicoPalpites', JSON.stringify(historico));
  } catch (error) {
    console.error('Erro ao salvar o palpite', error);
  }
};
  */

  const gerarNumeroAleatorio = (min, max) => {
    const range = max - min + 1;
    return Math.floor(Math.random() * range) + min;
  };

  const getAnimalByNumber = (numeroBase) => {
    const animais = [
      "Avestruz",
      "Aguia",
      "Burro",
      "Borboleta",
      "Cachorro",
      "Cabra",
      "Carneiro",
      "Camelo",
      "Cobra",
      "Coelho",
      "Cavalo",
      "Elefante",
      "Galo",
      "Gato",
      "Jacare",
      "Leao",
      "Macaco",
      "Porco",
      "Pavao",
      "Peru",
      "Touro",
      "Tigre",
      "Urso",
      "Veado",
      "Vaca",
    ];
    const index = Math.floor((numeroBase - 1) / 4);
    return animais[index];
  };

  const imagensAnimais = {
    Avestruz: require("../../images/animais/Avestruz.png"),
    Aguia: require("../../images/animais/Aguia.png"),
    Burro: require("../../images/animais/Burro.png"),
    Borboleta: require("../../images/animais/Borboleta.png"),
    Cachorro: require("../../images/animais/Cachorro.png"),
    Cabra: require("../../images/animais/Cabra.png"),
    Carneiro: require("../../images/animais/Carneiro.png"),
    Camelo: require("../../images/animais/Camelo.png"),
    Cobra: require("../../images/animais/Cobra.png"),
    Coelho: require("../../images/animais/Coelho.png"),
    Cavalo: require("../../images/animais/Cavalo.png"),
    Elefante: require("../../images/animais/Elefante.png"),
    Galo: require("../../images/animais/Galo.png"),
    Gato: require("../../images/animais/Gato.png"),
    Jacare: require("../../images/animais/Jacare.png"),
    Leao: require("../../images/animais/Leao.png"),
    Macaco: require("../../images/animais/Macaco.png"),
    Porco: require("../../images/animais/Porco.png"),
    Pavao: require("../../images/animais/Pavao.png"),
    Peru: require("../../images/animais/Peru.png"),
    Touro: require("../../images/animais/Touro.png"),
    Tigre: require("../../images/animais/Tigre.png"),
    Urso: require("../../images/animais/Urso.png"),
    Veado: require("../../images/animais/Veado.png"),
    Vaca: require("../../images/animais/Vaca.png"),
    // Adicione todas as outras imagens aqui...
  };

  const gerarPalpite = () => {
    const numeroBase = gerarNumeroAleatorio(1, 100) % 100; // Garante que o número seja entre 0 e 99
    const centena = gerarNumeroAleatorio(1, 9) * 100 + numeroBase;
    const milhar = gerarNumeroAleatorio(1, 9) * 1000 + numeroBase;
    const animal = getAnimalByNumber(numeroBase === 0 ? 100 : numeroBase);
    const imagem = imagensAnimais[animal];
    const frase = getFraseAleatoria(animal); // Use o novo valor de 'animal' aqui

    
    setPalpite({ dezena: numeroBase, centena, milhar, animal, imagem, frase });
    const novoPalpite = { dezena: numeroBase, centena, milhar, animal, imagem, frase };
    salvarPalpite(novoPalpite);
  };
  //frases
  const frases = [
    "Hoje, {data}, o {animal} trará boas novidades.",
    "Fique atento(a) aos sinais, pois o {animal} de {data} tem uma surpresa.",
    "Neste dia {data}, o {animal} pode ser um sinal de sorte.",
    "Considere as oportunidades que o {animal} de {data} traz.",
    "O {animal} de hoje, {data}, sugere um dia de reflexão.",
    "Preste atenção nos detalhes, o {animal} de {data} indica mudanças.",
    "O {animal} deste dia {data} simboliza crescimento e progresso.",
    "Que o {animal} de {data} inspire criatividade e inovação.",
    "Um dia de {data} sob a influência do {animal} promete ser interessante.",
    "O {animal} de {data} traz uma mensagem de otimismo e esperança.",
    "Em {data}, o {animal} sinaliza um momento de força e determinação.",
    "A sabedoria do {animal} em {data} te guiará para o sucesso.",
    "Este {data} será especial, graças à energia do {animal}.",
    "Hoje, {data}, o {animal} representa novos começos e oportunidades.",
    "Confie na intuição: o {animal} de {data} traz insights poderosos.",
    "O {animal} de hoje, {data}, encoraja você a perseguir seus sonhos.",
    "Este {data} é sobre aprender e crescer, inspirado pelo {animal}.",
    "O {animal} deste {data} te incentiva a abraçar mudanças.",
    "Em {data}, o {animal} lembra a importância da paciência e do tempo.",
    "A energia do {animal} neste {data} fomenta a criatividade e a inovação.",
    "No dia {data}, o {animal} simboliza a superação de desafios.",
    "Aproveite as oportunidades deste {data} sob a influência do {animal}.",
    "O {animal} deste {data} te motiva a agir com coragem e confiança.",
    "Hoje, {data}, o {animal} ilumina o caminho para o autodescobrimento.",
    "O {animal} de {data} traz uma onda de energia positiva e alegria.",
    "Em {data}, o {animal} incentiva a busca pelo equilíbrio e harmonia.",
    "Este {data} é um convite para a aventura, cortesia do {animal}.",
    "O {animal} de hoje, {data}, destaca a importância de conexões e amizades.",
    "Neste {data}, o {animal} simboliza renovação e esperança.",
    "O {animal} deste {data} te encoraja a viver com mais liberdade e alegria.",
    "O {animal} de {data} traz uma onda de otimismo e possibilidades,",
    "Em {data}, deixe o {animal} ser seu guia para novas aventuras,",
    "Hoje, {data}, o {animal} simboliza uma jornada de autodescoberta e crescimento,",
    "A energia do {animal} em {data} sugere um dia de sucesso e realizações,",
    "Deixe o {animal} de {data} inspirar confiança e coragem em suas decisões,",
    "Neste {data}, o {animal} representa a superação de obstáculos e desafios,",
    "O {animal} deste {data} encoraja a perseverança e a determinação,",
    "Hoje, {data}, é dia de celebrar a resiliência, simbolizada pelo {animal},",
    "O {animal} de {data} traz uma mensagem de esperança e renovação,",
    "Em {data}, o {animal} te convida a explorar novos horizontes,",
    "Este {data} é perfeito para planejar e sonhar, guiado pela sabedoria do {animal},",
    "Deixe que o {animal} de {data} te inspire a encontrar alegria nas pequenas coisas,",
    "O {animal} de {data} sinaliza um momento ideal para fortalecer laços e amizades,",
    "Neste {data}, o {animal} lembra a importância de ser verdadeiro consigo mesmo,",
    "Hoje, {data}, o {animal} te incentiva a abraçar novos desafios com entusiasmo,",
    "O {animal} deste {data} simboliza a beleza da transformação e mudança,",
    "Em {data}, o {animal} traz clareza e foco para seus objetivos,",
    "A presença do {animal} em {data} indica um dia de harmonia e equilíbrio,",
    "O {animal} de {data} é um sinal de força interior e resiliência,",
    "Hoje, {data}, deixe o {animal} ser um lembrete de gratidão e contentamento,",
    "O {animal} de {data} traz uma onda de otimismo e possibilidades,",
    "Em {data}, deixe o {animal} ser seu guia para novas aventuras,",
    "Hoje, {data}, o {animal} simboliza uma jornada de autodescoberta e crescimento,",
    "A energia do {animal} em {data} sugere um dia de sucesso e realizações,",
    "Deixe o {animal} de {data} inspirar confiança e coragem em suas decisões,",
    "Neste {data}, o {animal} representa a superação de obstáculos e desafios,",
    "O {animal} deste {data} encoraja a perseverança e a determinação,",
    "Hoje, {data}, é dia de celebrar a resiliência, simbolizada pelo {animal},",
    "O {animal} de {data} traz uma mensagem de esperança e renovação,",
    "Em {data}, o {animal} te convida a explorar novos horizontes,",
    "Este {data} é perfeito para planejar e sonhar, guiado pela sabedoria do {animal},",
    "Deixe que o {animal} de {data} te inspire a encontrar alegria nas pequenas coisas,",
    "O {animal} de {data} sinaliza um momento ideal para fortalecer laços e amizades,",
    "Neste {data}, o {animal} lembra a importância de ser verdadeiro consigo mesmo,",
    "Hoje, {data}, o {animal} te incentiva a abraçar novos desafios com entusiasmo,",
    "O {animal} deste {data} simboliza a beleza da transformação e mudança,",
    "Em {data}, o {animal} traz clareza e foco para seus objetivos,",
    "A presença do {animal} em {data} indica um dia de harmonia e equilíbrio,",
    "O {animal} de {data} é um sinal de força interior e resiliência,",
    "Hoje, {data}, deixe o {animal} ser um lembrete de gratidão e contentamento,",
    "O {animal} de {data} anuncia um período de abundância e prosperidade,",
    "Em {data}, o {animal} inspira a busca por conhecimento e sabedoria,",
    "Hoje, {data}, o {animal} promove a união e a compreensão mútua,",
    "O {animal} em {data} sugere um dia de introspecção e autoconhecimento,",
    "Deixe o {animal} de {data} ser um guia para a descoberta e a aventura,",
    "Neste {data}, o {animal} sinaliza um caminho de sucesso e realizações,",
    "O {animal} deste {data} incentiva a viver com paixão e determinação,",
    "Hoje, {data}, é um dia para abraçar a mudança, guiado pelo {animal},",
    "O {animal} de {data} fala sobre a importância de cuidar de si mesmo,",
    "Em {data}, o {animal} encoraja a expressão criativa e a inovação,",
    "Este {data} destaca a força e a coragem, simbolizadas pelo {animal},",
    "Deixe que o {animal} de {data} desperte a sua curiosidade e imaginação,",
    "O {animal} de {data} é um convite para celebrar a vida e suas maravilhas,",
    "Neste {data}, o {animal} enfatiza a importância de manter a esperança viva,",
    "Hoje, {data}, o {animal} te lembra de abraçar a sua verdadeira essência,",
    "O {animal} deste {data} promove o equilíbrio entre trabalho e lazer,",
    "Em {data}, o {animal} é um símbolo de persistência e resistência,",
    "A influência do {animal} em {data} traz clareza para suas decisões,",
    "Em {data}, o {animal} lembra você de valorizar as conexões humanas,",
    "Hoje, {data}, o {animal} destaca a importância de agir com integridade,",
    "O {animal} de {data} inspira a buscar a paz interior e a serenidade,",
    "Neste {data}, o {animal} simboliza a força para enfrentar desafios,",
    "Hoje, {data}, o {animal} incentiva a buscar a verdade e a justiça,",
    "O {animal} de {data} representa a necessidade de adaptabilidade e flexibilidade,",
    "Em {data}, o {animal} incentiva a celebração da vida e seus pequenos prazeres,",
    "O {animal} de {data} traz uma mensagem de cautela e prudência,",
    "Neste {data}, o {animal} encoraja a tomar decisões ponderadas e equilibradas,",
    "Hoje, {data}, o {animal} sugere um momento para repensar e recalibrar,",
    "O {animal} de {data} destaca a importância de cuidar do seu bem-estar,",
    "Em {data}, o {animal} simboliza a beleza da simplicidade e do minimalismo,",
    "O {animal} de {data} encoraja a expressar sua individualidade e criatividade,",
    "Neste {data}, o {animal} lembra a importância de ser resiliente e persistente,",
    "Hoje, {data}, o {animal} é um símbolo de sorte e fortuna,",
    "O {animal} de {data} incentiva a enfrentar medos e incertezas,",
    "Em {data}, o {animal} destaca a necessidade de ser proativo e assertivo,",
    "O {animal} de {data} traz insights sobre paciência e tempo,",
    "Neste {data}, o {animal} incentiva a manter um espírito aventureiro,",
    "Hoje, {data}, o {animal} é um lembrete de que cada dia é uma nova oportunidade,"
  ];

  const getFraseAleatoria = (animal) => {
    const index = Math.floor(Math.random() * frases.length);
    const data = new Date().toLocaleDateString();
    return frases[index].replace("{animal}", animal).replace("{data}", data);
  };

  return (
    <View style={styles.container}>
      {palpite.imagem && (
        <Image source={palpite.imagem} style={styles.imagemAnimal} />
      )}

      {palpite.animal && (
        <View style={styles.card}>
          <Text style={styles.animalText}>{palpite.animal}</Text>
          <Text style={styles.resultText}>Dezena: {palpite.dezena}</Text>
          <Text style={styles.resultText}>Centena: {palpite.centena}</Text>
          <Text style={styles.resultText}>Milhar: {palpite.milhar}</Text>
          <Text style={styles.fraseText}>{palpite.frase}</Text>
        </View>
      )}

{palpiteGerado ? (
        <View>
          <Text style={styles.fraseText}>Você já tem um palpite para hoje. Aguarde até amanhã para gerar um novo palpite e boa sorte no jogo!</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={gerarPalpite}>
          <Text style={styles.buttonText}>Gerar Palpite</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    color: "#333",
    marginVertical: 5,
  },
  imagemAnimal: {
    width: 250,
    height: 250,
    borderRadius: 125, // Faz a imagem ficar arredondada
    marginTop: 20,
    borderWidth: 2, // Adiciona uma borda de 2px
    borderColor: 'green', // Define a cor da borda como verde
  },
  card: {
    backgroundColor: "#fff", // Fundo branco para o card
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000", // Sombra para dar efeito elevado
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Efeito de elevação para Android
    alignItems: "center",
    marginVertical: 20,
    width: "70%",
    borderWidth: 2, // Adiciona uma borda de 2px
    borderColor: 'green', // Define a cor da borda como verde
  },
  animalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4caf50", // Cor destacada para o nome do animal
    marginBottom: 15,
  },
  fraseText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
});

export default GerarPalpite;
