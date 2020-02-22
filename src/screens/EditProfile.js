import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from 'native-base'
import { withFirebaseHOC } from '../../config/Firebase'

class EditProfile extends Component {
  state = {
    email: '',
  }
  componentDidMount() {


  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Edit Profile</Text>
      </View>
    )
  }
}

export default withFirebaseHOC(EditProfile)
