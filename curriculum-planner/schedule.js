// Constants
const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Branch abbreviations for Excel export
const BRANCH_ABBREVIATIONS = {
    "Matematik": "MAT",
    "Türkçe": "TRK",
    "Tarih": "TRH",
    "Coğrafya": "COG",
    "Din Kültürü": "DIN",
    "Felsefe": "FLS",
    "Geometri": "GEO",
    "Fizik": "FZK",
    "Kimya": "KMY",
    "Biyoloji": "BIO",
    "Edebiyat": "EDB",
    "İnkılap Tarihi": "INK",
    "İngilizce": "ING",
    "Fen Bilimleri": "FEN",
    "Psikoloji": "PSK",
    "Sosyoloji": "SOS",
    "Mantık": "MAN",
    "Seç. Felsefe": "SFEL",
    "Sosyal Bilgiler": "SOS",
    "Hayat Bilgisi": "HB",
    "Genel Kültür ve Genel Yetenek": "GK",
    "Vatandaşlık": "VAT",
    "Eğitim Bilimleri": "EB",
    "Matematik-2": "MAT2",
    "Arapça": "Arp",
    "Trafik": "TRF",
    "Fransızca": "FRS",
    "Almanca": "Alm",
    "Hadis": "HDS",
    "Tefsir": "TEF",
    "Peygamberimizin Hayatı": "PEYH",
    "Temel Dini Bilgiler": "TDB",
    "Akaid": "AKAİ",
    "Dinler Tarihi": "DİNT",
    "Fıkıh": "FIK",
    "Kelam": "KELA",
    "Siyer": "SİY",
    "Kuran-ı Kerim": "KK",
    "Mesleki Arapça": "MA",
    "İslam Kültür ve Medeniyeti": "İKM",
    "DKAP-AÖBT": "DKAP",
    "Teknoloji Tasarım": "TEK",
    "Seçmeli Yabancı Dil": "SDİL",
    "Seçmeli Arapça": "SARP",
    "Hitabet ve Mesleki Uygulama": "HMU",
    "Rehberlik": "REH",
    "Resim": "Res",
    "Beden Eğitimi": "BED",
    "MÜZİK": "MZK",
    "Müzik": "MZK",
    "BİLİŞİM TEKNOLOJİLERİ": "BT",
    "Bilişim": "BT",
    "SATRANÇ": "SAT",
    "Satranç": "SAT",
    "DRAMA": "DRM",
    "Drama": "DRM",
    "ROBOTİK KODLAMA": "RKOD",
    "BİLGİSAYAR": "BİL",
    "FEN LABARATUAR": "FL",
    "TEKNOLOJİ TASARIM": "TEKT",
    "DİKKAT": "DKKT",
    "GÖRSEL ALGI": "GRS",
    "Görsel Sanatlar": "GRS",
    "İNSAN HAKLARI YURTTAŞLIK VE DEMOKRASİ": "İHYD",
    "İnsan Hakları Yurttaşlık ve Demokrasi": "İHYD",
    "SPOR KULÜBÜ": "SPOR",
    "SINIF": "SNF",
    "Deneme": "DNM",
    "SINAVA HAZIRLIK": "SNVH",
    "Öğretim İlke ve Yöntemleri": "OGR",
    "Sınıf Yönetimi": "SIN",
    "Öğretim Teknolojileri ve Materyal Tasarımı": "MTS",
    "Program Geliştirme": "PRG",
    "Ölçme ve Değerlendirme": "OLC",
    "Öğrenme Psikolojisi": "OPS",
    "Gelişim Psikolojisi": "GLS",
    "Rehberlik ve Özel Eğitim": "REH",
    "Sayısal Yetenek": "SY",
    "KPSS-Matematik": "KMAT",
    "Kpss Matematik": "KMAT",
    "KPSS-Geometri": "KGEO",
    "Kpss Geometri": "KGEO",
    "KPSS-Türkçe": "KTRK",
    "Kpss Türkçe": "KTRK",
    "KPSS-Tarih": "KTRH",
    "KPSS-Coğrafya": "KCOĞ",
    "KPSS-Vatandaşlık": "KVAT",
    "ÖABT-Türkçe": "KTRK",
    "ÖABT-Matematik": "ÖMAT",
    "ÖABT-İlköğretim Matematik": "ÖMAT",
    "ÖABT-Fen Bilimleri": "ÖFEN",
    "ÖABT-Sosyal Bilgiler": "ÖSOS",
    "ÖABT-Türk Dili ve Edebiyatı": "ÖTDE",
    "ÖABT-Tarih": "ÖTRH",
    "ÖABT-Coğrafya": "COG",
    "ÖABT-Fizik": "ÖFZK",
    "ÖABT-Kimya": "ÖKMY",
    "ÖABT-Biyoloji": "ÖBİO",
    "ÖABT-İngilizce": "ÖING",
    "ÖABT-Rehberlik": "ÖREH",
    "ÖABT-Sınıf Öğretmenliği": "ÖSNO",
    "ÖABT-Okul Öncesi": "ÖOÖ",
    "ÖABT-Dîn Kültürü ve Ahlak Bilgisi": "ÖDİN",
    "ÖABT-İmam-Hatip Lisesi Meslek Dersleri": "ÖİHM",
    "ÖABT-Beden Eğitimi": "ÖBDN"
};

// Global state
let schedule = {}; // { dayIndex: { timeSlotId: { className: teacherName } } }
let teacherSchedule = {}; // { teacherId: { dayIndex: { timeSlotId: className } } }
let classSchedule = {}; // { className: { dayIndex: { timeSlotId: teacherName } } }
let daysData = [];
let teachers = [];
let teacherFilters = [];
let currentDayView = 0;
let currentTeacherView = null;
let maxLessonsPerDay = 2; // Default value
let unassignedLessons = []; // Track unassigned lessons

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    generateSchedule();
    updateStats();
    renderDaySelector();
    renderTeacherSelector();
    renderClassSelector();
    renderDayView(0);
    setupEventListeners();
});

function setupEventListeners() {
    // View tabs
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const view = tab.dataset.view;
            document.getElementById(view + 'View').classList.add('active');

            // Trigger specific render functions
            if (view === 'weekly') {
                renderWeeklyView();
            } else if (view === 'day') {
                renderDayView(currentDayView || 0);
            }
        });
    });

    // Export buttons
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);

    // Teacher selector
    document.getElementById('teacherSelect').addEventListener('change', (e) => {
        const teacherId = e.target.value;
        if (teacherId) {
            currentTeacherView = teacherId;
            renderTeacherView(teacherId);
        }
    });

    // Class selector
    document.getElementById('classSelect').addEventListener('change', (e) => {
        const className = e.target.value;
        if (className) {
            renderClassView(className);
        }
    });
}

function loadData() {
    console.log('=== Loading Data ===');

    // Load time slots from Step 1
    const storedDaysData = localStorage.getItem('daysData');
    if (storedDaysData) {
        try {
            daysData = JSON.parse(storedDaysData);
            console.log('Loaded daysData:', daysData);
        } catch (e) {
            console.error('Error parsing daysData:', e);
            daysData = Array.from({ length: 7 }, () => []);
        }
    } else {
        console.warn('No daysData found in localStorage');
        daysData = Array.from({ length: 7 }, () => []);
    }

    // Load teachers from Step 2
    const storedTeachers = localStorage.getItem('teachers');
    if (storedTeachers) {
        try {
            teachers = JSON.parse(storedTeachers);
            console.log('Loaded teachers:', teachers);
        } catch (e) {
            console.error('Error parsing teachers:', e);
            teachers = [];
        }
    } else {
        console.warn('No teachers found in localStorage');
        teachers = [];
    }

    // Load filters from Step 3
    const storedFilters = localStorage.getItem('teacherFilters');
    if (storedFilters) {
        try {
            teacherFilters = JSON.parse(storedFilters);
            console.log('Loaded teacherFilters:', teacherFilters);
        } catch (e) {
            console.error('Error parsing teacherFilters:', e);
            teacherFilters = [];
        }
    } else {
        // Fallback: extract from teachers object
        console.log('No teacherFilters found, extracting from teachers');
        teacherFilters = teachers.map(teacher => ({
            teacherId: teacher.id,
            teacherName: teacher.name,
            availability: teacher.availability ?
                teacher.availability.reduce((acc, state, dayIndex) => {
                    acc[dayIndex] = state;
                    return acc;
                }, {}) :
                { 0: 'full', 1: 'full', 2: 'full', 3: 'full', 4: 'full', 5: 'full', 6: 'full' }
        }));
        console.log('Created teacherFilters from teachers:', teacherFilters);
    }

    // Load max lessons per day constraint
    const storedMaxLessons = localStorage.getItem('maxLessonsPerDay');
    if (storedMaxLessons) {
        maxLessonsPerDay = parseInt(storedMaxLessons);
    }
    console.log('Max lessons per day per branch:', maxLessonsPerDay);
}

function generateSchedule() {
    loadData(); // Reload data to ensure we have the latest from Step 1 & 2
    console.log('\n=== Starting Schedule Generation ===');

    // Initialize empty schedules
    schedule = {};
    teacherSchedule = {};
    classSchedule = {};
    unassignedLessons = []; // Reset unassigned lessons

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        schedule[dayIndex] = {};
        const daySlots = daysData[dayIndex] || [];
        console.log(`Day ${dayIndex} (${DAY_NAMES[dayIndex]}): ${daySlots.length} time slots`);
        daySlots.forEach(slot => {
            schedule[dayIndex][slot.id] = {};
        });
    }

    teachers.forEach(teacher => {
        teacherSchedule[teacher.id] = {};
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            teacherSchedule[teacher.id][dayIndex] = {};
        }
    });

    // Collect all unique classes
    const allClasses = new Set();
    teachers.forEach(teacher => {
        if (teacher.classHours) {
            teacher.classHours.forEach(ch => {
                allClasses.add(ch.className);
            });
        }
    });

    allClasses.forEach(className => {
        classSchedule[className] = {};
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            classSchedule[className][dayIndex] = {};
        }
    });

    // NEW ALGORITHM: Process each teacher and distribute their lessons evenly
    console.log('\n=== Starting Lesson Assignment ===');
    teachers.forEach(teacher => {
        console.log(`\nProcessing teacher: ${teacher.name} (${teacher.branch})`);
        if (!teacher.classHours || teacher.classHours.length === 0) {
            console.warn(`  Teacher ${teacher.name} has no classHours!`);
            return;
        }

        teacher.classHours.forEach(classHour => {
            console.log(`  Assigning ${classHour.hours} hours for class ${classHour.className} (Subject: ${classHour.subject || 'All'})`);
            assignLessonsForClassImproved(teacher, classHour.className, classHour.hours, classHour.subject);
        });
    });

    console.log('\n=== Schedule Generation Complete ===');
    console.log('Final schedule:', schedule);
    console.log('Final teacher schedule:', teacherSchedule);

    // Save schedule to localStorage
    localStorage.setItem('generatedSchedule', JSON.stringify(schedule));
    localStorage.setItem('teacherSchedule', JSON.stringify(teacherSchedule));
}

function assignLessonsForClassImproved(teacher, className, totalHours, subject) {
    console.log(`Debug: daysData length: ${daysData.length}, Day 0 slots: ${daysData[0] ? daysData[0].length : 'undefined'}`);
    let assignedHours = 0;
    const teacherFilter = teacherFilters.find(f => f.teacherId == teacher.id);

    console.log(`    Teacher filter:`, teacherFilter);

    // Get available days for this teacher
    const availableDays = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const availability = getTeacherAvailability(teacherFilter, dayIndex);
        if (availability !== 'off') {
            availableDays.push({ dayIndex, availability });
        }
    }

    console.log(`    Available days: ${availableDays.length}`);

    if (availableDays.length === 0) {
        console.error(`    ✗ Teacher ${teacher.name} has no available days!`);
        return;
    }

    // Try to distribute lessons evenly across available days
    const lessonsPerDay = Math.ceil(totalHours / availableDays.length);
    console.log(`    Target: ~${lessonsPerDay} lessons per day`);

    // Track lessons assigned per day to ensure even distribution
    const assignedPerDay = {};
    availableDays.forEach(day => assignedPerDay[day.dayIndex] = 0);

    // Attempt to assign lessons
    let attempts = 0;
    const maxAttempts = totalHours * 10; // More generous attempt limit

    while (assignedHours < totalHours && attempts < maxAttempts) {
        attempts++;
        let assigned = false;

        // Try each available day
        for (let { dayIndex, availability } of availableDays) {
            if (assignedHours >= totalHours) break;

            // Skip if this day already has enough lessons for even distribution
            if (assignedPerDay[dayIndex] >= lessonsPerDay && assignedHours < totalHours - availableDays.length + 1) {
                continue;
            }

            const daySlots = daysData[dayIndex] || [];

            // Try each slot in this day
            console.log(`    Checking ${daySlots.length} slots for Day ${dayIndex}`);
            for (let slot of daySlots) {
                if (assignedHours >= totalHours) break;

                // Validate all constraints
                if (!canAssignLesson(teacher, className, dayIndex, slot, availability, subject)) {
                    // console.log(`Skipping slot ${slot.startTime} for ${teacher.name}`);
                    continue;
                }

                // Assign the lesson
                // Store object to capture subject info in ALL structures
                const scheduleValue = { teacher: teacher.name, subject };
                schedule[dayIndex][slot.id][className] = scheduleValue;
                teacherSchedule[teacher.id][dayIndex][slot.id] = { className, subject };
                classSchedule[className][dayIndex][slot.id] = scheduleValue;

                assignedHours++;
                assignedPerDay[dayIndex]++;
                assigned = true;

                console.log(`      ✓ Assigned to ${DAY_NAMES[dayIndex]} ${slot.startTime}-${slot.endTime} (${assignedHours}/${totalHours})`);
                break; // Move to next day for better distribution
            }
        }

        // If we couldn't assign any lesson in this iteration, break
        if (!assigned) {
            console.warn(`    ⚠ Could not assign all hours for ${teacher.name} - ${className}. Assigned ${assignedHours}/${totalHours}`);
            break;
        }
    }

    if (attempts >= maxAttempts) {
        console.error(`    ✗ Max attempts reached for ${teacher.name} - ${className}`);
    }

    console.log(`    Final distribution:`, assignedPerDay);

    if (assignedHours < totalHours) {
        const remainingHours = totalHours - assignedHours;
        unassignedLessons.push({
            branch: teacher.branch,
            teacher: teacher.name,
            className: className,
            hours: remainingHours
        });
        console.warn(`    Added to unassigned list: ${teacher.name}, ${remainingHours} hours`);
    }
}

function canAssignLesson(teacher, className, dayIndex, slot, availability, subject) {
    // 1. Check if teacher is already teaching at this time
    if (teacherSchedule[teacher.id][dayIndex][slot.id]) {
        console.log(`      ✗ Teacher ${teacher.name} already teaching at ${DAY_NAMES[dayIndex]} ${slot.startTime}`);
        return false;
    }

    // 2. Check if class already has a lesson at this time
    if (classSchedule[className] && classSchedule[className][dayIndex][slot.id]) {
        console.log(`      ✗ Class ${className} already has lesson at ${DAY_NAMES[dayIndex]} ${slot.startTime}`);
        return false;
    }

    // 3. Check teacher availability (morning/afternoon)
    if (availability === 'morning') {
        const hour = parseInt(slot.startTime.split(':')[0]);
        if (hour >= 12) {
            console.log(`      ✗ Teacher ${teacher.name} only available in morning, slot is ${slot.startTime}`);
            return false;
        }
    }

    if (availability === 'afternoon') {
        const hour = parseInt(slot.startTime.split(':')[0]);
        if (hour < 12) {
            console.log(`      ✗ Teacher ${teacher.name} only available in afternoon, slot is ${slot.startTime}`);
            return false;
        }
    }

    // 4. Check branch lesson limit for this day
    const branchToCheck = subject || teacher.branch;
    const branchLessonsToday = countBranchLessonsOnDay(branchToCheck, className, dayIndex);
    if (branchLessonsToday >= maxLessonsPerDay) {
        console.log(`      ✗ Branch ${branchToCheck} already has ${branchLessonsToday} lessons for class ${className} on ${DAY_NAMES[dayIndex]} (limit: ${maxLessonsPerDay})`);
        return false;
    }

    return true;
}

function countBranchLessonsOnDay(targetBranchStr, className, dayIndex) {
    let count = 0;
    // Check local classSchedule first as it's faster and more direct
    if (!classSchedule[className]) return 0;

    const classDaySchedule = classSchedule[className][dayIndex];

    if (classDaySchedule) {
        // Parse target branches (the teacher we are checking)
        const targetBranches = targetBranchStr.split(',').map(b => b.trim());

        Object.values(classDaySchedule).forEach(val => {
            const teacherName = (typeof val === 'object' && val !== null) ? val.teacher : val;
            const existingTeacher = teachers.find(t => t.name === teacherName);
            if (existingTeacher && existingTeacher.branch) {
                // Parse existing teacher's branches
                const existingBranches = existingTeacher.branch.split(',').map(b => b.trim());

                // Check for intersection: if they share ANY branch, it counts as a collision/load
                const hasOverlap = targetBranches.some(tb => existingBranches.includes(tb));

                if (hasOverlap) {
                    count++;
                }
            }
        });
    }

    return count;
}

function getTeacherAvailability(teacherFilter, dayIndex) {
    if (!teacherFilter || !teacherFilter.availability) {
        return 'full';
    }
    const avail = teacherFilter.availability[dayIndex];
    return avail || 'full';
}

function updateStats() {
    const totalTeachers = teachers.length;
    const uniqueClasses = new Set();
    let totalLessons = 0;

    teachers.forEach(teacher => {
        if (teacher.classHours) {
            teacher.classHours.forEach(ch => {
                uniqueClasses.add(ch.className);
                totalLessons += ch.hours;
            });
        }
    });

    let assignedLessons = 0;
    Object.values(schedule).forEach(daySchedule => {
        Object.values(daySchedule).forEach(slotSchedule => {
            assignedLessons += Object.keys(slotSchedule).length;
        });
    });

    document.getElementById('totalTeachers').textContent = totalTeachers;
    document.getElementById('totalClasses').textContent = uniqueClasses.size;
    document.getElementById('totalLessons').textContent = totalLessons;
    document.getElementById('assignedLessons').textContent = assignedLessons;

    // Show warnings if not all lessons assigned
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';

    if (assignedLessons < totalLessons) {
        const alert = document.createElement('div');
        alert.className = 'alert-warning';
        alert.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Uyarı: ${totalLessons - assignedLessons} ders saati atanamadı. Öğretmen kısıtlamalarını veya zaman planını gözden geçirin.`;

        if (unassignedLessons.length > 0) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'action-btn red small';
            exportBtn.style.marginTop = '10px';
            exportBtn.style.marginLeft = '10px';
            // Explicitly set colors to ensure visibility
            exportBtn.style.backgroundColor = '#dc3545';
            exportBtn.style.color = '#ffffff';
            exportBtn.style.border = 'none';
            exportBtn.style.padding = '5px 10px';
            exportBtn.style.cursor = 'pointer';

            exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Atanamayanları İndir';
            exportBtn.onclick = exportUnassignedLessonsPDF;
            alert.appendChild(exportBtn);
        }

        alertContainer.appendChild(alert);
    } else if (assignedLessons > 0) {
        const alert = document.createElement('div');
        alert.className = 'alert-info';
        alert.innerHTML = `<i class="fas fa-check-circle"></i> Tüm dersler başarıyla atandı!`;
        alertContainer.appendChild(alert);
    }
}

function renderDaySelector() {
    const container = document.getElementById('daySelector');
    container.innerHTML = '';

    DAY_NAMES.forEach((dayName, index) => {
        const btn = document.createElement('button');
        btn.className = 'day-btn' + (index === 0 ? ' active' : '');
        btn.textContent = dayName;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDayView(index);
        });
        container.appendChild(btn);
    });
}

function renderTeacherSelector() {
    const select = document.getElementById('teacherSelect');
    select.innerHTML = '<option value="">Öğretmen Seçin</option>';

    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (${teacher.branch})`;
        select.appendChild(option);
    });
}

function renderClassSelector() {
    const select = document.getElementById('classSelect');
    select.innerHTML = '<option value="">Sınıf Seçin</option>';

    // Collect all unique classes
    const allClasses = new Set();
    teachers.forEach(teacher => {
        if (teacher.classHours) {
            teacher.classHours.forEach(ch => {
                allClasses.add(ch.className);
            });
        }
    });

    // Sort classes alphabetically
    const sortedClasses = Array.from(allClasses).sort();

    sortedClasses.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = formatClassNameForExcel(className);
        select.appendChild(option);
    });
}

function renderDayView(dayIndex) {
    currentDayView = dayIndex;
    const tbody = document.getElementById('dayScheduleBody');
    tbody.innerHTML = '';

    const daySlots = daysData[dayIndex] || [];
    const daySchedule = schedule[dayIndex] || {};

    if (daySlots.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="2" class="empty-cell">Bu gün için zaman planı tanımlanmamış</td>';
        tbody.appendChild(tr);
        return;
    }

    daySlots.forEach(slot => {
        const tr = document.createElement('tr');
        const slotSchedule = daySchedule[slot.id] || {};

        const timeCell = document.createElement('td');
        timeCell.className = 'time-column';
        timeCell.textContent = `${slot.startTime} - ${slot.endTime}`;

        const lessonsCell = document.createElement('td');
        const lessons = Object.entries(slotSchedule);

        if (lessons.length === 0) {
            lessonsCell.innerHTML = '<span class="empty-cell">Boş</span>';
        } else {
            lessons.forEach(([className, val]) => {
                const teacherName = (typeof val === 'object' && val !== null) ? val.teacher : val;
                const subject = (typeof val === 'object' && val !== null) ? val.subject : null;

                // Find the teacher to get their branch
                const teacher = teachers.find(t => t.name === teacherName);
                const lessonDiv = document.createElement('div');
                lessonDiv.className = 'lesson-cell';
                if (teacher && teacher.branch) {
                    const lessonAbbr = subject ? getSubjectAbbr(subject) : getLessonLabel(teacher, className);
                    lessonDiv.innerHTML = `
                        <span class="class-name">${formatClassNameForExcel(className)}</span>
                        <span class="teacher-name">${teacherName}</span>
                        <div style="font-size:0.7rem; color:#666;">${lessonAbbr}</div>
                    `;
                } else {
                    lessonDiv.innerHTML = `
                        <span class="class-name">${formatClassNameForExcel(className)}</span>
                        <span class="teacher-name">${teacherName}</span>
                    `;
                }
                lessonsCell.appendChild(lessonDiv);
            });
        }

        tr.appendChild(timeCell);
        tr.appendChild(lessonsCell);
        tbody.appendChild(tr);
    });
}

function renderTeacherView(teacherId) {
    console.log('Rendering teacher view for:', teacherId);
    const tbody = document.getElementById('teacherScheduleBody');
    tbody.innerHTML = '';

    const teacher = teachers.find(t => t.id == teacherId);
    if (!teacher) {
        console.error('Teacher not found:', teacherId);
        return;
    }

    console.log('Teacher:', teacher);
    const tSchedule = teacherSchedule[teacherId] || {};
    console.log('Teacher schedule:', tSchedule);

    // Collect all unique time slots across all days
    const timeSlotMap = new Map();

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = daysData[dayIndex] || [];
        daySlots.forEach(slot => {
            const key = `${slot.startTime}-${slot.endTime}`;
            if (!timeSlotMap.has(key)) {
                timeSlotMap.set(key, {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    slots: {}
                });
            }
            timeSlotMap.get(key).slots[dayIndex] = slot.id;
        });
    }

    // Convert to array and sort by start time
    const sortedTimeSlots = Array.from(timeSlotMap.values()).sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
    });

    console.log('Sorted time slots:', sortedTimeSlots);

    if (sortedTimeSlots.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="8" class="empty-cell">Zaman planı tanımlanmamış</td>';
        tbody.appendChild(tr);
        return;
    }

    sortedTimeSlots.forEach(timeSlot => {
        const tr = document.createElement('tr');

        // Time column
        const timeCell = document.createElement('td');
        timeCell.className = 'time-column';
        timeCell.textContent = `${timeSlot.startTime} - ${timeSlot.endTime}`;
        tr.appendChild(timeCell);

        // Day columns (0-6 for Mon-Sun)
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const td = document.createElement('td');
            const slotId = timeSlot.slots[dayIndex];

            if (!slotId) {
                td.innerHTML = '<span class="empty-cell">-</span>';
            } else {
                const slotData = tSchedule[dayIndex] && tSchedule[dayIndex][slotId];
                let className, subject;
                if (typeof slotData === 'object' && slotData !== null) {
                    className = slotData.className;
                    subject = slotData.subject;
                } else {
                    className = slotData;
                }

                if (className) {
                    const lessonAbbr = subject ? getSubjectAbbr(subject) : getLessonLabel(teacher, className);
                    const lessonDiv = document.createElement('div');
                    lessonDiv.className = 'lesson-cell';
                    lessonDiv.innerHTML = `
                        <div style="font-size:0.7rem; color:#666;">${lessonAbbr}</div>
                        <span class="class-name">${formatClassNameForExcel(className)}</span>
                    `;
                    td.appendChild(lessonDiv);
                } else {
                    td.innerHTML = '<span class="empty-cell">Boş</span>';
                }
            }

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });

    console.log('Teacher view rendered');
}

function renderClassView(className) {
    console.log('Rendering class view for:', className);
    const tbody = document.getElementById('classScheduleBody');
    tbody.innerHTML = '';

    const cSchedule = classSchedule[className] || {};
    console.log('Class schedule:', cSchedule);

    // Collect all unique time slots across all days
    const timeSlotMap = new Map();

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = daysData[dayIndex] || [];
        daySlots.forEach(slot => {
            const key = `${slot.startTime}-${slot.endTime}`;
            if (!timeSlotMap.has(key)) {
                timeSlotMap.set(key, {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    slots: {}
                });
            }
            timeSlotMap.get(key).slots[dayIndex] = slot.id;
        });
    }

    // Convert to array and sort by start time
    const sortedTimeSlots = Array.from(timeSlotMap.values()).sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
    });

    console.log('Sorted time slots:', sortedTimeSlots);

    if (sortedTimeSlots.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="8" class="empty-cell">Zaman planı tanımlanmamış</td>';
        tbody.appendChild(tr);
        return;
    }

    sortedTimeSlots.forEach(timeSlot => {
        const tr = document.createElement('tr');

        // Time column
        const timeCell = document.createElement('td');
        timeCell.className = 'time-column';
        timeCell.textContent = `${timeSlot.startTime} - ${timeSlot.endTime}`;
        tr.appendChild(timeCell);

        // Day columns (0-6 for Mon-Sun)
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const td = document.createElement('td');
            const slotId = timeSlot.slots[dayIndex];

            if (!slotId) {
                td.innerHTML = '<span class="empty-cell">-</span>';
            } else {
                const val = cSchedule[dayIndex] && cSchedule[dayIndex][slotId];
                const teacherName = (typeof val === 'object' && val !== null) ? val.teacher : val;
                const subject = (typeof val === 'object' && val !== null) ? val.subject : null;

                if (teacherName) {
                    // Find the teacher to get their branch
                    const teacher = teachers.find(t => t.name === teacherName);
                    const lessonDiv = document.createElement('div');
                    lessonDiv.className = 'lesson-cell';
                    if (teacher && teacher.branch) {
                        const lessonAbbr = subject ? getSubjectAbbr(subject) : getLessonLabel(teacher);
                        lessonDiv.innerHTML = `
                            <span class="class-name">${teacherName}</span>
                            <div style="font-size:0.7rem; color:#666;">${lessonAbbr}</div>
                        `;
                    } else {
                        lessonDiv.innerHTML = `<span class="class-name">${teacherName}</span>`;
                    }
                    td.appendChild(lessonDiv);
                } else {
                    td.innerHTML = '<span class="empty-cell">Boş</span>';
                }
            }

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });

    console.log('Class view rendered');
}

// Helper function to format class name for Excel (add hyphen between number and letter)
function formatClassNameForExcel(className) {
    if (!className) return '';
    // Match pattern like "12A" and convert to "12-A"
    return className.replace(/^(\d+)([A-Z])$/i, '$1-$2');
}

function exportToExcel() {
    const workbook = XLSX.utils.book_new();

    // 1. Export Day Sheets (Removed as per request)
    // The user wants only the Weekly Teacher Summary sheet.

    /* Loop removed
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
       // ...
    }
    */

    // 2. Export Weekly Summary (Teacher-based view)
    exportWeeklyTeacherSheet(workbook);

    XLSX.writeFile(workbook, 'Ders_Programi.xlsx');

}

function exportDaySheet(workbook, dayIndex) {
    const dayName = DAY_NAMES[dayIndex];
    const daySlots = daysData[dayIndex];

    // Collect all classes (sorted)
    const allClasses = new Set();
    teachers.forEach(teacher => {
        if (teacher.classHours) {
            teacher.classHours.forEach(ch => allClasses.add(ch.className));
        }
    });
    const sortedClasses = Array.from(allClasses).sort();

    const excelData = [];

    // Header Row: 'Sınıf' | Time Slot 1 | Time Slot 2 ...
    const headerRow = ['Sınıf'];
    daySlots.forEach(slot => {
        headerRow.push(`${slot.startTime}-${slot.endTime}`);
    });
    excelData.push(headerRow);

    // Data Rows: Class Name | Lesson | Lesson ...
    sortedClasses.forEach(className => {
        const row = [formatClassNameForExcel(className)];
        const classDaySchedule = classSchedule[className] ? classSchedule[className][dayIndex] : {};

        daySlots.forEach(slot => {
            const teacherName = classDaySchedule[slot.id];
            if (teacherName) {
                const teacher = teachers.find(t => t.name === teacherName);
                const branchAbbr = teacher ? (BRANCH_ABBREVIATIONS[teacher.branch] || teacher.branch) : '';
                row.push(`${branchAbbr} - ${teacherName}`);
            } else {
                row.push('');
            }
        });
        excelData.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    const colWidths = [{ wch: 10 }]; // Class column
    daySlots.forEach(() => colWidths.push({ wch: 12 }));
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, dayName);
}

function exportWeeklyTeacherSheet(workbook) {
    // Create single sheet with all teachers
    const excelData = [];

    // Collect all unique time slots across all days
    const allTimeSlots = [];
    const timeSlotsPerDay = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = daysData[dayIndex] || [];
        timeSlotsPerDay[dayIndex] = daySlots;
        daySlots.forEach(slot => {
            if (!allTimeSlots.find(s => s.startTime === slot.startTime && s.endTime === slot.endTime)) {
                allTimeSlots.push({
                    startTime: slot.startTime,
                    endTime: slot.endTime
                });
            }
        });
    }

    // Sort time slots
    allTimeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Build header rows
    // Row 1: Day names (merged cells)
    const dayHeaderRow = [''];
    const timeSlotNumberRow = [''];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = timeSlotsPerDay[dayIndex] || [];
        if (daySlots.length > 0) {
            dayHeaderRow.push(DAY_NAMES[dayIndex]);
            // Add empty cells for remaining time slots in this day
            for (let i = 1; i < daySlots.length; i++) {
                dayHeaderRow.push('');
            }

            // Add time slot numbers
            for (let i = 0; i < daySlots.length; i++) {
                timeSlotNumberRow.push(i + 1);
            }
        }
    }

    excelData.push(dayHeaderRow);
    excelData.push(timeSlotNumberRow);

    // Add each teacher (2 rows per teacher)
    // Add each teacher (2 rows per teacher)
    teachers.forEach(teacher => {
        const tSchedule = teacherSchedule[teacher.id] || {};

        // Use a generic fallback if needed, but we will try to be specific per cell
        // Helper to get formatted branch string
        const getBranchText = (className) => {
            if (!className) return '';
            return getLessonLabel(teacher, className);
        };

        // Row 1: Teacher name + branch abbreviations (dynamic per slot!)
        const branchRow = [teacher.name];
        // Row 2: Empty + class names
        const classRow = [''];

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const daySlots = timeSlotsPerDay[dayIndex] || [];

            daySlots.forEach(slot => {
                const slotData = tSchedule[dayIndex] && tSchedule[dayIndex][slot.id];
                let className, subject;
                if (typeof slotData === 'object' && slotData !== null) {
                    className = slotData.className;
                    subject = slotData.subject;
                } else {
                    className = slotData;
                }

                if (className) {
                    const branchText = subject ? getSubjectAbbr(subject) : getBranchText(className);
                    branchRow.push(branchText);
                    classRow.push(formatClassNameForExcel(className));
                } else {
                    branchRow.push('');
                    classRow.push('');
                }
            });
        }

        excelData.push(branchRow);
        excelData.push(classRow);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Merge cells for day headers
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    let colIndex = 1;
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = timeSlotsPerDay[dayIndex] || [];
        if (daySlots.length > 0) {
            worksheet['!merges'].push({
                s: { r: 0, c: colIndex },
                e: { r: 0, c: colIndex + daySlots.length - 1 }
            });
            colIndex += daySlots.length;
        }
    }

    // Set column widths
    const colWidths = [{ wch: 20 }]; // Teacher name column
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = timeSlotsPerDay[dayIndex] || [];
        for (let i = 0; i < daySlots.length; i++) {
            colWidths.push({ wch: 8 });
        }
    }
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tüm Öğretmenler');
}

function getLessonLabel(teacher, className) {
    // 1. Try to find specific subject from classHours
    if (teacher.classHours) {
        // Find all classHours for this class
        const matches = teacher.classHours.filter(ch => ch.className === className);
        // If we have matches and they have subjects
        if (matches.length > 0) {
            const subjects = matches.map(ch => ch.subject).filter(s => s);
            if (subjects.length > 0) {
                // Return unique subjects abbreviated
                const uniqueSubjects = [...new Set(subjects)];
                return uniqueSubjects.map(s => getSubjectAbbr(s)).join(', ');
            }
        }
    }

    // 2. Fallback to teacher branch
    if (!teacher.branch) return '';

    // Split by comma and abbreviate each
    return teacher.branch.split(',')
        .map(b => getSubjectAbbr(b.trim()))
        .join(', ');
}

function getSubjectAbbr(name) {
    if (!name) return '';
    // Check exact match
    if (BRANCH_ABBREVIATIONS[name]) return BRANCH_ABBREVIATIONS[name];

    // Check case-insensitive
    const nameLower = name.toLowerCase();
    const entry = Object.entries(BRANCH_ABBREVIATIONS).find(([k, v]) => k.toLowerCase() === nameLower);
    if (entry) return entry[1];

    // Check if it's already an abbreviation (length <= 4 and uppercase)
    if (name.length <= 4) return name.toUpperCase();

    return name; // Return original if no abbreviation found
}

function renderWeeklyView(targetThead, targetTbody) {
    const thead = targetThead || document.getElementById('weeklyScheduleHead');
    const tbody = targetTbody || document.getElementById('weeklyScheduleBody');
    if (!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Collect all unique time slots across all days
    const allTimeSlots = [];
    const timeSlotsPerDay = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = daysData[dayIndex] || [];
        timeSlotsPerDay[dayIndex] = daySlots;
        daySlots.forEach(slot => {
            if (!allTimeSlots.find(s => s.startTime === slot.startTime && s.endTime === slot.endTime)) {
                allTimeSlots.push({
                    startTime: slot.startTime,
                    endTime: slot.endTime
                });
            }
        });
    }

    // Sort time slots
    allTimeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // 1. Header Row 1: Day names (Merged)
    const trHead1 = document.createElement('tr');
    trHead1.innerHTML = '<th rowspan="2" style="position: sticky; left: 0; z-index: 2; background: #f8f9fa; border: 1px solid #ddd; padding: 10px;">Öğretmen</th>';

    DAY_NAMES.forEach((day, index) => {
        const slotsCount = timeSlotsPerDay[index].length;
        if (slotsCount > 0) {
            const th = document.createElement('th');
            th.colSpan = slotsCount;
            th.textContent = day;
            th.style.textAlign = 'center';
            th.style.border = '1px solid #ddd';
            th.style.padding = '8px';
            th.style.background = '#6c5ce7'; // Primary purple
            th.style.color = 'white';
            trHead1.appendChild(th);
        }
    });
    thead.appendChild(trHead1);

    // 2. Header Row 2: Time Slots
    const trHead2 = document.createElement('tr');
    DAY_NAMES.forEach((day, index) => {
        const daySlots = timeSlotsPerDay[index];
        daySlots.forEach(slot => {
            const th = document.createElement('th');
            th.className = 'time-column';
            th.style.fontSize = '0.75rem';
            th.style.padding = '4px 2px';
            th.style.border = '1px solid #ddd';
            th.style.minWidth = '40px';
            th.style.textAlign = 'center';
            th.textContent = slot.startTime;
            trHead2.appendChild(th);
        });
    });
    thead.appendChild(trHead2);

    // 3. Body: Teacher Rows
    teachers.forEach(teacher => {
        const tr = document.createElement('tr');

        // Teacher Name Cell
        const tdName = document.createElement('td');
        tdName.style.position = 'sticky';
        tdName.style.left = '0';
        tdName.style.background = '#fff';
        tdName.style.zIndex = '1';
        tdName.style.fontWeight = '600';
        tdName.style.border = '1px solid #ddd';
        tdName.style.padding = '8px';
        const branchAbbr = getLessonLabel(teacher); // Use helper to get formatted branch string
        tdName.innerHTML = `${teacher.name}<br><span style="font-size:0.75rem;color:#666">${branchAbbr}</span>`;
        tr.appendChild(tdName);

        // Slots
        const tSchedule = teacherSchedule[teacher.id] || {};

        DAY_NAMES.forEach((day, dayIndex) => {
            const daySlots = timeSlotsPerDay[dayIndex];
            daySlots.forEach(slot => {
                const td = document.createElement('td');
                td.style.border = '1px solid #eee';
                td.style.textAlign = 'center';

                const slotData = tSchedule[dayIndex] && tSchedule[dayIndex][slot.id];
                let className, subject;
                if (typeof slotData === 'object' && slotData !== null) {
                    className = slotData.className;
                    subject = slotData.subject;
                } else {
                    className = slotData;
                }

                if (className) {
                    const lessonAbbr = subject ? getSubjectAbbr(subject) : getLessonLabel(teacher, className);
                    const bgCol = getClassColor(className);
                    td.innerHTML = `
                        <div style="font-size:0.7em; font-weight:600; color:#555;">${lessonAbbr}</div>
                        <span style="font-weight:700; color:#333; font-size:0.85rem; white-space: nowrap;">${formatClassNameForExcel(className)}</span>
                    `;
                    td.style.background = bgCol;
                } else {
                    td.innerHTML = '<span style="color:#eee">-</span>';
                }
                tr.appendChild(td);
            });
        });
        tbody.appendChild(tr);
    });
}

function exportToPDF_Old() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edip sayfayı yenileyin.');
        return;
    }

    const { jsPDF } = window.jspdf;

    // Use A0 Landscape for maximum width (Teacher Sheet is very wide)
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a0'
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Haftalık Ders Programı (Öğretmen Çarşaf Liste)', 15, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Prepare data for AutoTable

    // 1. Headers
    const headerRow1 = [{ content: 'Öğretmen', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontStyle: 'bold' } }];
    const headerRow2 = [];

    // Calculate columns
    let totalSlots = 0;
    const timeSlotsPerDay = [];

    // Collect time slots again (consistent with other exports)
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = daysData[dayIndex] || [];
        timeSlotsPerDay[dayIndex] = daySlots;

        if (daySlots.length > 0) {
            // Day Header
            headerRow1.push({
                content: DAY_NAMES[dayIndex],
                colSpan: daySlots.length,
                styles: { halign: 'center', fillColor: [108, 92, 231], textColor: 255, fontStyle: 'bold' }
            });

            // Time Slot Headers
            daySlots.forEach(slot => {
                headerRow2.push({
                    content: slot.startTime,
                    styles: { halign: 'center', fontSize: 8, angle: 90 }
                });
            });
            totalSlots += daySlots.length;
        } else {
            // If day is empty (e.g. Sunday), maybe skip or add placeholder?
            // Existing logic adds headers if slots > 0.
        }
    }

    // 2. Body
    const body = [];

    teachers.forEach(teacher => {
        const row = [];
        // Teacher Name Cell
        const branchAbbr = getLessonLabel(teacher);
        row.push({
            content: `${teacher.name}\n(${branchAbbr})`,
            styles: { fontStyle: 'bold', minCellWidth: 40 }
        });

        const tSchedule = teacherSchedule[teacher.id] || {};

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const daySlots = timeSlotsPerDay[dayIndex] || [];
            daySlots.forEach(slot => {
                const slotData = tSchedule[dayIndex] && tSchedule[dayIndex][slot.id];
                let className, subject;
                if (typeof slotData === 'object' && slotData !== null) {
                    className = slotData.className;
                    subject = slotData.subject;
                } else {
                    className = slotData;
                }

                if (className) {
                    const lessonAbbr = subject ? getSubjectAbbr(subject) : getLessonLabel(teacher, className);
                    const formattedClass = formatClassNameForExcel(className);
                    row.push({
                        content: `${lessonAbbr}\n${formattedClass}`,
                        styles: { halign: 'center', fillColor: [227, 242, 253] }
                    });
                } else {
                    row.push({ content: '', styles: { fillColor: 255 } });
                }
            });
        }
        body.push(row);
    });

    doc.autoTable({
        startY: 30,
        head: [headerRow1, headerRow2],
        body: body,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            valign: 'middle'
        },
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: 50
        },
        columnStyles: {
            0: { cellWidth: 40 } // Teacher col fixed width
        },
        margin: { top: 30, left: 10, right: 10 }
    });

    doc.save('Haftalik_Ders_Programi.pdf');
}

function getClassColor(str) {
    // Distinct pastel colors
    const colors = [
        '#ffebee', '#fce4ec', '#f3e5f5', '#ede7f6', '#e8eaf6',
        '#e3f2fd', '#e0f7fa', '#e0f2f1', '#e8f5e9', '#f1f8e9',
        '#f9fbe7', '#fffde7', '#fff8e1', '#fff3e0', '#fbe9e7',
        '#efebe9', '#fafafa', '#eceff1', '#ffcdd2', '#f8bbd0',
        '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b2ebf2',
        '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4',
        '#ffecb3', '#ffe0b2', '#ffccbc', '#d7ccc8', '#cfd8dc'
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

function exportToPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF || !html2canvas) {
        alert('PDF bileşenleri yüklenemedi. Lütfen internet bağlantınızı kontrol edip sayfayı yenileyin.');
        return;
    }

    // Identify active view
    const activeTab = document.querySelector('.view-tab.active');
    const viewType = activeTab ? activeTab.dataset.view : 'weekly';
    console.log('Exporting PDF for view:', viewType);

    // Create a temporary container for the PDF content
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.width = 'fit-content';
    wrapper.style.minWidth = '1200px'; // Minimum width for readability
    wrapper.style.padding = '40px';
    wrapper.style.backgroundColor = 'white';
    wrapper.style.zIndex = '-1000';

    // Add specific class for PDF styling
    wrapper.className = 'pdf-export-wrapper';

    // Set Title and Render Content based on View
    const title = document.createElement('h1');
    title.style.fontFamily = "'Inter', sans-serif";
    title.style.textAlign = 'center';
    title.style.marginBottom = '30px';
    title.style.color = '#333';

    // Create Table Structure
    const table = document.createElement('table');
    table.className = 'schedule-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '12px';
    table.style.backgroundColor = 'white';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);
    wrapper.appendChild(title);
    wrapper.appendChild(table);

    document.body.appendChild(wrapper);

    // Render Logic
    if (viewType === 'weekly') {
        title.textContent = 'Haftalık Ders Programı (Öğretmen Çarşaf Liste)';
        wrapper.style.minWidth = '2000px'; // Wider for weekly view
        renderWeeklyView(thead, tbody);
    } else if (viewType === 'day') {
        const dayName = DAY_NAMES[currentDayView || 0];
        title.textContent = `Günlük Ders Programı - ${dayName}`;
        // Reuse renderDayView logic but target our temporary table
        // We need a helper or modification to renderDayView to accept target elements
        // OR we can simple clone the current view's table if it's already rendered
        // But cloning might bring style issues. Let's create a specific renderer or adapt existing.
        // For simplicity and consistency, let's implement a quick renderer here or adapt existing `renderDayView`.
        // Refactoring `renderDayView` is safer. Let's assume we can call a slightly modified version or duplicate logic for safety given the constraints.
        // Actually, let's implement a helper `renderDayViewForExport` to be safe.
        renderDayViewForExport(thead, tbody, currentDayView || 0);
    } else if (viewType === 'teacher') {
        const teacherId = currentTeacherView;
        const teacher = teachers.find(t => t.id == teacherId);
        const teacherName = teacher ? teacher.name : 'Seçili Öğretmen';
        title.textContent = `Öğretmen Ders Programı - ${teacherName}`;
        if (teacherId) {
            renderTeacherViewForExport(thead, tbody, teacherId);
        } else {
            tbody.innerHTML = '<tr><td colspan="8">Lütfen bir öğretmen seçin.</td></tr>';
        }
    } else if (viewType === 'class') {
        const className = document.getElementById('classSelect').value;
        title.textContent = `Sınıf Ders Programı - ${formatClassNameForExcel(className) || 'Seçili Sınıf'}`;
        if (className) {
            renderClassViewForExport(thead, tbody, className);
        } else {
            tbody.innerHTML = '<tr><td colspan="8">Lütfen bir sınıf seçin.</td></tr>';
        }
    }

    // CRITICAL FIX: Remove position: sticky from all elements within the wrapper
    const stickyElements = wrapper.querySelectorAll('*');
    stickyElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'sticky') {
            el.style.position = 'static';
            el.style.left = 'auto';
            el.style.top = 'auto';
            el.style.border = '1px solid #ddd';
        }
    });

    // Also force some styles to ensure good capture
    const allCells = wrapper.querySelectorAll('td, th');
    allCells.forEach(cell => {
        cell.style.border = '1px solid #ccc';
    });

    // Wait for DOM
    setTimeout(() => {
        // Use html2canvas to capture
        html2canvas(wrapper, {
            scale: 2, // High resolution
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: wrapper.scrollWidth,
            height: wrapper.scrollHeight,
            windowWidth: wrapper.scrollWidth,
            windowHeight: wrapper.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;

            // Calculate PDF dimensions
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Choose format based on view nature
            let orientation = 'landscape';
            let format = 'a4';

            if (viewType === 'weekly') {
                format = 'a0'; // Keep A0 for the big sheet
            } else {
                format = 'a3'; // A3 usually good for single teacher/class schedules
            }

            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: format
            });

            const pdfPageWidth = pdf.internal.pageSize.getWidth();
            const pdfPageHeight = pdf.internal.pageSize.getHeight();

            // Scale to fit width
            const ratio = imgWidth / imgHeight;
            const targetWidth = pdfPageWidth;
            const targetHeight = targetWidth / ratio;

            // If it's a very tall document, we might need multi-page or fit to height?
            // For now, fit to width is standard for single page exports.

            pdf.addImage(imgData, 'PNG', 0, 0, targetWidth, targetHeight);
            const safeTitle = title.textContent.replace(/[^a-zA-Z0-9-çğıöşüÇĞİÖŞÜ ]/g, "").trim();
            pdf.save(`${safeTitle}.pdf`);

            // Cleanup
            document.body.removeChild(wrapper);
        }).catch(err => {
            console.error('PDF export error:', err);
            alert('PDF oluşturulurken bir hata oluştu: ' + err.message);
            if (document.body.contains(wrapper)) {
                document.body.removeChild(wrapper);
            }
        });
    }, 500);
}

function exportUnassignedLessonsPDF() {
    if (unassignedLessons.length === 0) {
        alert("Atanamayan ders bulunamadı.");
        return;
    }

    // Create a temporary container for PDF generation
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px'; // A4 width approx
    container.style.padding = '40px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(container);

    // Header
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';
    header.innerHTML = `
        <h2 style="color: #333; margin-bottom: 10px;">Atanamayan Ders Programı Raporu</h2>
        <p style="color: #666; font-size: 14px;">Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
    `;
    container.appendChild(header);

    // Table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';

    // Table Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; color: #333;">Branş</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; color: #333;">Öğretmen Adı</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; color: #333;">Sınıf</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center; color: #333;">Atanamayan Saat</th>
        </tr>
    `;
    table.appendChild(thead);

    // Table Body
    const tbody = document.createElement('tbody');
    let totalUnassigned = 0;

    // Group by branch for better readability
    unassignedLessons.sort((a, b) => a.branch.localeCompare(b.branch));

    unassignedLessons.forEach(item => {
        totalUnassigned += item.hours;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 10px; color: #555;">${item.branch || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 10px; color: #555;">${item.teacher}</td>
            <td style="border: 1px solid #ddd; padding: 10px; color: #555;">${formatClassNameForExcel(item.className)}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center; color: #d9534f; font-weight: bold;">${item.hours}</td>
        `;
        tbody.appendChild(tr);
    });

    // Total Row
    const totalTr = document.createElement('tr');
    totalTr.innerHTML = `
        <td colspan="3" style="border: 1px solid #ddd; padding: 10px; text-align: right; font-weight: bold;">TOPLAM:</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold; color: #d9534f;">${totalUnassigned}</td>
    `;
    tbody.appendChild(totalTr);

    table.appendChild(tbody);
    container.appendChild(table);

    // Generate PDF
    html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf; // Access jsPDF from the global object
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('Atanamayan_Dersler_Raporu.pdf');
        document.body.removeChild(container);
    }).catch(err => {
        console.error('PDF export error:', err);
        alert('PDF oluşturulurken bir hata oluştu: ' + err.message);
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });
}

// Helper render functions for export (reusing logic but targeting specific elements)

function renderDayViewForExport(thead, tbody, dayIndex) {
    // Header
    const trHead = document.createElement('tr');
    trHead.innerHTML = '<th class="time-column">Saat</th><th>Dersler</th>';
    thead.appendChild(trHead);

    const daySlots = daysData[dayIndex] || [];
    const daySchedule = schedule[dayIndex] || {};

    if (daySlots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="empty-cell">Bu gün için zaman planı tanımlanmamış</td></tr>';
        return;
    }

    daySlots.forEach(slot => {
        const tr = document.createElement('tr');
        const slotSchedule = daySchedule[slot.id] || {};

        const timeCell = document.createElement('td');
        timeCell.className = 'time-column';
        timeCell.textContent = `${slot.startTime} - ${slot.endTime}`;

        const lessonsCell = document.createElement('td');
        const lessons = Object.entries(slotSchedule);

        if (lessons.length === 0) {
            lessonsCell.innerHTML = '<span class="empty-cell">Boş</span>';
        } else {
            lessons.forEach(([className, val]) => {
                const teacherName = (typeof val === 'object' && val !== null) ? val.teacher : val;
                const subject = (typeof val === 'object' && val !== null) ? val.subject : null;
                const teacher = teachers.find(t => t.name === teacherName);

                const lessonDiv = document.createElement('div');
                lessonDiv.className = 'lesson-cell'; // Styles will be captured

                // Attempt to get class color if available
                let bgCol = '#f0f0f0';
                try {
                    if (typeof getClassColor === 'function') {
                        bgCol = getClassColor(className);
                    }
                } catch (e) { console.warn('getClassColor unavailable', e); }

                // Force styles on container
                lessonDiv.style.backgroundColor = bgCol;
                lessonDiv.style.display = 'flex';
                lessonDiv.style.flexDirection = 'column';
                lessonDiv.style.justifyContent = 'center';
                lessonDiv.style.alignItems = 'center';
                lessonDiv.style.padding = '8px';
                lessonDiv.style.borderRadius = '6px';
                lessonDiv.style.minHeight = '60px'; // Ensure height
                lessonDiv.style.border = '1px solid rgba(0,0,0,0.1)';
                lessonDiv.style.marginBottom = '2px';

                if (teacher && teacher.branch) {
                    const lessonAbbr = subject ? getSubjectAbbr(subject) : getLessonLabel(teacher, className);
                    lessonDiv.innerHTML = `
                         <span class="class-name" style="color:#000 !important; font-weight:800; font-size:14px; display:block; margin-bottom:2px;">${formatClassNameForExcel(className)}</span>
                        <span class="teacher-name" style="color:#333 !important; font-weight:600; font-size:12px; display:block; margin-bottom:2px;">${teacherName}</span>
                         <div style="font-size:11px; color:#444 !important; font-weight:600;">${lessonAbbr}</div>
                    `;
                } else {
                    lessonDiv.innerHTML = `
                        <span class="class-name" style="color:#000 !important; font-weight:800; font-size:14px; display:block; margin-bottom:2px;">${formatClassNameForExcel(className)}</span>
                        <span class="teacher-name" style="color:#333 !important; font-weight:600; font-size:12px; display:block;">${teacherName}</span>
                    `;
                }
                lessonsCell.appendChild(lessonDiv);
            });
        }
        tr.appendChild(timeCell);
        tr.appendChild(lessonsCell);
        tbody.appendChild(tr);
    });
}

function renderTeacherViewForExport(thead, tbody, teacherId) {
    // Header
    const trHead = document.createElement('tr');
    trHead.innerHTML = `
        <th class="time-column">Saat</th>
        <th>Pazartesi</th>
        <th>Salı</th>
        <th>Çarşamba</th>
        <th>Perşembe</th>
        <th>Cuma</th>
        <th>Cumartesi</th>
        <th>Pazar</th>
    `;
    thead.appendChild(trHead);

    const teacher = teachers.find(t => t.id == teacherId);
    if (!teacher) return;
    const tSchedule = teacherSchedule[teacherId] || {};

    // Collect all unique time slots
    const timeSlotMap = new Map();
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = daysData[dayIndex] || [];
        daySlots.forEach(slot => {
            const key = `${slot.startTime}-${slot.endTime}`;
            if (!timeSlotMap.has(key)) {
                timeSlotMap.set(key, { startTime: slot.startTime, endTime: slot.endTime, slots: {} });
            }
            timeSlotMap.get(key).slots[dayIndex] = slot.id;
        });
    }
    const sortedTimeSlots = Array.from(timeSlotMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (sortedTimeSlots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Zaman planı yok</td></tr>';
        return;
    }

    sortedTimeSlots.forEach(timeSlot => {
        const tr = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.className = 'time-column';
        timeCell.textContent = `${timeSlot.startTime} - ${timeSlot.endTime}`;
        tr.appendChild(timeCell);

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const td = document.createElement('td');
            const slotId = timeSlot.slots[dayIndex];

            if (!slotId) {
                td.innerHTML = '<span class="empty-cell">-</span>';
            } else {
                const slotData = tSchedule[dayIndex] && tSchedule[dayIndex][slotId];
                let className, subject;
                if (typeof slotData === 'object' && slotData !== null) {
                    className = slotData.className;
                    subject = slotData.subject;
                } else {
                    className = slotData;
                }

                if (className) {
                    const lessonAbbr = subject ? getSubjectAbbr(subject) : getLessonLabel(teacher, className);
                    const lessonDiv = document.createElement('div');
                    lessonDiv.className = 'lesson-cell';

                    // Attempt to get class color if available
                    let bgCol = '#f0f0f0';
                    try {
                        if (typeof getClassColor === 'function') {
                            bgCol = getClassColor(className);
                        }
                    } catch (e) { console.warn('getClassColor unavailable', e); }

                    // Force styles on container
                    lessonDiv.style.backgroundColor = bgCol;
                    lessonDiv.style.display = 'flex';
                    lessonDiv.style.flexDirection = 'column';
                    lessonDiv.style.justifyContent = 'center';
                    lessonDiv.style.alignItems = 'center';
                    lessonDiv.style.padding = '8px';
                    lessonDiv.style.borderRadius = '6px';
                    lessonDiv.style.minHeight = '60px'; // Ensure height
                    lessonDiv.style.border = '1px solid rgba(0,0,0,0.1)';
                    lessonDiv.style.marginBottom = '2px';

                    lessonDiv.innerHTML = `
                        <div style="font-size:11px; color:#444 !important; font-weight:600; margin-bottom:2px;">${lessonAbbr}</div>
                        <span class="class-name" style="color:#000 !important; font-weight:800; font-size:14px; display:block;">${formatClassNameForExcel(className)}</span>
                    `;
                    td.appendChild(lessonDiv);
                } else {
                    td.innerHTML = '<span class="empty-cell">Boş</span>';
                }
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

function renderClassViewForExport(thead, tbody, className) {
    // Header - Same structure as Teacher View
    const trHead = document.createElement('tr');
    trHead.innerHTML = `
        <th class="time-column">Saat</th>
        <th>Pazartesi</th>
        <th>Salı</th>
        <th>Çarşamba</th>
        <th>Perşembe</th>
        <th>Cuma</th>
        <th>Cumartesi</th>
        <th>Pazar</th>
    `;
    thead.appendChild(trHead);

    const cSchedule = classSchedule[className] || {};

    // Collect all unique time slots
    const timeSlotMap = new Map();
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daySlots = daysData[dayIndex] || [];
        daySlots.forEach(slot => {
            const key = `${slot.startTime}-${slot.endTime}`;
            if (!timeSlotMap.has(key)) {
                timeSlotMap.set(key, { startTime: slot.startTime, endTime: slot.endTime, slots: {} });
            }
            timeSlotMap.get(key).slots[dayIndex] = slot.id;
        });
    }
    const sortedTimeSlots = Array.from(timeSlotMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (sortedTimeSlots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Zaman planı yok</td></tr>';
        return;
    }

    sortedTimeSlots.forEach(timeSlot => {
        const tr = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.className = 'time-column';
        timeCell.textContent = `${timeSlot.startTime} - ${timeSlot.endTime}`;
        tr.appendChild(timeCell);

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const td = document.createElement('td');
            const slotId = timeSlot.slots[dayIndex];

            if (!slotId) {
                td.innerHTML = '<span class="empty-cell">-</span>';
            } else {
                const val = cSchedule[dayIndex] && cSchedule[dayIndex][slotId];
                const teacherName = (typeof val === 'object' && val !== null) ? val.teacher : val;
                const subject = (typeof val === 'object' && val !== null) ? val.subject : null;

                if (teacherName) {
                    const teacher = teachers.find(t => t.name === teacherName);
                    const lessonDiv = document.createElement('div');
                    lessonDiv.className = 'lesson-cell';

                    // Attempt to get class color if available
                    let bgCol = '#f0f0f0';
                    try {
                        bgCol = '#f8f9fa';
                    } catch (e) { }

                    // Force styles on container
                    lessonDiv.style.backgroundColor = bgCol;
                    lessonDiv.style.display = 'flex';
                    lessonDiv.style.flexDirection = 'column';
                    lessonDiv.style.justifyContent = 'center';
                    lessonDiv.style.alignItems = 'center';
                    lessonDiv.style.padding = '8px';
                    lessonDiv.style.borderRadius = '6px';
                    lessonDiv.style.minHeight = '60px'; // Ensure height
                    lessonDiv.style.border = '1px solid rgba(0,0,0,0.1)';
                    lessonDiv.style.marginBottom = '2px';

                    if (teacher && teacher.branch) {
                        const lessonAbbr = subject ? getSubjectAbbr(subject) : getLessonLabel(teacher);
                        lessonDiv.innerHTML = `
                             <span class="class-name" style="color:#000 !important; font-weight:800; font-size:14px; display:block; margin-bottom:2px;">${teacherName}</span>
                            <div style="font-size:11px; color:#444 !important; font-weight:600;">${lessonAbbr}</div>
                        `;
                    } else {
                        lessonDiv.innerHTML = `<span class="class-name" style="color:#000 !important; font-weight:800; font-size:14px; display:block;">${teacherName}</span>`;
                    }
                    td.appendChild(lessonDiv);
                } else {
                    td.innerHTML = '<span class="empty-cell">Boş</span>';
                }
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}
