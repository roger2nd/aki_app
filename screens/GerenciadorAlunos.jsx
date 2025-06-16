import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Searchbar, List, Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import ClassService from '../services/ClassService';

const ManageStudentsScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const classId = route.params?.classId;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStudents();
    });
    return unsubscribe;
  }, [navigation]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      let allStudents = [];
      
      if (classId) {
        // Load students for specific class
        allStudents = await ClassService.getStudentsByClass(classId);
      } else {
        // Load all students across all classes
        const classes = await ClassService.getClasses(user.tuitionNumber);
        allStudents = classes.flatMap(c => 
          (c.students || []).map(s => ({ ...s, className: c.name }))
        );
      }
      
      setStudents(allStudents);
    } catch (error) {
      console.error('Failed to load students:', error);//debug
      Alert.alert('Erro', 'Falha ao carregar alunos');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.matricula || '').includes(searchQuery) ||
    (student.className || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar por nome, matrícula ou turma..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      {isLoading ? (
        <ActivityIndicator animating={true} color="#6200ee" />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${item.matricula} - ${item.className || ''}`}
              left={() => (
                <MaterialIcons 
                  name="person" 
                  size={24} 
                  color="#6200ee" 
                  style={styles.icon}
                />
              )}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhum aluno encontrado' : 'Nenhum aluno registrado'}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  search: {
    marginBottom: 16,
  },
  icon: {
    alignSelf: 'center',
    marginRight: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default ManageStudentsScreen;