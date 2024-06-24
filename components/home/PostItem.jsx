import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

const PostItem = ({ item }) => {
  const navigation = useNavigation();
  
  const formatNumberWithCommas = (number) => {
    const numStr = String(number);
    const parts = numStr.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length === 2 ? integerPart + '.' + parts[1] : integerPart;
  };
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.push('product-detail', {
          product: item
        })
      }
      style={styles.container}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>{item.title}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {/* Conditionally render the price if it exists */}
        {item.price ? (
          <Text style={styles.price}>{formatNumberWithCommas(item.price)} {item.currency} </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: windowWidth / 2 - 20,
    height: 250,
    margin: 5,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  category: {
    fontSize: 12,
    color: 'black',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
});

export default PostItem;
