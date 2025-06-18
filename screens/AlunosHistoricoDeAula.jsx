import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClassHistoryScreen = ({ route }) => {
  const { studentId } = route.params;
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const loadAttendanceHistory = async () => {
    setIsLoading(true);
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const attendanceKeys = allKeys.filter(key => 
        key.startsWith(`attendance_${studentId}_`)
      );
      
      const records = await AsyncStorage.multiGet(attendanceKeys);
      const parsedRecords = records.map(([key, value]) => JSON.parse(value));
      
      setAttendanceHistory(parsedRecords);
    } catch (error) {
      console.error('Error loading attendance history:', error);
      Alert.alert('Erro', 'Falha ao carregar histórico de presenças');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Histórico de Aulas</Text>
          
          <FlatList
            data={attendanceHistory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <MaterialIcons 
                  name="check-circle" 
                  size={24} 
                  color="#4CAF50" 
                  style={styles.icon}
                />
                <View style={styles.historyDetails}>
                  <Text style={styles.classText}>Turma: {item.classId}</Text>
                  <Text style={styles.dateText}>Data: {formatDate(item.date)}</Text>
                  <Text style={styles.distanceText}>
                    Distância: {item.distance}m do local
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum registro de presença encontrado
              </Text>
            }
          />
        </Card.Content>
      </Card>
    </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  icon: {
    marginRight: 15,
  },
  historyDetails: {
    flex: 1,
  },
  classText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    color: '#666',
    marginBottom: 4,
  },
  distanceText: {
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default ClassHistoryScreen;