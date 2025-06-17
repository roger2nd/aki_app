import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { Button, TextInput, Text, Card, Title, Divider, List } from 'react-native-paper';
import * as Location from 'expo-location';
import { AuthContext } from '../scripts/Authenticator';
import ClassService from '../services/ClassService';
import { ROUTES } from '../constants/routes';

const ClassroomConfigScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [className, setClassName] = useState('');
  const [radius, setRadius] = useState('10');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    ////////////// DEBUG/////////////
    const testService = async () => {
      try {
        const test = await ClassService.getClasses('test');
        console.log('Service test:', test);
      } catch (error) {
        console.error('Service test failed:', error);
      }
    };
    testService();
    /////////////////////////////////////
    const unsubscribe = navigation.addListener('focus', () => {
      loadClasses();
    });
    return unsubscribe;
    }, []);

    const loadClasses = async () => {
      try {
        const allClasses = await ClassService.getClasses(user.tuitionNumber);
        setClasses(allClasses);
        if (allClasses.length > 0 && !currentClass) {
          setCurrentClass(allClasses[0]);
          setClassName(allClasses[0].name);
          setRadius(allClasses[0].geofenceRadius?.toString() || '10');
        }
      } catch (error) {
        console.error('Error loading classes:', error);
        Alert.alert('Erro', 'Falha ao carregar turmas: ' + error.message);
      }
    };

    const handleCreateClass = () => {
      setCurrentClass({
        id: Date.now().toString(),
        name: '',
        teacherId: user.tuitionNumber,
        geofenceRadius: 10,
        location: null,
        students: [],
        createdAt: new Date().toISOString()
      });
      setClassName('');
      setRadius('10');
    };

    const handleSaveClass = async () => {
      if (!className) {
        Alert.alert('Erro', 'Informe o nome da turma');
        return;
      }

      setIsLoading(true);
      
      try {
        const classData = {
          ...currentClass,
          name: className,
          geofenceRadius: parseInt(radius) || 10
        };
        
        const savedClass = await ClassService.saveClass(classData);
        console.log('Saved class:', savedClass); // Debug log
        
        setCurrentClass(savedClass);
        await loadClasses();
        Alert.alert('Sucesso', 'Turma salva com sucesso!');
      } catch (error) {
        console.error('Error saving class:', error);
        Alert.alert('Erro', 'Falha ao salvar turma: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const handleDeleteClass = async () => {
      if (!currentClass?.id) {
        Alert.alert('Erro', 'Nenhuma turma selecionada');
        return;
      }

      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir permanentemente:\n\n` +
        `• Turma: ${currentClass.name}\n` +
        `• ${currentClass.students?.length || 0} alunos\n` +
        `• Todos os registros de presença associados`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                
                // Use ClassService for deletion
                await ClassService.deleteClass(currentClass.id);
                
                // Update local state
                const updatedClasses = await ClassService.getClasses(user.tuitionNumber);
                setClasses(updatedClasses);
                
                // Reset form if deleted class was being edited
                if (currentClass.id === currentClass?.id) {
                  setCurrentClass(null);
                  setClassName('');
                  setRadius('10');
                }
                
                Alert.alert('Sucesso', 'Turma e todos os dados relacionados foram excluídos!');
              } catch (error) {
                console.error('Error deleting class:', error);
                Alert.alert('Erro', 'Falha ao excluir turma e seus dados');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    };

    const handleSetLocation = async () => {
      setIsLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Permita acesso à localização');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const updatedClass = {
          ...currentClass,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
        };
        setCurrentClass(updatedClass);
        Alert.alert('Sucesso', 'Localização definida!');
      } catch (error) {
        Alert.alert('Erro', 'Falha ao obter localização');
      } finally {
        setIsLoading(false);
      }
    };

    const isNewUnsavedClass = () => {
      return currentClass && !classes.some(c => c.id === currentClass.id);
    };

    const navigateToAddStudent = () => {
      if (!currentClass?.id) {
        Alert.alert('Erro', 'Selecione uma turma primeiro');
        return;
      }
      navigation.navigate(ROUTES.ADICIONAR_ALUNO, { classId: currentClass.id });
    };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Gerenciar Turmas</Title>

          {/* Class List */}
          <FlatList
            data={classes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`${item.students?.length || 0} alunos`}
                left={() => <List.Icon icon="account-group" />}
                right={() => (
                  <Button 
                    mode="text"
                    onPress={() => {
                      setCurrentClass(item);
                      setClassName(item.name);
                      setRadius(item.geofenceRadius.toString());
                    }}
                  >
                    Selecionar
                  </Button>
                )}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma turma criada</Text>
            }
            scrollEnabled={false}
          />

          <Button
            mode="outlined"
            onPress={handleCreateClass}
            style={styles.button}
            icon="plus"
          >
            Nova Turma
          </Button>

          {/* Class Editor */}
          {currentClass && (
            <>
              <Divider style={styles.divider} />
              <Title style={styles.subtitle}>
                {classes.some(c => c.id === currentClass.id) ? 'Editar Turma' : 'Nova Turma'}
              </Title>

              <TextInput
                label="Nome da Turma"
                value={className}
                onChangeText={setClassName}
                style={styles.input}
              />

              <TextInput
                label="Raio (metros)"
                value={radius}
                onChangeText={setRadius}
                keyboardType="numeric"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleSetLocation}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                icon="map-marker"
              >
                {currentClass.location ? 'Atualizar Localização' : 'Definir Localização'}
              </Button>

              <Button
                mode="contained"
                onPress={handleSaveClass}
                loading={isLoading}
                disabled={isLoading}
                style={styles.saveButton}
                icon="content-save"
              >
                Salvar Turma
              </Button>

              <Button
                mode="contained"
                onPress={handleDeleteClass}
                loading={isLoading}
                disabled={isLoading || isNewUnsavedClass()}
                style={[styles.button, styles.deleteButton]}
                icon="delete"
                textColor="#fff"
              >
                Excluir Turma
              </Button>

              <Button
                mode="contained"
                onPress={navigateToAddStudent}
                disabled={!currentClass?.id || isNewUnsavedClass()}
                style={styles.button}
                icon="account-plus"
              >
                Adicionar Aluno
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 8,
  },
  saveButton: {
    marginVertical: 16,
  },
  coordinates: {
    marginVertical: 8,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
  },
  divider: {
    marginVertical: 16,
  },
});

export default ClassroomConfigScreen;