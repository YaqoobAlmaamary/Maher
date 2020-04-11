import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native'
import { Item as FormItem, Label, Input } from 'native-base'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default class PasswordInput extends Component {
  state= {
    showPassword: false,
    isFocused: false
  }

  toggle = () => {
    this.setState({
      showPassword: !this.state.showPassword
    })
  }

  render () {
    const { showPassword, isFocused } = this.state
    const { value, error } = this.props

    return (
      <View style={styles.container}>
        <FormItem floatingLabel
          style={[styles.formItem,
            (isFocused) &&
              {borderColor: '#BB86FC',},
            (error != null && error !== '') &&
             {borderColor: '#CF6679',}]}>
          <Label style={styles.label}>Password</Label>
          <Input
          value={value}
          keyboardType={Platform.OS == 'android'&& showPassword ? "visible-password" : "default"}
          secureTextEntry={showPassword ? false : true}
          placeholder="Password"
          textContentType={"password"} // ios
          autoCompleteType={"password"}// android
          style={styles.textInput}
          blurOnSubmit={this.props.blurOnSubmit}
          returnKeyType={this.props.returnKeyType}
          onSubmitEditing={this.props.onSubmitEditing}
          autoFocus={this.props.autoFocus == true ? true : false }
          onChangeText={(password) => this.props.handlePasswordChange(password)}
          onFocus={() => this.setState({isFocused: true})}
          onBlur={() => this.setState({isFocused: false})} />
        </FormItem>
        {Platform.OS == 'android' &&
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.eyeButton} onPress={this.toggle}>
                {showPassword ?
                  <MaterialCommunityIcons name="eye" size={30} color= '#BB86FC' />
                : <MaterialCommunityIcons name="eye-off" size={30} color= 'rgba(255, 255, 255, 0.60)' />}
              </TouchableOpacity>
            </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  contrainer: {
    flex: 1,
    flexDirection: 'row'
  },
  eyeButton: {
    margin:30,
  },
  buttonContainer: {
    position: 'absolute',
    alignSelf: 'flex-end'
  },
  formItem: {
    backgroundColor: '#2f2f2f',
    borderColor: '#2f2f2f',
    paddingLeft: 5,
    paddingRight: Platform.OS == 'ios' ? 5 : 50,
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
