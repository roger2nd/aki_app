import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title, Appbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';

const HomeScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Classroom Attendance</Title>
          <MaterialIcons 
            name="school" 
            size={80} 
            color="#6200ee" 
            style={styles.icon}
          />
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Students')}
            style={styles.button}
            icon="account-multiple"
          >
            Manage Students
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Attendance')}
            style={styles.button}
            icon="calendar-check"
          >
            Take Attendance
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('History')}
            style={styles.button}
            icon="history"
          >
            View History
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