import React, { Component } from 'react'
import { View, TouchableOpacity, Image, SectionList, StyleSheet } from 'react-native'
import { Text } from 'native-base'
import { withFirebaseHOC } from '../../config/Firebase'
import { FlatList } from 'react-native'
import HackathonCard from '../components/HackathonCard'
import HackathonPage from '../screens/HackathonPage'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

// This is the home page that the user will see
// in this script we must display all available hackathons
// sorted from newest to oldest as well as a button to add new hackathons
class Home extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      // This will hold the list of hackathons to be displayed
      hackathons : [],
      hackathonsParticipated : [],
      hackathonsJudged : [],
      hackathonsCreated: [],
    };

  }

  // when the component will first be rendered to the
  // DOM it will call getHackathons
  componentDidMount() {
    this.getHackathons();
  }
  componentWillUnmount() {

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
        console.log( "before loop" );
        querySnapshot.docChanges().forEach( ( change ) => {
          console.log( "after loop" );
          // get the hackathon in a variable
          var hackathon = change.doc.data();
          var isParticipant = hackathon.participants.find( (item) => item === userId ); // is he a participant
          var isJudge = hackathon.judges.find( (item) => item === userId ); // is he a judge
          var isCreator = hackathon.createdBy === userId; // is he the creator
          // added hackathon to the firestore
          if( change.type === "added" ){
            // user is participant in the current hackathon
            console.log( "added" )
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
            console.log( "modifies" );

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
            console.log( "removed" );
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
            hackathonsParticipated: buffer1, 
            hackathonsJudged: buffer2, 
            hackathonsCreated: buffer3 
          });
        })
      });
  }

  componentWillUnmount() {
    // unsubscribe from listener only if it was defined
    if(this.unsubscribe)
      this.unsubscribe()
  }

  // render using section list instead of flatlist
  render() {
    return (
      <View style={ { flex:1, } }>
        <SectionList 
          sections={[
            { title: "Participant ", data: this.state.hackathonsParticipated },
            { title: "Judge ", data: this.state.hackathonsJudged },
            { title: "Creator ", data: this.state.hackathonsCreated },
          ]}
          renderItem={
            ( {item} ) => (
              <HackathonCard
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
  const logoLocation = "https://firebasestorage.googleapis.com/v0/b/graduation-project-b9ef2.appspot.com/o/logos%2Flogo-2.png?alt=media&token=bb03096c-dcb8-4f5e-abe8-63023826a81a";
  const logo = <Image
    source={ { uri: logoLocation } } 
    style={ { width: 100, height: 20, } } />;


  props.navigation.setOptions({
    tabBarVisible: true,
  })
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={ HomeWithFirebase } options={ { headerTitle: () => logo, } } />
      <Stack.Screen name="Hackathon Page" component={ HackathonPage } />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create( {
  sectionHeader: {
    backgroundColor: "#0f0f0f", 
    paddingTop: 5,
    paddingBottom: 10, 
    paddingLeft: 10, 
    fontSize: 25,
  },
} );

export default HomeStack;