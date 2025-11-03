# 🚀 Guia de Instalação e Execução do Backend

## ✅ Instalação Concluída!

As dependências foram instaladas com sucesso no ambiente virtual.

---

## 📦 Por que demora?

A instalação demora porque:

1. **numpy** (~5 MB) - Biblioteca de computação numérica
2. **scipy** (~21 MB) - Biblioteca científica (muito grande!)
   - Filtros de sinal
   - Processamento de áudio
   - Análise de frequência

**Tempo estimado:** 2-5 minutos (depende da conexão)

---

## 🎯 Como Executar o Backend

### **Opção 1: Usando o Script (Recomendado)**

```bash
cd backend
./start_backend.sh
```

### **Opção 2: Manualmente**

```bash
cd backend
source venv/bin/activate  # Ativar ambiente virtual
python3 app.py
```

### **Opção 3: Em um terminal separado**

```bash
cd backend
source venv/bin/activate
python3 app.py
```

---

## ⚠️ Importante

**SEMPRE ative o ambiente virtual antes de executar!**

Se você executar `python3 app.py` sem ativar o venv, vai dar erro:
```
ModuleNotFoundError: No module named 'flask'
```

**Solução:** Sempre use `source venv/bin/activate` primeiro!

---

## ✅ Verificar se está funcionando

Após iniciar o backend, você deve ver:

```
 * Running on http://127.0.0.1:5000
 * Running on http://0.0.0.0:5000
```

Teste acessando: `http://localhost:5000/api/health`

---

## 📝 Dependências Instaladas

- ✅ Flask 2.3.3
- ✅ Flask-CORS 4.0.0
- ✅ numpy 2.3.4
- ✅ scipy 1.16.3
- ✅ Werkzeug 2.3.7
- ✅ python-dotenv 1.0.0

---

## 🔧 Troubleshooting

### Erro: "ModuleNotFoundError: No module named 'flask'"

**Causa:** Ambiente virtual não está ativado

**Solução:**
```bash
cd backend
source venv/bin/activate
python3 app.py
```

### Erro: "Port 5000 already in use"

**Causa:** Outro processo está usando a porta 5000

**Solução:**
```bash
# Encontrar processo na porta 5000
lsof -ti:5000

# Matar processo (substitua PID pelo número retornado)
kill -9 PID
```

---

## 🎮 Próximos Passos

1. ✅ Backend instalado
2. ✅ Dependências instaladas
3. ▶️ Iniciar backend: `./start_backend.sh`
4. ▶️ Testar no app React Native

---

**Pronto para usar!** 🚀

