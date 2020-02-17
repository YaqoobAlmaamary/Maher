import React, { Component } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Text, Header, Button } from 'native-base'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

function ProfileStackNavigator() {
  const username = 'Ibrahim_A'
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen name="Profile" component={ProfileInfo}
      options={{
        title: username,
        headerTitleAlign: 'center',
      }} />
    </Stack.Navigator>
  )
}

function ProfileInfo() {
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <View style={styles.nameConatiner}>
            <Image
              style={styles.image}
              source={require('../assets/no-image.png')}
            />
            <Text style={{fontSize: 18}}>{"Ibrahim AlSuhaim"}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit my profile</Text>
            </TouchableOpacity>
          </View>
          <Text>Profile!</Text>
        </View>
      </View>
    )
}

function Profile() {
  return (
    <ProfileStackNavigator />
  )
}


const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e'
  },
  nameConatiner: {
    alignItems: 'center',
    margin: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 8
  },
  editButton: {
    backgroundColor: 'transparent',
    margin: 20,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  editButtonText: {
    color: '#BB86FC',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 1.25,
  }
})

export default Profile
