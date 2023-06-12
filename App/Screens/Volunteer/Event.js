import { Timestamp, query, where, collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../../firebaseConfig";
import React, { useState, useEffect } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

function EventList({route, navigation}) {
  const uid = route.params;
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [reEvents, setReEvents] = useState([]);
  const [date, setDate] = useState();

  const fetchData = async () => {
    const now = new Date(Date.now());
    now.setSeconds(0)
    setDate(now);
    try {
      let eventsArray = new Array();
      let reEventsArray = new Array();

      // building layerID to check for events from any layer(school manager or regional manager)
      const layers = uid.split('.');
      // to only show if SM accepted: for (i = layers.length - 1; i <= layers.length; i++)
      for (i = 1 ; i <= 3; i++){ // run for all layers
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
              console.log("event irrelevent");
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
                duration: String(eventDuration),
                title: event.get('title'),
                description: event.get('description'),
                location: event.get('location'),
                layerID: event.get('layerID'),
                repeat: String(repeat),
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
    <View key={item.eventID} style={styles.event}>
      <Icon name="calendar" size={70} color="#000" style={styles.eventPhoto} />
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription}>{item.description}</Text>
        <Text style={styles.eventDate}>{item.date}, {item.time}</Text>
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
        <Text style={styles.eventDate}>Time : {item.time}</Text>
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
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  line: {
    marginBottom: 20,
    width: "100%",
    height: 1,
    backgroundColor: "gray",
  },
});

export default EventList;
