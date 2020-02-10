import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native'
import { Item as FormItem, Label, Input } from 'native-base'
import TextButton from './TextButton'

export default class SlillsInput extends Component {
  state= {
    disableAdd: false,
    skill: '',
  }

  clear = () => {
    this.props.handleAddSkill(this.state.skill)
    this.setState({
      skill: ''
    })
  }
  activate = () => {
    this.setState({
      disableAdd: false
    })
  }

  render () {
    const { disableAdd, skill } = this.state
    console.log(skill)

    return (
      <View style={styles.container}>
        <FormItem style={styles.formItem}>
          <Input
          value={skill}
          placeholder="enter at least 1 char to add"
          style={styles.textInput}
          autoFocus={this.props.autoFocus == true ? true : false }
          onChangeText={(skill) => this.setState({skill})} />
        </FormItem>
        <View style={styles.buttonContainer}>
          {skill.trim() == '' ?
            <TextButton style={styles.textButtonContainer} disabled={true}>Add</TextButton>
          : <TextButton style={styles.textButtonContainer}
              onPress={this.clear}>Add</TextButton>}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  contrainer: {
    flex: 1,
    flexDirection: 'row'
  },
  textButtonContainer: {
    margin: 30,
  },
  buttonContainer: {
    position: 'absolute',
    alignSelf: 'flex-end'
  },
  formItem: {
    backgroundColor: '#2f2f2f',
    borderColor: '#2f2f2f',
    paddingLeft: 5,
    paddingRight: 50,
    margin: 15,
    marginBottom: 0,
    borderRadius: 4,
    height: 60,

  },
  label: {
    paddingLeft: 10,
  },
  textInput: {
    flex:1,
    height: 45,
    marginLeft: 8,
  },
})
