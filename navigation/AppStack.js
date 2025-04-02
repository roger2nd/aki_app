import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
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

const AdminTabs = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
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
    });
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
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
    >
      <Tab.Screen 
        name="ManageStudents" 
        component={ManageStudentsScreen}
        options={{
          tabBarLabel: 'Students',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="TakeAttendance" 
        component={TakeAttendanceScreen}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-available" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ViewAttendance" 
        component={ViewAttendanceScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  const { user, logout } = useContext(AuthContext);

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
    ),
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
    {user?.role === 'admin' ? (
      user.classroomLocation ? (
        <Stack.Screen
          name="AdminMain"
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
                onPress={() => logout()}
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
        options={{ title: 'Student Dashboard' }}
      />
    )}
  </Stack.Navigator>
  );
};

export default AppStack;