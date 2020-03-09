import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Item as FormItem, Label, Input, Text } from 'native-base'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export function NameInput({autoFocus, onFirstNameChange, onLastNameChange, values, returnKeyType, onSubmitEditing}) {
  return (
    <View style={styles.nameInput}>
      <FormItem floatingLabel style={[styles.formItem, { flex: 1, marginRight: 7.5}]}>
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
      <FormItem floatingLabel style={[styles.formItem, {flex: 1, marginLeft: 7.5}]}>
        <Label style={styles.label}>Last name</Label>
        <Input placeholder="last name"
        style={styles.textInput}
        value={values.lastName}
        getRef={input => { lastNameInput = input }} // make ref to this input to be used on sumbiting firstname
        onChangeText={onLastNameChange}
        returnKeyType={returnKeyType}
        blurOnSubmit={ false }
        onSubmitEditing={onSubmitEditing} />
      </FormItem>
    </View>
  )
}
export function TextInputWithMsg({autoFocus, value, label, placeholder, onChangeText, error, success, onSubmitEditing, returnKeyType, blurOnSubmit}){
  return (
    <View>
      <FormItem floatingLabel
        style={[styles.formItem,
          (error != null && error !== '') &&
            {borderColor: '#CF6679',},
          (success != null && success !== '') &&
          {borderColor: '#01A299',}]}
        >
        <Label style={styles.label}>{label}</Label>
        <Input placeholder={placeholder}
        style={styles.textInput}
        value={value}
        autoFocus={autoFocus}
        blurOnSubmit={blurOnSubmit}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType} />
      </FormItem>
      {(error != null && error !== '') && <Text style={{marginLeft:20, color: '#CF6679'}}>{error}</Text>}
      {(success != null && success !== '') && <Text style={{marginLeft:20, color: '#01A299'}}><MaterialCommunityIcons name="check" size={18} /> {success}</Text>}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})
