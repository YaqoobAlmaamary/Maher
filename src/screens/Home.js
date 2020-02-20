import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from 'native-base'
import { withFirebaseHOC } from '../../config/Firebase'

class Home extends Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Home!</Text>
        <Text>{this.props.firebase.getCurrentUser().displayName}</Text>
        <TouchableOpacity onPress={() => this.props.firebase.signOut()}>
          <Text>signOut</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default withFirebaseHOC(Home)
