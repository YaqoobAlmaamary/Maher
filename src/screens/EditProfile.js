import React, { Component } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet, Image, FlatList, KeyboardAvoidingView, ActivityIndicator } from 'react-native'
import { Text, Form } from 'native-base'
import RadioForm from 'react-native-simple-radio-button'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NameInput, TextInputWithMsg } from '../components/Inputs'
import TextButton from '../components/TextButton'
import CountryPicker from "../components/CountryPicker"
import SkillsInput from '../components/SkillsInput'
import SkillTagWithRemove from '../components/SkillTagWithRemove'
import SkillTag from '../components/SkillTag'
import { withFirebaseHOC } from '../../config/Firebase'

class EditProfile extends Component {
  state = {
    isReady: false,
    userBefore: {},
    firstName: '',
    lastName: '',
    username: '',
    birthdate: '',
    gender: '',
    country: '',
    email: '',
    password: '',
    skills: [],
    usernameError: '',
    usernameMsg: '',
    showCountryPicker: false,
    showGenderRadio: false,
    showEditSkills: false

  }
  isChanged = () => {
    const { userBefore } = this.state
    const { firstName, lastName, username, birthdate, gender, country } = this.state

    return firstName != userBefore.firstName || lastName != userBefore.lastName || username != userBefore.username ||
      birthdate != userBefore.birthdate || gender != userBefore.gender || country != userBefore.country
  }
  usernameOnChange = (username) => {
    const { firebase } = this.props
    const { userBefore } = this.state

    if(username.length < 3) {
      this.setState(() => ({
        submiting: false,
        usernameMsg: '',
        usernameError: 'username should be at least 3 characters'
      }))
    }
    else {
      this.setState(() => ({
        usernameError: '',
        usernameMsg: '',
      }))
      if (userBefore.username != username) {
        this.setState({
          submiting: true
        })

        firebase.getUsernameData(username)
        .then((doc) => {
          if(username === this.state.username) {
            if(doc.empty){
              this.setState(() => ({
                submiting: false,
                usernameMsg: ' ',//just space is enough
              }))
            }
            else {
              this.setState(() => ({
                submiting: false,
                usernameError: 'username already exists',
              }))
            }
          }
        })

      }
      else {
        this.setState({
          submiting: false
        })
      }
    }
  }
  componentDidMount() {
    const { navigation } = this.props
    navigation.dangerouslyGetParent().dangerouslyGetParent().setOptions({ //hide tab bar
      tabBarVisible: false
    })
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TextButton onPress={() => navigation.goBack()}
        style={{margin: 0, color: 'rgba(255, 255, 255, 0.87)', margin: 5}}>
          <MaterialCommunityIcons name="close" size={35} />
        </TextButton>
      ),
      headerRight: () => (
        <TextButton style={{margin: 0, color: 'rgba(255, 255, 255, 0.87)', margin: 5}}>
          <MaterialCommunityIcons name="check" size={35} />
        </TextButton>
      ),
    })

    const { firebase } = this.props
    const uid = firebase.getCurrentUser().uid

    firebase.getUserDataOnce(uid)
      .then((querysnapshot) => {
        const user = querysnapshot.data()
        this.setState({ // two seperate setState ? cause of the labels above inputs.
          isReady: true
        })
        this.setState({
          userBefore: user,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          birthdate: user.birthdate,
          gender: user.gender,
          country: user.country,
          email: user.email,
          skills: user.skills,
        })
      })
  }

  render() {
    if(!this.state.isReady) {
      return (
        <View style={{alignItems: 'center'}}>
          <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
          <Text style={{color: '#BB86FC'}}>Getting your data</Text>
        </View>
      )
    }
    const { firstName, lastName, birthdate, gender, country, email, showCountryPicker, showGenderRadio,
      submiting, username, usernameError, usernameMsg, skills, showEditSkills } = this.state

    return (
      <ScrollView>
        <View style={{flex: 1}}>
          <Form>
            <View style={styles.imageContainer}>
              <Image
                style={styles.image}
                source={require('../assets/no-image.png')}
              />
              <TextButton style={{fontSize: 16}}>
                Change Profile Photo
              </TextButton>
            </View>
            <TextInputWithMsg
              value={username}
              error={usernameError}
              success={usernameMsg}
              label={"User name"}
              placeholder={"username"}
              onChangeText={(username) => {
                this.setState({
                  username
                })
                this.usernameOnChange(username)
              }}
            />
            {submiting && <ActivityIndicator style={{marginLeft:20, alignSelf: 'flex-start'}} size="small" color='#BB86FC' />}
            <NameInput
              values={{firstName: firstName, lastName: lastName}}
              onFirstNameChange={(firstName) => this.setState({firstName})}
              onLastNameChange={(lastName) => this.setState({lastName})} />
            <Text style={{marginLeft: 20, marginTop: 15, alignSelf: 'flex-start'}}>
              Your Skills <Text style={{color: 'rgba(255, 255, 255, 0.6)'}}>{skills.length}</Text>
            </Text>
            {!showEditSkills &&
              <View style={{marginRight: 10, marginLeft: 10, marginTop: 5, alignItems: 'center'}}>
                {skills.length != 0 &&
                  <FlatList
                    horizontal={ true}
                    data={skills}
                    renderItem={({item}) => <SkillTag skill={item} /> }
                    keyExtractor={(item) => item}
                  />
                }
                <TextButton style={{fontSize: 14, alignSelf: 'center', color: '#01A299', marginTop: 10}}
                  onPress={() => this.setState({showEditSkills: true})}>
                  {skills.length == 0 ? "Add skills" : "Edit my skills"}
                </TextButton>
              </View>
            }
            {showEditSkills &&
              <View style={{marginBottom: 20}}>
                <SkillsInput handleAddSkill={(skill) => {
                  this.setState({skills: skills.concat(skill)})
                }} />
                <ScrollView horizontal style={{height: 60}}>
                  <View style={styles.skillTagsContainer}>
                    {skills.length != 0 &&
                      skills.map((skill) => (
                        <SkillTagWithRemove key={skill} removeSkill={(removedSkill) => {
                          this.setState({skills: skills.filter((skill) => skill !== removedSkill)})
                        }}
                        skill={skill}
                        />
                      ))}
                  </View>
                </ScrollView>
              </View>
            }
            <Text style={{margin: 15, marginBottom: 10, fontSize: 18}}>Profile information</Text>
            <View style={{marginRight: 10, marginLeft: 10}}>
              <Text style={{margin: 10, marginBottom: 5}}>Email Address</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                <Text style={{marginLeft: 15, marginBottom: 5, marginRight: 5, color: 'rgba(255, 255, 255, 0.6)'}}>{email}</Text>
                <View style={{alignItems: 'center'}}>
                  <TextButton style={{margin: 0}}>
                    <MaterialCommunityIcons name="square-edit-outline" size={20} />
                  </TextButton>
                </View>
              </View>
              <Text style={{margin: 10, marginBottom: 5}}>Country</Text>
              {!showCountryPicker &&
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  <Text style={{marginLeft: 15, marginBottom: 5, marginRight: 5, color: 'rgba(255, 255, 255, 0.6)'}}>{country}</Text>
                  <View style={{alignItems: 'center'}}>
                    <TextButton style={{margin: 0}} onPress={() => this.setState({showCountryPicker: true})}>
                      <MaterialCommunityIcons name="square-edit-outline" size={20} />
                    </TextButton>
                  </View>
                </View>
              }
              {showCountryPicker &&
                <CountryPicker
                selectedLabel={country}
                setCountry={(country) => this.setState({country})}
              />
              }
              <Text style={{margin: 10, marginBottom: 5}}>Birth Date</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                <Text style={{marginLeft: 15, marginBottom: 5, marginRight: 5, color: 'rgba(255, 255, 255, 0.6)'}}>{birthdate}</Text>
                <View style={{alignItems: 'center'}}>
                  <TextButton style={{margin: 0}}>
                    <MaterialCommunityIcons name="square-edit-outline" size={20} />
                  </TextButton>
                </View>
              </View>
              <Text style={{margin: 10, marginBottom: 5}}>Gender</Text>
              {!showGenderRadio &&
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  <Text style={{marginLeft: 15, marginBottom: 5, marginRight: 5, color: 'rgba(255, 255, 255, 0.6)'}}>{gender == 0 ? "Male" : "Female"}</Text>
                  <View style={{alignItems: 'center'}}>
                    <TextButton style={{margin: 0}} onPress={() => this.setState({showGenderRadio: true})}>
                      <MaterialCommunityIcons name="square-edit-outline" size={20} />
                    </TextButton>
                  </View>
                </View>
              }
              {showGenderRadio &&
                <RadioForm
                  style={{marginLeft: 25, margin: 5 }}
                  radio_props={[
                    {label: 'Male', value: 0 },
                    {label: 'Female', value: 1 }]}
                  initial={gender}
                  borderWidth={1}
                  formHorizontal={true}
                  labelHorizontal={true}
                  buttonColor={'rgba(255, 255, 255, 0.87)'}
                  selectedButtonColor={'#BB86FC'}
                  buttonSize={10}
                  labelStyle={{fontSize: 16, color: 'rgba(255, 255, 255, 0.87)', marginRight: 10}}
                  animation={false}
                  onPress={(value) => this.setState({gender:value})}
                />
              }
            </View>
          </Form>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    elevation: 1
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    margin: 15,
    marginBottom: 5
  },
  skillTagsContainer: {
    flexDirection:'row',
    flexWrap: 'wrap',
    marginTop: 10,
  }
})

export default withFirebaseHOC(EditProfile)
