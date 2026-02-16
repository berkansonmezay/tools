import * as XLSX from 'xlsx';

const wb = XLSX.utils.book_new();
const headers = ["AD", "SOYAD", "TELEFON NUMARASI", "NUMARA", "TC NUMARASI", "SINIF", "BÖLÜM"];
const ws = XLSX.utils.aoa_to_sheet([headers]);

// Set column widths
ws['!cols'] = [
    { wch: 15 }, // AD
    { wch: 15 }, // SOYAD
    { wch: 20 }, // TELEFON
    { wch: 15 }, // NUMARA
    { wch: 15 }, // TC
    { wch: 10 }, // SINIF
    { wch: 20 }  // BOLUM
];

XLSX.utils.book_append_sheet(wb, ws, "Öğrenci Listesi");

XLSX.writeFile(wb, "public/sample_students.xlsx");
console.log("Template generated at public/sample_students.xlsx");
