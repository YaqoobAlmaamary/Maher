import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from 'native-base'
import { withFirebaseHOC } from '../../config/Firebase'

class Home extends Component {
  state = {
    email: '',
  }
  componentDidMount() {

    this.props.firebase.getUserDataByUid('j3QNiF8gYeQPVtp4Zofylpkvo0r2')
      .then((querysnapshot) => {
        this.setState({
          email: querysnapshot.data().email
        })
      })

  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>HomeEE!</Text>
        <Text>{this.state.email}</Text>
        <TouchableOpacity onPress={() => this.props.firebase.signOut()}>
          <Text>signOut</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default withFirebaseHOC(Home)
