import React, { Component, useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { Text, Header, Button } from 'native-base'
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { createStackNavigator } from '@react-navigation/stack'
import Firebase from '../../config/Firebase'
import EditProfile from './EditProfile'
import SkillTag from '../components/SkillTag'
import AwesomeAlert from 'react-native-awesome-alerts'
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem } from '@react-navigation/drawer'

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

class ProfileInfo extends Component {
  state = {
    user: {
      username: '',
      firstName: '',
      lastName: '',
    },
    showAlert: false

  }
  componentDidMount() {
    const firebase = Firebase
    const uid = firebase.getCurrentUser().uid

    // listen to user date changes
    firebase.userDataByUid(uid).onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => { // whenever user date is changing
        this.setState({
          user: change.doc.data()
        })
      })
    })
  }
  render() {
    const { user } = this.state
    const totalHackathons = 0 //todo: calculate total Hackathons that user has participated in
    this.props.navigation.setOptions({
      headerTitleAlign: 'center',
      title: user.username,
      headerLeft: () => (
        <TouchableOpacity style={{marginLeft: 15}} onPress={() => this.props.navigation.openDrawer()}>
          <Text><MaterialIcons name={'menu'} size={30} /></Text>
        </TouchableOpacity>
      )
    })
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <View style={styles.nameConatiner}>
            <Image
              style={styles.image}
              source={require('../assets/no-image.png')}
            />
            <Text style={{fontSize: 18}}>{user.firstName+" "+user.lastName}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => this.props.navigation.navigate('Edit profile')}>
              <Text style={styles.editButtonText}>Edit my profile</Text>
            </TouchableOpacity>
          </View>
          {user.skills &&
            <Text style={{alignSelf: 'flex-start', marginLeft: 15}}>Skills: {user.skills.length}</Text>}
          {user.skills &&
            <FlatList
              style={{flexDirection: 'row', margin: 5, marginLeft: 20}}
              horizontal={ true}
              data={user.skills}
              renderItem={({item}) => <SkillTag skill={item} /> }
              keyExtractor={(item) => item}
            />}
          <Text style={{alignSelf: 'flex-start', margin: 20, marginLeft: 15}}>Participated in
            <Text style={{textTransform: 'uppercase', fontSize: 14, letterSpacing: 1.25}}> {totalHackathons} Hackathons</Text>
          </Text>
        </View>
      </View>
    )
  }
}

// const ProfileInfoWithFirebase = withFirebaseHOC(ProfileInfo)

function ProfileStack() {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen name="Profile" component={ProfileInfo} />
      <Stack.Screen name="Edit profile" component={EditProfile} />
    </Stack.Navigator>
  )
}

class ProfileDrawer extends Component {
  state={
    showAlert:false
  }
  hideAlert = () => {
    this.setState({
      showAlert: false
    })
  }
  showAlert = () => {
    this.setState({
      showAlert: true
    })
  }
  render () {
    this.props.navigation.setOptions({
      tabBarVisible: true
    })
    return (
      <View style={{flex:1}}>
        <Drawer.Navigator initialRouteName="Profile" drawerContent={props => <CustomDrawerContent showAlert={this.state.showAlert} showAlertFunc={this.showAlert} {...props} />}>
          <Drawer.Screen name="Profile" component={ProfileStack} />
        </Drawer.Navigator>
        <LogOutAlert showAlert={this.state.showAlert} hideAlert={this.hideAlert} />
      </View>
    )
  }
}

function CustomDrawerContent(props){

  return (
    <DrawerContentScrollView {...props}>
      <View style={{alignItems: 'center', paddingTop: 20}}>
        <TouchableOpacity onPress={() => props.showAlertFunc()}>
          <Text style={{color: "#BB86FC", fontWeight: 'bold', letterSpacing: 1.25}}>Log out <FontAwesome name='sign-out' size={18} /></Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  )
}

function LogOutAlert(props) {
  const { showAlert, hideAlert } = props
  const [submiting, setSubmiting] = useState(false) // this is called Hook

  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting ? true : false}
        title="Do you want to logout from Maher?"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Cancel"
        confirmText="Log out"
        confirmButtonColor="#BB86FC"
        cancelButtonColor="#383838"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          setSubmiting(true)
          Firebase.signOut()
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 18}}
        contentContainerStyle={{backgroundColor: '#2e2e2e'}}
        cancelButtonTextStyle={{fontSize: 16}}
        confirmButtonTextStyle={{fontSize: 16}}
        progressColor="#BB86FC"
    />
  )
}


const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    elevation: 1
  },
  nameConatiner: {
    alignItems: 'center',
    margin: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 8
  },
  editButton: {
    backgroundColor: 'transparent',
    margin: 20,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  editButtonText: {
    color: '#BB86FC',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 1.25,
  }
})

export default ProfileDrawer
