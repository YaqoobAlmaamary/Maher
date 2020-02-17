import React, { Component } from 'react'
import { View } from 'react-native'
import { Text } from 'native-base'

class Home extends Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Home!</Text>
      </View>
    )
  }
}

export default Home
