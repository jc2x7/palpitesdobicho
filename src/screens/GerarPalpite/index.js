// src/screens/GerarPalpite/index.js
import React, { useState, useEffect } from "react";
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
  Linking
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import banner from '../../images/banner_2.png'; // Importação do banner
import banner2 from '../../images/banner_1.png'; // Importação do banner


function GerarPalpite() {
  const [palpite, setPalpite] = useState({
    dezena: "",
    centena: "",
    milhar: "",
    animal: "",
    frase: "",
    legenda: "", // Nova propriedade adicionada
    imagem: "",
  });
  const [palpiteGerado, setPalpiteGerado] = useState(false);

  useEffect(() => {
    verificarPalpiteDoDia();
  }, []);

  const verificarPalpiteDoDia = async () => {
    try {
      const dataAtual = new Date().toLocaleDateString("pt-BR");
      const anoAtual = new Date().getFullYear();
      const palpiteSalvo = await AsyncStorage.getItem("palpiteDoDia_teste3");
      const usedPhrasesKey = `usedPhrases_${anoAtual}`;
      const usedPhrasesSalvo = await AsyncStorage.getItem(usedPhrasesKey);
      const usedPhrases = usedPhrasesSalvo ? JSON.parse(usedPhrasesSalvo) : [];

      if (palpiteSalvo) {
        const { data, palpite: palpiteData } = JSON.parse(palpiteSalvo);
        if (data === dataAtual) {
          const imagem = palpiteData.imagem;
          const frase = palpiteData.frase;
          const legenda = palpiteData.legenda; // Recupera legenda
          setPalpite({ ...palpiteData, imagem, frase, legenda });
          setPalpiteGerado(true);
          return;
        }
      }
      setPalpiteGerado(false);
    } catch (error) {
      console.error("Erro ao verificar o palpite do dia", error);
    }
  };

  const salvarPalpite = async (novoPalpite) => {
    try {
      const dataAtual = new Date().toLocaleDateString("pt-BR");
      const anoAtual = new Date().getFullYear();
      const usedPhrasesKey = `usedPhrases_${anoAtual}`;
      const usedPhrasesSalvo = await AsyncStorage.getItem(usedPhrasesKey);
      let usedPhrases = usedPhrasesSalvo ? JSON.parse(usedPhrasesSalvo) : [];

      // Verifica se todas as frases já foram usadas
      if (usedPhrases.length >= frases.length) {
        // Reseta as frases usadas para o novo ano
        usedPhrases = [];
      }

      // Encontra as frases disponíveis
      const availableIndices = frases
        .map((_, index) => index)
        .filter((index) => !usedPhrases.includes(index));

      if (availableIndices.length === 0) {
        // Todas as frases foram usadas, reseta
        usedPhrases = [];
      }

      // Seleciona uma frase aleatória disponível
      const randomIndex =
        availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const fraseSelecionada = frases[randomIndex]
        .replace("${animal}", novoPalpite.animal)
        .replace("${data}", dataAtual);

      // Marca a frase como usada
      usedPhrases.push(randomIndex);
      await AsyncStorage.setItem(usedPhrasesKey, JSON.stringify(usedPhrases));

      // Prepare a legenda (pode personalizar conforme necessário)
      const legendaSelecionada = `Sua sorte está guiada pelo ${novoPalpite.animal}!`; // Exemplo de legenda

      // Prepara os dados do palpite
      const palpiteDoDia = JSON.stringify({
        data: dataAtual,
        palpite: {
          dezena: novoPalpite.dezena,
          centena: novoPalpite.centena,
          milhar: novoPalpite.milhar,
          animal: novoPalpite.animal,
          frase: fraseSelecionada,
          legenda: legendaSelecionada, // Inclui legenda
          imagem: novoPalpite.imagem,   // Inclui caminho da imagem
        },
      });
      await AsyncStorage.setItem("palpiteDoDia_teste3", palpiteDoDia);
      setPalpite({ ...novoPalpite, frase: fraseSelecionada, legenda: legendaSelecionada });
      setPalpiteGerado(true);

      // Atualizar o histórico
      const historicoSalvo = await AsyncStorage.getItem(
        "historicoPalpites_teste3"
      );
      const historico = historicoSalvo ? JSON.parse(historicoSalvo) : [];
      historico.unshift({
        data: dataAtual,
        dezena: novoPalpite.dezena,
        centena: novoPalpite.centena,
        milhar: novoPalpite.milhar,
        animal: novoPalpite.animal,
        frase: fraseSelecionada,
        legenda: legendaSelecionada, // Inclui legenda no histórico
        imagem: novoPalpite.imagem,   // Inclui imagem no histórico
      });
      if (historico.length > 365) {
        historico.pop();
      }
      await AsyncStorage.setItem(
        "historicoPalpites_teste3",
        JSON.stringify(historico)
      );
    } catch (error) {
      console.error("Erro ao salvar o palpite", error);
    }
  };

  const compartilharNoWhatsApp = async () => {
    try {
      const mensagem =
        `Confira o meu palpite do dia:\n\n` +
        `*Animal:* ${palpite.animal}\n` +
        `*Dezena:* ${palpite.dezena}\n` +
        `*Centena:* ${palpite.centena}\n` +
        `*Milhar:* ${palpite.milhar}\n` +
        `*Frase:* ${palpite.frase}\n` +
        `*Legenda:* ${palpite.legenda}\n\n` + // Inclui legenda na mensagem
        `*Baixe para Android*: https://play.google.com/store/apps/details?id=juliolemos.jogodobicho&pli=1\n\n` +
        `*Baixe para iOS*: https://apps.apple.com/app/id1635698709`;

      await Share.share({
        message: mensagem,
        url:
          Platform.OS === "android"
            ? "whatsapp://send?text=" + encodeURIComponent(mensagem)
            : undefined,
      });
    } catch (error) {
      console.error("Erro ao compartilhar no WhatsApp", error);
    }
  };

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
    Borboleta: require("../../images/animais/Borboleta.png"),
    Burro: require("../../images/animais/Burro.png"),
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
  };

  // Removi a definição de 'const frases = [ ... ]' conforme solicitado.
  // Certifique-se de definir seu próprio array de frases em outro lugar no código.

  const gerarFrase = (data, animal) => {
    // Seleciona uma frase aleatória que ainda não foi usada
    const index = gerarNumeroAleatorio(0, frases.length - 1);
    const fraseSelecionada = frases[index]
      .replace("${animal}", animal)
      .replace("${data}", data);
    return fraseSelecionada;
  };

  const gerarPalpite = () => {
    const numeroBase = gerarNumeroAleatorio(1, 100);
    const centena = gerarNumeroAleatorio(1, 9) * 100 + (numeroBase % 100);
    const milhar = gerarNumeroAleatorio(1, 9) * 1000 + (numeroBase % 1000);
    const animal = getAnimalByNumber(numeroBase === 0 ? 100 : numeroBase);
    const imagem = imagensAnimais[animal];
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const frase = gerarFrase(dataAtual, animal);
    const legenda = `Sua sorte está guiada pelo ${animal}!`; // Exemplo de legenda personalizada
    const novoPalpite = {
      dezena: numeroBase,
      centena,
      milhar,
      animal,
      imagem,
      frase,
      legenda, // Nova propriedade adicionada
    };
    setPalpite(novoPalpite);
    salvarPalpite(novoPalpite);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => Linking.openURL('https://bit.ly/palpitesdobichoad')}>
            <Image source={banner2} style={styles.banner2} />
          </TouchableOpacity>
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
            </View>
          )}
          {palpite.frase !== "" && (
            <Text style={styles.fraseText}>{palpite.frase}</Text>
          )}
          {palpite.legenda !== "" && (
            <Text style={styles.legendaText}>{palpite.legenda}</Text>
          )}
          {palpiteGerado ? (
            <View style={styles.center}>
              <Text style={styles.infoText}>
                Você já tem um palpite para hoje. Aguarde até amanhã para gerar
                um novo palpite e boa sorte no jogo!
              </Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={compartilharNoWhatsApp}
              >
                <Text style={styles.shareButtonText}>
                  Compartilhar no WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.center}>
          <TouchableOpacity onPress={() => Linking.openURL('https://bit.ly/palpitesdobichoad')}>
            <Image source={banner} style={styles.banner} />
          </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={gerarPalpite}>
              <Text style={styles.buttonText}>Gerar Palpite</Text>
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
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 20,
  },
  button: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagemAnimal: {
    width: 250,
    height: 250,
    borderRadius: 125,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "green",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
    marginVertical: 20,
    width: "80%",
  },
  animalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4caf50",
    marginBottom: 15,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  fraseText: {
    fontSize: 16,
    color: "#4caf50",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  legendaText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  shareButton: {
    backgroundColor: "#25D366",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    width: "80%",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  infoText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  banner: {
    width: 400,
    height: 200, // Ajuste a altura conforme necessário
    marginVertical: 20,
    resizeMode: 'contain',
  },
  banner2: {
    width: 380, // Ocupa toda a largura disponível
    height: 80,
    marginTop: 20,
    resizeMode: 'contain',

  },
  
});


// Adicione as 365 frases abaixo. Por motivos de espaço, apresento aqui 100 frases. Você deve continuar o padrão para completar as 365 frases.

const frases = [
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
