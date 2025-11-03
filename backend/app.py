from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import base64
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)

# Importar GameManager
from services.game_manager import GameManager, GameType

app = Flask(__name__)
# CORS configurado para aceitar requisições do React Native
# React Native não usa localhost, então permitimos todas as origens
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Instanciar GameManager (Singleton)
game_manager = GameManager()

# Configuração do banco de dados simples (JSON)
DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'users': {},
        'sessions': [],
        'scores': []
    }

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Rotas de autenticação
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    db = load_data()
    
    # Simulação de autenticação
    if email and password:
        user_id = email.split('@')[0]  # Usar parte do email como ID
        
        if user_id not in db['users']:
            # Criar novo usuário
            db['users'][user_id] = {
                'id': user_id,
                'email': email,
                'name': email.split('@')[0].title(),
                'created_at': datetime.now().isoformat(),
                'total_sessions': 0,
                'total_time': 0,
                'total_score': 0,
                'streak_days': 0
            }
        
        save_data(db)
        
        return jsonify({
            'success': True,
            'user': db['users'][user_id],
            'token': f'token_{user_id}_{datetime.now().timestamp()}'
        })
    
    return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso'})

# Rotas de perfil
@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
    
    db = load_data()
    if user_id not in db['users']:
        return jsonify({'success': False, 'message': 'Usuário não encontrado'}), 404
    
    return jsonify({
        'success': True,
        'user': db['users'][user_id]
    })

@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
    
    data = request.get_json()
    db = load_data()
    
    if user_id not in db['users']:
        return jsonify({'success': False, 'message': 'Usuário não encontrado'}), 404
    
    # Atualizar dados do usuário
    if 'name' in data:
        db['users'][user_id]['name'] = data['name']
    if 'email' in data:
        db['users'][user_id]['email'] = data['email']
    
    save_data(db)
    
    return jsonify({
        'success': True,
        'user': db['users'][user_id]
    })

# Rotas de jogos - CONTROLE COMPLETO NO BACKEND PYTHON
@app.route('/api/games/create', methods=['POST'])
def create_game():
    """Cria um novo jogo usando GameManager (Factory Pattern)"""
    try:
        data = request.get_json()
        game_type_str = data.get('game_type', 'boat').lower()
        player_name = data.get('player_name', 'Jogador')
        
        # Converter string para GameType enum
        if game_type_str == 'boat' or game_type_str == 'barquinho':
            game_type = GameType.BOAT
        elif game_type_str == 'balloon' or game_type_str == 'balao' or game_type_str == 'balão':
            game_type = GameType.BALLOON
        else:
            return jsonify({'success': False, 'message': f'Tipo de jogo inválido: {game_type_str}'}), 400
        
        # Criar jogo usando GameManager
        game_info = game_manager.create_game(game_type, player_name)
        
        return jsonify({
            'success': True,
            'game': game_info
        })
    except Exception as e:
        app.logger.error(f'Erro ao criar jogo: {str(e)}')
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/games/<game_id>/start', methods=['POST'])
def start_game(game_id):
    """Inicia um jogo"""
    try:
        result = game_manager.start_game(game_id)
        return jsonify({
            'success': True,
            'game': result
        })
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        app.logger.error(f'Erro ao iniciar jogo: {str(e)}')
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/games/<game_id>/audio', methods=['POST'])
def process_audio(game_id):
    """Processa áudio e retorna estado do jogo - LÓGICA DO JOGO AQUI"""
    try:
        data = request.get_json()
        
        # Opção 1: Receber dados de áudio brutos (base64)
        audio_data_b64 = data.get('audio_data', '')
        
        # Opção 2: Receber intensidade/metering do frontend (mais simples)
        audio_intensity = data.get('audio_intensity', None)
        audio_metering_db = data.get('audio_metering_db', None)
        
        if audio_data_b64:
            # Se temos dados brutos, decodificar e processar
            try:
                audio_bytes = base64.b64decode(audio_data_b64)
                # Processar áudio usando GameManager (que usa as classes Python)
                game_data = game_manager.process_audio_input(game_id, audio_bytes)
            except Exception as e:
                return jsonify({'success': False, 'message': f'Erro ao decodificar áudio: {str(e)}'}), 400
        elif audio_intensity is not None or audio_metering_db is not None:
            # Se temos intensidade/metering, usar diretamente (NÃO gerar áudio aleatório)
            # Converter para intensidade 0-1
            if audio_intensity is not None:
                intensity = max(0.0, min(1.0, float(audio_intensity)))
            else:
                # Converter dB para intensidade (0-1)
                # dB típico: -60 (silêncio) a -2 (sopro forte)
                intensity = max(0.0, min(1.0, (float(audio_metering_db) + 60) / 58))
            
            # USAR INTENSIDADE DIRETAMENTE - não gerar áudio aleatório
            # Isso evita comportamento aleatório e usa os dados reais do microfone
            game_data = game_manager.process_audio_intensity(game_id, intensity, audio_metering_db)
        else:
            return jsonify({'success': False, 'message': 'Dados de áudio não fornecidos'}), 400
        
        return jsonify({
            'success': True,
            'game_state': game_data
        })
    except ValueError as e:
        # Jogo não encontrado - pode ter expirado ou backend foi reiniciado
        app.logger.warning(f'Jogo não encontrado: {game_id} - {str(e)}')
        # Listar jogos disponíveis para debug
        available_games = list(game_manager._games.keys()) if hasattr(game_manager, '_games') else []
        app.logger.info(f'Jogos disponíveis: {available_games}')
        return jsonify({
            'success': False, 
            'message': f'Jogo não encontrado: {game_id}. Jogo pode ter expirado ou backend foi reiniciado.',
            'available_games': available_games,
            'hint': 'Crie um novo jogo usando POST /api/games/create'
        }), 404
    except Exception as e:
        app.logger.error(f'Erro ao processar áudio para jogo {game_id}: {str(e)}', exc_info=True)
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/games/<game_id>/status', methods=['GET'])
def get_game_status(game_id):
    """Retorna status atual do jogo"""
    try:
        status = game_manager.get_game_status(game_id)
        return jsonify({
            'success': True,
            'status': status
        })
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        app.logger.error(f'Erro ao obter status: {str(e)}')
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/games/<game_id>/end', methods=['POST'])
def end_game(game_id):
    """Finaliza um jogo"""
    try:
        result = game_manager.end_game(game_id)
        return jsonify({
            'success': True,
            'game': result
        })
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 404
    except Exception as e:
        app.logger.error(f'Erro ao finalizar jogo: {str(e)}')
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/games', methods=['GET'])
def get_all_games():
    """Retorna lista de todos os jogos"""
    try:
        games = game_manager.get_all_games()
        return jsonify({
            'success': True,
            'games': games
        })
    except Exception as e:
        app.logger.error(f'Erro ao listar jogos: {str(e)}')
        return jsonify({'success': False, 'message': str(e)}), 500

# Rotas antigas mantidas para compatibilidade
@app.route('/api/games/session', methods=['POST'])
def start_session():
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
    
    data = request.get_json()
    game_type = data.get('game_type')  # 'boat' ou 'balloon'
    
    session_id = f'session_{user_id}_{datetime.now().timestamp()}'
    
    db = load_data()
    session = {
        'id': session_id,
        'user_id': user_id,
        'game_type': game_type,
        'started_at': datetime.now().isoformat(),
        'score': 0,
        'duration': 0,
        'completed': False
    }
    
    db['sessions'].append(session)
    save_data(db)
    
    return jsonify({
        'success': True,
        'session': session
    })

@app.route('/api/games/session/<session_id>/end', methods=['POST'])
def end_session(session_id):
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
    
    data = request.get_json()
    score = data.get('score', 0)
    duration = data.get('duration', 0)
    completed = data.get('completed', False)
    
    db = load_data()
    
    # Encontrar e atualizar a sessão
    for session in db['sessions']:
        if session['id'] == session_id and session['user_id'] == user_id:
            session['ended_at'] = datetime.now().isoformat()
            session['score'] = score
            session['duration'] = duration
            session['completed'] = completed
            
            # Atualizar estatísticas do usuário
            if user_id in db['users']:
                db['users'][user_id]['total_sessions'] += 1
                db['users'][user_id]['total_time'] += duration
                db['users'][user_id]['total_score'] += score
                
                if completed:
                    db['users'][user_id]['streak_days'] += 1
            
            break
    
    save_data(db)
    
    return jsonify({
        'success': True,
        'message': 'Sessão finalizada com sucesso'
    })

# Rotas de estatísticas
@app.route('/api/stats/recent', methods=['GET'])
def get_recent_stats():
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
    
    db = load_data()
    
    # Buscar sessões recentes do usuário
    user_sessions = [s for s in db['sessions'] if s['user_id'] == user_id]
    user_sessions.sort(key=lambda x: x.get('ended_at', x['started_at']), reverse=True)
    
    recent_sessions = user_sessions[:10]  # Últimas 10 sessões
    
    return jsonify({
        'success': True,
        'sessions': recent_sessions
    })

@app.route('/api/stats/summary', methods=['GET'])
def get_stats_summary():
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return jsonify({'success': False, 'message': 'Usuário não autenticado'}), 401
    
    db = load_data()
    
    if user_id not in db['users']:
        return jsonify({'success': False, 'message': 'Usuário não encontrado'}), 404
    
    user = db['users'][user_id]
    
    return jsonify({
        'success': True,
        'stats': {
            'total_sessions': user['total_sessions'],
            'total_time': user['total_time'],
            'total_score': user['total_score'],
            'streak_days': user['streak_days'],
            'average_score': user['total_score'] / max(user['total_sessions'], 1),
            'average_duration': user['total_time'] / max(user['total_sessions'], 1)
        }
    })

# Rota de saúde
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

if __name__ == '__main__':
    # Usar porta 5001 para evitar conflito com AirPlay Receiver no macOS
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)