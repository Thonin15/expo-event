import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator,StyleSheet,Dimensions, SafeAreaView,TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import PostbyCategory from '@/components/home/PostbyCategory';
import { Colors } from '@/constants/Colors';

export default function ItemList() {
    const { params } = useRoute();
    const db = getFirestore(app);
    const [itemList, setItemList] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();
    useEffect(() => {
        if (params?.category) {
            getItemListByCategory();
        }
    }, [params]);

    const getItemListByCategory = async () => {
        try {
            setLoading(true);
            setItemList([]);
            const q = query(collection(db, 'UserPost'), where('category', '==', params.category));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => doc.data());
            setItemList(items);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching items:', error);
            setLoading(false);
        }
    };

    return (

        <SafeAreaView  style={styles.container}>
            <View style={styles.smallContainer}>
            <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.icon}>
      <Ionicons name='chevron-back-circle' size={30} color='white'/>
      </TouchableOpacity>
            <Text style={styles.text}>Explore Page
            </Text>
            </View>
            {loading ?
                <ActivityIndicator size='large' />
                :
                itemList?.length > 0 ?
                    <PostbyCategory latestItemList={itemList} />
                    :
                    <Text className="p-5">No Post Found</Text>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.dark.primary,
    
    },
    smallContainer:{
        marginVertical:35, 
       
    },
    icon:{
        position:'absolute',
        marginLeft:5,
    },
    text:{
        fontSize: 22,
        fontWeight:'700',
        color:'white',
        textAlign:'center',
        marginHorizontal:'auto',
       
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