import React, { Component } from 'react'
import { View, StyleSheet, TextInput, Image, KeyboardAvoidingView, TouchableOpacity} from 'react-native'
import {
  Button,
  Text,
  Label,
  Form,
  Item as FormItem,
  Input,
} from 'native-base'
import PasswordInput from "../components/PasswordInput"
import Register from './Register'
import MaherStatusBar from '../components/MaherStatusBar'


export default class Login extends Component {
  static navigationOptions = {
        headerShown: false
    }
  state = {
    email: '',
    password: '',
  }
  render() {
    const { email, password } = this.state
    const { navigation } = this.props

    return (
        <View style={styles.container}>
          <MaherStatusBar backgroundColor='#121212' barStyle="light-content" />
          <View style={styles.logo}>
            <Image
              style={{width: 150, height: 150}}
              source={require('../assets/logo.png')}
            />
          </View>
          <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
            <Form>
              <FormItem floatingLabel style={styles.formItem}>
                <Label style={styles.label}>Email</Label>
                <Input placeholder="Email"
                style={styles.textInput}
                value={this.state.email}
                onChangeText={(email) => this.setState({email})} />
              </FormItem>
              <PasswordInput handlePasswordChange={(password) => this.setState({password})} />
              <Button full primary style={styles.loginBtn} disabled= {email=="" || password == "" ? true : false}>
                <Text style={styles.loginBtnText}> Log in </Text>
              </Button>
            </Form>
          </KeyboardAvoidingView>
          <View style={{flex: 1, flexDirection: 'row' ,flexWrap:'wrap', justifyContent: 'center', marginTop: 30}}>
            <Text>
              Forget your password?
            </Text>
            <TouchableOpacity>
              <Text style={{fontWeight: 'bold', marginLeft: 5}}>
                Reset Password
              </Text>
            </TouchableOpacity>
            <View style={{width: "100%", alignItems: 'center', marginTop:30, marginBottom: 25}}>
              <Text style={{color: 'rgba(255, 255, 255, 0.6)'}}>
                <Text style={{color: 'rgba(255, 255, 255, 0.2)'}}>────────────  </Text>
                OR
                <Text style={{color: 'rgba(255, 255, 255, 0.2)'}}> ────────────</Text>
                </Text>
            </View>
            <Text>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{fontWeight: 'bold', marginLeft: 5}}>
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
  },
  logo: {
    alignSelf: 'center',
    margin: 40
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
