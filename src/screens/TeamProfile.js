import React, { Component } from 'react'
import { View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native'
import { Text, H3 } from 'native-base'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import { withFirebaseHOC } from '../../config/Firebase'
import TextButton from '../components/TextButton'
import AwesomeAlert from 'react-native-awesome-alerts'

class TeamProfile extends Component {
  state = {
    team : {
      name: '',
      members: []
    },
    hackathon: {},
    members: [],
    leaderId: '',
    isReady: false,
    isFound: true
  }

  findLeader = (members) => {
    members.map(member => {
      if(member.type == 'leader')
        this.setState({
          leaderId: member.uid
        })
    })
  }
  loadMembersDataToState = async (members) => {
    const membersPromises = members.map(async (member) => {
      const memberDoc = await this.props.firebase.getUserDataOnce(member.uid)
      return memberDoc.data()
    })

    const membersArray = await Promise.all(membersPromises)
    this.setState({
      members: membersArray
    })
  }
  async componentDidMount(){
    const { teamId, hackathonId } = this.props.route.params
    const teamDoc = await this.props.firebase.getTeamDoc(hackathonId, teamId).get()
    if(!teamDoc.exists) {
      this.setState({
        isFound: false
      })
    }
    else {
      this.loadMembersDataToState(teamDoc.data().members)
      this.findLeader(teamDoc.data().members)
      this.setState({
        isReady: true,
        team : teamDoc.data()
      })
    }
  }
  render() {
    const { team, hackathon, isReady, members, leaderId, isFound } = this.state
    this.props.navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: this.state.team.name
    })
    if(!isReady && isFound){
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    if(!isFound){
      return (
        <Text style={{alignSelf: 'center', margin: 25}}>
          Sorry, This team doesn't exists. Maybe it has been removed.
        </Text>
      )
    }
    return (
      <ScrollView style={{flex: 1,marginTop: 10}}>
        <View>
          <Text style={styles.header}>Team Name</Text>
          <Text style={styles.p}>{team.name}</Text>
        </View>
        {team.mainIdea != '' &&
          <View>
            <Text style={styles.header}>Main Idea</Text>
            <Text style={styles.p}>{team.mainIdea}</Text>
          </View>
        }
        {team.ideaDescription != '' &&
          <View>
            <Text style={styles.header}>Description</Text>
            <Text style={styles.p}>{team.ideaDescription}</Text>
          </View>
        }
        {team.needTo != '' &&
          <View>
            <Text style={styles.header}>Skills Required</Text>
            <Text style={styles.p}>{team.needTo}</Text>
          </View>
        }
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <Text style={styles.header}>Members</Text>
        </View>
        <View>
          {members.length != 0 ?
            members.map((member) => (
              <View key={member.uid} style={{marginBottom: 5}}>
                <View style={styles.row}>
                  <View style={styles.memberConatiner}>
                    <Image style={styles.memberPhoto}
                      source={member.photoUri == '' ? require('../assets/no-image.png') : {uri: member.photoUri}} />
                    <View>
                      <Text>{member.firstName+" "+member.lastName}
                      {member.uid == leaderId &&
                        <MaterialCommunityIcons size={18} name="crown" />}
                      </Text>
                      <Text style={styles.memberUsername}>{member.username}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          : <ActivityIndicator style={{margin: 25}} size="small" color='#BB86FC' />}
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5
  },
  memberConatiner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'center',
    marginLeft: 20
  },
  memberPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5
  },
  memberUsername: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  header: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Roboto_medium',
    fontSize: 18,
    marginLeft: 10,
    textAlign: 'center'
  },
  p: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center'
  },
})


export default withFirebaseHOC(TeamProfile)
