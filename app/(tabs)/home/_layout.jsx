import { Stack } from 'expo-router';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './index';


import SearchScreen from './search';
import PostDetail from './PostDetail';
import ItemList from './post-list';

export default function HomeLayout() {
	const Stack = createStackNavigator();
	return (
		<Stack.Navigator
			screenOptions={{
				headerBackTitleVisible: false,
			}}
		>
			<Stack.Screen
				name='index'
				component={HomeScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='product-detail'
				component={PostDetail}
			
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='post-list'
				component={ItemList}
				options={{headerShown: false }}
			/>
			<Stack.Screen
				name='Search'
				component={SearchScreen}
				options={{ title: 'Search Resullt' }}
			/>
		</Stack.Navigator>
	);
}
