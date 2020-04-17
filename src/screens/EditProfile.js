import React, { Component } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { View, TouchableOpacity, ScrollView, StyleSheet, Image, FlatList,
  KeyboardAvoidingView, ActivityIndicator, Platform, Alert,
  Keyboard, BackHandler } from 'react-native'
import NetInfo from "@react-native-community/netinfo"
import { Text, Form } from 'native-base'
import AwesomeAlert from 'react-native-awesome-alerts'
import DateTimePicker from '@react-native-community/datetimepicker'
import RadioForm from 'react-native-simple-radio-button'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { TextInputWithMsg } from '../components/Inputs'
import NameInput from '../components/NameInput'
import TextButton from '../components/TextButton'
import CountryPicker from "../components/CountryPicker"
import SkillsInput from '../components/SkillsInput'
import SkillTagWithRemove from '../components/SkillTagWithRemove'
import SkillTag from '../components/SkillTag'
import { withFirebaseHOC } from '../../config/Firebase'
import moment from 'moment'
import { checkConnectivity } from '../../utils/helper'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'

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
    photoUri: '', // from firebase
    newPhotoUri: '', // to represent image selected by the user (it's temporary file)
    usernameError: '',
    usernameMsg: '',
    showCountryPicker: false,
    showDatepicker: false,
    showGenderRadio: false,
    showEditSkills: false,
    submiting: false,
    noInternetAlert: false,
    isTimePassed: false,
    unSavedAlert: false,
    isUpdating: false,
    usernames: null,

  }
  isUpdateDisabled = () => {
    const { userBefore, firstName, lastName, username, birthdate, gender, country, usernameError} = this.state
    if(firstName.trim() == '' || lastName.trim() == '' || username.trim() == '' || usernameError != '')
      return true

    return this.isNotChanged()
  }
  isNotChanged = () => {
    const { userBefore, firstName, lastName, username, birthdate, gender, country, skills } = this.state

    return firstName == userBefore.firstName && lastName == userBefore.lastName && username == userBefore.username &&
      !this.isDateChanged() && gender == userBefore.gender && country == userBefore.country && userBefore.skills == skills && !this.isPhotoChanged()
  }
  isPhotoChanged = () => {
    if(this.state.newPhotoUri !== '')
      return true
    else
      return this.state.userBefore.photoUri !== this.state.photoUri // if it's set and then removed
  }
  usernameOnChange = (username) => {
    const { firebase } = this.props
    const { userBefore, usernames } = this.state
    this.setState({
      username: username.split(' ').join('')
    })

    if(username.length < 3) {
      this.setState(() => ({
        usernameMsg: '',
        usernameError: 'username should be at least 3 characters'
      }))
    }
    else {
      this.setState(() => ({
        usernameError: '',
        usernameMsg: '',
      }))
      if(usernames.includes(username.toLowerCase())){
        if (userBefore.username !== username) {
          this.setState({
            usernameError: 'username already exists'
          })
        }
      }
      else {
        this.setState({
          usernameMsg: ' ',//just space is enough
        })
      }
    }
  }
  setDate = (event, date) => {
    date = date || this.state.birthdate;
    this.setState({
      showDatepicker: Platform.OS === 'ios' ? true : false,
      birthdate: date,
    })
  }
  isDateChanged = () => {
    const { userBefore, birthdate } = this.state
    const dateBefore = moment(userBefore.birthdate).format("YYYY-MM-DD")
    const dateAfter = moment(birthdate).format("YYYY-MM-DD")

    if(userBefore != null && moment(birthdate).isValid())
      return dateBefore !== dateAfter
    else
      return false

  }
  updateUser = () => {
    const { firebase } = this.props
    const { newPhotoUri, photoUri } = this.state
    const updatedData = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      username: this.state.username,
      birthdate: this.state.birthdate,
      gender: this.state.gender,
      country: this.state.country,
      skills: this.state.skills,
    }
    const { uid } = firebase.getCurrentUser()

    firebase.updateUser(uid, updatedData)
    .then(() => {
      firebase.database().ref('usernames/'+uid).set(this.state.username)
      .then(() => {
        if(newPhotoUri !== ''){
          this.uriToBlob(newPhotoUri)
            .then((blob) => {
              this.uploadToFirebase(blob)
                .then((newPhotoRef) => {
                  newPhotoRef.getDownloadURL()
                    .then((url) => {
                      firebase.updateUser(uid, {photoUri: url})
                        .then(() => this.props.navigation.goBack())
                    })
                })
                .catch(console.log)
            })
            .catch(console.log)
        }
        else if(photoUri == '') { // if user removed his photo
          firebase.updateUser(uid, {photoUri: ''})
            .then(() => this.props.navigation.goBack())
        }
        else { // if photo doesn't change
          this.props.navigation.goBack()
        }
      })
      .catch(console.log)
    })
    .catch(console.log)
  }
  ifConnected = () => {
    this.setState({
      noInternetAlert: false,
      isUpdating: true
    })
    this.updateUser()
  }
  ifNotConnected = () => {
    this.setState({
      noInternetAlert: true
    })
  }
  _pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  })

  if (!result.cancelled) {
    this.setState({ newPhotoUri: result.uri })
    }
  }
  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }
  uriToBlob = (uri) => {

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();

      xhr.onload = function() {
        // return the blob
        resolve(xhr.response);
      };

      xhr.onerror = function() {
        // something went wrong
        reject(new Error('uriToBlob failed'));
      };

      // this helps us get a blob
      xhr.responseType = 'blob';

      xhr.open('GET', uri, true);
      xhr.send(null);

    });

  }
  uploadToFirebase = (blob) => {
      const { firebase } = this.props
      const { uid } = firebase.getCurrentUser()
    return new Promise((resolve, reject)=>{

      const newPhotoRef = firebase.storage().ref('profilePhotos').child(uid+'.jpg');
      newPhotoRef.put(blob, {contentType: 'image/jpeg'})
          .then(()=>{

            blob.close();

            resolve(newPhotoRef);

          }).catch((error)=>{

            reject(error);

          });

        });


  }
  componentDidMount() {
    checkConnectivity(() => {} , () => this.setState({firstNoInternetAlert: true})) //check connection
    setTimeout(() => this.setState({isTimePassed: true}) , 5000)
    const { navigation } = this.props
    navigation.dangerouslyGetParent().dangerouslyGetParent().setOptions({ //hide tab bar
      tabBarVisible: false
    })

    const { firebase } = this.props
    const uid = firebase.getCurrentUser().uid

    //get usernames list and listen for changes
    firebase.database().ref('usernames/')
      .on('value', (snapshot) => {
        this.setState({
          usernames: Object.values(snapshot.val()).map(username => username.toLowerCase())
        })
      })


    firebase.getUserDataOnce(uid)
      .then((querysnapshot) => {
        const user = querysnapshot.data()
        this.setState({
          isReady: true,
          userBefore: {
            ...user,
            ["birthdate"]: new Date(moment(user.birthdate.seconds*1000).toISOString())
          },
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          birthdate: new Date(moment(user.birthdate.seconds*1000).toISOString()),
          gender: user.gender,
          country: user.country,
          email: user.email,
          skills: user.skills,
          photoUri: user.photoUri,
        })
      })
  }
  componentWillUnmount() {
    // unsubscribe from realtime listener
    this.props.firebase.database().ref('usernames/').off()
  }
  render() {
    if((this.state.isTimePassed && this.state.usernames == null) || this.state.firstNoInternetAlert) {
      return (
        <TimeOutAlert isTimePassed={true}
         navigation={this.props.navigation}/>
      )
    }
    else if(!this.state.isReady) {
      return (
        <View style={{alignItems: 'center'}}>
          <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
          <Text style={{color: '#BB86FC'}}>Getting data</Text>
        </View>
      )
    }
    if(this.state.isUpdating) {
      return (
        <View style={{alignItems: 'center'}}>
          <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
          <Text style={{color: '#BB86FC'}}>Updating</Text>
        </View>
      )
    }
    const { userBefore, firstName, lastName, birthdate, gender, country, email, photoUri, newPhotoUri, showCountryPicker, showGenderRadio,
      showDatepicker, submiting, username, usernameError, usernameMsg, skills, showEditSkills,
      unSavedAlert, noInternetAlert, isTimePassed } = this.state
    const { navigation } = this.props
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TextButton onPress={() => {
          this.isNotChanged() ?
            navigation.goBack()
          : this.setState({unSavedAlert: true})
        }}
        style={{margin: 0, color: 'rgba(255, 255, 255, 0.87)', margin: 5}}>
          <MaterialCommunityIcons name="close" size={35} />
        </TextButton>
      ),
      headerRight: () => (
        <TextButton onPress={() => checkConnectivity(this.ifConnected, this.ifNotConnected)} disabled={this.isUpdateDisabled()}
        style={{margin: 0, color: 'rgba(255, 255, 255, 0.87)', margin: 5}}>
          <MaterialCommunityIcons name="check" size={35} />
        </TextButton>
      ),
    })
    return (
      <View>
        <ScrollView>
          <View style={{flex: 1}}>
            <Form>
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={photoUri == '' && newPhotoUri == '' ? require('../assets/no-image.png')
                  : newPhotoUri == '' ? {uri:photoUri} : {uri:newPhotoUri}}
                />
                {photoUri == '' && newPhotoUri == '' ?
                  <TextButton style={{fontSize: 16, color: '#01A299',}} onPress={this._pickImage}>
                    Add Profile Photo
                  </TextButton>
                : <View>
                    <TextButton style={{fontSize: 14, color: '#CF6679', margin:5}} onPress={() => this.setState({photoUri: '', newPhotoUri: ''})}>
                      Remove Profile Photo
                    </TextButton>
                    <TextButton style={{fontSize: 14, margin:5}} onPress={this._pickImage}>
                      Change Profile Photo
                    </TextButton>
                  </View>
                }
              </View>
              <View style={{marginTop: 10}}>
                <TextInputWithMsg
                  value={username}
                  error={usernameError}
                  success={usernameMsg}
                  label={"User name"}
                  placeholder={"username"}
                  onChangeText={this.usernameOnChange}
                />
                {submiting && <ActivityIndicator style={{marginLeft:20, alignSelf: 'flex-start'}} size="small" color='#BB86FC' />}
                <NameInput
                  values={{firstName: firstName, lastName: lastName}}
                  onFirstNameChange={(firstName) => this.setState({firstName})}
                  onLastNameChange={(lastName) => this.setState({lastName})}
                  blurOnSubmitLast={true}/>
              </View>
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
                  {false &&
                    <View style={{alignItems: 'center'}}>
                      <TextButton style={{margin: 0}}>
                        <MaterialCommunityIcons name="square-edit-outline" size={20} />
                      </TextButton>
                    </View>}
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
                  <Text style={{marginLeft: 15, marginBottom: 5, marginRight: 5, color: this.isDateChanged() ? 'rgba(255, 255, 255, 0.87)' : 'rgba(255, 255, 255, 0.6)'}}>
                    {( birthdate != ''&& moment(birthdate).isValid() ) &&
                      moment(birthdate).format("YYYY-MM-DD")
                    }
                  </Text>
                  {!showDatepicker &&
                    <View style={{alignItems: 'center'}}>
                      <TextButton style={{margin: 0}} onPress={() => this.setState({showDatepicker: true})}>
                        <MaterialCommunityIcons name="square-edit-outline" size={20} />
                      </TextButton>
                    </View>
                  }
                </View>
                { showDatepicker && <DateTimePicker
                            maximumDate={new Date(2020, 1, 1)}
                            minimumDate={new Date(1900, 1, 1)}
                            value={moment(birthdate).isValid() ? birthdate : new Date('1995-06-12')}
                            mode={'date'}
                            display={"spinner"} // android only
                            onChange={this.setDate}
                            style={{backgroundColor: 'rgba(255,255,255,0.87)'}} // ios only
                            />
                }
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
        <UnSavedAlert unSavedAlert={unSavedAlert}
          hideAlert={() => this.setState({unSavedAlert: false})}
          showAlert={() => this.setState({unSavedAlert: true})}
          isNotChanged={this.isNotChanged}
          navigation={navigation} />
        <NoInternetAlert noInternetAlert={noInternetAlert}
         hideAlert={() => this.setState({noInternetAlert: false})}
         tryAgain={() => checkConnectivity(this.ifConnected, this.ifNotConnected)}/>
      </View>
    )
  }
}

function UnSavedAlert({unSavedAlert, hideAlert, showAlert, navigation, isNotChanged}) {
  // show alert when back button is pressed on android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        !isNotChanged() &&
         showAlert()
      }

      BackHandler.addEventListener('hardwareBackPress', onBackPress)

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    })
  )

  unSavedAlert &&
    Keyboard.dismiss() //disable keyboard when alert shows up
  return (
    <AwesomeAlert
        show={unSavedAlert}
        showProgress={false}
        title="Unsaved changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="No"
        confirmText="Yes"
        confirmButtonColor="#383838"
        cancelButtonColor="#BB86FC"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
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

function NoInternetAlert({noInternetAlert, tryAgain, hideAlert}) {
  noInternetAlert &&
    Keyboard.dismiss() //disable keyboard when alert shows up
  return (
    <AwesomeAlert
        show={noInternetAlert}
        showProgress={false}
        title="No Internet Connection"
        message="Seems there is a connection problem. Please Try Again"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Close"
        confirmText="Try Again"
        cancelButtonColor="#383838"
        confirmButtonColor="#BB86FC"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          tryAgain()
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 18}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 16}}
        contentContainerStyle={{backgroundColor: '#2e2e2e'}}
        cancelButtonTextStyle={{fontSize: 16}}
        confirmButtonTextStyle={{fontSize: 16}}
      />
  )
}

function TimeOutAlert({isTimePassed, navigation}){
  isTimePassed &&
    Keyboard.dismiss() //disable keyboard when alert shows up
  return (
    <AwesomeAlert
        show={isTimePassed}
        showProgress={false}
        title="No Internet Connection"
        message="Seems there is a connection problem. Please Try Again Later"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Back"
        confirmButtonColor="#BB86FC"
        onConfirmPressed={() => {
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

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    elevation: 1,
    paddingBottom: 10
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
