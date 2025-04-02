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
    registeredAt: new Date().toISOString()
  },
  student: {
    tuitionNumber: '2001',
    name: 'Test Student',
    password: 'student123',
    role: 'student',
    registeredAt: new Date().toISOString()
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
      if (userData) setUser(JSON.parse(userData));
    } catch (e) {
      console.error('Falha ao carregar', e);
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
      console.error('Falha ao carregar', e);
    }
  };

  const saveClassroomSettings = async (location, radius) => {
    try {
      const settings = JSON.stringify({ location, radius });
      await SecureStore.setItemAsync('classroomSettings', settings);
      setClassroomLocation(location);
      setGeofenceRadius(radius);
    } catch (e) {
      console.error('Falha ao salvar as configuracoes da sala de aula', e);
      throw e;
    }
  };

  /* const login = async (userData) => {
    try {
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.error('Failed to save user data', e);
      throw e;
    }
  }; */

  const login = async (tuitionNumber, password) => {
    try {
      // Check test accounts first
      if (tuitionNumber === TEST_ACCOUNTS.admin.tuitionNumber && password === TEST_ACCOUNTS.admin.password) {
        setUser(TEST_ACCOUNTS.admin);
        return true;
      }
      if (tuitionNumber === TEST_ACCOUNTS.student.tuitionNumber && password === TEST_ACCOUNTS.student.password) {
        setUser(TEST_ACCOUNTS.student);
        return true;
      }

      // Check registered users
      const userData = await SecureStore.getItemAsync('userData');
      if (userData) {
        const storedUser = JSON.parse(userData);
        if (storedUser.tuitionNumber === tuitionNumber && storedUser.password === password) {
          setUser(storedUser);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Login falhou', e);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // Skip saving test accounts to storage
      if (![TEST_ACCOUNTS.admin.tuitionNumber, TEST_ACCOUNTS.student.tuitionNumber].includes(userData.tuitionNumber)) {
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      }
      setUser(userData);
      return true;
    } catch (e) {
      console.error('Registro de usuario falhou', e);
      return false;
    }
  };

  /* const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userData');
      setUser(null);
    } catch (e) {
      console.error('Failed to remove user data', e);
      throw e;
    }
  }; */

  const logout = async () => {
    try {
      // Don't clear storage for test accounts
      if (![TEST_ACCOUNTS.admin.tuitionNumber, TEST_ACCOUNTS.student.tuitionNumber].includes(user?.tuitionNumber)) {
        await SecureStore.deleteItemAsync('userData');
      }
      setUser(null);
    } catch (e) {
      console.error('Failed to logout', e);
      throw e; // To handle on UI
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