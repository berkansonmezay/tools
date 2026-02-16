// ========================================
// Global Variables
// ========================================

let scheduleData = {
    teachers: [],
    classes: [],
    days: [],
    timeSlots: [],
    schedule: {}
};

let currentView = 'teacher';
let currentDayFilter = 'all';
let currentTeacherFilter = 'all';
let currentClassFilter = 'all';

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
    setupFileInput();
    setupDropdownClose();
});

// ========================================
// File Upload Handlers
// ========================================

function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        });
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Click on upload area (but not on the button) triggers file input
    uploadArea.addEventListener('click', (e) => {
        // Only trigger if not clicking on the label/button
        if (!e.target.closest('.btn-upload') && !e.target.closest('input')) {
            document.getElementById('fileInput').click();
        }
    });
}

function setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
}

function setupDropdownClose() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.export-dropdown')) {
            document.getElementById('exportMenu')?.classList.remove('show');
        }
    });
}

function handleFile(file) {
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
        alert('Lütfen geçerli bir Excel dosyası seçin (.xlsx veya .xls)');
        return;
    }

    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('fileName').textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            parseExcelFile(e.target.result);
        } catch (error) {
            alert('Dosya okunurken bir hata oluştu: ' + error.message);
            console.error(error);
        }
    };
    reader.readAsArrayBuffer(file);
}

function clearFile() {
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('viewSection').style.display = 'none';
    scheduleData = { teachers: [], classes: [], days: [], timeSlots: [], schedule: {} };
}

// ========================================
// Excel Parsing
// ========================================

function parseExcelFile(data) {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (rows.length < 3) {
        alert('Excel dosyası yeterli veri içermiyor.');
        return;
    }

    parseScheduleStructure(rows);
    parseScheduleStructure(rows);
    updateFilters();
    updateDateRangeDisplay();
    displaySchedule();

    document.getElementById('viewSection').style.display = 'block';
    document.getElementById('viewSection').scrollIntoView({ behavior: 'smooth' });
}

function updateDateRangeDisplay() {
    const dateRangeElement = document.getElementById('dateRangeDisplay');
    if (dateRangeElement && scheduleData.dateRange) {
        dateRangeElement.textContent = scheduleData.dateRange;
        dateRangeElement.style.display = 'block';
    } else if (dateRangeElement) {
        dateRangeElement.style.display = 'none';
    }
}

function parseScheduleStructure(rows) {
    scheduleData = { teachers: [], classes: new Set(), days: [], timeSlots: [], schedule: {}, dateRange: '' };

    // Try to find date range in the first few rows
    for (let i = 0; i < 5; i++) {
        if (rows[i]) {
            const rowStr = rows[i].join(' ');
            const dateMatch = rowStr.match(/(\d{2}\.\d{2}\.\d{4})\s*-\s*(\d{2}\.\d{2}\.\d{4})/);
            if (dateMatch) {
                scheduleData.dateRange = dateMatch[0]; // e.g., "16.11.2025 - 20.11.2025"
                break;
            }
        }
    }



    const dayRow = rows[0] || [];
    const timeRow = rows[1] || [];

    let dataStartCol = 1;
    let currentDay = '';
    let dayIndex = -1;
    let skipDay = false;
    const daySlotMapping = {};

    for (let col = dataStartCol; col < Math.max(dayRow.length, timeRow.length); col++) {
        const dayCell = dayRow[col] ? String(dayRow[col]).trim() : '';
        const timeCell = timeRow[col] ? String(timeRow[col]).trim() : '';

        if (dayCell && dayCell !== currentDay) {
            currentDay = dayCell;

            skipDay = false;
            dayIndex++;
            scheduleData.days.push(dayCell);
        }

        if (timeCell && timeCell.includes('-')) {
            let slotIndex = scheduleData.timeSlots.indexOf(timeCell);
            if (slotIndex === -1) {
                const existingIndex = scheduleData.timeSlots.findIndex(s => s === timeCell);
                if (existingIndex === -1) {
                    slotIndex = scheduleData.timeSlots.length;
                    scheduleData.timeSlots.push(timeCell);
                } else {
                    slotIndex = existingIndex;
                }
            }

            if (!skipDay && dayIndex >= 0) {
                daySlotMapping[col] = { dayIndex, slotIndex: slotIndex % (scheduleData.timeSlots.length || 1) };
            }
        }
    }

    if (scheduleData.days.length === 0) {
        for (let col = dataStartCol; col < dayRow.length; col++) {
            const cell = dayRow[col] ? String(dayRow[col]).trim() : '';
            if (cell && (cell.includes('Pazartesi') || cell.includes('Salı') || cell.includes('Çarşamba') ||
                cell.includes('Perşembe') || cell.includes('Cuma') || cell.includes('Cumartesi') || cell.includes('Pazar') || cell.match(/\d{2}\.\d{2}\.\d{4}/))) {
                if (!scheduleData.days.includes(cell)) {
                    scheduleData.days.push(cell);
                }
            }
        }
    }

    const slotsPerDay = Object.keys(daySlotMapping).length / (scheduleData.days.length || 1);
    const columns = Object.keys(daySlotMapping).map(Number).sort((a, b) => a - b);
    let currentDayIdx = 0;
    let slotCounter = 0;

    for (const col of columns) {
        if (slotCounter > 0 && slotCounter % slotsPerDay === 0) {
            currentDayIdx++;
        }
        daySlotMapping[col] = { dayIndex: currentDayIdx, slotIndex: slotCounter % slotsPerDay };
        slotCounter++;
    }

    const uniqueTimeSlots = [...new Set(scheduleData.timeSlots)];
    scheduleData.timeSlots = uniqueTimeSlots;

    for (let row = 2; row < rows.length; row++) {
        const rowData = rows[row];
        if (!rowData || rowData.length === 0) continue;

        const teacherName = rowData[0] ? String(rowData[0]).trim() : '';
        if (!teacherName) continue;

        scheduleData.teachers.push(teacherName);
        scheduleData.schedule[teacherName] = {};

        scheduleData.days.forEach((day, dIdx) => {
            scheduleData.schedule[teacherName][dIdx] = {};
        });

        for (let col = dataStartCol; col < rowData.length; col++) {
            const className = rowData[col] ? String(rowData[col]).trim() : '';
            if (!className) continue;

            const mapping = daySlotMapping[col];
            if (mapping) {
                scheduleData.schedule[teacherName][mapping.dayIndex][mapping.slotIndex] = className;
                scheduleData.classes.add(className);
            }
        }
    }

    scheduleData.classes = [...scheduleData.classes].sort((a, b) => {
        const aMatch = a.match(/(\d+)-?([A-Z])?/i);
        const bMatch = b.match(/(\d+)-?([A-Z])?/i);
        if (aMatch && bMatch) {
            const aNum = parseInt(aMatch[1]);
            const bNum = parseInt(bMatch[1]);
            if (aNum !== bNum) return aNum - bNum;
            return (aMatch[2] || '').localeCompare(bMatch[2] || '');
        }
        return a.localeCompare(b);
    });

    // Fallback Date Range Calculation
    if (!scheduleData.dateRange && scheduleData.days.length > 0) {
        const dates = [];
        const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;

        scheduleData.days.forEach(day => {
            const match = day.match(dateRegex);
            if (match) {
                // Convert to YYYY-MM-DD for sorting
                dates.push({
                    original: match[0],
                    sortable: `${match[3]}-${match[2]}-${match[1]}`
                });
            }
        });

        if (dates.length > 0) {
            dates.sort((a, b) => a.sortable.localeCompare(b.sortable));
            if (dates.length > 1) {
                scheduleData.dateRange = `${dates[0].original} - ${dates[dates.length - 1].original}`;
            } else {
                scheduleData.dateRange = dates[0].original;
            }
        }
    }

    console.log('Parsed Schedule Data:', scheduleData);
}

// ========================================
// Filter Management
// ========================================

function updateFilters() {
    const dayFilter = document.getElementById('dayFilter');
    dayFilter.innerHTML = '<option value="all">Tüm Günler</option>';
    scheduleData.days.forEach((day, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = day;
        dayFilter.appendChild(option);
    });

    const teacherFilter = document.getElementById('teacherFilter');
    teacherFilter.innerHTML = '<option value="all">Tüm Öğretmenler</option>';
    scheduleData.teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher;
        option.textContent = teacher;
        teacherFilter.appendChild(option);
    });

    const classFilter = document.getElementById('classFilter');
    classFilter.innerHTML = '<option value="all">Tüm Sınıflar</option>';
    scheduleData.classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classFilter.appendChild(option);
    });
}

function applyFilters() {
    currentDayFilter = document.getElementById('dayFilter').value;
    currentTeacherFilter = document.getElementById('teacherFilter').value;
    currentClassFilter = document.getElementById('classFilter').value;
    displaySchedule();
}

// ========================================
// View Switching
// ========================================

function switchView(view) {
    currentView = view;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });

    if (view === 'teacher') {
        document.getElementById('teacherFilterGroup').style.display = 'flex';
        document.getElementById('classFilterGroup').style.display = 'none';
    } else {
        document.getElementById('teacherFilterGroup').style.display = 'none';
        document.getElementById('classFilterGroup').style.display = 'flex';
    }

    displaySchedule();
}

// ========================================
// Display Schedule
// ========================================

function displaySchedule() {
    const container = document.getElementById('scheduleContainer');

    if (currentView === 'teacher') {
        displayTeacherView(container);
    } else {
        displayClassView(container);
    }
}

function displayTeacherView(container) {
    let html = generateStats();

    let teachersToShow = scheduleData.teachers;
    if (currentTeacherFilter !== 'all') {
        teachersToShow = teachersToShow.filter(t => t === currentTeacherFilter);
    }

    let daysToShow = scheduleData.days.map((day, idx) => ({ day, idx }));
    if (currentDayFilter !== 'all') {
        const dayIdx = parseInt(currentDayFilter);
        daysToShow = daysToShow.filter(d => d.idx === dayIdx);
    }

    teachersToShow.forEach(teacher => {
        html += `
            <div class="schedule-wrapper">
                <h4>👨‍🏫 ${teacher}</h4>
                ${scheduleData.dateRange ? `<div class="schedule-date-range">📅 ${scheduleData.dateRange}</div>` : ''}
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th class="empty-corner-header"></th>
                            ${scheduleData.timeSlots.map((_, idx) => `<th class="lesson-header">${idx + 1}. Ders</th>`).join('')}
                        </tr>
                        <tr>
                            <th>Gün</th>
                            ${scheduleData.timeSlots.map(slot => `<th class="time-header">${slot}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${daysToShow.map(({ day, idx }) => `
                            <tr>
                                <td>${formatDayName(day)}</td>
                                ${scheduleData.timeSlots.map((slot, slotIdx) => {
            const className = scheduleData.schedule[teacher]?.[idx]?.[slotIdx] || '';
            return `<td class="lesson-cell">${className ? `<span class="lesson-item" style="background: ${getClassColorStyle(className)}">${className}</span>` : '<span class="empty-cell">-</span>'}</td>`;
        }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayClassView(container) {
    let html = generateStats();

    const classSchedule = buildClassSchedule();

    let classesToShow = scheduleData.classes;
    if (currentClassFilter !== 'all') {
        classesToShow = classesToShow.filter(c => c === currentClassFilter);
    }

    let daysToShow = scheduleData.days.map((day, idx) => ({ day, idx }));
    if (currentDayFilter !== 'all') {
        const dayIdx = parseInt(currentDayFilter);
        daysToShow = daysToShow.filter(d => d.idx === dayIdx);
    }

    classesToShow.forEach(cls => {
        html += `
            <div class="schedule-wrapper">
                <h4>🏫 ${cls} Sınıfı</h4>
                ${scheduleData.dateRange ? `<div class="schedule-date-range">📅 ${scheduleData.dateRange}</div>` : ''}
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th class="empty-corner-header"></th>
                            ${scheduleData.timeSlots.map((_, idx) => `<th class="lesson-header">${idx + 1}. Ders</th>`).join('')}
                        </tr>
                        <tr>
                            <th>Gün</th>
                            ${scheduleData.timeSlots.map(slot => `<th class="time-header">${slot}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${daysToShow.map(({ day, idx }) => `
                            <tr>
                                <td>${formatDayName(day)}</td>
                                ${scheduleData.timeSlots.map((slot, slotIdx) => {
            const teacher = classSchedule[cls]?.[idx]?.[slotIdx];
            return `<td class="lesson-cell">${teacher ? `<span class="lesson-item">${teacher}</span>` : '<span class="empty-cell">-</span>'}</td>`;
        }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });

    container.innerHTML = html;
}

function generateStats() {
    const totalLessons = Object.values(scheduleData.schedule).reduce((total, days) => {
        return total + Object.values(days).reduce((dayTotal, slots) => {
            return dayTotal + Object.values(slots).filter(s => s).length;
        }, 0);
    }, 0);

    return `
        <div class="stats-bar">
            <div class="stat-item"><span class="stat-icon">👨‍🏫</span><div class="stat-info"><span class="stat-value">${scheduleData.teachers.length}</span><span class="stat-label">Öğretmen</span></div></div>
            <div class="stat-item"><span class="stat-icon">🏫</span><div class="stat-info"><span class="stat-value">${scheduleData.classes.length}</span><span class="stat-label">Sınıf</span></div></div>
            <div class="stat-item"><span class="stat-icon">📅</span><div class="stat-info"><span class="stat-value">${scheduleData.days.length}</span><span class="stat-label">Gün</span></div></div>
            <div class="stat-item"><span class="stat-icon">📚</span><div class="stat-info"><span class="stat-value">${totalLessons}</span><span class="stat-label">Toplam Ders</span></div></div>
        </div>
    `;
}

function buildClassSchedule() {
    const classSchedule = {};
    scheduleData.classes.forEach(cls => {
        classSchedule[cls] = {};
        scheduleData.days.forEach((day, dayIdx) => {
            classSchedule[cls][dayIdx] = {};
        });
    });

    scheduleData.teachers.forEach(teacher => {
        scheduleData.days.forEach((day, dayIdx) => {
            scheduleData.timeSlots.forEach((slot, slotIdx) => {
                const cls = scheduleData.schedule[teacher]?.[dayIdx]?.[slotIdx];
                if (cls && classSchedule[cls]) {
                    classSchedule[cls][dayIdx][slotIdx] = teacher;
                }
            });
        });
    });

    return classSchedule;
}

// ========================================
// Helper Functions
// ========================================

function formatDayName(day) {
    if (day.includes('Pazartesi')) return '📅 Pazartesi';
    if (day.includes('Salı')) return '📅 Salı';
    if (day.includes('Çarşamba')) return '📅 Çarşamba';
    if (day.includes('Perşembe')) return '📅 Perşembe';
    if (day.includes('Cumartesi')) return '📅 Cumartesi';
    if (day.includes('Cuma')) return '📅 Cuma';
    if (day.includes('Pazar')) return '📅 Pazar';
    return '📅 ' + day;
}

function formatDayNameClean(day) {
    if (day.includes('Pazartesi')) return 'Pazartesi';
    if (day.includes('Salı')) return 'Salı';
    if (day.includes('Çarşamba')) return 'Çarşamba';
    if (day.includes('Perşembe')) return 'Perşembe';
    if (day.includes('Cumartesi')) return 'Cumartesi';
    if (day.includes('Cuma')) return 'Cuma';
    if (day.includes('Pazar')) return 'Pazar';
    return day;
}

// Color palette for classes
const classColors = [
    { bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },  // Purple
    { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },  // Orange
    { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },  // Green
    { bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },  // Pink
    { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },  // Violet
    { bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },  // Cyan
    { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },  // Red
    { bg: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)' },  // Lime
    { bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },  // Orange-Red
    { bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' },  // Teal
    { bg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' },  // Purple-Light
    { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },  // Blue
    { bg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' },  // Rose
    { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },  // Green-Light
    { bg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' },  // Yellow
];

const classColorMap = {};

function getClassColor(className) {
    if (!className) return '';

    // If already assigned, return the same color
    if (classColorMap[className]) {
        return classColorMap[className];
    }

    // Assign new color based on current count
    const colorIndex = Object.keys(classColorMap).length % classColors.length;
    classColorMap[className] = `class-color-${colorIndex}`;

    return classColorMap[className];
}

function getClassColorStyle(className) {
    if (!className) return '';

    if (!classColorMap[className]) {
        getClassColor(className);
    }

    const colorIndex = parseInt(classColorMap[className].replace('class-color-', ''));
    return classColors[colorIndex].bg;
}

// ========================================
// Dropdown Menu
// ========================================

function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.classList.toggle('show');
}

// ========================================
// PDF Export Functions
// ========================================

// Normalize Turkish characters for PDF (jsPDF doesn't support Turkish by default)
function normalizeTurkish(text) {
    if (!text) return text;
    const map = {
        'ğ': 'g', 'Ğ': 'G',
        'ü': 'u', 'Ü': 'U',
        'ş': 's', 'Ş': 'S',
        'ı': 'i', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ç': 'c', 'Ç': 'C'
    };
    return text.replace(/[ğĞüÜşŞıİöÖçÇ]/g, char => map[char] || char);
}

function exportAllToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');

    let isFirst = true;

    // Export teachers
    scheduleData.teachers.forEach(teacher => {
        if (!isFirst) doc.addPage();
        isFirst = false;
        addTeacherPageToPDF(doc, teacher);
    });

    // Export classes
    const classSchedule = buildClassSchedule();
    scheduleData.classes.forEach(cls => {
        doc.addPage();
        addClassPageToPDF(doc, cls, classSchedule);
    });

    doc.save('ders_programi_tumu.pdf');
    toggleExportMenu();
}

function exportTeachersToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');

    let isFirst = true;
    scheduleData.teachers.forEach(teacher => {
        if (!isFirst) doc.addPage();
        isFirst = false;
        addTeacherPageToPDF(doc, teacher);
    });

    doc.save('ders_programi_ogretmenler.pdf');
    toggleExportMenu();
}

function exportClassesToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');

    const classSchedule = buildClassSchedule();
    let isFirst = true;

    scheduleData.classes.forEach(cls => {
        if (!isFirst) doc.addPage();
        isFirst = false;
        addClassPageToPDF(doc, cls, classSchedule);
    });

    doc.save('ders_programi_siniflar.pdf');
    toggleExportMenu();
}

function exportCurrentToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');

    if (currentView === 'teacher') {
        if (currentTeacherFilter === 'all') {
            exportTeachersToPDF();
            return;
        }
        const teacher = currentTeacherFilter;
        if (teacher) {
            addTeacherPageToPDF(doc, teacher);
            doc.save(`ders_programi_${sanitizeFilename(teacher)}.pdf`);
        }
    } else {
        if (currentClassFilter === 'all') {
            exportClassesToPDF();
            return;
        }
        const cls = currentClassFilter;
        if (cls) {
            const classSchedule = buildClassSchedule();
            addClassPageToPDF(doc, cls, classSchedule);
            doc.save(`ders_programi_${sanitizeFilename(cls)}.pdf`);
        }
    }
}

function addTeacherPageToPDF(doc, teacher) {
    // Count lessons for this teacher
    let lessonCount = 0;
    scheduleData.days.forEach((day, dayIdx) => {
        scheduleData.timeSlots.forEach((slot, slotIdx) => {
            if (scheduleData.schedule[teacher]?.[dayIdx]?.[slotIdx]) {
                lessonCount++;
            }
        });
    });

    doc.setFontSize(18);
    doc.text(normalizeTurkish(`Ogretmen: ${teacher}`), 14, 15);
    doc.setFontSize(12);
    doc.text(normalizeTurkish(`Toplam Ders Sayisi: ${lessonCount}`), 14, 24);
    if (scheduleData.dateRange) {
        doc.setFontSize(10);
        doc.text(normalizeTurkish(`Tarih Araligi: ${scheduleData.dateRange}`), 14, 29);
    }

    const lessonNumbers = ['', ...scheduleData.timeSlots.map((_, i) => `${i + 1}. Ders`)];
    const headers = ['Gun', ...scheduleData.timeSlots];
    const body = scheduleData.days.map((day, dayIdx) => {
        return [
            normalizeTurkish(formatDayNameClean(day)),
            ...scheduleData.timeSlots.map((slot, slotIdx) => {
                return normalizeTurkish(scheduleData.schedule[teacher]?.[dayIdx]?.[slotIdx] || '-');
            })
        ];
    });

    doc.autoTable({
        head: [lessonNumbers, headers],
        body: body,
        startY: 30,
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 7 },
        columnStyles: { 0: { cellWidth: 25 } },
        alternateRowStyles: { fillColor: [245, 245, 250] }
    });
}

function addClassPageToPDF(doc, cls, classSchedule) {
    // Count lessons for this class
    let lessonCount = 0;
    scheduleData.days.forEach((day, dayIdx) => {
        scheduleData.timeSlots.forEach((slot, slotIdx) => {
            if (classSchedule[cls]?.[dayIdx]?.[slotIdx]) {
                lessonCount++;
            }
        });
    });

    doc.setFontSize(18);
    doc.text(normalizeTurkish(`Sinif: ${cls}`), 14, 15);
    doc.setFontSize(12);
    doc.text(normalizeTurkish(`Toplam Ders Sayisi: ${lessonCount}`), 14, 24);
    if (scheduleData.dateRange) {
        doc.setFontSize(10);
        doc.text(normalizeTurkish(`Tarih Araligi: ${scheduleData.dateRange}`), 14, 29);
    }

    const lessonNumbers = ['', ...scheduleData.timeSlots.map((_, i) => `${i + 1}. Ders`)];
    const headers = ['Gun', ...scheduleData.timeSlots];
    const body = scheduleData.days.map((day, dayIdx) => {
        return [
            normalizeTurkish(formatDayNameClean(day)),
            ...scheduleData.timeSlots.map((slot, slotIdx) => {
                return normalizeTurkish(classSchedule[cls]?.[dayIdx]?.[slotIdx] || '-');
            })
        ];
    });

    doc.autoTable({
        head: [lessonNumbers, headers],
        body: body,
        startY: 30,
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 7 },
        columnStyles: { 0: { cellWidth: 25 } },
        alternateRowStyles: { fillColor: [245, 250, 245] }
    });
}

// ========================================
// Excel Export Functions
// ========================================

function exportAllToExcel() {
    const workbook = XLSX.utils.book_new();

    // Add teacher sheets
    scheduleData.teachers.forEach(teacher => {
        const ws = createTeacherWorksheet(teacher);
        XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName(`Ö-${teacher}`));
    });

    // Add class sheets
    const classSchedule = buildClassSchedule();
    scheduleData.classes.forEach(cls => {
        const ws = createClassWorksheet(cls, classSchedule);
        XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName(`S-${cls}`));
    });

    XLSX.writeFile(workbook, 'ders_programi_tumu.xlsx');
    toggleExportMenu();
}

function exportTeachersToExcel() {
    const workbook = XLSX.utils.book_new();

    scheduleData.teachers.forEach(teacher => {
        const ws = createTeacherWorksheet(teacher);
        XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName(teacher));
    });

    XLSX.writeFile(workbook, 'ders_programi_ogretmenler.xlsx');
    toggleExportMenu();
}

function exportClassesToExcel() {
    const workbook = XLSX.utils.book_new();

    const classSchedule = buildClassSchedule();
    scheduleData.classes.forEach(cls => {
        const ws = createClassWorksheet(cls, classSchedule);
        XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName(cls));
    });

    XLSX.writeFile(workbook, 'ders_programi_siniflar.xlsx');
    toggleExportMenu();
}

function exportCurrentToExcel() {
    const workbook = XLSX.utils.book_new();

    if (currentView === 'teacher') {
        if (currentTeacherFilter === 'all') {
            exportTeachersToExcel();
            return;
        }
        const teacher = currentTeacherFilter;
        if (teacher) {
            const ws = createTeacherWorksheet(teacher);
            XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName(teacher));
            XLSX.writeFile(workbook, `ders_programi_${sanitizeFilename(teacher)}.xlsx`);
        }
    } else {
        if (currentClassFilter === 'all') {
            exportClassesToExcel();
            return;
        }
        const cls = currentClassFilter;
        if (cls) {
            const classSchedule = buildClassSchedule();
            const ws = createClassWorksheet(cls, classSchedule);
            XLSX.utils.book_append_sheet(workbook, ws, sanitizeSheetName(cls));
            XLSX.writeFile(workbook, `ders_programi_${sanitizeFilename(cls)}.xlsx`);
        }
    }
}

function createTeacherWorksheet(teacher) {
    const data = [];

    // Header row
    data.push(['Öğretmen:', teacher]);
    if (scheduleData.dateRange) {
        data.push(['Tarih Aralığı:', scheduleData.dateRange]);
    }
    data.push([]);

    // Lesson numbers
    const lessonNumbers = [''].concat(scheduleData.timeSlots.map((_, i) => `${i + 1}. Ders`));
    data.push(lessonNumbers);

    data.push(['Gün', ...scheduleData.timeSlots]);

    // Data rows
    scheduleData.days.forEach((day, dayIdx) => {
        const row = [formatDayNameClean(day)];
        scheduleData.timeSlots.forEach((slot, slotIdx) => {
            row.push(scheduleData.schedule[teacher]?.[dayIdx]?.[slotIdx] || '');
        });
        data.push(row);
    });

    return XLSX.utils.aoa_to_sheet(data);
}

function createClassWorksheet(cls, classSchedule) {
    const data = [];

    // Header row
    data.push(['Sınıf:', cls]);
    if (scheduleData.dateRange) {
        data.push(['Tarih Aralığı:', scheduleData.dateRange]);
    }
    data.push([]);

    // Lesson numbers
    const lessonNumbers = [''].concat(scheduleData.timeSlots.map((_, i) => `${i + 1}. Ders`));
    data.push(lessonNumbers);

    data.push(['Gün', ...scheduleData.timeSlots]);

    // Data rows
    scheduleData.days.forEach((day, dayIdx) => {
        const row = [formatDayNameClean(day)];
        scheduleData.timeSlots.forEach((slot, slotIdx) => {
            row.push(classSchedule[cls]?.[dayIdx]?.[slotIdx] || '');
        });
        data.push(row);
    });

    return XLSX.utils.aoa_to_sheet(data);
}

// ========================================
// Utility Functions
// ========================================

function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\-_]/g, '_');
}

function sanitizeSheetName(name) {
    // Excel sheet names max 31 chars, no special chars
    return name.replace(/[\/\\?*\[\]:]/g, '_').substring(0, 31);
}
