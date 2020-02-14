import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native'
import { Item as FormItem, Label, Input } from 'native-base'
import TextButton from './TextButton'


export default class SkillsInput extends Component {
  state= {
    skill: '',
  }

  sendAndClear = () => {
    this.props.handleAddSkill(this.state.skill)
    this.setState({
      skill: ''
    })
  }


  render () {
    const { skill } = this.state

    return (
      <View style={styles.container}>
        <FormItem style={styles.formItem}>
          <Input
          value={skill}
          placeholder="e.g: javascript, python, java.."
          style={styles.textInput}
          autoFocus={this.props.autoFocus == true ? true : false }
          onChangeText={(skill) => this.setState({skill})} />
        </FormItem>
        <View style={styles.buttonContainer}>
          {skill.trim() == '' ?
            <TextButton style={styles.textButtonContainer} disabled={true}>Add</TextButton>
          : <TextButton style={styles.textButtonContainer}
              onPress={this.sendAndClear}>Add</TextButton>}
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
    paddingRight: 60,
    margin: 15,
    marginBottom: 0,
    borderRadius: 4,
    height: 60,

  },
  textInput: {
    flex:1,
    height: 45,
    marginLeft: 8,
  },
})
