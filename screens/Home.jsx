import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import { ROUTES } from '../constants/routes';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Dashboard</Title>
          <MaterialIcons 
            name="school" 
            size={80} 
            color="#6200ee" 
            style={styles.icon}
          />
          
          {/* Classroom Management Section */}
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate(ROUTES.CLASS_CONFIG)}
            style={styles.button}
            icon="account-group"
          >
            Gerenciar Turmas
          </Button>

          {/* Student Management */}
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate(ROUTES.ALUNOS_TAB)}
            style={styles.button}
            icon="account-multiple"
          >
            Gerenciar Alunos
          </Button>

          {/* Attendance Actions */}
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate(ROUTES.CHECAR_PRESENCA)}
            style={styles.button}
            icon="calendar-check"
          >
            Registrar Presença
          </Button>

          {/* Attendance History */}
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate(ROUTES.HISTORICO_PRESENCA)}
            style={styles.button}
            icon="history"
          >
            Histórico de Presenças
          </Button>

          {/* Logout */}
          <Button 
            mode="outlined" 
            onPress={logout}
            style={styles.logoutButton}
            icon="logout"
            labelStyle={{ color: '#6200ee' }}
          >
            Sair
          </Button>
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
  card: {
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
  },
  logoutButton: {
    marginTop: 20,
    borderColor: '#6200ee',
  },
});

export default HomeScreen;