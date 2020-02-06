import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function TextButton ({ children, onPress, style, disabled = {} }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled == true ? true : false} style={disabled == true &&{opacity: .3}}>
      <Text style={[styles.textButton, style]}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  textButton: {
    color: '#BB86FC',
    margin:15,
    fontWeight: '600',
    fontSize: 21,
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  }
})
