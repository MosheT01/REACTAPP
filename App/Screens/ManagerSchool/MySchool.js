import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";

const GroupList = () => {
  const [groups, setGroups] = useState([
    { id: 1, name: "Group A", students: [] },
    { id: 2, name: "Group B", students: [] },
    { id: 3, name: "Group C", students: [] },
  ]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([
    { id: 1, name: "John Doe", selected: false },
    { id: 2, name: "Jane Smith", selected: false },
    { id: 3, name: "Alice Johnson", selected: false },
    { id: 4, name: "Bob Williams", selected: false },
  ]);
  const [refresh, setRefresh] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false); // State variable to control the visibility of the "Add Student" section

  const getAvailableStudents = () => {
    const usedStudentIds = groups.flatMap((group) =>
      group.students.map((student) => student.id)
    );
    return students.filter((student) => !usedStudentIds.includes(student.id));
  };

  const handleAddStudent = () => {
    if (selectedGroup) {
      const selectedStudents = students.filter((student) => student.selected);
      setGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) => {
          if (group.id === selectedGroup.id) {
            return {
              ...group,
              students: [...group.students, ...selectedStudents],
            };
          }
          return group;
        });
        return updatedGroups;
      });
      setSelectedGroup(null);
      setStudents((prevStudents) =>
        prevStudents.map((student) => ({
          ...student,
          selected: false,
        }))
      );
      setShowAddStudent(false); // Hide the "Add Student" section
    }
  };

  const handleToggleSelect = (studentId) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            selected: !student.selected,
          };
        }
        return student;
      })
    );
  };

  const handleRemoveStudent = (studentId) => {
    setGroups((prevGroups) => {
      const updatedGroups = prevGroups.map((group) => {
        if (group.id === selectedGroup.id) {
          const updatedStudents = group.students.filter(
            (student) => student.id !== studentId
          );
          return {
            ...group,
            students: updatedStudents,
          };
        }
        return group;
      });
      return updatedGroups;
    });

    setSelectedGroup((prevSelectedGroup) => {
      if (prevSelectedGroup && prevSelectedGroup.id === selectedGroup.id) {
        const updatedStudents = prevSelectedGroup.students.filter(
          (student) => student.id !== studentId
        );
        return {
          ...prevSelectedGroup,
          students: updatedStudents,
        };
      }
      return prevSelectedGroup;
    });

    setRefresh(true);
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

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  // Reload the whole component when refresh is true
  if (refresh) {
    return <GroupList />;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Groups</Text>
      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id.toString()}
      />

      {selectedGroup && (
        <View>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>
            Students in {selectedGroup.name}
          </Text>
          <FlatList
            data={selectedGroup.students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.id.toString()}
            extraData={refresh} // Trigger re-render when refresh value changes
          />
        </View>
      )}

      {!showAddStudent && (
        <TouchableOpacity
          style={{
            backgroundColor: "blue",
            padding: 10,
            alignItems: "center",
            borderRadius: 5,
            marginTop: 10,
          }}
          onPress={() => setShowAddStudent(true)} // Show the "Add Student" section
        >
          <Text style={{ color: "white" }}>Add Student</Text>
        </TouchableOpacity>
      )}

      {showAddStudent && groups.every((group) => group.students.length === 0) && (
        <TouchableOpacity
          style={{
            backgroundColor: "blue",
            padding: 10,
            alignItems: "center",
            borderRadius: 5,
            marginTop: 10,
          }}
          onPress={() => setShowAddStudent(false)} // Hide the "Add Student" section
        >
          <Text style={{ color: "white" }}>Cancel</Text>
        </TouchableOpacity>
      )}

      {showAddStudent && groups.every((group) => group.students.length === 0) && (
        <>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Add Student</Text>
          <FlatList
            data={getAvailableStudents()}
            renderItem={renderAddStudent}
            keyExtractor={(item) => item.id.toString()}
          />

          <TouchableOpacity
            style={{
              backgroundColor: "green",
              padding: 10,
              alignItems: "center",
              borderRadius: 5,
              marginTop: 10,
            }}
            onPress={handleAddStudent}
          >
            <Text style={{ color: "white" }}>Confirm</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default GroupList;
