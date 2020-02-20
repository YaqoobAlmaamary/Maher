import React, { Component } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView,
  Keyboard, BackHandler, ActivityIndicator, Modal, TouchableOpacity} from 'react-native'
import {
  Text,
  Form,
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
import { NameInput, TextInputWithMsg } from '../components/Inputs'

function CancelAlert (props) {
  const {showAlertFunc, showAlert, hideAlert, navigation} = props

  // show alert when back button is pressed on android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
         showAlertFunc()
      }

      BackHandler.addEventListener('hardwareBackPress', onBackPress)

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress)
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

function ConfirmationModal(props) {
  const { hideModal, modalVisible, submiting, email} = props
  return (
      <View>
        <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
            {submiting ? <ActivityIndicator size="large" color='#BB86FC' />
              : <View style={{backgroundColor: '#2f2f2f', padding: 25, paddingRight: 30, margin:20, justifyContent: 'center', borderRadius: 8}}>
                  <Text style={{fontSize: 24}}>You've successfully registered 🎉</Text>
                  <Text style={{marginTop: 10}}>A confirmation email is sent to {email}, please follow the link to confirm your email</Text>
                  <Text style={{marginTop: 10}}>Thank you</Text>
                  <View style={{alignSelf: 'center', marginTop: 30, backgroundColor: 'transparent'}}>
                    <TouchableOpacity style={{ borderWidth: 0.5, borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 8, padding: 5 ,paddingLeft: 20, paddingRight: 20}}
                     onPress={() => {
                       props.navigation.goBack()
                       hideModal()
                     }}>
                      <Text style={{fontSize: 18, color: '#BB86FC'}}>OK, Got it</Text>
                    </TouchableOpacity>
                  </View>
                </View>}
          </View>
        </Modal>
      </View>
    )
}

function TextButtonsNav({back, next, disabled, submiting}){
  return (
    <View style={[styles.textButtonContainer, !back && {justifyContent: 'flex-end'} ]}>
      {back && <TextButton onPress={back.onPress}>
        <Ionicons name='ios-arrow-back' size={21} /> {back.text}
      </TextButton>}
      {submiting ? <ActivityIndicator style={{marginRight: 15}} size="large" color='#BB86FC' />
        : <TextButton onPress={next.onPress} disabled={disabled}>
            {next.text} <Ionicons name='ios-arrow-forward' size={21} />
          </TextButton>}
    </View>
  )
}

class Register extends Component {
  state = {
    step: 1,
    firstName: '',
    lastName: '',
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
    submiting: false,
    modalVisible: false
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
    date = date || this.state.date
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
  validateEmail = () => { // in step 4
    const { firebase } = this.props
    const { email } = this.state
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email)){
      this.setState({
        submiting: true,
      })
      firebase.fetchSignInMethodsForEmail(email)
        .then((response) => {
          if(response.length < 1){ // means no account is associated with that email
            // move to next step
            this.setState({
              step: 5
            })
          }
          else {
            this.setState(() => ({
              emailError: 'email already used'
            }))
          }
          this.setState({
            submiting: false,
          })
        })
        .catch((error) => {
          console.log(error)
        })
    }
    else {
        this.setState(() => ({
          emailError: 'invalid email address'
        }))
    }
  }
  validateUsername = () => { // in step 5
    const { firebase } = this.props
    const { username } = this.state
    if(username.length < 3){
      this.setState(() => ({
        usernameError: 'username should be at least 3 characters'
      }))
    }
    else {
      this.setState({
        submiting: true,
      })
      firebase.getUsernameData(username)
        .then((doc) => {
          if(doc.empty){
            // move to next step
            this.setState({
              step: 6
            })
          }
          else {
            this.setState(() => ({
              usernameError: 'username already exists'
            }))
          }
          this.setState({
            submiting: false,
          })
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
  confirmRegister = () => {
    const { firebase } = this.props
    const { email, password } = this.state


    this.setState({
      submiting: true,
      modalVisible: true
    })
    this.props.route.params.registerRequest()

    firebase.signupWithEmail(email, password)
      .then((response) => {
        const userData = {
            uid: response.user.uid,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            username: this.state.username,
            birthdate: this.getFormattedDate(this.state.date),
            gender: this.state.gender,
            country: this.state.country,
            email: this.state.email,
            skills: this.state.skills
        }
        response.user.sendEmailVerification()
          .then(() => {
            firebase.createNewUser(userData)
              .then(() => {
                response.user.updateProfile({
                  displayName: userData.firstName+" "+userData.lastName,
                }).then(() => {
                  firebase.signOut().then(() => {
                    this.setState({
                      submiting: false
                    })
                  })
                })
              })
          })
      })
      .catch((error) => {
        this.setState({
          modalVisible: false,
          submiting: false
        })
        if(error.code === 'auth/email-already-in-use'){
          this.setState({
            step: 4,
            emailError: 'email already used'
          })
        }
        if (error.code === 'auth/invalid-email'){
          this.setState({
            step: 4,
            emailError: 'invalid email address',
          })
        }
        if(error.code === 'auth/weak-password'){
          this.setState({
            step: 6,
            passwordError: 'password is too week',
          })
        }
        else {
          console.log(error.code)
        }
      })

  }

  render() {
    const { navigation } = this.props
    // configure header bar
    navigation.setOptions({
      title: 'Create new account',
      headerTitleAlign: 'center',
      headerRight: () => (
        <TextButton
        onPress={() => {
          this.showAlert()
        }}
        style={{fontSize: 16, margin: 15, letterSpacing: 0, textTransform: 'capitalize',}}>
          Cancel
        </TextButton>
      ),
      headerLeft: null,
    })

    const { step, firstName, lastName, date, gender, country, email, emailError,
      submiting, username, usernameError, password, passwordError, skills } = this.state
    const radio_props = [
      {label: 'Male', value: 0 },
      {label: 'Female', value: 1 }
    ]

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">

      {// firstName and lastName
        step == 1 &&
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>What's your Name?</Text>
              <NameInput
                autoFocus={true}
                values={{firstName: firstName, lastName: lastName}}
                onFirstNameChange={(firstName) => this.setState({firstName})}
                onLastNameChange={(lastName) => this.setState({lastName})} />
              <TextButtonsNav disabled={(firstName == '' || lastName == '') ? true : false}
                next={{text:"Next", onPress:() => this.setState({step: 2}) }}
              />
            </Form>}

      {// birth date and gender
        step == 2 &&
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
              <TextButtonsNav disabled={(date === '' || gender === '') ? true : false}
                back={{text:"Back", onPress:() => this.setState({step: this.state.step-1}) }}
                next={{text:"Next", onPress:() => this.setState({step: 3}) }}
              />
            </View>}

      {// country
        step == 3 &&
            <View style={styles.inner}>
              <Text style={{ marginLeft: 10, fontSize: 21}}>
                What's your country?
              </Text>
              <View style={{margin: 15}}>
                <CountryPicker
                  selectedLabel={this.state.country}
                  setCountry={(country) => this.setState({country})}
                />
              </View>
              <TextButtonsNav disabled={country === '' ? true : false}
                back={{text:"Back", onPress:() => this.setState({step: this.state.step-1}) }}
                next={{text:"Next", onPress:() => this.setState({step: 4}) }}
              />
            </View>}

      {// Email
        step == 4 &&
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>Enter Your Email Address</Text>
              <TextInputWithMsg
                autoFocus={true}
                value={email}
                error={emailError}
                label={"Email"}
                placeholder={"Email"}
                onChangeText={(email) => {
                  emailError &&
                    this.setState({emailError: ''})
                  !submiting && // if submiting is true, prevent from editing the text
                    this.setState({email: email.trim()})
                }}
              />
              <TextButtonsNav disabled={email === '' || emailError !== '' ? true : false} submiting={submiting}
                back={{text:"Back", onPress:() => this.setState({step: this.state.step-1}) }}
                next={{text:"Next", onPress: this.validateEmail }}
              />
            </Form>}

      {// username
        step == 5 &&
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>Pick a user name</Text>
              <TextInputWithMsg
                autoFocus={true}
                value={username}
                error={usernameError}
                label={"User name"}
                placeholder={"username"}
                onChangeText={(username) => {
                  usernameError &&
                    this.setState({usernameError: ''})
                  !submiting && // if submiting is true, prevent from editing the text
                    this.setState({username: username.trim()})
                }}
              />
              <TextButtonsNav disabled={username == '' || usernameError !== '' ? true : false} submiting={submiting}
                back={{text:"Back", onPress:() => this.setState({step: this.state.step-1}) }}
                next={{text:"Next", onPress: this.validateUsername }}
              />
            </Form>}

      {// Password
        step == 6 &&
            <Form style={styles.inner}>
              <Text style={{fontSize: 21,  marginLeft:20}}>Choose a Password</Text>
              <PasswordInput
                value={password}
                autoFocus={true}
                error={passwordError}
                handlePasswordChange={this.handlePasswordChange} />
              {passwordError !== '' && <Text style={{marginLeft:20, color: '#CF6679'}}>{passwordError}</Text>}
              <TextButtonsNav disabled={password === '' || passwordError !== '' ? true : false}
                back={{text:"Back", onPress:() => this.setState({step: this.state.step-1}) }}
                next={{text:"Next", onPress:() => this.setState({step: 7}) }}
              />
            </Form>}

      {// Skills
        step == 7 &&
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
                <ScrollView horizontal style={{height: 60}}>
                  <View style={styles.skillTagsContainer}>
                    {this.state.skills.length != 0 &&
                      this.state.skills.map((skill) => (
                        <SkillTagWithRemove key={skill} removeSkill={this.removeSkill} skill={skill} />
                      ))}
                  </View>
                </ScrollView>
                {skills.length > 0 &&
                  <Text style={{fontSize: 14, margin: 0, color: 'rgba(255, 255, 255, 0.6)'}}>
                    skills added: {skills.length}
                  </Text>}
              </View>
              <TextButtonsNav disabled={skills.length === 0 ? true : false}
                back={{text:"Back", onPress:() => this.setState({step: this.state.step-1}) }}
                next={{text:"Register", onPress:this.confirmRegister }}
              />
              <ConfirmationModal
              navigation={navigation}
              email={this.state.email}
              submiting={this.state.submiting}
              modalVisible={this.state.modalVisible}
              hideModal={() => this.setState({modalVisible: false})} />
            </Form>}
          <CancelAlert
            showAlert={this.state.showAlert}
            showAlertFunc={this.showAlert}
            hideAlert={this.hideAlert}
            navigation={navigation}
          />
      </KeyboardAvoidingView>
    )
  }
}


const styles = StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  textButtonContainer: {
    flexDirection:'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  skillTagsContainer: {
    flexDirection:'row',
    flexWrap: 'wrap',
    marginTop: 10,
  }
})

export default withFirebaseHOC(Register)
