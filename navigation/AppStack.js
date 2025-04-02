import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/Home';
import ManageStudentsScreen from '../screens/GerenciadorAlunos';
import TakeAttendanceScreen from '../screens/ChecarChamada';
import ViewAttendanceScreen from '../screens/VisualizarChamada';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'Classroom Attendance' }}
    />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home';
        } else if (route.name === 'Students') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Attendance') {
          iconName = focused ? 'event-note' : 'event-note';
        } else if (route.name === 'History') {
          iconName = focused ? 'history' : 'history';
        }

        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: '#6200ee',
      inactiveTintColor: 'gray',
    }}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Students" component={ManageStudentsScreen} />
    <Tab.Screen name="Attendance" component={TakeAttendanceScreen} />
    <Tab.Screen name="History" component={ViewAttendanceScreen} />
  </Tab.Navigator>
);

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="App" 
        component={AppTabs} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;