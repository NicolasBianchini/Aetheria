# 🔍 Teste de Conexão com Backend

## ✅ Status Atual

- **Backend rodando na porta 5001**: ✅ SIM
- **Backend respondendo**: ✅ SIM (health check OK)
- **CORS configurado**: ✅ SIM (permite todas as origens)

## 🔧 Como Testar a Conexão

### 1. **Testar do Terminal (Localhost)**

```bash
# Testar health check
curl http://localhost:5001/api/health

# Testar criar jogo
curl -X POST http://localhost:5001/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"game_type":"boat","player_name":"Teste"}'
```

### 2. **Problema: Expo/React Native não acessa localhost**

No React Native/Expo, `localhost` não funciona em:
- ✅ **iOS Simulator**: Funciona com `localhost`
- ❌ **Android Emulator**: Precisa usar `10.0.2.2`
- ❌ **Dispositivo Físico**: Precisa usar o IP da máquina na rede

### 3. **Soluções**

#### **Opção A: Android Emulator**
```javascript
// config/api.js já detecta automaticamente Android
// Usa: http://10.0.2.2:5001
```

#### **Opção B: Dispositivo Físico**
```bash
# Descobrir IP da máquina
ifconfig | grep "inet " | grep -v 127.0.0.1

# Exemplo: 192.168.1.100
# Configurar no app:
API_BASE_URL=http://192.168.1.100:5001
```

#### **Opção C: Configurar via Variável de Ambiente**

Crie um arquivo `.env` na raiz do projeto:
```bash
API_BASE_URL=http://10.0.2.2:5001  # Android Emulator
# ou
API_BASE_URL=http://192.168.1.100:5001  # Dispositivo físico
```

## 🧪 Teste no App React Native

Adicione este código temporário em qualquer tela para testar:

```javascript
import { buildApiUrl, apiRequest } from '../config/api';

// Testar conexão
const testConnection = async () => {
  try {
    console.log('🔍 Testando conexão com:', buildApiUrl('/api/health'));
    const response = await apiRequest(buildApiUrl('/api/health'));
    console.log('✅ Backend conectado!', response);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    console.error('URL tentada:', buildApiUrl('/api/health'));
    return false;
  }
};

// Chamar no useEffect ou botão
testConnection();
```

## 📱 URLs por Ambiente

| Ambiente | URL |
|----------|-----|
| **Localhost (desenvolvimento web)** | `http://localhost:5001` |
| **iOS Simulator** | `http://localhost:5001` |
| **Android Emulator** | `http://10.0.2.2:5001` |
| **Dispositivo Físico** | `http://[IP_DA_MAQUINA]:5001` |

## ⚠️ Problemas Comuns

### Erro: "Network request failed"
- **Causa**: Backend não está rodando OU URL incorreta
- **Solução**: Verificar se backend está rodando na porta 5001

### Erro: "HTTP 403 Forbidden"
- **Causa**: CORS bloqueando requisição
- **Solução**: Já configurado no backend para aceitar todas as origens

### Erro: "Connection refused"
- **Causa**: URL incorreta para o ambiente
- **Solução**: Usar `10.0.2.2` no Android ou IP da máquina no dispositivo físico

## 🔍 Verificar Configuração Atual

No console do React Native, você deve ver logs mostrando qual URL está sendo usada:

```javascript
// Em config/api.js, adicione temporariamente:
console.log('🌐 API Base URL:', API_BASE_URL);
```

## ✅ Próximos Passos

1. ✅ Verificar se backend está rodando
2. ✅ Testar conexão do terminal
3. ▶️ Testar no app React Native
4. ▶️ Ajustar URL se necessário

---

**Backend está pronto!** Agora só precisa garantir que o app está usando a URL correta para o seu ambiente.

