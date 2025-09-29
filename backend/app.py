"""
API Flask para comunicação com o app Expo
Demonstra integração entre Python backend e React Native frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import logging
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.game_manager import GameManager, GameType
from services.audio_processor import AudioProcessor

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar aplicação Flask
app = Flask(__name__)
CORS(app)  # Permitir CORS para comunicação com o app Expo

# Instanciar gerenciador de jogos (Singleton)
game_manager = GameManager()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificação de saúde da API"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/games/create', methods=['POST'])
def create_game():
    """
    Cria um novo jogo
    
    Body:
        {
            "game_type": "boat" | "balloon",
            "player_name": "Nome do Jogador",
            "audio_info": {
                "sampleRate": 16000,
                "channels": 1,
                "format": "m4a",
                "size": 12345
            }
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'game_type' not in data:
            return jsonify({"error": "game_type é obrigatório"}), 400
        
        game_type_str = data['game_type']
        player_name = data.get('player_name', 'Jogador')
        audio_info = data.get('audio_info', {})
        
        # Converter string para enum
        try:
            game_type = GameType(game_type_str)
        except ValueError:
            return jsonify({"error": f"Tipo de jogo inválido: {game_type_str}"}), 400
        
        # Criar jogo
        game_info = game_manager.create_game(game_type, player_name)
        
        # Adicionar informações de áudio ao jogo
        if audio_info:
            game_info['audio_info'] = audio_info
        
        logger.info(f"Jogo criado: {game_info['game_id']} com info de áudio: {audio_info}")
        
        return jsonify({
            "success": True,
            "game": game_info
        }), 201
        
    except Exception as e:
        logger.error(f"Erro ao criar jogo: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/games/<game_id>/start', methods=['POST'])
def start_game(game_id):
    """Inicia um jogo específico"""
    try:
        result = game_manager.start_game(game_id)
        
        logger.info(f"Jogo iniciado: {game_id}")
        
        return jsonify({
            "success": True,
            "game": result
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.error(f"Erro ao iniciar jogo: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/games/<game_id>/end', methods=['POST'])
def end_game(game_id):
    """Finaliza um jogo específico"""
    try:
        result = game_manager.end_game(game_id)
        
        logger.info(f"Jogo finalizado: {game_id}")
        
        return jsonify({
            "success": True,
            "game": result
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.error(f"Erro ao finalizar jogo: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/games/<game_id>/audio', methods=['POST'])
def process_audio(game_id):
    """
    Processa entrada de áudio para um jogo
    
    Body:
        {
            "audio_data": "base64_encoded_audio_data",
            "audio_info": {
                "sampleRate": 16000,
                "channels": 1,
                "format": "m4a",
                "size": 12345,
                "timestamp": "2025-09-22T20:00:00.000Z"
            }
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'audio_data' not in data:
            return jsonify({"error": "audio_data é obrigatório"}), 400
        
        # Decodificar dados de áudio base64
        try:
            audio_bytes = base64.b64decode(data['audio_data'])
        except Exception as e:
            return jsonify({"error": "Dados de áudio inválidos"}), 400
        
        # Obter informações do áudio
        audio_info = data.get('audio_info', {})
        
        # Log das informações de áudio para debug
        logger.info(f"Processando áudio para jogo {game_id}: {audio_info}")
        
        # Processar áudio
        result = game_manager.process_audio_input(game_id, audio_bytes)
        
        # Adicionar informações de áudio ao resultado
        result['audio_info'] = audio_info
        result['processing_timestamp'] = datetime.now().isoformat()
        
        return jsonify({
            "success": True,
            "game_data": result
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.error(f"Erro ao processar áudio: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/games/<game_id>/status', methods=['GET'])
def get_game_status(game_id):
    """Retorna status de um jogo específico"""
    try:
        result = game_manager.get_game_status(game_id)
        
        return jsonify({
            "success": True,
            "game": result
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.error(f"Erro ao obter status do jogo: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/games', methods=['GET'])
def get_all_games():
    """Retorna lista de todos os jogos"""
    try:
        games = game_manager.get_all_games()
        
        return jsonify({
            "success": True,
            "games": games,
            "count": len(games)
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter jogos: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/audio/calibrate', methods=['POST'])
def calibrate_audio():
    """
    Calibra o sistema de áudio com amostras de ruído ambiente
    
    Body:
        {
            "audio_samples": ["base64_audio1", "base64_audio2", ...]
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'audio_samples' not in data:
            return jsonify({"error": "audio_samples é obrigatório"}), 400
        
        # Decodificar amostras de áudio
        audio_samples = []
        for sample_b64 in data['audio_samples']:
            try:
                audio_bytes = base64.b64decode(sample_b64)
                audio_samples.append(audio_bytes)
            except Exception as e:
                return jsonify({"error": "Amostra de áudio inválida"}), 400
        
        # Calibrar sistema
        result = game_manager.calibrate_audio(audio_samples)
        
        logger.info("Sistema de áudio calibrado")
        
        return jsonify({
            "success": True,
            "calibration": result
        }), 200
        
    except Exception as e:
        logger.error(f"Erro na calibração: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Retorna estatísticas do sistema"""
    try:
        stats = game_manager.get_manager_stats()
        
        return jsonify({
            "success": True,
            "stats": stats
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handler para rotas não encontradas"""
    return jsonify({"error": "Endpoint não encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handler para erros internos"""
    return jsonify({"error": "Erro interno do servidor"}), 500

if __name__ == '__main__':
    logger.info("Iniciando servidor Aetheria API...")
    app.run(debug=True, host='0.0.0.0', port=3333)
