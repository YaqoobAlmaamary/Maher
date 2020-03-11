import React, { Component } from 'react'
import { View, StyleSheet, TextInput, Image, KeyboardAvoidingView, TouchableOpacity, ActivityIndicator} from 'react-native'
import {
  Button,
  Text,
  Label,
  Form,
  Item as FormItem,
  Input,
} from 'native-base'
import { TextInputWithMsg } from '../components/Inputs'
import PasswordInput from "../components/PasswordInput"
import Register from './Register'
import MaherStatusBar from '../components/MaherStatusBar'
import { withFirebaseHOC } from '../../config/Firebase'


class Login extends Component {
  state = {
    email: '',
    password: '',
    error: '',
    submiting: false,
  }

  submit = () => {
    const { email, password } = this.state
    const { firebase } = this.props

    this.setState({
      submiting: true
    })

    firebase.loginWithEmail(email, password)
      .catch((error) => {
        if(error.code == 'auth/network-request-failed'){
          this.setState({
            error: 'Please check your internet connection',
            submiting: false
          })
        }
        else if(error.code == 'auth/invalid-email'){
          this.setState({
            error: 'Invalid Email',
            submiting: false
          })
        }
        else {
          this.setState({
            error: 'The email or password is incorrect',
            submiting: false
          })
        }
      })
  }
  render() {
    const { email, password, error, submiting } = this.state
    const { navigation } = this.props

    return (
        <View style={styles.container}>
          <View style={styles.logo}>
            <Image
              style={{width: 150, height: 150}}
              source={require('../assets/logo.png')}
            />
          </View>
          <KeyboardAvoidingView behavior="padding">
            <Form>
              <TextInputWithMsg
                value={email}
                error={error}
                label={"Email"}
                placeholder={"Email"}
                onChangeText={(email) => {
                  error &&
                    this.setState({error: ''})
                  !submiting && // if submiting is true, prevent from editing the text
                    this.setState({email: email.replace(/\s/g, '')})
                }}
              />
              <PasswordInput
                value={password}
                error={error !== '' ? ' ' : ''} // if error isn't empty then make error in the password field
                handlePasswordChange={(password) => {
                  error &&
                    this.setState({error: ''})
                  !submiting &&
                    this.setState({
                      password
                    })
                }} />
              {submiting ?
                <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
              : <Button full primary style={styles.loginBtn} onPress={this.submit} disabled= {email=="" || password == "" ? true : false}>
                  <Text style={styles.loginBtnText}> Log in </Text>
                </Button>
              }
            </Form>
          </KeyboardAvoidingView>
          <View style={{flexDirection: 'row', flexWrap:'wrap', justifyContent: 'center', marginTop: 30}}>
            <Text>
              Forget your password?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reset Password')}>
              <Text style={{fontFamily: 'Roboto_medium' , fontSize: 17 ,color: '#BB86FC', marginLeft: 5, opacity: 0.8}}>
                Reset Password
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', flexWrap:'wrap', justifyContent: 'center', marginTop: 25}}>
            <View style={{flex: 1, justifyContent: 'center', paddingLeft: 10, paddingRight: 5}}>
              <View style={{borderColor: 'rgba(255, 255, 255, 0.3)' ,borderBottomWidth: 1}} />
            </View>
            <Text style={{color: 'rgba(255, 255, 255, 0.6)'}}>
              OR
            </Text>
            <View style={{flex: 1, justifyContent: 'center', paddingLeft: 5, paddingRight: 10}}>
              <View style={{borderColor: 'rgba(255, 255, 255, 0.3)' ,borderBottomWidth: 1}} />
            </View>
          </View>
          <View style={{flexDirection: 'row', flexWrap:'wrap', justifyContent: 'center', marginTop: 25}}>
            <Text>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{fontFamily: 'Roboto_medium' , fontSize: 17 ,color: '#BB86FC', marginLeft: 5, opacity: 0.8}}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
    )
  }
}

// override default styling
const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: 'center'
  },
  logo: {
    alignSelf: 'center',
    marginTop: 0,
    margin: 30,
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
  loginBtn: {
    borderRadius: 4,
    height: 40,
    width: 150,
    alignSelf: 'center',
    margin: 25,
  },
  loginBtnText: {
    color: '#000',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 1.25,
    textTransform: 'capitalize',
  }
})

export default withFirebaseHOC(Login)
