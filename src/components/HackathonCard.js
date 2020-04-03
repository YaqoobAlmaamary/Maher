import React from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Text, Button } from 'native-base'
import { MaterialCommunityIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons'
import {getDuration} from '../../utils/helper'

function HackathonCard({hackathon, goToHackathon}) {
  let prizes
  if(hackathon.totalPrizes == 'non-cash'){
    prizes = "Non-cash prizes"
  }
  else {
    const amount = hackathon.totalPrizes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") // put commas
    prizes = amount+hackathon.currency+" in prizes"
  }
  return (
    <TouchableOpacity onPress={() => goToHackathon() } style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Image style={styles.thumbnail} source={hackathon.thumbnail == '' ? require('../assets/no-image.png'): {uri:hackathon.thumbnail}} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.title}>{hackathon.name}</Text>
            <Text style={styles.tagline}>{hackathon.tagline}</Text>
          </View>
        </View>
        <View style={[styles.row, { margin : 5}]}>
          <View style={{flex: 1,justifyContent: 'flex-end'}}>
            <Text style={styles.info}><MaterialCommunityIcons size={16} name="clock-outline" /> {getDuration(hackathon.startDateTime.seconds,hackathon.endDateTime.seconds)}</Text>
            <Text style={styles.info}><FontAwesome size={16} name="trophy" /> {prizes}</Text>
            <Text style={styles.info}><Ionicons size={16} name="md-people" /> {hackathon.participants.length} participants</Text>
          </View>
          <View style={{justifyContent: 'flex-end'}}>
            <Text style={styles.location}><Entypo size={16} name="location-pin" />{hackathon.locationAddress}</Text>
          </View>
        </View>
      </View>
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
    padding: 15
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  title: {
    fontFamily: 'Roboto_medium',
    fontSize: 18,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  info: {
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontSize: 12,
    lineHeight: 20
  },
  location: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  thumbnail: {
    width: 75,
    height: 75,
    marginRight: 20,
    marginBottom: 5
  }

})


export default HackathonCard
