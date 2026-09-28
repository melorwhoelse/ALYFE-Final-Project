import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

import COLORS from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPOT_HAZARD_SCENARIO } from '../data/spotHazardData';
import { calculateHazardScore, calculateHazardRewards, applyHealthChange } from '../utility/gameUtility';

export default function SpotHazardScreen({ route }) {

    // Retrieve mission completion data when this activity is opened from Missions
    let completedIds = [];
    let setCompletedIds = null;
    let missionId = null;

    if (route.params) {
        completedIds = route.params.completedIds || [];
        setCompletedIds = route.params.setCompletedIds;
        missionId = route.params.missionId;
    }

    const [selectedIds, setSelectedIds] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    // Add or remove an option from the user's selected hazards
    // Selections are locked once the activity has been submitted
    const toggleSelection = (optionId) => {
        if (submitted) {
            return;
        }

        if (selectedIds.includes(optionId)) {
            setSelectedIds(
                selectedIds.filter((id) => id !== optionId)
            );
        } else {
            setSelectedIds([...selectedIds, optionId]);
        }
    };

    const handleSubmit = async () => {

        // Score each option based on whether it was correctly classified as a hazard or safe item, then calculate the corresponding reward tier.
        const score = calculateHazardScore(SPOT_HAZARD_SCENARIO.options, selectedIds);

        const rewards = calculateHazardRewards(score.correct, score.total);

        const savedHealth = await AsyncStorage.getItem('kip_health');
        const savedCoins = await AsyncStorage.getItem('kip_coins');

        const parsedHealth = parseFloat(savedHealth);
        const parsedCoins = parseFloat(savedCoins);

        // Fall back to the starting game state if no valid saved values exist
        const currentHealth = Number.isFinite(parsedHealth) ? parsedHealth : 40;
        const currentCoins = Number.isFinite(parsedCoins) ? parsedCoins : 0;
        const newHealth = applyHealthChange(currentHealth, rewards.healthRestored);

        const newCoins = currentCoins + rewards.coinsEarned;

        // Persist the rewards and reset the reference time for health decay
        await AsyncStorage.setItem('kip_health', newHealth.toString());
        await AsyncStorage.setItem('kip_coins', newCoins.toString());
        await AsyncStorage.setItem(
            'health_updated_at',
            Date.now().toString()
        );

        // Record the mission as completed without adding duplicate IDs
        if (missionId) {
            let updatedCompletedIds = completedIds;

            if (!completedIds.includes(missionId)) {
                updatedCompletedIds = completedIds.concat(missionId);
            }

            await AsyncStorage.setItem(
                'completed_missions', JSON.stringify(updatedCompletedIds)
            );

            if (setCompletedIds) {
                setCompletedIds(updatedCompletedIds);
            }
        }

        // Store the results needed by the completion feedback UI
        setResult({
            correct: score.correct,
            total: score.total,
            coinsEarned: rewards.coinsEarned,
            healthRestored: Math.round(newHealth - currentHealth)
        });

        setSubmitted(true);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>

                <Text style={styles.title}>
                    {SPOT_HAZARD_SCENARIO.title}
                </Text>

                <Text style={styles.description}>
                    {SPOT_HAZARD_SCENARIO.description}
                </Text>

                <Text style={styles.instruction}>
                    Select all items that you think are hazards.
                </Text>

                <View style={styles.optionGrid}>
                    {SPOT_HAZARD_SCENARIO.options.map((option) => {
                        const isSelected = selectedIds.includes(option.id);

                        // Option is correct if a hazard was selected or a safe item was left unselected
                        const isCorrect =
                            (option.isHazard && isSelected) ||
                            (!option.isHazard && !isSelected);

                        return (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => toggleSelection(option.id)}
                                style={[
                                    styles.optionCard,
                                    isSelected && !submitted && styles.selectedCard,
                                    submitted && isCorrect && styles.correctCard,
                                    submitted && !isCorrect && styles.incorrectCard]}>

                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>

                                <Text style={styles.optionLabel}>
                                    {option.label}
                                </Text>

                                {submitted && (
                                    <>
                                        <Text style={styles.feedbackLabel}>
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                            {' — '}
                                            {option.isHazard ? 'Hazard' : 'Safe'}
                                        </Text>

                                        <Text style={styles.explanation}>
                                            {option.explanation}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )
                    })}
                </View>

                {!submitted && (
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>
                            Submit
                        </Text>
                    </TouchableOpacity>
                )}

                {submitted && result && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>
                            Result
                        </Text>

                        <Text style={styles.resultScore}>
                            {result.correct} / {result.total} correctly classified
                        </Text>

                        <Text style={styles.rewardText}>
                            🪙 +{result.coinsEarned} Kip Coins
                        </Text>

                        <Text style={styles.rewardText}>
                            ❤️ +{result.healthRestored} HP
                        </Text>
                    </View>
                )}

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
        marginBottom: 8
    },
    description: {
        color: COLORS.navy,
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 12
    },
    instruction: {
        color: COLORS.navy,
        opacity: 0.65,
        marginBottom: 20
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    optionCard: {
        width: '48%',
        backgroundColor: '#243555',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        minHeight: 130,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent'
    },
    selectedCard: {
        borderColor: COLORS.mustard
    },
    optionEmoji: {
        fontSize: 36,
        marginBottom: 8
    },
    optionLabel: {
        color: COLORS.offWhite,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    submitButton: {
        backgroundColor: COLORS.darkRed,
        borderRadius: 8,
        padding: 14,
        marginTop: 6,
        marginBottom: 20
    },
    submitButtonText: {
        color: COLORS.navy,
        fontWeight: 'bold',
        fontSize: 16
    },
    resultCard: {
        backgroundColor: COLORS.mustard,
        borderRadius: 12,
        padding: 16,
        marginTop: 6,
        marginBottom: 20
    },
    resultTitle: {
        color: COLORS.navy,
        fontWeight: 'bold',
        fontSize: 18
    },
    resultScore: {
        color: COLORS.navy,
        marginTop: 6
    },
    correctCard: {
        borderColor: '#4CAF50'
    },
    incorrectCard: {
        borderColor: COLORS.darkRed
    },
    feedbackLabel: {
        color: COLORS.offWhite,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center'
    },
    explanation: {
        color: COLORS.offWhite,
        opacity: 0.75,
        fontSize: 12,
        lineHeight: 17,
        marginTop: 6,
        textAlign: 'center'
    },
    rewardText: {
        color: COLORS.navy,
        marginTop: 6,
        fontWeight: 'bold',
    }
});

