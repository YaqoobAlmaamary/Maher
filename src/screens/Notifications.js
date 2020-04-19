import React, { Component } from 'react'
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native'
import { Text, Icon } from 'native-base'
import { MaterialCommunityIcons, Entypo, MaterialIcons } from '@expo/vector-icons'
import AwesomeAlert from 'react-native-awesome-alerts'
import { withFirebaseHOC } from '../../config/Firebase'
import { createStackNavigator } from '@react-navigation/stack'
import moment from 'moment'
import TeamProfile from './TeamProfile'
import UserProfile from './UserProfile'
import Toast, {DURATION} from 'react-native-easy-toast'

const Stack = createStackNavigator()

function NotificationNavigator(props) {
  return (
    <Stack.Navigator initialRouteName="Notifications">
      <Stack.Screen name="Notifications" component={NotificationsWithFirebase} options={{headerTitleAlign: 'center'}} />
      <Stack.Screen name="Team Profile" component={TeamProfile} />
      <Stack.Screen name="User Profile" component={UserProfile} />
    </Stack.Navigator>
  )
}

class Notifications extends Component {
  constructor(props) {
    super(props)
    this.toast = React.createRef();
  }
  state = {
    notifications: null,
    selectedNotification: null,
    showTeamFullAlert: false,
    showUserInTeamAlert: false
  }

  check = async (hackathonId, teamId, uid) => {
    const snapshot = await this.props.firebase.getHackathonDoc(hackathonId).get()
    const hackathon = snapshot.data()

    let isTeamExists = false
    let isTeamFull = false
    let isUserInTeam = false

    hackathon.teams.map((team) => {
      if(team.teamId == teamId){
        isTeamExists = true

        if(team.members.length == hackathon.maxInTeam)
          isTeamFull = true

      }

      if(team.members.includes(uid))
        isUserInTeam = true

    })



    return {isTeamExists: isTeamExists ,isUserInTeam: isUserInTeam, isTeamFull: isTeamFull }
  }

  acceptJudge = async (notification) => {
    // optimistic update, (means suppose the happy scenario will happen, if not return to the original state )
    this.setState({
      selectedNotification: notification,
      notifications: this.state.notifications.filter((n) => n.notificationId != notification.notificationId)
    })
    const snapshot = await this.props.firebase.getHackathonDoc(notification.hackathonId).get()
    const hackathon = snapshot.data()
    const { uid } = this.props.firebase.getCurrentUser()

    if(hackathon.status == 'removed' || hackathon == null){
      this.toast.current.show("Sorry, The hackathon doesn't exists", 1500)
      await this.discard(notification)
    }
    else if(hackathon.status != "un-published"){
      this.toast.current.show("Sorry, The hackathon already started", 1500)
      await this.discard(notification)
    }
    else if(hackathon.judges.includes(uid)){
      this.toast.current.show("You are already in the judges list", 1500)
      await this.discard(notification)
    }
    else {
      this.toast.current.show("You've been added successfully", 1500)
      await this.props.firebase.addJudge(hackathon.hackathonId, uid)
      await this.discard(notification)
    }
  }

  accept = async (notification) => {
    if(notification.type == 'review')
      return this.acceptJudge(notification)


    // optimistic update, (means suppose the happy scenario will happen, if not return to the original state )
    this.setState({
      selectedNotification: notification,
      notifications: this.state.notifications.filter((n) => n.notificationId != notification.notificationId)
    })

    //check whether it's a request from team leader or request from user himself to join a team.
    const uid = notification.type == 'team' ? this.props.firebase.getCurrentUser().uid : notification.from

    const check = await this.check(notification.hackathonId, notification.teamId, uid)

    const isError = !check.isTeamExists || check.isTeamFull || check.isUserInTeam

    if(isError) {
      if(!check.isTeamExists){
        this.props.firebase.database().ref('notifications/'+this.props.firebase.getCurrentUser().uid+"/"+notification.notificationId)
        .remove()
        this.toast.current.show("Sorry, The Team doesn't exists", 1500)
        return
      }
      else if(check.isTeamFull){
        // show team is full alert
        this.setState({
          showTeamFullAlert: true
        })
      }
      else if(check.isUserInTeam){
        // show user in already in team alert
        this.setState({
          showUserInTeamAlert: true
        })
      }

      // return the deleted notification to the state
      this.setState({
        notifications: this.state.notifications.concat(notification).sort((a, b) => (b.time - a.time))
      })
    }
    else {
      this.discard(notification)

      await this.props.firebase.addUserToTeam(uid, notification.hackathonId, notification.teamId)
      if(notification.type == 'team'){
        this.props.navigation.navigate("Home")
      }
      else if(notification.type == 'join-team-request') {
        this.toast.current.show(`${notification.fromFullName} added successfully`, 1500)
      }
    }
  }

  discard = (notification) => {
    this.setState({
      notifications: this.state.notifications.filter((n) => n.notificationId != notification.notificationId)
    })
    this.props.firebase.database().ref('notifications/'+this.props.firebase.getCurrentUser().uid+"/"+notification.notificationId)
      .remove()
        .catch(() => {
          // return the deleted notification to the state
          this.setState({
            notifications: this.state.notifications.concat(notification).sort((a, b) => (b.time - a.time))
          })
        })
  }

  componentDidMount() {
      this.notificationsRef = this.props.firebase.database().ref('notifications/'+this.props.firebase.getCurrentUser().uid)

      let notifications
      this.notificationsRef
        .on('value', snapshot => {
          if(snapshot.exists())
            notifications= Object.values(snapshot.val()).sort((a, b) => (b.time - a.time))

          else
            notifications = null

          this.setState({
            notifications: notifications
          })
          this.props.navigation.dangerouslyGetParent().setParams({
            notifications: notifications == null ? [] : notifications
          })
        })
  }
  componentWillUnmount() {
    if(this.notificationsRef)
      this.notificationsRef.off()
  }
  render() {
    return (
      <View style={{flex: 1}}>
        {this.state.notifications == null || this.state.notifications.length == 0 ?
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.mute}><MaterialIcons size={150} name="notifications-active" /></Text>
            <Text style={styles.mute}>No new notifications!</Text>
            <Text style={[styles.mute, {fontSize: 14}]}>We're listening..</Text>
          </View>
        : <FlatList
            style={{flex: 1}}
            data={this.state.notifications}
            renderItem={({item}) =>
              <NotificationCard
                goTo={() => {
                  item.type == 'team' ?
                    this.props.navigation.navigate("Team Profile", {teamId: item.teamId, hackathonId: item.hackathonId})
                  : this.props.navigation.navigate("User Profile", {uid: item.from})
                }}
                accept={this.accept}
                discard={this.discard}
                notification={item} /> }
            keyExtractor={(item) => item.notificationId}
            refreshing={true}
          />}
        <TeamFullAlert
          showAlert={this.state.showTeamFullAlert}
          notification={this.state.selectedNotification}
          discard={this.discard}
          hideAlert={() => this.setState({showTeamFullAlert: false})}
        />
        <UserInTeamAlert
          showAlert={this.state.showUserInTeamAlert}
          notification={this.state.selectedNotification}
          discard={this.discard}
          hideAlert={() => this.setState({showUserInTeamAlert: false})}
        />
        <Toast textStyle={{fontSize: 16, color: 'white'}} position='bottom' positionValue={200} ref={this.toast}/>
      </View>
    )
  }
}

const NotificationsWithFirebase = withFirebaseHOC(Notifications)

class NotificationCard extends Component {
  state = {
    title: '',
    message: '',
    currTime: Date.now()
  }
  loadData = (notification) => {
    if(notification == null)
      return
    if(notification.type == 'team'){
      this.setState({
        title: "Team Invitation Request!",
        message: `${notification.fromFullName} invites you to join ${notification.teamName} in ${notification.hackathonName}`
      })
    }
    else if (notification.type == 'join-team-request'){
      this.setState({
        title: "Joining Team Request!",
        message: `${notification.fromFullName} is requesting to join your ${notification.teamName} in ${notification.hackathonName}`
      })
    }
    else if(notification.type == 'review'){
      this.setState({
        title: "Reviewer Invitation!",
        message: `${notification.fromFullName} invites you to be one of the judges in ${notification.hackathonName}`
      })
    }
  }
  componentDidMount(){
    this.loadData(this.props.notification)
    this.timeInterval = setInterval( () => {
      this.setState({
        currTime : Date.now()
      })
    },60000)
  }
  componentWillUnmount() {
    if(this.timeInterval)
      clearInterval(this.timeInterval)
  }
  render() {
    const { notification, discard, accept, goTo } = this.props
    return (
      <TouchableOpacity style={styles.notificationConatiner} onPress={() => goTo()}>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <Text style={styles.title}>{this.state.title}</Text>
          <Text style={styles.time}>{moment(notification.time).from(this.state.currTime)}</Text>
        </View>
        <View style={styles.row}>
          <Image style={styles.notificationPhoto}
            source={notification.fromPhotoUri == '' ? require('../assets/no-image.png') : {uri: notification.fromPhotoUri}} />
          <View style={{flex: 1}}>
            <Text>{this.state.message}</Text>
          </View>
        </View>
        <View style={[styles.row, {justifyContent: 'flex-end'}]}>
          <TouchableOpacity onPress={() => discard(notification)}
            style={[styles.outlineBtn, {borderColor: '#CF6679'} ]}>
            <Text style={{color: '#CF6679'}}>
              <MaterialCommunityIcons size={18} name="close" />
              Discard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => accept(notification)}
            style={[styles.outlineBtn, {borderColor: '#01A299'} ]}>
            <Text style={{color: '#01A299'}}>
              <MaterialCommunityIcons size={18} name="check" />
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }
}

function TeamFullAlert({showAlert, notification, discard, hideAlert}) {
  return (
    <AwesomeAlert
        show={showAlert}
        title="Team is full!"
        message={"Unfortunately, the team is full right now."+"\nYou can keep this notification if want, or discard it?"}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Discard"
        confirmText="Keep"
        confirmButtonColor="#383838"
        cancelButtonColor='#CF6679'
        onCancelPressed={() => {
          discard(notification)
          hideAlert()
        }}
        onConfirmPressed={() => {
          hideAlert()
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 21}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 18, lineHeight: 21, margin: 5}}
        contentContainerStyle={{backgroundColor: '#2e2e2e', margin: 0}}
        cancelButtonTextStyle={{fontSize: 18}}
        confirmButtonTextStyle={{fontSize: 18}}
        overlayStyle={{backgroundColor: 'rgba(255,255,255, 0.15)'}}
      />
  )
}

function UserInTeamAlert({showAlert, notification, discard, hideAlert}) {
  if(notification == null)
    return null

  const title = notification.type == 'team' ? "You are already in a team!" : `${notification.fromFullName} is already in a team!`
  return (
    <AwesomeAlert
        show={showAlert}
        title={title}
        message="You can keep this notification if want. or discard it?"
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Discard"
        confirmText="Keep"
        confirmButtonColor="#383838"
        cancelButtonColor='#CF6679'
        onCancelPressed={() => {
          discard(notification)
          hideAlert()
        }}
        onConfirmPressed={() => {
          hideAlert()
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 21}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 18, lineHeight: 21, margin: 5}}
        contentContainerStyle={{backgroundColor: '#2e2e2e', margin: 0}}
        cancelButtonTextStyle={{fontSize: 18}}
        confirmButtonTextStyle={{fontSize: 18}}
        overlayStyle={{backgroundColor: 'rgba(255,255,255, 0.15)'}}
      />
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    margin: 5,
  },
  title: {
    fontFamily: 'Roboto_medium',
    color: 'rgba(255,255,255,0.6)',
  },
  notificationConatiner: {
    margin: 5,
    marginTop: 10,
    padding: 10,
    paddingRight: 8,
    paddingLeft: 8,
    backgroundColor: '#1d1d1d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 10
  },
  notificationPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10
  },
  time: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    margin: 5,
    padding: 5,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  mute: {
    color: 'rgba(255,255,255,0.2)'
  }
})

export default NotificationNavigator
