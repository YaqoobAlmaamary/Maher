import React, { Component } from 'react'
import { View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from 'native-base'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import AwesomeAlert from 'react-native-awesome-alerts'
import { withFirebaseHOC } from '../../config/Firebase'

class ManageJudges extends Component {
  state = {
    hackathon: {},
    judgesData: [],
    judgeToRemove: null,
    isManagerToJudgesInRequest: false
  }
  getJudgesData = async (hackathon) => {
    if(hackathon.judges == null || hackathon.judges.length == 0)
      return

    const getJudgesDataPromises = hackathon.judges.map(async judgeId => {
      const judgeDoc = await this.props.firebase.getUserDataOnce(judgeId)
      return judgeDoc.data()
    })

    return await Promise.all(getJudgesDataPromises)
  }
  removeJudge = async () => {
    if(this.state.judgeToRemove == null || !this.state.hackathon.judges.includes(this.state.judgeToRemove.uid)) {
      this.setState({
        submiting: false,
        showRemoveJudgeAlert: false
      })
      return
    }

    this.setState({
      submiting: true
    })

    const judge = this.state.judgeToRemove
    const { hackathon } = this.state

    await this.props.firebase.removeJudge(hackathon.hackathonId, judge.uid)

    this.setState({
      submiting: false,
      showRemoveJudgeAlert: false
    })

  }
  addManagerToJudges = async () => {
    const { uid } = this.props.firebase.getCurrentUser()

    if(this.state.hackathon.judges.includes(uid)){
      console.log("You already in the judges list");
      return
    }

    this.setState({
      isManagerToJudgesInRequest: true
    })
    await this.props.firebase.addJudge(this.state.hackathon.hackathonId, uid)
    this.setState({
      isManagerToJudgesInRequest: false
    })
  }
  async componentDidMount(){
    const { hackathonId } = this.props.route.params
    this.hackathonListener = this.props.firebase.getHackathonDoc(hackathonId)
      .onSnapshot(async (doc) => {
        const judges = await this.getJudgesData(doc.data())
        this.setState({
          hackathon: doc.data(),
          judgesData: judges == null ? [] : judges,
        })
      })
  }
  componentWillUnmount() {
    if(this.hackathonListener)
      this.hackathonListener()
  }
  render() {
    const { judgesData, hackathon } = this.state
    const { uid } = this.props.firebase.getCurrentUser()
    return (
      <View style={{flex: 1}}>
        <Text style={[styles.header ,{margin: 20}]}>Judges</Text>
        <ScrollView>
          {judgesData.length != null ?
            judgesData.map((judge) => (
              <View key={judge.uid} style={{marginBottom: 5}}>
                <View style={styles.row}>
                  <View style={styles.judgeConatiner}>
                    <Image style={styles.judgePhoto}
                      source={judge.photoUri == '' ? require('../assets/no-image.png') : {uri: judge.photoUri}} />
                    <View>
                      <Text>{judge.firstName+" "+judge.lastName}</Text>
                      <Text style={styles.smallMute}>{judge.username}</Text>
                    </View>
                  </View>
                  <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end', marginRight: 20}}>
                    <TouchableOpacity onPress={() => this.setState({
                      judgeToRemove: judge,
                      showRemoveJudgeAlert: true
                    })}>
                      <Text style={{color: '#CF6679'}}>
                        <Entypo size={35} name="cross" />
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ borderBottomWidth: 0.2, borderColor: 'grey', marginRight: 20, marginLeft: 50, marginBottom: 5}} />
              </View>
            ))
          : <ActivityIndicator style={{margin: 25}} size="small" color='#BB86FC' />}
          {(hackathon.judges != null && hackathon.judges.length == 0 ) &&
            <Text style={[styles.smallMute, {textAlign: 'center'}]}>No judges</Text>
          }
        </ScrollView>
        {this.state.isManagerToJudgesInRequest &&
            <ActivityIndicator style={{marginTop: 10}} size="small" color='#BB86FC' />}
        {(hackathon.judges != null && !hackathon.judges.includes(uid)
          && !this.state.isManagerToJudgesInRequest) &&
            <TouchableOpacity onPress={this.addManagerToJudges}
              style={{alignSelf: 'center', marginTop: 10}}>
              <Text style={[styles.btn, { color: '#01A299'}]}>
                  Add Me To The Judges
              </Text>
            </TouchableOpacity>
        }
        <TouchableOpacity onPress={() => this.props.navigation.navigate("Invite Judge", {hackathonId: hackathon.hackathonId, hackathonName: hackathon.name})}
          style={{alignSelf: 'center', margin: 25}}>
          <Text style={styles.btn}>
            <MaterialCommunityIcons size={23} name="plus" />
              Invite Judges
          </Text>
        </TouchableOpacity>
        <RemoveJudgeAlert
          showAlert={this.state.showRemoveJudgeAlert}
          judge={this.state.judgeToRemove}
          removeJudge={this.removeJudge}
          hideAlert={() => this.setState({showRemoveJudgeAlert: false})}
          submiting={this.state.submiting}
        />
      </View>
    )
  }
}

function RemoveJudgeAlert({showAlert, hideAlert, judge, removeJudge, submiting}) {
  if(judge == null)
    return null
  return (
    <AwesomeAlert
        show={showAlert}
        showProgress={submiting}
        progressSize="large"
        progressColor="#BB86FC"
        title="Remove Judge"
        message={`Are you sure you want to remove ${judge.username} from judges list?`}
        showCancelButton={!submiting}
        showConfirmButton={!submiting}
        cancelText="Close"
        confirmText="Remove"
        confirmButtonColor='#CF6679'
        cancelButtonColor="#383838"
        onCancelPressed={() => {
          hideAlert()
        }}
        onConfirmPressed={() => {
          removeJudge()
        }}
        onDismiss={() => {
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
    flexWrap: 'wrap',
    marginBottom: 5
  },
  judgeConatiner: {
    marginLeft: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'center'
  },
  judgePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5
  },
  header: {
    fontFamily: 'Roboto_medium',
    fontSize: 20,
    marginLeft: 10
  },
  smallMute: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  btn: {
    color: '#BB86FC',
    fontSize: 17,
    textTransform: 'uppercase',
    letterSpacing: 1.25,
  }
})

export default withFirebaseHOC(ManageJudges)
