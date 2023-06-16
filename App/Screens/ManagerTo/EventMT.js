import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, Text, Modal, StyleSheet, TouchableOpacity, Alert, SafeAreaView, SectionList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FIREBASE_DB } from '../../../firebaseConfig';
import { query, where, collection, getDocs, Timestamp, setDoc, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

import { Button } from 'react-native-elements';
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

function EventList({route, navigation}) {
  const uid = route.params;
  // building layerID to check for events from any layer(school manager or regional manager)
  const layers = uid.split('.');
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [isDatePickerShow, setIsDatePickerShow] = useState(false);
  const [isTimePickerShow, setIsTimePickerShow] = useState(false);
  const [date, setDate] = useState();
  const [events, setEvents] = useState([]);
  const [eventEdit, setEventEdit] = useState({
    layerID: uid,
    title: '',
    description: '',
    location: '',
    duration: '0',
    repeat: '0',
    approved: false,
  });

  const options = {
    timeZone: 'Asia/Jerusalem', // Set the time zone to Israel (Asia/Jerusalem)
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

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

        // to only show if SM accepted: for (i = layers.length - 1; i <= layers.length; i++)
        for (i = 1 ; i <= 2; i++){ // run for all layers
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
              let eventDuration = event.get('duration');

              let eventSec = timestamp.seconds;
              let nowSec = now.getTime() / 1000;

              if (nowSec > eventSec + (eventDuration * 3600) + 86400 || event.get('approved')){
                console.log("event irrelevent");
              }
              else{
                let eventDate = new Date(eventSec * 1000);
  
                const eventObj = {
                  eventID: event.id,
                  date: eventDate, 
                  duration: String(eventDuration),
                  title: event.get('title'),
                  description: event.get('description'),
                  location: event.get('location'),
                  layerID: event.get('layerID'),
                }
                
                eventsArray.push(eventObj);
              }

            });
          }
        }

        setEvents(eventsArray);

      } catch (error) {
        console.log("Error fetching events data: ", error);
      }
    };

    useEffect(() => {
      fetchData();
      setLoading(false);
    }, []);

    if (loading) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    }

    const renderEvents = ({ item }) => {
        return (
          <View key={item.id} style={styles.event}>
            <Icon name="calendar" size={70} color="#000" style={styles.eventPhoto}/>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              <Text style={styles.eventDate}>{item.date.toLocaleString('en-US', options)}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
              <Text>hours : {item.duration}</Text>
            </View>
            <View>

            <TouchableOpacity style={styles.button} onPress={() => handleEditEvent(item)}>
              <Ionicons name="pencil-outline" size={24} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handledeleteEvent(item)}>
              <Ionicons name="trash-outline" size={24} color="#333" />
            </TouchableOpacity>

            </View>
          </View>
        );
  };
  
  
  const handledeleteEvent = (event) => {
    if (event.layerID !== uid){
      Alert.alert('Error', 'this is not your event, you can not delete it', [
        {text: 'OK', onPress: () => console.log("OK pressed. user has been warned he cant delete this event")}
      ]);
    }
    else
    Alert.alert('Are you sure you want to delete?', 'deleting an event is a permenant action that cant be reversed', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => {
        console.log('deleting event with event ID: ', event.eventID);
        deleteDoc(doc(FIREBASE_DB, 'events', event.eventID));
        fetchData();
      }},
    ]);
  };

  const handleEditEvent = (event) => {
    console.log("editing event: ", event.eventID);
    setEventEdit({...event});
    setDate(event.date);
    setIsEditingEvent(true);
    setEventDetails(true);
  }

  const handleFinishEditEvent = () => {
    let eventToAdd = {...eventEdit, date: date, repeat: Number(eventEdit.repeat), duration: Number(eventEdit.duration)};

    if (isEditingEvent){
      const eventID = eventEdit.eventID;
      delete eventToAdd.eventID;
      console.log("updating event with ID ", eventID);
      console.log("event: ", eventToAdd);
      updateDoc(doc(collection(FIREBASE_DB, 'events'), eventID), eventToAdd);
    }else{
      setDoc(doc(collection(FIREBASE_DB, 'events')), eventToAdd);
    }

    setEventEdit({
      layerID: uid,
      title: '',
      description: '',
      location: '',
      duration: '0',
      repeat: '0',
      approved: false,
    });
    fetchData();
    setEventDetails(false);
    setIsEditingEvent(false);
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEventDetails(true);
              setEventEdit({
                layerID: uid,
                title: '',
                description: '',
                location: '',
                duration: '0',
                repeat: '0',
                approved: false,
              })
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

        <Modal visible={eventDetails} animationType="slide">
          {/* TODO: front - improve UI/UX */}
          {/* TODO: front - add errors for input fields */}
          <KeyboardAwareScrollView>
            <View style={styles.container}>
              {isEditingEvent? <Text style={styles.modalTitle}>edit Event Details</Text>: <Text style={styles.modalTitle}>Add New Event</Text>}

              <Text style={styles.label}>Title:</Text>
              <TextInput
                style={styles.input}
                value={eventEdit.title}
                onChangeText={(text) => setEventEdit({ ...eventEdit, title: text })}
                placeholder="Enter title"
              />

              <Text style={styles.label}>Description:</Text>
              <TextInput
                style={styles.input}
                value={eventEdit.description}
                onChangeText={(text) => setEventEdit({ ...eventEdit, description: text })}
                placeholder="Enter description"
              />

              <Text style={styles.label}>Date:</Text>
              <View style={styles.dateContainer}>
                <Text style={styles.pickedDate}>{date.toLocaleString('en-US', options)}</Text>
              </View>

              <View style={styles.ChangeDateContainer}>
                {!isDatePickerShow && (
                  <View style={styles.btnContainer}>
                    <Button title="Change date" color="purple" onPress={showDatePicker} />
                  </View>
                )}

                {!isDatePickerShow && (
                  <View style={styles.btnContainer}>
                    <Button title="Change time" color="purple" onPress={showTimePicker} />
                  </View>
                )}
              </View>

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
              {/* TODO - front: fix Bug - display local string of event in editing event */}
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

              <Text style={styles.label}>Location:</Text>
              <TextInput
                style={styles.input}
                value={eventEdit.location}
                onChangeText={(text) => setEventEdit({ ...eventEdit, location: text })}
                placeholder="Enter location"
              />

              <Text style={styles.label}>Duration:</Text>
              <TextInput
                style={styles.input}
                value={eventEdit.duration}
                onChangeText={(text) => setEventEdit({ ...eventEdit, duration: text })}
                placeholder="Enter duration"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setEventDetails(false)}
              />
              <Button title="Submit" onPress={() => handleFinishEditEvent()} />
            </View>
          </KeyboardAwareScrollView>
        </Modal>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 14,
  },
  scrollView: {
    backgroundColor: 'pink',
    marginHorizontal: 20,
  },
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
    marginBottom: 3,
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
    justifyContent: 'center',
    width: '100%',
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
    marginRight: 10,
    width: 100,
    borderRadius: 3,
    backgroundColor: 'red',
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
    padding: 10,
  },
  datePicker: {
    width: 320,
    height: 260,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  dateContainer: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  datePicker: {
    marginBottom: 16,
  },
  ChangeDateContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 5,
  }
});

export default EventList;