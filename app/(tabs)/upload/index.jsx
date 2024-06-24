import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Image,
	Alert,
} from 'react-native';
import { _BUTTON_HEIGHT, _RADIOS, _SCREEN_WIDTH } from '@/constants/Base';
import useAuthStore from '@/store/useAuthStore';
import { signOut } from 'firebase/auth';
import { firebaseAuth, getAuth } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/common/ThemedText';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import ProcessingForm from '../../../components/upload/ProcessingForm';
import MarketForm from '@/components/upload/MarketForm';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const TABS = ['Library', 'Marketplace'];

export default function UploadScreen() {
	const router = useRouter();
	const { authenticated, userInfo } = useAuthStore((state) => state);
	const [selectedTab, setSelectedTab] = useState(TABS[0]);
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = () => {
		router.push({
			pathname: '/sign-in',
		});
	};

	const checkUserRole = async () => {
		setIsLoading(true);
		try {
			const auth = getAuth();
			const user = auth.currentUser;

			if (user) {
				const db = getFirestore();
				const userDocRef = doc(db, 'users', user.uid);
				const userDoc = await getDoc(userDocRef);

				if (userDoc.exists()) {
					const userData = userDoc.data();
					if (userData.role === 'user') {
						showBecomeSellerAlert();
					}
				}
			}
		} catch (error) {
			console.error('Error fetching user role:', error);
		}
		setIsLoading(false);
	};

	const showBecomeSellerAlert = () => {
		Alert.alert(
			'Become a Seller',
			'Do you want to become a Seller in KITKu APP?',
			[
				{ text: 'No', style: 'cancel' },
				{ text: 'Yes Please', onPress: () => handleYesPress() },
			]
		);
	};

	const handleYesPress = () => {
		router.push('/upload/seller-form');
	};

	const onTabPress = (tab) => {
		setSelectedTab(tab);
		if (tab === TABS[1]) {
			checkUserRole();
		}
	};

	if (!authenticated) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>GO TO LOG IN PAGE</Text>
				<TouchableOpacity style={styles.button} onPress={handleLogin}>
					<Text style={styles.btnText}>LOG IN</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View>
			<View style={styles.tabContainer}>
				{TABS.map((tab) => {
					const active = tab === selectedTab;
					return (
						<TouchableOpacity
							key={tab}
							style={styles.tab(active)}
							onPress={() => onTabPress(tab)}
							disabled={isLoading} // Disable while loading
						>
							<Text style={styles.tabText(active)}>{tab}</Text>
						</TouchableOpacity>
					);
				})}
			</View>
			{selectedTab === 'Library' && <ProcessingForm />}
			{selectedTab !== 'Library' && <MarketForm />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	input: {
		backgroundColor: '#dedede',
		marginVertical: 10,
		paddingHorizontal: 15,
		height: _BUTTON_HEIGHT,
		width: _SCREEN_WIDTH - 20,
		borderRadius: _RADIOS,
	},
	button: {
		height: _BUTTON_HEIGHT,
		paddingHorizontal: 20,
		backgroundColor: '#76bde9',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 100,
	},
	btnText: {
		fontSize: 18,
		color: '#ffffff',
	},
	profile: {
		width: 50,
		height: 50,
	},
	tabContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 25,
		paddingHorizontal: 5,
		backgroundColor: '#fff',
	},
	tab: (active) => ({
		flex: 1,
		backgroundColor: active ? '#fff' : Colors.light.primary,
		height: _BUTTON_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 10,
		borderRadius: _RADIOS,
		marginHorizontal: 5,
		borderColor: Colors.light.primary,
		borderWidth: 1,
	}),
	tabText: (active) => ({
		color: active ? Colors.light.primary : '#fff',
	}),
});
