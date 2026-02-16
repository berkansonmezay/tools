// State Management
let currentDay = 0; // 0: Pazartesi, 6: Pazar
const daysData = Array.from({ length: 7 }, () => []);

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const currentDayNameDisplay = document.getElementById('currentDayName');
const lessonRowsContainer = document.getElementById('lessonRowsContainer');
const addLessonBtn = document.getElementById('addLessonBtn');
const calculateHoursBtn = document.getElementById('calculateHoursBtn');
const copyDayBtn = document.getElementById('copyDayBtn');
const copyFromDaySelect = document.getElementById('copyFromDay');
const lessonDurationInput = document.getElementById('lessonDuration');
const breakDurationInput = document.getElementById('breakDuration');

// Constants
const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Initialize
function init() {
    renderRows();
    setupEventListeners();
}

function setupEventListeners() {
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.tab.active').classList.remove('active');
            tab.classList.add('active');
            currentDay = parseInt(tab.dataset.day);
            currentDayNameDisplay.textContent = DAY_NAMES[currentDay];
            renderRows();
        });
    });

    // Add row
    addLessonBtn.addEventListener('click', () => {
        addLessonRow(currentDay);
        renderRows();
    });

    // Calculate hours
    calculateHoursBtn.addEventListener('click', calculateAllHours);

    // Copy day
    copyDayBtn.addEventListener('click', () => {
        const fromDay = parseInt(copyFromDaySelect.value);
        if (fromDay === currentDay) {
            alert("Aynı günü kopyalayamazsınız.");
            return;
        }

        // Deep copy data
        daysData[currentDay] = JSON.parse(JSON.stringify(daysData[fromDay]));
        saveDaysData();
        renderRows();
    });

    // Excel Export
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }

    // Excel Import
    const importExcelFile = document.getElementById('importExcelFile');
    if (importExcelFile) {
        importExcelFile.addEventListener('change', importFromExcel);
    }
}

function saveDaysData() {
    localStorage.setItem('daysData', JSON.stringify(daysData));
}

function addLessonRow(dayIndex, startTime = "09:00", endTime = "09:40") {
    daysData[dayIndex].push({
        id: Date.now() + Math.random(),
        isFixed: false,
        startTime: startTime,
        endTime: endTime
    });
    saveDaysData();
}

function renderRows() {
    lessonRowsContainer.innerHTML = '';
    const currentRows = daysData[currentDay];

    currentRows.forEach((row, index) => {
        const [startH, startM] = row.startTime.split(':');
        const [endH, endM] = row.endTime.split(':');

        const tr = document.createElement('tr');
        tr.className = 'lesson-row';
        tr.innerHTML = `
            <td>
                <div class="sequence-badge">${index + 1}</div>
            </td>
            <td>
                <div class="checkbox-wrapper">
                    <input type="checkbox" ${row.isFixed ? 'checked' : ''} onchange="updateRowData(${currentDay}, ${row.id}, 'isFixed', this.checked)">
                </div>
            </td>
            <td>
                <div class="time-inputs">
                    <div class="time-input-group">
                        <input type="text" maxlength="2" value="${startH}" onchange="updateRowTime(${currentDay}, ${row.id}, 'start', 'h', this.value)">
                        <span class="time-separator">:</span>
                        <input type="text" maxlength="2" value="${startM}" onchange="updateRowTime(${currentDay}, ${row.id}, 'start', 'm', this.value)">
                    </div>
                </div>
            </td>
            <td>
                <div class="time-inputs">
                    <div class="time-input-group">
                        <input type="text" maxlength="2" value="${endH}" onchange="updateRowTime(${currentDay}, ${row.id}, 'end', 'h', this.value)">
                        <span class="time-separator">:</span>
                        <input type="text" maxlength="2" value="${endM}" onchange="updateRowTime(${currentDay}, ${row.id}, 'end', 'm', this.value)">
                    </div>
                </div>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteRow(${currentDay}, ${row.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        lessonRowsContainer.appendChild(tr);
    });
}

// Global functions for inline events
window.updateRowData = (day, id, field, value) => {
    const row = daysData[day].find(r => r.id === id);
    if (row) {
        row[field] = value;

        // If isFixed is changed, recalculate all hours after this row
        if (field === 'isFixed') {
            recalculateFromRow(day, id);
        }

        saveDaysData();
    }
};

window.updateRowTime = (day, id, type, unit, value) => {
    const row = daysData[day].find(r => r.id === id);
    if (!row) return;

    let [h, m] = (type === 'start' ? row.startTime : row.endTime).split(':');
    if (unit === 'h') h = value.padStart(2, '0');
    else m = value.padStart(2, '0');

    const formattedTime = `${h}:${m}`;
    if (type === 'start') row.startTime = formattedTime;
    else row.endTime = formattedTime;

    saveDaysData();
};

window.deleteRow = (day, id) => {
    daysData[day] = daysData[day].filter(row => row.id !== id);
    saveDaysData();
    renderRows();
};

function recalculateFromRow(day, rowId) {
    const currentRows = daysData[day];
    const rowIndex = currentRows.findIndex(r => r.id === rowId);

    if (rowIndex === -1) return;

    const lessonDur = parseInt(lessonDurationInput.value);
    const breakDur = parseInt(breakDurationInput.value);

    // Start recalculating from the row after the changed one
    for (let i = rowIndex + 1; i < currentRows.length; i++) {
        const currentRow = currentRows[i];
        const prevRow = currentRows[i - 1];

        // Skip if this row is also fixed
        if (currentRow.isFixed) {
            continue;
        }

        // Calculate start time based on previous row's end time + break
        currentRow.startTime = addMinutes(prevRow.endTime, breakDur);
        currentRow.endTime = addMinutes(currentRow.startTime, lessonDur);
    }

    renderRows();
}

function calculateAllHours() {
    const currentRows = daysData[currentDay];
    if (currentRows.length === 0) return;

    const lessonDur = parseInt(lessonDurationInput.value);
    const breakDur = parseInt(breakDurationInput.value);

    // Find the first fixed row or use first row's start time
    let currentTimeStr = currentRows[0].startTime;

    currentRows.forEach((row, index) => {
        // Skip if this row is fixed
        if (row.isFixed) {
            // Use this fixed row's end time as the base for next calculation
            currentTimeStr = row.endTime;
            return;
        }

        // If it's the first row and not fixed, keep its start time
        if (index > 0) {
            // Check if previous row exists
            const prevRow = currentRows[index - 1];
            // Calculate start time based on previous end time + break
            currentTimeStr = addMinutes(prevRow.endTime, breakDur);
            row.startTime = currentTimeStr;
        }

        // Calculate end time for non-fixed rows
        row.endTime = addMinutes(row.startTime, lessonDur);
        currentTimeStr = row.endTime;
    });

    saveDaysData();
    renderRows();
}

function addMinutes(timeStr, minutes) {
    let [h, m] = timeStr.split(':').map(Number);
    m += minutes;
    h += Math.floor(m / 60);
    h = h % 24;
    m = m % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Excel Export Function
function exportToExcel() {
    const workbook = XLSX.utils.book_new();

    // Create a worksheet for each day
    DAY_NAMES.forEach((dayName, dayIndex) => {
        const dayData = daysData[dayIndex];

        if (dayData.length === 0) return; // Skip empty days

        // Prepare data for Excel
        const excelData = [
            ['Sıra', 'Sabit', 'Başlama Saati', 'Bitiş Saati'] // Header
        ];

        dayData.forEach((row, index) => {
            excelData.push([
                index + 1,
                row.isFixed ? 'Evet' : 'Hayır',
                row.startTime,
                row.endTime
            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, dayName);
    });

    // Download the file
    XLSX.writeFile(workbook, 'Zaman_Plani.xlsx');
    alert('Zaman planı Excel dosyasına aktarıldı!');
}

// Excel Import Function
function importFromExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Clear existing data
            for (let i = 0; i < 7; i++) {
                daysData[i] = [];
            }

            // Read each sheet (day)
            workbook.SheetNames.forEach((sheetName) => {
                const dayIndex = DAY_NAMES.indexOf(sheetName);
                if (dayIndex === -1) return; // Skip unknown sheets

                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Skip header row and process data
                jsonData.slice(1).forEach((row) => {
                    if (row[2] && row[3]) { // Check if start and end times exist
                        daysData[dayIndex].push({
                            id: Date.now() + Math.random(),
                            isFixed: row[1] === 'Evet',
                            startTime: row[2],
                            endTime: row[3]
                        });
                    }
                });
            });

            // Render the current day
            renderRows();
            saveDaysData();

            // Reset file input
            e.target.value = '';
        } catch (error) {
            console.error('Excel import error:', error);
            alert('Excel dosyası yüklenirken hata oluştu: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

init();
