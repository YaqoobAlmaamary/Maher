import React, { Component } from 'react'
import { View, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Image} from 'react-native'
import {
  Left,
  Right,
  Body,
  Title,
  Button,
  Text,
  Form,
  Item as FormItem,
  Input,
  Label,
} from 'native-base'
import { Ionicons } from '@expo/vector-icons'
import TextButton from '../components/TextButton'
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button'
import CountryPicker from "../components/CountryPicker"
import PasswordInput from "../components/PasswordInput"
import DateButton from "../components/DateButton"
import SkillsInput from '../components/SkillsInput'
import SkillTagWithRemove from '../components/SkillTagWithRemove'

export default class Register extends Component {
  state = {
    step: 1,
    firstname: '',
    lastname: '',
    username: '',
    date: '',
    gender: '',
    country: '',
    email: '',
    password: '',
    skills: [],
  }
  handleNext = () => {
    this.setState(() => ({
      step: this.state.step+1
    }))
  }
  handleBack = () => {
    this.setState(() => ({
      step: this.state.step-1
    }))
  }
  handleUserNameChange = (username) => {
    //todo ---> check username availability
    this.setState(() => ({
      username
    }))

  }
  handleEmailChange = (email) => {
    //todo ---> check email availability
    this.setState(() => ({
      email
    }))

  }
  handlePasswordChange = (password) => {
    //todo ---> check password
    this.setState(() => ({
      password
    }))

  }

  setDate = (date) => {
    date = date || this.state.date;
    this.setState({
      date,
    })
  }
  handleAddSkill = (skill) => {
    this.setState({
      skills: this.state.skills.concat(skill)
    })
  }
  removeSkill = (removedSkill) => {
    this.setState({
      skills: this.state.skills.filter((skill) => skill !== removedSkill)
    })
  }

  getFormattedDate = (date) => {
    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()
  }

  render() {
    const { step } = this.state
    // firstname and lastname
    if (step == 1) {
      return (

          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>What's your Name?</Text>
              <View style={styles.nameInput}>
                <FormItem floatingLabel style={[styles.formItem, { width: 157.5, marginRight:7.5}]}>
                  <Label style={styles.label}>First name</Label>
                  <Input placeholder="first name"
                  style={styles.textInput}
                  value={this.state.firstname}
                  autoFocus={true}
                  returnKeyType = { "next" }
                  blurOnSubmit={ false }
                  onSubmitEditing={() => { this.lastNameInput._root.focus() }} //to move to lastname input using keyboard
                  onChangeText={(firstname) => this.setState({firstname}) }/>
                </FormItem>
                <FormItem floatingLabel style={[styles.formItem, { width: 157.5, marginLeft:7.5}]}>
                  <Label style={styles.label}>Last name</Label>
                  <Input placeholder="last name"
                  style={styles.textInput}
                  value={this.state.lastname}
                  getRef={input => { this.lastNameInput = input }} // make ref to this input to be used on sumbiting firstname
                  onChangeText={(lastname) => this.setState({lastname}) } />
                </FormItem>
              </View>
              <View style={[styles.textButtonContainer,{justifyContent: 'flex-end'}]}>
                <TextButton onPress={this.handleNext}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
          </KeyboardAvoidingView>

      )
    }
    // username
    if (step == 2) {
      return (

          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
            <Text style={{fontSize: 21,  marginLeft:20}}>Pick a user name</Text>
              <FormItem floatingLabel style={styles.formItem}>
                <Label style={styles.label}>User name</Label>
                <Input placeholder="username"
                style={styles.textInput}
                value={this.state.username}
                autoFocus={true}
                onChangeText={(username) => this.handleUserNameChange(username)}/>
              </FormItem>
              <View style={styles.textButtonContainer}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.handleNext}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
          </KeyboardAvoidingView>

      )
    }
    // birth date and gender
    if (step == 3) {
      const { date } = this.state
      const radio_props = [
        {label: 'Male', value: 0 },
        {label: 'Female', value: 1 }
      ]
      return (

          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <View style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>What's your birthday?</Text>
              {date != '' &&
                <Text style={{alignSelf: 'center', marginTop:20, color: 'rgba(255, 255, 255, 0.60)'}}>
                  {this.getFormattedDate(date)}</Text>}
              <DateButton date={date} setDate={this.setDate} />
              <Text style={{fontSize: 21, marginTop: 30, marginLeft:20}}>What's your gender?</Text>
              <RadioForm
                style={{alignSelf: 'center', marginTop:20}}
                radio_props={radio_props}
                initial={this.state.gender}
                borderWidth={1}
                formHorizontal={false}
                labelHorizontal={true}
                buttonColor={'rgba(255, 255, 255, 0.87)'}
                selectedButtonColor={'#BB86FC'}
                buttonSize={13}
                labelStyle={{fontSize: 18, color: 'rgba(255, 255, 255, 0.87)', marginBottom:18}}
                animation={false}
                onPress={(value) => {this.setState({gender:value})}}
              />
              <View style={styles.textButtonContainer}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.handleNext} disabled={date == '' ? true : false}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </View>
          </KeyboardAvoidingView>

      )
    }

    // Country Picker
    if (step == 4) {

      return (

          <View style={styles.container}>
            <View style={styles.inner}>
              <Text style={{ marginLeft: 10, fontSize: 21}}>
                What's your country?
              </Text>
              <View style={{margin: 15}}>
                <CountryPicker selectedLabel={this.state.country} setCountry={(country) => this.setState({country})} />
              </View>
              <View style={[styles.textButtonContainer, { marginTop: 80}]}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.handleNext}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </View>
          </View>

      )
    }

    // Email
    if (step == 5) {

      return (

          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>Enter Your Email Address</Text>
              <FormItem floatingLabel style={styles.formItem}>
                <Label style={styles.label}>Email</Label>
                <Input placeholder="Email"
                style={styles.textInput}
                value={this.state.email}
                autoFocus={true}
                onChangeText={(email) => this.handleEmailChange(email)} />
              </FormItem>
              <View style={styles.textButtonContainer}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.handleNext}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
          </KeyboardAvoidingView>

      )
    }

    // Password
    if (step == 6) {

      return (

          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>Choose a Password</Text>
              <PasswordInput
              autoFocus={true}
              handlePasswordChange={this.handlePasswordChange} />
              <View style={styles.textButtonContainer}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.handleNext}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
          </KeyboardAvoidingView>

      )
    }

    // Skills
    if (step == 7) {

      return (

          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20, marginTop: 15}}>Add your skills</Text>
              <SkillsInput
              handleAddSkill={this.handleAddSkill}
              autoFocus={true} />
              <Text style={{fontSize: 14,  marginLeft: 20, marginRight: 20, color: 'rgba(255, 255, 255, 0.6)'}}>
                languages, databases, libraries, tools, APIs, or design skills that you’re experienced with
              </Text>
              <View>
                <ScrollView horizontal style={{height: 80}}>
                  <View style={styles.skillTagsContainer}>
                    {this.state.skills.length != 0 &&
                      this.state.skills.map((skill) => (
                        <SkillTagWithRemove removeSkill={this.removeSkill} skill={skill} />
                      ))}
                  </View>
                </ScrollView>
              </View>
              <View style={[styles.textButtonContainer], {paddingBottom: 30}}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
              </View>
            </Form>
          </KeyboardAvoidingView>

      )
    }

  }
}

// override default styling
const styles = StyleSheet.create({
  container : {
    flex:1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
  },
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
  loginBtn: {
    paddingTop: 8,
    borderRadius: 4,
    height: 40,
    width: 150,
    alignSelf: 'center',
    margin:10,
  },
  textButton: {
    color: '#000000',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 1.25,
    textTransform: 'capitalize',
  },
  textButtonContainer: {
    flexDirection:'row',
    justifyContent: 'space-between',
    marginTop: 50
  },
  skillTagsContainer: {
    flexDirection:'row',
    flexWrap: 'wrap',
    marginTop: 15,
  }
})
