# 🎮 Jogos Implementados em Python - Documentação

## ✅ Implementação Completa

Os jogos agora são **completamente controlados pelo backend Python**, usando as classes POO implementadas.

---

## 🏗️ Arquitetura

### Backend Python (Controla tudo)
```
backend/
├── app.py                    # Endpoints REST API
├── services/
│   ├── game_manager.py       # Singleton - gerencia jogos
│   └── audio_processor.py    # Processamento avançado de áudio
└── models/
    ├── base_game.py          # Classe abstrata base
    ├── boat_game.py          # Jogo do barco (POO)
    └── balloon_game.py       # Jogo do balão (POO)
```

### Frontend React Native (Apenas UI)
```
frontend/
├── services/
│   └── BackendGameService.js # Serviço de comunicação com backend
├── screens/
│   └── BoatGameScreen.js     # UI do jogo do barco
└── components/
    └── BalloonGame.js        # UI do jogo do balão
```

---

## 🔄 Fluxo de Dados

### 1. **Criação do Jogo**
```
Frontend → POST /api/games/create
          { game_type: 'boat', player_name: 'João' }
          
Backend → Cria instância de BoatGame ou BalloonGame
          Retorna: { game_id: 'boat_1_20241201_120000' }
```

### 2. **Início do Jogo**
```
Frontend → POST /api/games/{gameId}/start

Backend → game.start_game()
          Retorna: Estado inicial do jogo
```

### 3. **Processamento de Áudio (A cada 50ms)**
```
Frontend → Captura metering do microfone
         → POST /api/games/{gameId}/audio
           { audio_intensity: 0.75, audio_metering_db: -25.5 }
           
Backend → game.process_audio_input(audio_bytes)
         → audio_processor.detect_blow()  # Filtros avançados
         → game._process_audio()          # Lógica do jogo
         → game._update_score()           # Pontuação
         
         Retorna: {
           boat_position: 45.5,      # Posição do barco (0-100)
           blow_intensity: 0.75,     # Intensidade do sopro
           blow_detected: true,       # Sopro detectado?
           boat_speed: 8.5,          # Velocidade do barco
           game_progress: 0.45,      # Progresso (0-1)
           score: 125                # Pontuação atual
         }
         
Frontend → Atualiza UI baseado no estado retornado
```

### 4. **Finalização**
```
Frontend → POST /api/games/{gameId}/end

Backend → game.end_game()
          Retorna: Estatísticas finais
```

---

## 🎯 Endpoints da API

### `POST /api/games/create`
Cria um novo jogo usando Factory Pattern.

**Request:**
```json
{
  "game_type": "boat" | "balloon",
  "player_name": "João"
}
```

**Response:**
```json
{
  "success": true,
  "game": {
    "game_id": "boat_1_20241201_120000",
    "game_type": "boat",
    "player_name": "João",
    "created_at": "2024-12-01T12:00:00"
  }
}
```

### `POST /api/games/{gameId}/start`
Inicia o jogo.

**Response:**
```json
{
  "success": true,
  "game": {
    "game_id": "boat_1_20241201_120000",
    "start_time": "2024-12-01T12:00:00",
    "level": 1,
    "difficulty": "Fácil"
  }
}
```

### `POST /api/games/{gameId}/audio`
**Processa áudio e retorna estado do jogo** - LÓGICA DO JOGO AQUI!

**Request:**
```json
{
  "audio_intensity": 0.75,      // 0-1 (opcional)
  "audio_metering_db": -25.5    // dB do microfone (opcional)
}
```

**Response (Barco):**
```json
{
  "success": true,
  "game_state": {
    "blow_detected": true,
    "blow_intensity": 0.75,
    "boat_position": 45.5,      // 0-100 (backend controla!)
    "boat_speed": 8.5,
    "consecutive_blows": 3,
    "game_progress": 0.45,
    "score": 125                 // Backend calcula!
  }
}
```

**Response (Balão):**
```json
{
  "success": true,
  "game_state": {
    "blow_detected": true,
    "blow_intensity": 0.65,
    "balloon_size": 5.2,                    // 1.0-10.0
    "balloon_size_percent": 103.6,          // 20-200% para UI
    "balloon_pressure": 75.5,
    "balloon_pressure_percent": 75.5,       // 0-100%
    "is_balloon_full": true,                // Meta alcançada
    "is_balloon_popped": false,             // Estourou?
    "game_progress": 0.755,
    "score": 180                             // Backend calcula!
  }
}
```

### `GET /api/games/{gameId}/status`
Retorna status atual do jogo.

**Response:**
```json
{
  "success": true,
  "status": {
    "game_id": "boat_1_20241201_120000",
    "player_name": "João",
    "is_active": true,
    "score": 125,
    "level": 1,
    "game_stats": {
      "boat_position": 45.5,
      "boat_speed": 8.5,
      "total_blows": 15
    }
  }
}
```

### `POST /api/games/{gameId}/end`
Finaliza o jogo.

**Response:**
```json
{
  "success": true,
  "game": {
    "game_id": "boat_1_20241201_120000",
    "score": 250,
    "duration": 45.5,
    "level": 1
  }
}
```

---

## 🐍 Classes Python (POO)

### `BaseGame` (Classe Abstrata)
- Template Method Pattern
- Encapsulamento (atributos privados)
- Métodos abstratos para subclasses

### `BoatGame` (Herança)
- Herda de `BaseGame`
- Lógica específica do barco
- Calcula posição, velocidade, movimento
- Sistema de pontuação

### `BalloonGame` (Herança)
- Herda de `BaseGame`
- Lógica específica do balão
- Sistema de pressão
- Vazamento natural
- Detecção de estouro

### `GameManager` (Singleton + Factory)
- Singleton: uma única instância
- Factory: cria jogos baseado no tipo
- Gerencia múltiplos jogos
- Integra com `AudioProcessor`

---

## 🔧 Como Funciona Agora

### Jogo do Barco

1. **Frontend captura áudio** → Envia intensidade para backend
2. **Backend processa** → `BoatGame._process_audio()`
3. **Backend calcula** → Posição, velocidade, movimento
4. **Backend retorna** → Estado completo do jogo
5. **Frontend renderiza** → Apenas mostra o que o backend diz

**Lógica no Backend:**
- `_detect_blow()` - Detecta sopro
- `_calculate_boat_movement()` - Calcula movimento
- `_update_boat_position()` - Atualiza posição
- `_apply_water_resistance()` - Resistência da água
- `_update_score()` - Calcula pontuação

### Jogo do Balão

1. **Frontend captura áudio** → Envia intensidade para backend
2. **Backend processa** → `BalloonGame._process_audio()`
3. **Backend calcula** → Pressão, tamanho, estouro
4. **Backend retorna** → Estado completo do jogo
5. **Frontend renderiza** → Apenas mostra o que o backend diz

**Lógica no Backend:**
- `_detect_continuous_blow()` - Detecta sopro contínuo
- `_calculate_pressure_increase()` - Calcula pressão
- `_add_pressure()` - Adiciona pressão ao balão
- `_apply_balloon_leak()` - Vazamento natural
- `_update_balloon_and_clown()` - Atualiza tamanho
- `_balloon_burst()` - Processa estouro
- `_update_score()` - Calcula pontuação

---

## 📊 Vantagens da Arquitetura

### ✅ **Separação de Responsabilidades**
- **Backend**: Lógica de negócio, processamento, cálculo
- **Frontend**: UI, captura de áudio, renderização

### ✅ **POO Completo**
- Herança: `BoatGame` e `BalloonGame` herdam de `BaseGame`
- Polimorfismo: Cada jogo implementa `_process_audio()` diferente
- Encapsulamento: Atributos privados (`_boat_position`, `_balloon_pressure`)
- Abstração: `BaseGame` define interface comum

### ✅ **Padrões de Design**
- **Singleton**: `GameManager` (uma instância)
- **Factory**: `GameManager.create_game()` cria jogos
- **Template Method**: `BaseGame.process_audio_input()` define fluxo

### ✅ **Processamento Avançado**
- `AudioProcessor` com filtros Python (scipy, numpy)
- Filtros de frequência
- Remoção de ruído
- Calibração de ruído ambiente

---

## 🚀 Como Testar

### 1. Iniciar Backend
```bash
cd backend
python app.py
# Backend rodando em http://localhost:5000
```

### 2. Verificar Endpoints
```bash
# Testar health
curl http://localhost:5000/api/health

# Criar jogo
curl -X POST http://localhost:5000/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"game_type": "boat", "player_name": "Teste"}'
```

### 3. Testar no App
1. Abra o app React Native
2. Entre em um jogo (Barquinho ou Balão)
3. Sopre no microfone
4. **O backend Python controla tudo!**

---

## 📝 Mudanças Principais

### Frontend (React Native)
- ❌ **Removido**: Lógica de cálculo de movimento
- ❌ **Removido**: Lógica de cálculo de pontuação
- ❌ **Removido**: Lógica de detecção de sopro (agora usa backend)
- ✅ **Adicionado**: `BackendGameService` para comunicação
- ✅ **Mantido**: Captura de áudio (metering)
- ✅ **Mantido**: UI e animações

### Backend (Python)
- ✅ **Endpoints criados**: `/api/games/create`, `/api/games/{id}/audio`, etc.
- ✅ **Processamento de áudio**: Aceita intensidade ou dados brutos
- ✅ **Classes POO**: Toda lógica nos modelos Python
- ✅ **GameManager**: Gerencia jogos (Singleton + Factory)

---

## 🎯 Resultado Final

**TODA A LÓGICA DOS JOGOS ESTÁ EM PYTHON!**

- ✅ Cálculo de posição do barco → Python
- ✅ Cálculo de tamanho do balão → Python
- ✅ Sistema de pontuação → Python
- ✅ Detecção de sopro → Python (com filtros avançados)
- ✅ Processamento de áudio → Python
- ✅ Lógica de vitória/derrota → Python

**Frontend apenas:**
- Captura áudio do microfone
- Envia dados para backend
- Renderiza o que o backend retorna

---

## 🔍 Debug

### Logs do Backend
```python
# backend/app.py já tem logging configurado
# Veja logs no console quando processar áudio
```

### Logs do Frontend
```javascript
// Veja no console:
🎤 Metering: -25.43 dB → 75.2%
💨 Sopro! Intensidade: 75.2%
✅ Jogo criado no backend: boat_1_20241201_120000
```

---

## 📚 Estrutura de Dados

### Estado do Jogo do Barco (Backend)
```python
{
  "blow_detected": bool,
  "blow_intensity": float,      # 0-1
  "boat_position": float,        # 0-100
  "boat_speed": float,          # pixels/segundo
  "consecutive_blows": int,
  "game_progress": float,        # 0-1
  "score": int                   # Calculado pelo backend
}
```

### Estado do Jogo do Balão (Backend)
```python
{
  "blow_detected": bool,
  "blow_intensity": float,              # 0-1
  "balloon_size": float,                # 1.0-10.0
  "balloon_size_percent": float,       # 20-200% (para UI)
  "balloon_pressure": float,            # 0-100
  "balloon_pressure_percent": float,   # 0-100%
  "is_balloon_full": bool,             # Meta alcançada
  "is_balloon_popped": bool,           # Estourou
  "game_progress": float,              # 0-1
  "score": int                          # Calculado pelo backend
}
```

---

## ⚙️ Configuração

### Backend
- Porta: `5000` (padrão)
- URL: `http://localhost:5000`

### Frontend
- Configurado em `config/api.js`
- Usa `process.env.API_BASE_URL` ou `http://localhost:5000`

---

## 🎉 Resultado

**Os jogos agora são 100% controlados pelo backend Python!**

- ✅ Lógica POO completa
- ✅ Processamento avançado de áudio
- ✅ Separação clara de responsabilidades
- ✅ Frontend apenas renderiza
- ✅ Backend controla tudo

**Pronto para uso!** 🚀

