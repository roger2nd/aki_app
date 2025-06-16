import AsyncStorage from '@react-native-async-storage/async-storage';

const CLASSES_KEY = 'teacher_classes';

export default {
    async getClasses(teacherId) {
    const classes = JSON.parse(await AsyncStorage.getItem(CLASSES_KEY)) || [];
    return classes.filter(c => c.teacherId === teacherId);
    },

    async saveClass(classData) {
    const classes = JSON.parse(await AsyncStorage.getItem(CLASSES_KEY)) || [];
    console.log('Class Retrivrd');//debug
    const existingIndex = classes.findIndex(c => c.id === classData.id);

    if (existingIndex >= 0) {
        classes[existingIndex] = classData;
    } else {
        classes.push(classData);
    }

    await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
    console.log('Class setted');//debug
    return classData;
    },

    async addStudentToClass(classId, studentData) {
        try {
            const classes = JSON.parse(await AsyncStorage.getItem(CLASSES_KEY)) || [];
            const classIndex = classes.findIndex(c => c.id === classId);

            if (classIndex >= 0) {
                const updatedClass = {
                ...classes[classIndex],
                students: [
                    ...(classes[classIndex].students || []),
                    studentData
                ]
                };
                
                classes[classIndex] = updatedClass;
                await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
                return updatedClass;
            }

            throw new Error('Turma não encontrada');
        } catch (error) {
            console.error('Error in addStudentToClass:', error);//debug
            throw error; 
        }
    },

    async getStudentsByClass(classId) {
        const classes = JSON.parse(await AsyncStorage.getItem(CLASSES_KEY)) || [];
        const foundClass = classes.find(c => c.id === classId);
        return foundClass?.students || [];
    },

    async getClass(classId) {
        const classes = JSON.parse(await AsyncStorage.getItem(CLASSES_KEY)) || [];
        const foundClass = classes.find(c => c.id === classId);
        if (!foundClass) {
            throw new Error('Turma não encontrada');
        }
        return foundClass;
    },

    async getClassName(classId) {
        const classData = await this.getClass(classId);
        return classData.name;
    }
};