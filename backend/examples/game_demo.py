"""
Demonstração do uso das classes de jogos
Exemplo prático de POO para a cadeira de POO
"""

import sys
import os
import numpy as np
from datetime import datetime

# Adicionar o diretório pai ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import BoatGame, BalloonGame
from services import GameManager, GameType, AudioProcessor

def simulate_audio_data(intensity: float = 0.5, duration: float = 1.0) -> bytes:
    """
    Simula dados de áudio para demonstração
    
    Args:
        intensity: Intensidade do sopro (0-1)
        duration: Duração em segundos
        
    Returns:
        Dados de áudio simulados em bytes
    """
    sample_rate = 44100
    samples = int(sample_rate * duration)
    
    # Gerar sinal senoidal na frequência de sopro (400 Hz)
    frequency = 400
    t = np.linspace(0, duration, samples)
    signal = intensity * np.sin(2 * np.pi * frequency * t)
    
    # Adicionar ruído
    noise = np.random.normal(0, 0.1, samples)
    signal += noise
    
    # Converter para int16 e depois para bytes
    signal_int16 = (signal * 32767).astype(np.int16)
    return signal_int16.tobytes()

def demo_boat_game():
    """Demonstra o jogo do barquinho"""
    print("🚤 === DEMONSTRAÇÃO DO JOGO DO BARQUINHO ===")
    
    # Criar instância do jogo
    boat_game = BoatGame("demo_boat_1", "Jogador Demo")
    
    # Configurar dificuldade
    boat_game.set_difficulty("Médio")
    
    # Iniciar jogo
    print("Iniciando jogo...")
    start_result = boat_game.start_game()
    print(f"Jogo iniciado: {start_result}")
    
    # Simular sopros
    print("\nSimulando sopros...")
    for i in range(5):
        # Simular áudio de sopro
        audio_data = simulate_audio_data(intensity=0.7 + i*0.1)
        
        # Processar áudio
        result = boat_game.process_audio_input(audio_data)
        
        print(f"Sopro {i+1}: Posição do barco: {result['boat_position']:.1f}, "
              f"Velocidade: {result['boat_speed']:.1f}, Score: {boat_game.score}")
    
    # Finalizar jogo
    end_result = boat_game.end_game()
    print(f"\nJogo finalizado: {end_result}")
    
    # Mostrar estatísticas
    stats = boat_game.get_game_stats()
    print(f"Estatísticas: {stats}")

def demo_balloon_game():
    """Demonstra o jogo do balão"""
    print("\n🎈 === DEMONSTRAÇÃO DO JOGO DO BALÃO ===")
    
    # Criar instância do jogo
    balloon_game = BalloonGame("demo_balloon_1", "Jogador Demo")
    
    # Configurar dificuldade
    balloon_game.set_difficulty("Fácil")
    
    # Iniciar jogo
    print("Iniciando jogo...")
    start_result = balloon_game.start_game()
    print(f"Jogo iniciado: {start_result}")
    
    # Simular sopros contínuos
    print("\nSimulando sopros contínuos...")
    for i in range(8):
        # Simular áudio de sopro contínuo
        audio_data = simulate_audio_data(intensity=0.6 + i*0.05, duration=0.8)
        
        # Processar áudio
        result = balloon_game.process_audio_input(audio_data)
        
        print(f"Sopro {i+1}: Tamanho do balão: {result['balloon_size']:.1f}, "
              f"Altura do palhaço: {result['clown_height']:.1f}, "
              f"Pressão: {result['balloon_pressure']:.1f}")
    
    # Finalizar jogo
    end_result = balloon_game.end_game()
    print(f"\nJogo finalizado: {end_result}")
    
    # Mostrar estatísticas
    stats = balloon_game.get_game_stats()
    print(f"Estatísticas: {stats}")

def demo_game_manager():
    """Demonstra o gerenciador de jogos"""
    print("\n🎮 === DEMONSTRAÇÃO DO GERENCIADOR DE JOGOS ===")
    
    # Criar gerenciador (Singleton)
    manager = GameManager()
    
    # Criar jogos usando o gerenciador
    print("Criando jogos...")
    boat_info = manager.create_game(GameType.BOAT, "Jogador 1")
    balloon_info = manager.create_game(GameType.BALLOON, "Jogador 2")
    
    print(f"Jogo do barco criado: {boat_info}")
    print(f"Jogo do balão criado: {balloon_info}")
    
    # Iniciar jogos
    manager.start_game(boat_info['game_id'])
    manager.start_game(balloon_info['game_id'])
    
    # Simular processamento de áudio
    print("\nProcessando áudio nos jogos...")
    for i in range(3):
        audio_data = simulate_audio_data(intensity=0.8)
        
        # Processar no jogo do barco
        boat_result = manager.process_audio_input(boat_info['game_id'], audio_data)
        print(f"Barco - Sopro {i+1}: Posição: {boat_result['boat_position']:.1f}")
        
        # Processar no jogo do balão
        balloon_result = manager.process_audio_input(balloon_info['game_id'], audio_data)
        print(f"Balão - Sopro {i+1}: Altura: {balloon_result['clown_height']:.1f}")
    
    # Mostrar status dos jogos
    print("\nStatus dos jogos:")
    boat_status = manager.get_game_status(boat_info['game_id'])
    balloon_status = manager.get_game_status(balloon_info['game_id'])
    
    print(f"Barco: {boat_status}")
    print(f"Balão: {balloon_status}")
    
    # Finalizar jogos
    manager.end_game(boat_info['game_id'])
    manager.end_game(balloon_info['game_id'])
    
    # Mostrar estatísticas do gerenciador
    manager_stats = manager.get_manager_stats()
    print(f"\nEstatísticas do gerenciador: {manager_stats}")

def demo_audio_processor():
    """Demonstra o processador de áudio"""
    print("\n🎵 === DEMONSTRAÇÃO DO PROCESSADOR DE ÁUDIO ===")
    
    # Criar processador
    processor = AudioProcessor()
    
    # Simular calibração com ruído ambiente
    print("Calibrando ruído ambiente...")
    noise_samples = []
    for i in range(3):
        noise_data = simulate_audio_data(intensity=0.1, duration=1.0)  # Ruído baixo
        noise_array = np.frombuffer(noise_data, dtype=np.int16).astype(np.float32)
        noise_samples.append(noise_array)
    
    processor.calibrate_background_noise(noise_samples)
    
    # Mostrar status da calibração
    calibration_status = processor.get_calibration_status()
    print(f"Status da calibração: {calibration_status}")
    
    # Testar detecção de sopros
    print("\nTestando detecção de sopros...")
    for intensity in [0.2, 0.5, 0.8]:
        audio_data = simulate_audio_data(intensity=intensity)
        blow_detected, blow_intensity, metadata = processor.detect_blow(audio_data)
        
        print(f"Intensidade simulada: {intensity:.1f} -> "
              f"Detectado: {blow_detected}, Intensidade: {blow_intensity:.3f}")

def main():
    """Função principal da demonstração"""
    print("🌬️ === DEMONSTRAÇÃO DO SISTEMA AETHERIA ===")
    print("Sistema de terapia respiratória desenvolvido para POO")
    print(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 60)
    
    try:
        # Executar demonstrações
        demo_boat_game()
        demo_balloon_game()
        demo_game_manager()
        demo_audio_processor()
        
        print("\n✅ === DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO ===")
        print("Todos os conceitos de POO foram demonstrados:")
        print("- Herança (BaseGame -> BoatGame, BalloonGame)")
        print("- Polimorfismo (métodos abstratos implementados)")
        print("- Encapsulamento (atributos privados com getters/setters)")
        print("- Singleton (GameManager)")
        print("- Factory Pattern (criação de jogos)")
        print("- Composição (AudioProcessor no GameManager)")
        
    except Exception as e:
        print(f"\n❌ Erro na demonstração: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
