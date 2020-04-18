import React, {Component } from 'react'
import { View, StyleSheet, Image, TouchableOpacity , SectionList } from 'react-native'
import { Text, Button } from 'native-base'
import { MaterialCommunityIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons'
import {getDuration} from '../../utils/helper'
import { withFirebaseHOC } from '../../config/Firebase'



class Evaluate extends Component {

  state = {
    reviewed : [],
    notReviewed : [],

  }



  async componentDidMount(){

    const { hackathonId } = this.props.route.params
    const { uid }  = this.props.firebase.getCurrentUser()
    const hackathonCollection = await this.props.firebase.getHackathonDoc(hackathonId).get()
    //this.props.firebase.hackathonDataById(hackathonId).get()
    const teamsCollection = await this.props.firebase.getAllTeamsRef(hackathonId).get()
    let reviewed = []
    let notReviewed = []



    teamsCollection.forEach( (team) => {
      const teamData = team.data()
      teamData['maxTeams'] = hackathonCollection.data().maxInTeam
      //if no one reviewed the team before
      if(teamData.reviews == null ){
        teamData['isReviewed'] = false
        notReviewed = notReviewed.concat(teamData)
      }
      else {
        const reviewJudges = Object.keys(team.data().reviews)
        if(reviewJudges.includes(uid)){
          teamData['isReviewed'] = true

          reviewed = reviewed.concat(teamData)
        }else {
          teamData['isReviewed'] = false
          notReviewed = notReviewed.concat(teamData)

        }
      }

     })

      this.setState( {
        reviewed : reviewed ,
        notReviewed : notReviewed,
      })

  }



    render() {
      const { reviewed , notReviewed  } = this.state

        return (

          <SectionList
            sections={[
              {
                title: "Not Reviewed ",
                 data: notReviewed },
              {
                title: "Reviewed ",
                 data: reviewed }]}

            renderItem={
              ( {item} ) => (
                <TeamCard

                team = {item}
                navigation={this.props.navigation}
                />)
            }
            renderSectionHeader={
              ({section}) => <Text style={ styles.sectionHeader }>{ section.title }</Text>
            }
            keyExtractor={ (item) => item.teamId }
          />

        )
}


}

function TeamCard ( { team , navigation } ) {

  return(
    <TouchableOpacity  style={styles.container}>
    <View style={styles.card}>
    <View style={styles.row}>
    <View style={{flex: 1}}>
    <View style={{margin : 5}}>
    <Text style={styles.title} > {team.name} </Text>
    </View>
    <View style={{flexDirection: 'row', margin: 5}}>
    <Text style={{ color: "#898989" }} > {"Idea: "} </Text>
    <Text style={{fontWeight: "bold", }}> {team.mainIdea} </Text>
    </View>
    <View style={{margin : 5}}>
    <Text style={{color: "#898989" , fontWeight: "bold"}} > {"Members: " + team.members.length + "/" + team.maxTeams } </Text>
    </View>
    </View>
    </View>
    <View style={styles.row , {flexDirection: 'row-reverse'}}>

      { team.isReviewed ?
        <MyButton text="edit review" onPress={() => navigation.navigate("Edit Review", {hackathonId: team.hackathonId , teamId: team.teamId }) } />
      : <MyButton text="review" onPress={() => navigation.navigate("Review Page" , {hackathonId: team.hackathonId , teamId: team.teamId })  } />

    }

      <MyButton text="profile" onPress={() => navigation.navigate("Team Profile", {hackathonId: team.hackathonId , teamId: team.teamId }) } />

    </View>
    </View>
    </TouchableOpacity>
   )
}




function MyButton({text, onPress}){
  return (
    <TouchableOpacity style={styles.button} onPress={() => onPress()}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  )
}


const styles = StyleSheet.create({

  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: "#0f0f0f",
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 23,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  card: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 4,
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    padding: 12
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap'

  },
  title: {
    fontFamily: 'Roboto_medium',
    fontSize: 26,
    fontWeight: "bold",

  },

  button: {
    backgroundColor: 'transparent',
    margin: 5,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,


  },
  buttonText: {
    color: '#BB86FC',
    fontSize: 16,
    letterSpacing: 1.25,
    textTransform: 'uppercase',
    fontWeight: "bold",
    fontFamily: 'Roboto_medium',
    fontSize: 18
  }

})





export default withFirebaseHOC( Evaluate );
