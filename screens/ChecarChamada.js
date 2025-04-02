import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Checkbox, Button, Text, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';

const TakeAttendanceScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const savedStudents = await AsyncStorage.getItem(`students_${user.tuitionNumber}`);
      if (savedStudents) {
        const studentsList = JSON.parse(savedStudents);
        setStudents(studentsList);
        
        const initialAttendance = {};
        studentsList.forEach(student => {
          initialAttendance[student.id] = true;
        });
        setAttendance(initialAttendance);
      }
    } catch (e) {
      console.error('Failed to load students', e);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const saveAttendance = async () => {
    try {
      const attendanceRecord = {
        date,
        teacherTuition: user.tuitionNumber,
        records: students.map(student => ({
          studentId: student.id,
          studentTuition: student.tuitionNumber,
          studentName: student.name,
          present: attendance[student.id]
        }))
      };

      const existingRecords = await AsyncStorage.getItem(`attendance_${user.tuitionNumber}`);
      let allRecords = [];
      if (existingRecords) {
        allRecords = JSON.parse(existingRecords);
        // Remove if there's already a record for this date
        allRecords = allRecords.filter(record => record.date !== date);
      }

      allRecords.push(attendanceRecord);
      await AsyncStorage.setItem(
        `attendance_${user.tuitionNumber}`,
        JSON.stringify(allRecords)
      );
      
      Alert.alert('Success', 'Attendance saved successfully!');
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save attendance', e);
      Alert.alert('Error', 'Failed to save attendance');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Take Attendance - {date}</Text>
      
      <ScrollView style={styles.listContainer}>
        {students.map(student => (
          <List.Item
            key={student.id}
            title={`${student.name} (${student.tuitionNumber})`}
            left={() => (
              <Checkbox
                status={attendance[student.id] ? 'checked' : 'unchecked'}
                onPress={() => toggleAttendance(student.id)}
              />
            )}
            right={() => (
              <Text style={attendance[student.id] ? styles.present : styles.absent}>
                {attendance[student.id] ? 'Present' : 'Absent'}
              </Text>
            )}
          />
        ))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="content-save"
        label="Save Attendance"
        onPress={saveAttendance}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  present: {
    color: 'green',
    alignSelf: 'center',
  },
  absent: {
    color: 'red',
    alignSelf: 'center',
  },
});

export default TakeAttendanceScreen;