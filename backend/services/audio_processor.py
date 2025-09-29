"""
Serviço de processamento de áudio para detecção de sopros
Demonstra composição e encapsulamento em POO
"""

import numpy as np
from scipy import signal
from typing import Tuple, Optional, List
import logging

class AudioProcessor:
    """
    Classe responsável pelo processamento avançado de áudio
    para detectar sopros e filtrar ruídos ambientais.
    """
    
    def __init__(self, sample_rate: int = 44100):
        """
        Construtor do processador de áudio
        
        Args:
            sample_rate: Taxa de amostragem do áudio
        """
        self.sample_rate = sample_rate
        self.frame_size = 1024
        self.hop_length = 512
        
        # Filtros para diferentes tipos de sopro
        self._setup_blow_filters()
        
        # Sistema de calibração de ruído ambiente
        self.background_noise_level = 0.0
        self.noise_samples = []
        self.is_calibrated = False
        
        self._logger = logging.getLogger("AudioProcessor")
    
    def _setup_blow_filters(self) -> None:
        """Configura filtros específicos para detecção de sopros"""
        # Filtro passa-banda para frequências de sopro (200-800 Hz)
        self.blow_filter = signal.butter(
            4, 
            [200 / (self.sample_rate/2), 800 / (self.sample_rate/2)], 
            btype='band'
        )
        
        # Filtro passa-alta para remover ruídos de baixa frequência
        self.high_pass_filter = signal.butter(
            2, 
            100 / (self.sample_rate/2), 
            btype='high'
        )
        
        # Filtro passa-baixa para remover ruídos de alta frequência
        self.low_pass_filter = signal.butter(
            2, 
            2000 / (self.sample_rate/2), 
            btype='low'
        )
    
    def calibrate_background_noise(self, audio_samples: List[np.ndarray], duration: float = 3.0) -> None:
        """
        Calibra o nível de ruído ambiente
        
        Args:
            audio_samples: Amostras de áudio para calibração
            duration: Duração da calibração em segundos
        """
        self._logger.info("Iniciando calibração de ruído ambiente...")
        
        # Processar amostras de calibração
        noise_levels = []
        for sample in audio_samples:
            processed = self._preprocess_audio(sample)
            noise_level = self._calculate_rms(processed)
            noise_levels.append(noise_level)
        
        # Calcular nível médio de ruído
        self.background_noise_level = np.mean(noise_levels)
        self.noise_samples = noise_levels
        self.is_calibrated = True
        
        self._logger.info(f"Calibração concluída. Ruído ambiente: {self.background_noise_level:.4f}")
    
    def detect_blow(self, audio_data: bytes) -> Tuple[bool, float, dict]:
        """
        Detecta sopros no áudio com filtros avançados
        
        Args:
            audio_data: Dados de áudio em bytes
            
        Returns:
            Tuple (blow_detected, intensity, metadata)
        """
        # Log para debug
        print(f"DEBUG: Tipo dos dados de áudio: {type(audio_data)}")
        print(f"DEBUG: Tamanho dos dados: {len(audio_data)} bytes")
        print(f"DEBUG: Primeiros 20 bytes: {audio_data[:20]}")
        
        # Converter bytes para array numpy
        try:
            audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32)
        except ValueError as e:
            print(f"DEBUG: Erro ao converter áudio: {e}")
            # Tentar com dtype diferente se necessário
            try:
                audio_array = np.frombuffer(audio_data, dtype=np.uint8).astype(np.float32)
                print("DEBUG: Convertido com uint8")
            except ValueError as e2:
                print(f"DEBUG: Erro também com uint8: {e2}")
                raise e
        
        # Normalizar áudio
        audio_array = audio_array / np.max(np.abs(audio_array))
        
        # Pré-processar áudio
        processed_audio = self._preprocess_audio(audio_array)
        
        # Aplicar filtros específicos para sopro
        filtered_audio = self._apply_blow_filters(processed_audio)
        
        # Detectar sopro
        blow_detected, intensity = self._analyze_blow_pattern(filtered_audio)
        
        # Calcular metadados
        metadata = self._calculate_audio_metadata(audio_array, filtered_audio)
        
        return blow_detected, intensity, metadata
    
    def _preprocess_audio(self, audio_array: np.ndarray) -> np.ndarray:
        """
        Pré-processa áudio removendo DC offset e aplicando normalização
        
        Args:
            audio_array: Array de áudio
            
        Returns:
            Áudio pré-processado
        """
        # Remover DC offset
        audio_array = audio_array - np.mean(audio_array)
        
        # Aplicar janela de Hamming para reduzir vazamento espectral
        window = signal.windows.hamming(len(audio_array))
        audio_array = audio_array * window
        
        return audio_array
    
    def _apply_blow_filters(self, audio_array: np.ndarray) -> np.ndarray:
        """
        Aplica filtros específicos para detecção de sopros
        
        Args:
            audio_array: Array de áudio
            
        Returns:
            Áudio filtrado
        """
        # Aplicar filtro passa-banda para frequências de sopro
        filtered = signal.filtfilt(*self.blow_filter, audio_array)
        
        # Aplicar filtro passa-alta para remover ruídos de baixa frequência
        filtered = signal.filtfilt(*self.high_pass_filter, filtered)
        
        # Aplicar filtro passa-baixa para remover ruídos de alta frequência
        filtered = signal.filtfilt(*self.low_pass_filter, filtered)
        
        return filtered
    
    def _analyze_blow_pattern(self, filtered_audio: np.ndarray) -> Tuple[bool, float]:
        """
        Analisa padrões de sopro no áudio filtrado
        
        Args:
            filtered_audio: Áudio filtrado
            
        Returns:
            Tuple (blow_detected, intensity)
        """
        # Calcular RMS (Root Mean Square) para intensidade
        rms = self._calculate_rms(filtered_audio)
        
        # Calcular threshold dinâmico baseado no ruído ambiente
        if self.is_calibrated:
            threshold = self.background_noise_level * 2.5  # 2.5x o ruído ambiente
        else:
            threshold = 0.1  # Threshold padrão
        
        # Detectar sopro
        blow_detected = rms > threshold
        
        # Calcular intensidade normalizada
        intensity = min(rms / threshold, 1.0) if threshold > 0 else 0
        
        return blow_detected, intensity
    
    def _calculate_rms(self, audio_array: np.ndarray) -> float:
        """
        Calcula RMS (Root Mean Square) do áudio
        
        Args:
            audio_array: Array de áudio
            
        Returns:
            Valor RMS
        """
        return np.sqrt(np.mean(audio_array**2))
    
    def _calculate_audio_metadata(self, original_audio: np.ndarray, filtered_audio: np.ndarray) -> dict:
        """
        Calcula metadados do áudio processado
        
        Args:
            original_audio: Áudio original
            filtered_audio: Áudio filtrado
            
        Returns:
            Dict com metadados
        """
        # Calcular FFT para análise espectral
        fft_original = np.fft.fft(original_audio)
        fft_filtered = np.fft.fft(filtered_audio)
        
        frequencies = np.fft.fftfreq(len(original_audio), 1/self.sample_rate)
        
        # Encontrar frequência dominante
        dominant_freq_idx = np.argmax(np.abs(fft_filtered))
        dominant_frequency = abs(frequencies[dominant_freq_idx])
        
        # Calcular energia em diferentes bandas de frequência
        low_energy = np.sum(np.abs(fft_filtered[frequencies < 200])**2)
        mid_energy = np.sum(np.abs(fft_filtered[(frequencies >= 200) & (frequencies <= 800)])**2)
        high_energy = np.sum(np.abs(fft_filtered[frequencies > 800])**2)
        
        return {
            "dominant_frequency": float(dominant_frequency),
            "low_frequency_energy": float(low_energy),
            "mid_frequency_energy": float(mid_energy),
            "high_frequency_energy": float(high_energy),
            "total_energy": float(np.sum(np.abs(fft_filtered)**2)),
            "snr": float(self._calculate_snr(original_audio, filtered_audio))
        }
    
    def _calculate_snr(self, original: np.ndarray, filtered: np.ndarray) -> float:
        """
        Calcula Signal-to-Noise Ratio (SNR)
        
        Args:
            original: Áudio original
            filtered: Áudio filtrado
            
        Returns:
            Valor SNR em dB
        """
        signal_power = np.mean(filtered**2)
        noise_power = np.mean((original - filtered)**2)
        
        if noise_power == 0:
            return float('inf')
        
        snr_db = 10 * np.log10(signal_power / noise_power)
        return snr_db
    
    def get_calibration_status(self) -> dict:
        """
        Retorna status da calibração
        
        Returns:
            Dict com status da calibração
        """
        return {
            "is_calibrated": self.is_calibrated,
            "background_noise_level": self.background_noise_level,
            "noise_samples_count": len(self.noise_samples),
            "recommended_threshold": self.background_noise_level * 2.5 if self.is_calibrated else 0.1
        }
