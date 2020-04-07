import React, {useState} from 'react'
import { View, StyleSheet } from 'react-native'
import { Item as FormItem, Label, Input, Text, Textarea } from 'native-base'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export function TextInputWithMsg({autoFocus, value, label, placeholder, onChangeText, error, success, onSubmitEditing, returnKeyType, blurOnSubmit}){
  const [isFocused, setIsFocused] = useState(false)
  return (
    <View>
      <FormItem floatingLabel
        style={[styles.formItem,
          (isFocused) &&
            {borderColor: '#BB86FC',},
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
        returnKeyType={returnKeyType}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)} />
      </FormItem>
      {(error != null && error !== '') && <Text style={{marginLeft:20, color: '#CF6679'}}>{error}</Text>}
      {(success != null && success !== '') && <Text style={{marginLeft:20, color: '#01A299'}}><MaterialCommunityIcons name="check" size={18} /> {success}</Text>}
    </View>
  )
}

export function TextArea({rowSpan, placeholder, value, onChangeText}) {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <Textarea
      style={[styles.textArea, (isFocused) && {borderColor: '#BB86FC',}]}
      value={value}
      onChangeText={(s) =>  onChangeText(s)}
      rowSpan={rowSpan}
      placeholder={placeholder}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)} />
  )
}

const styles = StyleSheet.create({
  formItem: {
    backgroundColor: '#2f2f2f',
    borderColor: '#2f2f2f',
    paddingLeft: 5,
    margin: 15,
    marginBottom: 0,
    marginTop: 0,
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
  textArea:{
    backgroundColor: '#2f2f2f',
    borderBottomWidth: 1,
    padding: 10,
    margin: 15,
    marginBottom: 0,
    marginTop: 0,
    borderRadius: 4,
  }
})
