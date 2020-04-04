import React, { Component } from 'react'
import { View } from 'react-native'
import { Text } from 'native-base'

export default class TeamPage extends Component {
  render() {
    const { teamId, hackathonId } = this.props.route.params
    return (
      <View>
        <Text>team id: {teamId}</Text>
        <Text>hackathon id: {hackathonId}</Text>
      </View>
    )
  }
}
