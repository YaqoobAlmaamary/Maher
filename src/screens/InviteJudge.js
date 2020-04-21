import React, { Component } from 'react'
import { View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, FlatList } from 'react-native'
import { Text, Item, Icon, Input } from 'native-base'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import SkillTag from '../components/SkillTag'
import SearchInput from '../components/SearchInput'
import AwesomeAlert from 'react-native-awesome-alerts'
import { withFirebaseHOC } from '../../config/Firebase'


class InviteJudge extends Component {
  state = {
    users: [],
    result: [],
    haveInvitation: [],
    query: '',
    userToInvite: null,
    isReady: false,
    isHaveInvitationReady: false,
    showInviteAlert: false,
    submiting: false
  }

  // load data of all users
  getUsers = async () => {
    const { hackathonId } = this.props.route.params
    const usersCollection = await this.props.firebase.usersCollection().get()

    let allUsers = []
    usersCollection.forEach((doc) => {
      allUsers.push(doc.data())
    })

    const allUsersWithoutJudges = allUsers.map(user => {
      if(user.hackathons != null) {
        if(!user.hackathons.find((h) => h.role=="judge" && h.hackathonId == hackathonId)){
          return user
        }

      }
      else {
        return user
      }
    })
    const usersToLoad = allUsersWithoutJudges.filter(u => u != null)
    await this.loadHaveInvitation(usersToLoad)
    return usersToLoad

  }

  sendInvitation = async (uid) => {
    const { hackathonId, hackathonName } = this.props.route.params
    this.setState({
      submiting: true
    })
    const newNotificationId = this.props.firebase.database().ref('notifications/'+uid).push().key

    const photoURL = this.props.firebase.getCurrentUser().photoURL

    const notificationData = {
      type: 'review',
      from: this.props.firebase.getCurrentUser().uid,
      fromFullName: this.props.firebase.getCurrentUser().displayName,
      fromPhotoUri: photoURL == null ? '' : photoURL,
      hackathonName: hackathonName,
      to: uid,
      hackathonId: hackathonId,
      notificationId: newNotificationId,
      time: Date.now()
    }

    let updates = {}
    updates['/notifications/'+ uid + '/' + newNotificationId] = notificationData

    await this.props.firebase.database().ref().update(updates)

    this.setState({
      showInviteAlert: false,
      submiting: false,
      haveInvitation: this.state.haveInvitation.concat(uid)
    })
  }

  loadHaveInvitation = async (users) => {
    const { hackathonId } = this.props.route.params
    // all users notifications promises
    const allNoticficationsPromsises = users.map(async (user) => {
      const n = await this.props.firebase.database().ref("notifications/"+user.uid).once('value')

      if(n.exists()) {
        const allUserNotifications = Object.values(n.val())
        const found = allUserNotifications.find((notification) => notification.hackathonId == hackathonId && notification.type == "review")

        if(found != null) {
          return found.to
        }
      }
    })
    const haveInvitationArray = await Promise.all(allNoticficationsPromsises)

    this.setState({
      haveInvitation : this.state.haveInvitation.concat(haveInvitationArray.filter((user) => user != null)),
      isHaveInvitationReady: true
    })
  }

  isSent = (uid) => {
    return this.state.haveInvitation.includes(uid)
  }

  search = (query) => {
    this.setState({
      query,
      result: this.state.users.filter((user) => user.username.toLowerCase().search(query.toLowerCase().trim()) !== -1)
    })
  }
  async componentDidMount(){

    const { hackathonId } = this.props.route.params

    const users = await this.getUsers()

    this.setState({
      users: users,
      isReady: true,
    })

  }
  render() {
    this.props.navigation.setOptions({
      headerTitleAlign: 'center',
    })
    if(!this.state.isReady){
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    if(this.state.users.length == 0){
      return (
        <Text style={{textAlign: 'center', marginTop: 15}}>No users</Text>
      )
    }
    return (
      <View style={{ flex: 1, marginTop: 5 }}>
        <SearchInput
          placeholder="Search by username"
          search={this.search}
          value={this.state.query}
          clearQuery={() => this.setState({query: ''})} />
        {this.state.query != '' &&
          <Text style={styles.totalTxt}>
            Results: {this.state.result.length}
          </Text>}
        <FlatList
          style={{marginTop: 10}}
          data={this.state.query == '' ? this.state.users : this.state.result}
          renderItem={({item}) =>
            <UserCard
              isSent={this.isSent}
              isHaveInvitationReady={this.state.isHaveInvitationReady}
              showInviteConfirmation={() => {
                this.setState({
                  userToInvite: item,
                  showInviteAlert: true
                })
              }}
              user={item} /> }
          keyExtractor={(item) => item.uid}
        />
        <InvitationAlert
          showAlert={this.state.showInviteAlert}
          user={this.state.userToInvite}
          sendInvitation={this.sendInvitation}
          hideAlert={() => this.setState({showInviteAlert: false})}
          submiting={this.state.submiting}
          />
      </View>
    )
  }
}

function UserCard({user, showInviteConfirmation, isSent, isHaveInvitationReady}){
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.userConatiner}>
          <Image style={styles.userPhoto}
            source={user.photoUri == '' ? require('../assets/no-image.png') : {uri: user.photoUri}} />
          <View>
            <Text>{user.firstName+" "+user.lastName}
            </Text>
            <Text style={styles.smallMute}>{user.username}</Text>
          </View>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end', marginRight: 15}}>
        {!isHaveInvitationReady ?
          <ActivityIndicator size="small" color='#BB86FC' />
        : isSent(user.uid) ?
            <Text style={styles.smallMute}>PENDING</Text>
          : <TouchableOpacity onPress={() => showInviteConfirmation()}>
              <Text style={styles.inviteBtn}>
                <MaterialCommunityIcons size={23} name="plus" />
                  Invite
              </Text>
            </TouchableOpacity>
        }
        </View>
      </View>
      <View style={[styles.row, {marginBottom: 10}]}>
        {user.skills &&
          <Text style={{alignSelf: 'flex-start', fontFamily: 'Roboto_medium',marginLeft: 5, marginTop: 5}}>Skills:</Text>}
        {user.skills &&
          <FlatList
            style={{flexDirection: 'row', marginLeft: 10}}
            horizontal={ true}
            data={user.skills}
            renderItem={({item}) => <SkillTag skill={item} /> }
            keyExtractor={(item) => item}
          />}
      </View>
      <View style={{ borderBottomWidth: 0.2, borderColor: 'grey', margin: 10 ,marginRight: 50, marginLeft: 50,}} />
    </View>
  )
}

function InvitationAlert({showAlert, user ,sendInvitation, hideAlert, submiting}) {
  if(user == null)
    return null
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        message={"Do you want to send an invitation request to "+user.username+" ?"}
        showCancelButton={!submiting}
        showConfirmButton={!submiting}
        cancelText="Cancel"
        confirmText="Send"
        confirmButtonColor="#BB86FC"
        cancelButtonColor="#383838"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          sendInvitation(user.uid)
        }}
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 21}}
        messageStyle={{color: 'rgba(256,256,256,0.6)', fontSize: 18, lineHeight: 21}}
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
    flexWrap: 'wrap',
    marginBottom: 5
  },
  userConatiner: {
    marginLeft: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'center'
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
    marginRight: 10,
  },
  smallMute: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  inviteBtn: {
    color: '#BB86FC',
    fontSize: 17,
    textTransform: 'uppercase',
    letterSpacing: 1.25,
  },
  totalTxt: {
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.6)',
    margin: 5
  }
})

export default withFirebaseHOC(InviteJudge)
