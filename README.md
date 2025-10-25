# 🌬️ Aetheria - Terapia Respiratória Interativa

Aetheria é um aplicativo de terapia respiratória que utiliza jogos interativos para ajudar usuários a melhorar sua respiração através de exercícios divertidos e envolventes.

## ✨ Funcionalidades

- **Sistema de Autenticação**: Login seguro com email e senha
- **Jogos Interativos**: 
  - 🚤 Barquinho: Sopre para fazer o barco navegar
  - 🎈 Balão do Palhaço: Encha o balão e faça o palhaço subir
- **Sistema de Pontuação**: Acompanhe seu progresso e conquistas
- **Perfil do Usuário**: Visualize estatísticas e histórico de sessões
- **Design Moderno**: Interface limpa e intuitiva inspirada no design system do aetheria-login

## 🛠️ Tecnologias Utilizadas

### Frontend (React Native + Expo)
- React Native
- Expo
- React Navigation
- Expo AV (para microfone)
- Lucide React Native (ícones)
- Tailwind CSS (estilos)

### Backend (Flask)
- Flask
- Flask-CORS
- JSON (armazenamento de dados)

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Python 3.8 ou superior
- Expo CLI (`npm install -g @expo/cli`)

### 1. Instalar Dependências do Frontend
```bash
npm install
```

### 2. Configurar e Executar o Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

O backend estará rodando em `http://localhost:5000`

### 3. Executar o Frontend
```bash
# Em um novo terminal
npm start
# ou
expo start
```

## 📱 Como Usar

1. **Login**: Faça login com seu email e senha
2. **Escolha um Jogo**: Selecione entre Barquinho ou Balão do Palhaço
3. **Jogue**: Sopre no microfone para controlar o jogo
4. **Acompanhe Progresso**: Veja suas estatísticas no perfil

## 🎮 Jogos Disponíveis

### 🚤 Barquinho
- **Objetivo**: Fazer o barco navegar até a linha de chegada
- **Como Jogar**: Sopre no microfone para mover o barco
- **Pontuação**: +100 pontos por conclusão

### 🎈 Balão do Palhaço
- **Objetivo**: Encher o balão e fazer o palhaço subir até a meta
- **Como Jogar**: Sopre suavemente no microfone
- **Pontuação**: +150 pontos por conclusão, -50 se estourar

## 🔧 Configuração do Ambiente

### Permissões de Microfone
O aplicativo solicita permissão para acessar o microfone. Certifique-se de permitir o acesso para que os jogos funcionem corretamente.

### Configuração do Backend
O backend usa um arquivo JSON simples para armazenar dados. Para produção, considere usar um banco de dados real como PostgreSQL ou MongoDB.

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout

### Usuário
- `GET /api/user/profile` - Obter perfil
- `PUT /api/user/profile` - Atualizar perfil

### Jogos
- `POST /api/games/session` - Iniciar sessão de jogo
- `POST /api/games/session/{id}/end` - Finalizar sessão

### Estatísticas
- `GET /api/stats/recent` - Sessões recentes
- `GET /api/stats/summary` - Resumo de estatísticas

## 🎨 Design System

O aplicativo utiliza um design system moderno com:
- **Cores**: Paleta suave de azuis e neutros
- **Tipografia**: Fontes leves e legíveis
- **Componentes**: Botões, cards e inputs consistentes
- **Animações**: Transições suaves e feedback visual

## 🔮 Próximas Funcionalidades

- [ ] Mais jogos de respiração
- [ ] Sistema de conquistas
- [ ] Relatórios de progresso
- [ ] Modo offline
- [ ] Integração com dispositivos wearables
- [ ] Terapia respiratória personalizada

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através dos issues do GitHub.

---

Desenvolvido com ❤️ para melhorar a saúde respiratória através da gamificação.