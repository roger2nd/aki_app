import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title, Appbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import { ROUTES } from '../routes';

const HomeScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);

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
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate(ROUTES.GERENCIADOR_ALUNOS)}
            style={styles.button}
            icon="account-multiple"
          >
            Gerenciar Alunos
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate(ROUTES.CHECAR_PRESENCA)}
            style={styles.button}
            icon="calendar-check"
          >
            Presenca
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate(ROUTES.HISTORICO_PRESENCA)}
            style={styles.button}
            icon="history"
          >
            Historico
          </Button>
          <Button 
            mode="outlined" 
            onPress={logout}
            style={styles.logoutButton}
            icon="logout"
          >
            Logout
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
  },
  card: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  button: {
    marginVertical: 10,
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default HomeScreen;