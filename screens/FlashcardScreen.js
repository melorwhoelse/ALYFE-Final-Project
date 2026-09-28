import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { calculateMissionRewards, applyHealthChange } from '../utility/gameUtility';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../constants/colors';

const QUESTIONS = [
    {
        id: 'q1',
        question: 'Which air quality reading should you check when deciding on immediate outdoor activities during haze?',
        options: [
            '1-hour PM2.5',
            '24-hour PSI forecast',
            'UV Index',
            'Temperature'
        ],
        correct: 0,
    },
    {
        id: 'q2',
        question: 'Which item can be used to call for help or alert others during an emergency?',
        options: [
            'N95 mask',
            'First aid kit',
            'Whistle',
            'Spare clothing'
        ],
        correct: 2,
    },
    {
        id: 'q3',
        question: 'What is the emergency number for SCDF in Singapore?',
        options: ['999', '995', '991', '993'],
        correct: 1,
    },
];

export default function FlashcardScreen({ navigation, route }) {

    // Track user's progress and score throughout the quiz
    const { completedIds, setCompletedIds, missionId } = route.params;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const currentQuestion = QUESTIONS[currentIndex];
    const isLastQuestion = currentIndex === QUESTIONS.length - 1;

    // Lock the question after each answer and increase the score if correct
    const handleSelectAnswer = (index) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
        setIsAnswered(true);
        if (index === currentQuestion.correct) {
            setScore(prev => prev + 1);
        }
    };

    // Calculate and save user's rewards when the quiz is completed
    const handleFinish = async () => {
        try {
            const savedHealth = await AsyncStorage.getItem('kip_health');
            const savedCoins = await AsyncStorage.getItem('kip_coins');

            // Use default values if no saved gameplay state exists yet
            const currentHealth = savedHealth ? parseFloat(savedHealth) : 40;
            const currentCoins = savedCoins ? parseInt(savedCoins) : 0;

            const { coinsEarned, healthRestored } = calculateMissionRewards(score);
            const newHealth = applyHealthChange(currentHealth, healthRestored);

            const newCoins = currentCoins + coinsEarned;

            // Persist updated gameplay state between app sessions
            await AsyncStorage.setItem('kip_health', newHealth.toString());
            await AsyncStorage.setItem('kip_coins', newCoins.toString());
            await AsyncStorage.setItem('health_updated_at', Date.now().toString());

            // Record the mission as completed so it cannot be repeatedly farmed for rewards
            const updatedIds = [...completedIds, missionId];
            await AsyncStorage.setItem('completed_missions', JSON.stringify(updatedIds));
            setCompletedIds(updatedIds);

            setIsComplete(true);
        } catch (e) {
            console.log('Finish error', e);
        }
    };

    // Either move to the next question or complete the mission
    const handleNext = () => {
        if (isLastQuestion) {
            handleFinish();
        } else {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        }
    };

    // Show visual feedback for the correct answer and any incorrect selection
    const getOptionStyle = (index) => {
        if (!isAnswered) return styles.option;
        if (index === currentQuestion.correct) return [styles.option, styles.optionCorrect];
        if (index === selectedAnswer) return [styles.option, styles.optionWrong];
        return styles.option;
    };

    // Replace the quiz with a completion summary once rewards have been saved
    if (isComplete) {
        const { coinsEarned, healthRestored } = calculateMissionRewards(score);

        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.questionCard}>
                        <Text style={styles.questionText}>Quiz Complete!</Text>
                    </View>
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackText}>
                            You got {score} out of {QUESTIONS.length} correct!
                        </Text>
                        <Text style={styles.rewardText}>🪙 +{coinsEarned} Kip Coins</Text>
                        <Text style={styles.rewardText}>❤️ +{healthRestored} HP restored</Text>
                        <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.nextBtnText}>Back to Missions</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* Progress */}
            <Text style={styles.progress}>Question {currentIndex + 1} of {QUESTIONS.length}</Text>

            {/* Question Card */}
            <View style={styles.questionCard}>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
            </View>

            {/* Options */}
            {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                    key={index}
                    style={getOptionStyle(index)}
                    onPress={() => handleSelectAnswer(index)}
                    disabled={isAnswered}
                ><Text style={styles.optionText}>{option}</Text></TouchableOpacity>
            ))}

            {/* Feedback + Next */}
            {isAnswered && (
                <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackText}>
                        {selectedAnswer === currentQuestion.correct ? 'Correct!' : 'Wrong'}
                    </Text>
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <Text style={styles.nextBtnText}>
                            {isLastQuestion ? 'Finish Quiz' : 'Next Question >>'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.navy
    },
    content: {
        padding: 20,
        gap: 12
    },
    progress: {
        color: COLORS.offWhite,
        opacity: 0.6,
        fontSize: 13,
        marginBottom: 4
    },

    questionCard: {
        backgroundColor: '#243555',
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.darkRed
    },
    questionText: {
        color: COLORS.offWhite,
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 26
    },

    option: {
        backgroundColor: '#243555',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334466'
    },
    optionCorrect: {
        backgroundColor: '#1a3a2a'
    },
    optionWrong: {
        backgroundColor: '#3a1a1a'
    },
    optionText: {
        color: COLORS.offWhite,
        fontSize: 15
    },

    feedbackContainer: {
        backgroundColor: '#243555',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 12, marginTop: 4
    },
    feedbackText: {
        color: COLORS.offWhite,
        fontSize: 18,
        fontWeight: 'bold'
    },
    nextBtn: {
        backgroundColor: COLORS.darkRed,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 32
    },
    nextBtnText: {
        color: COLORS.offWhite,
        fontWeight: 'bold',
        fontSize: 15
    },
    rewardText: {
        color: '#F0C040',
        fontSize: 16,
        fontWeight: '600'
    },
});