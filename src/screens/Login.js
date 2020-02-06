import React, { Component } from 'react'
import { View, StyleSheet, TextInput, Image} from 'react-native'
import {
  Button,
  Text,
  Form,
  Item as FormItem,
  Input,
} from 'native-base'


export default class Login extends Component {
  render() {


    return (
      <View>
        <View style={styles.logo}>
          <Image
            style={{width: 150, height: 150}}
            source={require('../assets/logo.png')}
          />
        </View>
        <Form>
          <FormItem style={styles.formItem}>
              <Input placeholder="email or username" style={styles.textInput} />
          </FormItem>
          <FormItem style={styles.formItem}>
            <Input secureTextEntry={true} placeholder="password" style={styles.textInput} />
          </FormItem>
          <Button full primary style={styles.loginBtn}>
            <Text style={styles.loginBtnText}> Log in </Text>
          </Button>
        </Form>
      </View>
    )
  }
}

// override default styling
const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    margin:50
  },
  formItem: {
    borderColor: '#2f2f2f',
    margin: 20,
    marginTop: 0,
  },
  textInput: {
    backgroundColor: '#2f2f2f',
    borderRadius: 4,
    height: 50,
  },
  loginBtn: {
    paddingTop: 8,
    borderRadius: 4,
    height: 40,
    width: 150,
    alignSelf: 'center',
    margin:10,
  },
  loginBtnText: {
    color: '#000000',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 1.25,
    textTransform: 'capitalize',
  }
})
