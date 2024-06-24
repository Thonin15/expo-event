import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, Text, StyleSheet, Image, TouchableOpacity,Dimensions } from 'react-native';
import { getFirestore, query, collection, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Category from '@/components/home/Category';
import { Colors } from '@/constants/Colors';
import Marketplace from '@/components/home/testhome';

const windowWidth = Dimensions.get('window').width;
export default function MyProducts() {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [productList, setProductList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Library'); // New state for selected category

  // Fetch user posts when the component mounts or when the user changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (auth.currentUser) {
        getUserPost();
      }
    });
    
    return unsubscribe;
  }, [navigation, auth.currentUser]);

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []);

  const fetchData = async () => {
    await getCategoryList();
  };

  const getCategoryList = async () => {
    try {
      const categories = [];
      const querySnapshot = await getDocs(collection(db, 'Category'));
      querySnapshot.forEach((doc) => {
        categories.push(doc.data());
      });
      setCategoryList(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getUserPost = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        if (userEmail) {
          const q = query(collection(db, 'UserPost'), where('userEmail', '==', userEmail));
          const snapshot = await getDocs(q);
          const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProductList(posts);
        }
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  // Refresh control handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserPost().finally(() => setRefreshing(false));
  }, []);

  // Render each item in the FlatList
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemcontainer}
      onPress={() =>
        navigation.navigate('product-detail', {
          product: item
        })
      }
    >
      {item.image ? (
        <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        </View>
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}
      <View style={styles.content}>
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.title}>{item.title}</Text>
      <Text style={styles.productCategory}>{item.category}</Text>
      

      </View>
    </TouchableOpacity>
  );

  // Filter posts based on selected category
  const filteredProductList = productList.filter(item => item.category === selectedCategory); // Highlighted change

  // Render header for the FlatList


  // Highlighted change: Buttons for category selection
  const renderCategoryButtons = () => (
    <View style={styles.categoryButtonContainer}>
      <TouchableOpacity
        style={[styles.categoryButton, selectedCategory === 'Library' && styles.selectedCategoryButton]}
        onPress={() => setSelectedCategory('Library')}
      >
        <Text style={[styles.categoryButtonText, selectedCategory === 'Library' && styles.selectedCategoryButtonText]}
        onPress={() => setSelectedCategory('Library')}>Library</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.categoryButton, selectedCategory === 'Marketplace' && styles.selectedCategoryButton]}
        onPress={() => setSelectedCategory('Marketplace')}
      >
        <Text  style={[styles.categoryButtonText, selectedCategory === 'Marketplace' && styles.selectedCategoryButtonText]}
        onPress={() => setSelectedCategory('Marketplace')} >Marketplace</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {renderCategoryButtons() /* Highlighted change: Render category buttons */}
      <FlatList
        data={filteredProductList} // Use filtered products list based on category
       
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
       
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.flatListContainer}
      />
   
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  flatListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  headerContainer: {
    marginBottom: 15,
  },
  loaderContainer: {
    height: Dimensions.get('window').height,  // Ensure it takes the full height of the screen
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentContainer: {
    paddingBottom: 10,
  },
  itemcontainer: {
    flexDirection: 'row',
    width:windowWidth - 20,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',

  },
  imageContainer: {
    width: windowWidth / 2.5, // Adjust based on your layout needs
    height: 160, // Adjust based on your layout needs
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,

    padding: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 5,
    
  },
  category: {
    fontSize: 12,
    color: 'black',
    marginBottom: 5,
    fontFamily: 'regular',
  },
  price: {
    fontSize: 16,
    color: 'green',
    fontFamily: 'bold',
  },
  method: {
    fontSize: 12,
    fontFamily: 'regular',
    marginTop: 5,
  },
  noImageContainer: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  noImageText: {
    color: '#757575',
  },

  productCategory: {
    fontSize: 15,
    color: 'gray',
    marginBottom: 5,
    fontWeight:'500',
  },
  categoryButtonContainer: { // Highlighted change: Styles for category button container
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  categoryButton: { // Highlighted change: Styles for category button
    flex: 1,
    paddingVertical: 20,
    backgroundColor: Colors.dark.primary,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedCategoryButton: { // Highlighted change: Styles for selected category button
    backgroundColor: 'white',
    color:Colors.dark.primary,
    borderWidth:1,
    borderColor:Colors.dark.primary,
  },
  categoryButtonText: { // Highlighted change: Styles for category button text
    fontSize: 16,
    fontWeight: 'bold',
    color:'white',
  },
  selectedCategoryButtonText: { // Highlighted change: Styles for category button text
    fontSize: 16,
    fontWeight: 'bold',
    color:Colors.dark.primary,
  },
});
