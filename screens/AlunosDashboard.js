import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeaderButton } from '../components/HeaderButton';

const StudentDashboard = ({ navigation }) => {
  const { user, logout, classroomLocation, geofenceRadius } = useContext(AuthContext);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [lastAttendance, setLastAttendance] = useState(null);
  const [isInClassroom, setIsInClassroom] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton 
          iconName="logout" 
          onPress={logout} 
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadLastAttendance();
  }, []);

  const loadLastAttendance = async () => {
    try {
      const attendance = await AsyncStorage.getItem(`lastAttendance_${user.tuitionNumber}`);
      if (attendance) setLastAttendance(JSON.parse(attendance));
    } catch (e) {
      console.error('Falha no carregamento', e);
    }
  };

  const checkLocation = async () => {
    setIsCheckingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permissao de geolocalizacao necessaria');
        return false;
      }

      let location = await Location.getCurrentPositionAsync({});
      return location.coords;
    } catch (error) {
      Alert.alert('Error', 'Falha em geolocalizar');
      return false;
    } finally {
      setIsCheckingLocation(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Formula de Haversine calculas distance entre duas coordenadas
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // metros
  };

  const markAttendance = async () => {
    if (!classroomLocation) {
      Alert.alert('Error', 'A localixao da classe nao foi configurada pelo professor');
      return;
    }

    const coords = await checkLocation();
    if (!coords) return;

    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      classroomLocation.latitude,
      classroomLocation.longitude
    );

    const withinClassroom = distance <= geofenceRadius;
    setIsInClassroom(withinClassroom);

    if (withinClassroom) {
      const attendanceRecord = {
        date: new Date().toISOString(),
        timestamp: new Date().getTime(),
        location: coords,
        distance: distance.toFixed(2),
        status: 'presente'
      };

      try {
        await AsyncStorage.setItem(
          `lastAttendance_${user.tuitionNumber}`,
          JSON.stringify(attendanceRecord)
        );
        setLastAttendance(attendanceRecord);
        Alert.alert('Success', 'Presenca confirmada!');
      } catch (e) {
        Alert.alert('Error', 'Registro de presenca falhou');
      }
    } else {
      Alert.alert(
        'Nao esta em sala', 
        `Voce esta ${distance.toFixed(2)}m de distancia do delta (max ${geofenceRadius}m)`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Student Dashboard</Text>
          <MaterialIcons 
            name="account-circle" 
            size={80} 
            color="#6200ee" 
            style={styles.icon}
          />
          
          <Text style={styles.welcome}>Welcome, {user.name}!</Text>
          <Text style={styles.tuition}>Tuition: {user.tuitionNumber}</Text>
          
          <Button
            mode="contained"
            onPress={markAttendance}
            loading={isCheckingLocation}
            disabled={isCheckingLocation}
            style={styles.button}
            icon="map-marker-check"
          >
            AKI
          </Button>
          
          {lastAttendance && (
            <View style={styles.attendanceInfo}>
              <Text style={styles.lastAttendance}>
                Last Attendance: {new Date(lastAttendance.timestamp).toLocaleString()}
              </Text>
              <Text>
                Status: <Text style={lastAttendance.status === 'present' ? styles.present : styles.absent}>
                  {lastAttendance.status === 'present' ? 'Present' : 'Absent'}
                </Text>
              </Text>
              {lastAttendance.distance && (
                <Text>Distance: {lastAttendance.distance}m from classroom</Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  welcome: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
  },
  tuition: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    marginVertical: 20,
  },
  attendanceInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  lastAttendance: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  present: {
    color: 'green',
    fontWeight: 'bold',
  },
  absent: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default StudentDashboard;