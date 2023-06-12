import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Linking,Modal,TextInput,Button,
} from "react-native";
import { Picker } from '@react-native-picker/picker'; // Updated import statement
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as DocumentPicker from 'expo-document-picker';
import { FIREBASE_APP, FIREBASE_STORAGE } from "../../../firebaseConfig";
import { getStorage, ref, getDownloadURL,uploadBytesResumable } from "firebase/storage";
import { doc } from "firebase/firestore";

function Pdf({ route, navigation }) {
  const vid = route.params;
  const userID = String(vid); // user id
  const layers = userID.split('.');
  const [selectedFile, setSelectedFile] = useState([]);
  const [userType, setUserType] = useState([]);
  const [pdfCatagory,setCatagory] = useState("");
  const [FileName,setFileName] = useState("");
  const [BolbFile,setBlobFile] = useState("");
  useEffect(() => {
    if (layers.length === 4) {
      setUserType("volunteer"); // user is volunteer
    } else if (layers.length === 3) {
      setUserType("schoolManager"); // user is school manager
    } else if (layers.length === 2) {
      setUserType("regionalManager"); // user is regional manager
    } else if (layers.length === 1) {
      setUserType("admin"); // user is admin
    } else {
      console.log("valid user type not found");
    }
  }, [layers]);
  /////////////////////////////////////checking user type

  const [pdfList, setPdfList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [filteredPdfList, setFilteredPdfList] = useState([]);
  const schoolList = ["גיל הזהב", "חינוך מיוחד", "ילדים"];

  // Fetch PDF data from server or local storage
  useEffect(() => {
    // Your code here to fetch the PDF data, which should be an array of objects containing a name, photo URL, description, and pdfUrl for each PDF
    // Example data:
    const pdfData = [
      {
        name: "לשאוף ולצמוח",
        description: "description 1",
        school: "גיל הזהב",
        pdfUrl:
          "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-1.pdf",
      },
      {
        name: "הערבות ההדתית",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-5.pdf",
      },
      {
        name: "תכונות",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-5.pdf",
      },
      {
        name: "עין טובה",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-9.pdf"
      },
      {
        name: "תפילה ואמונה",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-11.pdf",
      },
      {
        name: "היכן ישנם עוד אנשים כמו האיש ההוא…",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-13-min.pdf",
      },
      {
        name: "רגעים של סיפוק ונחת",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-15-min.pdf",
      },
      {
        name: "שמחה",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-14-min.pdf",
      },
      {
        name: "איזהו עשיר השמח בחלקו",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-16-min.pdf",
      },
      {
        name: "זהות –מי אני?",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-17-min.pdf",
      },
      {
        name: "הכנסת אורחים",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-18-min.pdf",
      },
      {
        name: "שפה ודיבור",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-19-min.pdf",
      },

      {
        name: "גורל או בחירה",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-21-min.pdf",
      },

      {
        name: "שפה ודיבור",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-33-min.pdf",
      },

      {
        name: "דברי חכמים בנחת נשמעים",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-19-min.pdf",
      },

      {
        name: "תחשוב טוב יהיה טוב",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-35-min.pdf",
      },

      {
        name: "לחנוכה",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-%D7%98%D7%95-%D7%91%D7%A9%D7%91%D7%98-min.pdf",
      },

      {
        name: "טו בשבט",
        description: "description 2",
        school: "גיל הזהב",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/11/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-%D7%97%D7%A0%D7%95%D7%9B%D7%94-min.pdf",
      },
      {
        name: "יצירת קשר",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-1.pdf",
      },
      {
        name: "יצירת קשר",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-1.pdf",
      },
      {
        name: "יצירת קשר 2",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-2.pdf",
      },
      {
        name: "יצירת קשר 3",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-3.pdf",
      },
      {
        name: "החברות 1",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-4.pdf",
      },
      {
        name: "החברות 2",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-5.pdf",
      },
      {
        name: "החברות 3",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-6.pdf",
      },
      {
        name: "הצדקה",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-7.pdf",
      },
      {
        name: "מודעות עצמית",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-8.pdf",
      },

      {
        name: " המשפחה שלי",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-9.pdf",
      },

      {
        name: "עין טובה",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-10.pdf",
      },

      {
        name: "חמשת החושים 1",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-11.pdf",
      },

      {
        name: "חמשת החושים 2",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-12.pdf",
      },

      {
        name: "חמשת החושים 3",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-13.pdf",
      },

      {
        name: "חמשת החושים 4",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-14.pdf",
      },

      {
        name: "חמשת החושים 5",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-15.pdf",
      },

      {
        name: "השמחה",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-16.pdf",
      },

      {
        name: "ביקור חולים",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-17.pdf",
      },

      {
        name: "הכנסת אורחים",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-18.pdf",
      },
      {
        name: "שפה ודיבור",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-19.pdf",
      },
      {
        name: "צף ושוקע",
        description: "description 2",
        school: "חינוך מיוחד",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9E%D7%99%D7%95%D7%97%D7%93-20.pdf",
      },

      {
        name: "יצירת קשר",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-1.pdf",
      },

      {
        name: "ניהול קונפליקטים 1",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-2.pdf",
      },

      {
        name: "ניהול קונפליקטים 2",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-3.pdf",
      },

      {
        name: "ניהול קונפליקטים 3",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-4.pdf",
      },
      {
        name: "החברות",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-5.pdf",
      },

      {
        name: "מה נעשה עם הזמן הפנוי שלנו?",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-6.pdf",
      },

      {
        name:"הצדקה",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-7.pdf",
      },

      {
        name:"מודעות לאחר",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-8.pdf",
      },
      {
        name:"המשפחה שלי",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-9.pdf",
      },
      {
        name:"עין טובה",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-10.pdf",
      },
      {
        name:"מחשבה טובה – אמונה",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-11.pdf",
      },
      {
        name:"האחר הוא – אני",
        description: "description 2",
        school: "ילדים",
        pdfUrl: "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D-12.pdf",
      },
      // ...rest of the PDF data
    ];
    setPdfList(pdfData);
    setFilteredPdfList(pdfData);
  }, []);

  //this function will be called whenever the selected school changes:
  const filterPdfList = (selectedSchool) => {
    if (selectedSchool === "") {
      setFilteredPdfList(pdfList); // No filter applied, show all PDFs
    } else {
      const filteredList = pdfList.filter((pdf) => pdf.school === selectedSchool || pdf.school==="");
      setFilteredPdfList(filteredList);
    }
  };
  

  const downloadPdf = (url) => {
    Linking.openURL(url);
  };

  const renderPdfItem = ({ item, index }) => {
    const deletePdf = () => {
      // Create a copy of the PDF list
      const updatedPdfList = [...pdfList];
      // Remove the PDF at the specified index
      updatedPdfList.splice(index, 1);
      // Update the PDF list
      setPdfList(updatedPdfList);
    };


    return (
      <View style={styles.pdfItem}>
        <TouchableOpacity onPress={() => downloadPdf(item.pdfUrl)}>
          <Icon name="file" size={90} color="black" style={styles.pdfPhoto} />
        </TouchableOpacity>

        <View style={styles.pdfInfo}>
          <Text style={styles.pdfName}>{item.name}</Text>
          <Text style={styles.pdfDescription}>{item.description}</Text>
        </View>

        {userType === "schoolManager" && (
        <TouchableOpacity onPress={deletePdf}>
          <Icon name="trash" size={30} color="red" />
        </TouchableOpacity>
      )}
      </View>
    );
  };

  const addPdf = (blobFile, fileName , isUploadCompleted) => {
    
    // Validate the input fields
    if (!pdfName || !pdfDescription || !pdfUrl) {
      alert("Please fill in all fields");
      return;
    }
    if (!blobFile) return;
    const sotrageRef = ref(FIREBASE_STORAGE, 'pdfs/'+pdfCatagory+"/"+'${fileName}'); //LINE A
    const uploadTask = uploadBytesResumable(sotrageRef, blobFile); //LINE B
    uploadTask.on(
      "state_changed", null ,
      (error) => console.log(error),
      () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => { //LINE C
              console.log("File available at", downloadURL);
              isUploadCompleted(true);
              return downloadURL;
          });
      }
    );
    // const storage = getStorage();
    // const mountainsRef = ref(storage,'pdfs/'+pdfCatagory+"/"+pdfName);

    // // const metadata = {
    // //   contentType: 'application/pdf',
    // // };
    // console.log(selectedFile);
    // // Upload the file and metadata
    // uploadBytesResumable(mountainsRef, selectedFile).then((snapshot) => {
    //   console.log("File uploaded successfully");
    //   // Handle successful upload
    // })
    // .catch((error) => {
    //   console.error("Error uploading file", error);
    //   // Handle error
    // });;
    
    // const new_url_ref = PutFile(mountainsRef)

    //Create a new PDF object
    const newPdf = {
      name: pdfName,
      description: pdfDescription,
      pdfUrl: selectedFile,
      school: selectedSchool,
    };

    // Update the PDF list
    setPdfList((prevPdfList) => [...prevPdfList, newPdf]);

    // Reset the input fields and close the modal
    setPdfName("");
    setPdfDescription("");
    setPdfUrl("");
    setModalVisible(false);
    filterPdfList(selectedSchool);

  };
  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === 'ios' ? 'application/pdf' : '/',
      });

      if (result.type === 'success') {
        const r = await fetch(result.uri);
        const b = await r.blob();
        setFileName(result.name)
        setBlobFile(b);
        //setIsChoosed(true) 
        // Handle the selected file, e.g., upload it to a server
      } else {
        setSelectedFile(null);
        // Handle cancellation or any other error
      }
    } catch (error) {
      console.log('Error picking file:', error);
    }
  };

  return (
    <View style={styles.container}>
       {/* Filter section */}
    {userType === "schoolManager" && (
      <Picker
        selectedValue={selectedSchool}
        onValueChange={(itemValue) => {
          setSelectedSchool(itemValue);
          filterPdfList(itemValue);
        }}
        style={styles.filterPicker}
      >
        <Picker.Item label="All Schools" value="" />
        {schoolList.map((school) => (
          <Picker.Item label={school} value={school} key={school} />
        ))}
      </Picker>
    )}

    {/* PDF list */}
      <FlatList
        data={filteredPdfList}
        renderItem={renderPdfItem}
        keyExtractor={(item) => item.name}
      />

      {/* Modal for adding a PDF */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAwareScrollView>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add PDF</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#999"
              value={pdfName}
              onChangeText={(text) => setPdfName(text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#999"
              value={pdfDescription}
              onChangeText={(text) => setPdfDescription(text)}
            />
              <View>
              <Button title="Attach File" onPress={handleFileSelection} />
              {selectedFile && (
                <Text>Selected File: {selectedFile}</Text>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="PDF URL"
              placeholderTextColor="#999"
              value={pdfUrl}
              onChangeText={(text) => setPdfUrl(text)}
            />

            <TextInput
              style={styles.input}
              placeholder="pdfCatagory"
              placeholderTextColor="#999"
              value={pdfCatagory}
              onChangeText={(text) => setCatagory(text)}
            />
            <View style={styles.modalButtons}>
              <Button title="Add" onPress={addPdf} />

              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setPdfName("");
                  setPdfDescription("");
                  setPdfUrl("");
                }}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </Modal>

    {/* Button to open the modal (visible only for school managers) */}
    {userType === "schoolManager" && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  pdfItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  pdfPhoto: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  pdfDescription: {
    fontSize: 14,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop:200,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#00bfff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
  },
});

export default Pdf;