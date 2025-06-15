import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { AuthContext } from '../scripts/Authenticator';
import HomeScreen from '../screens/Home';
import ManageStudentsScreen from '../screens/GerenciadorAlunos';
import TakeAttendanceScreen from '../screens/ChecarChamada';
import ViewAttendanceScreen from '../screens/VisualizarChamada';
import ClassroomSetupScreen from '../screens/SalaDeAulaLocation';
import StudentDashboard from '../screens/AlunosDashboard';

const NativeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  const { logout } = useContext(AuthContext);
  const screenOptions = {
    headerRight: () => (
      <Pressable onPress={() => logout()} style={{ marginRight: 16 }}>
        <MaterialIcons name="logout" size={24} color="#6200ee" />
      </Pressable>
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
    <NativeStack.Navigator>
      {user?.role === 'admin' ? (
        user.classroomLocation ? (
          <NativeStack.Screen
            name="MainApp"
            component={AdminTabs}
            options={{ headerShown: false }}
          />
        ) : (
          <NativeStack.Screen
            name="ClassroomSetup"
            component={ClassroomSetupScreen}
            options={{
              title: 'Setup Classroom'
            }}
          />
        )
      ) : (
        <NativeStack.Screen 
          name="StudentDashboard" 
          component={StudentDashboard}
          options={{ title: 'Dashboard'
          }}   
        />
      )}
    </NativeStack.Navigator>
  );
};

export default MainStack;