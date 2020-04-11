import React, { Component } from 'react'
import { View, TouchableOpacity ,StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Text, Item, Icon, Input } from 'native-base'

export default function SearchInput({placeholder, style, search, value, clearQuery}) {
  return (
    <Item style={style == null ? styles.container : style}>
      <Icon name="ios-search" style={styles.searchIcon} />
      <Input placeholder={placeholder}
      value={value}
      onChangeText={(q) => search(q)}/>
      {value !== '' &&
        <TouchableOpacity style={{marginRight: 15}} onPress={() => clearQuery()}>
          <Text>
            <MaterialCommunityIcons size={25} name="close" />
          </Text>
        </TouchableOpacity>}
    </Item>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#212121',
    borderRadius: 50,
    borderBottomWidth: 0,
  },
  searchIcon: {
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 15
  }
})
