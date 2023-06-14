import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, SafeAreaView, StyleSheet, Alert, Dimensions } from "react-native";
import { FIREBASE_DB } from "../../../firebaseConfig";
import { query, where, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const GroupList = ({route, navigation}) => {
  const uid = route.params;
  const screenHeight = Dimensions.get('screen').height;
  const [loading, setLoading] = useState(true);
  const [groupsHeight, setGroupsHeight] = useState(180);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [refresh, setRefresh] = useState();
  const [showAddStudent, setShowAddStudent] = useState(false); // State variable to control the visibility of the "Add Student" section

  const getAvailableStudents = () => {
    const usedStudentIds = groups.flatMap((group) =>
      group.students.map((student) => student.id)
    );
    return students.filter((student) => !usedStudentIds.includes(student.id));
  };

  const handleAddStudent = () => {
    const selectedStudents = students.filter((student) => student.selected);
    selectedStudents.forEach((student) => {
      updateDoc(doc(collection(FIREBASE_DB, 'users'), student.id), {volunteerPlaceID: selectedGroup.id})
    })
    setSelectedGroup(null);
    setShowAddStudent(false);
    fetchData();
  };

  const refreshStudentFlatList = () => {
    setRefresh((prevRefresh) => !prevRefresh);
  };

  const handleRemoveStudent = (studentId) => {
    const selectedStudent = selectedGroup.students.filter((student) => student.id === studentId);
    console.log("removing student ", selectedStudent.at(0).id, " from group ", selectedGroup.id);
    updateDoc(doc(collection(FIREBASE_DB, 'users'), selectedStudent.at(0).id), {volunteerPlaceID: null});
    fetchData();
  };

  const handleToggleSelect = (studentID) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentID) {
          return {
            ...student,
            selected: !student.selected,
          };
        }
        return student;
      })
    );
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#E0E0E0",
        borderRadius: 5,
      }}
      onPress={() => setSelectedGroup(item)}
    >
      <Text>{item.name}</Text>
      <Text>{item.students.length} Students</Text>
    </TouchableOpacity>
  );

  const renderStudent = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#F5F5F5",
        borderRadius: 5,
      }}
    >
      <Text>{item.name}</Text>
      <TouchableOpacity
        style={{ backgroundColor: "red", padding: 5, borderRadius: 5 }}
        onPress={() => handleRemoveStudent(item.id)}
      >
        <Text style={{ color: "white" }}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddStudent = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#E0E0E0",
        borderRadius: 5,
      }}
      onPress={() => handleToggleSelect(item.id)}
    >
      <Text>{item.name}</Text>
      <Text>{item.selected ? "Selected" : "Not Selected"}</Text>
    </TouchableOpacity>
  );

  const fetchData = async () => {
    const groupQuery = query(collection(FIREBASE_DB, 'events'), where('layerID', '==', uid));
    const groupsSnapShot = await getDocs(groupQuery);
    if (groupsSnapShot.empty){
      Alert.alert('No volunteering places(Groups) found', 'add a group by creating a re-accoring event in the events screen', [{text: 'OK', onPress: () => {console.log("OK pressed")}}]);
    }
    else{
      let collectGroups = new Array();
      groupsSnapShot.forEach((group) => {
        if (group.get('repeat') !== 0){
          console.log("pushing event: ", group.id);
          collectGroups.push({id: group.id, name: group.get('title'), students: new Array()});
        }
      })
      const studentsQuery = query(collection(FIREBASE_DB, 'users'), where('manager', '==', uid));
      const studentsSnapShot = await getDocs(studentsQuery);
      if (studentsSnapShot.empty){
        Alert.alert('no students found', 'make sure your students entered the system using your school code(in your profile)', [{text: 'OK', onPress: () => {console.log("OK pressed")}}]);
      }
      else{
        let collectStudents = new Array();
        console.log("scanning students");
        studentsSnapShot.forEach((student) => {
          const volunteerPlaceID = student.get('volunteerPlaceID');
          const studentObj = {id: student.id, name: student.get('name'), volunteerPlace: volunteerPlaceID, selected: false};
          let hasGroup = false;
          collectGroups.forEach((group) => {
            if (group.id === volunteerPlaceID){
              group.students.push(studentObj);
              hasGroup = true;
            }
          });
          if (!hasGroup){
            collectStudents.push(studentObj);
          }
        })
        setGroups(collectGroups);
        setStudents(collectStudents);
        console.log(groups);
        console.log(students);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    setLoading(false);
    setRefresh(true);
  }, []);

  if (loading){
    return (<Text>Loading...</Text>)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addStudentButton} onPress={() => {
        if (selectedGroup===null){
          Alert.alert('No group selected', 'select a group by pressing on the group you want to add students to', [{text: 'OK', onPress: () => console.log("OK pressed")}]);
        } 
        else{setShowAddStudent(true)}
        }}>
        <Text style={{ color: "white", fontSize: 16, textAlign: "center", top: 9, }}>Add Student</Text>
      </TouchableOpacity>
      <View style={{maxHeight: '23%'}} onLayout={(event) => {const {x, y, width, height} = event.nativeEvent.layout; setGroupsHeight(height)}}>
        <Text style={{ fontSize: 20, marginBottom: 5, marginTop: 5 }}>Groups</Text>
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id.toString()}
          style={{flexGrow: 0}}
        />
        <View style={styles.line}></View>
      </View>

      <View>
        {selectedGroup && (
          <View>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
              Students in {selectedGroup.name}
            </Text>
            <FlatList
              style={{height: screenHeight - groupsHeight - 225}}
              data={selectedGroup.students}
              renderItem={renderStudent}
              keyExtractor={(item) => item.id.toString()}
            />
            <View style={styles.line}></View>
          </View>
        )}
      </View>

      <Modal visible={showAddStudent} animationType="slide">
        <SafeAreaView style={styles.container}>
          <TouchableOpacity style={styles.confirmButton} onPress={() => handleAddStudent()}>
            <Text style={{ color: "white", fontSize: 16, textAlign: "center", top: 9, }}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddStudent(false)}>
            <Text style={{ color: "white", fontSize: 16, textAlign: "center", top: 9, }}>Cancel</Text>
          </TouchableOpacity>
          <View style={{height: screenHeight - 180}}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Add Student</Text>
            <FlatList
              data={getAvailableStudents()}
              renderItem={renderAddStudent}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  addStudentButton: {
    height: 40, 
    width: '100%', 
    backgroundColor: 'blue', 
    position: 'absolute', 
    bottom: 17, 
    alignSelf: 'center', 
    borderRadius: 5,
  },
  confirmButton: {
    height: 42,
    width: '100%',
    backgroundColor: '#08a50a',
    position: 'absolute',
    bottom: 60, 
    alignSelf: 'center', 
    borderRadius: 5,
  },
  cancelButton: {
    height: 42,
    width: '100%', 
    backgroundColor: '#ff2a2a', 
    position: 'absolute', 
    bottom: 13, 
    alignSelf: 'center', 
    borderRadius: 5,
  },
  line: {
    marginBottom: 10,
    width: "100%",
    height: 2,
    backgroundColor: "black",
  },
});

export default GroupList;
