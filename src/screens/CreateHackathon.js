import React from 'react'
import { withFirebaseHOC } from "../../config/Firebase"
import { View, Text } from 'react-native'

class CreateHackathon extends React.Component{

    render() {
        return ( 
            <View style={ {flex: 1, justifyContent: "center", alignItems: "center" } }>
                <Text style={ { color: "white" } }>Create Hackathon</Text>
            </View> 
        );
    }

}



export default withFirebaseHOC( CreateHackathon );