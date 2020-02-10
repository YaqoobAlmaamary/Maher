import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native'
import { Item as FormItem, Label, Input } from 'native-base'
import TextButton from './TextButton'

<<<<<<< HEAD
export default class SkillsInput extends Component {
  state= {
    skill: '',
  }

  sendAndClear = () => {
=======
export default class SlillsInput extends Component {
  state= {
    disableAdd: false,
    skill: '',
  }

  clear = () => {
>>>>>>> d126bd447ecbf6b07d29b3e0f63a2ccf36e6befb
    this.props.handleAddSkill(this.state.skill)
    this.setState({
      skill: ''
    })
  }
<<<<<<< HEAD

  render () {
    const { disableAdd, skill } = this.state
=======
  activate = () => {
    this.setState({
      disableAdd: false
    })
  }

  render () {
    const { disableAdd, skill } = this.state
    console.log(skill)
>>>>>>> d126bd447ecbf6b07d29b3e0f63a2ccf36e6befb

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
<<<<<<< HEAD
              onPress={this.sendAndClear}>Add</TextButton>}
=======
              onPress={this.clear}>Add</TextButton>}
>>>>>>> d126bd447ecbf6b07d29b3e0f63a2ccf36e6befb
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
<<<<<<< HEAD
=======
  label: {
    paddingLeft: 10,
  },
>>>>>>> d126bd447ecbf6b07d29b3e0f63a2ccf36e6befb
  textInput: {
    flex:1,
    height: 45,
    marginLeft: 8,
  },
})
