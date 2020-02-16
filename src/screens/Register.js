import React, { Component } from 'react'
import { View, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Image, Alert, Keyboard, BackHandler} from 'react-native'
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
import AwesomeAlert from 'react-native-awesome-alerts'
import { useFocusEffect } from '@react-navigation/native'
import { withFirebaseHOC } from '../../config/Firebase'

function CancelAlert (props) {
  const {showAlertFunc, showAlert, hideAlert, navigation} = props

  // show alert when back button is pressed on android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
         showAlertFunc()
      }

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    })
  )

  showAlert &&
    Keyboard.dismiss() //disable keyboard when alert shows up
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Do you want to stop creating your account?"
        message="If you stop now, you'll lose any progress you've made."
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="No, continue"
        confirmText="Yes, Stop"
        confirmButtonColor="#383838"
        cancelButtonColor="#BB86FC"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          hideAlert()
          navigation.goBack()
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 18}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 16}}
        contentContainerStyle={{backgroundColor: '#2e2e2e'}}
        cancelButtonTextStyle={{fontSize: 16}}
        confirmButtonTextStyle={{fontSize: 16}}
      />
  )
}

class Register extends Component {
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
    showAlert: false,
    emailError: '',
    passwordError: '',
    usernameError: '',
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
    if(this.state.usernameError !== '') {
      this.setState(() => ({
        usernameError: ''
      }))
    }
    this.setState(() => ({
      username: username.trim()
    }))

  }
  handleEmailChange = (email) => {
    //todo ---> check email availability
    if(this.state.emailError !== '') {
      this.setState(() => ({
        emailError: ''
      }))
    }
    this.setState(() => ({
      email: email.trim()
    }))

  }
  handlePasswordChange = (password) => {
    //todo ---> check password
    if(this.state.passwordError === '' && password.length < 6) {
      this.setState(() => ({
        passwordError: 'password should be at least 6 characters'
      }))
    }
    else if(password.length >= 6) {
      this.setState(() => ({
        passwordError: ''
      }))
    }

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
  showAlert = () => {
    this.setState({
      showAlert: true
    })
  }

  hideAlert = () => {
    this.setState({
      showAlert: false
    })
  }

  validateEmail = () => {
   if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email))
    {
      this.handleNext()
      return (true)
    }
      this.setState(() => ({
        emailError: 'invalid email address'
      }))
      return (false)
  }

  validateUsername = (next) => {
    const { firebase } = this.props
    const { username } = this.state
    if(username.length < 3){
      this.setState(() => ({
        usernameError: 'username should be at least 3 characters'
      }))
    }
    else {
      firebase.getUsernameData(username)
        .then((doc) => {
          if(doc.empty){
            this.handleNext()
          }
          else {
            this.setState(() => ({
              usernameError: 'username already exists'
            }))
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  confirmRegister = () => {
    const { firebase } = this.props
    const { email, password } = this.state

    firebase.signupWithEmail(email, password)
      .then((response) => {
        const userData = {
            uid: response.user.uid,
            firstname: this.state.firstname,
            lastname: this.state.lastname,
            username: this.state.username,
            birthdate: this.getFormattedDate(this.state.date),
            gender: this.state.gender,
            country: this.state.country,
            email: this.state.email,
            skills: this.state.skills
        }
        firebase.createNewUser(userData)
          .then(() => {
            this.props.navigation.goBack()
          })
      })
      .catch((error) => {
        console.log(error)
      })

  }

  render() {
    const { step } = this.state
    const { navigation } = this.props
    // configure header bar
    navigation.setOptions({
      title: 'Create new account',
      headerTitleAlign: 'center',
      headerRight: () => (
        <TextButton
        onPress={() => {
          this.showAlert();
        }}
        style={{fontSize: 16, margin: 15, letterSpacing: 0, textTransform: 'capitalize',}}>
          Cancel
        </TextButton>
      ),
      headerLeft: null,
    })



    // firstname and lastname
    if (step == 1) {
      const { firstname, lastname } = this.state

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
                <TextButton onPress={this.handleNext} disabled={(firstname == '' || lastname == '') ? true : false}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
            <CancelAlert showAlert={this.state.showAlert} showAlertFunc={this.showAlert} hideAlert={this.hideAlert} navigation={navigation} />
          </KeyboardAvoidingView>
      )
    }
    // username
    if (step == 2) {
      const { username, usernameError } = this.state

      return (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
            <Text style={{fontSize: 21,  marginLeft:20}}>Pick a user name</Text>
              <FormItem floatingLabel style={[styles.formItem, usernameError !== '' && {borderColor: '#CF6679',}]}>
                <Label style={styles.label}>User name</Label>
                <Input placeholder="username"
                style={styles.textInput}
                value={this.state.username}
                autoFocus={true}
                onChangeText={(username) => this.handleUserNameChange(username)}/>
              </FormItem>
              {usernameError !== '' && <Text style={{marginLeft:20, color: '#CF6679'}}>{usernameError}</Text>}
              <View style={styles.textButtonContainer}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.validateUsername} disabled={username == '' || usernameError !== '' ? true : false}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
            <CancelAlert showAlert={this.state.showAlert} showAlertFunc={this.showAlert} hideAlert={this.hideAlert} navigation={navigation} />
          </KeyboardAvoidingView>
      )
    }
    // birth date and gender
    if (step == 3) {
      const { date, gender } = this.state
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
                <TextButton onPress={this.handleNext} disabled={(date === '' || gender === '') ? true : false}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </View>
            <CancelAlert showAlert={this.state.showAlert} showAlertFunc={this.showAlert} hideAlert={this.hideAlert} navigation={navigation} />
          </KeyboardAvoidingView>
      )
    }

    // Country Picker
    if (step == 4) {
      const { country } = this.state

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
                <TextButton onPress={this.handleNext} disabled={country === '' ? true : false}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </View>
            <CancelAlert showAlert={this.state.showAlert} showAlertFunc={this.showAlert} hideAlert={this.hideAlert} navigation={navigation} />
          </View>
      )
    }

    // Email
    if (step == 5) {
      const { email, emailError } = this.state

      return (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>Enter Your Email Address</Text>
              <FormItem floatingLabel style={[styles.formItem, emailError !== '' && {borderColor: '#CF6679',}]}>
                <Label style={styles.label}>Email</Label>
                <Input placeholder="Email"
                style={styles.textInput}
                value={this.state.email}
                autoFocus={true}
                onChangeText={(email) => this.handleEmailChange(email)} />
              </FormItem>
              {emailError !== '' && <Text style={{marginLeft:20, color: '#CF6679'}}>{emailError}</Text>}
              <View style={styles.textButtonContainer}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.validateEmail} disabled={email === '' || emailError !== '' ? true : false}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
            <CancelAlert showAlert={this.state.showAlert} showAlertFunc={this.showAlert} hideAlert={this.hideAlert} navigation={navigation} />
          </KeyboardAvoidingView>
      )
    }

    // Password
    if (step == 6) {
      const { password, passwordError } = this.state

      return (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>Choose a Password</Text>
              <PasswordInput
              value={password}
              autoFocus={true}
              error={passwordError}
              handlePasswordChange={this.handlePasswordChange} />
              {passwordError !== '' && <Text style={{marginLeft:20, color: '#CF6679'}}>{passwordError}</Text>}
              <View style={styles.textButtonContainer}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.handleNext} disabled={password === '' || passwordError !== '' ? true : false}>
                  Next <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
            <CancelAlert showAlert={this.state.showAlert} showAlertFunc={this.showAlert} hideAlert={this.hideAlert} navigation={navigation} />
          </KeyboardAvoidingView>
      )
    }

    // Skills
    if (step == 7) {
      const { skills } = this.state

      return (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>Add your skills</Text>
              <Text style={{fontSize: 14,  marginLeft: 20, marginRight: 20, color: 'rgba(255, 255, 255, 0.6)'}}>
                add at least one skill to continue
              </Text>
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
              <View style={styles.textButtonContainer}>
                <TextButton onPress={this.handleBack}>
                  <Ionicons name='ios-arrow-back' size={21} /> Back
                </TextButton>
                <TextButton onPress={this.confirmRegister} disabled={skills.length === 0 ? true : false}>
                  Register <Ionicons name='ios-arrow-forward' size={21} />
                </TextButton>
              </View>
            </Form>
            <CancelAlert showAlert={this.state.showAlert} showAlertFunc={this.showAlert} hideAlert={this.hideAlert} navigation={navigation} />
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
    marginTop: 15,
  },
  skillTagsContainer: {
    flexDirection:'row',
    flexWrap: 'wrap',
    marginTop: 15,
  }
})

export default withFirebaseHOC(Register)
