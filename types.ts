export enum AttendanceStatus {
  Hadir = 'Hadir',
  Izin = 'Izin',
  Sakit = 'Sakit',
  Alfa = 'Alfa',
  BelumDiabsen = 'Belum Diabsen'
}

export interface Student {
  id: number;
  nis: string;
  nisn: string;
  name: string;
  className: string; // To store NAMA KELAS
  dta: string;       // To store NAMA DTA, formerly 'kelas'
  status: AttendanceStatus;
}

export interface AttendanceRecord {
  studentId: number;
  date: string; // YYYY-MM-DD format
  status: AttendanceStatus;
}

export type AttendanceSummaryData = {
    [key in AttendanceStatus]?: number;
};