import { Colors } from '@/constants/Colors';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';

const UserCard = ({ userData, userPosts, onClose }) => {
  return (
    <View style={styles.card}>
    
      <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
    <View style={styles.smallcon}>
      <Image
            source = {{uri: userData.photoURL}}
            style={styles.imageprof}/>
      <Text style={styles.title}>{userData.displayName}</Text>
      </View>
      <Text style={styles.detail}>Email: {userData.email}</Text>
      {userData?.phoneNumber ? (
      <Text style={styles.detail}>Phone Number: {userData.phoneNumber}</Text>
      ):null}
        {userData?.storeName ? (
      <Text style={styles.detail}>Store Name: {userData.storeName}</Text>
    ):null}
    
      <Text style={styles.postsTitle}>User Posts:</Text>
      
      <ScrollView style={styles.postsContainer}>
       
        {userPosts.map((post, index) => (
          <View key={index} style={styles.postContainer}>
            <Image
              source={{ uri: post.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.postTitle}>{post.title}</Text>
          
           
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'relative',
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  smallcon:{
flexDirection:'row',

  },
  imageprof:{ 
    width:60,

    borderRadius:50,
    height:60,
  },
  closeButtonText: {
    fontSize: 19,
    color: '#f00',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft:5,
    marginVertical:16,
  },
  detail: {
    fontSize: 16,
    marginVertical: 5,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 7,
    marginBottom: 5,
  },
  postsContainer: {
    maxHeight: 90, // Limit the height of the posts section to prevent overflow
    marginTop: 5,
  },
  postContainer: {
    marginBottom: 10,
    flexDirection:'row',
    alignContent:'center',
    borderWidth:1,
    borderColor:Colors.dark.primary,
  },
  postTitle: {
    marginLeft:5,
    paddingTop:10,
    fontSize: 14,
    marginVertical: 2,
    fontWeight: 'bold',
    textAlign:'start',
    width:'48%',
    
  },
  image: {
  
    width: '50%',
    height: 100, // Set a fixed height for images
    borderRadius: 10,
    margin: 5,
  },
});

export default UserCard;
