import { useEffect } from 'react';
import { initFirebaseUser } from './utility/firebaseUtility';

import { Text, TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import COLORS from './constants/colors';
import HomeScreen from './screens/HomeScreen';
import MissionsScreen from './screens/MissionsScreen';
import FlashcardScreen from './screens/FlashcardScreen';
import ShopScreen from './screens/ShopScreen';
import SpotHazardScreen from './screens/SpotHazardScreen';
import ResourceHubScreen from './screens/ResourceHubScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main application navigation using four persistent bottom tabs
function MyTabs() {
    return (
        <Tab.Navigator screenOptions={{
            tabBarStyle: { backgroundColor: COLORS.navy },
            tabBarActiveTintColor: COLORS.darkRed,
            tabBarInactiveTintColor: COLORS.offWhite,
            headerStyle: { backgroundColor: COLORS.navy },
            headerTintColor: COLORS.offWhite,
        }}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Missions" component={MissionsStack} />
            <Tab.Screen name="Shop" component={ShopScreen} />
            <Tab.Screen name="Resources" component={ResourceHubScreen} />
        </Tab.Navigator>
    );
}

// Missions uses nested stack navigation so activities can open from the mission list while remaining within the Missions tab
function MissionsStack() {
    return (
        <Stack.Navigator
            screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: COLORS.navy },
                headerTintColor: COLORS.offWhite,
                headerTitleStyle: { fontWeight: 'bold', letterSpacing: 2 },

                // Custom back button used for consistent navigation in the web build
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ paddingRight: 16 }}
                    >
                        <Text
                            style={{
                                color: COLORS.offWhite,
                                fontSize: 28
                            }}
                        >
                            ←
                        </Text>
                    </TouchableOpacity>
                ),
            })}
        >
            <Stack.Screen
                name="MissionsList"
                component={MissionsScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Flashcard"
                component={FlashcardScreen}
                options={{ title: 'Flashcard Quiz' }}
            />

            <Stack.Screen
                name="SpotHazard"
                component={SpotHazardScreen}
                options={{ title: 'Spot The Hazard' }}
            />
        </Stack.Navigator>
    );
}


export default function App() {

    // Initialise Firebase authentication once when the application starts
    useEffect(() => {
        initFirebaseUser();
    }, []);

    return (
        <NavigationContainer>
            <MyTabs />
        </NavigationContainer>
    );
}