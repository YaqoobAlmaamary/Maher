import React, { Component } from 'react'
import { View, StyleSheet, Text } from 'react-native'


export default function SkillTag(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{props.skill}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#312a39',
    margin: 3,
    padding: 0,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
  },
  text: {
    color: '#BB86FC',
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.8,
    margin: 5,
  }
})
