



import React, { useState } from 'react';
import { View, FlatList, TextInput, Text, Modal, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const events = [
  {
    id: 1,
    title: "lol",
    description: "day after day",
    date: "May 25, 2023",
    location: "New York City, NY",
    hours: 5,
    approved: false,
  },
  {
    id: 8,
    title: "lol",
    description: "day after day",
    date: "May 25, 2023",
    location: "New York City, NY",
    hours: 5,
    approved: false,
  },
  {
    id: 2,
    title: "why",
    description: "why the birds fly",
    date: "June 1, 2023",
    location: "Los Angeles, CA",
    hours: 5,
  },
  {
    id: 3,
    title: "why",
    description: "why the birds fly",
    date: "June 1, 2023",
    location: "Los Angeles, CA",
    hours: 5,
  },
];




function EventList() {
  const [isModalVisibleEvents, setIsModalVisibleEvents] = useState(false);
  const [isModalVisibleAprove, setisModalVisibleAprove] = useState(false);

    const [newEvent, setEvent] = useState({
      title: "",
      description: "",
      date: "",
      location: "",
    });


    const [eventss, setEvents] = useState(events);
  

      const renderDayItem = (day) => {
        return (
          <View key={day.id} style={styles.dayItem}>
            <Text>
              day: {day.day} date {day.data}
            </Text>
            <TouchableOpacity
              style={[
                styles.checkbox,
                { backgroundColor: day.approved ? "green" : "gray" },
              ]}
              onPress={() => toggleApproval(day.id)}
            ></TouchableOpacity>
          </View>
        );
    };
  
    const renderEvents = ({ item }) => {
        return (
          <View key={item.id} style={styles.event}>
            <Icon
              name="calendar"
              size={70}
              color="#000"
              style={styles.eventPhoto}
            />
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              <Text style={styles.eventDate}>{item.date}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
              <Text>hours : {item.hours}</Text>
            </View>
            <View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handledelete(item)}
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
  
  
    const handledelete = (event) => {
        const updatedEvents = eventss.filter((e) => e.id !== event.id);
        setEvents(updatedEvents);
    };

  
    const handleApprove = (event) => {
      const updatedEvents = eventss.filter((e) => e.id !== event.id);
      setEvents(updatedEvents);
  };
  

    const handleAddEventSubmit = () => {

        // Create a new message with a unique ID
        const newId = eventss.length + 1;
        const newMessageWithId = { ...newEvent, id: newId };

        // Add the new message to the messages array
        const updatednewEvents = [...eventss, newMessageWithId];
        setEvents(updatednewEvents);
        // messages.push(updatedMessages);

        // Reset the new message state and close the modal
        setEvent({
          title: "",
          description: "",
          date: "",
          location: "",
        });



        // handle adding new event logic here
        console.log('Add New Event button pressed');
        setIsModalVisibleEvents(false);
  };
  

    return (
      <View style={styles.eventList}>
        <Text style={styles.title}>אירועים מיוחדים</Text>
        <View style={styles.footerContainer}>
          <View style={styles.line} />
        </View>
        <FlatList
          data={eventss}
          renderItem={renderEvents}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setIsModalVisibleEvents(true);
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
          

        <Modal visible={isModalVisibleEvents} animationType="slide">
            <KeyboardAwareScrollView>
          <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <View style={styles.modalContent}>
                <TextInput
                  onChangeText={(text) =>
                    setEvent({ ...newEvent, title: text })
                  }
                  style={styles.modalInput}
                  placeholderTextColor="#999"
                  placeholder="Event Title"
                />
                <TextInput
                  onChangeText={(text) =>
                    setEvent({ ...newEvent, description: text })
                  }
                  placeholderTextColor="#999"
                  style={styles.modalInput}
                  placeholder="Event Description"
                />
                <TextInput
                  onChangeText={(text) => setEvent({ ...newEvent, date: text })}
                  style={styles.modalInput}
                  placeholderTextColor="#999"
                  placeholder="Event Date"
                />
                <TextInput
                  onChangeText={(text) =>
                    setEvent({ ...newEvent, location: text })
                  }
                  placeholderTextColor="#999"
                  style={styles.modalInput}
                  placeholder="Event Location"
                />
                <TextInput
                  onChangeText={(text) =>
                    setEvent({ ...newReEvent, hours: text })
                  }
                  placeholderTextColor="#999"
                  style={styles.modalInput}
                  placeholder="Event Hours"
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setIsModalVisibleEvents(false)}
                />
                <Button title="Submit" onPress={() => handleAddEventSubmit()} />
              </View>
          </View>
            </KeyboardAwareScrollView>
        </Modal>

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
    paddingVertical: 8,
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
});

export default EventList;
