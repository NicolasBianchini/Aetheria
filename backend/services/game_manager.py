"""
Gerenciador de jogos usando padrões de design Factory e Singleton
Demonstra conceitos avançados de POO
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
import threading
from enum import Enum

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.base_game import BaseGame
from models.boat_game import BoatGame
from models.balloon_game import BalloonGame
from services.audio_processor import AudioProcessor

class GameType(Enum):
    """Enum para tipos de jogos disponíveis"""
    BOAT = "boat"
    BALLOON = "balloon"

class GameManager:
    """
    Gerenciador de jogos usando padrão Singleton
    Responsável por criar, gerenciar e controlar jogos
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Implementação do padrão Singleton"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(GameManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Inicializa o gerenciador de jogos"""
        if not hasattr(self, '_initialized'):
            self._games: Dict[str, BaseGame] = {}
            self._audio_processor = AudioProcessor()
            self._game_counter = 0
            self._active_games: List[str] = []
            
            self._logger = logging.getLogger("GameManager")
            self._initialized = True
    
    def create_game(self, game_type: GameType, player_name: str = "Jogador") -> Dict[str, Any]:
        """
        Factory method para criar jogos
        
        Args:
            game_type: Tipo do jogo a ser criado
            player_name: Nome do jogador
            
        Returns:
            Dict com informações do jogo criado
        """
        self._game_counter += 1
        game_id = f"{game_type.value}_{self._game_counter}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Factory pattern para criar jogos
        if game_type == GameType.BOAT:
            game = BoatGame(game_id, player_name)
        elif game_type == GameType.BALLOON:
            game = BalloonGame(game_id, player_name)
        else:
            raise ValueError(f"Tipo de jogo não suportado: {game_type}")
        
        # Armazenar jogo
        self._games[game_id] = game
        
        self._logger.info(f"Jogo criado: {game_id} ({game_type.value}) para {player_name}")
        
        return {
            "game_id": game_id,
            "game_type": game_type.value,
            "player_name": player_name,
            "created_at": datetime.now().isoformat()
        }
    
    def start_game(self, game_id: str) -> Dict[str, Any]:
        """
        Inicia um jogo
        
        Args:
            game_id: ID do jogo
            
        Returns:
            Dict com informações do jogo iniciado
        """
        if game_id not in self._games:
            raise ValueError(f"Jogo não encontrado: {game_id}")
        
        game = self._games[game_id]
        result = game.start_game()
        
        # Adicionar à lista de jogos ativos
        if game_id not in self._active_games:
            self._active_games.append(game_id)
        
        self._logger.info(f"Jogo iniciado: {game_id}")
        
        return result
    
    def end_game(self, game_id: str) -> Dict[str, Any]:
        """
        Finaliza um jogo
        
        Args:
            game_id: ID do jogo
            
        Returns:
            Dict com estatísticas finais do jogo
        """
        if game_id not in self._games:
            raise ValueError(f"Jogo não encontrado: {game_id}")
        
        game = self._games[game_id]
        result = game.end_game()
        
        # Remover da lista de jogos ativos
        if game_id in self._active_games:
            self._active_games.remove(game_id)
        
        self._logger.info(f"Jogo finalizado: {game_id}")
        
        return result
    
    def process_audio_input(self, game_id: str, audio_data: bytes) -> Dict[str, Any]:
        """
        Processa entrada de áudio para um jogo específico
        
        Args:
            game_id: ID do jogo
            audio_data: Dados de áudio
            
        Returns:
            Dict com dados processados do jogo
        """
        if game_id not in self._games:
            raise ValueError(f"Jogo não encontrado: {game_id}")
        
        game = self._games[game_id]
        
        # Processar áudio com filtros avançados
        blow_detected, intensity, metadata = self._audio_processor.detect_blow(audio_data)
        
        # Converter dados para formato esperado pelo jogo
        audio_bytes = audio_data
        
        # Processar no jogo específico
        game_data = game.process_audio_input(audio_bytes)
        
        # Adicionar metadados de áudio e score
        game_data.update({
            "audio_metadata": metadata,
            "blow_detected": bool(blow_detected),
            "blow_intensity": float(intensity),
            "score": game.score  # Score atualizado pelo backend
        })
        
        return game_data
    
    def process_audio_intensity(self, game_id: str, intensity: float, metering_db: float = None) -> Dict[str, Any]:
        """
        Processa intensidade de áudio diretamente (sem gerar áudio aleatório)
        Usa dados reais do microfone do frontend
        
        Args:
            game_id: ID do jogo
            intensity: Intensidade do áudio (0-1) do frontend
            metering_db: Nível de metering em dB (opcional)
            
        Returns:
            Dict com dados processados do jogo
        """
        if game_id not in self._games:
            raise ValueError(f"Jogo não encontrado: {game_id}")
        
        game = self._games[game_id]
        
        # Detectar sopro baseado na intensidade - equilíbrio entre captar sopros e filtrar ruído
        blow_threshold = 0.15  # 15% - aumentado de 10% para filtrar melhor ruído externo
        blow_detected = False  # Por padrão, não é sopro
        
        # Se tiver metering_db, usar análise mais precisa (prioridade)
        if metering_db is not None:
            # Sopro geralmente está entre -30 dB (forte) e -50 dB (fraco)
            # Ruído ambiente geralmente está abaixo de -55 dB
            # Threshold equilibrado: detectar se estiver acima de -50 dB (não muito restritivo)
            db_threshold = -50.0  # dB - aumentado de -55 para filtrar melhor ruído
            if metering_db > db_threshold:
                # Se passar do threshold de dB E tiver intensidade mínima, é sopro
                if intensity >= 0.10:  # Requer pelo menos 10% de intensidade (aumentado de 5%)
                    blow_detected = True
                else:
                    blow_detected = False
            else:
                # Abaixo do threshold de dB = ruído ambiente ou silêncio
                blow_detected = False
        else:
            # Se não tiver metering_db, usar apenas intensidade
            blow_detected = intensity >= blow_threshold
        
        # Processar no jogo específico usando intensidade diretamente
        game_data = game.process_intensity(intensity, blow_detected)
        
        # Adicionar metadados e score
        game_data.update({
            "blow_detected": bool(blow_detected),
            "blow_intensity": float(intensity),
            "score": game.score  # Score atualizado pelo backend
        })
        
        if metering_db is not None:
            game_data["audio_metering_db"] = float(metering_db)
        
        return game_data
    
    def calibrate_audio(self, audio_samples: List[bytes]) -> Dict[str, Any]:
        """
        Calibra o sistema de áudio com amostras de ruído ambiente
        
        Args:
            audio_samples: Lista de amostras de áudio para calibração
            
        Returns:
            Dict com status da calibração
        """
        # Converter bytes para arrays numpy
        numpy_samples = []
        for sample in audio_samples:
            numpy_array = np.frombuffer(sample, dtype=np.int16).astype(np.float32)
            numpy_samples.append(numpy_array)
        
        # Calibrar processador de áudio
        self._audio_processor.calibrate_background_noise(numpy_samples)
        
        # Aplicar calibração a todos os jogos ativos
        for game_id in self._active_games:
            game = self._games[game_id]
            game.calibrate_audio_threshold(self._audio_processor.background_noise_level)
        
        return self._audio_processor.get_calibration_status()
    
    def get_game_status(self, game_id: str) -> Dict[str, Any]:
        """
        Retorna status de um jogo específico
        
        Args:
            game_id: ID do jogo
            
        Returns:
            Dict com status do jogo
        """
        if game_id not in self._games:
            raise ValueError(f"Jogo não encontrado: {game_id}")
        
        game = self._games[game_id]
        
        return {
            "game_id": game_id,
            "player_name": game.player_name,
            "is_active": game.is_active,
            "score": game.score,
            "level": game.level,
            "game_stats": game.get_game_stats() if hasattr(game, 'get_game_stats') else {}
        }
    
    def get_all_games(self) -> List[Dict[str, Any]]:
        """
        Retorna lista de todos os jogos
        
        Returns:
            Lista com informações de todos os jogos
        """
        games_info = []
        for game_id, game in self._games.items():
            games_info.append({
                "game_id": game_id,
                "player_name": game.player_name,
                "is_active": game.is_active,
                "score": game.score,
                "level": game.level,
                "game_type": game.__class__.__name__
            })
        
        return games_info
    
    def get_active_games(self) -> List[str]:
        """
        Retorna lista de IDs de jogos ativos
        
        Returns:
            Lista de IDs de jogos ativos
        """
        return self._active_games.copy()
    
    def cleanup_inactive_games(self) -> int:
        """
        Remove jogos inativos da memória
        
        Returns:
            Número de jogos removidos
        """
        inactive_games = []
        for game_id, game in self._games.items():
            if not game.is_active:
                inactive_games.append(game_id)
        
        for game_id in inactive_games:
            del self._games[game_id]
        
        self._logger.info(f"Removidos {len(inactive_games)} jogos inativos")
        
        return len(inactive_games)
    
    def get_manager_stats(self) -> Dict[str, Any]:
        """
        Retorna estatísticas do gerenciador
        
        Returns:
            Dict com estatísticas do gerenciador
        """
        return {
            "total_games_created": self._game_counter,
            "active_games_count": len(self._active_games),
            "total_games_in_memory": len(self._games),
            "audio_calibrated": self._audio_processor.is_calibrated,
            "background_noise_level": self._audio_processor.background_noise_level
        }

# Import necessário para numpy
import numpy as np
