import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'native-base'

class Notifications extends Component {
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Notifications!</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
})

export default Notifications
