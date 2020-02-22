import React, { Component } from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Text, Header, Button } from 'native-base'
import { createStackNavigator } from '@react-navigation/stack'
import { withFirebaseHOC } from '../../config/Firebase'
import EditProfile from './EditProfile'

const Stack = createStackNavigator()

class ProfileInfo extends Component {
  state = {
    user: {
      username: '',
      firstName: '',
      lastName: '',
    }
  }
  componentDidMount() {
    const { firebase } = this.props.route.params
    firebase.getUserDataByUid(firebase.getCurrentUser().uid)
      .then((user) => {
        this.setState({
          user: user.data()
        })
      })
  }
  render() {
    console.log(this.props);
    const { user } = this.state
    this.props.navigation.setOptions({
      headerTitleAlign: 'center',
      title: user.username
    })
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <View style={styles.nameConatiner}>
            <Image
              style={styles.image}
              source={require('../assets/no-image.png')}
            />
            <Text style={{fontSize: 18}}>{user.firstName+" "+user.lastName}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => this.props.navigation.navigate('Edit profile')}>
              <Text style={styles.editButtonText}>Edit my profile</Text>
            </TouchableOpacity>
          </View>
          <Text>Profile!</Text>
        </View>
      </View>
    )
  }
}

function Profile({firebase}) {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen name="Profile" initialParams={{firebase}} component={ProfileInfo} />
      <Stack.Screen name="Edit profile" component={EditProfile} />
    </Stack.Navigator>
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

export default withFirebaseHOC(Profile)
