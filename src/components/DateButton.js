import React, { Component } from 'react'
import { View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import TextButton from '../components/TextButton'


export default class DateButton extends Component {
  state = {
    show: false,
  }

  showDatepicker = () => {
    this.setState({
      show: true,
    });
  }

  setDateState = (event, date) => {
    date = date || this.state.date;
    this.setState({
      show: Platform.OS === 'ios' ? true : false,
      date,
    })
    this.props.setDate(date)
  }
  render() {
    const { show } = this.state
    const { date, setDate } = this.props

    return (
      <View>
        <View style= {{alignSelf: 'center'}}>
          {!show &&
            <TextButton onPress={this.showDatepicker} style={{fontSize:18, letterSpacing: 1.0, textTransform: 'capitalize'}}>
              {date == '' ? 'Select Date' : 'Change Date'}
            </TextButton>
          }
        </View>
        { show && <DateTimePicker
                    maximumDate={new Date(2020, 1, 1)}
                    minimumDate={new Date(1900, 1, 1)}
                    value={date == '' ? new Date('1995-06-12') : date}
                    mode={'date'}
                    display={"spinner"} // android only
                    onChange={this.setDateState}
                    style={{backgroundColor: 'rgba(255,255,255,0.87)', borderRadius: 4,}} // ios only
                    />
        }
      </View>
    )
  }
}
