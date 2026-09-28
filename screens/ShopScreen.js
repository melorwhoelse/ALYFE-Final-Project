import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import COLORS from '../constants/colors';
import { SHOP_ITEMS } from '../data/shopItems'
import { purchaseShopItem } from '../utility/gameUtility';

export default function ShopScreen() {
    const [health, setHealth] = useState(40);
    const [kipCoins, setKipCoins] = useState(0);
    const [message, setMessage] = useState('');

    // Reload Kip's current state whenever the Shop comes into focus
    useFocusEffect(
        useCallback(() => {
            const loadGameState = async () => {
                const savedHealth = await AsyncStorage.getItem('kip_health');
                const savedCoins = await AsyncStorage.getItem('kip_coins');

                const parsedHealth = parseFloat(savedHealth);
                const parsedCoins = parseInt(savedCoins);

                // Fall back to the starting state if no valid saved values exist
                setHealth(Number.isFinite(parsedHealth) ? parsedHealth : 40);
                setKipCoins(Number.isFinite(parsedCoins) ? parsedCoins : 0);
                setMessage('');
            };

            loadGameState();
        }, [])
    );

    const handlePurchase = async (item) => {

        // Calculate whether the purchase can be made and the resulting game state
        const result = purchaseShopItem(kipCoins, health, item);

        if (!result.success) {
            setMessage(`Not enough Kip Coins for ${item.name}.`);
            return;
        }

        // Persist the new health, coin balance and health update time
        await AsyncStorage.setItem('kip_health', result.health.toString());
        await AsyncStorage.setItem('kip_coins', result.coins.toString());
        await AsyncStorage.setItem(
            'health_updated_at',
            Date.now().toString()
        );

        // Update the displayed state immediately after the purchase
        setHealth(result.health);
        setKipCoins(result.coins);

        setMessage(`${item.name} restored ${result.healthRestored} HP!`);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>

                <Text style={styles.title}>Kip Care Shop</Text>
                <Text style={styles.subtitle}>Use Kip Coins to help Little Kip recover.</Text>

                {/* Current Game State */}
                <View style={styles.statusCard}>
                    <Text style={styles.statusText}>
                        ❤️ HP: {Math.round(health)} / 100
                    </Text>
                    <Text style={[styles.statusText, styles.coinStatus]}>
                        🪙 Kip Coins: {kipCoins}
                    </Text>
                </View>

                {/* Purchase Feedback */}
                {message !== '' && (
                    <Text style={styles.message}>
                        {message}
                    </Text>
                )}

                {/* Shop Items */}
                {SHOP_ITEMS.map((item) => (
                    <View key={item.id} style={styles.itemCard}>
                        <Text style={styles.itemEmoji}>
                            {item.emoji}
                        </Text>

                        <Text style={styles.itemName}>
                            {item.name}
                        </Text>

                        <Text style={styles.itemDescription}>
                            {item.description}
                        </Text>

                        <Text style={styles.itemPrice}>
                            🪙 {item.price} coins | ❤️ +{item.healthRestore} HP
                        </Text>

                        <TouchableOpacity onPress={() => handlePurchase(item)} style={styles.buyButton}>
                            <Text style={styles.buyButtonText}>
                                Buy
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}

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
    statusCard: {
        backgroundColor: COLORS.mustard,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20
    },
    statusText: {
        color: COLORS.navy,
        fontWeight: 'bold'
    },
    coinStatus: {
        marginTop: 4
    },
    message: {
        color: COLORS.navy,
        marginBottom: 16
    },
    itemCard: {
        backgroundColor: '#243555',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14
    },
    itemEmoji: {
        fontSize: 36
    },
    itemName: {
        color: COLORS.offWhite,
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 6
    },
    itemDescription: {
        color: COLORS.offWhite,
        opacity: 0.7,
        marginTop: 4
    },
    itemPrice: {
        color: '#F0C040',
        marginTop: 10
    },
    buyButton: {
        backgroundColor: COLORS.darkRed,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginTop: 14
    },
    buyButtonText: {
        color: COLORS.offWhite,
        fontWeight: 'bold'
    }
});