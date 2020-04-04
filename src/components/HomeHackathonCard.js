import React, {Component} from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Text, Button } from 'native-base'
import { MaterialCommunityIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons'
import {getDuration} from '../../utils/helper'
import { withFirebaseHOC } from '../../config/Firebase'

class HomeHackathonCard extends Component {
  state = {
    type: "",
    inTeam: false,
    teamId: ''
  }
  getStatus = () => {
    const { type } = this.state
    const { hackathon } = this.props

    if(type == 'judge'){
      if(hackathon.status == 'review')
        return  {type: 'good', text: 'Review period started'}
      else if(hackathon.status == 'finished')
        return {type: 'bad', text: 'Review period has finished'}
      else {
        return {type: 'bad', text: "Review period hasn't started yet"}
      }
    }
    else if(type == 'manager'){
      return  {type: 'good', text: hackathon.status}
    }
    else if(type == 'participant'){
      const { uid } = this.props.firebase.getCurrentUser()
      let inTeam
      if(hackathon.teams.length == 0)
        inTeam = false
      else
        inTeam = hackathon.teams.find((team) => team.members.includes(uid))

      if(inTeam != null && inTeam != false){
        if(this.state.inTeam == false)
          this.setState({
            inTeam: true,
            teamId: inTeam.teamId
          })

        return {type: 'good', text: "in a team"}
      }
      else {
        if(this.state.inTeam == true)
          this.setState({inTeam: false})
        return {type: 'bad', text: "not in a team"}
      }
    }
    else {
      return
    }
  }
  componentDidMount(){
    const { hackathon, firebase } = this.props
    const { uid } = firebase.getCurrentUser()
    if(hackathon.judges.includes(uid))
      this.setState({
        type: 'judge'
      })
    else if(hackathon.createdBy == uid)
      this.setState({
        type: 'manager'
      })
    else if(hackathon.participants.includes(uid))
    this.setState({
      type: 'participant'
    })
  }
  render() {
    const {navigation, hackathon, goToHackathon} = this.props
    const { inTeam, type, teamId } = this.state
    const status = this.getStatus()
    return (
      <TouchableOpacity onPress={() => goToHackathon() } style={styles.container}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Image style={styles.thumbnail} source={hackathon.thumbnail == '' ? require('../assets/no-image.png'): {uri:hackathon.thumbnail}} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.title}>{hackathon.name}</Text>
              {status != null &&
                <Text style={[styles.status, { color: status.type == 'bad' ? '#CF6679' : '#01A299' }]}>{status.text}</Text>
              }
            </View>
          </View>
          <View style={styles.row}>
            <View style={{flex: 1,justifyContent: 'flex-end'}}>
              <Text style={styles.info}><MaterialCommunityIcons size={16} name="clock-outline" /> {getDuration(hackathon.startDateTime.seconds,hackathon.endDateTime.seconds)}</Text>
              <Text style={styles.location}><Entypo size={18} name="location-pin" />{hackathon.locationAddress}</Text>
            </View>
            {type == 'participant' &&
              <View style={{justifyContent: 'flex-end'}}>
                  {inTeam ?
                    <MyButton text="My Team" onPress={() => navigation.navigate("Team Page", {teamId: teamId, hackathonId: hackathon.hackathonId} ) } />
                  : <MyButton text="Create Team" onPress={() => navigation.navigate("Create Team", {hackathonId: hackathon.hackathonId} ) } />}
              </View>
            }
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

function MyButton({text, onPress}){
  return (
    <TouchableOpacity style={styles.button} onPress={() => onPress()}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
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
    backgroundColor: '#1e1e1e',
    borderRadius: 4,
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    padding: 12
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  title: {
    fontFamily: 'Roboto_medium',
    fontSize: 18,
  },
  status: {
    marginTop: 5,
    color: '#CF6679',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: 'Roboto_medium',
    fontSize: 14,
  },
  goodStatus: {
    marginTop: 5,
    color: '#01A299',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: 'Roboto_medium',
    fontSize: 14,
  },
  info: {
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontSize: 12,
    lineHeight: 20
  },
  location: {
    marginTop: 5,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  thumbnail: {
    width: 75,
    height: 75,
    marginRight: 20,
    marginBottom: 5
  },
  button: {
    backgroundColor: 'transparent',
    margin: 5,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  buttonText: {
    color: '#BB86FC',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 1.25,
  }

})


export default withFirebaseHOC(HomeHackathonCard)
