import * as XLSX from 'xlsx';

export function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Header: 1 returns array of arrays
                resolve(jsonData);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}

export function exportToExcel(data, rooms, fileName = 'sinav_dagitim_sonuclari.xlsx') {
    // data: { results: { roomId: [students...] }, overflow: [] }
    const wb = XLSX.utils.book_new();

    // 1. Overview Sheet
    const overviewData = [];
    rooms.forEach(room => {
        const students = data.results[room.id] || [];
        students.forEach((s, i) => {
            overviewData.push({
                'Salon Adı': room.name,
                'Sıra No': i + 1,
                'Öğrenci No': s.id,
                'TC No': s.tc,
                'Ad Soyad': s.name,
                'Sınıf': s.classRef,
                'Bölüm': s.department,
                'Telefon': s.phone
            });
        });
    });

    // Overflow
    if (data.overflow && data.overflow.length > 0) {
        data.overflow.forEach(s => {
            overviewData.push({
                'Salon Adı': 'YERLEŞEMEDİ',
                'Sıra No': '-',
                'Öğrenci No': s.id,
                'TC No': s.tc,
                'Ad Soyad': s.name,
                'Sınıf': s.classRef,
                'Bölüm': s.department,
                'Telefon': s.phone
            });
        });
    }

    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Genel Liste");

    // 2. Per Room Sheets
    rooms.forEach(room => {
        const students = data.results[room.id] || [];
        if (students.length > 0) {
            const roomData = students.map((s, i) => ({
                'Sıra No': i + 1,
                'Öğrenci No': s.id,
                'TC No': s.tc,
                'Ad Soyad': s.name,
                'Sınıf': s.classRef,
                'Bölüm': s.department,
                'Telefon': s.phone
            }));
            const wsRoom = XLSX.utils.json_to_sheet(roomData);

            // Sanitize sheet name: remove invalid chars \ / ? * [ ] :
            let sheetName = room.name.replace(/[\\/?*[\]:]/g, " ").trim();

            // Max 31 chars
            if (sheetName.length > 31) {
                sheetName = sheetName.substring(0, 31);
            }
            // Fallback if empty
            if (!sheetName) {
                sheetName = `Salon ${room.id}`;
            }

            // Ensure unique
            let uniqueName = sheetName;
            let counter = 1;
            while (wb.SheetNames.includes(uniqueName)) {
                uniqueName = `${sheetName.substring(0, 28)}(${counter})`;
                counter++;
            }

            XLSX.utils.book_append_sheet(wb, wsRoom, uniqueName);
        }
    });

    XLSX.writeFile(wb, fileName);
}

export function exportRoomsToExcel(rooms, fileName = 'salon_listesi.xlsx') {
    // rooms: Array of { name, capacity, priority, ... }
    const wb = XLSX.utils.book_new();

    // Sort by priority before export to be safe
    const sortedRooms = [...rooms].sort((a, b) => (a.priority || 999) - (b.priority || 999));

    const exportData = sortedRooms.map(r => ({
        'Salon Adı': r.name,
        'Kapasite': r.capacity,
        'Öncelik': r.priority === 999 ? '' : r.priority
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Adjust column widths roughly
    const wscols = [
        { wch: 20 }, // Salon Adı
        { wch: 10 }, // Kapasite
        { wch: 10 }  // Öncelik
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Salonlar");
    XLSX.writeFile(wb, fileName);
}

export function exportOverflowToExcel(overflowData, fileName = 'acikta_kalanlar.xlsx') {
    const wb = XLSX.utils.book_new();

    const exportData = overflowData.map(s => ({
        'Öğrenci No': s.id,
        'TC No': s.tc,
        'Ad Soyad': s.name,
        'Sınıf': s.classRef,
        'Bölüm': s.department,
        'Telefon': s.phone
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto width
    const wscols = [
        { wch: 15 },
        { wch: 20 },
        { wch: 30 },
        { wch: 10 },
        { wch: 20 },
        { wch: 15 }
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Açıkta Kalanlar");
    XLSX.writeFile(wb, fileName);
}
