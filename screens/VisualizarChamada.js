import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';

const ViewAttendanceScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const records = await AsyncStorage.getItem(`attendance_${user.tuitionNumber}`);
      if (records) setAttendanceRecords(JSON.parse(records));
    } catch (e) {
      console.error('Failed to load attendance', e);
    }
  };

  const getAttendanceForDate = (date) => {
    const record = attendanceRecords.find(r => r.date === date);
    return record ? record.records : [];
  };

  const deleteAttendanceRecord = async (date) => {
    try {
      const updatedRecords = attendanceRecords.filter(record => record.date !== date);
      await AsyncStorage.setItem(
        `attendance_${user.tuitionNumber}`,
        JSON.stringify(updatedRecords)
      );
      setAttendanceRecords(updatedRecords);
      setSelectedDate(null);
    } catch (e) {
      console.error('Failed to delete record', e);
    }
  };

  return (
    <View style={styles.container}>
      {!selectedDate ? (
        <>
          <Text style={styles.title}>Attendance History</Text>
          <ScrollView style={styles.listContainer}>
            {attendanceRecords.map(record => (
              <Card key={record.date} style={styles.card}>
                <Card.Content>
                  <Text style={styles.cardTitle}>{record.date}</Text>
                  <View style={styles.statsContainer}>
                    <Text style={styles.present}>
                      <MaterialIcons name="check" size={16} color="green" /> 
                      {record.records.filter(r => r.present).length} Present
                    </Text>
                    <Text style={styles.absent}>
                      <MaterialIcons name="close" size={16} color="red" /> 
                      {record.records.filter(r => !r.present).length} Absent
                    </Text>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button 
                    onPress={() => setSelectedDate(record.date)}
                    icon="eye"
                  >
                    View
                  </Button>
                  <Button 
                    onPress={() => deleteAttendanceRecord(record.date)}
                    icon="delete"
                  >
                    Delete
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>
            <MaterialIcons name="calendar-today" size={20} /> {selectedDate}
          </Text>
          <Button 
            onPress={() => setSelectedDate(null)}
            style={styles.backButton}
            icon="arrow-left"
          >
            Back to List
          </Button>
          
          <ScrollView>
            {getAttendanceForDate(selectedDate).map(record => (
              <List.Item
                key={record.studentId}
                title={`${record.studentName} (${record.studentTuition})`}
                left={() => (
                  <MaterialIcons 
                    name={record.present ? "check-circle" : "cancel"} 
                    size={24} 
                    color={record.present ? "green" : "red"} 
                  />
                )}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  present: {
    color: 'green',
  },
  absent: {
    color: 'red',
  },
  detailsContainer: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    marginBottom: 16,
  },
});

export default ViewAttendanceScreen;