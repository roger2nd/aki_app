import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, Modal, Text as RNText, ActivityIndicator } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import ClassService from '../services/ClassService';
import { parseQRCodeData } from '../services/GeoLocationQRCodeService';
import { ROUTES } from '../constants/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudentDashboard = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [showMenu, setShowMenu] = useState(true);

  const handleActionSelection = async (action) => {
    if (action === 'scan') {
      // Request camera permission only when needed
      const granted = await requestCameraPermission();
      if (granted) {
        setScannerVisible(true);
        setShowMenu(false);
      } else {
        Alert.alert('Permissão necessária', 'Você precisa conceder permissão para usar a câmera');
      }
    } else {
      // Navigate to class history
      navigation.navigate(ROUTES.ALUNOS_HISTORICO, { studentId: user.tuitionNumber });
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (!cameraReady) return;
    
    try {
      const qrData = parseQRCodeData(data);
      
      if (qrData.type === 'class') {
        await handleClassQR(qrData);
        Alert.alert('Sucesso', 'Você foi adicionado à turma!');
      } 
      else if (qrData.type === 'attendance') {
        await handleAttendanceQR(qrData);
        Alert.alert('Sucesso', 'Presença registrada com sucesso!');
      } else {
        throw new Error('QR code inválido para esta ação');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setScannerVisible(false);
      setShowMenu(true);
      setCameraReady(false);
    }
  };

  const handleClassQR = async (qrData) => {
    setIsLoading(true);
    try {
      const classData = await ClassService.getClass(qrData.classId);
      const studentData = {
        id: user.tuitionNumber,
        name: user.name,
        tuitionNumber: user.tuitionNumber
      };
      
      await ClassService.addStudentToClass(qrData.classId, studentData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceQR = async (qrData) => {
    setIsLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        qrData.location.latitude,
        qrData.location.longitude
      );

      if (distance > qrData.radius) {
        Alert.alert('Você está fora do perimetro permitido');
        throw new Error(`Você está ${distance.toFixed(2)}m longe da sala`);
      }

      const attendanceRecord = {
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        classId: qrData.classId,
        teacherId: qrData.teacherId,
        location: location.coords,
        distance: distance.toFixed(2),
        status: 'present'
      };

      await AsyncStorage.setItem(
        `attendance_${user.tuitionNumber}_${qrData.classId}_${Date.now()}`,
        JSON.stringify(attendanceRecord)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (showMenu) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Keep only the existing title - no separate header */}
            <RNText style={styles.title}>Meu Dashboard</RNText>
            
            <MaterialIcons 
              name="account-circle" 
              size={80} 
              color="#6200ee" 
              style={styles.icon}
            />
            
            <RNText style={styles.welcome}>Olá, {user.name}!</RNText>
            <RNText style={styles.info}>Matrícula: {user.tuitionNumber}</RNText>
            
            <Button
              mode="contained"
              onPress={() => handleActionSelection('scan')}
              style={styles.button}
              icon="qrcode-scan"
            >
              Escanear QR Code
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleActionSelection('history')}
              style={styles.button}
              icon="history"
            >
              Ver Minhas Aulas
            </Button>

            {/* Add logout button at the bottom of the card */}
            <Button
              mode="outlined"
              onPress={() => logout()}
              style={styles.logoutButton}
              textColor="#ff0000"
              icon="logout"
            >
              Sair
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <Modal
      visible={scannerVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        setScannerVisible(false);
        setShowMenu(true);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {hasPermission ? (
            <Camera
              style={styles.camera}
              type={Camera.Constants.Type.back}
              onBarCodeScanned={cameraReady ? handleBarCodeScanned : undefined}
              onCameraReady={() => setCameraReady(true)}
              barCodeScannerSettings={{
                barCodeTypes: ['qr'],
              }}
            >
              <View style={styles.rectangleContainer}>
                <View style={styles.rectangle} />
              </View>
            </Camera>
          ) : (
            <RNText style={styles.permissionText}>
              Permissão de câmera não concedida
            </RNText>
          )}
          <Button 
            mode="contained" 
            onPress={() => {
              setScannerVisible(false);
              setShowMenu(true);
            }}
            style={styles.closeButton}
          >
            Voltar
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
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
  info: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  camera: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rectangle: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: '#6200ee',
    backgroundColor: 'transparent',
  },
  permissionText: {
    marginVertical: 20,
    color: 'red',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
    width: '100%',
  },
   logoutButton: {
    marginTop: 20,
    borderColor: '#ff0000',
  },
});

export default StudentDashboard;