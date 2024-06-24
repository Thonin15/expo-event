import {
	SafeAreaView,
	View,
	Text,
	TextInput,
	Button,
	StyleSheet,
	ActivityIndicator,
	Alert,
	TouchableOpacity,
    Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
	getFirestore,
	doc,
	getDoc,
	setDoc,
	updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import useAuthStore from '@/store/useAuthStore';
import { Colors } from '@/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';

export default function BecomeSellerScreen() {
	const { updateUserInfo, userInfo } = useAuthStore((state) => state);
	const [loading, setLoading] = useState(false);
	const [isSeller, setIsSeller] = useState(false);
	const db = getFirestore();
	const auth = getAuth();
	const user = auth.currentUser;
	const router = useRouter();

	const checkUserRole = async () => {
		if (user) {
			const userDocRef = doc(db, 'users', user.uid);
			const userDoc = await getDoc(userDocRef);
			if (userDoc.exists()) {
				const userData = userDoc.data();
				setIsSeller(userData.role === 'seller');
			}
		}
	};

	useEffect(() => {
		checkUserRole();
	}, [user, db]);

	const validationSchema = Yup.object().shape({
		storeName: Yup.string().required('Store name is required'),
	});

	const onSubmit = async (values, { resetForm }) => {
		setLoading(true);
		try {
			// Update user's role to 'seller' in the 'users' collection
			const userDocRef = doc(db, 'users', user.uid);
			updateUserInfo({ storeName: values.storeName });
			await updateDoc(userDocRef, {
				...userInfo,
				storeName: values.storeName,
				role: 'seller', // Ensure role is updated to seller
			});
			setIsSeller(true); // Update state to reflect role change
			Alert.alert('Success', 'You are now a seller!', [
				{
					text: 'OK',
					onPress: () => router.back(),
				},
			]);

			resetForm();
		} catch (error) {
			console.error('Error updating user: ', error);
			Alert.alert('Error', 'There was an error. Please try again.');
		}
		setLoading(false);
	};

	return (
		<SafeAreaView style={styles.container}>
              
              <Image 
				source={require('./../../../assets/images/KitKuText.png')}
				style={styles.image} 
				resizeMode='contain'
			/>
           
			{isSeller ? (
				<View style={styles.messageContainer}>
					<Text style={styles.messageText}>
						You are already a seller!
					</Text>
					<Button
						title='Go to Marketplace'
						onPress={() => router.back()}
					/>
				</View>
			) : (
				<Formik
					initialValues={{ storeName: '', location: '' }}
					validationSchema={validationSchema}
					onSubmit={onSubmit}
				>
					{({
						handleChange,
						handleBlur,
						handleSubmit,
						values,
						errors,
					}) => (
                        
                        
                        <View style={styles.form}>
                          
                        <Text style={styles.label}>Store Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter store name"
                            onChangeText={handleChange('storeName')}
                            onBlur={handleBlur('storeName')}
                            value={values.storeName}
                        />
                        {errors.storeName && <Text style={styles.errorText}>{errors.storeName}</Text>}

							<TouchableOpacity
								title='Add Location'
                                style={[styles.button, loading && styles.buttonDisabled]}
								onPress={() =>
									router.push('/upload/map-location')
								}>
                                    <FontAwesome6 name="map-location-dot" size={24} color="white" />
                                    <Text style={styles.buttonText}>Add Location</Text>
							</TouchableOpacity>
							{errors.location && (
								<Text style={styles.errorText}>
									{errors.location}
								</Text>
							)}

<TouchableOpacity
								onPress={handleSubmit}
								style={[styles.button, loading && styles.buttonDisabled]}
								disabled={loading}
                                
							>
								 <Text style={styles.buttonText}>Submit</Text>
								 </TouchableOpacity>
							{loading && (
								<ActivityIndicator
									size='large'
									color='#0000ff'
								/>
							)}
						</View>
					)}
				</Formik>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
   
    },
    image:{
            width:250,
            height:100,
            marginHorizontal:'auto',
    },
    form: {
        marginVertical: 20,
    },
    label: {
        fontSize: 18,
        color: Colors.dark.primary,
        marginBottom: 5,
        fontWeight:'600',
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.dark.primary,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        fontSize: 12,
    },
    button: {
        backgroundColor: '#4B7F52',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        marginBottom: 50,
        flexDirection:'row',

    },
    buttonDisabled: {
        backgroundColor: '#a5d6a7',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight:'600',
        marginHorizontal:10,
        
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
});
