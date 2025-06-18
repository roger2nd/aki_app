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
    type: 'class',
  });
};

export const generateAttendanceQRCodeData = (classId, teacherId, location) => {
  return JSON.stringify({
    classId,
    teacherId,
    location,
    timestamp: new Date().toISOString(),
    type: 'attendance',
    expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  });
};

export const parseQRCodeData = (data) => {
  try {
    const parsed = JSON.parse(data);
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid QR code data');
    }

    if (parsed.version !== 1) {
      throw new Error('Unsupported QR code version');
    }

    if (parsed.type === 'class') {
      if (!parsed.classId || !parsed.teacherId) {
        throw new Error('Invalid class QR code');
      }
    } 
    else if (parsed.type === 'attendance') {
      if (!parsed.classId || !parsed.teacherId || !parsed.location) {
        throw new Error('Invalid attendance QR code');
      }
      
      if (new Date(parsed.expiresAt) < new Date()) {
        throw new Error('QR code expired');
      }
    } 
    else {
      throw new Error('Unknown QR code type');
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing QR code:', error);
    throw new Error('Invalid QR code: ' + error.message);
  }
};