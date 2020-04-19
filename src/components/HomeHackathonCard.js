import React, {Component} from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Text, Button } from 'native-base'
import { MaterialCommunityIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons'
import {getDuration} from '../../utils/helper'
import { withFirebaseHOC } from '../../config/Firebase'

class HomeHackathonCard extends Component {

  render() {
    const {navigation, hackathon, goToHackathon} = this.props
    const isHackathonFull = hackathon.isHackathonFull
    const type = hackathon.userType
    const status = hackathon.userStatus
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
                <Text style={[styles.status, { color:
                  status.type == 'bad' ?
                      '#CF6679'
                    : status.type == "good" ?
                          '#01A299'
                        : 'rgba(255, 255, 255, 0.6)' }]}>{status.text}</Text>
              }
              {(status.needMoreMembers !== null && status.needMoreMembers) &&
                <Text style={[styles.status, {color: '#CF6679' }]}>Need More Members</Text>
              }
              {isHackathonFull &&
                <Text style={styles.status}>Hackathon is full</Text>
              }
            </View>
          </View>
          <View style={styles.row}>
            <View style={{flex: 1,justifyContent: 'flex-end'}}>
              <Text style={styles.info}><MaterialCommunityIcons size={16} name="account-group" /> {hackathon.teams.length}/{hackathon.maxTeams} teams</Text>
              <Text style={styles.info}><MaterialCommunityIcons size={16} name="clock-outline" /> {getDuration(hackathon.startDateTime.seconds,hackathon.endDateTime.seconds)}</Text>
              <Text style={styles.location}><Entypo size={18} name="location-pin" />{hackathon.locationAddress}</Text>
            </View>
            {type == 'participant' &&
              <View style={{justifyContent: 'flex-end'}}>
                  {status.inTeam ?
                    <MyButton text="My Team" onPress={() => navigation.navigate("Team Page", {teamId: status.teamId, hackathonId: hackathon.hackathonId} ) } />
                  : <View>
                      <MyButton text="View Teams" onPress={() => navigation.navigate("Teams", {hackathonId: hackathon.hackathonId} ) } />
                      {!isHackathonFull &&
                      <MyButton disabled={isHackathonFull} text="Create Team" onPress={() => navigation.navigate("Create Team", {hackathonId: hackathon.hackathonId} ) } />}
                    </View>
                  }
              </View>
            }
            {type == 'judge' &&
            <View style={{justifyContent: 'flex-end'}}>
            { hackathon.reviewStatus == "review" &&
              <MyButton text="Evaluate" onPress={() => navigation.navigate("Evaluate", {hackathonId: hackathon.hackathonId} ) } />
            }
            </View>
          }
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

function MyButton({text, onPress, disabled}){
  return (
    <TouchableOpacity
    style={[styles.button,
      disabled &&
        {opacity: 0.5}
    ]} onPress={() => onPress()} disabled={disabled}>
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
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 5,
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
    paddingLeft: 10,
    paddingRight: 10,
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
