import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { AuthContext } from '../scripts/Authenticator';
import HomeScreen from '../screens/Home';
import ManageStudentsScreen from '../screens/GerenciadorAlunos';
import TakeAttendanceScreen from '../screens/ChecarChamada';
import ViewAttendanceScreen from '../screens/VisualizarChamada';
import ClassroomSetupScreen from '../screens/SalaDeAulaLocation';
import StudentDashboard from '../screens/AlunosDashboard';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  const { logout } = useContext(AuthContext);
  const screenOptions = {
    headerRight: () => (
      <Button 
        onPress={logout}
        icon="logout"
        color="#6200ee"
        style={{ marginRight: 10 }}
      >
        Logout
      </Button>
    )
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ManageStudents') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'TakeAttendance') {
            iconName = focused ? 'calendar-check' : 'calendar-check-outline';
          } else if (route.name === 'ViewAttendance') {
            iconName = 'history';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        screenOptions
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="ManageStudentsTab" 
        component={ManageStudentsScreen}
        options={{ title: 'Alunos' }}
      />
      <Tab.Screen 
        name="TakeAttendanceTab" 
        component={TakeAttendanceScreen}
        options={{ title: 'Presenca' }}
      />
      <Tab.Screen 
        name="ViewAttendanceTab" 
        component={ViewAttendanceScreen}
        options={{ title: 'Historico' }}
      />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  const { user, logout } = useContext(AuthContext);
  console.log(user.classroomLocation);

  return (
    <Stack.Navigator>
      {user?.role === 'admin' ? (
        user.classroomLocation ? (
          <Stack.Screen
            name="MainApp"
            component={AdminTabs}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="ClassroomSetup"
            component={ClassroomSetupScreen}
            options={{
              title: 'Setup Classroom',
              headerRight: () => (
                <Button 
                  onPress={logout}
                  icon="logout"
                  color="#6200ee"
                  style={{ marginRight: 10 }}
                >
                  Logout
                </Button>
              ),
            }}
          />
        )
      ) : (
        <Stack.Screen 
          name="StudentDashboard" 
          component={StudentDashboard}
          options={{ title: 'Dashboard' }}
        />
      )}
    </Stack.Navigator>
  );
};

export default MainStack;