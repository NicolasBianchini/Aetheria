# 🌬️ Aetheria - Sistema de Terapia Respiratória

Um aplicativo móvel desenvolvido com React Native/Expo que utiliza técnicas de respiração controlada para terapia e relaxamento, integrado com um backend Python que demonstra conceitos avançados de Programação Orientada a Objetos (POO).

## 📱 Sobre o Projeto

O Aetheria é um sistema completo de terapia respiratória que combina:
- **Frontend**: App móvel React Native/Expo com jogos interativos
- **Backend**: API Python Flask com arquitetura orientada a objetos
- **Funcionalidades**: Detecção de sopros, jogos terapêuticos, análise de áudio em tempo real

## 🎯 Objetivos Educacionais

Este projeto foi desenvolvido para demonstrar:
- ✅ **Programação Orientada a Objetos** (Herança, Polimorfismo, Encapsulamento, Abstração)
- ✅ **Padrões de Design** (Singleton, Factory, Template Method)
- ✅ **Desenvolvimento Mobile** com React Native/Expo
- ✅ **API REST** com Flask
- ✅ **Processamento de Áudio** em tempo real
- ✅ **Integração Frontend/Backend**

## 🏗️ Arquitetura do Sistema

```
Aetheria-App/
├── 📱 Frontend (React Native/Expo)
│   ├── screens/           # Telas do app
│   ├── components/        # Componentes reutilizáveis
│   ├── services/          # Serviços de áudio e API
│   └── utils/             # Utilitários
├── 🐍 Backend (Python Flask)
│   ├── models/            # Classes dos jogos (POO)
│   ├── services/          # Lógica de negócio
│   ├── controllers/       # Controladores da API
│   └── app.py            # Servidor Flask
└── 📚 Documentação
    ├── README.md          # Este arquivo
    └── backend/README.md  # Documentação técnica do backend
```

## 🚀 Como Executar o Projeto Completo

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **Python** (versão 3.8 ou superior)
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/NicolasBianchini/Aetheria.git
cd Aetheria-App
```

### 2️⃣ Configuração do Backend (Python)

```bash
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# No macOS/Linux:
source venv/bin/activate
# No Windows:
# venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar o servidor Flask
python app.py
```

O backend estará rodando em `http://localhost:3333`

### 3️⃣ Configuração do Frontend (React Native/Expo)

```bash
# Voltar para o diretório raiz
cd ..

# Instalar dependências do Node.js
npm install

# Iniciar o servidor de desenvolvimento Expo
npm start
# ou
expo start
```

### 4️⃣ Executar no Dispositivo

Após executar `expo start`, você terá as seguintes opções:

- **📱 App móvel**: Escaneie o QR code com o app Expo Go
- **🤖 Android**: Pressione `a` para abrir no emulador Android
- **🍎 iOS**: Pressione `i` para abrir no simulador iOS
- **🌐 Web**: Pressione `w` para abrir no navegador

## 🎮 Funcionalidades do App

### Jogos Terapêuticos

1. **🚤 Jogo do Barquinho**
   - Navega baseado na intensidade do sopro
   - Desenvolve controle respiratório
   - Sistema de pontuação progressivo

2. **🎈 Jogo do Balão**
   - Enche balão controlando a respiração
   - Faz palhaço subir conforme o progresso
   - Exercício de respiração profunda

### Sistema de Áudio

- **🎤 Detecção de Sopros**: Análise em tempo real (200-800 Hz)
- **🔊 Redução de Ruído**: Filtros ambientais automáticos
- **📊 Calibração**: Sistema adaptativo de threshold
- **📈 Análise Espectral**: Processamento FFT avançado

## 🔧 API Endpoints

O backend fornece os seguintes endpoints:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/health` | Status da API |
| `POST` | `/api/games/create` | Criar novo jogo |
| `POST` | `/api/games/{id}/start` | Iniciar jogo |
| `POST` | `/api/games/{id}/audio` | Processar áudio |
| `POST` | `/api/games/{id}/end` | Finalizar jogo |
| `GET` | `/api/games/{id}/status` | Status do jogo |
| `POST` | `/api/audio/calibrate` | Calibrar áudio |
| `GET` | `/api/stats` | Estatísticas do sistema |

## 🧪 Testando o Sistema

### Teste Manual do Backend

```bash
cd backend
python examples/game_demo.py
```

### Teste da API

```bash
# Verificar se a API está funcionando
curl http://localhost:3333/api/health

# Criar um jogo
curl -X POST http://localhost:3333/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"game_type": "boat", "player_name": "Teste"}'
```

### Teste do Frontend

1. Abra o app no dispositivo/emulador
2. Navegue pelas telas
3. Teste a detecção de áudio
4. Execute os jogos terapêuticos

## 📚 Conceitos de POO Demonstrados

### Backend Python

- **🏗️ Herança**: `BaseGame` → `BoatGame`, `BalloonGame`
- **🔄 Polimorfismo**: Métodos com comportamentos diferentes
- **🔒 Encapsulamento**: Atributos privados e métodos públicos
- **🎯 Abstração**: Classes abstratas e interfaces
- **🏭 Padrões**: Singleton (`GameManager`), Factory (criação de jogos)

### Frontend React Native

- **📱 Componentes**: Reutilização e composição
- **🔄 Props e State**: Encapsulamento de dados
- **🎣 Hooks**: Abstração de lógica de estado
- **🔧 Serviços**: Separação de responsabilidades

## 🛠️ Desenvolvimento

### Estrutura de Arquivos

```
Aetheria-App/
├── App.js                 # Componente principal
├── package.json           # Dependências Node.js
├── screens/               # Telas do app
│   ├── HomeScreen.js
│   ├── BreathTestScreen.js
│   └── MicTestScreen.js
├── components/            # Componentes reutilizáveis
│   ├── BalloonGame.js
│   └── BoatGame.js
├── services/              # Serviços de integração
│   ├── AudioService.js
│   └── BreathDetectionService.js
├── config/                # Configurações
│   └── api.js
├── backend/               # Servidor Python
│   ├── app.py            # Servidor Flask
│   ├── models/           # Classes dos jogos
│   ├── services/         # Lógica de negócio
│   ├── requirements.txt   # Dependências Python
│   └── README.md         # Documentação técnica
└── README.md             # Este arquivo
```

### Scripts Disponíveis

```bash
# Frontend
npm start          # Iniciar servidor de desenvolvimento
npm run android    # Executar no Android
npm run ios        # Executar no iOS
npm run web        # Executar no navegador

# Backend
python app.py      # Executar servidor Flask
python examples/game_demo.py  # Demonstração dos conceitos POO
```

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Erro de conexão com a API**
   - Verifique se o backend está rodando em `http://localhost:3333`
   - Confirme se não há firewall bloqueando a porta

2. **Problemas de áudio no dispositivo**
   - Verifique as permissões de microfone
   - Teste em ambiente silencioso
   - Use fones de ouvido para melhor detecção

3. **Erro de dependências**
   - Execute `npm install` novamente
   - Limpe cache: `expo r -c`
   - Reinstale dependências Python: `pip install -r requirements.txt`

### Logs e Debug

```bash
# Logs do Expo
expo start --verbose

# Logs do Flask
python app.py  # Logs aparecem no terminal

# Teste de conectividade
curl http://localhost:3333/api/health
```

## 📖 Documentação Adicional

- **Backend**: Consulte `backend/README.md` para documentação técnica detalhada
- **API**: Endpoints documentados no código `backend/app.py`
- **POO**: Conceitos explicados em `backend/examples/game_demo.py`

## 🤝 Contribuição

Este projeto foi desenvolvido como trabalho acadêmico para demonstrar conceitos de POO. Para contribuições:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para fins educacionais na cadeira de Programação Orientada a Objetos.

## 👨‍💻 Desenvolvedor

**Nicolas Bianchini** - Estudante de Ciência da Computação
- Projeto desenvolvido para demonstrar conceitos de POO
- Integração Frontend/Backend com tecnologias modernas

---

## 🎯 Resumo de Execução

Para executar o projeto completo:

1. **Backend**: `cd backend && python app.py` (porta 3333)
2. **Frontend**: `npm start` (Expo)
3. **Dispositivo**: Escaneie QR code ou use emulador

O sistema estará funcionando com detecção de áudio em tempo real e jogos terapêuticos interativos! 🌬️✨
