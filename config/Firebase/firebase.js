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

  getUsernameData: username => {
    return firebase
      .firestore()
      .collection('users')
      .where("username", "==", username).get()
  }
}

export default Firebase
