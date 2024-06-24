import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from './heading.style';
const Heading = () => {
  return (
    <View style={styles.container} >
      <View style={styles.header}>
          <Text style = {styles.headerTitle}>
              LATEST POST
          </Text>
      </View>
    </View> 

  )
}

export default Heading;
