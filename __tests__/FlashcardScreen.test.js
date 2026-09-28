import {
    calculateMissionRewards,
    applyHealthChange,
    calculateHealthDecay,
    purchaseShopItem,
    calculateHazardScore,
    calculateHazardRewards
} from '../utility/gameUtility';

// Tests linear reward calculation used by Flashcard Activity
describe('calculateMissionRewards', () => {
    test('returns no rewards for a score of 0', () => {
        expect(calculateMissionRewards(0)).toEqual({
            coinsEarned: 0,
            healthRestored: 0
        })
    });

    test('calculates rewards for a score of 1', () => {
        expect(calculateMissionRewards(1)).toEqual({
            coinsEarned: 20,
            healthRestored: 10
        })
    });

    test('calculates rewards for a score of 3', () => {
        expect(calculateMissionRewards(3)).toEqual({
            coinsEarned: 60,
            healthRestored: 30
        })
    });
});

// Ensure health changes are kept within valid ranges (0-100HP)
describe('applyHealthChange', () => {
    test('increases health by the specified amount', () => {
        expect(applyHealthChange(50, 20)).toBe(70);
    });

    test('caps health at 100', () => {
        expect(applyHealthChange(90, 30)).toBe(100);
    });

    test('decreases health when given a negative change', () => {
        expect(applyHealthChange(50, -20)).toBe(30);
    });

    test('does not allow health below 0', () => {
        expect(applyHealthChange(10, -30)).toBe(0);
    });
});

// Ensure health decay is based on calendar days
describe('calculateHealthDecay', () => {
    test('returns 0 health decay when there is no previous timestamp', () => {
        expect(calculateHealthDecay(null)).toBe(0);
    });

    test('returns 0 health decay on the same day', () => {
        const lastUpdated = new Date('2026-09-23T08:00:00').getTime();
        const currentTime = new Date('2026-09-23T23:00:00').getTime();

        expect(
            calculateHealthDecay(lastUpdated, currentTime)
        ).toBe(0)
    });

    // Crossing midnight counts as one calendar day
    test('applies one day of health decay on the next calendar day', () => {
        const lastUpdated = new Date('2026-09-23T23:50:00').getTime();
        const currentTime = new Date('2026-09-24T00:10:00').getTime();

        expect(calculateHealthDecay(lastUpdated, currentTime)).toBe(15);
    });

    test('applies health decay for multiple calendar days', () => {
        const lastUpdated = new Date('2026-09-21T12:00:00').getTime();
        const currentTime = new Date('2026-09-24T12:00:00').getTime();

        expect(calculateHealthDecay(lastUpdated, currentTime)).toBe(45);
    });
});

// Test successful purchases and edge cases 
describe('purchaseShopItem', () => {
    const testItem = {
        price: 20,
        healthRestore: 10
    }

    test('Successfully purchases an item when the user has enough coins', () => {
        expect(
            purchaseShopItem(50, 60, testItem)
        ).toEqual({
            success: true,
            coins: 30,
            health: 70,
            healthRestored: 10
        });
    });

    test('allows a purchase when the user has exactly enough coins', () => {
        expect(
            purchaseShopItem(20, 60, testItem)
        ).toEqual({
            success: true,
            coins: 0,
            health: 70,
            healthRestored: 10
        });
    });

    test('rejects a purchase when the user does not have enough coins', () => {
        expect(
            purchaseShopItem(10, 60, testItem)
        ).toEqual({
            success: false,
            coins: 10,
            health: 60,
            healthRestored: 0
        });
    });

    test('caps restored health at 100', () => {
        expect(
            purchaseShopItem(50, 95, testItem)
        ).toEqual({
            success: true,
            coins: 30,
            health: 100,
            healthRestored: 5
        });
    });
});

// Ensure items are classified accordingly to item safety/hazard
describe('calculateHazardScore', () => {
    const options = [
        { id: 'candle', isHazard: true },
        { id: 'torch', isHazard: false },
        { id: 'wet_socket', isHazard: true },
        { id: 'food', isHazard: false },
    ];

    test('returns full score when all items are classified correctly', () => {
        expect(calculateHazardScore(options, ['candle', 'wet_socket'])).toEqual({ correct: 4, total: 4 });
    });

    test('penalises selecting a safe item', () => {
        expect(calculateHazardScore(options, ['candle', 'torch', 'wet_socket'])).toEqual({ correct: 3, total: 4 });
    });

    test('penalises missing a hazard', () => {
        expect(calculateHazardScore(options, ['candle'])).toEqual({ correct: 3, total: 4 });
    });

    // Note one current scoring behaviour where safe items are still counted as correct even if user selects nothing.
    test('returns only safe-item classifications as correct when nothing is selected', () => {
        expect(calculateHazardScore(options, [])).toEqual({ correct: 2, total: 4 });
    });
});

// Percentage-based reward mechanic for Spot The Hazard game
describe('calculateHazardRewards', () => {
    test('returns highest reward for at least 80% correct', () => {
        expect(calculateHazardRewards(5, 6)).toEqual({
            coinsEarned: 40,
            healthRestored: 25,
        });
    });

    test('returns middle reward for at least 50% correct', () => {
        expect(calculateHazardRewards(3, 6)).toEqual({
            coinsEarned: 25,
            healthRestored: 15,
        });
    })

    test('returns lowest reward for below 50% correct', () => {
        expect(calculateHazardRewards(2, 6)).toEqual({
            coinsEarned: 10,
            healthRestored: 5,
        });
    })

    test('returns no reward when score is 0', () => {
        expect(calculateHazardRewards(0, 6)).toEqual({
            coinsEarned: 0,
            healthRestored: 0,
        });
    });
})