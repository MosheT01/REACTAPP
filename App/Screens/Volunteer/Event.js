import { Timestamp, query, where, collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../../firebaseConfig";
import React, { useState, useEffect } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

function EventList({route, navigation}) {
  const vid = route.params;
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [reEvents, setReEvents] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        let eventsArray = new Array();
        let reEventsArray = new Array();

        // building layerID to check for events from any layer(school manager or regional manager)
        const layers = vid.split('.');
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
              console.log("found event");
              const timestamp = new Timestamp(event.get('When').seconds, event.get('When').nanoseconds);
              let date = timestamp.toDate();
              let mm = date.getMonth() + 1;
              let dd = date.getDate();
              let yyyy = date.getFullYear();
              date = dd + "/" + mm + "/" + yyyy;

              console.log(typeof event.get('repeat'));
              let repeat = event.get('repeat');

              console.log("checking repeat");
              if (repeat === 0){
                eventsArray.push({
                  eventID: event.get('eventID'),
                  date: date, 
                  duration: event.get('duration'),
                  title: event.get('title'),
                  description: event.get('description'),
                  location: event.get('Where'),
                });
              }
              else{
                reEventsArray.push({eventID: event.get('eventID'),
                  day: date, 
                  duration: event.get('duration'),
                  title: event.get('title'),
                  description: event.get('description'),
                  location: event.get('Where'),
                  repeat: repeat,
                });
              }
              console.log("done checking repeat");
            });
          }
        }

        console.log("1");
        console.log(eventsArray);
        setEvents(eventsArray);
        console.log("2");
        setReEvents(reEventsArray);
        console.log("3");

      } catch (error) {
        console.log("Error fetching events data: ", error);
      }
      finally{
        setLoading(false);
      }
    };

    fetchData();
    // setLoading(false);
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
    <View key={item.eventID} style={styles.event}>
      <Icon name="calendar" size={70} color="#000" style={styles.eventPhoto} />
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription}>{item.description}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <Text>hours : {item.duration}</Text>
      </View>
    </View>
  );
};

const renderReEvents = ({ item }) => {
  return (
    <View key={item.eventID} style={styles.event}>
      <Icon name="calendar" size={70} color="#000" style={styles.eventPhoto} />
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription}>{item.description}</Text>
        <Text style={styles.eventDate}>Start Date : {item.fromDate}</Text>
        <Text style={styles.eventDate}>every :{item.repeat} weeks</Text>
        <Text style={styles.eventLocation}> location : {item.location}</Text>
        <Text>hours : {item.duration}</Text>
      </View>
    </View>
  );
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
      </View>
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
  eventPhoto: {
    width: 100,
    height: 100,
    margin: 5,
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
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    },
  eventHours: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
});

export default EventList;
