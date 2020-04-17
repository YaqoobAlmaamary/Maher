import React, { Component } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text } from 'native-base'
import SearchInput from '../components/SearchInput'
import { withFirebaseHOC } from '../../config/Firebase'
import AwesomeAlert from 'react-native-awesome-alerts'
import { MaterialCommunityIcons } from '@expo/vector-icons'


class ViewTeams extends Component {
  state = {
    teams: [],
    result: [],
    hackathon: {},
    selectedTeam: null, // object
    haveRequest: [], // array
    query: '',
    isTeamsReady: false,
    isTeamsHaveRequestReady: false,
    isShowSendRequestAlert: false,
    submiting: false
  }
  search = (query) => {
    this.setState({
      query: query,
      result: this.state.teams.filter(team => team.name.toLowerCase().includes(query.trim().toLowerCase()))
    })
  }
  // load all teams ids who have requested before from the user to join, to the state array haveRequest
  loadTeamsIdsHaveRequest = async (teamsArray) => {
    const { teamId, hackathonId } = this.props.route.params
    const notificationType = 'join-team-request'

    let leaderUid
    // all leaders notifications promises
    const allNoticficationsPromsises = teamsArray.map(async team => {
      leaderUid = team.members.find(member => member.type == 'leader').uid
      const n = await this.props.firebase.database().ref("notifications/"+leaderUid).once('value')

      if(n.exists()) {
        const allUserNotifications = Object.values(n.val())
        const found = allUserNotifications.find((notification) =>
          notification.from == this.props.firebase.getCurrentUser().uid && notification.type== notificationType)

        if(found != null) {
          return found.teamId
        }
      }
    })
    const teamsHaveRequestArray = await Promise.all(allNoticficationsPromsises)

    this.setState({
      haveRequest : this.state.haveRequest.concat(teamsHaveRequestArray.filter((notification) => notification != null)),
      isTeamsHaveRequestReady: true
    })
  }
  sendRequest = async (team) => {
    this.setState({
      submiting: true
    })
    const leaderUid = team.members.find(member => member.type == 'leader').uid

    const newNotificationId = this.props.firebase.database().ref('notifications/'+leaderUid).push().key

    const photoURL = this.props.firebase.getCurrentUser().photoURL

    const notificationData = {
      type: 'join-team-request',
      from: this.props.firebase.getCurrentUser().uid,
      fromFullName: this.props.firebase.getCurrentUser().displayName,
      fromPhotoUri: photoURL == null ? '' : photoURL,
      hackathonName: this.state.hackathon.name,
      teamName: team.name,
      to: leaderUid,
      teamId: team.teamId,
      hackathonId: this.state.hackathon.hackathonId,
      notificationId: newNotificationId,
      time: Date.now()
    }

    let updates = {}
    updates['/notifications/'+ leaderUid + '/' + newNotificationId] = notificationData

    await this.props.firebase.database().ref().update(updates)

    this.setState({
      haveRequest: this.state.haveRequest.concat(team.teamId),
      submiting: true,
      isShowSendRequestAlert: false,
    })
  }
  isSent = (teamId) => {
    return this.state.haveRequest.includes(teamId)
  }
  async componentDidMount(){
    const { hackathonId } = this.props.route.params
    const teamsCollection = await this.props.firebase.getAllTeamsRef(hackathonId).get()
    let teamsArray = []
    teamsCollection.forEach((team) => {
      teamsArray.push(team.data())
    })

    this.setState({
      teams: teamsArray,
      isTeamsReady: true
    })

    this.props.firebase.getHackathonDoc(hackathonId).get()
      .then((hackathon) => {
        this.setState({
          hackathon: hackathon.data()
        })
        this.loadTeamsIdsHaveRequest(teamsArray)
      })
  }
  render() {
    if(this.state.hackathon.name != null) {
      this.props.navigation.setOptions({
        headerTitle: this.state.hackathon.name + " Teams",
        headerTitleAlign: 'center'
      })
    }

    if(!this.state.isTeamsReady){
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    return (
      <View style={{flex: 1, marginTop: 5,}}>
        <SearchInput
          placeholder="Search by team name"
          search={this.search}
          value={this.state.query}
          clearQuery={() => this.setState({query: ''})} />
        {this.state.query != '' &&
          <Text style={styles.mute}>
            Results: {this.state.result.length}
          </Text>}
        <FlatList
          style={{marginTop: 10}}
          data={this.state.query.trim() == '' ? this.state.teams : this.state.result}
          renderItem={({item}) => (
            <TeamCard
              team={item}
              maxInTeam={this.state.hackathon.maxInTeam}
              isTeamsHaveRequestReady={this.state.isTeamsHaveRequestReady}
              isSent={this.isSent}
              showSendRequestAlert={() => {
                this.setState({
                  selectedTeam: item,
                  isShowSendRequestAlert: true
                })
              }}
              goToTeamProfile={() => this.props.navigation.navigate("Team Profile", {teamId: item.teamId, hackathonId: this.props.route.params.hackathonId})} />
          )}
          keyExtractor={(item) => item.teamId}
        />
        <SendJoinRequestAlert
          showAlert={this.state.isShowSendRequestAlert}
          team={this.state.selectedTeam}
          sendRequest={this.sendRequest}
          hideAlert={() => this.setState({isShowSendRequestAlert: false})}
          submiting={this.state.submiting}
        />
      </View>
    )
  }
}

function TeamCard({team, maxInTeam, goToTeamProfile, showSendRequestAlert, isTeamsHaveRequestReady, isSent}) {
  return (
    <TouchableOpacity onPress={() => goToTeamProfile()} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <View style={[styles.row, {justifyContent: 'space-between'}]}>
              <Text style={styles.title} >{team.name} </Text>
              {isTeamsHaveRequestReady ?
                isSent(team.teamId) ?
                  <Text style={styles.mute}>PENDING</Text>
                : <TouchableOpacity onPress={() => showSendRequestAlert()}>
                      <Text style={styles.requestBtn}>
                        {" Join"}
                        <MaterialCommunityIcons size={14} name="login" />
                      </Text>
                  </TouchableOpacity>
                : <ActivityIndicator size="small" color='#BB86FC' />
              }
            </View>
            <View style={styles.row}>
              <Text style={styles.header}> {"Idea: "} </Text>
              <Text>{team.mainIdea} </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.header}> Members: </Text>
              {maxInTeam == null ?
                <ActivityIndicator style={{width: 16, height: 16}} size="small" color='#BB86FC' />
              : <Text>{team.members.length}/{maxInTeam}</Text>
              }
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function SendJoinRequestAlert({showAlert, team ,sendRequest, hideAlert, submiting}) {
  if(team == null)
    return null
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        message={"Do you want to send a request to the leader of "+team.name+" ?"}
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
          sendRequest(team)
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  card: {
    flex: 1,
    backgroundColor: '#272727',
    borderRadius: 4,
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap'

  },
  title: {
    fontFamily: 'Roboto_medium',
    fontSize: 26,
    fontWeight: "bold",
  },
  header: {
    color: 'rgba(255,255,255, 0.6)',
    fontFamily: 'Roboto_medium',
  },
  mute: {
    color: 'rgba(255,255,255, 0.6)',
  },
  smallMute: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  requestBtn: {
    color: '#BB86FC',
    fontSize: 17,
    textTransform: 'uppercase',
    letterSpacing: 1.25,
  },
})

export default withFirebaseHOC(ViewTeams)
