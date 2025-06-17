import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

export const generateClassQRCodeData = (classData) => {
  return JSON.stringify({
    classId: classData.id,
    location: classData.location,
    radius: classData.geofenceRadius,
    teacherId: classData.teacherId,
    timestamp: new Date().toISOString(),
  });
};

export const generateAttendanceQRCodeData = (classId, teacherId, location) => {
  return JSON.stringify({
    classId,
    teacherId,
    location,
    timestamp: new Date().toISOString(),
    type: 'attendance',
  });
};