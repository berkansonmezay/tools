import * as XLSX from 'xlsx';

const wb = XLSX.utils.book_new();
const headers = ["Salon Adı", "Kapasite", "Öncelik"];
const data = [
    ["A Salonu", 20, 1],
    ["B Salonu", 15, 2],
    ["101 Nolu Sınıf", 30, 3]
];
const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

// Set column widths
ws['!cols'] = [
    { wch: 20 }, // Salon Adı
    { wch: 10 }, // Kapasite
    { wch: 10 }  // Öncelik
];

XLSX.utils.book_append_sheet(wb, ws, "Salon Listesi");

XLSX.writeFile(wb, "public/sample_rooms.xlsx");
console.log("Template generated at public/sample_rooms.xlsx");
