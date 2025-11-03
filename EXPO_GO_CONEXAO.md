# 📱 Conexão do Expo Go com Backend Python

## ⚠️ Problema: "Network request failed" no Expo Go

Quando você usa o **Expo Go em um dispositivo físico**, o app não consegue acessar `localhost` porque:
- O dispositivo físico está em uma rede diferente
- Precisa usar o **IP da máquina** na rede local

## ✅ Solução Aplicada

1. **Atualizado `.env`**: `API_BASE_URL=http://172.20.10.7:5001`
2. **Atualizado `config/api.js`**: Detecta automaticamente dispositivo físico e usa IP da máquina

## 🔧 Verificar Backend

### 1. Verificar se backend está rodando

```bash
cd backend
source venv/bin/activate
python3 app.py
```

Você deve ver:
```
 * Running on http://0.0.0.0:5001
```

### 2. Verificar se está acessível na rede

```bash
# Testar do mesmo computador
curl http://172.20.10.7:5001/api/health

# Se não funcionar, pode ser firewall
```

### 3. Verificar Firewall (macOS)

Se o backend não estiver acessível no IP da rede:

```bash
# Verificar firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Se estiver ativo, pode precisar permitir Python
# Ou temporariamente desabilitar para teste:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

## 📱 Testar no Expo Go

1. **Reinicie o Expo**:
   ```bash
   npm start
   # ou
   npx expo start --clear
   ```

2. **Verifique os logs**:
   Você deve ver:
   ```
   🌐 API Base URL configurada: http://172.20.10.7:5001
   ```

3. **Teste o jogo**: Deve conectar ao backend agora

## 🔍 Troubleshooting

### Erro: "Network request failed"

**Causas possíveis:**
1. Backend não está rodando
2. Firewall bloqueando conexões
3. IP da máquina mudou
4. Backend não está escutando em `0.0.0.0`

**Soluções:**
1. Verificar se backend está rodando: `curl http://localhost:5001/api/health`
2. Verificar IP da máquina: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. Atualizar `.env` com o IP correto
4. Verificar firewall

### Erro: "Connection refused"

**Causa**: Backend não está escutando em `0.0.0.0`

**Solução**: Verificar `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # ✅ Correto
# NÃO usar:
app.run(debug=True, host='127.0.0.1', port=5001)  # ❌ Só funciona localmente
```

## 📝 IP da Máquina

Seu IP atual: `172.20.10.7`

Se o IP mudar (ex: você mudou de rede Wi-Fi), atualize:
1. `.env`: `API_BASE_URL=http://[NOVO_IP]:5001`
2. `config/api.js`: Linha 44, 50, 58

## ✅ Próximos Passos

1. ✅ Verificar se backend está rodando
2. ✅ Verificar se está acessível no IP da rede
3. ✅ Reiniciar Expo Go
4. ✅ Testar conexão

---

**Backend configurado para aceitar conexões de qualquer IP (`0.0.0.0`)!**

