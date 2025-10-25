#!/bin/bash

# Script para inicializar o projeto Aetheria
echo "🌬️ Iniciando Aetheria - Terapia Respiratória Interativa"
echo "=================================================="

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Por favor, instale o Python 3.8 ou superior."
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18 ou superior."
    exit 1
fi

# Verificar se o Expo CLI está instalado
if ! command -v expo &> /dev/null; then
    echo "📦 Instalando Expo CLI..."
    npm install -g @expo/cli
fi

echo "🔧 Configurando o backend..."
cd backend

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual Python..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔌 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
pip install -r requirements.txt

# Iniciar backend em background
echo "🚀 Iniciando backend Flask..."
python app.py &
BACKEND_PID=$!

cd ..

echo "📦 Instalando dependências do frontend..."
npm install --legacy-peer-deps

echo "🚀 Iniciando aplicativo Expo..."
echo "=================================================="
echo "✅ Backend rodando em: http://localhost:5000"
echo "✅ Frontend será iniciado pelo Expo"
echo "=================================================="
echo ""
echo "📱 Para testar no dispositivo:"
echo "1. Instale o app Expo Go no seu celular"
echo "2. Escaneie o QR code que aparecerá"
echo "3. Ou pressione 'w' para abrir no navegador"
echo ""
echo "🛑 Para parar o servidor: Ctrl+C"
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando servidores..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar Expo
npm start
