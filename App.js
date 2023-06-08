import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* general */
import WelcomeScreen from "./App/Screens/WelcomeScreen";
import inbox from "./App/Screens/Volunteer/inbox";
import Profile from "./App/Screens/Profile_";

/* Volunteer */
import Main from "./App/Screens/Volunteer/Main";
import Event from "./App/Screens/Volunteer/Event";
import pdf from "./App/Screens/Volunteer/pdf";
import Certificates from "./App/Screens/Volunteer/Certificates";
import Hours from "./App/Screens/Volunteer/Hours";

/* manager */
import MainM from "./App/Screens/Manager/MainM";

/* manager regional  */
import MainMT from "./App/Screens/ManagerTo/MainMT";

/* manager school */
import MainMS from "./App/Screens/ManagerSchool/MainMS";
import EventMS from "./App/Screens/ManagerSchool/EventMS";
import HoursMan from "./App/Screens/ManagerSchool/HoursMS";
import pdfMS from "./App/Screens/ManagerSchool/pdfMS";
import MySchool from "./App/Screens/ManagerSchool/MySchool";
import ProfileEdit from "./App/Screens/ManagerSchool/ProfileEdit";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen">
        {/* general */}
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
        ></Stack.Screen>
        <Stack.Screen name="inbox" component={inbox}></Stack.Screen>
        <Stack.Screen name="Profile" component={Profile}></Stack.Screen>
        {/* Volunteer */}
        <Stack.Screen
          name="Certificates"
          component={Certificates}
        ></Stack.Screen>
        <Stack.Screen name="Main" component={Main}></Stack.Screen>
        <Stack.Screen name="Event" component={Event}></Stack.Screen>
        <Stack.Screen name="pdf" component={pdf}></Stack.Screen>
        <Stack.Screen name="Hours" component={Hours}></Stack.Screen>
        {/* manager */}
        <Stack.Screen name="MainM" component={MainM}></Stack.Screen>
        {/* manager regional  */}
        <Stack.Screen name="MainMT" component={MainMT}></Stack.Screen>
        {/* manager school */}
        <Stack.Screen name="MainMS" component={MainMS}></Stack.Screen>
        <Stack.Screen name="pdfMS" component={pdfMS}></Stack.Screen>
        <Stack.Screen name="HoursMan" component={HoursMan}></Stack.Screen>
        <Stack.Screen name="EventMS" component={EventMS}></Stack.Screen>
        <Stack.Screen name="MySchool" component={MySchool}></Stack.Screen>
        <Stack.Screen name="ProfileEdit" component={ProfileEdit}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}