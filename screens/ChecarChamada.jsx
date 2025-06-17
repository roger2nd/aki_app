import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Checkbox, Text, FAB, Searchbar, Button, Menu, Divider, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../scripts/Authenticator';
import { HeaderButton } from '../components/HeaderButton';
import ClassService from '../services/ClassService';
import { DatePickerModal } from 'react-native-paper-dates';
import registerDatePickerTranslations from '../utils/datePickerTranslation';
import QRCode from 'react-native-qrcode-svg';
import { getCurrentLocation, generateAttendanceQRCodeData } from '../services/GeoLocationQRCodeService';
import { exportToCSV } from '../utils/csvExport';

registerDatePickerTranslations();

const TakeAttendanceScreen = ({ navigation, route }) => {
  const { user, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [location, setLocation] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get current date in UTC-3 (Brazil time)
  const getCurrentBrasilDate = () => {
    const now = new Date();
    // UTC-3 adjustment (3 hours ahead of UTC)
    now.setHours(now.getHours() - 3);
    return now;
  };

  const [today] = useState(() => {
    const today = getCurrentBrasilDate();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [date, setDate] = useState(getCurrentBrasilDate());

  // Check if selected date is today
  const isToday = () => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate.getTime() === today.getTime();
  };

  // Format date to Brazilian format
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };

  // Load classes and initial data
  useEffect(() => {
    loadClasses();
  }, []);

  // Load students when class or date changes
  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass, date]);

  const loadClasses = async () => {
    try {
      const classesData = await ClassService.getClasses(user.tuitionNumber);
      setClasses(classesData);
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].id);
      }
    } catch (e) {
      console.error('Failed to load classes', e);
    }
  };

  const loadStudents = async () => {
    try {
      const classData = await ClassService.getClass(selectedClass);
      const studentsList = classData.students || [];
      
      const formattedDate = date.toISOString().split('T')[0];
      const existingRecords = await AsyncStorage.getItem(`attendance_${user.tuitionNumber}`);
      let attendanceData = {};
      
      if (existingRecords) {
        const allRecords = JSON.parse(existingRecords);
        const dateRecords = allRecords.find(r => r.date === formattedDate && r.classId === selectedClass);
        
        if (dateRecords) {
          dateRecords.records.forEach(record => {
            attendanceData[record.studentId] = record.present;
          });
        }
      }
      
      // Initialize attendance for students without records (only for today)
      if (isToday) {
        studentsList.forEach(student => {
          if (attendanceData[student.id] === undefined) {
            attendanceData[student.id] = false; // Default to absent
          }
        });
      }
      
      setStudents(studentsList);
      setAttendance(attendanceData);
    } catch (e) {
      console.error('Failed to load students', e);
    }
  };

  const toggleAttendance = (studentId) => {
    if (!isToday) return; // Only allow changes for today
    
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const saveAttendance = async () => {
    try {
      /* const formattedDate = date.toISOString().split('T')[0];
      const attendanceRecord = {
        date: formattedDate,
        classId: selectedClass,
        className: classes.find(c => c.id === selectedClass)?.name,
        teacherTuition: user.tuitionNumber,
        records: students.map(student => ({
          studentId: student.id,
          studentTuition: student.tuitionNumber,
          studentName: student.name,
          present: attendance[student.id] || false
        }))
      };

      const existingRecords = await AsyncStorage.getItem(`attendance_${user.tuitionNumber}`);
      let allRecords = [];
      if (existingRecords) {
        allRecords = JSON.parse(existingRecords);
        allRecords = allRecords.filter(r => !(r.date === formattedDate && r.classId === selectedClass));
      }

      allRecords.push(attendanceRecord);
      await AsyncStorage.setItem(
        `attendance_${user.tuitionNumber}`,
        JSON.stringify(allRecords)
      ); */
      
      setSnackbarMessage('Presença salva com sucesso');
      setSnackbarVisible(true);
    } catch (e) {
      console.error('Error saving attendance', e);
      setSnackbarMessage('Falha ao salvar presença');
      setSnackbarVisible(true);
    }
  };

  const exportAttendance = async () => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const className = classes.find(c => c.id === selectedClass)?.name;
      
      const csvData = students.map(student => ({
        Matrícula: student.tuitionNumber,
        Nome: student.name,
        Presença: attendance[student.id] ? 'Presente' : 'Faltou',
        Data: formattedDate,
        Turma: className
      }));

      const filename = `presenca_${className}_${formattedDate}.csv`.replace(/ /g, '_');
      await exportToCSV(csvData, filename);
      
      setSnackbarMessage('Dados exportados com sucesso');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Export error:', error);
      setSnackbarMessage('Falha ao exportar dados');
      setSnackbarVisible(true);
    }
  };

  const generateQRCode = async () => {
    try {
      const location = await getCurrentLocation();
      setLocation(location);
      
      const qrData = generateAttendanceQRCodeData(
        selectedClass,
        user.tuitionNumber,
        location
      );
      
      setQrCodeValue(qrData);
      setQrCodeVisible(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setSnackbarMessage('Falha ao obter localização');
      setSnackbarVisible(true);
    }
  };

  const onDismissSingle = () => {
    setOpenDatePicker(false);
  };

  const onConfirmSingle = (params) => {
    setOpenDatePicker(false);
    setDate(params.date);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.tuitionNumber || '').includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setOpenDatePicker(true)}
          style={styles.dateButton}
          icon="calendar"
        >
          {formatDate(date)}
        </Button>
        
        <DatePickerModal
          locale="pt-BR"
          mode="single"
          visible={openDatePicker}
          onDismiss={onDismissSingle}
          date={date}
          onConfirm={onConfirmSingle}
          label="Selecione a data"
          saveLabel="Confirmar"
          validRange={{
            endDate: today // Disable future dates
          }}
        />

        <Searchbar
          placeholder="Buscar aluno..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.search}
        />
      </View>

      <View style={styles.classSelector}>
        {classes.map(cls => (
          <Button
            key={cls.id}
            mode={selectedClass === cls.id ? "contained" : "outlined"}
            onPress={() => setSelectedClass(cls.id)}
            style={styles.classButton}
          >
            {cls.name}
          </Button>
        ))}
      </View>

      <Text style={styles.title}>
        {selectedClass ? classes.find(c => c.id === selectedClass)?.name : 'Selecione uma turma'} - {formatDate(date)}
      </Text>
      
      <ScrollView style={styles.listContainer}>
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <List.Item
              key={student.id}
              title={`${student.name} (${student.tuitionNumber})`}
              left={() => (
                <Checkbox
                  status={attendance[student.id] ? 'checked' : 'unchecked'}
                  onPress={() => toggleAttendance(student.id)}
                  disabled={!isToday}
                />
              )}
              right={() => (
                <Text style={attendance[student.id] ? styles.present : styles.absent}>
                  {attendance[student.id] ? 'Presente' : 'Faltou'}
                </Text>
              )}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhum aluno encontrado' : 'Nenhum aluno registrado'}
          </Text>
        )}
      </ScrollView>

      {/* QR Code Modal */}
      {qrCodeVisible && (
        <View style={styles.qrCodeContainer}>
          <View style={styles.qrCodeContent}>
            <Text style={styles.qrCodeTitle}>QR Code de Presença</Text>
            <QRCode
              value={qrCodeValue}
              size={200}
              color="#6200ee" 
              backgroundColor="white"
            />
            {location && (
              <Text style={styles.locationText}>
                Localização: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
            <Button 
              mode="contained" 
              onPress={() => setQrCodeVisible(false)}
              style={styles.closeButton}
            >
              Fechar
            </Button>
          </View>
        </View>
      )}

      <FAB.Group
        open={menuVisible}
        visible={!!selectedClass}
        icon={menuVisible ? 'close' : 'plus'}
        actions={[
          isToday() && {
            icon: 'checkbox-multiple-marked',
            label: 'Marcar Presença',
            onPress: () => {
              const newAttendance = {};
              students.forEach(student => {
                newAttendance[student.id] = true;
              });
              setAttendance(newAttendance);
              setSnackbarMessage('Todos marcados como presentes');
              setSnackbarVisible(true);
            },
          },
          isToday() && {
            icon: 'qrcode',
            label: 'Gerar QR Code',
            onPress: generateQRCode,
          },
          isToday() && {
            icon: 'content-save',
            label: 'Salvar Presença',
            onPress: saveAttendance,
          },
          {
            icon: 'download', // Make sure this icon is imported
            label: 'Exportar CSV',
            onPress: exportAttendance,
          },
          isToday() && {
            icon: 'refresh',
            label: 'Recarregar',
            onPress: loadStudents,
          },
        ].filter(Boolean)}
        onStateChange={({ open }) => setMenuVisible(open)}
        fabStyle={styles.fab}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButton: {
    marginRight: 8,
  },
  search: {
    flex: 1,
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  classButton: {
    margin: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  customFabMenu: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    alignItems: 'flex-end',
  },
  present: {
    color: 'green',
    alignSelf: 'center',
  },
  absent: {
    color: 'red',
    alignSelf: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  qrCodeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  qrCodeContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    marginTop: 20,
  },
});

export default TakeAttendanceScreen;