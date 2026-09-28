import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';

import * as Location from 'expo-location';

import COLORS from '../constants/colors';
import { EMERGENCY_CONTACTS } from '../data/emergencyContacts';
import { PREPAREDNESS_INFO } from '../data/preparednessData';
import { HAZE_INFO } from '../data/hazeWeatherData';
import { EMERGENCY_FACILITIES } from '../data/emergencyFacilities';
import { findNearestFacilities } from '../utility/locationUtility';

export default function ResourceHubScreen() {
    const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
    const [showPreparedness, setShowPreparedness] = useState(false);
    const [showHazeWeather, setShowHazeWeather] = useState(false);

    // Store nearby fire stations after sorting them by distance
    const [nearbyFacilities, setNearbyFacilities] = useState([]);

    // Store an error message if the user's location cannot be retrieved
    const [locationError, setLocationError] = useState('');

    // Track whether ALYFE is currently retrieving the user's location 
    const [isFindingLocation, setIsFindingLocation] = useState(false)

    async function findNearbyHelp() {
        setIsFindingLocation(true);
        setLocationError('');

        try {

            // Ask for location access only when the user chooses to find nearby help
            const permission = await Location.requestForegroundPermissionsAsync();

            if (permission.status !== 'granted') {
                setLocationError('Location permission is required to find nearby emergency facilities.');
                return;
            };

            // Retrieve the device's current coordinates after permission is granted
            const currentLocation = await Location.getCurrentPositionAsync({});

            const latitude = currentLocation.coords.latitude;
            const longitude = currentLocation.coords.longitude;

            // Calculate distances to the bundled SCDF facilities and sort them nearest first
            const nearestFacilities = findNearestFacilities(latitude, longitude, EMERGENCY_FACILITIES);

            setNearbyFacilities(nearestFacilities);
        } catch (error) {
            setLocationError('Unable to retrieve your location. Please try again.');
        } finally {

            // Always stop the loading state, including when permission is denied or an error occurs.
            setIsFindingLocation(false);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    Resource Hub
                </Text>

                <Text style={styles.subtitle}>
                    Quick access to emergency information and preparedness resources.
                </Text>

                <TouchableOpacity
                    style={styles.resourceCard}
                    onPress={() => {
                        setShowEmergencyContacts(!showEmergencyContacts);
                    }}>
                    <Text style={styles.cardEmoji}>📞</Text>

                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>
                            Emergency Contacts
                        </Text>

                        <Text style={styles.cardDescription}>
                            Important numbers to know during an emergency.
                        </Text>
                    </View>
                </TouchableOpacity>

                {showEmergencyContacts && (
                    <View style={styles.contactsContainer}>
                        {EMERGENCY_CONTACTS.map((contact) => (
                            <View key={contact.id} style={styles.contactItem}>
                                <Text style={styles.contactEmoji}>
                                    {contact.emoji}
                                </Text>

                                <View style={styles.contactText}>
                                    <Text style={styles.contactService}>
                                        {contact.service}
                                    </Text>

                                    <Text style={styles.contactNumber}>
                                        {contact.number}
                                    </Text>

                                    <Text style={styles.contactDescription}>
                                        {contact.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.resourceCard}
                    onPress={() => {
                        setShowPreparedness(!showPreparedness);
                    }}>
                    <Text style={styles.cardEmoji}>🎒</Text>

                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>
                            Emergency Preparedness
                        </Text>

                        <Text style={styles.cardDescription}>
                            Learn how to prepare yourself and your household.
                        </Text>
                    </View>
                </TouchableOpacity>

                {showPreparedness && (
                    <View style={styles.preparednessContainer}>
                        {PREPAREDNESS_INFO.map((info) => (
                            <View
                                key={info.id}
                                style={styles.preparednessItem}
                            >
                                <Text style={styles.preparednessEmoji}>
                                    {info.emoji}
                                </Text>

                                <View style={styles.preparednessText}>
                                    <Text style={styles.preparednessTitle}>
                                        {info.title}
                                    </Text>

                                    <Text style={styles.preparednessDescription}>
                                        {info.description}
                                    </Text>

                                    {info.items.map((item, index) => (
                                        <Text
                                            key={index}
                                            style={styles.preparednessListItem}
                                        >
                                            - {item}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.resourceCard}
                    onPress={() => {
                        setShowHazeWeather(!showHazeWeather);
                    }}>
                    <Text style={styles.cardEmoji}>🌫️</Text>

                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>
                            Haze & Weather
                        </Text>

                        <Text style={styles.cardDescription}>
                            Find guidance for environmental emergencies.
                        </Text>
                    </View>
                </TouchableOpacity>

                {showHazeWeather && (
                    <View style={styles.hazeContainer}>
                        {HAZE_INFO.map((info) => (
                            <View
                                key={info.id}
                                style={styles.hazeItem}
                            >
                                <Text style={styles.hazeEmoji}>
                                    {info.emoji}
                                </Text>

                                <View style={styles.hazeText}>
                                    <Text style={styles.hazeTitle}>
                                        {info.title}
                                    </Text>

                                    <Text style={styles.hazeDescription}>
                                        {info.description}
                                    </Text>

                                    {info.items.map((item, index) => (
                                        <Text
                                            key={index}
                                            style={styles.hazeListItem}
                                        >
                                            - {item}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Nearby Help</Text>

                    <Text style={styles.sectionDescription}>
                        Find SCDF fire stations near your current location.
                    </Text>

                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={findNearbyHelp}
                        disabled={isFindingLocation}
                    >
                        <Text style={styles.locationButtonText}>
                            {isFindingLocation ? 'Finding location...' : 'Find Nearby Help'}
                        </Text>
                    </TouchableOpacity>

                    {locationError !== '' && (
                        <Text style={styles.locationError}>
                            {locationError}
                        </Text>
                    )}

                    {nearbyFacilities.length > 0 && (
                        <View style={styles.facilitiesContainer}>
                            {nearbyFacilities.slice(0, 3).map((facility) => (
                                <View
                                    key={facility.id}
                                    style={styles.facilityCard}
                                >
                                    <Text style={styles.facilityName}>
                                        {facility.name}
                                    </Text>

                                    <Text style={styles.facilityAddress}>
                                        {facility.address}
                                    </Text>

                                    <Text style={styles.facilityDistance}>
                                        {facility.distance.toFixed(2)} km away
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    )
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 6
    },
    subtitle: {
        color: COLORS.navy,
        opacity: 0.7,
        lineHeight: 20,
        marginBottom: 24,
    },
    resourceCard: {
        backgroundColor: '#243555',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'center'
    },
    cardEmoji: {
        fontSize: 32,
        marginRight: 16
    },
    cardText: {
        flex: 1
    },
    cardTitle: {
        color: COLORS.offWhite,
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 4
    },
    cardDescription: {
        color: COLORS.offWhite,
        opacity: 0.75,
        fontSize: 13,
        lineHeight: 18
    },

    //Emergency Contacts
    contactsContainer: {
        marginTop: -4,
        marginBottom: 14,
        paddingHorizontal: 8
    },
    contactItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    contactEmoji: {
        fontSize: 26,
        marginRight: 12
    },
    contactText: {
        flex: 1
    },
    contactService: {
        color: COLORS.navy,
        fontSize: 15,
        fontWeight: 'bold'
    },
    contactNumber: {
        color: COLORS.darkRed,
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 4
    },
    contactDescription: {
        color: COLORS.navy,
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.75
    },

    // Preparedness information    
    preparednessContainer: {
        marginTop: -4,
        marginBottom: 14,
        paddingHorizontal: 8
    },
    preparednessItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    preparednessEmoji: {
        fontSize: 26,
        marginRight: 12
    },
    preparednessText: {
        flex: 1
    },
    preparednessTitle: {
        color: COLORS.navy,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4
    },
    preparednessDescription: {
        color: COLORS.navy,
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.75,
        marginBottom: 8
    },
    preparednessListItem: {
        color: COLORS.navy,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 2
    },

    // Haze information
    hazeContainer: {
        marginTop: -4,
        marginBottom: 14,
        paddingHorizontal: 8
    },
    hazeItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    hazeEmoji: {
        fontSize: 26,
        marginRight: 12
    },
    hazeText: {
        flex: 1
    },
    hazeTitle: {
        color: COLORS.navy,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4
    },
    hazeDescription: {
        color: COLORS.navy,
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.75,
        marginBottom: 8
    },
    hazeListItem: {
        color: COLORS.navy,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 2
    },

    // Nearby Help
    locationButton: {
        backgroundColor: '#2F6B4F',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12
    },
    locationButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold'
    },
    locationError: {
        marginTop: 10,
        color: COLORS.darkRed
    },
    facilitiesContainer: {
        marginTop: 14
    },
    facilityCard: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F4F4F4',
        marginBottom: 10
    },
    facilityName: {
        fontWeight: 'bold',
        fontSize: 16
    },
    facilityAddress: {
        marginTop: 4
    },
    facilityDistance: {
        marginTop: 6,
        fontWeight: 'bold'
    }
});