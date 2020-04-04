import React, { Component } from 'react'
import { View, TouchableOpacity, Image, SectionList, StyleSheet, ActivityIndicator } from 'react-native'
import { Text } from 'native-base'
import { withFirebaseHOC } from '../../config/Firebase'
import { FlatList } from 'react-native'
import HomeHackathonCard from '../components/HomeHackathonCard'
import HackathonPage from '../screens/HackathonPage'
import CreateTeam from '../screens/CreateTeam'
import TeamPage from '../screens/TeamPage'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'

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
      sections.push({ title: "Participant ", data: this.state.hackathonsParticipated })
    if(this.state.hackathonsJudged.length > 0)
      sections.push({ title: "Judge ", data: this.state.hackathonsJudged })
    if(this.state.hackathonsCreated.length > 0)
      sections.push({ title: "Creator ", data: this.state.hackathonsCreated })

    return sections
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
    this.subscription = firebase.allHackathons().where( "status", "==", "open" )
      .onSnapshot( (querySnapshot) => {
        // for any change check on the data
        querySnapshot.docChanges().forEach( ( change ) => {
          // get the hackathon in a variable
          var hackathon = change.doc.data();
          var isParticipant = hackathon.participants.find( (item) => item === userId ); // is he a participant
          var isJudge = hackathon.judges.find( (item) => item === userId ); // is he a judge
          var isCreator = hackathon.createdBy === userId; // is he the creator
          // added hackathon to the firestore
          if( change.type === "added" ){
            // user is participant in the current hackathon
            if( isParticipant ){
              buffer1.push( hackathon )
            }
            // user is a judge
            if( isJudge ){
              buffer2.push( hackathon )
            }
            // user is the creator
            if( isCreator ){
              buffer3.push( hackathon )
            }
          }
          // if the given data is modified
          else if( change.type === "modified" ){

            var filter = ( array ) => {
              return array.filter( ( item ) => item.hackathonId !== hackathon.hackathonId )
            };
            // remove the modified hackathon from the buffers
            buffer1 = filter( buffer1 );
            buffer2 = filter( buffer2 );
            buffer3 = filter( buffer3 );
            // if participant then add hackathon
            if( isParticipant ){
              buffer1.push( hackathon );
            }
            // if judge then add hackathon
            if( isJudge ){
              buffer2.push( hackathon );
            }
            // you get the point
            if( isCreator ){
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 50 }}>
          <Text style={styles.noHackathonMsg}>You don't have any upcoming hackathons</Text>
        </View>
      )
    }
    return (
      <View style={ { flex:1, } }>
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
      </View>

    );
  }

  render_old() {
    // will return a list of all hackathons
    // sorted from closest to furthest
    return (
      <View style={ { flex: 1, marginTop: 40, } }>
        <FlatList
          data={ this.state.hackathons }
          renderItem={
            ( {item} ) => (
              <HackathonCard
              hackathon={item}
              goToHackathon={() => this.props.navigation.navigate("Hackathon Page", {hackathonId: item.hackathonId, name: item.name})}
              />)
          }
          keyExtractor={(item) => item.hackathonId}
        /></View>
    )
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
  }
} );

export default HomeStack;
