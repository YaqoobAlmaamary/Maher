import React, { Component, useState } from 'react'
import { View, FlatList, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native'
import { Text, Input } from 'native-base'
import HackathonCard from '../components/HackathonCard'
import HackathonPage from '../screens/HackathonPage'
import moment from 'moment'
import Constants from 'expo-constants'
import { createStackNavigator } from '@react-navigation/stack'
import { withFirebaseHOC } from '../../config/Firebase'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AwesomeAlert from 'react-native-awesome-alerts'
import RadioForm from 'react-native-simple-radio-button'

const Stack = createStackNavigator()

class Search extends Component {
  state = {
    query: '',
    hackathons: [],
    result: [],
    sort: 0,
    isSortModalVisible: false
  }
  search = (query) => {
    this.setState({
      query,
      result: this.state.hackathons.filter((hackathon) => hackathon.name.toLowerCase().search(query.toLowerCase().trim()) !== -1)
    })
  }
  sort = (sortValue) => {
    this.setState({
      sort: sortValue,
      isSortModalVisible: false
    })

    // closest to start
    if(sortValue == 0){
      this.setState({
        hackathons: this.state.hackathons.sort(( a, b ) => ( a.startDateTime.seconds - b.startDateTime.seconds ) )
      })
    }
    else if(sortValue == 1){
      this.setState({
        hackathons: this.state.hackathons.sort((a, b) => ( b.participants.length - a.participants.length ))
      })
    }
    else if(sortValue == 2){
      const nonCash = this.state.hackathons.filter((hackathon) => hackathon.totalPrizes == 'non-cash')

      const sortedByPrize = this.state.hackathons.filter((hackathon) => hackathon.totalPrizes != 'non-cash')
        .sort((a, b) => ( parseFloat(b.totalPrizes) - parseFloat(a.totalPrizes)))

      this.setState({
        hackathons: sortedByPrize.concat(nonCash)
      })
    }
    else {
      console.error("Error in sort function, sortValue should be (0, 1, 2) ; but got: "+sortValue)
    }
  }
  componentDidMount() {
    const { firebase } = this.props
    let unSortedHackathons

    // listen for changes in hackathons that are open
    this.unsubscribe = firebase.allHackathons().where("status", "==", "open")
      .onSnapshot((querysnapshot) => {
        querysnapshot.docChanges().forEach((change) => {
          if(change.type === "added") {
            // add it directly
            unSortedHackathons = this.state.hackathons.concat(change.doc.data())
          }
          if(change.type === "modified"){
            // if it's modefied then remove it from the state and then add it
            unSortedHackathons =
              this.state.hackathons.filter((hackathon) =>
                hackathon.hackathonId !== change.doc.data().hackathonId
              ).concat(change.doc.data())
          }
          if(change.type === "removed"){
            // if hackathon status is changed or it is removed, then remove it directly
            unSortedHackathons =
              this.state.hackathons.filter((hackathon) =>
                hackathon.hackathonId !== change.doc.data().hackathonId
              )
          }
          // sort based on closest startDateTime
          const sortedHackathons = unSortedHackathons.sort(( a, b ) => ( a.startDateTime.seconds - b.startDateTime.seconds ) )
          // apply changes to the state
          this.setState({
            hackathons: sortedHackathons
          })
        })
      })
  }
  componentWillUnmount() {
    // unsubscribe from listener only if it was defined
    if(this.unsubscribe)
      this.unsubscribe()
  }
  render() {
    const {query, hackathons, result} = this.state
    this.props.navigation.setOptions({
      headerStyle: {
        backgroundColor: '#272727'
      },
      headerLeft:() => (
        <TouchableOpacity style={{marginLeft: 10}} onPress={() => this.setState({isSortModalVisible: true})}>
          <MaterialCommunityIcons size={32}
            style={{color: this.state.sort == 0 ? 'rgba(255,255,255,0.87)' : '#BB86FC' } }
            name='filter-variant' />
        </TouchableOpacity>
      ),
      headerTitleContainerStyle: {justifyContent: 'center', alignSelf:'center', alignItems:'center'},
      headerTitle: null,
      headerRight: () => <SearchBar query={this.state.query} search={this.search} />,
    })
    return (
      <View style={{ flex: 1, marginTop: 10 }}>
        <FlatList
          data={query === '' ? hackathons: result}
          renderItem={({item}) => <HackathonCard hackathon={item} goToHackathon={() => this.props.navigation.navigate("Hackathon Page", {hackathonId: item.hackathonId, name: item.name})} /> }
          keyExtractor={(item) => item.hackathonId}
        />
        <SortModal
          modalVisible={this.state.isSortModalVisible}
          sortInitial={this.state.sort}
          sort={this.sort}
          hideModal={() => this.setState({isSortModalVisible: false})} />
      </View>
    )
  }
}

function SearchBar({query, search}){
  return (
    <View style={{height: 40}}>
      <Input
      style={{backgroundColor: '#121212', borderRadius: 20, width: 300, marginRight: 10, paddingLeft: 10}}
      placeholder= 'Search...'
      onChangeText={(q) => search(q)}
      value={query} />
    </View>
  )
}

function SortModal({modalVisible, sortInitial, sort, hideModal}){
  const radio_props = [
    {label: 'Closest to start', value: 0 },
    {label: 'Most Participants', value: 1 },
    {label: 'Most Total Prizes', value: 2 }
  ]
  return (
    <AwesomeAlert
        show={modalVisible}
        title="Sort Hackathons"
        titleStyle={{color: 'rgba(256,256,256,0.87)', fontSize: 21, alignSelf: 'flex-start'}}
        contentContainerStyle={{backgroundColor: '#2e2e2e'}}
        onDismiss={() => hideModal()}
        customView={
          <View style={{margin: 20, marginBottom: 10}}>
            <RadioForm
              style={{alignSelf: 'center'}}
              radio_props={radio_props}
              initial={sortInitial}
              borderWidth={1}
              formHorizontal={false}
              labelHorizontal={true}
              buttonColor={'rgba(255, 255, 255, 0.87)'}
              selectedButtonColor={'#BB86FC'}
              buttonSize={13}
              labelStyle={{fontSize: 18, color: 'rgba(255, 255, 255, 0.87)', marginBottom:18}}
              animation={false}
              onPress={(value) => sort(value)}
            />
          </View>
        }
      />
  )
}

const SearchWithFirebase = withFirebaseHOC(Search) // to have firebase as prop

function SearchStack(props) {
  props.navigation.setOptions({
    tabBarVisible: true,
  })
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchWithFirebase} />
      <Stack.Screen name="Hackathon Page" component={HackathonPage} />
    </Stack.Navigator>
  );
}


export default SearchStack
