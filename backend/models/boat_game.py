"""
Implementação específica do jogo do barquinho
Demonstra herança e polimorfismo em POO
"""

import numpy as np
from typing import Dict, Any
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.base_game import BaseGame
import logging

class BoatGame(BaseGame):
    """
    Jogo do barquinho que navega baseado na intensidade do sopro.
    Herda de BaseGame e implementa comportamentos específicos.
    """
    
    def __init__(self, game_id: str, player_name: str = "Jogador"):
        """
        Construtor específico do BoatGame
        
        Args:
            game_id: Identificador único do jogo
            player_name: Nome do jogador
        """
        super().__init__(game_id, player_name)
        
        # Atributos específicos do jogo do barco
        self._boat_position = 0.0  # Posição do barco (0-100)
        self._boat_speed = 0.0     # Velocidade atual do barco
        self._max_speed = 10.0     # Velocidade máxima
        self._water_resistance = 0.05  # Resistência da água reduzida para movimento mais fluido
        
        # Configurações específicas de áudio para sopro - ampliado para detectar melhor
        self._blow_frequency_min = 100  # Hz - frequência mínima de sopro (reduzido)
        self._blow_frequency_max = 2000  # Hz - frequência máxima de sopro (aumentado)
        self._blow_duration_min = 0.5   # segundos - duração mínima
        
        # Histórico de sopros para análise
        self._blow_history = []
        self._consecutive_blows = 0
        
        self._logger = logging.getLogger("BoatGame")
    
    def _process_audio(self, audio_data: bytes, sample_rate: int = 44100) -> Dict[str, Any]:
        """
        Processa áudio específico para detectar sopros e mover o barco
        
        Args:
            audio_data: Dados de áudio em bytes
            sample_rate: Taxa de amostragem
            
        Returns:
            Dict com dados processados do jogo do barco
        """
        # Converter bytes para array numpy
        audio_array = np.frombuffer(audio_data, dtype=np.int16)
        
        # Aplicar filtros de sopro
        blow_detected, blow_intensity = self._detect_blow(audio_array, sample_rate)
        
        # Sempre aplicar movimento baseado na intensidade do áudio (mesmo que não seja sopro detectado)
        # Isso torna o jogo mais responsivo
        boat_movement = self._calculate_boat_movement(blow_intensity)
        self._update_boat_position(boat_movement)
        
        if blow_detected:
            # Registrar sopro no histórico apenas se detectado
            self._record_blow(blow_intensity)
        
        # Aplicar resistência da água (barco desacelera naturalmente)
        self._apply_water_resistance()
        
        return {
            "blow_detected": bool(blow_detected),
            "blow_intensity": float(blow_intensity),
            "boat_position": float(self._boat_position),
            "boat_speed": float(self._boat_speed),
            "consecutive_blows": int(self._consecutive_blows),
            "game_progress": float(self._boat_position / 100.0)
        }
    
    def _detect_blow(self, audio_array: np.ndarray, sample_rate: int) -> tuple[bool, float]:
        """
        Detecta sopros no áudio usando análise de energia total
        
        Args:
            audio_array: Array de áudio
            sample_rate: Taxa de amostragem
            
        Returns:
            Tuple (blow_detected, intensity)
        """
        # Converter para float64 para evitar problemas de precisão
        audio_float = audio_array.astype(np.float64)
        
        # Calcular energia total do áudio (RMS)
        rms_energy = np.sqrt(np.mean(audio_float**2))
        
        # Detectar sopro baseado na energia RMS bruta - mais simples
        blow_detected = rms_energy > 1000  # Threshold ajustado para valores reais de áudio
        
        # Normalizar energia (0-1) para retorno
        normalized_intensity = min(rms_energy / 1000, 1.0)
        
        # Log para debug
        print(f"DEBUG: RMS Energy: {rms_energy}, Normalized: {normalized_intensity}, Blow Detected: {blow_detected}")
        
        return blow_detected, normalized_intensity
    
    def _calculate_boat_movement(self, blow_intensity: float) -> float:
        """
        Calcula movimento do barco baseado na intensidade do sopro
        
        Args:
            blow_intensity: Intensidade do sopro (0-1)
            
        Returns:
            Movimento do barco
        """
        # Movimento baseado na intensidade do áudio - muito responsivo
        base_movement = blow_intensity * self._max_speed * 5.0  # Multiplicado por 5 para movimento mais visível
        
        # Bonus por sopros consecutivos
        consecutive_bonus = min(self._consecutive_blows * 0.5, 2.0)  # Bonus maior
        
        # Ajustar pela dificuldade
        difficulty_multiplier = {"Fácil": 2.0, "Médio": 1.5, "Difícil": 1.0}[self._difficulty]  # Multiplicadores maiores
        
        total_movement = (base_movement + consecutive_bonus) * difficulty_multiplier
        
        return total_movement
    
    def _update_boat_position(self, movement: float) -> None:
        """
        Atualiza posição do barco
        
        Args:
            movement: Movimento a ser aplicado
        """
        self._boat_speed = movement
        self._boat_position = min(self._boat_position + movement, 100.0)
        
        # Verificar se chegou ao final
        if self._boat_position >= 100.0:
            self._level_up()
    
    def _apply_water_resistance(self) -> None:
        """Aplica resistência da água (barco desacelera)"""
        self._boat_speed *= (1 - self._water_resistance)
        if self._boat_speed < 0.1:
            self._boat_speed = 0
    
    def _record_blow(self, intensity: float) -> None:
        """
        Registra sopro no histórico
        
        Args:
            intensity: Intensidade do sopro
        """
        self._blow_history.append({
            "intensity": intensity,
            "timestamp": self._start_time
        })
        
        self._consecutive_blows += 1
        
        # Limitar histórico
        if len(self._blow_history) > 100:
            self._blow_history.pop(0)
    
    def _update_score(self, processed_data: Dict[str, Any]) -> None:
        """
        Atualiza score baseado nos dados processados
        
        Args:
            processed_data: Dados processados do jogo
        """
        if processed_data["blow_detected"]:
            # Score baseado na intensidade do sopro
            blow_score = int(processed_data["blow_intensity"] * 10)
            
            # Bonus por sopros consecutivos
            consecutive_bonus = min(self._consecutive_blows * 2, 20)
            
            self._score += blow_score + consecutive_bonus
    
    def _on_game_start(self) -> None:
        """Hook chamado quando o jogo inicia"""
        self._boat_position = 0.0
        self._boat_speed = 0.0
        self._consecutive_blows = 0
        self._blow_history.clear()
        
        self._logger.info("BoatGame iniciado - Barco na posição inicial")
    
    def _on_game_end(self) -> None:
        """Hook chamado quando o jogo termina"""
        total_blows = len(self._blow_history)
        avg_intensity = np.mean([blow["intensity"] for blow in self._blow_history]) if self._blow_history else 0
        
        self._logger.info(f"BoatGame finalizado - Total de sopros: {total_blows}, "
                         f"Intensidade média: {avg_intensity:.2f}")
    
    def _level_up(self) -> None:
        """Avança para o próximo nível"""
        self._level += 1
        self._boat_position = 0.0  # Reset posição para próximo nível
        
        # Aumentar dificuldade
        self._max_speed += 1.0
        self._water_resistance += 0.05
        
        self._logger.info(f"Level up! Novo nível: {self._level}")
    
    def get_game_stats(self) -> Dict[str, Any]:
        """
        Retorna estatísticas específicas do jogo do barco
        
        Returns:
            Dict com estatísticas do jogo
        """
        return {
            "boat_position": self._boat_position,
            "boat_speed": self._boat_speed,
            "total_blows": len(self._blow_history),
            "consecutive_blows": self._consecutive_blows,
            "max_speed_reached": max([blow["intensity"] for blow in self._blow_history]) if self._blow_history else 0,
            "game_progress": self._boat_position / 100.0
        }
