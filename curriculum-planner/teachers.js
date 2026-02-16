// State Management
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing...');
    init();
});

function init() {
    console.log('Init called');
    renderTeachers();
    setupEventListeners();
}

function setupEventListeners() {
    // Get DOM elements
    const teacherRowsContainer = document.getElementById('teacherRowsContainer');
    const nameInput = document.getElementById('tName');
    const classesInput = document.getElementById('tClasses');
    const addManualBtn = document.getElementById('addTeacherManual');
    const fileInput = document.getElementById('excelFile');
    const dropZone = document.getElementById('dropZone');

    console.log('Elements:', { nameInput, classesInput, addManualBtn });

    if (!addManualBtn) {
        console.error('Add button not found!');
        return;
    }

    console.log('Setting up event listeners...');

    // Manual add
    addManualBtn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Button clicked!');

        const name = nameInput.value.trim();
        // Collect all checked branches from checkboxes
        const branchCheckboxes = document.querySelectorAll('input[name="branch"]:checked');
        const branches = Array.from(branchCheckboxes).map(cb => cb.value);
        const branch = branches.join(', '); // Store as comma-separated string
        const classesStr = classesInput.value.trim();

        console.log('Values:', { name, branch, branches, classesStr });

        if (!name || branches.length === 0 || !classesStr) {
            alert('Lütfen tüm alanları doldurun.\nEn az bir branş seçin.\nFormat: 9A-5, 10B-3');
            return;
        }

        try {
            addTeacher(name, branch, classesStr);
            // Clear inputs
            nameInput.value = '';
            // Uncheck all branch checkboxes
            branchCheckboxes.forEach(cb => cb.checked = false);
            // Reset dropdown text
            const branchSelectedText = document.getElementById('branchSelectedText');
            if (branchSelectedText) {
                branchSelectedText.textContent = 'Branş seçin...';
                branchSelectedText.style.color = '#999';
            }
            classesInput.value = '';
        } catch (error) {
            console.error('Error adding teacher:', error);
            alert('Hata oluştu: ' + error.message);
        }
    });

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handleFile);
    }

    // Drag and Drop
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#0984e3';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#d1d8e0';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#d1d8e0';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        });
    }

    // Branch dropdown toggle
    const branchDropdownToggle = document.getElementById('branchDropdownToggle');
    const branchCheckboxesContainer = document.getElementById('branchCheckboxes');
    const branchDropdownIcon = document.getElementById('branchDropdownIcon');
    const branchSelectedText = document.getElementById('branchSelectedText');

    if (branchDropdownToggle) {
        branchDropdownToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isVisible = branchCheckboxesContainer.style.display === 'block';
            branchCheckboxesContainer.style.display = isVisible ? 'none' : 'block';
            branchDropdownIcon.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!branchDropdownToggle.contains(e.target) && !branchCheckboxesContainer.contains(e.target)) {
                branchCheckboxesContainer.style.display = 'none';
                branchDropdownIcon.className = 'fas fa-chevron-down';
            }
        });

        // Update selected text when checkboxes change
        const updateSelectedText = function () {
            const checked = document.querySelectorAll('input[name="branch"]:checked');
            if (checked.length === 0) {
                branchSelectedText.textContent = 'Branş seçin...';
                branchSelectedText.style.color = '#999';
            } else {
                const branches = Array.from(checked).map(cb => cb.value);
                branchSelectedText.textContent = branches.join(', ');
                branchSelectedText.style.color = '#333';
            }
        };

        // Add change listeners to all branch checkboxes
        document.querySelectorAll('.branch-checkbox').forEach(cb => {
            cb.addEventListener('change', updateSelectedText);
        });
    }
}

function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Process rows (skip header if present)
        jsonData.forEach((row, index) => {
            if (index === 0 && (row[0] && row[0].toString().toLowerCase().includes('ad'))) return;

            if (row[0] && row[1] && row[2]) {
                addTeacher(row[0].toString(), row[1].toString(), row[2].toString());
            }
        });
    };
    reader.readAsArrayBuffer(file);
}

function parseClassHours(classesStr) {
    const parts = classesStr.split(',').map(p => p.trim()).filter(p => p !== '');
    const classHours = [];

    parts.forEach(part => {
        // Try new format: Subject-Grade-Branch-Hours (e.g., MAT-12-A-6)
        // or Subject-Class-Hours (e.g., MAT-12A-6)
        const segments = part.split('-');

        if (segments.length === 4) {
            // MAT-12-A-6 -> Subject: MAT, Class: 12-A, Hours: 6
            classHours.push({
                subject: segments[0].trim(),
                className: `${segments[1].trim()}-${segments[2].trim()}`,
                hours: parseInt(segments[3])
            });
        } else if (segments.length === 3) {
            // MAT-12A-6 -> Subject: MAT, Class: 12A, Hours: 6
            // OR 12-A-6 (Old format with hyphenated class) -> Class: 12-A, Hours: 6
            const lastPart = parseInt(segments[2]);
            if (isNaN(parseInt(segments[0]))) {
                // First part is likely text (Subject), so MAT-12A-6
                classHours.push({
                    subject: segments[0].trim(),
                    className: segments[1].trim(),
                    hours: lastPart
                });
            } else {
                // First part is number (Grade), so 12-A-6
                classHours.push({
                    className: `${segments[0].trim()}-${segments[1].trim()}`,
                    hours: lastPart
                });
            }
        } else if (segments.length === 2) {
            // Old format: 12A-6
            classHours.push({
                className: segments[0].trim(),
                hours: parseInt(segments[1])
            });
        }
    });

    return classHours;
}

function addTeacher(name, branch, classesStr) {
    console.log('addTeacher called:', { name, branch, classesStr });

    const classHours = parseClassHours(classesStr);

    if (classHours.length === 0) {
        alert('Geçersiz format! Örnek: MAT-12-A-6, FİZ-10-B-4');
        return;
    }

    const totalHours = classHours.reduce((sum, ch) => sum + ch.hours, 0);

    teachers.push({
        id: Date.now() + Math.random(),
        name,
        branch,
        classHours: classHours,
        totalHours: totalHours
    });

    console.log('Teacher added, saving...');
    saveAndRender();
}

function removeTeacher(id) {
    teachers = teachers.filter(t => t.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    renderTeachers();
}

function renderTeachers() {
    const teacherRowsContainer = document.getElementById('teacherRowsContainer');
    if (!teacherRowsContainer) {
        console.error('Container not found!');
        return;
    }

    teacherRowsContainer.innerHTML = '';
    teachers.forEach((teacher, index) => {
        const tr = document.createElement('tr');
        tr.className = 'lesson-row';

        // Build class-hours display
        const classHoursHtml = teacher.classHours
            .map(ch => `<span class="class-tag">${ch.className} <strong>(${ch.hours}s)</strong></span>`)
            .join(' ');

        tr.innerHTML = `
            <td><div class="sequence-badge">${index + 1}</div></td>
            <td><strong>${teacher.name}</strong></td>
            <td><span class="badge blue">${teacher.branch}</span></td>
            <td>${classHoursHtml}</td>
            <td><span class="hour-badge">${teacher.totalHours}</span></td>
            <td>
                <button class="delete-btn" onclick="removeTeacher(${teacher.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        teacherRowsContainer.appendChild(tr);
    });
}

// Global function for inline onclick
window.removeTeacher = removeTeacher;
