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
  const [students, setStudents] = useState([
    {
      title: 'Student List',
      data: []
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [addingEvent, setAddingEvent] = useState(false);
  const [markAttendance, setMarkAttendance] = useState(false);
  const [isDatePickerShow, setIsDatePickerShow] = useState(false);
  const [isTimePickerShow, setIsTimePickerShow] = useState(false);
  const [date, setDate] = useState();
  // const [students, setStudents] = useState;
  const [events, setEvents] = useState([]);
  const [reEvents, setReEvents] = useState([]);
  const [isShowDatePicker, isSetShowDatePicker] = useState(false);
  const [eventEdit, setEventEdit] = useState({
    layerID: uid,
    title: '',
    description: '',
    location: '',
    duration: '',
    repeat: '',
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

  const handleDatePress = () => {
    if (Platform.OS === 'android') {
      showDatePickerAndroid();
    } else {
      setShowDatePicker(true);
    }
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

        // building layerID to check for events from any layer(school manager or regional manager)
        const layers = uid.split('.');
        for (i = layers.length - 1; i <= layers.length; i++){
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

              if ((repeat === 0 && nowSec > eventSec + (eventDuration * 3600) + 86400) || event.get('approved')){
                console.log("event is at least one day old");
              }
              else{
                while (repeat !== 0 && nowSec > eventSec + (eventDuration * 3600)){
                  eventSec += repeat * 86400;
                  updateEventTime = true;
                }
  
                let eventDate = new Date(eventSec * 1000);
  
                const eventObj = {
                  eventID: event.id,
                  date: eventDate, 
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

    const renderStudentItem = ({ item }) => {
      return (
        <View style={styles.itemContainer}>
          <View style={styles.studentItem}>
            <Text style={styles.nameText}>{item.name}</Text>
            <TouchableOpacity
              style={[styles.checkbox, item.approved && styles.checkboxChecked]}
              onPress={() => {
                const updatedStudents = students.map(section => {
                  const updatedData = section.data.map(student => {
                    if (student.uid === item.uid) {
                      return { ...student, approved: !student.approved };
                    }
                    return student;
                  });
                  return { ...section, data: updatedData };
                });
                setStudents(updatedStudents);
              }}
            >
              {item.approved && <Text style={styles.checkboxIcon}>✓</Text>}
            </TouchableOpacity>
          </View>
        </View>
      );
    };

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
              <TouchableOpacity
                style={styles.button}
                onPress={() => handledeleteEvent(item)}
              >
                <Ionicons name="trash-outline" size={24} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  handleMarkAttendance(item);
                }}
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
          <Text style={styles.eventDate}>Next Date : {item.date.toLocaleString('en-US', options)}</Text>
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
            onPress={() => {
              handleMarkAttendance(item);
            }}
          >
            <Icon name="check" size={24} color="green" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const handledeleteEvent = (event) => {
    console.log(event);
    Alert.alert('Are you sure you want to delete?', 'deleting an event is a permenant action that cant be reversed', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => {
        console.log('OK Pressed');
        deleteDoc(doc(FIREBASE_DB, 'events', event.eventID));
        fetchData();
      }},
    ]);
  };

  
  const handleMarkAttendance = async (event) => {
    students.at(0).data = [];
    const getStudentsQ = query(collection(FIREBASE_DB, 'users'), where('manager', '==', uid));
    let querySnapshot = await getDocs(getStudentsQ);

    if (querySnapshot.empty){
      console.log("didnt find any students of this manager", event.layerID, " layer");
    }
    else{
      console.log("found users of this manager");
      querySnapshot.forEach(user => students.at(0).data.push({uid: user.get('layer'), name: user.get('name'), approved: true}));

      console.log(typeof event.date);
      setEventEdit(event);
    }
    setMarkAttendance(true);
    console.log(students);
  };

  const handleApproveAttendance = () => {
    console.log("adding hours of event: ", eventEdit);
    students.at(0).data.forEach(async (student) => {
      if (student.approved){
        console.log("adding hours to: ", student.name);
        setDoc(doc(collection(FIREBASE_DB, 'Hours')), {
          VID: student.uid,
          duration: eventEdit.duration,
          eventID: eventEdit.eventID,
          from: eventEdit.date,
          layer: eventEdit.layerID,
        })

        if (eventEdit.repeat === 0){
          updateDoc(doc(collection(FIREBASE_DB, 'events'), eventEdit.eventID), {
            approved: true,
          })
        }
        else{
          const eventDocSnap = await getDoc(doc(FIREBASE_DB, 'events', eventEdit.eventID));
          if (eventDocSnap.exists()) {
            const timestamp = new Timestamp(eventDocSnap.get('date').seconds, eventDocSnap.get('date').nanoseconds);
            let eventSec = timestamp.seconds;
            eventSec += eventDocSnap.get('repeat') * 86400;
            updateDoc(doc(collection(FIREBASE_DB, 'events'), eventEdit.eventID), {
              date: new Date(eventSec * 1000),
            })
          }
          else{
            console.log("error, event document not found");
          }
        }
      }
    })
    setMarkAttendance(false);
    fetchData();
  }

  // TODO: back - add "approved" field to event
  const handleAddEventSubmit = () => {
    let eventToAdd = {...eventEdit, date: date};
    
    setDoc(doc(collection(FIREBASE_DB, 'events')), eventToAdd);

    setEventEdit({
      layerID: uid,
      repeat: 0,
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
              setEventEdit({
                layerID: uid,
                title: '',
                description: '',
                location: '',
                duration: 1,
                repeat: 0,
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

        <Modal visible={addingEvent} animationType="slide">
          {/* TODO: front - improve UI/UX */}
          {/* TODO: front - add errors for input fields */}
          <KeyboardAwareScrollView>
            <View style={styles.container}>
              <Text style={styles.modalTitle}>Add New Event</Text>

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
                <Text style={styles.pickedDate}>{date.toUTCString()}</Text>
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

              <Text style={styles.label}>Repeat:</Text>
              <TextInput
                style={styles.input}
                value={eventEdit.repeat}
                onChangeText={(text) => setEventEdit({ ...eventEdit, repeat: text })}
                placeholder="Enter repeat"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setAddingEvent(false)}
              />
              <Button title="Submit" onPress={() => handleAddEventSubmit()} />
            </View>
          </KeyboardAwareScrollView>
        </Modal>

        <Modal visible={markAttendance} animationType="slide">
        <SafeAreaView style={styles.container}>
          <SectionList
            sections={students}
            keyExtractor={(item) => item.uid}
            renderItem={item => renderStudentItem(item)}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.header}>{title}</Text>
            )}
          />
          <View style={styles.buttonContainer}>
            <Button style={styles.button} title="Approve attendance" onPress={handleApproveAttendance}/>
          </View>
        </SafeAreaView>
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
    alignItems: 'center',
    alignSelf: 'center',
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
