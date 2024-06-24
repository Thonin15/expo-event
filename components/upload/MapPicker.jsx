// import React, { useState } from 'react';
// import { View, Button, Text, StyleSheet } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';

// export default function MapPicker({ onLocationSelect }) {
//     const [location, setLocation] = useState(null);

//     const selectLocation = (e) => {
//         const { latitude, longitude } = e.nativeEvent.coordinate;
//         setLocation({ latitude, longitude });
//         onLocationSelect(`${latitude}, ${longitude}`);
//     };

//     return (
//         <View style={styles.container}>
//             <MapView
//                 style={styles.map}
//                 onPress={selectLocation}
//             >
//                 {location && (
//                     <Marker coordinate={location} />
//                 )}
//             </MapView>
//             {location && (
//                 <Text style={styles.locationText}>
//                     Selected Location: {location.latitude}, {location.longitude}
//                 </Text>
//             )}
//             <Button title="Clear Selection" onPress={() => setLocation(null)} />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         height: 300,
//         marginVertical: 10,
//     },
//     map: {
//         ...StyleSheet.absoluteFillObject,
//     },
//     locationText: {
//         marginTop: 10,
//         textAlign: 'center',
//     },
// });
