import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'native-base'
import { withFirebaseHOC } from '../../config/Firebase'

class Notifications extends Component {
  state = {
    notifications: null
  }
  componentDidMount() {
      this.props.firebase.database().ref('notifications/'+this.props.firebase.getCurrentUser().uid)
        .on('value', snapshot => {
          if(snapshot.exists())
            this.setState({
              notifications: Object.values(snapshot.val())
            })
          else
            this.setState({
              notifications: null
            })
        })
  }
  componentWillUnmount() {
      this.props.firebase.database().ref('notifications/'+this.props.firebase.getCurrentUser().uid).off()
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{JSON.stringify(this.state.notifications)}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
})

export default withFirebaseHOC(Notifications)
