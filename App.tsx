import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';
import { Student, AttendanceStatus, AttendanceRecord } from './types';
import { initialStudents, INITIAL_DTA_LIST } from './constants';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        try {
            return localStorage.getItem('isLoggedIn') === 'true';
        } catch (e) {
            console.error("Could not access localStorage", e);
            return false;
        }
    });
    
    const [students, setStudents] = useState<Student[]>(() => {
        try {
            const savedStudents = localStorage.getItem('students');
            return savedStudents ? JSON.parse(savedStudents) : initialStudents;
        } catch (error) {
            console.error("Could not parse students from localStorage", error);
            return initialStudents;
        }
    });

    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>(() => {
        try {
            const savedHistory = localStorage.getItem('attendanceHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (error) {
            console.error("Could not parse attendance history from localStorage", error);
            return [];
        }
    });

    const [dtaList, setDtaList] = useState<string[]>(() => {
        try {
            const savedDtaList = localStorage.getItem('dtaList');
            return savedDtaList ? JSON.parse(savedDtaList) : INITIAL_DTA_LIST;
        } catch (error) {
            console.error("Could not parse DTA list from localStorage", error);
            return INITIAL_DTA_LIST;
        }
    });


    useEffect(() => {
        try {
            localStorage.setItem('isLoggedIn', String(isLoggedIn));
        } catch (e) {
             console.error("Could not access localStorage", e);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        try {
            localStorage.setItem('students', JSON.stringify(students));
        } catch (error) {
            console.error("Could not save students to localStorage", error);
        }
    }, [students]);

    useEffect(() => {
        try {
            localStorage.setItem('attendanceHistory', JSON.stringify(attendanceHistory));
        } catch (error) {
            console.error("Could not save attendance history to localStorage", error);
        }
    }, [attendanceHistory]);

    useEffect(() => {
        try {
            localStorage.setItem('dtaList', JSON.stringify(dtaList));
        } catch (error) {
            console.error("Could not save DTA list to localStorage", error);
        }
    }, [dtaList]);

    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => setIsLoggedIn(false);

    const addDta = useCallback((newDta: string) => {
        if (newDta && !dtaList.includes(newDta)) {
            setDtaList(prev => [...prev, newDta]);
        }
    }, [dtaList]);

    const addStudent = useCallback((newStudentData: Omit<Student, 'id' | 'status'>) => {
        setStudents(prev => {
            const newStudent: Student = {
                ...newStudentData,
                id: prev.length > 0 ? Math.max(...prev.map(s => s.id)) + 1 : 1,
                status: AttendanceStatus.BelumDiabsen
            };
            return [...prev, newStudent];
        });
    }, []);
    
    const importStudents = useCallback((importedStudents: Omit<Student, 'id' | 'status'>[]) => {
        setStudents(prev => {
            let maxId = prev.length > 0 ? Math.max(...prev.map(s => s.id)) : 0;
            
            const existingNis = new Set(prev.map(s => s.nis));
            const existingNisn = new Set(prev.map(s => s.nisn));

            const uniqueNewStudents = importedStudents
                .filter(s => !existingNis.has(String(s.nis)) && !existingNisn.has(String(s.nisn)))
                .map(s => ({
                    ...s,
                    id: ++maxId,
                    status: AttendanceStatus.BelumDiabsen,
                }));
            
            // Add any new DTAs from the imported file
            const newDtas = new Set(uniqueNewStudents.map(s => s.dta));
            setDtaList(currentDtaList => {
                const combined = new Set([...currentDtaList, ...newDtas]);
                return Array.from(combined);
            });

            return [...prev, ...uniqueNewStudents];
        });
    }, []);

    const updateStudent = useCallback((updatedStudent: Student) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    }, []);

    const deleteStudent = useCallback((studentId: number) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setAttendanceHistory(prev => prev.filter(r => r.studentId !== studentId));
    }, [setStudents, setAttendanceHistory]);


    if (!isLoggedIn) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <MainLayout
            students={students}
            setStudents={setStudents}
            attendanceHistory={attendanceHistory}
            setAttendanceHistory={setAttendanceHistory}
            onLogout={handleLogout}
            addStudent={addStudent}
            importStudents={importStudents}
            dtaList={dtaList}
            addDta={addDta}
            updateStudent={updateStudent}
            deleteStudent={deleteStudent}
        />
    );
};

export default App;