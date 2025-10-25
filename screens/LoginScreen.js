import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Wind } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [name, setName] = useState('');
    const { login, register, loading, error, clearError } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        clearError();
        const result = await login(email, password);
        
        if (result.success) {
            Alert.alert('Sucesso', 'Login realizado com sucesso!');
        } else {
            Alert.alert('Erro no Login', result.message);
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !name) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        clearError();
        const result = await register(email, password, { name });
        
        if (result.success) {
            Alert.alert('Sucesso', result.message);
            setIsRegisterMode(false);
            setName('');
        } else {
            Alert.alert('Erro no Registro', result.message);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            'Redefinir Senha',
            'Digite seu email para receber instruções de redefinição de senha',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Enviar',
                    onPress: () => {
                        // Implementar redefinição de senha
                        Alert.alert('Email enviado', 'Verifique sua caixa de entrada');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo and Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Wind size={32} color="#3498DB" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.title}>Aetheria</Text>
                    <Text style={styles.subtitle}>Terapia Respiratória Interativa</Text>
                </View>

                {/* Login/Register Form */}
                <View style={styles.form}>
                    {isRegisterMode && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Seu nome completo"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="seu@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Senha</Text>
                            {!isRegisterMode && (
                                <TouchableOpacity onPress={handleForgotPassword}>
                                    <Text style={styles.forgotPassword}>Esqueceu?</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={isRegisterMode ? handleRegister : handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading 
                                ? (isRegisterMode ? 'Criando conta...' : 'Entrando...') 
                                : (isRegisterMode ? 'Criar Conta' : 'Entrar')
                            }
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sign Up/Login Link */}
                <Text style={styles.signUpText}>
                    {isRegisterMode ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
                    <TouchableOpacity onPress={() => {
                        setIsRegisterMode(!isRegisterMode);
                        clearError();
                        setName('');
                    }}>
                        <Text style={styles.signUpLink}>
                            {isRegisterMode ? 'Fazer login' : 'Criar conta'}
                        </Text>
                    </TouchableOpacity>
                </Text>

                {/* Footer */}
                <Text style={styles.footerText}>
                    Jogos divertidos para melhorar sua respiração
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '300',
        letterSpacing: 0.5,
    },
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    forgotPassword: {
        fontSize: 12,
        color: '#3498DB',
        fontWeight: '400',
    },
    input: {
        height: 48,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    errorContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        textAlign: 'center',
    },
    loginButton: {
        height: 48,
        backgroundColor: '#3498DB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3498DB',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        letterSpacing: 0.5,
    },
    signUpText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 16,
    },
    signUpLink: {
        color: '#3498DB',
        fontWeight: '400',
    },
    footerText: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        fontWeight: '300',
    },
});
