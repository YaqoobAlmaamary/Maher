import * as firebase from 'firebase'
import 'firebase/auth'
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig'

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const Firebase = {
  // auth
  loginWithEmail: (email, password) => {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  },
  signupWithEmail: (email, password) => {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
  },
  signOut: () => {
    return firebase.auth().signOut()
  },
  checkUserAuth: user => {
    return firebase.auth().onAuthStateChanged(user)
  },
  sendPasswordResetEmail: email => {
    return firebase.auth().sendPasswordResetEmail(email)
  },
  fetchSignInMethodsForEmail: email => {
    return firebase.auth().fetchSignInMethodsForEmail(email)
  },
  getCurrentUser: () => {
    return firebase.auth().currentUser
  },

  // firestore
  usersCollection: () => {
    return firebase
      .firestore()
      .collection('users')
  },

  createNewUser: userData => {
    return firebase
      .firestore()
      .collection('users')
      .doc(`${userData.uid}`)
      .set(userData)
  },

  updateUser: (uid, updatedData) => {
    return firebase
      .firestore()
      .collection('users')
      .doc(uid)
      .update(updatedData)
  },

  getUsernameData: username => {
    return firebase
      .firestore()
      .collection('users')
      .where("username", "==", username).get()
  },

  userDataByUid: (uid) => {
    return firebase.firestore().collection('users').where("uid", "==", uid)
  },

  getUserDataOnce: (uid) => {
    return firebase.firestore().collection('users').doc(uid).get()
  },

  hackathonDataById: (id) => {
    return firebase.firestore().collection("hackathons").where("hackathonId", "==", id)
  },

  allHackathons: () => {
    return firebase.firestore().collection("hackathons")
  },

  getHackathonDoc: (hackathonId) => {
    return firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
  },

  getAllTeamsRef: (hackathonId) => {
    return firebase
     .firestore()
     .collection('hackathons')
     .doc(hackathonId)
     .collection('teams')
  },

  getTeamDoc: (hackathonId, teamId) => {
    return firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .collection('teams')
      .doc(teamId)
  },

  createNewHackathon : async (hackathonData, uid) => {
    await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonData.hackathonId)
      .set(hackathonData)

    await firebase
      .firestore()
      .collection('users')
      .doc(uid)
      .update({
        hackathons: firebase.firestore.FieldValue.arrayUnion({role: "manager", hackathonId: hackathonData.hackathonId})
      })
  },

  removeHackathon: async (hackathonId) => {
    const hackathonRef = firebase.firestore().collection('hackathons').doc(hackathonId)
    const hackathonDoc = await hackathonRef.get()
    const listJudges = hackathonDoc.data().judges
    const participants = hackathonDoc.data().participants

    let promises = []
    // update hackathon document
    hackathonRef.update({
      status: 'removed',
      reviewStatus: "not-started",
      judges: [],
      teams: [],
      participants: []
    })
    // remove the hackathon from hackathons array for each judge
    if(listJudges.length > 0){
      const removeJudgesPromises = listJudges.map((judgeId) => {
          return firebase.firestore().collection('users').doc(judgeId).update({
          hackathons: firebase.firestore.FieldValue.arrayRemove({role: 'judge', hackathonId: hackathonDoc.data().hackathonId})
        })
      })
      await Promise.all(removeJudgesPromises)
    }
    // remove the hackathon from hackathons array for each participant
    if(participants.length > 0){
      const removeParticipantsPromises = participants.map((pId) => {
          return firebase.firestore().collection('users').doc(pId).update({
          hackathons: firebase.firestore.FieldValue.arrayRemove({role: 'participant', hackathonId: hackathonDoc.data().hackathonId})
        })
      })
      await Promise.all(removeParticipantsPromises)
    }
    // remove the hackathon from hackathons array for the manager
    await firebase.firestore().collection('users').doc(hackathonDoc.data().createdBy).update({
      hackathons: firebase.firestore.FieldValue.arrayRemove({role: 'manager', hackathonId: hackathonDoc.data().hackathonId})
    })
    // remove all notifications related to this hackathon
    const notifications = await firebase.database().ref('notifications/').once('value')
    if(notifications != null){
      const notificationsArray = Object.values(notifications.val())
      let paths = []

      notificationsArray.map(n => {
        Object.values(n).map(userNotification => {
          if(userNotification.hackathonId == hackathonId)
            paths.push(userNotification.to+"/"+userNotification.notificationId)
        })
      })

      const removeNotificationsPromises = paths.map(path => {
        return firebase.database().ref('notifications/'+path).remove()
      })

      await Promise.all(removeNotificationsPromises)

    }

  },

  createNewTeam: async (hackathonId, teamData, uid) => {
    await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .collection('teams')
      .doc(teamData.teamId)
      .set(teamData)

    await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .update({
        teams: firebase.firestore.FieldValue.arrayUnion({teamId: teamData.teamId, members: [uid]})
      })
  },

  addUserToTeam: async (uid, hackathonId, teamId) => {
    const hackathonDoc =
      await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .get()

    const teams = hackathonDoc.data().teams

    const updatedTeams = teams.map(team => {
      if(team.teamId == teamId)
        return {...team, members: team.members.concat(uid)}
      return team
    })

    // update teams array in hackathon doc
    await firebase.firestore().collection('hackathons').doc(hackathonId).update({teams: updatedTeams})
    // update team doc
    await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .collection('teams')
      .doc(teamId)
      .update({
        members : firebase.firestore.FieldValue.arrayUnion({type: 'participant', uid: uid})
      })
  },

  removeUserFromTeam: async (uid, hackathonId, teamId, isLeader = false, newTeamMembersArray = null) => {
    const hackathonDoc =
      await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .get()

    const teams = hackathonDoc.data().teams

    const updatedTeams = teams.map(team => {
      if(team.teamId == teamId)
        return {...team, members: team.members.filter( memberId => memberId != uid)}
      return team
    })

    // update teams array in hackathon doc
    await firebase.firestore().collection('hackathons').doc(hackathonId).update({teams: updatedTeams})
    // update team doc
    await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .collection('teams')
      .doc(teamId)
      .update({
        members :
          isLeader ?
              newTeamMembersArray
            : firebase.firestore.FieldValue.arrayRemove({type: 'participant', uid: uid})
      })
  },

  removeTeam: async (hackathonId, teamId, members) => {
    await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .collection('teams')
      .doc(teamId)
      .delete()

    await firebase
      .firestore()
      .collection('hackathons')
      .doc(hackathonId)
      .update({
        teams: firebase.firestore.FieldValue.arrayRemove({teamId: teamId, members: members})
      })
  },

  addJudge: async (hackathonId, uid) => {
    // update judge array in hackathon doc
    await firebase
    .firestore()
    .collection('hackathons')
    .doc(hackathonId)
    .update({
      judges: firebase.firestore.FieldValue.arrayUnion(uid)
    })

    // update hackathons array in user doc
    await firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .update({
      hackathons: firebase.firestore.FieldValue.arrayUnion({role: 'judge', hackathonId: hackathonId})
    })

  },

  removeJudge: async (hackathonId, uid) => {
    // update judge array in hackathon doc
    await firebase
    .firestore()
    .collection('hackathons')
    .doc(hackathonId)
    .update({
      judges: firebase.firestore.FieldValue.arrayRemove(uid)
    })

    // update hackathons array in user doc
    await firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .update({
      hackathons: firebase.firestore.FieldValue.arrayRemove({role: 'judge', hackathonId: hackathonId})
    })

  },

  // real-time database
  database: () => {
    return firebase.database()
  },

  // storage
  storage: () => {
    return firebase.storage()
  }

}

export default Firebase
