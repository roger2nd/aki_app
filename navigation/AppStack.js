import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { AuthContext } from '../scripts/Authenticator';
import HomeScreen from '../screens/Home';
import ManageStudentsScreen from '../screens/GerenciadorAlunos';
import TakeAttendanceScreen from '../screens/ChecarChamada';
import ViewAttendanceScreen from '../screens/VisualizarChamada';
import ClassroomConfigScreen from '../screens/SalaDeAulaConfig';
import StudentDashboard from '../screens/AlunosDashboard';
import AddStudentScreen from '../screens/AdicionarAluno';   
import { ROUTES } from '../constants/routes';

const NativeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  const { logout } = useContext(AuthContext);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ManageStudentsTab') {
            iconName = focused ? "account-group" : "account-group-outline";
          } else if (route.name === 'TakeAttendanceTab') {
            iconName = focused ? 'calendar' : 'calendar-check-outline';
          } else if (route.name === 'ViewAttendanceTab') {
            iconName = 'history';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <Pressable onPress={() => logout()} style={{ marginRight: 16 }}>
            <MaterialCommunityIcons name="logout" size={24} color="#6200ee" />
          </Pressable>
        )
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ title: 'Início' }}
      />
      <Tab.Screen 
        name="ManageStudentsTab" 
        component={ManageStudentsScreen}
        options={{ title: 'Alunos' }}
      />
      <Tab.Screen 
        name="TakeAttendanceTab" 
        component={TakeAttendanceScreen}
        options={{ title: 'Chamada' }}
      />
      <Tab.Screen 
        name="ViewAttendanceTab" 
        component={ViewAttendanceScreen}
        options={{ title: 'Histórico' }}
      />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  const { user } = useContext(AuthContext);

  return (
    <NativeStack.Navigator>
      {user?.role === 'admin' ? (
        <NativeStack.Screen
          name="MainApp"
          component={AdminTabs}
          options={{ headerShown: false }}
        />
      ) : (
        <NativeStack.Screen 
          name="StudentDashboard" 
          component={StudentDashboard}
          options={{ 
            title: 'Meu Dashboard',
            headerRight: () => (
              <Button 
                icon="logout"
                textColor="#6200ee"
                onPress={() => logout()}
              >
                Sair
              </Button>
            )
          }}   
        />
      )}
      
      {/* Shared Screens */}
      <NativeStack.Screen
        name={ROUTES.CLASS_CONFIG}
        component={ClassroomConfigScreen}
        options={{ 
          title: 'Configuração de Turma',
          presentation: 'modal'
        }}
      />
      <NativeStack.Screen
        name={ROUTES.ADICIONAR_ALUNO}
        component={AddStudentScreen}
        options={{ title: 'Adicionar Aluno' }}
      />
      <NativeStack.Screen
        name={ROUTES.GERENCIADOR_ALUNOS}
        component={ManageStudentsScreen}
        options={{ title: 'Alunos da Turma' }}
      />
    </NativeStack.Navigator>
  );
};

export default MainStack;