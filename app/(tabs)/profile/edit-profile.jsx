import {
	Alert,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { _BUTTON_HEIGHT, _RADIOS } from '@/constants/Base';
import { Colors } from '@/constants/Colors';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';

const EditForm = () => {
	const router = useRouter();
	const db = getFirestore();
	const display_name_ref = useRef(null);
	const email_ref = useRef(null);
	const phone_ref = useRef(null);
	const store_ref = useRef(null);
	const { updateUserInfo, userInfo } = useAuthStore((state) => state);
	const [displayName, setDisplayName] = useState(userInfo.displayName);
	const [email, setEmail] = useState(userInfo.email);
	const [phoneNumber, setPhoneNumber] = useState(userInfo.phoneNumber);
	const [storeName, setStoreName] = useState(userInfo.storeName);
	const auth = getAuth();

	const onSubmit = async () => {
		const userDocRef = doc(db, 'users', userInfo.uid);
		const updateInfo = {
			displayName,
			email,
			phoneNumber,
			storeName,
		};
		updateUserInfo(updateInfo);
		await updateDoc(userDocRef, {
			...userInfo,
			...updateInfo,
		});
		Alert.alert('Success Completed!', 'Go back to profile', [
			{
				text: 'OK',
				onPress: () => router.back(),
			},
		]);
	};

	return (
		<View style={styles.container}>
			<Image source={{ uri: userInfo.photoURL }} style={styles.profile} />
			<TextInput
				style={styles.input}
				ref={display_name_ref}
				value={displayName}
				placeholder={'Display name'}
				onChangeText={setDisplayName}
				onSubmitEditing={() => {
					email_ref.current.focus();
				}}
			/>
			<TextInput
				style={styles.input}
				ref={email_ref}
				value={email}
				placeholder={'Email'}
				onChangeText={setEmail}
				onSubmitEditing={() => {
					phone_ref.current.focus();
				}}
			/>
			<TextInput
				style={styles.input}
				ref={phone_ref}
				value={phoneNumber}
				placeholder={'Phone Number'}
				onChangeText={setPhoneNumber}
				onSubmitEditing={() => {
					store_ref.current.focus();
				}}
			/>
			<TextInput
				style={styles.input}
				ref={store_ref}
				value={storeName}
				placeholder={'Store Name'}
				onChangeText={setStoreName}
				onSubmitEditing={onSubmit}
				returnKeyType='done'
			/>
			<TouchableOpacity style={styles.button} onPress={onSubmit}>
				<Text style={styles.buttonText}>Update</Text>
			</TouchableOpacity>
		</View>
	);
};

export default EditForm;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	profile: {
		width: 100,
		height: 100,
		borderRadius: 50,
		alignSelf: 'center',
	},
	input: {
		margin: 5,
		height: _BUTTON_HEIGHT,
		borderRadius: _RADIOS,
		backgroundColor: '#fff',
		borderColor: Colors.light.primary,
		paddingHorizontal: 15,
	},
	button: {
		backgroundColor: Colors.light.primary,
		height: _BUTTON_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 10,
		borderRadius: _RADIOS,
		margin: 5,
		marginTop: 20,
		borderColor: Colors.light.primary,
		borderWidth: 1,
	},
	buttonText: {
		color: '#fff',
	},
});
