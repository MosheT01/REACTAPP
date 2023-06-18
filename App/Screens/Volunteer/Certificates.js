import React from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import { useState,useEffect } from "react";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import Icon from "react-native-vector-icons/FontAwesome";
import { FIREBASE_DB } from '../../../firebaseConfig';
import { query, where, collection, getDocs, Timestamp, setDoc,deleteDoc, getDoc } from 'firebase/firestore';

export default function App({route,navigation}) {
  const uid = route.params;
  
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState([]);
  const [totalHours, setTotalHours] = useState();
  const [volunteerPlace,setVolunteerPlace] = useState("");
  const [name,setName] = useState("")
  useEffect(() => {
    setTotalHours(0);
    const fetchData = async () => {
      try {

        // Fetch hours data...
        const q = query(collection(FIREBASE_DB, 'Hours'), where('VID', '==', uid));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty){
          console.log("didnt find any hours for this volunteer");
          setTotalHours(0);
        }
        else{
          let hoursArray = new Array();
          let totHours = 0;
          querySnapshot.forEach(hour => {
            const timestamp = new Timestamp(hour.get('from').seconds, hour.get('from').nanoseconds);
            totHours += hour.get('duration');
          });
          setTotalHours(totHours);
        }
      } catch (error) {
        console.log("Error fetching hours data: ", error);
      } finally {
        setLoading(false);
      }
      try{
        const q = query(collection(FIREBASE_DB, 'users'), where('layer', '==', uid));
        const managerSnapshot = await getDocs(q);
        if (managerSnapshot.empty) {
          console.log("no data for the asked user.");
        }
        else{
          managerSnapshot.forEach(user => {
            setName(String(user.get('name')))
            setVolunteerPlace(String(user.get('volunteerPlaceID')))
      });
      }
    }
    catch(error){
      console.log("Error fetching name data: ", error);
    }
  };

  fetchData();
  }, []);

  const volunteerName = "Mahmoud"; // Replace with the actual name variable
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const htmlCertificate = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .certificate {
          border: 2px solid #333333;
          padding: 40px;
          background-color: #ffffff;
          text-align: center;
          max-width: 600px;
        }
        .certificate h1 {
          color: #333333;
          font-size: 28px;
          margin-bottom: 20px;
        }
        .certificate p {
          color: #666666;
          font-size: 18px;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        .highlight {
          color: #ff0000;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <h1>תעודת הוקרה למתנדב</h1>
        <p>תעודה זו מוענקת ל</p> 
        <h2>${name}</h2>
        <p>אשר תרם את מזמנו וכישוריו כמתנדב ב</p>  
        <h3>לאורו נלך</h3>
       <p> ${currentDate} :בתאריך</p>
      </div>
    </body>
  </html>
`;
  const cssStyles = `
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .certificate {
      border: 2px solid #333333;
      padding: 40px;
      background-color: #ffffff;
      text-align: center;
      max-width: 600px;
    }
    .certificate h1 {
      color: #333333;
      font-size: 28px;
      margin-bottom: 20px;
    }
    .certificate p {
      color: #666666;
      font-size: 18px;
      line-height: 1.5;
      margin-bottom: 10px;
    }
    .highlight {
      color: #ff0000;
      font-weight: bold;
    }
  </style>
`;



  const htmlHoursCertificate = `
  <html>
    <head>
      ${cssStyles}
    </head>
    <body>
      <div class="certificate">
        <h1>אישור שעות</h1>
        <p>תעודה זו מוענקת</p>
        <h2>${name}</h2>
        <p>סיים בהצלחה </p>
        <h3>${totalHours} שעות התנדבות</h3>
        <p> ${currentDate} :בתאריך</p>
      </div>
    </body>
  </html>
`;

  let pdfCertificate = async () => {
    const file = await printToFileAsync({
      html: htmlCertificate,
      base64: false,
    });
    await shareAsync(file.uri);
  };

  let pdfHoursCertificate = async () => {
    const file = await printToFileAsync({
      html: htmlHoursCertificate,
      base64: false,
    });
    await shareAsync(file.uri);
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pdfCertificate}>
        <Icon name="users" size={100} color="black" />
        <Text style={styles.buttonText}>תעודת הוקרה</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pdfHoursCertificate}>
        <Icon name="clock-o" size={100} color="black" />
        <Text style={styles.buttonText}>אישור שעות</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: 200,
    height: 200,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
});
