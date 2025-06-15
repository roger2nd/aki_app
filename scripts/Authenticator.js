import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

// Predefined test accounts
const TEST_ACCOUNTS = {
  admin: {
    tuitionNumber: '1001',
    name: 'Test Admin',
    password: 'admin123',
    role: 'admin',
    registeredAt: new Date().toISOString(),
    classroomLocation: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    geofenceRadius: 10
  },
  student: {
    tuitionNumber: '2001',
    name: 'Test Student',
    password: 'student123',
    role: 'student',
    registeredAt: new Date().toISOString(),
    classroomLocation: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    geofenceRadius: 10
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classroomLocation, setClassroomLocation] = useState(null);
  const [geofenceRadius, setGeofenceRadius] = useState(10); // metros

  useEffect(() => {
    checkLoginStatus();
    loadClassroomSettings();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      const registeredUsers = await SecureStore.getItemAsync('registeredUsers');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (registeredUsers) {
          const users = JSON.parse(registeredUsers);
          const userExists = users.some(u => u.tuitionNumber === parsedUser.tuitionNumber);
          if (userExists) {
            setUser(parsedUser);
          }
        }
      }
    } catch (e) {
      console.error('Falha ao carregar dados do usuário', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassroomSettings = async () => {
    try {
      const settings = await SecureStore.getItemAsync('classroomSettings');
      if (settings) {
        const { location, radius } = JSON.parse(settings);
        setClassroomLocation(location);
        setGeofenceRadius(radius);
      }
    } catch (e) {
      console.error('Falha ao carregar configurações da sala', e);
    }
  };

  const saveClassroomSettings = async (location, radius) => {
    try {
      const updatedUser = {
        ...user,
        classroomLocation: location,
        geofenceRadius: radius
      };
      
      if (![TEST_ACCOUNTS.admin.tuitionNumber, TEST_ACCOUNTS.student.tuitionNumber].includes(user?.tuitionNumber)) {
        await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      }
      
      setUser(updatedUser);
      return true;
    } catch (e) {
      console.error('Falha ao salvar configurações da sala', e);
      return false;
    }
  };

  const login = async (tuitionNumber, password) => {
    try {
      // Contas teste primeiro
      if (tuitionNumber === TEST_ACCOUNTS.admin.tuitionNumber && 
          password === TEST_ACCOUNTS.admin.password) {
        setUser(TEST_ACCOUNTS.admin);
        return { success: true };
      }
      if (tuitionNumber === TEST_ACCOUNTS.student.tuitionNumber && 
          password === TEST_ACCOUNTS.student.password) {
        setUser(TEST_ACCOUNTS.student);
        return { success: true };
      }

      // Verificar usuários registrados
      const registeredUsers = await SecureStore.getItemAsync('registeredUsers');
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        const foundUser = users.find(user => 
          user.tuitionNumber === tuitionNumber && 
          user.password === password
        );
        
        if (foundUser) {
          await SecureStore.setItemAsync('userData', JSON.stringify(foundUser));
          setUser(foundUser);
          return { success: true };
        }
      }
      return { success: false, error: 'Matrícula ou senha incorretas' };
    } catch (e) {
      console.error('Falha no login', e);
      return { success: false, error: 'Erro durante o login. Tente novamente.' };
    }
  };

  const register = async (userData) => {
    try {
      // Verificar contas teste
      if ([TEST_ACCOUNTS.admin.tuitionNumber, TEST_ACCOUNTS.student.tuitionNumber]
          .includes(userData.tuitionNumber)) {
        throw new Error('Esta matrícula é reservada para contas teste');
      }

      // Verificar se usuário já existe
      const existingUsers = await SecureStore.getItemAsync('registeredUsers');
      let users = [];
      
      if (existingUsers) {
        users = JSON.parse(existingUsers);
        const userExists = users.some(user => 
          user.tuitionNumber === userData.tuitionNumber
        );
        
        if (userExists) {
          throw new Error('Matrícula já cadastrada');
        }
      }

      // Criar novo usuário
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        registeredAt: new Date().toISOString(),
        classroomLocation: null,
        geofenceRadius: 10
      };

      users.push(newUser);
      await SecureStore.setItemAsync('registeredUsers', JSON.stringify(users));
      await SecureStore.setItemAsync('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Falha no registro:', error);
      return { 
        success: false, 
        error: error.message || 'Erro durante o registro. Tente novamente.' 
      };
    }
  };

  const logout = async () => {
    try {
      if (![TEST_ACCOUNTS.admin.tuitionNumber, TEST_ACCOUNTS.student.tuitionNumber]
          .includes(user?.tuitionNumber)) {
        await SecureStore.deleteItemAsync('userData');
      }
      setUser(null);
    } catch (e) {
      console.error('Falha ao sair', e);
      throw new Error('Erro ao encerrar sessão');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      register,
      classroomLocation,
      geofenceRadius,
      saveClassroomSettings,
      testAccounts: TEST_ACCOUNTS
    }}>
      {children}
    </AuthContext.Provider>
  );
};