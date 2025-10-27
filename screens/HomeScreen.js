import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    Modal,
} from 'react-native';
import { Sailboat, PartyPopper, Menu, X, User, LogOut, Users, Wind } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export default function HomeScreen() {
    const { logout } = useAuth();
    const navigation = useNavigation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Sair', 
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuClose = () => {
        setIsMenuOpen(false);
    };

    const handleProfile = () => {
        setIsMenuOpen(false);
        navigation.navigate('Profile');
    };

    const handlePatients = () => {
        console.log('🏥 Navegando para área do médico...');
        setIsMenuOpen(false);
        navigation.navigate('Patients');
    };

    const handleGamePress = (game) => {
        // Navegar para tela de seleção de paciente
        navigation.navigate('SelectPatient', { game });
    };

    const games = [
        {
            id: "barquinho",
            title: "Barquinho",
            description: "Assopre no microfone para fazer o barco navegar pelo mar!",
            icon: Sailboat,
            color: "from-blue-500/20 to-cyan-500/20",
            iconColor: "text-blue-600",
        },
        {
            id: "balao",
            title: "Balão do Palhaço",
            description: "Encha o balão com seu sopro e faça o palhaço subir!",
            icon: PartyPopper,
            color: "from-red-500/20 to-pink-500/20",
            iconColor: "text-red-600",
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <Wind size={20} color="#3498DB" strokeWidth={1.5} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Aetheria</Text>
                        <Text style={styles.headerSubtitle}>Terapia Respiratória</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleMenuToggle}
                    >
                        <Menu size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>Bem-vindo de volta!</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Escolha um jogo para praticar seus exercícios respiratórios
                    </Text>
                </View>

                {/* Games Grid */}
                <View style={styles.gamesGrid}>
                    {games.map((game) => (
                        <TouchableOpacity
                            key={game.id}
                            style={[styles.gameCard, { backgroundColor: '#fff' }]}
                            onPress={() => handleGamePress(game)}
                        >
                            <View style={styles.gameIconContainer}>
                                <game.icon size={40} color={game.iconColor.includes('blue') ? '#3B82F6' : '#EF4444'} strokeWidth={1.5} />
                            </View>
                            <View style={styles.gameContent}>
                                <Text style={styles.gameTitle}>{game.title}</Text>
                                <Text style={styles.gameDescription}>{game.description}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={() => handleGamePress(game)}
                            >
                                <Text style={styles.playButtonText}>Jogar Agora</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Menu Hambúrguer Modal */}
            <Modal
                visible={isMenuOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={handleMenuClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.menuContainer}>
                        {/* Header do Menu */}
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>Menu</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleMenuClose}
                            >
                                <X size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Opções do Menu */}
                        <View style={styles.menuOptions}>
                            <TouchableOpacity
                                style={styles.menuOption}
                                onPress={handleProfile}
                            >
                                <View style={styles.menuOptionIcon}>
                                    <User size={24} color="#3498DB" />
                                </View>
                                <View style={styles.menuOptionContent}>
                                    <Text style={styles.menuOptionTitle}>Perfil</Text>
                                    <Text style={styles.menuOptionDescription}>Ver e editar seu perfil</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuOption}
                                onPress={handlePatients}
                            >
                                <View style={styles.menuOptionIcon}>
                                    <Users size={24} color="#10B981" />
                                </View>
                                <View style={styles.menuOptionContent}>
                                    <Text style={styles.menuOptionTitle}>Área do Médico</Text>
                                    <Text style={styles.menuOptionDescription}>Gerenciar pacientes</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuOption}
                                onPress={handleLogout}
                            >
                                <View style={styles.menuOptionIcon}>
                                    <LogOut size={24} color="#EF4444" />
                                </View>
                                <View style={styles.menuOptionContent}>
                                    <Text style={styles.menuOptionTitle}>Sair</Text>
                                    <Text style={styles.menuOptionDescription}>Fazer logout da conta</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    welcomeSection: {
        marginTop: 32,
        marginBottom: 32,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    gamesGrid: {
        gap: 24,
        marginBottom: 48,
    },
    gameCard: {
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
    },
    gameIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    gameContent: {
        alignItems: 'center',
        marginBottom: 16,
    },
    gameTitle: {
        fontSize: 24,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    gameDescription: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },
    playButton: {
        width: '100%',
        height: 48,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
    },
    doctorSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 16,
    },
    doctorCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    doctorCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    doctorIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    doctorTextContainer: {
        flex: 1,
    },
    doctorCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    doctorCardDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    doctorArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doctorArrowText: {
        fontSize: 18,
        color: '#3498DB',
        fontWeight: '600',
    },
    // Menu Hambúrguer Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34, // Safe area para iPhone
        maxHeight: '70%',
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuOptions: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F8FAFC',
    },
    menuOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuOptionContent: {
        flex: 1,
    },
    menuOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    menuOptionDescription: {
        fontSize: 14,
        color: '#64748B',
    },
});
