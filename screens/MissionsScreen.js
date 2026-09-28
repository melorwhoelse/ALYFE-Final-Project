import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../constants/colors';

const MISSIONS = [
    {
        id: 'm001',
        title: 'Emergency Preparedness Knowledge Check',
        season: 'General'
    },
    {
        id: 'm002',
        title: 'Power Outage Safety Check',
        season: '💡 Power Outage'
    }
];

export default function MissionsScreen({ navigation }) {

    const [completedIds, setCompletedIds] = useState([]);

    // Reload completed missions whenever this screen comes into focus
    // Ensures newly completed activities are immediately reflected here
    useFocusEffect(
        useCallback(() => {
            const loadCompleted = async () => {
                try {
                    const saved = await AsyncStorage.getItem('completed_missions');

                    if (saved) {
                        setCompletedIds(JSON.parse(saved))
                    } else {
                        setCompletedIds([]);
                    }
                } catch (e) {
                    console.log('Load completed error', e);
                }
            };

            loadCompleted();
        }, [])
    );


    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    Active Missions
                </Text>
                <Text style={styles.subtitle}>
                    Complete missions to restore Kip's health.
                </Text>

                {MISSIONS.map(mission => {

                    // Completed mission IDs are used to disable activities that have already awarded their rewards
                    const isDone = completedIds.includes(mission.id);

                    return (
                        <TouchableOpacity
                            key={mission.id}
                            onPress={() => {

                                // Open the activity associated with the selected mission.
                                if (mission.id === 'm002') {
                                    navigation.navigate('SpotHazard', {
                                        completedIds, setCompletedIds, missionId: mission.id
                                    });
                                } else {
                                    navigation.navigate('Flashcard', {
                                        completedIds, setCompletedIds, missionId: mission.id
                                    });
                                }
                            }}
                            disabled={isDone}
                            style={[styles.missionCard,
                            isDone && styles.completedMissionCard]}>

                            <Text style={styles.season}>
                                {mission.season}
                            </Text>
                            <Text style={styles.missionTitle}>
                                {mission.title}
                            </Text>
                            <Text style={styles.rewardText}>
                                {isDone
                                    ? '✅ Completed'
                                    : '🪙 Earn Kip Coins  ❤️ Restore HP'
                                }
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.offWhite
    },
    content: {
        padding: 20
    },
    title: {
        color: COLORS.navy,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6
    },
    subtitle: {
        color: COLORS.navy,
        opacity: 0.6,
        marginBottom: 20
    },
    missionCard: {
        backgroundColor: '#243555',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#334466'
    },
    completedMissionCard: {
        borderColor: '#27AE60'
    },
    season: {
        color: COLORS.darkRed,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4
    },
    missionTitle: {
        color: COLORS.offWhite,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6
    },
    rewardText: {
        color: '#F0C040'
    }
});