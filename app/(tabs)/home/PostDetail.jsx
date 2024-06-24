import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Alert, Share, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFirestore, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../firebaseConfig';
import { COLORS, SIZES } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function PostDetail() {
    const [product, setProduct] = useState({});
    const [allPosts, setAllPosts] = useState([]);
    const [multiPostIngredients, setMultiPostIngredients] = useState(new Set());
    const [multiPostMaterials, setMultiPostMaterials] = useState(new Set());
    const [multiPostEquipment, setMultiPostEquipment] = useState(new Set());
    const [materialsInTitles, setMaterialInTitles] = useState(new Set()); 
    const [ingredientsInTitles, setIngredientsInTitles] = useState(new Set()); 
    const [equipmentsInTitles, setEquipmentsInTitles] = useState(new Set()); // New state to track ingredients in titles
    const navigation = useNavigation();
    const { params } = useRoute();
    const user = getAuth().currentUser;
    const db = getFirestore(app);

    useEffect(() => {
        if (params) {
            setProduct(params.product);
        }
        fetchAllPosts();
    }, [params]);

    const formatNumberWithCommas = (number) => {
        const numStr = String(number);
        const parts = numStr.split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.length === 2 ? integerPart + '.' + parts[1] : integerPart;
    };

    const fetchAllPosts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'UserPost'));
            const posts = querySnapshot.docs.map(doc => doc.data());
            setAllPosts(posts);
            computeMultiPostItems(posts);
        } catch (error) {
            console.error('Error fetching all posts:', error);
        }
    };

    const computeMultiPostItems = (posts) => {
        const ingredientCount = {};
        const materialCount = {};
        const equipmentCount = {};
        const ingredientsInTitlesSet = new Set(); // Initialize set for ingredients in titles
        const materialsInTitlesSet = new Set();
        const equipmentsInTitlesSet = new Set();
        posts.forEach(post => {
            post.ingredients?.forEach(item => {
                const itemName = item.name.trim().toLowerCase();
                if (itemName) {
                    ingredientCount[itemName] = (ingredientCount[itemName] || 0) + 1;

                    // Check if the ingredient appears in any post title
                    posts.forEach(p => {
                      if (p.title.toLowerCase().includes(itemName) && p !== post) {
                            ingredientsInTitlesSet.add(itemName); // Add ingredient to set if found in title
                        }
                    });
                }
            });
            post.materials?.forEach(item => {
                const itemName = item.name.trim().toLowerCase();
                if (itemName) {
                    materialCount[itemName] = (materialCount[itemName] || 0) + 1;
                    posts.forEach(p => {
                      if (p.title.toLowerCase().includes(itemName) && p !== post) {
                          materialsInTitlesSet.add(itemName); // Add ingredient to set if found in title
                      }
                  });
                }
            });
            post.equipments?.forEach(item => {
                const itemName = item.name.trim().toLowerCase();
                if (itemName) {
                    equipmentCount[itemName] = (equipmentCount[itemName] || 0) + 1;
                }
                posts.forEach(p => {
                  if (p.title.toLowerCase().includes(itemName) && p !== post) {
                     equipmentsInTitlesSet.add(itemName); // Add ingredient to set if found in title
                  }
              });
            });
        });

        const multiPostIngredientsSet = new Set(Object.keys(ingredientCount).filter(item => ingredientCount[item] > 1));
        const multiPostMaterialsSet = new Set(Object.keys(materialCount).filter(item => materialCount[item] > 1));
        const multiPostEquipmentSet = new Set(Object.keys(equipmentCount).filter(item => equipmentCount[item] > 1));

        setMultiPostIngredients(multiPostIngredientsSet);
        setMultiPostMaterials(multiPostMaterialsSet);
        setMultiPostEquipment(multiPostEquipmentSet);
        setIngredientsInTitles(ingredientsInTitlesSet);
        setEquipmentsInTitles(equipmentsInTitlesSet);
        setMaterialInTitles(materialsInTitlesSet); 
    };

    const handleItemPress = (item, type) => {
        navigation.navigate('Search', { searchTerm: item, searchType: type });
    };

    const shareProduct = async () => {
        const content = {
            message: `${product.title}\n${product.desc}`,
        };
        Share.share(content).then(resp => {
            console.log(resp);
        }).catch(error => {
            console.log(error);
        });
    };

    const sendEmailMessage = () => {
        const subject = `Regarding ${product.title}`;
        const body = `Hi ${product.userName}\nI am interested in this product`;
        Linking.openURL(`mailto:${product.userEmail}?subject=${subject}&body=${body}`);
    };

    const deleteUserPost = () => {
        Alert.alert('Do you want to delete this Post?', 'Are you sure?', [
            {
                text: 'Yes',
                onPress: deleteFromFirebase,
            },
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
        ]);
    };

    const deleteFromFirebase = async () => {
        const q = query(collection(db, 'UserPost'), where('title', '==', product.title));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            deleteDoc(doc.ref).then(resp => {
                console.log('Deleted the Post..');
                navigation.goBack();
            });
        });
    };

    const renderItem = (data, multiPostSet, type) => (
        data.map((item, index) => {
            const itemName = item.name.trim().toLowerCase();
            const isClickable = multiPostSet.has(itemName) || ingredientsInTitles.has(itemName) || materialsInTitles.has(itemName) || equipmentsInTitles.has(itemName); // Check both conditions

            return (
                <View key={index} style={styles.ingredientWrapper}>
                    {isClickable ? (
                        <TouchableOpacity onPress={() => handleItemPress(item.name, type)}>
                            <Text style={styles.clickableIngredient}>{item.name} !! Click Here !!</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text>{item.name}</Text>
                    )}
                    <Text style={{ textTransform: 'uppercase', fontWeight: '700' }}>{item.quantity}</Text>
                </View>
            );
        })
    );
  
  
  return (
    <FlatList
      ListHeaderComponent={() => (
       
         <View style={styles.container}>
        <View style={styles.upperRow}>
            <TouchableOpacity onPress={()=>navigation.goBack()}>
      <Ionicons name='chevron-back-circle' size={30}/>
      </TouchableOpacity>
      
      </View>

     
      
          {product.image ? (
            <Image
            source = {{uri: product.image}}
            style={styles.image}/>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
           <View style={styles.details}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>{product?.title}</Text>
                <View style={styles.priceWrapper} >
                {product?.price ? (
          <Text style={styles.price}>{formatNumberWithCommas(product.price)}</Text>
                  ) : null}
                    </View>
                    </View>
                    <View style={styles.descriptionWrapper}>
            <Text style={styles.productCategory}>{product?.category}</Text>

            <Text style={styles.description} >Description : </Text>
            {product?.desc ? (
            <Text style={styles.productDescription}>{product?.desc}</Text>
            ):  <Text style={styles.productDescription}>N/A</Text>}

            {product?.method ? (
              <>
                <Text style={styles.description}>Method:</Text>
                <Text style={styles.productDescription}>{product.method}</Text>
              </>
            ) : null}

            <Text style={styles.productDescription}>{product?.method}</Text>
         
        </View>
        </View>
        </View>
      )}
    



      
  
      data={[]}
      keyExtractor={(item, index) => index.toString()}
      renderItem={null}
      ListFooterComponent={() => (
        <View style={[styles.container, { marginLeft: 5 }]}>
           {product?.ingredients ? (
            <>
          <Text style={styles.ingredients} >Ingredients : </Text>
          {renderItem(product?.ingredients || [], multiPostIngredients, 'ingredient')}
          </>
           ):null}

             {product?.materials ? (
            <>
          <Text style={styles.ingredients} >Materials : </Text>
          {renderItem(product?.materials || [], multiPostMaterials, 'material')}
          </>
        ):null}


        {product?.equipments ? (
            <>
          <Text style={styles.ingredients} >Equipment : </Text>
          {renderItem(product?.equipments || [], multiPostEquipment, 'equipment')}
          </>
        ):null}
          <View style={styles.userProfile}>
            <Text style={styles.userProfileTitle}>Owner Post</Text>
            {product.userImage ? (
              <Image source={{ uri: product.userImage }} style={styles.userImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <Text style={styles.userName}>{product.userName}</Text>
            <Text style={styles.userEmail}>{product.userEmail}</Text>
          </View>

          {user?.email === product.userEmail ? (
            <TouchableOpacity
              onPress={deleteUserPost}
              style={[styles.button, styles.deleteButton]}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={sendEmailMessage}
              style={[styles.button, styles.messageButton]}
            >
              <Text style={styles.buttonText}>Send Message</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}


const styles= StyleSheet.create({
  container:{
      flex:1,
      backgroundColor: COLORS.lightWhite,
  },
  upperRow:{
      marginHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems:"center",
      position: "absolute",
      top: SIZES.xxLarge,
      width: SIZES.width -44,
      zIndex: 999,
     

  },
  image: {
      aspectRatio: 1,
      resizeMode: "cover"
  },
  details: {
      marginTop: -SIZES.large,
      backgroundColor: COLORS.lightWhite,
      width: SIZES.width,
      borderTopLeftRadius: SIZES.medium-6,
      borderTopRightRadius: SIZES.medium-6,
  },
  titleRow:{
      marginHorizontal:5,
      paddingBottom: SIZES.small,
      flexDirection:"row",
      justifyContent:"space-between",
      alignItems: "center",
      width: SIZES.width -14,
      top: 20,
  },
  title:{
      fontWeight:'800',
      fontSize: SIZES.large,
      width:'70%',
      color:Colors.dark.primary,
      letterSpacing:0.8,
   
  },
  price: {
      paddingHorizontal: 10,
      fontFamily: "semibold",
      fontSize: SIZES.large,

  },
  productCategory:{
    fontSize: SIZES.large-1,
    letterSpacing:1.2,
    color:'#8C8C8C',
    marginTop:-24,
    marginBottom:25,
    fontWeight:'400',
  },
  priceWrapper:{
      backgroundColor: Colors.dark.primary,
      borderRadius: SIZES.large-12,
  },
  descriptionWrapper:{
      marginTop: SIZES.large*2,
      marginHorizontal: 5,
  },
  description: {
    fontSize: SIZES.large-1,
    letterSpacing:1.2,
    marginBottom:8,
    fontWeight:'600',
  },
  productDescription:{
    fontFamily:"medium",
    fontSize: SIZES.large-4,
    marginBottom:30,
  },
  ingredientWrapper:{

    marginRight:5,
    flexDirection:'row',
    justifyContent: 'space-between',
    marginVertical:7,
    paddingBottom:4,
    marginRight:40,
    borderBottomColor:Colors.dark.primary,
    borderBottomWidth:1,
  },
  ingredients:{
    fontSize: SIZES.large-1,
    letterSpacing:1.2,
    marginBottom:8,
    marginTop:30,
    fontWeight:'600',
  },
  descText:{
      fontFamily:"regular",
      fontSize: SIZES.small,
      textAlign:"justify",
      marginBottom: SIZES.small,
      top:15,
  },

  clickableIngredient:{

    color:Colors.dark.primary,
    fontWeight:'800',

  },
  userProfile: {
    padding: 20,
    borderRadius: 10,
    marginTop: 50,
    marginHorizontal: 10,
    shadowColor: '#D5D5D5',
    shadowOffset: { width: 0, height: 1 },
  
    shadowRadius: 20,
    elevation: 3,
  },
  userProfileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 70,
    borderRadius: 5,
    marginVertical: 25,
  },
  deleteButton: {
    backgroundColor: '#ff5c5c',
    alignSelf: 'center',
  },
  messageButton: {
    backgroundColor: '#4caf50',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

