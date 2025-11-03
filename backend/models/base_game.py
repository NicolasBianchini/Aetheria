"""
Classe base abstrata para jogos de terapia respiratória
Demonstra conceitos de POO: herança, polimorfismo e encapsulamento
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional
import logging

class BaseGame(ABC):
    """
    Classe abstrata base para todos os jogos de terapia respiratória.
    Implementa o padrão Template Method.
    """
    
    def __init__(self, game_id: str, player_name: str = "Jogador"):
        """
        Construtor da classe base
        
        Args:
            game_id: Identificador único do jogo
            player_name: Nome do jogador
        """
        self._game_id = game_id
        self._player_name = player_name
        self._start_time: Optional[datetime] = None
        self._end_time: Optional[datetime] = None
        self._is_active = False
        self._score = 0
        self._level = 1
        self._difficulty = "Fácil"
        
        # Configurações de áudio
        self._audio_threshold = 0.5
        self._noise_reduction = True
        self._frequency_range = (100, 2000)  # Hz
        
        self._logger = logging.getLogger(f"{self.__class__.__name__}")
    
    @property
    def game_id(self) -> str:
        """Getter para game_id (encapsulamento)"""
        return self._game_id
    
    @property
    def player_name(self) -> str:
        """Getter para player_name"""
        return self._player_name
    
    @property
    def is_active(self) -> bool:
        """Getter para is_active"""
        return self._is_active
    
    @property
    def score(self) -> int:
        """Getter para score"""
        return self._score
    
    @property
    def level(self) -> int:
        """Getter para level"""
        return self._level
    
    def start_game(self) -> Dict[str, Any]:
        """
        Inicia o jogo (Template Method)
        
        Returns:
            Dict com informações do jogo iniciado
        """
        self._start_time = datetime.now()
        self._is_active = True
        self._score = 0
        
        self._logger.info(f"Jogo {self._game_id} iniciado para {self._player_name}")
        
        # Hook para subclasses personalizarem a inicialização
        self._on_game_start()
        
        return {
            "game_id": self._game_id,
            "player_name": self._player_name,
            "start_time": self._start_time.isoformat(),
            "level": self._level,
            "difficulty": self._difficulty
        }
    
    def end_game(self) -> Dict[str, Any]:
        """
        Finaliza o jogo
        
        Returns:
            Dict com estatísticas finais do jogo
        """
        self._end_time = datetime.now()
        self._is_active = False
        
        duration = (self._end_time - self._start_time).total_seconds() if self._start_time else 0
        
        self._logger.info(f"Jogo {self._game_id} finalizado. Score: {self._score}, Duração: {duration}s")
        
        # Hook para subclasses personalizarem a finalização
        self._on_game_end()
        
        return {
            "game_id": self._game_id,
            "player_name": self._player_name,
            "score": self._score,
            "level": self._level,
            "duration": duration,
            "end_time": self._end_time.isoformat()
        }
    
    def process_audio_input(self, audio_data: bytes, sample_rate: int = 44100) -> Dict[str, Any]:
        """
        Processa entrada de áudio e retorna dados do jogo
        
        Args:
            audio_data: Dados de áudio em bytes
            sample_rate: Taxa de amostragem do áudio
            
        Returns:
            Dict com dados processados do jogo
        """
        if not self._is_active:
            raise ValueError("Jogo não está ativo")
        
        # Processar áudio (será implementado nas subclasses)
        processed_data = self._process_audio(audio_data, sample_rate)
        
        # Atualizar score baseado no processamento
        self._update_score(processed_data)
        
        return processed_data
    
    def set_difficulty(self, difficulty: str) -> None:
        """
        Define a dificuldade do jogo
        
        Args:
            difficulty: Nível de dificuldade ("Fácil", "Médio", "Difícil")
        """
        valid_difficulties = ["Fácil", "Médio", "Difícil"]
        if difficulty not in valid_difficulties:
            raise ValueError(f"Dificuldade deve ser uma de: {valid_difficulties}")
        
        self._difficulty = difficulty
        self._adjust_difficulty_settings()
    
    def calibrate_audio_threshold(self, background_noise_level: float) -> None:
        """
        Calibra o threshold de áudio baseado no ruído ambiente
        
        Args:
            background_noise_level: Nível de ruído ambiente detectado
        """
        self._audio_threshold = background_noise_level * 1.5  # 50% acima do ruído
        self._logger.info(f"Threshold calibrado para: {self._audio_threshold}")
    
    def process_intensity(self, intensity: float, blow_detected: bool) -> Dict[str, Any]:
        """
        Processa intensidade de áudio diretamente (sem áudio real)
        Usa dados reais do frontend
        
        Args:
            intensity: Intensidade do áudio (0-1)
            blow_detected: Se um sopro foi detectado
            
        Returns:
            Dict com dados processados do jogo
        """
        if not self._is_active:
            raise ValueError("Jogo não está ativo")
        
        # Processar intensidade (será implementado nas subclasses)
        processed_data = self._process_intensity(intensity, blow_detected)
        
        # Atualizar score baseado no processamento
        self._update_score(processed_data)
        
        return processed_data
    
    # Métodos abstratos que devem ser implementados pelas subclasses
    @abstractmethod
    def _process_audio(self, audio_data: bytes, sample_rate: int) -> Dict[str, Any]:
        """Processa dados de áudio específicos do jogo"""
        pass
    
    @abstractmethod
    def _process_intensity(self, intensity: float, blow_detected: bool) -> Dict[str, Any]:
        """Processa intensidade de áudio diretamente (sem áudio real)"""
        pass
    
    @abstractmethod
    def _update_score(self, processed_data: Dict[str, Any]) -> None:
        """Atualiza score baseado nos dados processados"""
        pass
    
    @abstractmethod
    def _on_game_start(self) -> None:
        """Hook chamado quando o jogo inicia"""
        pass
    
    @abstractmethod
    def _on_game_end(self) -> None:
        """Hook chamado quando o jogo termina"""
        pass
    
    def _adjust_difficulty_settings(self) -> None:
        """Ajusta configurações baseadas na dificuldade"""
        difficulty_multipliers = {
            "Fácil": 0.7,
            "Médio": 1.0,
            "Difícil": 1.5
        }
        
        multiplier = difficulty_multipliers[self._difficulty]
        self._audio_threshold *= multiplier
    
    def __str__(self) -> str:
        """Representação string do objeto"""
        return f"{self.__class__.__name__}(id={self._game_id}, player={self._player_name}, active={self._is_active})"
    
    def __repr__(self) -> str:
        """Representação detalhada do objeto"""
        return (f"{self.__class__.__name__}(game_id='{self._game_id}', "
                f"player_name='{self._player_name}', is_active={self._is_active}, "
                f"score={self._score}, level={self._level})")
