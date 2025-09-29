# 🌬️ Aetheria Backend - Sistema de Terapia Respiratória

Sistema backend desenvolvido em Python para demonstrar conceitos de **Programação Orientada a Objetos (POO)** na cadeira de POO da faculdade.

## 📚 Conceitos de POO Demonstrados

### 1. **Herança**
- `BaseGame` (classe abstrata base)
- `BoatGame` e `BalloonGame` (herdam de BaseGame)
- Métodos abstratos implementados nas subclasses

### 2. **Polimorfismo**
- Métodos `_process_audio()`, `_update_score()`, `_on_game_start()`, `_on_game_end()`
- Comportamentos diferentes para cada tipo de jogo
- Interface comum para diferentes implementações

### 3. **Encapsulamento**
- Atributos privados (`_game_id`, `_player_name`, etc.)
- Getters e setters para controle de acesso
- Métodos públicos e privados bem definidos

### 4. **Padrões de Design**
- **Singleton**: `GameManager` (uma única instância)
- **Factory**: Criação de jogos baseada em tipo
- **Template Method**: `BaseGame.start_game()` e `BaseGame.end_game()`
- **Composição**: `AudioProcessor` composto no `GameManager`

### 5. **Abstração**
- Classes abstratas com métodos abstratos
- Interfaces bem definidas
- Separação de responsabilidades

## 🏗️ Estrutura do Projeto

```
backend/
├── models/                 # Classes dos jogos
│   ├── __init__.py
│   ├── base_game.py       # Classe abstrata base
│   ├── boat_game.py       # Jogo do barquinho
│   └── balloon_game.py    # Jogo do balão
├── services/              # Lógica de negócio
│   ├── __init__.py
│   ├── audio_processor.py # Processamento de áudio
│   └── game_manager.py    # Gerenciador de jogos
├── examples/              # Exemplos de uso
│   └── game_demo.py      # Demonstração completa
├── app.py                 # API Flask
├── requirements.txt       # Dependências
└── README.md             # Este arquivo
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Executar Demonstração
```bash
python examples/game_demo.py
```

### 3. Executar API Flask
```bash
python app.py
```

A API estará disponível em `http://localhost:5000`

## 🎮 Classes Principais

### BaseGame (Classe Abstrata)
```python
class BaseGame(ABC):
    def __init__(self, game_id: str, player_name: str)
    def start_game(self) -> Dict[str, Any]
    def end_game(self) -> Dict[str, Any]
    def process_audio_input(self, audio_data: bytes) -> Dict[str, Any]
    
    @abstractmethod
    def _process_audio(self, audio_data: bytes, sample_rate: int) -> Dict[str, Any]
    
    @abstractmethod
    def _update_score(self, processed_data: Dict[str, Any]) -> None
```

### BoatGame (Herança)
```python
class BoatGame(BaseGame):
    def __init__(self, game_id: str, player_name: str)
    def _process_audio(self, audio_data: bytes, sample_rate: int) -> Dict[str, Any]
    def _detect_blow(self, audio_array: np.ndarray, sample_rate: int) -> tuple[bool, float]
    def _calculate_boat_movement(self, blow_intensity: float) -> float
    def get_game_stats(self) -> Dict[str, Any]
```

### GameManager (Singleton + Factory)
```python
class GameManager:
    _instance = None
    
    def __new__(cls):  # Singleton
        if cls._instance is None:
            cls._instance = super(GameManager, cls).__new__(cls)
        return cls._instance
    
    def create_game(self, game_type: GameType, player_name: str) -> Dict[str, Any]  # Factory
    def start_game(self, game_id: str) -> Dict[str, Any]
    def process_audio_input(self, game_id: str, audio_data: bytes) -> Dict[str, Any]
```

## 🔧 Funcionalidades

### Sistema de Áudio Avançado
- **Filtros de frequência** para detectar sopros (200-800 Hz)
- **Redução de ruído** ambiental
- **Calibração automática** de threshold
- **Análise espectral** com FFT

### Jogos Interativos
- **Jogo do Barquinho**: Navega baseado na intensidade do sopro
- **Jogo do Balão**: Enche balão e faz palhaço subir
- **Sistema de pontuação** baseado em performance
- **Múltiplos níveis** de dificuldade

### API REST
- **Endpoints** para criar, iniciar e finalizar jogos
- **Processamento de áudio** em tempo real
- **Estatísticas** e métricas de performance
- **Calibração** de sistema de áudio

## 📊 Exemplo de Uso

```python
from models import BoatGame
from services import GameManager, GameType

# Criar jogo usando Factory
manager = GameManager()
game_info = manager.create_game(GameType.BOAT, "João")

# Iniciar jogo
manager.start_game(game_info['game_id'])

# Processar áudio
audio_data = b'...'  # Dados de áudio
result = manager.process_audio_input(game_info['game_id'], audio_data)

# Finalizar jogo
final_stats = manager.end_game(game_info['game_id'])
```

## 🎯 Objetivos Educacionais

Este projeto demonstra:

1. **Herança**: Classes base e derivadas
2. **Polimorfismo**: Comportamentos diferentes para mesma interface
3. **Encapsulamento**: Controle de acesso a atributos
4. **Abstração**: Classes abstratas e interfaces
5. **Padrões de Design**: Singleton, Factory, Template Method
6. **Composição**: Objetos compostos por outros objetos
7. **Tratamento de Exceções**: Gerenciamento de erros
8. **Documentação**: Docstrings e type hints

## 🔗 Integração com App Expo

O backend Python se comunica com o app React Native através de uma API REST:

- **Criação de jogos**: `POST /api/games/create`
- **Processamento de áudio**: `POST /api/games/{id}/audio`
- **Status do jogo**: `GET /api/games/{id}/status`
- **Calibração**: `POST /api/audio/calibrate`

## 📝 Notas para a Cadeira de POO

Este projeto foi desenvolvido especificamente para demonstrar os conceitos fundamentais de POO:

- ✅ **Classes e Objetos**
- ✅ **Herança e Polimorfismo**
- ✅ **Encapsulamento**
- ✅ **Abstração**
- ✅ **Padrões de Design**
- ✅ **Tratamento de Exceções**
- ✅ **Documentação e Type Hints**

O código está bem documentado e comentado para facilitar o entendimento dos conceitos de POO aplicados na prática.
