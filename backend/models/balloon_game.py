"""
Implementação específica do jogo do balão/palhaço
Demonstra herança e polimorfismo em POO
"""

import numpy as np
from typing import Dict, Any
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.base_game import BaseGame
import logging

class BalloonGame(BaseGame):
    """
    Jogo do balão onde o palhaço sobe conforme o balão enche com sopros.
    Herda de BaseGame e implementa comportamentos específicos.
    """
    
    def __init__(self, game_id: str, player_name: str = "Jogador"):
        """
        Construtor específico do BalloonGame
        
        Args:
            game_id: Identificador único do jogo
            player_name: Nome do jogador
        """
        super().__init__(game_id, player_name)
        
        # Atributos específicos do jogo do balão
        self._balloon_size = 1.0      # Tamanho do balão (1-3)
        self._clown_height = 0.0      # Altura do palhaço (0-200)
        self._balloon_pressure = 0.0  # Pressão interna do balão
        self._max_pressure = 100.0    # Pressão máxima antes de estourar
        
        # Configurações específicas de áudio para sopro contínuo
        self._blow_frequency_min = 150  # Hz - frequência mínima de sopro
        self._blow_frequency_max = 600  # Hz - frequência máxima de sopro
        self._continuous_blow_threshold = 0.3  # Threshold para sopro contínuo
        
        # Sistema de vazamento do balão
        self._leak_rate = 0.5  # Taxa de vazamento por segundo
        self._last_blow_time = None
        
        # Histórico de pressão
        self._pressure_history = []
        self._blow_sessions = []
        
        self._logger = logging.getLogger("BalloonGame")
    
    def _process_audio(self, audio_data: bytes, sample_rate: int = 44100) -> Dict[str, Any]:
        """
        Processa áudio específico para detectar sopros contínuos e encher o balão
        
        Args:
            audio_data: Dados de áudio em bytes
            sample_rate: Taxa de amostragem
            
        Returns:
            Dict com dados processados do jogo do balão
        """
        # Converter bytes para array numpy
        audio_array = np.frombuffer(audio_data, dtype=np.int16)
        
        # Detectar sopro contínuo
        blow_detected, blow_intensity, blow_duration = self._detect_continuous_blow(audio_array, sample_rate)
        
        if blow_detected:
            # Adicionar pressão ao balão
            pressure_added = self._calculate_pressure_increase(blow_intensity, blow_duration)
            self._add_pressure(pressure_added)
            
            # Registrar sessão de sopro
            self._record_blow_session(blow_intensity, blow_duration)
        
        # Aplicar vazamento natural do balão
        self._apply_balloon_leak()
        
        # Atualizar tamanho do balão e altura do palhaço
        self._update_balloon_and_clown()
        
        return {
            "blow_detected": blow_detected,
            "blow_intensity": blow_intensity,
            "blow_duration": blow_duration,
            "balloon_size": self._balloon_size,
            "clown_height": self._clown_height,
            "balloon_pressure": self._balloon_pressure,
            "game_progress": self._clown_height / 200.0,
            "is_balloon_full": self._balloon_pressure >= self._max_pressure * 0.9
        }
    
    def _detect_continuous_blow(self, audio_array: np.ndarray, sample_rate: int) -> tuple[bool, float, float]:
        """
        Detecta sopros contínuos no áudio
        
        Args:
            audio_array: Array de áudio
            sample_rate: Taxa de amostragem
            
        Returns:
            Tuple (blow_detected, intensity, duration)
        """
        # Calcular FFT para análise de frequência
        fft = np.fft.fft(audio_array)
        frequencies = np.fft.fftfreq(len(audio_array), 1/sample_rate)
        
        # Filtrar frequências de sopro
        blow_mask = (frequencies >= self._blow_frequency_min) & (frequencies <= self._blow_frequency_max)
        blow_spectrum = np.abs(fft[blow_mask])
        
        # Calcular intensidade do sopro
        blow_intensity = np.mean(blow_spectrum) if len(blow_spectrum) > 0 else 0
        normalized_intensity = min(blow_intensity / 1000, 1.0)
        
        # Detectar sopro contínuo baseado no threshold
        blow_detected = normalized_intensity > self._continuous_blow_threshold
        
        # Calcular duração do sopro (simulado baseado na intensidade)
        blow_duration = normalized_intensity * 0.5  # 0-0.5 segundos
        
        return blow_detected, normalized_intensity, blow_duration
    
    def _calculate_pressure_increase(self, blow_intensity: float, blow_duration: float) -> float:
        """
        Calcula aumento de pressão baseado no sopro
        
        Args:
            blow_intensity: Intensidade do sopro (0-1)
            blow_duration: Duração do sopro em segundos
            
        Returns:
            Pressão a ser adicionada
        """
        # Pressão baseada na intensidade e duração
        base_pressure = blow_intensity * blow_duration * 10
        
        # Bonus por sopros consistentes
        consistency_bonus = self._calculate_consistency_bonus()
        
        # Ajustar pela dificuldade
        difficulty_multiplier = {"Fácil": 1.3, "Médio": 1.0, "Difícil": 0.7}[self._difficulty]
        
        total_pressure = (base_pressure + consistency_bonus) * difficulty_multiplier
        
        return total_pressure
    
    def _calculate_consistency_bonus(self) -> float:
        """
        Calcula bonus por sopros consistentes
        
        Returns:
            Bonus de consistência
        """
        if len(self._pressure_history) < 3:
            return 0
        
        # Calcular variância dos últimos sopros
        recent_pressures = self._pressure_history[-3:]
        variance = np.var(recent_pressures)
        
        # Bonus maior para menor variância (mais consistente)
        consistency_bonus = max(0, 5 - variance)
        
        return consistency_bonus
    
    def _add_pressure(self, pressure: float) -> None:
        """
        Adiciona pressão ao balão
        
        Args:
            pressure: Pressão a ser adicionada
        """
        self._balloon_pressure = min(self._balloon_pressure + pressure, self._max_pressure)
        self._pressure_history.append(self._balloon_pressure)
        
        # Limitar histórico
        if len(self._pressure_history) > 50:
            self._pressure_history.pop(0)
    
    def _apply_balloon_leak(self) -> None:
        """Aplica vazamento natural do balão"""
        self._balloon_pressure = max(self._balloon_pressure - self._leak_rate, 0)
    
    def _update_balloon_and_clown(self) -> None:
        """Atualiza tamanho do balão e altura do palhaço"""
        # Tamanho do balão baseado na pressão
        pressure_ratio = self._balloon_pressure / self._max_pressure
        self._balloon_size = 1.0 + (pressure_ratio * 2.0)  # 1.0 a 3.0
        
        # Altura do palhaço baseada na pressão
        self._clown_height = pressure_ratio * 200.0  # 0 a 200 pixels
        
        # Verificar se o balão estourou
        if self._balloon_pressure >= self._max_pressure:
            self._balloon_burst()
    
    def _balloon_burst(self) -> None:
        """Processa quando o balão estoura"""
        self._balloon_pressure = 0
        self._balloon_size = 1.0
        self._clown_height = 0
        
        # Penalidade por estourar o balão
        self._score = max(0, self._score - 50)
        
        self._logger.info("Balão estourou! Penalidade aplicada.")
    
    def _record_blow_session(self, intensity: float, duration: float) -> None:
        """
        Registra sessão de sopro
        
        Args:
            intensity: Intensidade do sopro
            duration: Duração do sopro
        """
        self._blow_sessions.append({
            "intensity": intensity,
            "duration": duration,
            "timestamp": self._start_time
        })
        
        # Limitar histórico
        if len(self._blow_sessions) > 50:
            self._blow_sessions.pop(0)
    
    def _update_score(self, processed_data: Dict[str, Any]) -> None:
        """
        Atualiza score baseado nos dados processados
        
        Args:
            processed_data: Dados processados do jogo
        """
        if processed_data["blow_detected"]:
            # Score baseado na altura alcançada
            height_score = int(processed_data["clown_height"] / 10)
            
            # Bonus por manter pressão constante
            pressure_bonus = int(self._balloon_pressure / 5)
            
            # Bonus por não estourar o balão
            no_burst_bonus = 10 if not processed_data["is_balloon_full"] else 0
            
            self._score += height_score + pressure_bonus + no_burst_bonus
    
    def _on_game_start(self) -> None:
        """Hook chamado quando o jogo inicia"""
        self._balloon_size = 1.0
        self._clown_height = 0.0
        self._balloon_pressure = 0.0
        self._pressure_history.clear()
        self._blow_sessions.clear()
        
        self._logger.info("BalloonGame iniciado - Balão vazio")
    
    def _on_game_end(self) -> None:
        """Hook chamado quando o jogo termina"""
        max_height = max([session["intensity"] for session in self._blow_sessions]) if self._blow_sessions else 0
        total_sessions = len(self._blow_sessions)
        
        self._logger.info(f"BalloonGame finalizado - Altura máxima: {self._clown_height:.1f}, "
                         f"Total de sessões: {total_sessions}")
    
    def get_game_stats(self) -> Dict[str, Any]:
        """
        Retorna estatísticas específicas do jogo do balão
        
        Returns:
            Dict com estatísticas do jogo
        """
        return {
            "balloon_size": self._balloon_size,
            "clown_height": self._clown_height,
            "balloon_pressure": self._balloon_pressure,
            "max_pressure_reached": max(self._pressure_history) if self._pressure_history else 0,
            "total_blow_sessions": len(self._blow_sessions),
            "avg_blow_intensity": np.mean([session["intensity"] for session in self._blow_sessions]) if self._blow_sessions else 0,
            "game_progress": self._clown_height / 200.0
        }
