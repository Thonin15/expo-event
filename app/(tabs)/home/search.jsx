import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import PostItem from '@/components/home/PostItem';
import { Colors } from '@/constants/Colors';

export default function SearchScreen({ route, navigation }) {
  const [searchTerm, setSearchTerm] = useState(route.params?.searchTerm || '');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [initialSearch, setInitialSearch] = useState(true); // Track if it's the initial search

  useEffect(() => {
    if (route.params?.searchTerm) {
      setInitialSearch(true); // Flag for initial search
      fetchPosts(route.params.searchTerm);
    } else {
      setLoading(false);
    }
  }, [route.params?.searchTerm]);

  const fetchPosts = async (term) => {
    setLoading(true);
    const db = getFirestore();
    const postsRef = collection(db, 'UserPost'); // Replace with your collection name

    try {
      const querySnapshot = await getDocs(postsRef);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filteredPosts = data.filter(post => 
        post.title?.toLowerCase().includes(term.toLowerCase()) ||
        (post.ingredients && post.ingredients.some(ingredient => 
          ingredient.name && ingredient.name.toLowerCase().includes(term.toLowerCase())
        )) ||
        (post.materials && post.materials.some(material => 
          material.name && material.name.toLowerCase().includes(term.toLowerCase())
        ))||
        (post.equipments && post.equipments.some(equipment => 
          equipment.name && equipment.name.toLowerCase().includes(term.toLowerCase())
        ))
      );

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setInitialSearch(false); // Reset the flag after the initial search
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      fetchPosts(searchTerm);
    }
  };

  const handleSubmitEditing = () => {
    handleSearch();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search.....'
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSubmitEditing} // Only search on Enter or button press
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Search Results for "{searchTerm}"</Text>
      {posts.length === 0 ? (
        <Text>No posts found</Text>
      ) : (
        <FlatList
          data={posts}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostItem item={item} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  searchButton: {
    padding: 10,
    backgroundColor: Colors.dark.primary,
    borderRadius: 20,
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 22,
  },
});
