# 🐍 Funções do Backend Python

## 📋 Resumo

O **backend Python** é responsável por **TODA A LÓGICA DOS JOGOS**. O frontend React Native apenas:
- Capta o áudio do microfone
- Envia para o backend
- Recebe o estado do jogo
- Mostra na tela

---

## 🎯 Funções Principais do Backend

### 1. **Criação e Gerenciamento de Jogos** (`GameManager`)

#### Criar Jogo
- **Endpoint**: `POST /api/games/create`
- **Função**: Cria uma nova instância do jogo (BoatGame ou BalloonGame)
- **Usa**: Factory Pattern para criar diferentes tipos de jogos
- **Retorna**: `game_id`, `game_type`, `player_name`, `created_at`

#### Iniciar Jogo
- **Endpoint**: `POST /api/games/<game_id>/start`
- **Função**: Inicia o jogo, configura estado inicial
- **Retorna**: Estado inicial do jogo

#### Finalizar Jogo
- **Endpoint**: `POST /api/games/<game_id>/end`
- **Função**: Finaliza o jogo, calcula estatísticas finais
- **Retorna**: Score final, duração, estatísticas

---

### 2. **Processamento de Áudio** (`AudioProcessor`)

#### Detecção de Sopro
- **Função**: `detect_blow(audio_data)`
- **Processa**: Dados de áudio brutos
- **Retorna**: 
  - `blow_detected` (True/False)
  - `intensity` (0-1)
  - `metadata` (frequência, amplitude, etc.)

#### Processamento Avançado
- Filtros de frequência
- Análise espectral
- Detecção de padrões de sopro

---

### 3. **Lógica dos Jogos** (Classes Python)

### 🚤 **BoatGame** (`boat_game.py`)

#### O que o backend controla:
- ✅ **Posição do barco** (`boat_position`)
  - Calcula movimento baseado na intensidade do sopro
  - Controla velocidade e aceleração
  
- ✅ **Pontuação** (`score`)
  - Pontos por sopro detectado
  - Bônus por velocidade
  - Bônus por completar o jogo
  
- ✅ **Progresso do jogo** (`game_progress`)
  - 0.0 = início
  - 1.0 = fim (barco chegou no final)
  
- ✅ **Intensidade do sopro** (`blow_intensity`)
  - Processa dados de áudio
  - Converte para intensidade 0-1
  
- ✅ **Detecção de sopro** (`blow_detected`)
  - Analisa padrões de áudio
  - Identifica quando é realmente um sopro

#### Retorna para o frontend:
```python
{
    "boat_position": 75,  # 0-100%
    "boat_velocity": 5.2,
    "score": 350,
    "game_progress": 0.75,
    "blow_detected": True,
    "blow_intensity": 0.8,
    "score": 350
}
```

---

### 🎈 **BalloonGame** (`balloon_game.py`)

#### O que o backend controla:
- ✅ **Tamanho do balão** (`balloon_size_percent`)
  - 20% = balão vazio
  - 200% = balão cheio (pronto para estourar)
  - Calcula baseado na pressão acumulada
  
- ✅ **Pressão do balão** (`balloon_pressure`)
  - Acumula pressão a cada sopro
  - Reduz lentamente quando não há sopro
  
- ✅ **Estado do balão**
  - `is_balloon_full` = balão cheio (meta atingida)
  - `is_balloon_popped` = balão estourou
  
- ✅ **Pontuação** (`score`)
  - Pontos por sopro
  - Bônus por encher sem estourar
  - Penalidade por estourar
  
- ✅ **Progresso** (`game_progress`)
  - 0.0 = início
  - 1.0 = balão cheio ou estourou

#### Retorna para o frontend:
```python
{
    "balloon_size_percent": 150,  # 20-200%
    "balloon_pressure": 75.5,
    "balloon_pressure_percent": 75.5,
    "is_balloon_full": False,
    "is_balloon_popped": False,
    "game_progress": 0.755,
    "blow_detected": True,
    "blow_intensity": 0.7,
    "score": 280
}
```

---

### 4. **Processamento de Áudio em Tempo Real**

#### Endpoint: `POST /api/games/<game_id>/audio`

**Fluxo:**
1. Frontend envia: `audio_intensity` (0-1) e `audio_metering_db` (dB)
2. Backend recebe e processa:
   - Converte intensidade para dados de áudio simulados
   - Processa com `AudioProcessor`
   - Passa para o jogo específico (`BoatGame` ou `BalloonGame`)
3. Jogo processa:
   - Atualiza estado interno (posição, tamanho, pressão, etc.)
   - Calcula score
   - Verifica condições de vitória/derrota
4. Backend retorna:
   - Estado completo do jogo
   - Score atualizado
   - Progresso
   - Detecção de sopro

---

## 🏗️ Arquitetura do Backend

### Padrões de Design Usados:

1. **Singleton Pattern** (`GameManager`)
   - Apenas uma instância do gerenciador
   - Gerencia todos os jogos

2. **Factory Pattern** (`GameManager.create_game()`)
   - Cria diferentes tipos de jogos
   - `BoatGame` ou `BalloonGame` baseado no tipo

3. **Template Method** (`BaseGame`)
   - Classe abstrata com métodos comuns
   - Subclasses implementam lógica específica

---

## 📊 O que o Frontend NÃO faz

O frontend React Native **NÃO**:
- ❌ Calcula posição do barco
- ❌ Calcula tamanho do balão
- ❌ Calcula pontuação
- ❌ Detecta padrões de sopro
- ❌ Processa áudio avançado
- ❌ Controla lógica do jogo

O frontend **APENAS**:
- ✅ Capta áudio do microfone
- ✅ Envia para backend
- ✅ Recebe estado do jogo
- ✅ Mostra na tela (UI)

---

## 🔄 Fluxo Completo

```
1. Usuário sopla no microfone
   ↓
2. Frontend capta áudio (expo-av)
   ↓
3. Frontend converte para intensidade (0-1)
   ↓
4. Frontend envia para backend: POST /api/games/<id>/audio
   ↓
5. Backend processa áudio (AudioProcessor)
   ↓
6. Backend passa para jogo específico (BoatGame/BalloonGame)
   ↓
7. Jogo calcula:
   - Posição/tamanho
   - Score
   - Progresso
   - Vitória/derrota
   ↓
8. Backend retorna estado completo
   ↓
9. Frontend recebe e atualiza UI
   ↓
10. Repete (a cada 50-100ms)
```

---

## ✅ Resumo

**Backend Python = CÉREBRO DOS JOGOS**
- Toda lógica de negócio
- Processamento de áudio
- Cálculo de scores
- Controle de estado
- Detecção de vitória/derrota

**Frontend React Native = INTERFACE**
- Capta áudio
- Envia dados
- Mostra resultado

---

**Tudo que é "lógica do jogo" está em Python!** 🐍

