import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../constants/colors';

import { applyHealthChange, calculateHealthDecay } from '../utility/gameUtility';

// Select seasonal banner displayed on Home based on the current month
const getSeason = () => {
    const month = new Date().getMonth(); // 0 = Jan, 11 = Dec

    if (month >= 5 && month <= 8) {
        return {
            name: 'Haze Season',
            tip: 'Check PSI before heading outdoors.'
        };
    }

    if (month >= 10 || month <= 1) {
        return {
            name: 'Monsoon Season',
            tip: 'Keep emergency supplies dry and elevated.'
        };
    }

    return {
        name: 'Preparedness Season',
        tip: 'A good time to review your emergency kit.'
    };
};

export default function HomeScreen() {
    const [health, setHealth] = useState(40);
    const [kipCoins, setKipCoins] = useState(0);

    // Development helper for restoring the game to its starting state
    const resetGameData = async () => {
        await AsyncStorage.setItem('kip_health', '40');
        await AsyncStorage.setItem('kip_coins', '0');
        await AsyncStorage.removeItem('completed_missions');
        await AsyncStorage.setItem('health_updated_at', Date.now().toString());

        setHealth(40);
        setKipCoins(0);
    };

    // Load health and apply daily decay when Home is in focus again
    // Ensures changes made from Missions or Shop are reflected immediately
    useFocusEffect(
        useCallback(() => {
            const loadAndDecay = async () => {
                const savedHealth = await AsyncStorage.getItem('kip_health');
                const savedCoins = await AsyncStorage.getItem('kip_coins');
                const healthUpdatedAt = await AsyncStorage.getItem('health_updated_at');
                let currentHealth = savedHealth ? parseFloat(savedHealth) : 40;

                // Apply health decay according to the number of calendar days elapsed
                if (healthUpdatedAt) {
                    const decay = calculateHealthDecay(healthUpdatedAt);
                    currentHealth = applyHealthChange(currentHealth, -decay);
                }

                setHealth(Math.round(currentHealth));

                if (savedCoins) setKipCoins(parseInt(savedCoins));

                // Store the latest health state and use the current time as the reference point for the next decay calculation
                await AsyncStorage.setItem('kip_health', currentHealth.toString());
                await AsyncStorage.setItem('health_updated_at', Date.now().toString());
            };
            loadAndDecay();
        }, [])
    );

    // Little Kip's expression changes according to the current health range
    const getKipMood = (health) => {
        if (health >= 70) return '😊';
        if (health >= 40) return '😐';
        if (health >= 15) return '😟';
        return '😵';
    };

    const season = getSeason();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>

                {/* Season Banner */}
                <View style={styles.seasonBanner}>
                    <Text style={styles.seasonName}>
                        {season.name}
                    </Text>

                    <Text style={styles.seasonTip}>
                        {season.tip}
                    </Text>
                </View>

                {/* Avatar */}
                <View style={styles.avatarContainer}>

                    <Text style={styles.avatar}>{getKipMood(health)}</Text>
                    <Text style={styles.kipName}>
                        Little Kip
                    </Text>
                </View>

                {/* Health Bar */}
                <Text style={styles.healthText}>
                    HP: {health} / 100
                </Text>
                <View style={styles.healthBar}>
                    <View style={[
                        styles.healthFill,
                        { width: `${health}%` }
                    ]} />
                </View>

                {/* Coins */}
                <Text style={styles.coinText}>
                    🪙 Kip Coins: {kipCoins}
                </Text>

                {/* <TouchableOpacity onPress={resetGameData}>
                    <Text style={styles.resetText}>
                        Reset Game Data (dev only)
                    </Text>
                </TouchableOpacity> */}

                <Text style={styles.gameDescription}>
                    Keep Little Kip healthy by completing preparedness activities.
                    {'\n'}
                    Earn Kip Coins along the way and use them for care when you need them.
                </Text>


            </View>
        </ScrollView>
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
    seasonBanner: {
        backgroundColor: COLORS.darkRed,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20
    },
    seasonName: {
        color: COLORS.offWhite,
        fontWeight: 'bold',
        fontSize: 16
    },
    seasonTip: {
        color: COLORS.offWhite,
        opacity: 0.85,
        fontSize: 13,
        marginTop: 4
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20
    },
    avatar: {
        fontSize: 80
    },
    kipName: {
        color: COLORS.navy,
        fontSize: 24,
        fontWeight: 'bold'
    },
    healthText: {
        color: COLORS.navy,
        marginBottom: 6
    },
    healthBar: {
        backgroundColor: '#333',
        height: 16,
        borderRadius: 8,
        overflow: 'hidden'
    },
    healthFill: {
        backgroundColor: COLORS.mustard,
        height: '100%',
        borderRadius: 8
    },
    coinText: {
        color: COLORS.navy,
        fontSize: 18,
        marginTop: 20
    },
    resetText: {
        color: COLORS.darkRed,
        marginTop: 20,
        textAlign: 'center'
    },
    gameDescription: {
        color: COLORS.navy,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20
    }
});