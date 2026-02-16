import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generatePDF(distributionData, rooms) {
    // distributionData: { results: { roomId: [students...] }, overflow: [] }
    // rooms: Array of { id, name, capacity, ... }

    const doc = new jsPDF();

    // Load font for Turkish characters
    // Switching to Noto Sans for better Turkish support (I vs 1 issue)
    try {
        const fontUrl = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
        const response = await fetch(fontUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const arrayBuffer = await response.arrayBuffer();
        const base64String = arrayBufferToBase64(arrayBuffer);

        doc.addFileToVFS('NotoSans-Regular.ttf', base64String);
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
        doc.setFont('NotoSans');
    } catch (e) {
        console.error("Font loading failed, falling back to standard font", e);
    }

    const studentsByType = distributionData.results;
    const overflow = distributionData.overflow || [];

    // Sort rooms by priority
    const sortedRooms = [...rooms].sort((a, b) => (a.priority || 999) - (b.priority || 999));

    let isFirstPage = true;

    sortedRooms.forEach((room) => {
        const students = studentsByType[room.id] || [];
        if (students.length === 0) return;

        if (!isFirstPage) {
            doc.addPage();
        } else {
            isFirstPage = false;
        }

        doc.setFontSize(16);
        doc.text(`Salon: ${room.name}`, 14, 20);
        doc.setFontSize(10);
        doc.text(`Kapasite: ${students.length} / ${room.capacity}`, 14, 28);

        const tableData = students.map((s, i) => [
            i + 1,
            s.id,
            s.tc,
            s.name,
            s.classRef,
            s.department,
            s.phone
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['SIRA', 'NO', 'TC', 'AD SOYAD', 'SINIF', 'BÖLÜM', 'TEL']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                font: 'NotoSans' // Explicitly set font for header
            },
            styles: { font: 'NotoSans', fontSize: 9, cellPadding: 2 }, // Apply NotoSans
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 20 },
                2: { cellWidth: 25 },
                6: { cellWidth: 25 }
            }
        });
    });

    // Overflow page
    if (overflow.length > 0) {
        if (!isFirstPage) doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(220, 38, 38);
        doc.text("Açıkta Kalanlar Listesi", 14, 20);
        doc.setTextColor(0, 0, 0);

        const tableData = overflow.map((s, i) => [
            i + 1, s.id, s.tc, s.name, s.classRef, s.department, s.phone
        ]);

        autoTable(doc, {
            startY: 30,
            head: [['SIRA', 'NO', 'TC', 'AD SOYAD', 'SINIF', 'BÖLÜM', 'TEL']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [220, 38, 38],
                font: 'NotoSans'
            },
            styles: { font: 'NotoSans', fontSize: 9 }
        });
    }

    doc.save("sinav_dagitim_raporu.pdf");
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
