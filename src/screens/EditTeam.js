import React, { Component } from 'react'
import { View, KeyboardAvoidingView, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native'
import { Form, Item as FormItem, Label, Button, Input, Text, H3, Textarea } from 'native-base'
import { TextInputWithMsg, TextArea } from '../components/Inputs'
import { withFirebaseHOC } from '../../config/Firebase'

class CreateTeam extends Component {
  state = {
    isReady: false,
    name: '',
    mainIdea: '',
    ideaDescription: '',
    needTo: '',
    nameError: '',
  }
  update = async () => {
    if(this.state.name.replace(/\s/g, '') == ""){
      this.setState({
        nameError: "Team name is required"
      })
    }
    else {
      this.setState({submiting: true})

      const { teamId, hackathonId } = this.props.route.params
      const updatedData = {
        name: this.state.name,
        mainIdea: this.state.mainIdea,
        ideaDescription: this.state.ideaDescription,
        needTo: this.state.needTo,
      }

      await this.props.firebase.getTeamDoc(hackathonId, teamId).update(updatedData)
      this.props.navigation.goBack()
    }
  }
  async componentDidMount() {
    this.props.navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: 'Edit Team Profile'
    })
    const {teamId, hackathonId} = this.props.route.params

    const teamDoc = await this.props.firebase.getTeamDoc(hackathonId, teamId).get()
    const team = teamDoc.data()

    this.setState({
      isReady: true,
      name: team.name,
      mainIdea: team.mainIdea,
      ideaDescription: team.ideaDescription,
      needTo: team.needTo,
    })
  }
  render() {
    const { hackathonId } = this.props.route.params
    const { isReady, name, mainIdea, ideaDescription, needTo, nameError, submiting } = this.state
    if(!isReady){
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    return (
        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : ""}>
          <ScrollView>
            <Form>
              <H3 style={styles.label}>Team Name*</H3>
              <TextInputWithMsg
                label="Team Name"
                value={name}
                error={nameError}
                onChangeText={(name) => {
                    this.setState({
                      name,
                      nameError: ''
                    })
                  }} />
              <H3 style={styles.label}>Main Idea</H3>
              <TextInputWithMsg
                label="What's your idea?"
                value={mainIdea}
                onChangeText={(mainIdea) => this.setState({mainIdea})} />
              <H3 style={styles.label}>Description of the idea</H3>
              <TextArea
                rowSpan={4}
                placeholder="A description of the idea"
                value={ideaDescription}
                onChangeText={(ideaDescription) => this.setState({ideaDescription})} />
              <H3 style={styles.label}>Skills required</H3>
              <TextInputWithMsg
                placeholder="I need to..."
                value={needTo}
                onChangeText={(needTo) => this.setState({needTo})}/>
              {submiting ?
                <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
              : <Button style={styles.btn} onPress={this.update}>
                  <Text style={styles.btnText}>update</Text>
                </Button>
              }
            </Form>
          </ScrollView>
        </KeyboardAvoidingView>
    )
  }
}
const styles = StyleSheet.create({
  label: {
    marginTop: 15,
    marginLeft: 15,
    marginBottom: 5
  },
  btn: {
    alignSelf: 'center',
    justifyContent:'center',
    borderRadius: 5,
    margin: 15,
    paddingRight: 15,
    paddingLeft: 15
  },
  btnText: {
    color: '#1e1e1e',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1.25,
    textTransform: 'uppercase'
  },
})

export default withFirebaseHOC(CreateTeam)
