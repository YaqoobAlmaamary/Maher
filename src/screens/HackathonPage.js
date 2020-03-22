import React, { Component } from 'react'
import { View, TouchableOpacity, ActivityIndicator,ScrollView, Image, StyleSheet } from 'react-native'
import { Text, Button } from 'native-base'
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import {withFirebaseHOC} from '../../config/Firebase'
import moment from 'moment'

class HackathonPage extends Component {
  state={
    hackathon: {},
    user: {},
    judges: [],
    isReady: false,
    isJudgesReady: false,
    isRegistered: false,
    isUserJudge: false
  }

  registerForHackathon = async () => {
    const { firebase } = this.props
    const { user, hackathon } = this.state
    const updatedHackathons = user.hackathons == null ?
      {hackathons: [{hackathonId: hackathon.hackathonId, type: 'participant'}]}
    : { hackathons: user.hackathons.concat({hackathonId: hackathon.hackathonId, role: 'participant'}) }
    const updatedParticipants = {participants: hackathon.participants.concat(firebase.getCurrentUser().uid)}
    await firebase.getHackathonDoc(hackathon.hackathonId).update(updatedParticipants)

    const { hackathons } = updatedHackathons
    const { participants } = updatedParticipants
    firebase.updateUser(firebase.getCurrentUser().uid, updatedHackathons)
      .then(() => {
        this.setState({
          hackathon: {...hackathon, participants},
          user: {...user, hackathons},
          isRegistered: true
        })
      })
  }

  leaveHackathon = async () => {
    const { firebase } = this.props
    const { user, hackathon } = this.state
    if(user.hackathons == null || user.hackathons.length == 0) {
      return
    }

    const updatedHackathons = {hackathons: user.hackathons.filter((hackathon) => (
      hackathon.hackathonId != this.state.hackathon.hackathonId
    ))}
    const updatedParticipants = {participants: hackathon.participants.filter((participantId) => participantId != firebase.getCurrentUser().uid)}

    await firebase.getHackathonDoc(hackathon.hackathonId).update(updatedParticipants)

    const { hackathons } = updatedHackathons
    const { participants } = updatedParticipants
    firebase.updateUser(firebase.getCurrentUser().uid, updatedHackathons)
      .then(() => {
        this.setState({
          hackathon: {...hackathon, participants},
          user: {...user, hackathons},
          isRegistered: false
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


    if(user.data().hackathons != null){
      const found = user.data().hackathons.filter((hackathon) => hackathonId == hackathon.hackathonId)
      if(found.length > 0) {
        this.setState({
          isRegistered: true
        })
      }
    }
    if(snapshot.data().judges.includes(firebase.getCurrentUser().uid)){
      this.setState({
        isUserJudge: true
      })
    }

    this.setState({
      hackathon: snapshot.data(),
      user: user.data(),
      isReady: true
    })
    const addJudgesPromises = this.state.hackathon.judges.map(this.addJudgeToState)

    await Promise.all(addJudgesPromises)
    this.setState({
      isJudgesReady: true
    })
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  render() {
    const { hackathon, isReady, judges, isJudgesReady, isRegistered, isUserJudge } = this.state
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
        <ScrollView style={styles.container}>
            {(hackathon.banner !== '' && hackathon.banner != null) &&
              <Image style={{width:340 ,height:100}} source={{uri: hackathon.banner}} />
            }
            <View style={{alignItems: 'center', marginTop: 10}}>
              <Text style={styles.h3}>Start</Text>
              <Text style={styles.point}>{moment(hackathon.startDateTime.seconds*1000).format("LLL")}</Text>
              <Text style={styles.h3}>End</Text>
              <Text style={styles.point}>{moment(hackathon.endDateTime.seconds*1000).format("LLL")}</Text>
            </View>
            {isUserJudge ?
              <Text style={styles.judgeMsg}>You are a judge in this hackathon</Text>

            : isRegistered ?
                <Button style={styles.registerBtn} onPress={this.leaveHackathon}>
                  <Text style={styles.btnText}>Leave This Hackathon</Text>
                </Button>
              : <Button style={styles.registerBtn} onPress={this.registerForHackathon}>
                  <Text style={styles.btnText}>Register for this hackathon</Text>
                </Button>
            }
            <Text style={styles.locationLink}><Entypo size={16} name="location-pin" />{hackathon.locationAddress}</Text>
            <Text style={styles.title}>{hackathon.name}</Text>
            <Text style={styles.description}>{hackathon.description}</Text>
            <Text style={styles.h2}>Prizes</Text>
            {
              Object.values(hackathon.prizes).map((prize) => (
                <View key={prize.position} style={styles.headersContainer}>
                  {prize.type == 'cash' ?
                    <Text style={styles.h3}>{prize.position}. {prize.value+" "+hackathon.currency}</Text>
                  : <Text style={styles.h3}>{prize.position}. {prize.value}</Text>}
                  {prize.description !== '' &&
                    <Text style={styles.smallDescription}>{prize.description}</Text>}
                </View>
              ))
            }
            <Text style={styles.h2}>Judges</Text>
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
              <Text style={styles.h2}>Rules</Text>
              {hackathon.rules.map((rule) => (
                <Text key={rule} style={styles.point}><Entypo size={16} name="dot-single" />{rule}</Text>
              ))

              }
            </View>
        </ScrollView>
      </View>
    )
  }
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
  }
})

export default withFirebaseHOC(HackathonPage)
