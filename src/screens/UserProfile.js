import React, { Component } from 'react'
import { View, Image, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { Text } from 'native-base'
import SkillTag from '../components/SkillTag'
import { withFirebaseHOC } from '../../config/Firebase'

class UserProfile extends Component {
  state = {
    isFound: true,
    isReady: false,
    user: null
  }
  async componentDidMount(){
    const { uid } = this.props.route.params

    const userDoc = await this.props.firebase.getUserDataOnce(uid)

    if(!userDoc.exists) {
      this.setState({
        isFound: false
      })
    }
    else {
      this.setState({
        isReady: true,
        user: userDoc.data()
      })
    }

  }
  render(){
    if(!this.state.isReady) {
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    else if(!this.state.isFound) {
      return (
        <Text style={{textAlign: 'center'}}>User doesn't exists</Text>
      )
    }
    const { user } = this.state
    const totalHackathons = user.hackathons ? user.hackathons.length : 0
    this.props.navigation.setOptions({
      headerTitle: user != null ? user.username : "",
      headerTitleAlign: 'center'
    })
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <View style={styles.nameConatiner}>
            {user.photoUri !== null &&
              <Image
                style={styles.image}
                source={user.photoUri == '' ? require('../assets/no-image.png') : {uri: user.photoUri}}
              />
            }
            <Text style={{fontSize: 18}}>{user.firstName+" "+user.lastName}</Text>
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
})

export default withFirebaseHOC(UserProfile)
