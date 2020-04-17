import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Item as FormItem, Label, Input, Text } from 'native-base'

export default function NameInput({autoFocus, onFirstNameChange, onLastNameChange, values, returnKeyType, onSubmitEditing, blurOnSubmitLast}) {
  const [isFocusedFirst, setIsFocusedFirst] = useState(false)
  const [isFocusedLast, setIsFocusedLast] = useState(false)
  return (
    <View style={styles.nameInput}>
      <FormItem floatingLabel style={[styles.formItem, { flex: 1, marginRight: 7.5, borderColor: isFocusedFirst ? '#BB86FC' : '#2f2f2f'}]}>
        <Label style={styles.label}>First name</Label>
        <Input placeholder="first name"
        style={styles.textInput}
        value={values.firstName}
        autoFocus={autoFocus}
        returnKeyType = { "next" }
        blurOnSubmit={ false }
        onSubmitEditing={() => { lastNameInput._root.focus() }} //to move to lastname input using keyboard
        onChangeText={onFirstNameChange}
        onBlur={() => setIsFocusedFirst(false)}
        onFocus={() => setIsFocusedFirst(true)} />
      </FormItem>
      <FormItem floatingLabel style={[styles.formItem, { flex: 1, marginLeft: 7.5, borderColor: isFocusedLast ? '#BB86FC' : '#2f2f2f'}]}>
        <Label style={styles.label}>Last name</Label>
        <Input placeholder="last name"
        style={styles.textInput}
        value={values.lastName}
        getRef={input => { lastNameInput = input }} // make ref to this input to be used on sumbiting firstname
        onChangeText={onLastNameChange}
        returnKeyType={returnKeyType}
        blurOnSubmit={ blurOnSubmitLast }
        onSubmitEditing={onSubmitEditing}
        onBlur={() => setIsFocusedLast(false)}
        onFocus={() => setIsFocusedLast(true)} />
      </FormItem>
    </View>
  )
}

const styles = StyleSheet.create({
  formItem: {
    backgroundColor: '#2f2f2f',
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
