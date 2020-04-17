import React, { Component } from 'react'
import { View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native'
import { Text, H3 } from 'native-base'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import { withFirebaseHOC } from '../../config/Firebase'
import TextButton from '../components/TextButton'
import AwesomeAlert from 'react-native-awesome-alerts'

class TeamPage extends Component {
  state = {
    team : {
      name: '',
      members: []
    },
    hackathon: {},
    members: [],
    leaderId: '',
    memberToRemove: null,
    isReady: false,
    submiting: false,
    showLeaveAlert: false,
    showRemoveMemberAlert: false
  }

  findLeader = (members) => {
    members.map(member => {
      if(member.type == 'leader')
        this.setState({
          leaderId: member.uid
        })
    })
  }
  isUserInThisTeam = () => {
    let userFound = false
    if(this.state.team.members.length == 0)
      return true
    else {
      this.state.team.members.map(member => {
        if(member.uid == this.props.firebase.getCurrentUser().uid)
          userFound = true
      })
    }
    return userFound
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
      if(members.length == hackathon.maxInTeam)
        return {type: 'good', text: 'The team is full'}
      if(members.length >= hackathon.minInTeam)
        return {type: 'good', text: 'The team has the minimum number of members'}
      else {
        if(members.length == hackathon.minInTeam-1)
          return {type: 'bad', text: 'Team needs at least one more member'}
        else
          return {type: 'bad', text: 'Team needs '+(hackathon.minInTeam- members.length)+' more members'}
      }
    }
  }
  removeMember = async (memberId) => {
    this.setState({
      submiting: true
    })
    const { hackathonId } = this.state.hackathon
    const { teamId } = this.state.team
    await this.props.firebase.removeUserFromTeam(memberId, hackathonId, teamId)
  }
  leaveTeam = async () => {
    this.setState({
      submiting: true
    })
    const { uid } = this.props.firebase.getCurrentUser()
    const { hackathonId } = this.state.hackathon
    const { team } = this.state

    const membersWithoutCurrUser = team.members.filter((member) => member.uid != uid)

    if(this.state.leaderId == uid){
      const newLeaderUid = membersWithoutCurrUser.shift().uid
      const newTeamMembersArray = membersWithoutCurrUser.concat({type: 'leader', uid: newLeaderUid})
      await this.props.firebase.removeUserFromTeam(uid, hackathonId, team.teamId, true, newTeamMembersArray)
    }
    else{
      await this.removeMember(uid)
    }
    this.setState({
      submiting: true
    })
    this.setState({
      submiting: false
    },() => {
      this.setState({
        showRemoveTeamAlert: false,
      })
      this.props.navigation.goBack()
    })
  }
  removeTeam = async () => {
    this.setState({
      submiting: true
    })
    const { uid } = this.props.firebase.getCurrentUser()
    const { hackathonId } = this.state.hackathon
    const { team } = this.state

    await this.props.firebase.removeTeam(hackathonId, team.teamId, [uid])

    this.props.navigation.goBack()

  }
  async componentDidMount(){
    const { teamId, hackathonId } = this.props.route.params
    this.unsubscribe = this.props.firebase.getTeamDoc(hackathonId, teamId)
      .onSnapshot( async (doc) => {
        if(doc.exists){
          await this.loadMembersDataToState(doc.data().members)
          this.findLeader(doc.data().members)
          this.setState({
            team: doc.data(),
            showRemoveMemberAlert: false,
            submiting: false,
          })
        }
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
    const { team, hackathon, isReady, members, leaderId, showLeaveAlert, showRemoveMemberAlert, showRemoveTeamAlert, submiting } = this.state
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
    if(!this.isUserInThisTeam()){
      return (
        <Text style={{alignSelf: 'center', margin: 25}}>
          You are not a member in this team.
        </Text>
      )
    }
    return (
      <View style={{flex: 1,marginTop: 10}}>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <Text style={styles.header}>Team Name: </Text>
          <TouchableOpacity style={{marginRight: 10}} onPress={() => this.props.navigation.navigate("Edit Team", {teamId: team.teamId, hackathonId: hackathon.hackathonId})}>
            <Text style={styles.btn}><MaterialCommunityIcons size={18} name="square-edit-outline" />Edit</Text>
          </TouchableOpacity>
        </View>
        <Text style={{fontSize: 18, marginLeft: 15, marginBottom: 10}}>{team.name}</Text>
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
                      <TouchableOpacity onPress={() => this.setState({
                        memberToRemove: member,
                        showRemoveMemberAlert: true
                      })}>
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
            <Text style={styles.btn}>
              <MaterialCommunityIcons size={23} name="plus" />
                Invite members
            </Text>
          </TouchableOpacity>
        }
        {team.members.length == 1 ?
          <TouchableOpacity
              onPress={() => this.setState({showRemoveTeamAlert: true})}
              style={{alignSelf: 'flex-start', margin: 20}}>
              <Text style={[styles.btn, {color: '#CF6679'}]}>
                Remove Team
              </Text>
            </TouchableOpacity>
        : <TouchableOpacity
            onPress={() => this.setState({showLeaveAlert: true})}
            style={{alignSelf: 'flex-start', margin: 20, opacity: members.length == 1 ? 0.5 : 1}}
            disabled={members.length == 1}>
            <Text style={[styles.btn, {color: '#CF6679'}]}>
              Leave Team
            </Text>
          </TouchableOpacity>
        }
        <LeaveAlert
          showAlert={showLeaveAlert}
          hideAlert={() => this.setState({showLeaveAlert: false})}
          leaveTeam={this.leaveTeam}
          submiting={submiting}
        />
        <RemoveMemberAlert
          member={this.state.memberToRemove}
          showAlert={showRemoveMemberAlert}
          hideAlert={() => this.setState({showRemoveMemberAlert: false})}
          removeMember={this.removeMember}
          submiting={submiting}
        />
        <RemoveTeamAlert
          showAlert={showRemoveTeamAlert}
          hideAlert={() => this.setState({showRemoveTeamAlert: false})}
          removeTeam={this.removeTeam}
          submiting={submiting}
        />
      </View>
    )
  }
}

function LeaveAlert({showAlert, hideAlert, leaveTeam, submiting}){
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        message={"Are you sure you want to leave the team?"}
        showCancelButton={!submiting}
        showConfirmButton={!submiting}
        cancelText="Close"
        confirmText="Leave"
        confirmButtonColor="#BB86FC"
        cancelButtonColor="#383838"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          leaveTeam()
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 21}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 18, lineHeight: 21, margin: 5}}
        contentContainerStyle={{backgroundColor: '#2e2e2e', margin: 0}}
        cancelButtonTextStyle={{fontSize: 18}}
        confirmButtonTextStyle={{fontSize: 18}}
        overlayStyle={{backgroundColor: 'rgba(255,255,255, 0.15)'}}
      />
  )
}

function RemoveMemberAlert({member, showAlert, hideAlert, removeMember, submiting}){
  if(member == null)
    return null

  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        message={`Are you sure you want to remove ${member.username} from the team?`}
        showCancelButton={!submiting}
        showConfirmButton={!submiting}
        cancelText="Close"
        confirmText="Remove"
        confirmButtonColor="#BB86FC"
        cancelButtonColor="#383838"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          removeMember(member.uid)
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 21}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 18, lineHeight: 21, margin: 5}}
        contentContainerStyle={{backgroundColor: '#2e2e2e', margin: 0}}
        cancelButtonTextStyle={{fontSize: 18}}
        confirmButtonTextStyle={{fontSize: 18}}
        overlayStyle={{backgroundColor: 'rgba(255,255,255, 0.15)'}}
      />
  )
}

function RemoveTeamAlert({showAlert, hideAlert, removeTeam, submiting}) {
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        title="Remove Team"
        message={"Are you sure you want to remove your team?"}
        showCancelButton={!submiting}
        showConfirmButton={!submiting}
        cancelText="Close"
        confirmText="Remove"
        confirmButtonColor='#CF6679'
        cancelButtonColor="#383838"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          removeTeam()
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 21}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 18, lineHeight: 21, margin: 5}}
        contentContainerStyle={{backgroundColor: '#2e2e2e', margin: 0}}
        cancelButtonTextStyle={{fontSize: 18}}
        confirmButtonTextStyle={{fontSize: 18}}
        overlayStyle={{backgroundColor: 'rgba(255,255,255, 0.15)'}}
      />
  )
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
  btn: {
    color: '#BB86FC',
    fontSize: 17,
    textTransform: 'uppercase',
    letterSpacing: 1.25,
  }
})


export default withFirebaseHOC(TeamPage)
