import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
                headerShown: false,
            }}
        >
            <Tabs.Screen name='index' options={{ href: null }} />
            <Tabs.Screen
                name='home'
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'home' : 'home-outline'}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='map'
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'location' : 'location-outline'}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='upload'
                options={{
                    title: 'Upload',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'add-circle' : 'add-circle-outline'}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? 'person' : 'person-outline'}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
