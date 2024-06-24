import { View, Text,StyleSheet,TextInput, Button, TouchableOpacity, Image, ToastAndroid, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView} from 'react-native'
import React, { useEffect, useState } from 'react'
import { app } from '../../../firebaseConfig';
import {getFirestore,getDocs, collection, addDoc} from "firebase/firestore"

import {getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import { firebaseAuth, getAuth } from '../../../firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation,useIsFocused } from '@react-navigation/native';
import 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import InputSpinner from "react-native-input-spinner";


export default function ProcessingPostScreen() {
    const [image, setImage] = useState(null);
    const db = getFirestore();
    const storage = getStorage();
    const user = getAuth();
    const [loading, setLoading] = useState(false);
    const [categoryList, setCategoryList] = useState([]);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [ingredients, setIngredients] = useState([{ ingredient: '', quantity: 1 }]); 

    useEffect(() => {
        getCategoryList();
    }, []);

    const getCategoryList = async () => {
        setCategoryList([]);
        const querySnapshot = await getDocs(collection(db, 'Category'));
        querySnapshot.forEach((doc) => {
            setCategoryList(categoryList => [...categoryList, doc.data()]);
        });
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const removeImage = () => {
        setImage(null);
    };

    const addMoreIngredient = () => {
        setIngredients([...ingredients, { ingredient: '', quantity: 1 }]);
    };

    const handleIngredientChange = (index, field, value) => {
        let newIngredients = [...ingredients];
        
        if (field === 'quantity' && value === 0) {
            newIngredients = newIngredients.filter((_, i) => i !== index);
        } else {
            newIngredients[index][field] = value;
        }
        
        setIngredients(newIngredients);
    };

    const onSubmitMethod = async (values, resetForm) => {
        setLoading(true);
        const resp = await fetch(image);
        const blob = await resp.blob();
        const storageRef = ref(storage, 'communityPost/' + Date.now() + ".jpg");

        uploadBytes(storageRef, blob)
            .then(async (snapshot) => {
                return getDownloadURL(storageRef);
            })
            .then(async (downloadUrl) => {
                values.image = downloadUrl;
                values.userName = user.currentUser?.displayName;
                values.userEmail = user.currentUser?.email;
                values.userImage = user.currentUser?.photoURL;
                values.userUID = user.currentUser?.uid;
                values.createdAt = new Date();
                const docRef = await addDoc(collection(db, "UserPost"), values);
                if (docRef.id) {
                    setLoading(false);
                    resetForm();
                    setImage(null);
                    Alert.alert('Success!!!', 'Post Added ', [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('index'),
                        },
                    ]);
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                setLoading(false);
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView>
                <ScrollView>
                    <View>
                        <Formik
                            initialValues={{ title: '', name: '', desc: '', category: 'Library', address: '', price: '', image: '', userName: '', userEmail: '', userImage: '', createdAt: Date.now() }}
                            onSubmit={(values, { resetForm }) => onSubmitMethod(values, resetForm)}
                            validate={(values) => {
                                const errors = {}
                                if (!values.title) {
                                    ToastAndroid.show('Title Must be There', ToastAndroid.SHORT)
                                    errors.title = "Title Must be there"
                                }
                                return errors
                            }}
                        >
                            {({ handleChange, handleSubmit, values }) => (
                                <View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.navigate('index');
                                            }}
                                            style={[
                                                {
                                                    backgroundColor: isFocused ? 'white' : Colors.dark.primary,
                                                },
                                                isFocused ? styles.active_button : styles.submit_button
                                            ]}
                                            disabled={loading}
                                        >
                                            {loading ?
                                                <ActivityIndicator color={isFocused ? 'black' : '#fff'} />
                                                :
                                                <Text style={isFocused ? styles.active_button_text : styles.submit_button_text}>Library</Text>
                                            }
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.navigate('marketForm');
                                            }}
                                            style={[
                                                {
                                                    backgroundColor: loading ? '#ccc' : Colors.dark.primary,
                                                },
                                                styles.submit_button
                                            ]}
                                            disabled={loading}
                                        >
                                            {loading ?
                                                <ActivityIndicator color='#fff' />
                                                :
                                                <Text style={styles.submit_button_text}>Marketplace</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={{ fontSize: 23, fontWeight: '700', marginBottom: 12, color: Colors.dark.text }}>Recipe Details</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 17, marginVertical: 15, color: Colors.dark.text }}>Photos</Text>
                                        <Text style={{ fontSize: 17, marginVertical: 15, color: Colors.dark.text }}>0/1</Text>
                                    </View>
                                    <TouchableOpacity onPress={pickImage} style={styles.image_placeholder}>
                                        {image ? (
                                            <>
                                                <Image
                                                    source={{ uri: image }}
                                                    style={{ width: '100%', height: 200, borderRadius: 15 }}
                                                />
                                                <Text style={{ color: 'green', marginTop: 4 }}>Here is your chosen image.</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Image
                                                    source={require('./../../../assets/images/image-placeholder.png')}
                                                    style={{ width: '100%', height: 130, borderRadius: 15 }}
                                                />
                                                <Text style={{ marginTop: 4, marginBottom: 55 }}>Choose your image here !!!</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                    {image && (
                                        <TouchableOpacity onPress={removeImage} style={styles.remove_button}>
                                            <Text style={styles.remove_button_text}>Remove Image</Text>
                                        </TouchableOpacity>
                                    )}
                                    <Text style={{ fontSize: 17, color: Colors.dark.text, fontWeight: '500', marginVertical: 13 }}>Recipe Title  </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Title'
                                        value={values.title}
                                        onChangeText={handleChange('title')}
                                    />
                                    <Text style={{ fontSize: 17, color: Colors.dark.text, fontWeight: '500', marginVertical: 13 }}> Description *  </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                height: 100,
                                                textAlignVertical: 'top'
                                            }
                                        ]}
                                        placeholder='Description'
                                        value={values.desc}
                                        multiline={true}
                                        numberOfLines={5}
                                        onChangeText={handleChange('desc')}
                                    />
                                    <Text style={{ fontSize: 17, color: Colors.dark.text, fontWeight: '500', marginVertical: 13 }}> Method *  </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                height: 100,
                                                textAlignVertical: 'top'
                                            }
                                        ]}
                                        placeholder='Method'
                                        value={values.method}
                                        multiline={true}
                                        numberOfLines={5}
                                        onChangeText={handleChange('method')}
                                    />

                                    <>
                                        <Text style={{ fontSize: 17, color: Colors.dark.text, fontWeight: '500', marginVertical: 13 }}>Ingredients</Text>
                                        {ingredients.map((ingredient, index) => (
                                            <View key={index}>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Please enter your recipe ingredients."
                                                    value={ingredient.ingredient}
                                                    onChangeText={(text) => handleIngredientChange(index, 'ingredient', text)}
                                                />
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <Text style={{ marginVertical: 'auto' }}>Quantity : </Text>
                                                    <View style={{ borderColor: Colors.dark.primary, borderStyle: 'solid', borderWidth: 1, width: '50%' }}>
                                                        <InputSpinner
                                                            max={10}
                                                            min={0}
                                                            step={1}
                                                            value={ingredient.quantity}
                                                            onChange={(num) => handleIngredientChange(index, 'quantity', num)}
                                                            style={styles.spinner}
                                                            buttonLeftText={<Ionicons name="remove-outline" size={24} color={Colors.dark.primary} />}
                                                            buttonRightText={<Ionicons name="add" size={24} color={Colors.dark.primary} />}
                                                            buttonLeftStyle={styles.spinnerButton}
                                                            buttonRightStyle={styles.spinnerButton}
                                                            buttonStyle={styles.spinnerButtons}
                                                            showBorder={false}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        ))}

                                        <TouchableOpacity
                                            onPress={addMoreIngredient}
                                            style={[
                                                {
                                                    backgroundColor: loading ? '#ccc' : Colors.dark.primary,
                                                    marginTop: 25,
                                                },
                                                styles.add_button
                                            ]}
                                            disabled={loading}
                                        >
                                            {loading ?
                                                <ActivityIndicator color='#fff' />
                                                :
                                                <Text style={styles.add_button_text}>
                                                    {ingredients.length === 0 ? "Add Ingredients" : "Add more Ingredients"}
                                                </Text>
                                            }
                                        </TouchableOpacity>
                                    </>
                                    <TouchableOpacity
                                        onPress={handleSubmit}
                                        style={[
                                            {
                                                backgroundColor: loading ? '#ccc' : '#007BFF', marginTop: 25,
                                            },
                                            styles.submit_button
                                        ]}
                                        disabled={loading}
                                    >
                                        {loading ?
                                            <ActivityIndicator color='#fff' />
                                            :
                                            <Text style={styles.submit_button_text}>Submit</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Formik>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
2

const styles = StyleSheet.create({

    container: {
        backgroundColor:'#ffffff',
        paddingHorizontal: 10,
      
       
      },
    
    input:{
        borderWidth:1,
        borderRadius:10,
        padding:10,
        paddingHorizontal:17,
        marginTop:5,
        marginBottom:16,
        fontSize:13,
       
        

    },
    image_placeholder:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
       
       
    },


    remove_button_text: {
        color: 'white',
        fontSize: 16,
        
        textAlign:'center',     
    },
    remove_button: {
        padding: 14,
        backgroundColor: '#ff6666',
        borderRadius: 10,
        marginTop: 10,
        width: 150,
        marginBottom: 55,
        justifyContent:'center',
        alignContent:'center',
        marginHorizontal:'auto',
    },
    
    submit_button_text: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign:'center',     
    },
    add_button: {
        padding: 12,
        
        borderRadius: 6,
        width: '100%',
        marginBottom: 20,
        justifyContent:'center',
        alignContent:'center',
        marginHorizontal:'auto',
    },

    add_button_text: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign:'center',     
    },
    submit_button: {
        padding: 25,
        
        borderRadius: 6,
        width: 150,
        marginBottom: 55,
        justifyContent:'center',
        alignContent:'center',
        marginHorizontal:'auto',
    },

    active_button: {
        padding: 25,
        borderRadius: 6,
        width: 150,
        marginBottom: 55,
        justifyContent:'center',
        alignContent:'center',
        marginHorizontal:'auto',
        borderStyle:'solid',
        borderWidth:1,
        borderColor: Colors.dark.primary,
    },
    active_button_text: {
        color: Colors.dark.primary,
        textDecorationLine:'underline',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    spinnerButton: {
        backgroundColor: 'transparent', // No background
        borderWidth: 0, // No border
        padding: 0,
        margin:0, // No padding
    },
    spinnerButtons: {
        borderWidth: 0, // Remove border from buttons container
        backgroundColor: 'transparent',
        padding:0,
        margin:0, // Transparent background
    },

})

// export default function ProcessingPostScreen() {
//     const [image, setImage] = useState(null);
//     const db = getFirestore(app);
//     const storage = getStorage();
//     const user = getAuth();
//     const [loading, setLoading] = useState(false);
//     const [categoryList, setCategoryList] = useState([]);
//     const navigation = useNavigation();
//     const isFocused = useIsFocused();
//     const [material_number, setMaterialNumber] = useState(1);
//     const [ingredient_number, setIngredientNumber] = useState(1);
//     const [ingredients, setIngredients] = useState([{ ingredient: '', quantity: 1 }]);
// useEffect(() => {
//     getCategoryList();
// }, []);

// const getCategoryList = async () => {
//     setCategoryList([]);
//     const querySnapshot = await getDocs(collection(db, 'Category'));
//     querySnapshot.forEach((doc) => {
//         console.log("Docs:", doc.data());
//         setCategoryList(categoryList => [...categoryList, doc.data()]);
//     });
// };

// const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         quality: 1,
//     });

//     if (!result.canceled) {
//         setImage(result.assets[0].uri);
//     }
// };

// const removeImage = () => {
//     setImage(null);
// };

// const addMoreIngredient = () => {
//     setIngredients([...ingredients, { ingredient: '', quantity: 1 }]);
// };

// const handleIngredientChange = (index, field, value) => {
//     let newIngredients = [...ingredients];
    
//     if (field === 'quantity' && value === 0) {
//         newIngredients = newIngredients.filter((_, i) => i !== index);
//     } else {
//         newIngredients[index][field] = value;
//     }
    
//     setIngredients(newIngredients);
// };
// const onSubmitMethod = async (values, resetForm) => {
//     setLoading(true);
//     const resp = await fetch(image);
//     const blob = await resp.blob();
//     const storageRef = ref(storage, 'communityPost/' + Date.now() + ".jpg");

//     uploadBytes(storageRef, blob)
//         .then(async (snapshot) => {
//             console.log('Uploaded a blob or file');
//             return getDownloadURL(storageRef);
//         })
//         .then(async (downloadUrl) => {
//             console.log(downloadUrl);
//             values.image = downloadUrl;
//             values.userName = user.currentUser?.displayName;
//             values.userEmail = user.currentUser?.email;
//             values.userImage = user.currentUser?.photoURL;
//             values.userUID = user.currentUser?.uid;
//             values.createdAt = new Date(); // Set createdAt as a Date object
//             const docRef = await addDoc(collection(db, "UserPost"), values);
//             if (docRef.id) {
//                 setLoading(false);
//                 resetForm(); // Reset the form after successful upload
//                 setImage(null); // Clear selected image
//                 Alert.alert('Success!!!', 'Post Added ', [
//                     {
//                         text: 'OK',
//                         onPress: () => navigation.navigate('index'), // Navigate to Home screen
//                     },
//                 ]);
//             }
//         })
//         .catch(error => {
//             console.error('Error uploading image:', error);
//             setLoading(false);
//         });
// };

// return (
//     <SafeAreaView style={styles.container}>
//         <KeyboardAvoidingView>
//             <ScrollView>
//                 <View>

//                     <Formik
//                         initialValues={{ title: '', name: '', desc: '', category: 'Library', address: '', price: '', image: '', userName: '', userEmail: '', userImage: '', createdAt: Date.now() }}
//                         onSubmit={(values, { resetForm }) => onSubmitMethod(values, resetForm)} // Ensure resetForm is passed
//                         validate={(values) => {
//                             const errors = {}
//                             if (!values.title) {
//                                 console.log("Title not Present");
//                                 ToastAndroid.show('Title Must be There', ToastAndroid.SHORT)
//                                 errors.nname = "Title Must be there"
//                             }
//                             return errors
//                         }}
//                     >
//                         {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors }) => (
//                             <View>
//                                 <View style={{ flexDirection: 'row' }}>

//                                 <TouchableOpacity
//                                         onPress={() => {
//                                             navigation.navigate('index');
//                                         }}
//                                         style={[
//                                             {
//                                                 backgroundColor: isFocused ? 'white' : Colors.dark.primary,  // Conditionally apply styles
//                                             },
//                                             isFocused ? styles.active_button : styles.submit_button
//                                         ]}
//                                         disabled={loading}
//                                     >
//                                         {loading ?
//                                             <ActivityIndicator color={isFocused ? 'black' : '#fff'} />
//                                             :
//                                             <Text style={isFocused ? styles.active_button_text : styles.submit_button_text}>Library</Text>
//                                         }
//                                     </TouchableOpacity>

//                                     <TouchableOpacity
//                                         onPress={() => {
//                                             navigation.navigate('marketForm');
//                                         }}
//                                         style={[
//                                             {
//                                                 backgroundColor: loading ? '#ccc' : Colors.dark.primary,
//                                             },
//                                             styles.submit_button
//                                         ]}
//                                         disabled={loading}
//                                     >
//                                         {loading ?
//                                             <ActivityIndicator color='#fff' />
//                                             :
//                                             <Text style={styles.submit_button_text}>Marketplace</Text>
//                                         }
//                                     </TouchableOpacity>

                                    
//                                 </View>
//                                 <Text style={{fontSize:23, fontWeight:700, marginBottom:12,color:Colors.dark.text}}>Recipe Details</Text>
//                                 <View style={{flexDirection:'row', justifyContent:'space-between'}}>
//                                 <Text style={{fontSize:17, marginVertical:15, color:Colors.dark.text}}>Photos</Text>
//                                 <Text style={{fontSize:17, marginVertical:15, color:Colors.dark.text}}>0/1</Text>
//                                 </View>
//                                 <TouchableOpacity onPress={pickImage} style={styles.image_placeholder}>
//                                     {image ? (
//                                         <>
//                                             <Image
//                                                 source={{ uri: image }}
//                                                 style={{ width: '100%', height: 200, borderRadius: 15 }}
//                                             />
//                                             <Text style={{ color: 'green', marginTop: 4 }}>Here is your chosen image.</Text>
                                            
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Image
//                                                 source={require('./../../../assets/images/image-placeholder.png')}
//                                                 style={{ width: '100%', height: 130, borderRadius: 15, }}
//                                             />
//                                             <Text style={{ marginTop: 4, marginBottom: 55 }}>Choose your image here !!!</Text>
//                                         </>
//                                     )}

//                                 </TouchableOpacity>
//                                 {image && (
//                                     <TouchableOpacity onPress={removeImage} style={styles.remove_button}>
//                                         <Text style={styles.remove_button_text}>Remove Image</Text>
//                                     </TouchableOpacity>
//                                 )}
//                                 <Text style={{fontSize:17, color:Colors.dark.text, fontWeight:500, marginVertical:13}}>Recipe Title  </Text>
//                                 <TextInput
//                                     style={styles.input}
//                                     placeholder='Title'
//                                     value={values?.title}
//                                     onChangeText={handleChange('title')}
//                                 />
//                                  <Text style={{fontSize:17, color:Colors.dark.text, fontWeight:500, marginVertical:13}}> Description *  </Text>
//                                  <TextInput
//                                     style={[
//                                         styles.input, 
//                                         { 
//                                             height: 100, 
//                                             textAlignVertical: 'top' 
//                                         }
//                                     ]}
//                                     placeholder='Description'
//                                     value={values?.desc}
//                                     multiline={true} 
//                                     numberOfLines={5} 
//                                     onChangeText={handleChange('desc')}
//                                 />

//                                  <Text style={{fontSize:17, color:Colors.dark.text, fontWeight:500, marginVertical:13}}> Method *  </Text>
//                                  <TextInput
//                                     style={[
//                                         styles.input, 
//                                         { 
//                                             height: 100, 
//                                             textAlignVertical: 'top' 
//                                         }
//                                     ]}
//                                     placeholder='Method'
//                                     value={values?.method}
//                                     multiline={true} 
//                                     numberOfLines={5} 
//                                     onChangeText={handleChange('method')}
//                                 />

//                                <>
//                                <Text style={{fontSize:17, color:Colors.dark.text, fontWeight:500, marginVertical:13}}>Ingredients</Text>
//                             {ingredients.map((ingredient, index) => (
//                                 <View key={index}>
//                                     <TextInput
//                                         style={styles.input}
//                                         placeholder="Please enter your recipe ingredients."
//                                         value={ingredient.ingredient}
//                                         onChangeText={(text) => handleIngredientChange(index, 'ingredient', text)}
//                                     />
//                                     <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>
//                                     <Text style={{marginVertical:'auto'}}>Quantity : </Text>
                             
//                              <View style={{borderColor:Colors.dark.primary, borderStyle:'solid', borderWidth:1, width:'50%',}}>
//                                         <InputSpinner
//                                             max={10}
//                                             min={0} 
//                                             step={1}
//                                             value={ingredient.quantity}
//                                             onChange={(num) => handleIngredientChange(index, 'quantity', num)}
//                                             style={styles.spinner}
//                                             buttonLeftText={<Ionicons name="remove-outline" size={24} color={Colors.dark.primary} />}
//                                             buttonRightText={<Ionicons name="add" size={24} color={Colors.dark.primary} />}
//                                             buttonLeftStyle={styles.spinnerButton}
//                                             buttonRightStyle={styles.spinnerButton}
//                                             buttonStyle={styles.spinnerButtons}
//                                             showBorder={false}
//                                         />
//                                     </View>
//                                     </View>
//                                 </View>
//                             ))}

//                             <TouchableOpacity
//                                       onPress={addMoreIngredient}
//                                       style={[
//                                           {
//                                               backgroundColor: loading ? '#ccc' : Colors.dark.primary, marginTop:25,
//                                           },
//                                           styles.add_button
//                                       ]}
//                                       disabled={loading}
//                                   >
//                                       {loading ?
//                                           <ActivityIndicator color='#fff' />
//                                           :
//                                           <Text style={styles.add_button_text}>Add more Ingredients</Text>
//                                       }
//                                   </TouchableOpacity>

//                                   </>

                                  

                             
                          
//                                     <TouchableOpacity
//                                         onPress={handleSubmit}
//                                         style={[
//                                             {
//                                                 backgroundColor: loading ? '#ccc' : '#007BFF', marginTop:25,
//                                             },
//                                             styles.submit_button
//                                         ]}
//                                         disabled={loading}
//                                     >
//                                         {loading ?
//                                             <ActivityIndicator color='#fff' />
//                                             :
//                                             <Text style={styles.submit_button_text}>Submit</Text>
//                                         }
//                                     </TouchableOpacity>
                               
//                             </View>
//                         )}
//                     </Formik>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     </SafeAreaView>
// );
