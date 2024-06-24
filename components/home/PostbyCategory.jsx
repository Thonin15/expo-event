import React from 'react';
import { View, FlatList,StyleSheet,Dimensions } from 'react-native';

import CategoryPost from './CategoryPost';

const PostbyCategory = ({ latestItemList }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={latestItemList}
               
                renderItem={({ item }) => <CategoryPost item={item} />}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.flatListContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fafafa',
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
  });
  

export default PostbyCategory;
