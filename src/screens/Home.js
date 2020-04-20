import React, { Component } from 'react'
import { View, TouchableOpacity, Image, SectionList, StyleSheet, ActivityIndicator } from 'react-native'
import { Text } from 'native-base'
import { withFirebaseHOC } from '../../config/Firebase'
import { FlatList } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import HomeHackathonCard from '../components/HomeHackathonCard'
import HackathonPage from '../screens/HackathonPage'
import CreateTeam from '../screens/CreateTeam'
import TeamPage from '../screens/TeamPage'
import EditTeam from '../screens/EditTeam'
import ViewTeams from '../screens/ViewTeams'
import TeamProfile from '../screens/TeamProfile'
import InviteToTeam from '../screens/InviteToTeam'
import ManageJudges from '../screens/ManageJudges'
import InviteJudge from '../screens/InviteJudge'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import CreateHackathon from "../screens/CreateHackathon"
import Evaluate from "../screens/Evaluate"
import ReviewPage from "../screens/ReviewPage"
import EditReview from "../screens/EditReview"

const Stack = createStackNavigator()

// This is the home page that the user will see
// in this script we must display all available hackathons
// sorted from newest to oldest as well as a button to add new hackathons
class Home extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      isReady: false,
      // This will hold the list of hackathons to be displayed
      hackathons : [],
      hackathonsParticipated : [],
      hackathonsJudged : [],
      hackathonsCreated: [],
    };

  }


  getSections = () => {
    let sections = []
    if(this.state.hackathonsParticipated.length > 0)
      sections.push({ title: "Participant", data: this.state.hackathonsParticipated })
    if(this.state.hackathonsJudged.length > 0)
      sections.push({ title: "Judge", data: this.state.hackathonsJudged })
    if(this.state.hackathonsCreated.length > 0)
      sections.push({ title: "Manager", data: this.state.hackathonsCreated })

    return sections
  }

  getParticipantStatus = (hackathon) => {
    const { uid } = this.props.firebase.getCurrentUser()
    let inTeam
    if(hackathon.teams.length == 0)
      inTeam = false
    else
      inTeam = hackathon.teams.find((team) => team.members.includes(uid))

    if(hackathon.status !== 'open'){
      return  {type: 'neutral', text: hackathon.status}
    }
    else if(inTeam != null && inTeam != false){
      const needMoreM = inTeam.members.length < hackathon.minInTeam
      return {type: 'good', text: "in a team", inTeam: true, teamId: inTeam.teamId, needMoreMembers: needMoreM }
    }
    else {
      return {type: 'bad', text: "not in a team", inTeam: false}
    }
  }

  getJudgeStatus = (hackathon) => {
    if(hackathon.status == "un-published")
      return {type: 'neutral', text: 'Hackathon Not published yet'}
    else if(hackathon.reviewStatus == 'review')
      return {type: 'good', text: 'Review period started'}
    else if(hackathon.reviewStatus == 'finished')
      return {type: 'bad', text: 'Review period has finished'}
    else
      return {type: 'bad', text: "Review period hasn't started yet"}
  }

  getManagerStatus = (hackathon) => {
    return  {type: 'neutral', text: hackathon.status}
  }

  // when the component will first be rendered to the
  // DOM it will call getHackathons
  componentDidMount() {
    this.getHackathons();
  }

  // this function will fill the list of hackathons
  // from the firestore
  getHackathons(){
    const { firebase } = this.props;
    const userId = firebase.getCurrentUser().uid;

    // used buffers because i got an error writing directly to
    // to state
    let buffer1 = this.state.hackathonsParticipated // to hold participated hackathons
    let buffer2 = this.state.hackathonsJudged // to hold judged hackathons
    let buffer3 = this.state.hackathonsCreated // to hold created hackathons

    // subscribe to firestore and get a snapshot of the data
    // onSnapshot first call it will read all data
    // after that it will only listen
    this.subscription = firebase.allHackathons().where( "status", "in", ["un-published", "open", "started", "in-review", "ended"] )
      .onSnapshot( (querySnapshot) => {
        // for any change check on the data
        querySnapshot.docChanges().forEach( ( change ) => {
          // get the hackathon in a variable
          var hackathon = change.doc.data();
          var isParticipant = hackathon.participants.find( (item) => item === userId ); // is he a participant
          var isJudge = hackathon.judges.find( (item) => item === userId ); // is he a judge
          var isCreator = hackathon.createdBy === userId; // is he the creator

          // add boolean object isHackathonFull to use it in HomeHackathonCard
          hackathon["isHackathonFull"] = hackathon.teams.length == hackathon.maxTeams

          // added hackathon to the firestore
          if( change.type === "added" ){
            // user is participant in the current hackathon
            if( isParticipant ){
              hackathon["isUserInTeam"] =
              hackathon["userStatus"] = this.getParticipantStatus(hackathon)
              hackathon["userType"] = "participant"
              buffer1.push( hackathon )
            }
            // user is a judge
            if( isJudge ){
              buffer2.push( {...hackathon, userStatus: this.getJudgeStatus(hackathon), userType: "judge"} )
            }
            // user is the creator
            if( isCreator ){
              hackathon["userStatus"] = this.getManagerStatus(hackathon)
              hackathon["userType"] = "manager"
              buffer3.push( hackathon )
            }
          }
          // if the given data is modified
          else if( change.type === "modified" ){

            var filter = ( array ) => {
              return array.filter( ( item ) => item.hackathonId !== hackathon.hackathonId );
            };
            // remove the modified hackathon from the buffers
            buffer1 = filter( buffer1 );
            buffer2 = filter( buffer2 );
            buffer3 = filter( buffer3 );

            // add boolean object isHackathonFull to use it in HomeHackathonCard
            hackathon["isHackathonFull"] = hackathon.teams.length == hackathon.maxTeams;

            // if participant then add hackathon
            if( isParticipant ){
              hackathon["userStatus"] = this.getParticipantStatus(hackathon);
              hackathon["userType"] = "participant";
              buffer1.push( hackathon );
            }
            // if judge then add hackathon
            if( isJudge ){
              buffer2.push( {...hackathon, userStatus: this.getJudgeStatus(hackathon), userType: "judge"} )
            }
            // you get the point
            if( isCreator ){
              hackathon["userStatus"] = this.getManagerStatus(hackathon);
              hackathon["userType"] = "manager";
              buffer3.push( hackathon );
            }
          }
          // if data is removed
          else if( change.type === "removed" ){

            var filter = ( array ) => {
              return array.filter( ( item ) => item.hackathonId !== hackathon.hackathonId )
            };
            if( isParticipant ){
              // remove it
              buffer1 = filter( buffer1 );
            }
            if( isJudge ){
              // remove it
              buffer2 = filter( buffer2 );
            }
            if( isCreator ){
              // remove it
              buffer3 = filter( buffer3 );
            }
          }
          // the buffers become the state for the component
          this.setState({
            hackathonsParticipated: buffer1.sort(( a, b ) => ( a.startDateTime.seconds - b.startDateTime.seconds ) ),
            hackathonsJudged: buffer2.sort(( a, b ) => ( a.startDateTime.seconds - b.startDateTime.seconds ) ),
            hackathonsCreated: buffer3.sort(( a, b ) => ( a.startDateTime.seconds - b.startDateTime.seconds ) ),
            isReady: true
          });
        })
      });
  }


  componentWillUnmount() {
    // unsubscribe from listener only if it was defined
    if(this.subscription)
      this.subscription()
  }

  // render using section list instead of flatlist
  render() {
    if(!this.state.isReady){
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    else if(this.getSections().length == 0){
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
          <Text style={styles.noHackathonMsg}>You don't have any upcoming hackathons</Text>
          
          <TouchableOpacity style={ styles.button } onPress={ () => this.props.navigation.navigate("Create Hackathon") }>
            <MaterialCommunityIcons size={27} name="plus" />
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <View style={ { flex:1, } }>
        {/*This will display the list of hackathons*/}
        <SectionList
          sections={this.getSections()}
          renderItem={
            ( {item} ) => (
              <HomeHackathonCard
              navigation={this.props.navigation}
              hackathon={item}
              goToHackathon={() => this.props.navigation.navigate("Hackathon Page", {hackathonId: item.hackathonId, name: item.name})}
              />)
          }
          renderSectionHeader={
            ({section}) => <Text style={ styles.sectionHeader }>{ section.title }</Text>
          }
          keyExtractor={ (item) => item.hackathonId }
        />
        {/*This will display the button to create a hackathon */}
          <TouchableOpacity style={ styles.button } onPress={ () => this.props.navigation.navigate("Create Hackathon") }>
            <MaterialCommunityIcons size={27} name="plus" />
          </TouchableOpacity>
      </View>

    );
  }
}
const HomeWithFirebase = withFirebaseHOC( Home ) // to have firebase as prop

function HomeStack(props) {

  // this is the logo that appears on top
  // of the screen
  const logo = <Image
    source={ require("../assets/logo-2.png") }
    style={ { width: 130, height: 30, } } />;


  props.navigation.setOptions({
    tabBarVisible: true,
  })
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={ HomeWithFirebase } options={ { headerTitle: () => logo, headerTitleAlign: "center" } } />
      <Stack.Screen name="Hackathon Page" component={ HackathonPage } />
      <Stack.Screen name="Create Team" component={ CreateTeam } options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,}} />
      <Stack.Screen name="Team Page" component={ TeamPage } options={{cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,}} />
      <Stack.Screen name="Manage Judges" component={ ManageJudges } />
      <Stack.Screen name="Invite Judge" component={ InviteJudge } />
      <Stack.Screen name="Invite To Team" component={ InviteToTeam } />
      <Stack.Screen name="Create Hackathon" component={ CreateHackathon } />
      <Stack.Screen name="Evaluate" component={ Evaluate }  />
      <Stack.Screen name="Edit Team" component={ EditTeam } />
      <Stack.Screen name="Teams" component={ ViewTeams } />
      <Stack.Screen name="Team Profile" component={ TeamProfile } />
      <Stack.Screen name="Review Page" component={ ReviewPage } />
      <Stack.Screen name="Edit Review" component={ EditReview } />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create( {
  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: "#0f0f0f",
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 23,
  },
  noHackathonMsg: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#03dac5',
    borderRadius: 40,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 10,
    bottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5
  },
} );

export default HomeStack;
