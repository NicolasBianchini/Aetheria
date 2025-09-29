import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🌬️ Aetheria</Text>
                <Text style={styles.subtitle}>Terapia Respiratória Interativa</Text>
                <Text style={styles.description}>
                    Jogos divertidos para melhorar sua respiração!
                </Text>
            </View>

            <View style={styles.gamesContainer}>
                <TouchableOpacity
                    style={[styles.gameCard, styles.testCard]}
                    onPress={() => navigation.navigate('BreathTest')}
                >
                    <Text style={styles.gameEmoji}>🌬️</Text>
                    <Text style={styles.gameTitle}>Detecção de Sopro</Text>
                    <Text style={styles.gameDescription}>
                        Sistema avançado para detectar apenas sopros!
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gameCard}
                    onPress={() => navigation.navigate('MicTest')}
                >
                    <Text style={styles.gameEmoji}>🎤</Text>
                    <Text style={styles.gameTitle}>Teste de Microfone</Text>
                    <Text style={styles.gameDescription}>
                        Teste o microfone e veja como o áudio é processado!
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gameCard}
                    onPress={() => navigation.navigate('BoatGame')}
                >
                    <Text style={styles.gameEmoji}>🚤</Text>
                    <Text style={styles.gameTitle}>Barquinho</Text>
                    <Text style={styles.gameDescription}>
                        Assopre no microfone para fazer o barco navegar pelo mar!
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gameCard}
                    onPress={() => navigation.navigate('BalloonGame')}
                >
                    <Text style={styles.gameEmoji}>🎈</Text>
                    <Text style={styles.gameTitle}>Balão do Palhaço</Text>
                    <Text style={styles.gameDescription}>
                        Encha o balão com seu sopro e faça o palhaço subir!
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    💡 Dica: Mantenha o telefone próximo ao seu rosto e assopre suavemente
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#34495E',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    gamesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        marginVertical: 15,
        width: width - 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    testCard: {
        backgroundColor: '#E8F5E8',
        borderWidth: 2,
        borderColor: '#27AE60',
    },
    gameEmoji: {
        fontSize: 50,
        marginBottom: 15,
    },
    gameTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    gameDescription: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#95A5A6',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
