import React, { Component } from 'react'
import { View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, FlatList } from 'react-native'
import { Text, Item, Icon, Input } from 'native-base'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import SkillTag from '../components/SkillTag'
import SearchInput from '../components/SearchInput'
import AwesomeAlert from 'react-native-awesome-alerts'
import { withFirebaseHOC } from '../../config/Firebase'


class InviteToTeam extends Component {
  state = {
    team : {
      name: '',
      participants: []
    },
    hackathon: {},
    participants: [],
    result: [],
    haveInvitation: [],
    leaderId: '',
    query: '',
    userToInvite: null,
    isReady: false,
    showInviteAlert: false,
    submiting: false
  }

  // load data of all participants without a team to the state
  loadParticipants = async (hackathon) => {
    // participants with a team
    let participantsWithTeam = []
    hackathon.teams.map(team => {
      team.members.map(member => participantsWithTeam.push(member))
    })

    // participants without a team
    const participants = hackathon.participants.filter( participant => !participantsWithTeam.includes(participant))

    if(participants.length != 0) {
      const participantsPromises = participants.map(async (participantId) => {
        const participantDoc = await this.props.firebase.getUserDataOnce(participantId)
        return participantDoc.data()
      })
      const participantsArray = await Promise.all(participantsPromises)
      this.setState({
        participants: participantsArray
      })
      this.loadWhoHasInvitation(participantsArray)
    }

  }

  sendInvitation = async (uid) => {
    this.setState({
      submiting: true
    })
    const newNotificationId = this.props.firebase.database().ref('notifications/'+uid).push().key

    const notificationData = {
      type: 'team',
      from: this.props.firebase.getCurrentUser().uid,
      to: uid,
      teamId: this.state.team.teamId,
      hackathonId: this.state.hackathon.hackathonId,
      notificationId: newNotificationId,
      time: Date.now()
    }

    let updates = {}
    updates['/notifications/'+ uid + '/' + newNotificationId] = notificationData

    await this.props.firebase.database().ref().update(updates)

    this.setState({
      showInviteAlert: false,
      submiting: false,
      haveInvitation: this.state.haveInvitation.concat(uid)
    })
  }

  loadWhoHasInvitation = async (participants) => {
    this.setState({
      isloadWhoHasInvitation: true
    })
    const { teamId } = this.props.route.params

    // all users notifications promises
    const allNoticficationsPromsises = participants.map(async participant => {
      const n = await this.props.firebase.database().ref("notifications/"+participant.uid).once('value')

      if(n.exists()) {
        const allUserNotifications = Object.values(n.val())
        const found = allUserNotifications.find((notification) => notification.teamId == teamId)

        if(found != null) {
          return found.to
        }
      }
    })
    const haveInvitationArray = await Promise.all(allNoticficationsPromsises)

    this.setState({
      haveInvitation : this.state.haveInvitation.concat(haveInvitationArray.filter((user) => user != null)),
      isloadWhoHasInvitation: false
    })
  }

  isSent = (uid) => {
    return this.state.haveInvitation.includes(uid)
  }

  search = (query) => {
    this.setState({
      query,
      result: this.state.participants.filter((participant) => participant.username.toLowerCase().search(query.toLowerCase().trim()) !== -1)
    })
  }
  async componentDidMount(){
    const { teamId, hackathonId, leaderId } = this.props.route.params
    this.props.navigation.dangerouslyGetParent().setOptions({
      tabBarVisible: false
    })

    const team = await this.props.firebase.getTeamDoc(hackathonId, teamId).get()
    const hackathon = await this.props.firebase.getHackathonDoc(hackathonId).get()
    await this.loadParticipants(hackathon.data())
    this.setState({
      team: team.data(),
      hackathon: hackathon.data(),
      isReady: true,
    })
  }
  render() {
    this.props.navigation.setOptions({
      headerTitleAlign: 'center',
    })
    if(!this.state.isReady){
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    if(this.state.participants.length == 0){
      return (
        <Text>No participants</Text>
      )
    }
    return (
      <View style={{ flex: 1, marginTop: 5 }}>
        <SearchInput
          placeholder="Search by username"
          search={this.search}
          value={this.state.query}
          clearQuery={() => this.setState({query: ''})} />
        {this.state.query != '' &&
          <Text style={styles.totalTxt}>
            Results: {this.state.result.length}
          </Text>}
        <FlatList
          style={{marginTop: 10}}
          data={this.state.query == '' ? this.state.participants : this.state.result}
          renderItem={({item}) =>
            <ParticipantCard
              isSent={this.isSent}
              isloadWhoHasInvitation={this.state.isloadWhoHasInvitation}
              showInviteConfirmation={() => {
                this.setState({
                  userToInvite: item,
                  showInviteAlert: true
                })
              }}
              participant={item} /> }
          keyExtractor={(item) => item.uid}
        />
        <InvitationAlert
          showAlert={this.state.showInviteAlert}
          participant={this.state.userToInvite}
          sendInvitation={this.sendInvitation}
          hideAlert={() => this.setState({showInviteAlert: false})}
          submiting={this.state.submiting}
          />
      </View>
    )
  }
}

function ParticipantCard({participant, showInviteConfirmation, isSent, isloadWhoHasInvitation}){
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.participantConatiner}>
          <Image style={styles.participantPhoto}
            source={participant.photoUri == '' ? require('../assets/no-image.png') : {uri: participant.photoUri}} />
          <View>
            <Text>{participant.firstName+" "+participant.lastName}
            </Text>
            <Text style={styles.smallMute}>{participant.username}</Text>
          </View>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end', marginRight: 15}}>
        {isloadWhoHasInvitation ?
          <ActivityIndicator size="small" color='#BB86FC' />
        : isSent(participant.uid) ?
            <Text style={styles.smallMute}>PENDING</Text>
          : <TouchableOpacity onPress={() => showInviteConfirmation()}>
              <Text style={styles.inviteBtn}>
                <MaterialCommunityIcons size={23} name="plus" />
                  Invite
              </Text>
            </TouchableOpacity>
        }
        </View>
      </View>
      <View style={[styles.row, {marginBottom: 10}]}>
        {participant.skills &&
          <Text style={{alignSelf: 'flex-start', fontFamily: 'Roboto_medium',marginLeft: 5, marginTop: 5}}>Skills:</Text>}
        {participant.skills &&
          <FlatList
            style={{flexDirection: 'row', marginLeft: 10}}
            horizontal={ true}
            data={participant.skills}
            renderItem={({item}) => <SkillTag skill={item} /> }
            keyExtractor={(item) => item}
          />}
      </View>
      <View style={{ borderBottomWidth: 0.2, borderColor: 'grey', margin: 10 ,marginRight: 50, marginLeft: 50,}} />
    </View>
  )
}

function InvitationAlert({showAlert, participant ,sendInvitation, hideAlert, submiting}) {
  if(participant == null)
    return null
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        message={"Do you want to send an invitation request to "+participant.username+" ?"}
        showCancelButton={!submiting}
        showConfirmButton={!submiting}
        cancelText="Cancel"
        confirmText="Send"
        confirmButtonColor="#BB86FC"
        cancelButtonColor="#383838"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          sendInvitation(participant.uid)
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 21}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 18, lineHeight: 21}}
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
  participantConatiner: {
    marginLeft: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'center'
  },
  participantPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
    marginRight: 10,
  },
  smallMute: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  inviteBtn: {
    color: '#BB86FC',
    fontSize: 17,
    textTransform: 'uppercase',
    letterSpacing: 1.25,
  },
  totalTxt: {
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.6)',
    margin: 5
  }
})

export default withFirebaseHOC(InviteToTeam)
