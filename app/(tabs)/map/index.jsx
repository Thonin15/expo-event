import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { firestore } from '../../../firebaseConfig'; 
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import UserCard from '@/components/upload/UserCard';
import { Ionicons } from '@expo/vector-icons';

const MapScreen = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [cardVisible, setCardVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUserLocations();
  }, []);

  const fetchUserLocations = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(firestore, 'user_location'));
      const locationsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocations(locationsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user locations:', error);
      Alert.alert('Failed to fetch user locations.');
      setLoading(false);
    }
  };

  const handleSearch = async () => {
	if (searchTerm.trim() === '') {
	  fetchUserLocations(); // Fetch all locations if search term is empty
	  return;
	}
  
	try {
	  setLoading(true);
  
	  const postsQuery = query(
		collection(firestore, 'UserPost'),
		where('title', '>=', searchTerm),
		where('title', '<=', searchTerm + '\uf8ff')
	  );
	  const postsSnapshot = await getDocs(postsQuery);
  
	  const userUIDs = new Set();
	  postsSnapshot.forEach(doc => {
		const postData = doc.data();
		if (postData.title.toLowerCase().includes(searchTerm.toLowerCase())) {
		  userUIDs.add(postData.userUID);
		}
	  });
  
	  if (userUIDs.size === 0) {
		// If no userUIDs found, display all locations or handle as needed
		setLocations([]); // Display no locations or all locations
		setLoading(false);
		return;
	  }
  
	  const locationsQuery = query(collection(firestore, 'user_location'), where('user_uid', 'in', Array.from(userUIDs)));
	  const locationsSnapshot = await getDocs(locationsQuery);
	  const filteredLocations = locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
	  setLocations(filteredLocations);
	  setLoading(false);
	} catch (error) {
	  console.error('Error fetching search results:', error);
	  Alert.alert('Failed to fetch search results.');
	  setLoading(false);
	}
  };
  

  const fetchUserInfo = async (user_uid) => {
    try {
      setFetching(true);

      const userDocRef = doc(firestore, 'users', user_uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        Alert.alert('User not found');
        setFetching(false);
        return;
      }

      const userData = userDocSnapshot.data();

      const userPostQuerySnapshot = await getDocs(
        query(collection(firestore, 'UserPost'), where('userUID', '==', user_uid))
      );

      const userPosts = userPostQuerySnapshot.docs.map(doc => doc.data());

      setSelectedUser(userData);
      setSelectedPosts(userPosts);
      setFetching(false);
      setCardVisible(true);
    } catch (error) {
      console.error('Error fetching user information:', error);
      Alert.alert('Failed to fetch user information.');
      setFetching(false);
    }
  };

  const handleMarkerPress = (user_uid) => {
    fetchUserInfo(user_uid);
  };

  const closeUserCard = () => {
    setCardVisible(false);
    setSelectedUser(null);
    setSelectedPosts([]);
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchUserLocations();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search here..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Ionicons name="search-outline" size={24} color="black" />
        </TouchableOpacity>
        {/* {searchTerm !== '' && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )} */}
      </View>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 11.55798,
          longitude: 104.912692,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            onPress={() => handleMarkerPress(location.user_uid)}
          >
            <Image
              source={require('../../../assets/images/map_pin.png')}
              style={styles.markerImage}
            />
          </Marker>
        ))}
      </MapView>

      {cardVisible && (
        <View style={styles.cardContainer}>
          {fetching ? (
            <View style={styles.cardLoading}>
              <ActivityIndicator size="small" color="#000" />
              <Text>Loading...</Text>
            </View>
          ) : (
            <UserCard
              userData={selectedUser}
              userPosts={selectedPosts}
              onClose={closeUserCard}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchContainer: {
    position: 'absolute',
    top: 35,
    left: 10,
    right: 10,
    zIndex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
   
    
    paddingLeft: 10,
    borderRadius: 5,
    marginRight: 10,
    
  },
  searchButton: {
    
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  clearButton: {
    marginLeft: 10,
    backgroundColor: '#FF5733',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    
    backgroundColor: 'white',
    borderRadius: 10,

    elevation: 5,
  },
  cardLoading: {
    alignItems: 'center',
  },
});

export default MapScreen;
