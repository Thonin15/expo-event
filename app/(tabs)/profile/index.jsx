import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { _BUTTON_HEIGHT, _RADIOS, _SCREEN_WIDTH } from '@/constants/Base';
import useAuthStore from '@/store/useAuthStore';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
	const router = useRouter();
	const { authenticated, clearAuth, userInfo } = useAuthStore(
		(state) => state
	);

	const handleLogin = () => {
		router.navigate({
			pathname: '/sign-in',
		});
	};

	if (!authenticated) {
		return (
			<View style={styles.container}>
			<Image 
				source={require('./../../../assets/images/GreenLogo.png')}
				style={styles.logo} 
				resizeMode='contain'
			/>
			<Text style={styles.title}>Log in to create and save your favorite recipes</Text>
			<TouchableOpacity style={styles.button} onPress={handleLogin}>
				<Text style={styles.btnText}>Sign in</Text>
			</TouchableOpacity>
		</View>
		);
	}
	const userProfile = userInfo?.photoURL;
	return (
	
			
		<View style={styles.container}>
			<Image 
				source={require('./../../../assets/images/KitKuText.png')}
				style={styles.logo1} 
				resizeMode='contain'
			/>
			{userProfile && (
				<Image
					source={{ uri: userProfile }}
					resizeMode='contain'
					style={styles.profile}
				/>
			)}
			<Text style={styles.name}>{userInfo?.displayName}</Text>
			<Text style={styles.email}>{userInfo?.email}</Text>
			<TouchableOpacity
				style={styles.button}
				onPress={() => {
					router.push('/profile/edit-profile');
				}}
			>
				<Text style={styles.btnText}>EDIT PROFILE</Text>
			</TouchableOpacity>

			
			<TouchableOpacity
				style={styles.button}
				onPress={() => {
					router.push('/profile/manage-post');
				}}
			>
				<Text style={styles.btnText}>Manage Post</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.buttonlog}
				onPress={async () => {
					await signOut(firebaseAuth);
					clearAuth();
				}}
			>
				<Text style={styles.btnText}>LOG OUT</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({

	container: {
		
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    logo: {
        width: 200,
        height: 100,
        marginBottom: 20,
        borderRadius: 10,
    },
	logo1: {
		marginTop:-50,
		marginBottom:60,
        width: 250,
        height: 100,
	
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        fontFamily: 'extrabold',
        textAlign: 'center',
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    profile: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileTextContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    email: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    button: {
        marginTop: 50,
        height: 50,
        paddingHorizontal: 130,
        backgroundColor: '#4B7F52',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
	buttonlog: {
        marginTop: 50,
        height: 50,
        paddingHorizontal: 130,
        backgroundColor: '#CF1B1B',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
		marginTop:60,
    },
    btnText: {
        fontSize: 16,
        fontFamily: 'bold',
        color: '#ffffff',
    },
    logoutButton: {
        position: 'absolute',
        top: 40,
        right: 10,
        width: 40,
        height: 40,
    },
});
