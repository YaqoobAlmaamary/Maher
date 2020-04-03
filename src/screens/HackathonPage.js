import React, { Component } from 'react'
import { View, TouchableOpacity, ActivityIndicator,ScrollView, Image, StyleSheet } from 'react-native'
import { Text, Button } from 'native-base'
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import {withFirebaseHOC} from '../../config/Firebase'
import moment from 'moment'
import AwesomeAlert from 'react-native-awesome-alerts'

class HackathonPage extends Component {
  state={
    hackathon: {},
    user: {},
    judges: [],
    isReady: false,
    isJudgesReady: false,
    isRegistered: false,
    isUserJudge: false,
    isUserManager: false,
    showRegisterAlert: false,
    showLeaveAlert: false,
    submiting: false,
  }

  registerForHackathon = async () => {
    this.setState({
      submiting: true
    })
    const { firebase } = this.props
    const { user, hackathon } = this.state
    const updatedUserHackathons = user.hackathons == null ?
      {hackathons: [{hackathonId: hackathon.hackathonId, type: 'participant'}]}
    : { hackathons: user.hackathons.concat({hackathonId: hackathon.hackathonId, role: 'participant'}) }
    const updatedParticipants = {participants: hackathon.participants.concat(firebase.getCurrentUser().uid)}
    await firebase.getHackathonDoc(hackathon.hackathonId).update(updatedParticipants)

    const { hackathons } = updatedUserHackathons
    const { participants } = updatedParticipants
    firebase.updateUser(firebase.getCurrentUser().uid, updatedUserHackathons)
      .then(() => {
        this.setState({
          hackathon: {...hackathon, participants},
          user: {...user, hackathons},
          isRegistered: true,
          showRegisterAlert: false,
          submiting: false
        })
      })
  }

  leaveHackathon = async () => {
    this.setState({
      submiting: true
    })
    const { firebase } = this.props
    const { user, hackathon } = this.state
    if(user.hackathons == null || user.hackathons.length == 0) {
      return
    }

    const updatedUserHackathons = {hackathons: user.hackathons.filter((hackathon) => (
      hackathon.hackathonId != this.state.hackathon.hackathonId
    ))}
    const updatedParticipants = {participants: hackathon.participants.filter((participantId) => participantId != firebase.getCurrentUser().uid)}

    const userTeam = hackathon.teams.find(team => team.members.includes(firebase.getCurrentUser().uid))
    if(userTeam){
      let updatedHackathonTeams
      let updatedTeam

      const teamData = await firebase.getTeamDoc(userTeam.teamId).get()

      if(userTeam.members.length == 1){
        updatedHackathonTeams = hackathon.teams.filter(team => team.teamId != userTeam.teamId)
        await firebase.getTeamDoc(userTeam.teamId).delete()
      }
      else {
        updatedTeam = teamData.data().members.filter(member => member.uid != firebase.getCurrentUser().uid)
        const userPosition = teamData.data().members.find(member => member.uid == firebase.getCurrentUser().uid)
        if(userPosition.type == 'leader'){
          someMember = updatedTeam.shift()
          updatedTeam = updatedTeam.unShift({uid: someMember.uid, type: "leader"})
        }

        updatedHackathonTeams =
          hackathon.teams.filter(team =>
            team.teamId != userTeam.teamId).concat({teamId: userTeam.teamId ,members: userTeam.members.filter(member => member != firebase.getCurrentUser().uid)})
      }

      await firebase.getHackathonDoc(hackathon.hackathonId).update({teams: updatedHackathonTeams})
      if(userTeam.members.length > 1)
        await firebase.getTeamDoc(userTeam.teamId).update({members: updatedTeam})
    }
    await firebase.getHackathonDoc(hackathon.hackathonId).update(updatedParticipants)

    const { hackathons } = updatedUserHackathons
    const { participants } = updatedParticipants
    firebase.updateUser(firebase.getCurrentUser().uid, updatedUserHackathons)
      .then(() => {
        this.setState({
          hackathon: {...hackathon, participants},
          user: {...user, hackathons},
          isRegistered: false,
          showLeaveAlert: false,
          submiting: false
        })
      })
  }

  addJudgeToState = async (judgeId) => {
    const judge = await this.props.firebase.getUserDataOnce(judgeId)
    this.setState({
      judges: this.state.judges.concat(judge.data())
    })
  }
  async componentDidMount(){
    this.props.navigation.dangerouslyGetParent().setOptions({
      tabBarVisible: false
    })
    const { hackathonId } = this.props.route.params
    const { firebase } = this.props

    //Listen for hackathon updates, and assign it to unsubscribe to be called in componentWillUnmount to unsubscribe this listener
    this.unsubscribe = firebase.hackathonDataById(hackathonId).onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => { // whenever hackathon data is changed
        this.setState({
          hackathon: change.doc.data()
        })
      })
    })

    const user = await firebase.getUserDataOnce(firebase.getCurrentUser().uid)
    const snapshot = await firebase.getHackathonDoc(hackathonId).get()

    const { uid } = firebase.getCurrentUser()
    if(snapshot.data().participants.includes(uid)){
      this.setState({
        isRegistered: true
      })
    }
    if(snapshot.data().createdBy == uid){
      this.setState({
        isUserManager: true
      })
    }
    if(snapshot.data().judges.includes(uid)){
      this.setState({
        isUserJudge: true
      })
    }

    this.setState({
      hackathon: snapshot.data(),
      user: user.data(),
      isReady: true
    })

    if(snapshot.data().judges.length != 0){
      const addJudgesPromises = this.state.hackathon.judges.map(this.addJudgeToState)

      await Promise.all(addJudgesPromises)
    }

    this.setState({
      isJudgesReady: true
    })
  }
  componentWillUnmount() {
    // unsubscribe from listener only if it was defined
    if(this.unsubscribe)
      this.unsubscribe()
  }
  render() {
    const { hackathon, isReady, judges, isJudgesReady, isRegistered, isUserJudge, isUserManager, showRegisterAlert, showLeaveAlert, submiting } = this.state
    this.props.navigation.setOptions({
      title: this.props.route.params.name,
      headerTitleAlign: 'center'
    })
    if(!isReady) {
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    return (
      <View style={{ flex: 1, alignItems: 'stretch'}}>
        <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 20}}>
            {(hackathon.banner !== '' && hackathon.banner != null) &&
              <Image style={{width:340 ,height:100}} source={{uri: hackathon.banner}} />
            }
            <View style={{alignItems: 'center', marginTop: 10}}>
              <Text style={styles.h3}>Start</Text>
              <Text style={styles.point}>{moment(hackathon.startDateTime.seconds*1000).format("LLL")}</Text>
              <Text style={styles.h3}>End</Text>
              <Text style={styles.point}>{moment(hackathon.endDateTime.seconds*1000).format("LLL")}</Text>
            </View>
            {isUserManager ?
              <Text style={styles.judgeMsg}>You are the hackathon manager</Text>
            : isUserJudge ?
              <Text style={styles.judgeMsg}>You are a judge in this hackathon</Text>

            : isRegistered ?
                <Button style={styles.registerBtn} onPress={() => this.setState({showLeaveAlert: true})}>
                  <Text style={styles.btnText}>Leave This Hackathon</Text>
                </Button>
              : <Button style={styles.registerBtn} onPress={() => this.setState({showRegisterAlert: true})}>
                  <Text style={styles.btnText}>Register for this hackathon</Text>
                </Button>
            }
            <Text style={styles.locationLink}><Entypo size={16} name="location-pin" />{hackathon.locationAddress}</Text>
            <Text style={styles.title}>{hackathon.name}</Text>
            <Text style={styles.description}>{hackathon.description}</Text>
            {(hackathon.prizes != null && Object.values(hackathon.prizes).length != 0) &&
              <Text style={styles.h2}>Prizes</Text>}
            {
              Object.values(hackathon.prizes).map((prize) => (
                <View key={prize.position} style={styles.headersContainer}>
                  {prize.type == 'cash' ?
                    <Text style={styles.h3}>{prize.position}. {prize.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" "+hackathon.currency}</Text>
                  : <Text style={styles.h3}>{prize.position}. {prize.value}</Text>}
                  {prize.description !== '' &&
                    <Text style={styles.smallDescription}>{prize.description}</Text>}
                </View>
              ))
            }
            {judges.length != 0 &&
              <Text style={styles.h2}>Judges</Text>
            }
            {isJudgesReady ?
              judges.map((judge) => (
                <View key={judge.uid} style={styles.judgeConatiner}>
                  <Image style={styles.judgePhoto}
                    source={judge.photoUri == '' ? require('../assets/no-image.png') : {uri: judge.photoUri}} />
                  <View>
                    <Text>{judge.firstName+" "+judge.lastName}</Text>
                    <Text style={styles.judgeUsername}>{judge.username}</Text>
                  </View>
                </View>
              ))
            : <ActivityIndicator style={{margin: 25}} size="small" color='#BB86FC' />}
            <Text style={styles.h2}>Judging Criteria</Text>
            {hackathon.criteria.length !== 0 &&
              hackathon.criteria.map((criteria) => (
                <View key={criteria.name} style={styles.headersContainer}>
                  <Text style={styles.h3}>- {criteria.name}</Text>
                  {criteria.description !== '' &&
                    <Text style={styles.smallDescription}>{criteria.description}</Text>}
                </View>
              ))}
            <View>
              {hackathon.rules.length != 0 &&
                <Text style={styles.h2}>Rules</Text>}
              {hackathon.rules.map((rule) => (
                  <Text key={rule} style={styles.point}><Entypo size={16} name="dot-single" />{rule}</Text>
                ))}
            </View>
            {(hackathon.sponsors != null && hackathon.sponsors.length != 0) &&
              <View style={styles.sponsors}>
                {hackathon.sponsors.map((sponsor) => (
                  <View>
                    <Text style={[styles.h2, {textAlign: 'center'}]}>{sponsor.type}</Text>
                    {sponsor.logos.map(logo => <Image resizeMode={'center'} style={{ width: '100%', height: 100, margin: 10 }} source={{uri: logo}} />)}
                  </View>
                ))}
              </View>
            }
        </ScrollView>
        <RegisterAlert
        submiting={submiting}
        showAlert={showRegisterAlert}
        minInTeam={hackathon.minInTeam}
        register={this.registerForHackathon}
        hideAlert={() => this.setState({showRegisterAlert: false})}
        />
        <LeaveAlert
        submiting={submiting}
        showAlert={showLeaveAlert}
        leave={this.leaveHackathon}
        hideAlert={() => this.setState({showLeaveAlert: false})}
        />
      </View>
    )
  }
}

function RegisterAlert({showAlert, hideAlert, register, minInTeam, submiting}) {
  let teamsNote = ""
  if(minInTeam == 1)
    teamsNote = "Note that this hackathon allow single-person teams to participate in."
  else
    teamsNote = "Note that minimum members in a team for this hackathon is "+minInTeam+". Teams have members less than "+minInTeam+" will be eleminated as well."
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        title="Confirm Registeration"
        message={"Registering in this hackathon doesn't consider you as a participant yet."+
        "\nWhen the hackathon starts, all participants who don't have a team will be eliminated."+
        "\nSo, you need to create or join a team once you're registered. "+teamsNote+
        "\n\n Happy Hacking!"}
        showCancelButton={!submiting}
        showConfirmButton={!submiting}
        cancelText="Close"
        confirmText="Agree, proceed"
        confirmButtonColor="#BB86FC"
        cancelButtonColor="#383838"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          register()
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
function LeaveAlert({showAlert, hideAlert, leave, submiting}){
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        title="Leave Hackathon"
        message={"By clicking leave, You will be removed from this hackathon. If you have a team and you're the leader , leadership will be assigned to one the remaining members."+
        "\nIf you don't have members in your team, then your team will be removed."+
        "\n\nAre you sure you want to leave?"}
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
          leave()
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
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#1e1e1e',
    borderWidth: 0.2,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  registerBtn: {
    alignSelf: 'center',
    justifyContent:'center',
    borderRadius: 5,
    margin: 15
  },
  btnText: {
    color: '#1e1e1e',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase'
  },
  judgeMsg: {
    color: '#01A299' ,
    textAlign: 'center',
    fontSize: 18,
    textTransform: 'uppercase',
    margin: 15,
  },
  title: {
    margin: 10,
    marginTop: 15,
    fontSize: 21,
    fontFamily: 'Roboto_medium'
  },
  description: {
    marginLeft: 15,
    marginRight: 15,
    lineHeight: 23,
  },
  h2: {
    marginTop: 20,
    marginLeft: 15,
    fontSize: 21,
    fontFamily: 'Roboto_medium'
  },
  headersContainer: {
    marginTop: 5,
    marginLeft: 30,
    marginRight: 15,
  },
  h3: {
    fontFamily: 'Roboto_medium'
  },
  smallDescription: {
    marginLeft: 15,
    color: 'rgba(255,255,255,0.6)'
  },
  point: {
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 5
  },
  judgeConatiner: {
    margin: 5,
    marginLeft: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'center'
  },
  judgePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5
  },
  judgeUsername: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  locationLink: {
    margin: 10,
    marginBottom: 5,
    color: '#BB86FC',
    opacity: 0.8
  },
  sponsors: {
    marginTop: 20
  },
})

export default withFirebaseHOC(HackathonPage)
