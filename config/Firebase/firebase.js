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
