import React, { Component } from 'react'
import { View, StyleSheet, Text, Button, TouchableOpacity } from 'react-native'
import TextButton from './TextButton'
import { Entypo } from '@expo/vector-icons'


export default function SkillTagWithRemove(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{props.skill}</Text>
      <TouchableOpacity onPress={() => {props.removeSkill(props.skill)}}>
        <Entypo style={{padding: 8}} name="cross" size={23} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#BB86FC',
    margin: 5,
    padding: 0,
    paddingLeft: 3,
    borderRadius: 20,
  },
  text: {
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.8,
    marginRight: 10,
    margin: 10
  }
})
