import React, { useEffect, useState } from 'react';
import {
	FlatList,
	RefreshControl,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
} from 'react-native';
import { collection, getDocs, getFirestore, orderBy } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Heading from './Heading';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons
import Search from './Search';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostItem from './PostItem';
import Slider from './Slider';
import Category from './Category';
import LatestPost from './PostbyCategory';

export default function HomeScreen() {
	const db = getFirestore(app);
	const [sliderLists, setSliderList] = useState([]);
	const [categoryList, setCategoryList] = useState([]);
	const [latestItemList, setLatestItemList] = useState([]); // State for latest items
	const [refreshing, setRefreshing] = useState(false); // State to handle refresh
	const navigation = useNavigation();

	useEffect(() => {
		fetchData(); // Fetch data on component mount
	}, []);

	const fetchData = async () => {
		await getSliders();
		await getCategoryList();
		await getLatestItemList();
	};

	const getSliders = async () => {
		// Fetch slider data
		const sliders = [];
		const querySnapshot = await getDocs(collection(db, "Sliders"));
		querySnapshot.forEach((doc) => { 
		  sliders.push(doc.data());
		});
		setSliderList(sliders);
	  }

	const getCategoryList = async () => {
		try {
			const categories = [];
			const querySnapshot = await getDocs(collection(db, 'Category'));
			querySnapshot.forEach((doc) => {
				categories.push(doc.data());
			});
			setCategoryList(categories);
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	};

	const getLatestItemList = async () => {
		try {
			setLatestItemList([]);
			const querySnapshot = await getDocs(
				collection(db, 'UserPost'),
				orderBy('createdAt', 'desc')
			);
			querySnapshot.forEach((doc) => {
				setLatestItemList((latestItemList) => [
					...latestItemList,
					doc.data(),
				]);
			});
		} catch (error) {
			console.error('Error fetching latest items:', error);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchData();
		setRefreshing(false);
	};

	const _renderItem = ({ item }) => {
		return <PostItem item={item} />;
	};

	const renderHeader = () => (
		<View style={styles.headerContainer}>
			<View style={{marginHorizontal:-10, marginTop: -15, marginBottom:20}}>

			<Slider sliderLists={sliderLists}/>
			</View>
			
			<Category categoryList={categoryList} />
			<Heading />
			
		</View>
	);

	return (
		<SafeAreaView style={{ backgroundColor: '#4B7F52' }}>
			
			<Search />
			
			
			<FlatList
				data={latestItemList}
				numColumns={2}
				keyExtractor={(item, index) => index.toString()}
				ListHeaderComponent={renderHeader}
				renderItem={_renderItem}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
				contentContainerStyle={styles.container}
			/>
		
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#F4F4F4',
		flexGrow: 1,
		paddingVertical: 15,
		paddingHorizontal: 10,
		paddingBottom: 150,
	},
	headerContainer: {
		flex: 1,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	button: {
		flex: 1,
		flexDirection: 'row', // Add flexDirection to align icon and text horizontally
		backgroundColor: '#4B7F52',
		padding: 10,
		borderRadius: 5,
		alignItems: 'center',
		marginHorizontal: 5,
	},
	buttonIcon: {
		marginRight: 10, // Add margin to create space between icon and text
	},
	buttonText: {
		fontFamily: 'extrabold',
		color: '#fff',
		fontSize: 16,
	},
});
