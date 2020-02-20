import React, { Component } from 'react'
import { View, KeyboardAvoidingView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native'
import { Form, Item as FormItem, Label, Button, Input, Text } from 'native-base'
import { TextInputWithMsg } from '../components/Inputs'
import { withFirebaseHOC } from '../../config/Firebase'

function SuccessModal(props) {
  const { hideModal, modalVisible, navigation, email} = props
  return (
      <View>
        <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
           <View style={{backgroundColor: '#2f2f2f', padding: 25, paddingRight: 30, margin:20, justifyContent: 'center', borderRadius: 4}}>
              <Text style={{fontSize: 24}}>Password Reset email is sent</Text>
              <Text style={{marginTop: 10}}>Email is sent to {email} follow the link to reset your password</Text>
              <View style={{alignSelf: 'center', marginTop: 30, backgroundColor: 'transparent'}}>
                <TouchableOpacity style={{ borderWidth: 0.5, borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 5, padding: 5 ,paddingLeft: 20, paddingRight: 20}}
                 onPress={() => {
                   navigation.goBack()
                   hideModal()
                 }}>
                  <Text style={{fontSize: 18, color: '#BB86FC'}}>OK, Got it</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    )
}

class ResetPassword extends Component {
  state={
    email: '',
    emailError: '',
    submiting: false,
    modalVisible: false,
  }

  submit = () => {
    const { firebase, navigation } = this.props
    const { email } = this.state

    this.setState({
      submiting: true
    })
    firebase.sendPasswordResetEmail(email)
      .then(() => {
        this.setState({
          modalVisible: true,
          submiting: false
        })
      })
      .catch((error) => {
        if(error.code === 'auth/invalid-email'){
          this.setState({
            emailError: 'invalid email'
          })
        }
        if(error.code === 'auth/user-not-found'){
          this.setState({
            emailError: 'No account is associated with this email'
          })
        }
        this.setState({
          submiting: false
        })
      })

  }

  render() {
    const { email, emailError, submiting, modalVisible } = this.state

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <Form style={styles.inner}>
            <Text style={{fontSize: 21,  marginLeft:20}}>Enter your registered email</Text>
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
            {submiting == true && <ActivityIndicator style={{marginLeft:20, alignSelf: 'flex-start'}} size="small" color='#BB86FC' />}
            <Button full primary style={styles.resetBtn} onPress={this.submit} disabled= {email=="" || submiting || emailError !== '' ? true : false}>
                <Text style={styles.resetBtnText}> reset password </Text>
            </Button>
          </Form>
          <SuccessModal
          navigation={this.props.navigation}
          modalVisible={modalVisible}
          email={email}
          hideModal={() => {
            this.setState({
              modalVisible: false
            })
          }} />
        </KeyboardAvoidingView>
    )
  }
}
const styles = StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  resetBtn: {
    borderRadius: 4,
    height: 40,
    alignSelf: 'center',
    margin: 25,
  },
  resetBtnText: {
    color: '#000',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 1.25,
    textTransform: 'capitalize',
  }
})

export default withFirebaseHOC(ResetPassword)
