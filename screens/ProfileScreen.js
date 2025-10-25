import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { ArrowLeft, Calendar, Award, TrendingUp, Wind, User } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import FirestoreService from '../services/FirestoreService';

export default function ProfileScreen({ navigation }) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Carregar dados do usuário
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setLoading(false);
        }
    }, [user]);

    const stats = [
        { label: 'Total de Sessões', value: user?.totalSessions?.toString() || '0', icon: Calendar, color: '#3B82F6' },
        { label: 'Tempo Total', value: `${user?.totalTime || 0} min`, icon: TrendingUp, color: '#10B981' },
        { label: 'Pontos Totais', value: user?.totalScore?.toString() || '0', icon: Award, color: '#F59E0B' },
        { label: 'Sequência', value: `${user?.streakDays || 0} dias`, icon: Wind, color: '#8B5CF6' },
    ];

    const recentActivity = [
        { game: 'Barquinho', date: 'Hoje', score: 100, duration: '5 min' },
        { game: 'Balão do Palhaço', date: 'Hoje', score: 150, duration: '6 min' },
        { game: 'Barquinho', date: 'Ontem', score: 100, duration: '4 min' },
        { game: 'Balão do Palhaço', date: 'Ontem', score: 100, duration: '5 min' },
    ];

    const handleSave = async () => {
        try {
            if (!user?.id) {
                Alert.alert('Erro', 'Usuário não encontrado');
                return;
            }

            await FirestoreService.updateUser(user.id, {
                name: name,
                email: email,
            });

            setIsEditing(false);
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o perfil');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <User size={32} color="#3498DB" />
                        </View>
                        <Text style={styles.profileName}>{name}</Text>
                        <Text style={styles.profileEmail}>{email}</Text>
                    </View>

                    {/* Profile Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                editable={isEditing}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                editable={isEditing}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.buttonRow}>
                            {!isEditing ? (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setIsEditing(true)}
                                >
                                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.saveButtonText}>Salvar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setIsEditing(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <Text style={styles.statValue}>{stat.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Recent Activity */}
                <View style={styles.activityCard}>
                    <Text style={styles.sectionTitle}>Atividade Recente</Text>
                    <View style={styles.activityList}>
                        {recentActivity.map((activity, index) => (
                            <View key={index} style={styles.activityItem}>
                                <View style={styles.activityIcon}>
                                    <Text style={styles.activityEmoji}>
                                        {activity.game === 'Barquinho' ? '⛵' : '🎈'}
                                    </Text>
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityGame}>{activity.game}</Text>
                                    <Text style={styles.activityDate}>{activity.date}</Text>
                                </View>
                                <View style={styles.activityScore}>
                                    <Text style={styles.activityScoreValue}>{activity.score} pts</Text>
                                    <Text style={styles.activityDuration}>{activity.duration}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Achievements */}
                <View style={styles.achievementsCard}>
                    <Text style={styles.sectionTitle}>Conquistas</Text>
                    <View style={styles.achievementsGrid}>
                        <View style={styles.achievementItem}>
                            <Text style={styles.achievementEmoji}>🏆</Text>
                            <Text style={styles.achievementText}>Primeira Vitória</Text>
                        </View>
                        <View style={styles.achievementItem}>
                            <Text style={styles.achievementEmoji}>🌟</Text>
                            <Text style={styles.achievementText}>7 Dias Seguidos</Text>
                        </View>
                        <View style={styles.achievementItem}>
                            <Text style={styles.achievementEmoji}>💯</Text>
                            <Text style={styles.achievementText}>100 Pontos</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginTop: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#64748B',
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
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
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    editButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#3498DB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    saveButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#3498DB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    cancelButton: {
        flex: 1,
        height: 48,
        backgroundColor: 'transparent',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '300',
        color: '#1E293B',
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    activityList: {
        gap: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        gap: 12,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EBF8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityEmoji: {
        fontSize: 20,
    },
    activityInfo: {
        flex: 1,
    },
    activityGame: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: 2,
    },
    activityDate: {
        fontSize: 12,
        color: '#64748B',
    },
    activityScore: {
        alignItems: 'flex-end',
    },
    activityScoreValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: 2,
    },
    activityDuration: {
        fontSize: 12,
        color: '#64748B',
    },
    achievementsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    achievementsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    achievementItem: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    achievementEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    achievementText: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
    },
});
