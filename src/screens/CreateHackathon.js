import React from 'react'
import { withFirebaseHOC } from "../../config/Firebase"
import { View, Text, Image } from 'react-native'
import { ScrollView, FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Form, H3 } from 'native-base';
import { TextInputWithMsg, TextArea } from '../components/Inputs';
import { StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker'

class CreateHackathon extends React.Component{
    constructor( props ){
        super( props )
        // the state will then be sent to
        // the firestore 
        this.state = {
            name: "",
            description: "",
            criteria: [],
            maxInTeam: 0,
            maxTeams: 0,
            minInTeam: 0,
            startDate: new Date(),
            startTime: new Date(),
            endDate: new Date(),
            endTime: new Date(),
            banner: "",
        }
    }

    componentDidMount(){
        
    }

    setStartDate( date ){
       this.setState( { startDate: date } )
    }

    setStartTime( time ){
        this.setState( { startTime: time } )
    }

    setEndDate( date ){
        this.setState( { endDate: date } )
    }

    setEndTime( time ){
        this.setState( {endTime: time } )
    }

    // this method will change the state only if a number was given
    // in addition the property must be specified as type
    // for example changing the property maxTeams to 10, the data will be added
    // and the type will be maxTeams:
    // add_number_to_state( 10, "maxTeams" )
    add_number_to_state( data, type ){
        // check if data is NOT a number
        if( isNaN( data ) ){
            this.setState( ( previousState ) => previousState )
            console.log( this.state )
        } else{
            // get the state 
            var state = this.state
            // change the data of the chosen type
            state[type] = data
            // reset state
            this.setState( () => state )
            console.log( this.state );
        }
    }

    addCriteria(){
        // new criteria
        var criteria = {
            name: "",
            value: "",
        }
        // list of all criterias
        var criterias = this.state.criteria
        criterias.push( criteria );
        this.setState( () => ({ criteria: criterias }) )
    }

    removeCriteria( criteria ){
        var criterias = this.state.criteria
        criterias = criterias.filter( word => word.name !== criteria.name )
        this.setState( () => ({ criteria: criterias }) )
    }

    async addBanner(){
        let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();
        if( permissionResult === false ){
            alert( "Permission need to add banner" )
            return;
        }
        let pickerResult = await ImagePicker.launchImageLibraryAsync();

        if (pickerResult.cancelled === true) {
          return;
        }
        
        this.setState( () => ({ banner: pickerResult }) )
    }

    render() {
        return ( 
            <ScrollView>
                <Form>
                    <H3 style={ styles.label } >Hackathon Name</H3>
                    <TextInputWithMsg 
                        label="Hackathon name"
                        value={ this.state.name }
                        onChangeText={(name) => {
                            this.setState({
                              name,
                              nameError: ''
                            })
                          }}
                    />

                    <H3 style={ styles.label }>Hackathon Description</H3>
                    <TextArea
                        rowSpan={4} 
                        placeholder="Hackathon Description"
                        value={ this.state.description }
                        onChangeText={ (description) => {
                            this.setState({
                                description: description,
                            })
                        }}
                    />

                    {/**List of critera*/}
                    <H3 style={ styles.label }>Criterias</H3>
                    <FlatList 
                        data={ this.state.criteria }
                        renderItem={ ({item}) =>
                        // for each element in criteria array
                        // render it an input place
                        <View>
                            <H3 style={ styles.label }>Criteria Name</H3>     
                            <TextInputWithMsg 
                                label="Name"
                                value={ item.name }
                                onChangeText={ (name) => {
                                    item.name = name
                                    this.setState( { item } )
                                }}
                            />

                            <H3 style={ styles.label }>Value</H3>
                            <TextInputWithMsg
                                label="Value"
                                value={ item.value }
                                onChangeText={ (value) => {
                                    item.value = value
                                    this.setState( { item } )
                                }}
                            />
                            <TouchableOpacity style={ styles.btn } onPress={ () => this.removeCriteria( item )}>
                                <Text style={ styles.removeCriteria } >Remove Criteria</Text>
                            </TouchableOpacity>
                        </View>}
                    />
                    {/**Button to add criteria */}
                    <TouchableOpacity style={ styles.btn } onPress={ () => this.addCriteria() }>
                        <Text style={ styles.addCriteria }>Add Criteria</Text>
                    </TouchableOpacity>

                    {/**maxInTeam */}
                    <H3 style={ styles.label }>Maximum number of members in a team</H3>
                    <TextInputWithMsg
                        label="Max members in a team"
                        value={ this.state.maxInTeam }
                        onChangeText={ ( maxInTeam ) => this.add_number_to_state( maxInTeam, "maxInTeam" )}
                    />

                    {/**MaxTeams */}
                    <H3 style={ styles.label }>Maximum number of teams</H3>
                    <TextInputWithMsg 
                        label="Max Teams"
                        value={ this.state.maxTeams }
                        onChangeText={ ( maxTeams ) => this.add_number_to_state( maxTeams, "maxTeams" ) }   
                    />
                    {/**minInteam */}
                    <H3 style={ styles.label } >Minimum number of members in a team</H3>
                    <TextInputWithMsg
                        label="Min members in a team"
                        value={ this.state.minInTeam }
                        onChangeText={ ( minInTeam ) => this.add_number_to_state( minInTeam, "minInTeam" ) }
                    />


                    


                    {/**Time related components------------------------------------------ */}
                    <H3 style={ styles.label } >Start Date</H3>
                    <View style={ styles.container } >
                        
                        <DateTimePicker
                            mode="date"
                            maximumDate={ new Date( 2025, 1, 1 ) }
                            minimumDate={ new Date() }
                            value={ this.state.startDate }
                            onChange={ ( event, date ) => this.setStartDate( date ) }
                            display="calender"
                        />
                    </View>

                    
                    <H3 style={ styles.label }>Start Time</H3>
                    <View style={ styles.container }>
                        <DateTimePicker 
                            mode="time"
                            value={ this.state.startTime }
                            onChange={ ( event, time ) => this.setStartTime( time )}
                        />
                     </View>
                    
                    <H3 style={ styles.label }>End Date</H3>
                    <View style={ styles.container }>
                        <DateTimePicker 
                            mode="date"
                            maximumDate={ new Date( 2025, 1, 1 ) }
                            minimumDate={ new Date() }
                            value={ this.state.endDate }
                            onChange={ ( event, date ) => this.setEndDate( date )}
                            display="calender"
                        />
                    </View>

                    <H3 style={ styles.label }>End Time</H3>
                    <View style={ styles.container }>
                        <DateTimePicker 
                            mode="time"
                            value={ this.state.endTime }
                            onChange={ ( event, date ) => this.setEndTime( date ) }
                        />
                    </View>
                

                    {/**button to add banner */}
                    <H3 style={ styles.label}>Add Banner</H3>
                    <Image source={ this.state.banner } />
                    <TouchableOpacity style={ styles.btn } onPress={ () => this.addBanner() }>
                        <Text style={ styles.btnText } >Add Banner</Text>
                    </TouchableOpacity>
                    



                </Form>
            </ScrollView> 
        )
    }
}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
    },
    label: {
      marginTop: 15,
      marginLeft: 15,
      marginBottom: 5
    },
    btn: {
      alignSelf: 'center',
      justifyContent:'center',
      borderRadius: 5,
      margin: 15,
      paddingRight: 15,
      paddingLeft: 15
    },
    btnText: {
      color: '#BBB',
      fontWeight: 'bold',
      fontSize: 14,
      letterSpacing: 1.25,
      textTransform: 'uppercase'
    },
    addCriteria: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "green",
        color: "green",
        padding: 10,
        paddingRight: 20,
        paddingLeft: 20,
    },
    removeCriteria: {
        borderWidth: 1,
        borderRadius: 10, 
        borderColor: "red", 
        color: "red",
        padding: 10, 
    },

  })

// wrap createHackathon component in <firebase.consumer> and export it
export default withFirebaseHOC( CreateHackathon );