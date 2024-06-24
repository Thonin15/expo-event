import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Search() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = () => {
  
    navigation.navigate('Search', { searchTerm });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder='Search'
          style={styles.searchInput}
          onChangeText={setSearchTerm} 
          onSubmitEditing={handleSearch}
          returnKeyType="search" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 10,
  },
  searchContainer: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
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
});
