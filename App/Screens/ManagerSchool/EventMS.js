import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FIREBASE_DB } from '../../../firebaseConfig';
import { query, where, collection, getDocs, Timestamp, setDoc, doc, deleteDoc } from 'firebase/firestore';

import { Button } from 'react-native-elements';
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

function EventList({route, navigation}) {
  const uid = route.params;
  const [loading, setLoading] = useState(true);
  const [addingEvent, setAddingEvent] = useState(false); // state for adding new event
  const [isDatePickerShow, setIsDatePickerShow] = useState(false);
  const [isTimePickerShow, setIsTimePickerShow] = useState(false);
  const [date, setDate] = useState();
  const [events, setEvents] = useState([]);
  const [reEvents, setReEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    layerID: uid,
  });

    const showDatePicker = () => {
      setIsDatePickerShow(true);
    };
  
    const showTimePicker = () => {
      setIsTimePickerShow(true);
    };
  
    const onChange = (event, value) => {
      setDate(value);
      if (Platform.OS === 'android') {
        setIsDatePickerShow(false);
        setIsTimePickerShow(false);
      }
    };

    const fetchData = async () => {
      const now = new Date(Date.now());
      now.setSeconds(0)
      setDate(now);
      try {
        let eventsArray = new Array();
        let reEventsArray = new Array();

        // building layerID to check for events from any layer(school manager or regional manager)
        const layers = uid.split('.');
        for (i = 1; i <= 3; i++){
          let layerID = layers[0];
          for (j = 1; j < i; j++){
            layerID += "." + layers[j]; 
          }

          let q = query(collection(FIREBASE_DB, 'events'), where('layerID', '==', layerID)); // the query
          let querySnapshot = await getDocs(q);
          if (querySnapshot.empty){
            console.log("didnt find any events for this volunteer from ", layerID, " layer");
          }
          else{
            querySnapshot.forEach(event => {
              console.log("found event: ", event.id);
              let updateEventTime = false;
              const timestamp = new Timestamp(event.get('date').seconds, event.get('date').nanoseconds);
              const repeat = event.get('repeat');
              let eventDuration = event.get('duration');

              let eventSec = timestamp.seconds;
              let nowSec = now.getTime() / 1000;

              while (nowSec > eventSec + (eventDuration * 3600) && repeat !== 0){
                eventSec += repeat * 86400;
                updateEventTime = true;
              }

              let eventDate = new Date(eventSec * 1000);

              let mm = eventDate.getMonth() + 1;
              let dd = eventDate.getDate();
              let yyyy = eventDate.getFullYear();
              let hour = eventDate.getHours() + 3 + ":";
              if (eventDate.getMinutes() < 10){
                hour = hour + "0";
              }
              hour = hour + eventDate.getMinutes();
              const eventDateString = dd + "/" + mm + "/" + yyyy + ", " + hour;

              const eventObj = {
                eventID: event.id,
                date: eventDateString, 
                time: hour,
                duration: eventDuration,
                title: event.get('title'),
                description: event.get('description'),
                location: event.get('location'),
                layerID: event.get('layerID'),
                repeat: repeat,
              }

              if (repeat === 0){
                eventsArray.push(eventObj);
              }
              else{
                reEventsArray.push(eventObj);
              }

              if (updateEventTime && repeat !== 0){
                setDoc(doc(collection(FIREBASE_DB, 'events'), event.id), {...eventObj, date: eventDate});
              }

            });
          }
        }

        setEvents(eventsArray);
        setReEvents(reEventsArray);

      } catch (error) {
        console.log("Error fetching events data: ", error);
      }
      finally{
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    if (loading) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    }
    
    // const toggleApproval = (dayId) => {
    //   const updatedDays = days.map((day) =>
    //     day.id === dayId ? { ...day, approved: !day.approved } : day
    //   );
    //   setDays(updatedDays);
    // };


    // const renderDayItem = (day) => {
    //   return (
    //     <View key={day.id} style={styles.dayItem}>
    //       <Text>
    //         day: {day.day} date {day.data}
    //       </Text>
    //       <TouchableOpacity
    //         style={[
    //           styles.checkbox,
    //           { backgroundColor: day.approved ? "green" : "gray" },
    //         ]}
    //         onPress={() => toggleApproval(day.id)}
    //       ></TouchableOpacity>
    //     </View>
    //   );
    // };

    const renderEvents = ({ item }) => {
        return (
          <View key={item.id} style={styles.event}>
            <Icon name="calendar" size={70} color="#000" style={styles.eventPhoto}/>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              <Text style={styles.eventDate}>{item.date}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
              <Text>hours : {item.duration}</Text>
            </View>
            <View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handledeleteEvent(item)}
              >
                <Ionicons name="trash-outline" size={24} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleApprove(item)}
              >
                <Icon name="check" size={24} color="green" />
              </TouchableOpacity>
            </View>
          </View>
        );
  };
  
  const renderReEvents = ({ item }) => {
    return (
      <View key={item.eventID} style={styles.event}>
        <Icon
          name="calendar"
          size={70}
          color="#000"
          style={styles.eventPhoto}
        />
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDescription}>{item.description}</Text>
          <Text style={styles.eventDate}>Next Date : {item.date}</Text>
          <Text style={styles.eventDate}>every :{item.repeat} days</Text>
          <Text style={styles.eventLocation}>volunteer at : {item.location} </Text>
          <Text>hours : {item.duration}</Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handledeleteEvent(item)}
          >
            <Ionicons name="trash-outline" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setViewReEventsDays(true)}
          >
            <Icon name="check" size={24} color="green" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  

  // const handledeleteReEvent = (event) => {
  //   console.log(event);
  //   deleteDoc(doc(FIREBASE_DB, 'events', event.eventID));
  //   fetchData();
  // };
  
  const handledeleteEvent = (event) => {
    console.log(event);
    deleteDoc(doc(FIREBASE_DB, 'events', event.eventID));
    fetchData();
  };

  
  const handleApprove = (event) => {
    const updatedEvents = events.filter((e) => e.id !== event.id);
    setEvents(updatedEvents);
  };

  const handleAddEventSubmit = () => {
    let eventToAdd = {...newEvent, date: date};
    
    // Create a new message with a unique ID
    setDoc(doc(collection(FIREBASE_DB, 'events')), eventToAdd);
    const newId = events.length + 1;
    const newMessageWithId = { ...newEvent, id: newId };

    // Reset the new message state and close the modal
    setNewEvent({
      layerID: uid,
    });
    fetchData();
    setAddingEvent(false);
  };
  

    return (
      <View style={styles.eventList}>
        <Text style={styles.title}>אירועים מיוחדים</Text>
        <View style={styles.footerContainer}>
          <View style={styles.line} />
        </View>
        <FlatList
          data={events}
          renderItem={renderEvents}
          keyExtractor={(item) => item.eventID.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <Text style={styles.title}>התנדבויות שבועיות</Text>
        <View style={styles.footerContainer}>
          <View style={styles.line} />
        </View>
        <FlatList
          data={reEvents}
          renderItem={renderReEvents}
          keyExtractor={(item) => item.eventID.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setAddingEvent(true);
            }}
          >
            <Icon
              name="plus"
              size={18}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Add Event</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={addingEvent} animationType="slide">
          {/* TODO: front - improve UI/UX */}
          {/* TODO: front - add errors for input fields */}
            <KeyboardAwareScrollView>
          <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <View style={styles.modalContent}>
                <TextInput
                  onChangeText={(text) =>
                    setNewEvent({ ...newEvent, title: text })
                  }
                  style={styles.modalInput}
                  placeholderTextColor="#999"
                  placeholder="Event Title"
                />
                <TextInput
                  onChangeText={(text) =>
                    setNewEvent({ ...newEvent, description: text })
                  }
                  placeholderTextColor="#999"
                  style={styles.modalInput}
                  placeholder="Event Description"
                />
                <View style={styles.pickedDateContainer}>
                  <Text style={styles.pickedDate}>{date.toUTCString()}</Text>
                </View>
                {!isDatePickerShow && (
                  <View style={styles.btnContainer}>
                    <Button title="Select date" color="purple" onPress={showDatePicker} />
                  </View>
                )}

                {!isDatePickerShow && (
                  <View style={styles.btnContainer}>
                    <Button title="Select time" color="purple" onPress={showTimePicker} />
                  </View>
                )}

                {isDatePickerShow && (
                  <DateTimePicker
                    value={date}
                    mode={'date'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={true}
                    onChange={onChange}
                    style={styles.datePicker}
                  />
                )}
                {isTimePickerShow && (
                  <DateTimePicker
                    value={date}
                    mode={'time'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={true}
                    onChange={onChange}
                    style={styles.datePicker}
                  />
                )}
                <TextInput
                  onChangeText={(text) =>
                    setNewEvent({ ...newEvent, location: text })
                  }
                  placeholderTextColor="#999"
                  style={styles.modalInput}
                  placeholder="Event Location"
                />
                <TextInput
                  onChangeText={(text) =>
                    setNewEvent({ ...newEvent, duration: text })
                  }
                  placeholderTextColor="#999"
                  style={styles.modalInput}
                  placeholder="Event Hours"
                />
                <TextInput
                  onChangeText={(text) => 
                    setNewEvent({ ...newEvent, repeat: parseInt(text) })
                  }
                  placeholderTextColor="#999"
                  style={styles.modalInput}
                  placeholder="repeat event after x days(0 if this is a one time event)"
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setAddingEvent(false)}
                />
                <Button title="Submit" onPress={() => handleAddEventSubmit()} />
              </View>
          </View>
            </KeyboardAwareScrollView>
        </Modal>

        {/* <Modal visible={ViewReEventDays} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Day List</Text>
            <View style={styles.dayListContainer}>
              {days.map(renderDayItem)}
            </View>
            <View style={styles.modalButtons}>
              <Button
                title="Approve"
                onPress={() => console.log("Approve button pressed")}
              />
              <Button
                title="Cancel"
                onPress={() => setViewReEventsDays(false)}
              />
            </View>
          </View>
        </Modal> */}
      </View>
    );
}

const styles = StyleSheet.create({
  eventList: {
    flex: 1,
    padding: 16,
  },
  event: {
    flexDirection: "row",
    marginBottom: 16,
  },
  title: {
    justifyContent: "center",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  eventPhoto: {
    width: 100,
    height: 100,
    marginRight: 16,
    borderRadius: 10,
  },
  eventDetails: {
    flex: 1,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00bfff",
    paddingHorizontal: 50,
    width: '100%',
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: 'center',
    width: '80%',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop:100,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalContent: {
    width: "100%",
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 32,
    width: "100%",
  },
  modalButton: {
    width: "40%",
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  submitButton: {
    backgroundColor: "#00bfff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  line: {
    marginBottom: 20,
    width: "100%",
    height: 1,
    backgroundColor: "gray",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  dayListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  approveButton: {
    padding: 10,
    backgroundColor: "green",
    borderRadius: 5,
    marginBottom: 16,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
    marginBottom: 16,
  },
  pickedDateContainer: {
    padding: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  pickedDate: {
    fontSize: 18,
    color: 'black',
  },
  btnContainer: {
    padding: 30,
  },
  // This only works on iOS
  datePicker: {
    width: 320,
    height: 260,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});

export default EventList;
