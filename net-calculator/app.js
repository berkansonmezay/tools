/**
 * Net Hesaplama - Excel Processing Application
 * - File upload via drag-drop or file selection
 * - Paste row data and add to table
 * - Export data back to Excel
 */

// Global data storage
let tableData = [];
let headers = [];

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const answerDropZone = document.getElementById('answerDropZone');
const answerFileInput = document.getElementById('answerFileInput');
const answerFileInfo = document.getElementById('answerFileInfo');
const answerFileNameEl = document.getElementById('answerFileName');
const answerClearBtn = document.getElementById('answerClearBtn');
const filePreviewContainer = document.getElementById('filePreviewContainer');
const filePreviewContent = document.getElementById('filePreviewContent');
const filePreviewEmpty = document.getElementById('filePreviewEmpty');
const clearDataBtn = document.getElementById('clearDataBtn');
const exportBtn = document.getElementById('exportBtn');
const calculateBtn = document.getElementById('calculateBtn');
const wrongRuleSelect = document.getElementById('wrongRule');

const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const emptyMessage = document.getElementById('emptyMessage');

const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

const resultModal = document.getElementById('resultModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalFooterBtn = document.getElementById('closeModalFooterBtn');
const resultSummary = document.getElementById('resultSummary');

// ============================================
// FILE UPLOAD HANDLING
// ============================================

// Drag and drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processFile(e.target.files[0]);
    }
});

/**
 * Process uploaded Excel/CSV file
 * @param {File} file - The file to process
 */
function processFile(file) {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
        showNotification('Lütfen geçerli bir Excel dosyası seçin (.xlsx, .xls, .csv)', 'error');
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON with headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                showNotification('Dosya boş görünüyor', 'error');
                return;
            }

            // First row as headers
            headers = jsonData[0].map(h => h ? String(h) : '');

            // Rest as data
            tableData = jsonData.slice(1).map(row => {
                // Ensure each row has same length as headers
                const normalizedRow = [];
                for (let i = 0; i < headers.length; i++) {
                    normalizedRow.push(row[i] !== undefined ? row[i] : '');
                }
                return normalizedRow;
            });

            renderTable();
            showFileInfo(file.name);
            showNotification(`${file.name} başarıyla yüklendi. ${tableData.length} satır bulundu.`, 'success');

        } catch (error) {
            console.error('Error processing file:', error);
            showNotification('Dosya işlenirken hata oluştu', 'error');
        }
    };

    reader.onerror = () => {
        showNotification('Dosya okunamadı', 'error');
    };

    reader.readAsArrayBuffer(file);
}

/**
 * Show file info after successful upload
 * @param {string} name - File name
 */
function showFileInfo(name) {
    fileName.textContent = name;
    fileInfo.classList.add('visible');
}

// ============================================
// TABLE RENDERING
// ============================================

/**
 * Render the data table
 * Hides columns after "Cevap" and adds "Öğrencinin Cevapları" column
 */
function renderTable() {
    // Clear existing content
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (headers.length === 0 && tableData.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    // Find the index of "Cevap" column (case-insensitive search)
    let cevapIndex = headers.findIndex(h =>
        h.toLowerCase().includes('cevap') && !h.toLowerCase().includes('karşılığı')
    );

    // If no "Cevap" column found, show all columns
    const maxColumnIndex = cevapIndex >= 0 ? cevapIndex : headers.length - 1;

    // Filter columns to display
    // Hide columns containing "karşılığı"
    const visibleIndices = [];
    for (let i = 0; i <= maxColumnIndex; i++) {
        const header = headers[i].toLowerCase();
        if (!header.includes('karşılığı')) {
            visibleIndices.push(i);
        }
    }

    // Render headers
    const headerRow = document.createElement('tr');
    visibleIndices.forEach(colIndex => {
        const th = document.createElement('th');
        th.textContent = headers[colIndex];
        headerRow.appendChild(th);
    });

    // Add "Öğrencinin Cevapları" column header
    if (cevapIndex >= 0) {
        const thStudentAnswer = document.createElement('th');
        thStudentAnswer.textContent = 'Öğrencinin Cevapları';
        thStudentAnswer.style.background = '#d4edda';
        thStudentAnswer.style.color = '#155724';
        headerRow.appendChild(thStudentAnswer);
    }

    tableHead.appendChild(headerRow);

    // Render data rows
    tableData.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        // Render visible columns
        visibleIndices.forEach(colIndex => {
            const td = document.createElement('td');
            td.textContent = row[colIndex] !== undefined && row[colIndex] !== null ? row[colIndex] : '';
            tr.appendChild(td);
        });

        // Add empty cell for "Öğrencinin Cevapları"
        if (cevapIndex >= 0) {
            const tdStudentAnswer = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'student-answer-input';
            input.placeholder = 'Cevap girin...';
            input.dataset.rowIndex = rowIndex;

            // Add paste event listener for smart pasting
            input.addEventListener('paste', (e) => handlePaste(e, rowIndex));

            input.addEventListener('input', (e) => {
                row.studentAnswer = e.target.value;
            });
            input.addEventListener('change', (e) => {
                row.studentAnswer = e.target.value;
            });
            if (row.studentAnswer) {
                input.value = row.studentAnswer;
            }
            tdStudentAnswer.appendChild(input);
            tdStudentAnswer.style.background = 'rgba(212, 237, 218, 0.3)';
            tr.appendChild(tdStudentAnswer);
        }

        tableBody.appendChild(tr);
    });
}

// ============================================
// FILE PREVIEW & ANSWER SELECTION
// ============================================

// Answer drop zone events
answerDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    answerDropZone.classList.add('drag-over');
});

answerDropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    answerDropZone.classList.remove('drag-over');
});

answerDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    answerDropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processAnswerFile(files[0]);
    }
});

answerFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processAnswerFile(e.target.files[0]);
    }
});

// Clear answer preview
answerClearBtn.addEventListener('click', () => {
    filePreviewContent.innerHTML = '';
    filePreviewContent.classList.remove('visible');
    filePreviewEmpty.style.display = 'block';
    answerFileInfo.classList.remove('visible');
    answerFileInput.value = '';
});

/**
 * Process file for answer preview
 */
function processAnswerFile(file) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.csv', '.txt'];

    if (!validExtensions.includes(ext)) {
        showNotification('Desteklenen dosya türleri: .xlsx, .xls, .csv, .txt', 'error');
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const arrayBuffer = e.target.result;
            let text;

            if (ext === '.txt' || ext === '.csv') {
                // Try UTF-8 first, fall back to Windows-1254 (Turkish ANSI)
                const uint8 = new Uint8Array(arrayBuffer);
                text = new TextDecoder('utf-8').decode(uint8);

                // Check for replacement characters (U+FFFD) — sign of wrong encoding
                if (text.includes('\uFFFD')) {
                    text = new TextDecoder('windows-1254').decode(uint8);
                }

                if (ext === '.csv') {
                    const workbook = XLSX.read(text, { type: 'string' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const lines = jsonData.map(row =>
                        row.map(cell => (cell !== undefined && cell !== null) ? String(cell) : '').join('\t')
                    );
                    renderPreviewLines(lines);
                } else {
                    const lines = text.split(/\r?\n/);
                    renderPreviewLines(lines);
                }
            } else {
                // .xlsx / .xls — binary Excel
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const lines = jsonData.map(row =>
                    row.map(cell => (cell !== undefined && cell !== null) ? String(cell) : '').join('\t')
                );
                renderPreviewLines(lines);
            }
            showAnswerFileInfo(file.name);
        } catch (error) {
            console.error('Error processing answer file:', error);
            showNotification('Dosya işlenirken hata oluştu', 'error');
        }
    };

    reader.readAsArrayBuffer(file);
}

/**
 * Show answer file info
 */
function showAnswerFileInfo(name) {
    answerFileNameEl.textContent = name;
    answerFileInfo.classList.add('visible');
}

/**
 * Render file content as selectable lines
 */
function renderPreviewLines(lines) {
    filePreviewContent.innerHTML = '';
    filePreviewEmpty.style.display = 'none';

    lines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'file-preview-line';
        lineDiv.textContent = line || ' '; // preserve empty lines
        filePreviewContent.appendChild(lineDiv);
    });

    filePreviewContent.classList.add('visible');
    showNotification(`${lines.length} satır yüklendi`, 'success');
}

// ============================================
// ZOOM CONTROLS
// ============================================

const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const zoomLevelEl = document.getElementById('zoomLevel');

const BASE_FONT_SIZE = 0.88; // rem
const ZOOM_STEP = 10;  // percent
const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
let currentZoom = 100;

function applyZoom() {
    const scale = currentZoom / 100;
    filePreviewContent.style.fontSize = `${BASE_FONT_SIZE * scale}rem`;
    zoomLevelEl.textContent = `${currentZoom}%`;
}

zoomInBtn.addEventListener('click', () => {
    if (currentZoom < ZOOM_MAX) {
        currentZoom += ZOOM_STEP;
        applyZoom();
    }
});

zoomOutBtn.addEventListener('click', () => {
    if (currentZoom > ZOOM_MIN) {
        currentZoom -= ZOOM_STEP;
        applyZoom();
    }
});

zoomResetBtn.addEventListener('click', () => {
    currentZoom = 100;
    applyZoom();
});

// Ctrl + scroll wheel zoom in preview area
filePreviewContainer.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0 && currentZoom < ZOOM_MAX) {
            currentZoom += ZOOM_STEP;
        } else if (e.deltaY > 0 && currentZoom > ZOOM_MIN) {
            currentZoom -= ZOOM_STEP;
        }
        applyZoom();
    }
}, { passive: false });

// ============================================
// SELECTION COPY TOOLTIP
// ============================================

// Create the selection tooltip
const selectionTooltip = document.createElement('div');
selectionTooltip.className = 'selection-copy-tooltip';
selectionTooltip.innerHTML = `
    <button class="tooltip-btn tooltip-btn-copy" id="tooltipCopyBtn">
        <i class="ph ph-copy"></i> Kopyala
    </button>
`;
document.body.appendChild(selectionTooltip);

let currentSelectedText = '';

// Show tooltip on mouse selection within preview
filePreviewContent.addEventListener('mouseup', (e) => {
    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0) {
            currentSelectedText = text;
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Position tooltip above the selection
            let tooltipX = rect.left + (rect.width / 2);
            let tooltipY = rect.top - 10;

            // Show first to measure dimensions
            selectionTooltip.classList.add('visible');
            const tooltipRect = selectionTooltip.getBoundingClientRect();

            // Adjust so it doesn't go off-screen
            tooltipX = Math.max(8, Math.min(tooltipX - tooltipRect.width / 2, window.innerWidth - tooltipRect.width - 8));
            tooltipY = tooltipY - tooltipRect.height;
            if (tooltipY < 8) {
                tooltipY = rect.bottom + 10; // show below if no space above
            }

            selectionTooltip.style.left = `${tooltipX}px`;
            selectionTooltip.style.top = `${tooltipY}px`;
        } else {
            hideSelectionTooltip();
        }
    }, 10);
});

// Hide tooltip when clicking outside
document.addEventListener('mousedown', (e) => {
    if (!selectionTooltip.contains(e.target)) {
        // Small delay to let the copy buttons handle their click first
        setTimeout(() => {
            if (!selectionTooltip.contains(document.activeElement)) {
                hideSelectionTooltip();
            }
        }, 150);
    }
});

function hideSelectionTooltip() {
    selectionTooltip.classList.remove('visible');
    currentSelectedText = '';
}

// Copy button
document.getElementById('tooltipCopyBtn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentSelectedText) return;

    navigator.clipboard.writeText(currentSelectedText).then(() => {
        showCopyFeedback(e.currentTarget, 'Kopyalandı!');
        showNotification('Metin kopyalandı', 'success');
    }).catch(() => {
        showNotification('Kopyalama başarısız', 'error');
    });
});

// Prevent tooltip clicks from clearing selection
selectionTooltip.addEventListener('mousedown', (e) => {
    e.preventDefault();
});

/**
 * Brief visual feedback on tooltip button
 */
function showCopyFeedback(btn, msg) {
    const original = btn.innerHTML;
    btn.innerHTML = `<i class="ph ph-check"></i> ${msg}`;
    setTimeout(() => {
        btn.innerHTML = original;
        hideSelectionTooltip();
    }, 1200);
}

// ============================================
// PASTE FUNCTIONALITY (for student answer inputs)
// ============================================

/**
 * Handle paste on student answer inputs
 * Allows pasting "ABCDE..." or newline separated data and auto-filling subsequent inputs
 */
function handlePaste(e, startRowIndex) {
    if (e.preventDefault) e.preventDefault();

    let pastedData = '';
    if (e.clipboardData) {
        pastedData = e.clipboardData.getData('text');
    } else if (e.detail && e.detail.text) {
        pastedData = e.detail.text;
    }

    if (!pastedData && e.clipboardData && typeof e.clipboardData.getData === 'function') {
        pastedData = e.clipboardData.getData('text');
    }

    if (!pastedData) return;

    let values = [];

    if (pastedData.includes('\n') || pastedData.includes('\r')) {
        values = pastedData.split(/[\r\n]+/).map(v => v.trim());
    } else {
        values = pastedData.split('');
    }

    const inputs = document.querySelectorAll('.student-answer-input');
    let filledCount = 0;

    for (let i = 0; i < values.length; i++) {
        const targetIndex = startRowIndex + i;

        if (targetIndex < inputs.length) {
            const input = inputs[targetIndex];
            input.value = values[i];

            const event = new Event('change');
            input.dispatchEvent(event);

            input.style.backgroundColor = '#dbeafe';
            setTimeout(() => {
                input.style.backgroundColor = '';
            }, 500);

            filledCount++;
        }
    }

    showNotification(`${filledCount} adet cevap yapıştırıldı`, 'success');
}

// ============================================
// DATA MANAGEMENT
// ============================================

/**
 * Clear all table data
 */
clearDataBtn.addEventListener('click', () => {
    if (tableData.length === 0 && headers.length === 0) {
        showNotification('Temizlenecek veri yok', 'info');
        return;
    }

    if (confirm('Tüm veriler silinecek. Emin misiniz?')) {
        tableData = [];
        headers = [];
        fileInfo.classList.remove('visible');
        renderTable();
        showNotification('Tablo temizlendi', 'success');
    }
});

/**
 * Export data to Excel
 */
exportBtn.addEventListener('click', exportStyledData);

// ============================================
// NOTIFICATIONS
// ============================================

let notificationTimeout;

/**
 * Show notification message
 * @param {string} message - Message to show
 * @param {string} type - 'success', 'error', or 'info'
 */
function showNotification(message, type = 'info') {
    clearTimeout(notificationTimeout);

    notification.className = 'notification';
    notification.classList.add(type);

    const iconMap = {
        success: 'ph-check-circle',
        error: 'ph-x-circle',
        info: 'ph-info'
    };

    notification.querySelector('i').className = `ph ${iconMap[type] || iconMap.info}`;
    notificationText.textContent = message;

    // Show
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Hide after 4 seconds
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// ============================================
// CALCULATION LOGIC
// ============================================

if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateNet);
}

// Sync all student answer inputs to tableData before calculation/export
function syncStudentAnswers() {
    const inputs = document.querySelectorAll('.student-answer-input');
    inputs.forEach(input => {
        const rowIndex = parseInt(input.dataset.rowIndex);
        if (!isNaN(rowIndex) && tableData[rowIndex] !== undefined) {
            tableData[rowIndex].studentAnswer = input.value;
        }
    });
}

function calculateNet() {
    syncStudentAnswers();
    if (tableData.length === 0) {
        showNotification('Hesaplanacak veri yok', 'error');
        return;
    }

    // Find necessary column indices
    const headerLower = headers.map(h => h.toLowerCase());

    // Ders column
    const dersIndex = headerLower.findIndex(h => h === 'ders' || h === 'ders adı' || h.includes('ders'));

    // Correct Answer column
    const cevapIndex = headerLower.findIndex(h =>
        (h.includes('cevap') || h === 'doğru cevap') && !h.includes('karşılığı') && !h.includes('öğrenci')
    );

    if (dersIndex === -1) {
        showNotification('"Ders" sütunu bulunamadı', 'error');
        return;
    }

    if (cevapIndex === -1) {
        showNotification('"Cevap" sütunu bulunamadı', 'error');
        return;
    }

    // Calculation Rule
    const rule = parseFloat(wrongRuleSelect.value);

    // Results object: { 'Turkce': { correct: 0, wrong: 0, empty: 0 }, ... }
    const results = {};
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalEmpty = 0;
    let totalNet = 0;

    tableData.forEach((row, index) => {
        const ders = row[dersIndex] || 'Diğer';
        const correctAnswer = (row[cevapIndex] || '').toString().trim().toUpperCase();

        // Student answer
        const studentAnswer = (row.studentAnswer || '').toString().trim().toUpperCase();

        if (!results[ders]) {
            results[ders] = { correct: 0, wrong: 0, empty: 0 };
        }

        // Find the input element and row for this index
        const input = document.querySelector(`.student-answer-input[data-row-index="${index}"]`);
        const rowElement = input ? input.closest('tr') : null;

        // Reset classes
        if (input) {
            input.classList.remove('input-correct', 'input-wrong', 'input-empty');
        }
        if (rowElement) {
            rowElement.classList.remove('row-wrong', 'row-correct', 'row-empty');
            rowElement.style.backgroundColor = '';
            Array.from(rowElement.children).forEach(cell => {
                cell.style.backgroundColor = '';
            });
        }

        if (!correctAnswer) return; // Skip if no key exists

        if (!studentAnswer) {
            results[ders].empty++;
            totalEmpty++;
            if (input) input.classList.add('input-empty');
        } else if (studentAnswer === correctAnswer) {
            results[ders].correct++;
            totalCorrect++;
            if (input) input.classList.add('input-correct');
        } else {
            results[ders].wrong++;
            totalWrong++;
            if (input) input.classList.add('input-wrong');
            // Highlight the entire row for wrong answers
            if (rowElement) {
                rowElement.classList.add('row-wrong');
                // Force inline style to ensure visibility
                rowElement.style.backgroundColor = '#fee2e2';
                // Also force cells background
                Array.from(rowElement.children).forEach(cell => {
                    cell.style.backgroundColor = '#fee2e2';
                });
            }
        }
    });

    // Generate Result HTML
    let totalRows = '';

    Object.keys(results).forEach(ders => {
        const stats = results[ders];
        const net = rule > 0 ? stats.correct - (stats.wrong / rule) : stats.correct;
        totalNet += net;

        totalRows += `
            <tr>
                <td style="text-align: left; font-weight: 500;">${ders}</td>
                <td>${stats.correct}</td>
                <td>${stats.wrong}</td>
                <td>${stats.empty}</td>
                <td class="${net >= 0 ? 'net-positive' : 'net-negative'}">${net.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</td>
            </tr>
        `;
    });

    // Add Total Row
    totalRows += `
        <tr style="background: #e9ecef; font-weight: bold;">
            <td style="text-align: left;">TOPLAM</td>
            <td>${totalCorrect}</td>
            <td>${totalWrong}</td>
            <td>${totalEmpty}</td>
            <td class="net-positive">${totalNet.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</td>
        </tr>
    `;

    const resultHTML = `
        <table class="result-table">
            <thead>
                <tr>
                    <th>Ders</th>
                    <th>Doğru</th>
                    <th>Yanlış</th>
                    <th>Boş</th>
                    <th>Net</th>
                </tr>
            </thead>
            <tbody>
                ${totalRows}
            </tbody>
        </table>
        <div style="margin-top: 1rem; font-size: 0.9rem; color: #666; text-align: right;">
            Kural: ${rule > 0 ? `${rule} Yanlış 1 Doğruyu Götürür` : 'Götürme Yok'}
        </div>
    `;

    resultSummary.innerHTML = resultHTML;
    openModal();
}

// ============================================
// MODAL LOGIC
// ============================================

function openModal() {
    resultModal.classList.add('show');
}

function closeModal() {
    resultModal.classList.remove('show');
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', closeModal);

// Close on click outside
resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        closeModal();
    }
});

// ============================================
// PASTE TOOLTIP
// ============================================

const pasteTooltip = document.createElement('div');
pasteTooltip.className = 'paste-tooltip';
pasteTooltip.innerHTML = '<i class="ph ph-clipboard-text"></i> Yapıştır';
document.body.appendChild(pasteTooltip);

let activeInput = null;
let tooltipTimeout;

// Global event delegation for dynamically created inputs
document.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('student-answer-input')) {
        activeInput = e.target;
        showPasteTooltip(activeInput);
    }
});

document.addEventListener('focusout', (e) => {
    if (e.target.classList.contains('student-answer-input')) {
        // Delay hiding to allow click on tooltip
        tooltipTimeout = setTimeout(() => {
            hidePasteTooltip();
        }, 200);
    }
});

function showPasteTooltip(input) {
    const rect = input.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    pasteTooltip.style.top = `${rect.top + scrollTop}px`;
    pasteTooltip.style.left = `${rect.left + scrollLeft + (rect.width / 2)}px`;

    // Center horizontally relative to input
    pasteTooltip.style.transform = 'translate(-50%, -100%) translateY(-10px)'; // Initial defined in CSS, but inline overrides
    // Wait for CSS transition
    requestAnimationFrame(() => {
        pasteTooltip.classList.add('show');
    });
}

function hidePasteTooltip() {
    pasteTooltip.classList.remove('show');
}

// FIX: Avoid Clipboard Permission Prompt But Don't Break functionality
pasteTooltip.addEventListener('click', async () => {
    if (!activeInput) return;

    // Try automatic paste first
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            // Mock event object
            const customEvent = {
                preventDefault: () => { },
                detail: { text: text },
                clipboardData: {
                    getData: () => text
                }
            };

            const rowIndex = parseInt(activeInput.dataset.rowIndex);
            handlePaste(customEvent, rowIndex);

            // Visual feedback on tooltip
            const originalContent = pasteTooltip.innerHTML;
            pasteTooltip.innerHTML = '<i class="ph ph-check"></i> Yapıştırıldı';
            setTimeout(() => {
                pasteTooltip.innerHTML = originalContent;
                hidePasteTooltip();
            }, 1000);

            // Return to avoid manual fallback
            return;
        }
    } catch (err) {
        console.log('Clipboard access denied, falling back to manual paste');
    }

    // Manual Fallback (if readText failed or denied)
    activeInput.focus();

    // Provide visual feedback
    const originalContent = pasteTooltip.innerHTML;
    pasteTooltip.innerHTML = '<i class="ph ph-keyboard"></i> Ctrl+V veya Basılı Tut';

    // Revert after 2 seconds
    setTimeout(() => {
        pasteTooltip.innerHTML = originalContent;
        hidePasteTooltip();
    }, 2000);
});

// Prevent tooltip from disappearing when clicked (because it causes input blur)
pasteTooltip.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevents input blur
});

// ============================================
// INITIALIZATION
// ============================================

// ============================================
// EXPORT LOGIC
// ============================================

function exportStyledData() {
    if (tableData.length === 0) {
        showNotification('Dışa aktarılacak veri yok', 'error');
        return;
    }

    // Sync latest input values before export
    syncStudentAnswers();

    // Identify Columns
    const headerLower = headers.map(h => h ? h.toLowerCase() : '');
    const dersIndex = headerLower.findIndex(h => h.includes('ders'));
    const cevapIndex = headerLower.findIndex(h => (h.includes('cevap') || h.includes('doğru')) && !h.includes('karşılığı') && !h.includes('öğrenci'));

    // If critical columns missing, fallback to simple export
    if (dersIndex === -1 || cevapIndex === -1) {
        showNotification('Ders veya Cevap sütunu bulunamadı. Standart dışa aktarma yapılıyor.', 'info');
        const ws = XLSX.utils.aoa_to_sheet([headers, ...tableData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Veriler');
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        XLSX.writeFile(wb, `net_hesaplama_${dateStr}.xlsx`);
        return;
    }

    // Calculate statistics per subject
    const statistics = {};

    tableData.forEach((row) => {
        let ders = row[dersIndex] || 'Diğer';
        ders = String(ders).replace(/[\\/?*\\[\\]:]/g, '_');

        const correctAnswer = (row[cevapIndex] || '').toString().trim().toUpperCase();
        const studentAnswer = (row.studentAnswer || '').toString().trim().toUpperCase();

        if (!statistics[ders]) {
            statistics[ders] = { correct: 0, wrong: 0, empty: 0 };
        }

        if (correctAnswer) {
            if (!studentAnswer) {
                statistics[ders].empty++;
            } else if (studentAnswer === correctAnswer) {
                statistics[ders].correct++;
            } else {
                statistics[ders].wrong++;
            }
        }
    });

    // Get calculation rule
    const rule = parseFloat(wrongRuleSelect ? wrongRuleSelect.value : 4);

    // Calculate net for each subject
    let totalCorrect = 0, totalWrong = 0, totalEmpty = 0, totalNet = 0;
    Object.keys(statistics).forEach(ders => {
        const stats = statistics[ders];
        stats.net = rule > 0 ? stats.correct - (stats.wrong / rule) : stats.correct;
        totalCorrect += stats.correct;
        totalWrong += stats.wrong;
        totalEmpty += stats.empty;
        totalNet += stats.net;
    });

    // ========== DEFINE COLUMNS TO KEEP ==========
    const excludePatterns = [
        'karşılığı',
        'konu kodu',
        'iptal',
        'zorluk',
        'soru tipi',
        'deneme video',
        'konu',
        'dosya'
    ];

    const cevapExcludePattern = (h) => {
        const lower = h.toLocaleLowerCase('tr-TR');
        return lower === 'cevap' || (lower.includes('cevap') && !lower.includes('öğrenci') && !lower.includes('karşılığı'));
    };

    const columnsToKeep = [];
    headers.forEach((header, index) => {
        // Türkçe karakter desteği için toLocaleLowerCase kullan
        const hLower = header.toLocaleLowerCase('tr-TR');
        const shouldExclude = excludePatterns.some(pattern => hLower.includes(pattern.toLocaleLowerCase('tr-TR'))) || cevapExcludePattern(header);
        if (!shouldExclude) {
            columnsToKeep.push(index);
        }
    });

    let exportHeaders = columnsToKeep.map(i => headers[i]);
    exportHeaders.push('Cevap');  // Doğru cevap
    exportHeaders.push('Öğrenci Cevabı');
    exportHeaders.push('Sonuç');

    // ========== BUILD SINGLE SHEET DATA ==========
    const sheetData = [];
    const wrongRowIndices = [];

    // === HEADER: HESAPLAMA SONUÇLARI ===
    sheetData.push(['HESAPLAMA SONUÇLARI']);
    sheetData.push([]);

    // Summary table headers
    sheetData.push(['Ders', 'Doğru', 'Yanlış', 'Boş', 'Net']);
    const summaryHeaderRowIndex = 2;

    // Summary data rows
    Object.keys(statistics).forEach(ders => {
        const stats = statistics[ders];
        sheetData.push([
            ders,
            stats.correct,
            stats.wrong,
            stats.empty,
            parseFloat(stats.net.toFixed(2))
        ]);
    });

    // Empty row before total
    sheetData.push([]);

    // Total row
    const totalRowIndex = sheetData.length;
    sheetData.push([
        'TOPLAM',
        totalCorrect,
        totalWrong,
        totalEmpty,
        parseFloat(totalNet.toFixed(2))
    ]);

    // Empty row
    sheetData.push([]);

    // Rule info
    const ruleRowIndex = sheetData.length;
    sheetData.push([`Kural: ${rule > 0 ? rule + ' Yanlış 1 Doğruyu Götürür' : 'Götürme Yok'}`]);

    // === SEPARATOR ===
    sheetData.push([]);

    // === DATA HEADER ===
    const dataHeaderRowIndex = sheetData.length;
    sheetData.push(exportHeaders);

    // === ALL DATA ROWS ===
    tableData.forEach((row) => {
        const correctAnswer = (row[cevapIndex] || '').toString().trim().toUpperCase();
        const studentAnswer = (row.studentAnswer || '').toString().trim().toUpperCase();

        const newRow = columnsToKeep.map(i => row[i] !== undefined ? row[i] : '');
        newRow.push(correctAnswer || '');  // Doğru cevap
        newRow.push(row.studentAnswer || '');

        // Determine result
        let result = '';
        let isWrong = false;
        if (correctAnswer) {
            if (!studentAnswer) {
                result = 'Boş';
            } else if (studentAnswer === correctAnswer) {
                result = 'Doğru';
            } else {
                result = 'Yanlış';
                isWrong = true;
            }
        }
        newRow.push(result);

        const currentRowIndex = sheetData.length;
        if (isWrong) {
            wrongRowIndices.push(currentRowIndex);
        }

        sheetData.push(newRow);
    });

    // ========== CREATE WORKSHEET ==========
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // ========== STYLE HELPERS ==========
    const thinBorder = {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } }
    };

    // ========== APPLY STYLES ==========
    // Title style - large, bold, purple
    if (ws['A1']) {
        ws['A1'].s = {
            font: { bold: true, sz: 18, color: { rgb: "6B2D8B" } }
        };
    }

    // Summary table header style (row 3, index 2) - purple gradient look
    for (let C = 0; C < 5; C++) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: summaryHeaderRowIndex });
        if (ws[cellRef]) {
            ws[cellRef].s = {
                font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "7B4DCA" } },
                border: thinBorder,
                alignment: { vertical: "center", horizontal: "center" }
            };
        }
    }
    // First column (Ders) left-aligned in header
    const dersHeaderRef = XLSX.utils.encode_cell({ c: 0, r: summaryHeaderRowIndex });
    if (ws[dersHeaderRef]) {
        ws[dersHeaderRef].s.alignment = { vertical: "center", horizontal: "left" };
    }

    // Summary data rows - alternating colors
    const summaryDataStart = summaryHeaderRowIndex + 1;
    const summaryDataEnd = totalRowIndex - 1; // row before empty row before TOPLAM
    for (let R = summaryDataStart; R < summaryDataEnd; R++) {
        const isEven = (R - summaryDataStart) % 2 === 0;
        for (let C = 0; C < 5; C++) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { sz: 11 },
                    fill: { fgColor: { rgb: isEven ? "F8F4FC" : "FFFFFF" } },
                    border: thinBorder,
                    alignment: { vertical: "center", horizontal: C === 0 ? "left" : "center" }
                };
            }
        }
    }

    // Total row style in summary - bold green
    for (let C = 0; C < 5; C++) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: totalRowIndex });
        if (ws[cellRef]) {
            ws[cellRef].s = {
                font: { bold: true, sz: 13, color: { rgb: "155724" } },
                fill: { fgColor: { rgb: "C3E6CB" } },
                border: thinBorder,
                alignment: { vertical: "center", horizontal: C === 0 ? "left" : "center" }
            };
        }
    }

    // Rule info row style - red bold
    const ruleRef = XLSX.utils.encode_cell({ c: 0, r: ruleRowIndex });
    if (ws[ruleRef]) {
        ws[ruleRef].s = {
            font: { bold: true, sz: 11, color: { rgb: "CC0000" } }
        };
    }

    // Data table header style - darker purple
    for (let C = 0; C < exportHeaders.length; C++) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: dataHeaderRowIndex });
        if (ws[cellRef]) {
            ws[cellRef].s = {
                font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "5B3D8A" } },
                border: thinBorder,
                alignment: { vertical: "center", horizontal: "center" }
            };
        }
    }

    // Data rows - alternating colors + highlight wrong rows
    const dataRowStart = dataHeaderRowIndex + 1;
    const dataRowEnd = sheetData.length;
    for (let R = dataRowStart; R < dataRowEnd; R++) {
        const isWrongRow = wrongRowIndices.includes(R);
        const isEven = (R - dataRowStart) % 2 === 0;
        for (let C = 0; C < exportHeaders.length; C++) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            if (ws[cellRef]) {
                let bgColor;
                if (isWrongRow) {
                    bgColor = "FFCCCC"; // Red for wrong
                } else {
                    bgColor = isEven ? "F3EFFA" : "FFFFFF"; // Alternating lavender/white
                }
                ws[cellRef].s = {
                    font: { sz: 11, color: { rgb: isWrongRow ? "990000" : "1A1A2E" } },
                    fill: { fgColor: { rgb: bgColor } },
                    border: thinBorder,
                    alignment: { vertical: "center" }
                };
            }
        }
    }

    // ========== ROW HEIGHTS ==========
    const rowHeights = [];
    for (let R = 0; R < sheetData.length; R++) {
        let ht = 22; // default increased row height
        if (R === 0) ht = 32; // Title row
        else if (R === summaryHeaderRowIndex) ht = 28; // Summary header
        else if (R === totalRowIndex) ht = 28; // Total row
        else if (R === dataHeaderRowIndex) ht = 28; // Data header
        rowHeights.push({ hpt: ht });
    }
    ws['!rows'] = rowHeights;

    // ========== COLUMN WIDTHS ==========
    const maxCols = Math.max(...sheetData.map(r => r.length));
    const colWidths = [];
    for (let c = 0; c < maxCols; c++) {
        let maxWidth = 14;
        sheetData.forEach(row => {
            if (row[c]) {
                const cellLength = String(row[c]).length;
                if (cellLength > maxWidth) maxWidth = Math.min(cellLength + 3, 30);
            }
        });
        colWidths.push({ wch: maxWidth });
    }
    ws['!cols'] = colWidths;

    // ========== CREATE WORKBOOK AND EXPORT ==========
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sonuçlar');

    // Generate filename
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const fileName = `net_sonuclari_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
    showNotification(`${fileName} indirildi`, 'success');
}

// Initial render
renderTable();
