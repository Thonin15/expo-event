import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

const CategoryPost = ({ item }) => {
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
        style={styles.imageContainer}
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
        flexDirection: 'row',
        width: windowWidth - 20, // Take up entire width with some margin
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
        fontSize: 16,
        fontFamily: 'bold',
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
    });
export default CategoryPost;
