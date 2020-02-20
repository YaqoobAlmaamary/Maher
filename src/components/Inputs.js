import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Item as FormItem, Label, Input, Text } from 'native-base'

export function NameInput({autoFocus, onFirstNameChange, onLastNameChange, values}) {
  return (
    <View style={styles.nameInput}>
      <FormItem floatingLabel style={[styles.formItem, { width: 157.5, marginRight:7.5}]}>
        <Label style={styles.label}>First name</Label>
        <Input placeholder="first name"
        style={styles.textInput}
        value={values.firstName}
        autoFocus={autoFocus}
        returnKeyType = { "next" }
        blurOnSubmit={ false }
        onSubmitEditing={() => { lastNameInput._root.focus() }} //to move to lastname input using keyboard
        onChangeText={onFirstNameChange}/>
      </FormItem>
      <FormItem floatingLabel style={[styles.formItem, { width: 157.5, marginLeft:7.5}]}>
        <Label style={styles.label}>Last name</Label>
        <Input placeholder="last name"
        style={styles.textInput}
        value={values.lastName}
        getRef={input => { lastNameInput = input }} // make ref to this input to be used on sumbiting firstname
        onChangeText={onLastNameChange} />
      </FormItem>
    </View>
  )
}
export function TextInputWithMsg({autoFocus, value, label, placeholder, onChangeText, error}){
  return (
    <View>
      <FormItem floatingLabel style={[styles.formItem, error !== '' && {borderColor: '#CF6679',}]}>
        <Label style={styles.label}>{label}</Label>
        <Input placeholder={placeholder}
        style={styles.textInput}
        value={value}
        autoFocus={autoFocus}
        onChangeText={onChangeText} />
      </FormItem>
      {error !== '' && <Text style={{marginLeft:20, color: '#CF6679'}}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  formItem: {
    backgroundColor: '#2f2f2f',
    borderColor: '#2f2f2f',
    paddingLeft: 5,
    margin: 15,
    marginBottom: 0,
    borderRadius: 4,
    height: 60,
  },
  textInput: {
    height: 45,
    marginLeft: 8,
  },
  label: {
    paddingLeft: 10,
  },
  nameInput: {
    width: 330,
    flexDirection: 'row',
  },
})
