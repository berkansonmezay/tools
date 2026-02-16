// State Management
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
const DAY_CODES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

// State configuration for each day
const STATE_CONFIG = {
    'full': { label: 'Tam Gün', class: 'state-full', icon: 'fa-check-circle', color: '#2196f3' },
    'morning': { label: 'Sabah', class: 'state-morning', icon: 'fa-sun', color: '#ff9800' },
    'afternoon': { label: 'Öğleden Sonra', class: 'state-afternoon', icon: 'fa-moon', color: '#3f51b5' },
    'off': { label: 'Boş', class: 'state-off', icon: 'fa-times-circle', color: '#9e9e9e' }
};

// Cycle order when clicking
const NEXT_STATE = {
    'full': 'morning',
    'morning': 'afternoon',
    'afternoon': 'off',
    'off': 'full'
};

// DOM Elements
const filtersContainer = document.getElementById('filtersContainer');
const maxLessonsPerDayInput = document.getElementById('maxLessonsPerDay');

// Load constraints
let maxLessonsPerDay = parseInt(localStorage.getItem('maxLessonsPerDay')) || 2;

// Initialize
function init() {
    // Load saved max lessons per day
    if (maxLessonsPerDayInput) {
        maxLessonsPerDayInput.value = maxLessonsPerDay;
        maxLessonsPerDayInput.addEventListener('change', () => {
            maxLessonsPerDay = parseInt(maxLessonsPerDayInput.value) || 2;
            localStorage.setItem('maxLessonsPerDay', maxLessonsPerDay);
        });
    }

    // Convert old format to new format
    teachers = teachers.map(t => {
        let newAvail = [];

        // Check if old boolean format or needs initialization
        if (!t.availability || typeof t.availability[0] === 'boolean') {
            // Default: Weekdays full, weekends off
            newAvail = ['full', 'full', 'full', 'full', 'full', 'off', 'off'];
        } else if (typeof t.availability[0] === 'string') {
            // Already in new format
            newAvail = t.availability;
        } else {
            newAvail = Array(7).fill('full');
        }

        return {
            ...t,
            availability: newAvail
        };
    });

    renderFilters();
}

function renderFilters() {
    if (teachers.length === 0) {
        filtersContainer.innerHTML = `
            <div class="filter-card" style="text-align: center; padding: 40px;">
                <i class="fas fa-info-circle" style="font-size: 2rem; color: #3498db; margin-bottom: 15px;"></i>
                <p>Henüz öğretmen eklenmemiş. Lütfen 2. adıma dönüp öğretmen ekleyin.</p>
            </div>
        `;
        return;
    }

    filtersContainer.innerHTML = '';
    teachers.forEach((teacher, tIndex) => {
        const card = document.createElement('div');
        card.className = 'filter-card';

        let daysHtml = '';
        DAY_CODES.forEach((day, dIndex) => {
            const stateKey = teacher.availability[dIndex];
            const state = STATE_CONFIG[stateKey];

            daysHtml += `
                <div class="day-option ${state.class}" onclick="cycleState(${tIndex}, ${dIndex})" title="Tıklayarak değiştirin">
                    <span class="day-name">${day}</span>
                    <i class="fas ${state.icon} status-icon"></i>
                    <span class="status-label">${state.label}</span>
                </div>
            `;
        });

        // Build class hours display
        const classHoursDisplay = teacher.classHours
            ? teacher.classHours.map(ch => `${ch.className}(${ch.hours}s)`).join(', ')
            : (teacher.classes ? teacher.classes.join(', ') : '');

        const totalHours = teacher.totalHours || teacher.hours || 0;

        card.innerHTML = `
            <div class="teacher-info-row">
                <div class="teacher-meta">
                    <div class="sequence-badge">${tIndex + 1}</div>
                    <div>
                        <strong style="display: block;">${teacher.name}</strong>
                        <span style="font-size: 0.8rem; color: #636e72;">${teacher.branch} | ${classHoursDisplay} | Toplam: ${totalHours} Saat</span>
                    </div>
                </div>
                <div class="legend-hint">
                    <i class="fas fa-mouse-pointer"></i> Günlere tıklayarak durumu değiştirin
                </div>
            </div>
            <div class="availability-grid">
                ${daysHtml}
            </div>
        `;
        filtersContainer.appendChild(card);
    });
}

// Cycle through states when clicking a day
window.cycleState = (tIndex, dIndex) => {
    const currentState = teachers[tIndex].availability[dIndex];
    const nextState = NEXT_STATE[currentState];
    teachers[tIndex].availability[dIndex] = nextState;
    saveState();
    renderFilters();
};

function saveState() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('maxLessonsPerDay', maxLessonsPerDay);

    // Also save teacher filters in a separate format for the schedule generator
    const teacherFilters = teachers.map(teacher => ({
        teacherId: teacher.id,
        teacherName: teacher.name,
        availability: teacher.availability.reduce((acc, state, dayIndex) => {
            acc[dayIndex] = state;
            return acc;
        }, {})
    }));

    localStorage.setItem('teacherFilters', JSON.stringify(teacherFilters));
}

document.getElementById('generateProgramBtn').addEventListener('click', () => {
    saveState(); // Make sure filters are saved
    window.location.href = 'schedule.html';
});

init();
