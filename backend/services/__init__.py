"""
Módulo de serviços - Lógica de negócio e processamento
Demonstra composição e padrões de design
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.audio_processor import AudioProcessor
from services.game_manager import GameManager, GameType

__all__ = ['AudioProcessor', 'GameManager', 'GameType']
