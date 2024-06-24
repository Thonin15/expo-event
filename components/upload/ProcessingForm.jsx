import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Image,
	ToastAndroid,
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { getFirestore, getDocs, collection, addDoc } from 'firebase/firestore';

import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ProcessingForm() {
	const [image, setImage] = useState(null);
	const db = getFirestore();
	const storage = getStorage();
	const user = getAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [categoryList, setCategoryList] = useState([]);
	const isFocused = useIsFocused();
	const [hasImage, setHasImage] = useState(false); 
	const [ingredients, setIngredients] = useState([{ name: '', quantity: '' },]);
	const [materials, setMaterials] = useState([{ name: '', quantity: '' }]);

	const [equipments, setEquipments] = useState([{ name: '', quantity: '' }]);
	useEffect(() => {
		getCategoryList();
	}, []);

	const getCategoryList = async () => {
		const querySnapshot = await getDocs(collection(db, 'Category'));
		const categories = querySnapshot.docs.map((doc) => doc.data());
		setCategoryList(categories);
	};

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: false,
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
			setHasImage(true);
		}
	};

	const removeImage = () => {
		setImage(null);
		setHasImage(false);
	};

	const addIngredient = () => {
		setIngredients([...ingredients, { name: '', quantity: '' }]);
	};

	const handleIngredientChange = (index, field, value) => {
		const newIngredients = [...ingredients];
		newIngredients[index][field] = value;
		setIngredients(newIngredients);
		
	};

	const removeIngredient = (index) => {
		if (index > 0) {
            const newIngredients = [...ingredients];
            newIngredients.splice(index, 1);
            setIngredients(newIngredients);
        }
		
	};
	const addMaterial = () => {
		setMaterials([...materials, { name: '', quantity: '' }]);
	};

	const handleMaterialChange = (index, field, value) => {
		const newMaterials = [...materials];
		newMaterials[index][field] = value;
		setMaterials(newMaterials);
	};

	const removeMaterial = (index) => {
		
		if (index > 0) {
            const newMaterials = [...materials];
            newMaterials.splice(index, 1);
            setMaterials(newMaterials);
        }
	};

	const addEquipment = () => {
		setEquipments([...equipments, { name: '', quantity: '' }]);
	};

	const handleEquipmentChange = (index, field, value) => {
		const newEquipments = [...equipments];
		newEquipments[index][field] = value;
		setEquipments(newEquipments);
		
	};

	const removeEquipment = (index) => {
		if (index > 0) {
            const newEquipments = [...equipments];
            newEquipments.splice(index, 1);
            setEquipments(newEquipments);
        }
		
	};

	const onSubmitMethod = async (values, resetForm) => {
		if (!image) {
            Alert.alert('Missing Image', 'Please Upload the Image');
            setLoading(false);
            return;
        }
		setLoading(true);

		try {
			let downloadUrl = null;
			if (image) {
				const resp = await fetch(image);
				const blob = await resp.blob();
				const storageRef = ref(
					storage,
					`communityPost/${Date.now()}.jpg`
				);
				await uploadBytes(storageRef, blob);
				downloadUrl = await getDownloadURL(storageRef);
			}

			values.image = downloadUrl;
			values.userName = user.currentUser?.displayName;
			values.userEmail = user.currentUser?.email;
			values.userImage = user.currentUser?.photoURL;
			values.userUID = user.currentUser?.uid;
			values.createdAt = new Date();
			values.ingredients = ingredients.map((ingredient) => ({
				name: ingredient.name,
				quantity: ingredient.quantity,
			}));
			values.materials = materials.map((material) => ({
				name: material.name,
				quantity: material.quantity,
			}));
			values.equipments = equipments.map((equipment) => ({
				name: equipment.name,
				quantity: equipment.quantity,
			}));

			const docRef = await addDoc(collection(db, 'UserPost'), values);

			if (docRef.id) {
				resetForm();
				setImage(null);
				setIngredients([{ name: '', quantity: '' }]);
				setMaterials([{ name: '', quantity: '' }]);
				Alert.alert('Success', 'Post Added Successfully', [
					{ text: 'OK', onPress: () => router.push('/home') },
				]);
			}
		} catch (error) {
			console.error('Error adding document:', error);
			Alert.alert('Error', 'There was an error adding the post.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView style={styles.container}>
			<ScrollView>
				<View>
					<Formik
						initialValues={{
							title: '',
							desc: '',
							method: '',
							category: 'Library',
							address: '',
							price: '',
							image: '',
							userName: '',
							userEmail: '',
							userImage: '',
							createdAt: Date.now(),
						}}
						onSubmit={(values, { resetForm }) =>
							onSubmitMethod(values, resetForm)
						}
						
					>
						{({ handleChange, handleSubmit, values }) => (
							<View>
								<Text
									style={{
										fontSize: 23,
										fontWeight: '700',
										marginVertical: 13,
									}}
								>
									Recipe Details
								</Text>

								<View style={styles.row}>
									<Text style={styles.label}>Photos</Text>
									<Text style={styles.label}>{hasImage ? '1/1' : '0/1'}</Text>
								</View>
								<TouchableOpacity
									onPress={pickImage}
									style={styles.image_placeholder}
								>
									{image ? (
										<>
											<Image
												source={{ uri: image }}
												style={{
													width: '100%',
													height: 200,
													borderRadius: 15,
												}}
											/>
											<Text
												style={{
													color: 'green',
													marginTop: 4,
												}}
											>
												Here is your chosen image.
											</Text>
										</>
									) : (
										<>
										<View style={{ width: '100%',height: 130,borderRadius: 15,borderColor:Colors.dark.primary,
										               borderWidth: 1,borderStyle: 'solid',justifyContent: 'center',alignItems:'center',flexDirection:'row',
												}}>
											<Ionicons name="image" size={32} color={Colors.dark.primary}/>
											<Text style={{ fontSize: 14, fontWeight:700 }}>   Upload Image</Text>
											</View>
											<Text
												style={{
													marginTop: 4,
													marginBottom: 55,
												}}
											>
												Choose your image here!!!
											</Text>
										</>
									)}
								</TouchableOpacity>

								{image && (
									<TouchableOpacity
										onPress={removeImage}
										style={styles.remove_button_image}
									>
										<Text style={styles.remove_button_text_image}>
											Remove Image
										</Text>
									</TouchableOpacity>
								)}

								<Text
									style={{
										fontSize: 17,
										fontWeight: '500',
										marginVertical: 13,
									}}
								>
									Recipe Title
								</Text>
								<TextInput
									style={styles.input}
									placeholder='Title'
									value={values.title}
									onChangeText={handleChange('title')}
								/>

								<Text
									style={{
										fontSize: 17,
										fontWeight: '500',
										marginVertical: 13,
									}}
								>
									Description *
								</Text>
								<TextInput
									style={[
										styles.input,
										{
											height: 130,
											textAlignVertical: 'top',
										},
									]}
									placeholder='Description'
									value={values.desc}
									multiline={true}
									
									onChangeText={handleChange('desc')}
								/>

								<Text
									style={{
										fontSize: 17,
										fontWeight: '500',
										marginVertical: 13,
									}}
								>
									Method *
								</Text>
								<TextInput
									style={[
										styles.input,
										{
											height: 130,
											textAlignVertical: 'top',
										},
									]}
									placeholder='Method'
									value={values.method}
									multiline={true}
									
									onChangeText={handleChange('method')}
								/>

								<View>
									<Text
										style={{
											fontSize: 17,
											fontWeight: '500',
											marginVertical: 13,
										}}
									>
										Ingredients :
									</Text>
									{ingredients.map((ingredient, index) => (
										<View
											key={index}
											style={styles.ingredientContainer}
										>
											<TextInput
												style={[styles.ingredient_input, styles.ingredientInput]}
												placeholder='Ingredient'
												value={ingredient.name}
												onChangeText={(text) =>
													handleIngredientChange(
														index,
														'name',
														text
													)
												}
											/>
											<TextInput
												style={[styles.ingredient_input, styles.amountInput]}
												placeholder='Quantity'
												value={ingredient.quantity}
												onChangeText={(text) =>
													handleIngredientChange(
														index,
														'quantity',
														text
													)
												}
												
											/>
											<TouchableOpacity
												onPress={() =>removeIngredient(index)}
												hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
													<Text style={styles.removeText}>
														Remove
													</Text>
											</TouchableOpacity>
										</View>
									))}

									
									<TouchableOpacity
										onPress={addIngredient}
										style={[
											{
												backgroundColor: loading
													? '#ccc'
													: Colors.dark.primary,
												marginTop: 25,
											},
											styles.add_button,
										]}
										disabled={loading}
									>
										{loading ? (
											<ActivityIndicator color='#fff' />
										) : (
											<Text
												style={styles.add_button_text}
											>
												Add more Ingredients
											</Text>
										)}
									</TouchableOpacity>
								</View>

								<View>
									<Text
										style={{
											fontSize: 17,
											fontWeight: '500',
											marginVertical: 13,
										}}
									>
										Materials :
									</Text>
									{materials.map((material, index) => (
										<View
											key={index}
											style={styles.ingredientContainer}
										>
											<TextInput
												style={[styles.ingredient_input, styles.ingredientInput]}
												placeholder='Material'
												value={material.name}
												onChangeText={(text) =>
													handleMaterialChange(
														index,
														'name',
														text
													)
												}
											/>
											<TextInput
												style={[styles.ingredient_input, styles.amountInput]}
												placeholder='Quantity'
												value={material.quantity}
												onChangeText={(text) =>
													handleMaterialChange(
														index,
														'quantity',
														text
													)
												}
												
											/>
											<TouchableOpacity
												onPress={() =>removeMaterial(index)}
												hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
													<Text style={styles.removeText}>
														Remove
													</Text>
											</TouchableOpacity>
										</View>
									))}

									<TouchableOpacity
										onPress={addMaterial}
										style={[
											{
												backgroundColor: loading
													? '#ccc'
													: Colors.dark.primary,
												marginTop: 25,
											},
											styles.add_button,
										]}
										disabled={loading}
									>
										{loading ? (
											<ActivityIndicator color='#fff' />
										) : (
											<Text
												style={styles.add_button_text}
											>
												Add more Materials
											</Text>
										)}
									</TouchableOpacity>
								</View>

								<View>
									<Text
										style={{
											fontSize: 17,
											fontWeight: '500',
											marginVertical: 13,
										}}
									>
										Equipments :
									</Text>
									{equipments.map((equipment, index) => (
										<View
											key={index}
											style={styles.ingredientContainer}
										>
											<TextInput
												style={[styles.ingredient_input, styles.ingredientInput]}
												placeholder='Equipment'
												value={equipment.name}
												onChangeText={(text) =>
													handleEquipmentChange(
														index,
														'name',
														text
													)
												}
											/>
											<TextInput
												style={[styles.ingredient_input, styles.amountInput]}
												placeholder='Quantity'
												value={equipment.quantity}
												onChangeText={(text) =>
													handleEquipmentChange(
														index,
														'quantity',
														text
													)
												}
												
											/>
											<TouchableOpacity
												onPress={() =>removeEquipment(index)}
												hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
													<Text style={styles.removeText}>
														Remove
													</Text>
											</TouchableOpacity>
										</View>
									))}

									<TouchableOpacity
										onPress={addEquipment}
										style={[
											{
												backgroundColor: loading
													? '#ccc'
													: Colors.dark.primary,
												marginTop: 25,
											},
											styles.add_button,
										]}
										disabled={loading}
									>
										{loading ? (
											<ActivityIndicator color='#fff' />
										) : (
											<Text
												style={styles.add_button_text}
											>
												Add more Equipments
											</Text>
										)}
									</TouchableOpacity>
								</View>

								<TouchableOpacity
									onPress={handleSubmit}
									style={[
										{
											backgroundColor: loading
												? '#ccc'
												: Colors.dark.primary,
											marginTop: 25,
										},
										styles.submit_button,
									]}
									disabled={loading}
								>
									{loading ? (
										<ActivityIndicator color='#fff' />
									) : (
										<Text style={styles.submit_button_text}>
											Submit
										</Text>
									)}
								</TouchableOpacity>
							</View>
						)}
					</Formik>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#ffffff',
		paddingHorizontal: 10,
		marginBottom: 200,
	},

	input: {
		borderWidth: 1,
		borderRadius: 10,
		padding: 10,
		paddingHorizontal: 17,
		marginTop: 5,
		marginBottom: 16,
		fontSize: 13,
	},
	image_placeholder: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		
	},
	submit_button_text: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
		textAlign: 'center',
	},
	add_button: {
		padding: 12,
		borderRadius: 6,
		width: '48%',
		marginBottom: 20,
		justifyContent: 'center',
		alignContent: 'center',
		marginHorizontal: 'auto',
	},

	add_button_text: {
		color: 'white',
		
		fontSize: 14,
		textAlign: 'center',
	},
	submit_button: {
		padding: 15,
		marginTop:60,
		borderRadius: 6,
		width: '70%',
		marginBottom: 55,
		justifyContent: 'center',
		alignContent: 'center',
		marginHorizontal: 'auto',
	},

	active_button: {
		padding: 25,
		borderRadius: 6,
		width: 150,
		marginBottom: 55,
		justifyContent: 'center',
		alignContent: 'center',
		marginHorizontal: 'auto',
		borderStyle: 'solid',
		borderWidth: 1,
		borderColor: Colors.dark.primary,
	},
	active_button_text: {
		color: Colors.dark.primary,
		textDecorationLine: 'underline',
		fontWeight: 'bold',
		fontSize: 16,
		textAlign: 'center',
	},
	spinnerButton: {
		backgroundColor: 'transparent', 
		borderWidth: 0, 
		padding: 0,
		margin: 0, 
	},
	spinnerButtons: {
		borderWidth: 0, 
		backgroundColor: 'transparent',
		padding: 0,
		margin: 0, 
	},
	ingredientContainer: {
        flexDirection: 'row', 
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: Colors.dark.primary,
    },
    ingredient_input: {
        flex: 1,
        marginRight: 5,
    },
    ingredientInput: {
        marginRight: 5,
    },
    amountInput: {
        marginRight: 5,
    },
    numberInput: {
        width: 60,
    },

	remove_button_image:{

		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	remove_button_text_image:{
		color: 'red',
		marginVertical:15,
		borderColor:'red',
		borderWidth:1,
		paddingHorizontal:12,
		paddingVertical:8,
		borderRadius:8,
		textAlign:'center',
		width:'50%',
	},
    removeText: {
        color: 'red',
        marginLeft: -50,
		borderColor:'red',
		borderWidth:1,
		paddingHorizontal:8,
		paddingVertical:4,
		borderRadius:8,
    },

	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 15,
	  },
	  label: {
		fontSize: 17,
	  },
   
});
