import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const StatisticsScreen = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsWithSizeS, setStudentsWithSizeS] = useState(0);
  const [studentsWithSizeM, setStudentsWithSizeM] = useState(0);
  const [studentsWithSizeL, setStudentsWithSizeL] = useState(0);
  const [studentsWithSizeXL, setStudentsWithSizeXL] = useState(0);

  useEffect(() => {
    // Simulating an API call or data fetching
    // Replace this with your actual data fetching logic

    // Dummy data for demonstration
    const fetchedTotalStudents = 100;
    const fetchedStudentsWithSizeS = 20;
    const fetchedStudentsWithSizeM = 30;
    const fetchedStudentsWithSizeL = 25;
    const fetchedStudentsWithSizeXL = 25;

    setTotalStudents(fetchedTotalStudents);
    setStudentsWithSizeS(fetchedStudentsWithSizeS);
    setStudentsWithSizeM(fetchedStudentsWithSizeM);
    setStudentsWithSizeL(fetchedStudentsWithSizeL);
    setStudentsWithSizeXL(fetchedStudentsWithSizeXL);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Student Statistics</Text>

      <View style={styles.statContainer}>
        <Icon name="users" size={18} color="black" />
        <Text style={styles.statText}>Total Students:</Text>
        <Text style={styles.statValue}>{totalStudents}</Text>
      </View>

      <View style={styles.statContainer}>
        <Icon name="users" size={18} color="black" />
        <Text style={styles.statText}>Students with Size S:</Text>
        <Text style={styles.statValue}>{studentsWithSizeS}</Text>
      </View>

      <View style={styles.statContainer}>
        <Icon name="users" size={18} color="black" />
        <Text style={styles.statText}>Students with Size M:</Text>
        <Text style={styles.statValue}>{studentsWithSizeM}</Text>
      </View>

      <View style={styles.statContainer}>
        <Icon name="users" size={18} color="black" />
        <Text style={styles.statText}>Students with Size L:</Text>
        <Text style={styles.statValue}>{studentsWithSizeL}</Text>
      </View>

      <View style={styles.statContainer}>
        <Icon name="users" size={18} color="black" />
        <Text style={styles.statText}>Students with Size XL:</Text>
        <Text style={styles.statValue}>{studentsWithSizeXL}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statText: {
    fontSize: 18,
    marginLeft: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StatisticsScreen;
