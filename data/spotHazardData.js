export const SPOT_HAZARD_SCENARIO = {
    id: 'power_outage',
    title: 'Power Outage Safety',
    description: 'A power outage has occurred during severe weather. Which of the following could create a safety risk?',

    options: [
        {
            id: 'candle',
            emoji: '🕯️',
            label: 'Unattended candle',
            isHazard: true,
            explanation: 'An unattended candle can cause a fire, especially during a power outage.'
        },
        {
            id: 'torch',
            emoji: '🔦',
            label: 'Battery-powered torch',
            isHazard: false,
            explanation: 'A battery-powered torch is a safer source of emergency lighting during a power outage.'
        },
        {
            id: 'wet_socket',
            emoji: '🔌',
            label: 'Wet electrical socket',
            isHazard: true,
            explanation: 'Water around electrical equipment can create an electrical hazard.'
        },
        {
            id: 'emergency_food',
            emoji: '🥫',
            label: 'Stored emergency food',
            isHazard: false,
            explanation: 'Stored non-perishable food can be useful during an emergency.'
        },
        {
            id: 'damaged_wire',
            emoji: '⚡',
            label: 'Damaged electrical wire',
            isHazard: true,
            explanation: 'Damaged electrical wiring can create electrical and fire risks.'
        },
        {
            id: 'clear_exit',
            emoji: '🚪',
            label: 'Clear exit route',
            isHazard: false,
            explanation: 'Keeping exit routes clear helps people evacuate safely if necessary.'
        }
    ]
}