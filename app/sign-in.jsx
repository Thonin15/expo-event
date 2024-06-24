import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Alert,
	Image,
	SafeAreaView,
} from 'react-native';
import { useEffect } from 'react';
import { _BUTTON_HEIGHT, _RADIOS, _SCREEN_WIDTH } from '@/constants/Base';
import useAuthStore from '@/store/useAuthStore';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithCredential,
} from 'firebase/auth';
import { firebaseAuth, firestore } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
	const router = useRouter();
	const { setAuthentication, clearAuth, authenticated } = useAuthStore(
		(state) => state
	);
	const [request, response, promptAsync] = Google.useAuthRequest({
		iosClientId: process.env.EXPO_PUBLIC_AUTH_IOS_API_KEY,
		androidClientId: process.env.EXPO_PUBLIC_AUTH_ANDROID_API_KEY,
		webClientId: process.env.EXPO_PUBLIC_AUTH_WEB_API_KEY,
	});

	// Store user information in Firestore if it doesn't already exist
	const storeUserInfo = async (user) => {
		const userDocRef = doc(firestore, 'users', user.uid);
		try {
			// Check if user already exists in 'users' collection
			const userDoc = await getDoc(userDocRef);
			const userInfo = {
				uid: user.uid,
				photoURL: user.photoURL,
				email: user.email,
				displayName: user.displayName,
				phoneNumber: user.phoneNumber,
				storeName: null,
				role: 'user',
			};
			setAuthentication({
				authenticated: true,
				uid: user.uid,
				userInfo: userDoc.exists() ? userDoc.data() : userInfo,
			});
			if (!userDoc.exists()) {
				await setDoc(userDocRef, userInfo);
			}
		} catch (error) {
			console.error('Error adding user document: ', error);
		}
	};

	useEffect(() => {
		if (response?.type === 'success') {
			const { id_token } = response.params;
			const credential = GoogleAuthProvider.credential(id_token);
			signInWithCredential(firebaseAuth, credential)
				.then((userCredential) => {
					const user = userCredential.user;
					storeUserInfo(user);
				})
				.catch((error) => {
					Alert.alert(
						'Authentication Error',
						'Something went wrong! Please try again later.',
						[{ text: 'OK' }]
					);
				});
		} else if (response?.type === 'error') {
			Alert.alert(
				'Authentication Error',
				'Something went wrong! Please try again later.',
				[{ text: 'OK' }]
			);
		}
	}, [response]);

	useEffect(() => {
		const listener = onAuthStateChanged(firebaseAuth, (user) => {
			if (user && !authenticated) {
				storeUserInfo(user);
				router.navigate('/profile');
			} else {
				clearAuth();
			}
		});
		return () => listener();
	}, []);

	const onGoBack = () => {
		router.dismiss();
	};
	const onSubmit = () => {
		promptAsync();
	};

	return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
                <Ionicons size={30} name='chevron-back' color={Colors.light.text} />
            </TouchableOpacity>
            <View style={styles.header}>
                <Image
                    source={require('../assets/images/Text.png')}
                    style={styles.logoImage}
                />
                <Text style={styles.title}>Welcome to KitKu !</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={onSubmit}>
                <Image
                    resizeMode='contain'
                    source={require('@/assets/images/google.png')}
                    style={styles.google}
                />
                <Text style={styles.btnText}>Sign in with Google</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoImage: {
        width: 250,
        height: 250,
        marginBottom: 10,
        marginTop: -100,
    },
    title: {
        fontSize: 28,
        fontFamily: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'medium',
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 30,
        backgroundColor: 'transparent',
        borderRadius: 10,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },    
    button: {
        height: _BUTTON_HEIGHT,
        borderRadius: _BUTTON_HEIGHT / 2,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
    },
    google: {
        width: 25,
        height: 25,
        marginRight: 10,
    },
    btnText: {
        fontSize: 18,
        fontFamily: 'bold'
    },
});
