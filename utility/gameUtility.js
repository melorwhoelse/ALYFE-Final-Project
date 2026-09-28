export const MAX_HEALTH = 100;

// Kip loses 15 HP for each calendar day elapsed
export const DAILY_HEALTH_DECAY = 15;

export function calculateHealthDecay(lastUpdated, currentTime = Date.now()) {
    if (!lastUpdated) {
        return 0;
    }

    // Normalise both timestamps to midnight
    const lastDate = new Date(Number(lastUpdated));
    const currentDate = new Date(currentTime);

    lastDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const daysElapsed = (currentDate - lastDate) / millisecondsPerDay;

    return Math.max(0, daysElapsed * DAILY_HEALTH_DECAY);
}

// Apply health change and keep HP between 0 and 100
export function applyHealthChange(currentHealth, change) {
    return Math.max(0, Math.min(MAX_HEALTH, currentHealth + change));
}

// Flashcard rewards scale directly with the number of correct answers
export function calculateMissionRewards(score) {
    return {
        coinsEarned: score * 20,
        healthRestored: score * 10
    };
}

export function purchaseShopItem(currentCoins, currentHealth, item) {

    // Reject the purchase without changing the game state if coins are insufficient
    if (currentCoins < item.price) {
        return {
            success: false,
            coins: currentCoins,
            health: currentHealth,
            healthRestored: 0
        };
    }

    const newHealth = applyHealthChange(currentHealth, item.healthRestore);

    return {
        success: true,
        coins: currentCoins - item.price,
        health: newHealth,

        // Return the HP actually restored after applying the 100 HP cap
        healthRestored: Math.round(newHealth - currentHealth)
    };
}

export function calculateHazardScore(options, selectedIds) {
    let correctSelections = 0;

    options.forEach((option) => {
        const isSelected = selectedIds.includes(option.id);

        // A correct classification is either a selected hazard or a safe item that was correctly left unselected
        if (
            (option.isHazard && isSelected) || (!option.isHazard && !isSelected)
        ) {
            correctSelections++;
        }
    });

    return {
        correct: correctSelections,
        total: options.length
    };
}

// Spot The Hazard percentage-based tiered rewards function
export function calculateHazardRewards(correct, total) {
    if (correct === 0) {
        return {
            coinsEarned: 0,
            healthRestored: 0,
        };
    }

    const percentage = correct / total;

    if (percentage >= 0.8) {
        return {
            coinsEarned: 40,
            healthRestored: 25,
        }
    }

    if (percentage >= 0.5) {
        return {
            coinsEarned: 25,
            healthRestored: 15,
        };
    }

    return {
        coinsEarned: 10,
        healthRestored: 5,
    };
}
