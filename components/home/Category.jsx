import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet,Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';


export default function Category({ categoryList }) {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.buttonContainer}>
                    <FlatList
                        data={categoryList}
                   
                        numColumns={2}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigation.navigate('post-list', { category: item.name })}
                            >
                               <Image
            source = {{uri: item.icon}}
            style={styles.image}/>
                                <Text style={styles.buttonText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'center',
    },
    image:{
        width:20,
        height:20,
        marginRight:10,
    },
    headerContainer: {
        flexDirection: 'row',  // Ensures buttons are in a row
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',  // Ensures buttons are in a row
        justifyContent:'space-evenly',  // Evenly spaces the buttons
        paddingHorizontal: 16,  // Padding for horizontal spacing
        marginTop: 16,  // Adjust as needed
        marginBottom: 8,  // Adjust as needed
        width: '100%', 
        paddingRight:33,
      
    },
    button: {
       
        width:'50%',
        backgroundColor: Colors.dark.primary,  // Example background color
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 5, 
        marginHorizontal: 4,
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',  // Example text color
        fontSize: 18,
        fontWeight:'600',
    },
    buttonIcon:{
        marginRight:10,
    }
});
