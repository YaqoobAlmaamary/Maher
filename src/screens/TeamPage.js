import React, { Component } from 'react'
import { View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native'
import { Text, H3 } from 'native-base'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import { withFirebaseHOC } from '../../config/Firebase'
import TextButton from '../components/TextButton'

class TeamPage extends Component {
  state = {
    team : {
      name: '',
      members: []
    },
    hackathon: {},
    members: [],
    leaderId: '',
    isReady: false,
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
  getTeamStatus = () => {
    const { members, hackathon } = this.state
    if(members.length == 0 || hackathon.minInTeam == null)
      return {type: '', text: ''}
    else {
      if(members.length >= hackathon.minInTeam)
        return {type: 'good', text: 'The team has the minimum number of members'}
      if(members.length == hackathon.minInTeam)
        return {type: 'good', text: 'The team is full'}
      else {
        if(members.length == hackathon.minInTeam-1)
          return {type: 'bad', text: 'Team needs at least one more member'}
        else
          return {type: 'bad', text: 'Team needs '+(hackathon.minInTeam- members.length)+' more members'}
      }
    }
  }
  async componentDidMount(){
    const { teamId, hackathonId } = this.props.route.params
    this.unsubscribe = this.props.firebase.getTeamDoc(hackathonId, teamId)
      .onSnapshot( async (doc) => {
        await this.loadMembersDataToState(doc.data().members)
        this.findLeader(doc.data().members)
        this.setState({
          team: doc.data(),
        })
      })

    const hackathon = await this.props.firebase.getHackathonDoc(hackathonId).get()
    this.setState({
      hackathon: hackathon.data(),
      isReady: true,
    })
  }
  componentWillUnmount(){
    if(this.unsubscribe)
      this.unsubscribe()
  }
  render() {
    const { team, hackathon, isReady, members, leaderId } = this.state
    const { uid } = this.props.firebase.getCurrentUser()
    const status = this.getTeamStatus()
    this.props.navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: this.state.team.name
    })
    if(!isReady){
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    return (
      <View style={{marginTop: 10}}>
        <View style={styles.row}>
          <Text style={styles.header}>Team Name: </Text>
          <Text style={{fontSize: 18}}>{team.name}</Text>
        </View>
        <Text style={styles.header}>Team Status: </Text>
        <Text style={[styles.status, {color: status.type == 'bad' ? '#CF6679' : '#01A299'}]}>{status.text}</Text>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <Text style={styles.header}>Members</Text>
          <Text style={{marginTop: 3, marginRight: 10}}>
            <MaterialCommunityIcons size={16} name="account-group" />
            {" "+members.length}/{hackathon.maxInTeam}</Text>
        </View>
        <ScrollView>
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
                  {(member.uid != uid && leaderId == uid) &&
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end', marginRight: 20}}>
                      <TouchableOpacity>
                        <Text style={{color: '#CF6679'}}>
                          <Entypo size={35} name="cross" />
                        </Text>
                      </TouchableOpacity>
                    </View>}
                </View>
                <View style={{ borderBottomWidth: 0.2, borderColor: 'grey', marginRight: 20, marginLeft: 50, marginBottom: 5}} />
              </View>
            ))
          : <ActivityIndicator style={{margin: 25}} size="small" color='#BB86FC' />}
        </ScrollView>
        {leaderId == uid &&
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Invite To Team", {hackathonId: hackathon.hackathonId, teamId: team.teamId, leaderId: leaderId})}
            style={{alignSelf: 'flex-end', margin: 10, opacity: members.length == hackathon.maxInTeam ? 0.5 : 1}}
            disabled={members.length == hackathon.maxInTeam}>
            <Text style={styles.addBtn}>
              <MaterialCommunityIcons size={23} name="plus" />
                Invite members
            </Text>
          </TouchableOpacity>
        }
      </View>
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
    marginLeft: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'center'
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
    fontFamily: 'Roboto_medium',
    fontSize: 18,
    marginLeft: 10
  },
  status: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    fontSize: 18,
  },
  addBtn: {
    color: '#BB86FC',
    fontSize: 17,
    textTransform: 'uppercase',
    letterSpacing: 1.25,
  }
})


export default withFirebaseHOC(TeamPage)
