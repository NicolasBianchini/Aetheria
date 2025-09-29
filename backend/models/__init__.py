"""
Módulo de modelos - Classes principais dos jogos
Demonstra herança, polimorfismo e encapsulamento
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.base_game import BaseGame
from models.boat_game import BoatGame
from models.balloon_game import BalloonGame

__all__ = ['BaseGame', 'BoatGame', 'BalloonGame']
