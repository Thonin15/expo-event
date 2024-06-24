import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { getFirestore, getDocs, collection, addDoc } from 'firebase/firestore';
import { getAuth } from '../../firebaseConfig';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function MarketForm() {
  const router = useRouter();
  const db = getFirestore();
  const storage = getStorage();
  const user = getAuth().currentUser;
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [image, setImage] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [currency, setCurrency] = useState('៛');
  const [hasImage, setHasImage] = useState(false); 

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = async () => {
    setCategoryList([]);
    try {
      const querySnapshot = await getDocs(collection(db, 'Category'));
      const categories = querySnapshot.docs.map((doc) => doc.data());
      setCategoryList(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setHasImage(true); // Set hasImage to true when an image is selected
    }
  };

  const removeImage = () => {
    setImage(null);
    setHasImage(false); // Reset hasImage to false when image is removed
  };

  const onSubmitMethod = async (values, resetForm) => {
    setLoading(true);
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const storageRef = ref(storage, `communityPost/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      values.image = downloadUrl;
      values.userName = user?.displayName;
      values.userEmail = user?.email;
      values.userImage = user?.photoURL;
      values.userUID = user?.uid;
      values.createdAt = new Date();
      values.currency = currency; 

      const docRef = await addDoc(collection(db, 'UserPost'), values);

      if (docRef.id) {
        resetForm();
        setImage(null);
        setHasImage(false); 
        Alert.alert('Success!', 'Post Added', [
          { text: 'OK', onPress: () => router.push('/upload') },
        ]);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView>
        <ScrollView>
          {showForm && (
            <View>
              <Formik
                initialValues={{
                  title: '',
                  name: '',
                  desc: '',
                  category: 'Marketplace',
                  address: '',
                  price: '', // Ensure price is here
                  image: '',
                  userName: '',
                  quantity: '', 
                  userEmail: '',
                  userImage: '',
                  createdAt: Date.now(),
                }}
                onSubmit={(values, { resetForm }) =>
                  onSubmitMethod(values, resetForm)
                }
                validate={(values) => {
                  const errors = {};
                  if (!values.title) {
                    errors.title = 'Title is required';
                  }
                  return errors;
                }}
              >
                {({ handleChange, handleSubmit, values }) => (
                  <View>
                    <Text style={styles.sectionTitle}>Product Details</Text>

                    <View style={styles.row}>
                      <Text style={styles.label}>Photos</Text>
                      <Text style={styles.label}>{hasImage ? '1/1' : '0/1'}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={pickImage}
                      style={styles.imagePlaceholder}
                    >
                      {image ? (
                        <>
                          <Image
                            source={{ uri: image }}
                            style={styles.image}
                          />
                          <Text style={styles.greenText}>
                            Here is your chosen image.
                          </Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.imageUploadBox}>
                            <Ionicons
                              name="image"
                              size={32}
                              color={Colors.dark.primary}
                            />
                            <Text style={styles.imageUploadText}>
                              Upload Image
                            </Text>
                          </View>
                          <Text style={styles.chooseImageText}>
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

                    <Text style={{ fontSize: 17, fontWeight: '500', marginVertical: 13 }}>
                      Post Title:
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Title"
                      value={values.title}
                      onChangeText={handleChange('title')}
                    />

                    <Text style={{ fontSize: 17, fontWeight: '500', marginVertical: 13 }}>
                      Price:
                    </Text>
                    <View style={styles.priceInputContainer}>
                      <View style={styles.priceInputBox}>
                        <TextInput
                          style={styles.priceInput}
                          onChangeText={handleChange('price')} // Use handleChange from Formik
                          value={values.price} // Bind to Formik's value
                          keyboardType="numeric"
                          placeholder="Price"
                        />
                      </View>
                      <View style={styles.pricePickerContainer}>
                        <Picker
                          selectedValue={currency}
                          style={styles.pricePicker}
                          onValueChange={(itemValue, itemIndex) =>
                            setCurrency(itemValue)
                          }
                        >
                          <Picker.Item label="៛ KHR" value="៛" />
                          <Picker.Item label="$ USD" value="$" />
                        </Picker>
                      </View>
                    </View>

                    <Text style={{ fontSize: 17, fontWeight: '500', marginVertical: 13 }}>
                      Quantity:
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Quantity"
                      value={values.quantity}
                      onChangeText={handleChange('quantity')}
                    />

                    <Text style={{ fontSize: 17, fontWeight: '500', marginVertical: 13 }}>
                      Description:
                    </Text>
                    <TextInput
                      style={[styles.input, { height: 130, textAlignVertical: 'top' }]}
                      placeholder='Description'
                      value={values.desc}
                      multiline={true}
                      onChangeText={handleChange('desc')}
                    />

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
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    marginBottom: 200,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '700',
    marginVertical: 10,
	
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 17,
  },
  imagePlaceholder: {
    alignItems: 'center',
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  greenText: {
    color: 'green',
    marginTop: 4,
  },
  imageUploadBox: {
    width: '100%',
    height: 130,
    borderRadius: 15,
    borderColor: Colors.dark.primary,
    borderWidth: 1,
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chooseImageText: {
    marginTop: 4,
    marginBottom: 55,
  },
  removeButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  removeButtonText: {
    color: 'red',
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
  priceInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceInputBox: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 10,
  },
  pricePickerContainer: {
    width: 125,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricePicker: {
    height: 50,
    width: 125,
  },
  submit_button: {
    padding: 15,
    marginTop: 60,
    borderRadius: 6,
    width: '70%',
    marginBottom: 55,
    justifyContent: 'center',
    alignContent: 'center',
    marginHorizontal: 'auto',
  },
  submit_button_text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  remove_button_image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remove_button_text_image: {
    color: 'red',
    marginVertical: 15,
    borderColor: 'red',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center',
    width: '50%',
  },
});
