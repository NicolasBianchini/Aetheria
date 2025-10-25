from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

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

# Rotas de jogos
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
    app.run(debug=True, host='0.0.0.0', port=5000)