import './style.css';
import { parseExcel, exportToExcel, exportRoomsToExcel, exportOverflowToExcel } from './excel-utils.js';
import { generatePDF } from './pdf-utils.js';

// State
const state = {
  step: 1,
  students: [], // Array of { id, name, class }
  rooms: [],    // Array of { id, name, capacity }
  distribution: null // Result object
};

// DOM Elements - Initialized in init
let steps = {};
let indicators = {};

// Helper: Setup Drag and Drop

// Helper: Setup Drag and Drop
function setupDragAndDrop(areaId, callback) {
  const area = document.getElementById(areaId);
  if (!area) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    area.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    area.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    area.addEventListener(eventName, unhighlight, false);
  });

  function highlight(e) {
    area.classList.add('highlight');
    area.style.borderColor = '#4f46e5';
    area.style.background = '#eef2ff';
  }

  function unhighlight(e) {
    area.classList.remove('highlight');
    area.style.borderColor = ''; // Revert to css
    area.style.background = '';
  }

  area.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      callback(files[0]);
    }
  }
}

function init() {
  console.log('App Initialized');

  steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3')
  };
  indicators = {
    1: document.getElementById('step-indicator-1'),
    2: document.getElementById('step-indicator-2'),
    3: document.getElementById('step-indicator-3')
  };

  updateUI();
  setupEventListeners();
}

function updateUI() {
  // Toggle Steps
  Object.keys(steps).forEach(key => {
    if (parseInt(key) === state.step) {
      steps[key].classList.remove('hidden');
      indicators[key].classList.add('active');
    } else {
      steps[key].classList.add('hidden');
      indicators[key].classList.remove('active');
    }

    // Mark completed
    if (parseInt(key) < state.step) {
      indicators[key].classList.add('completed');
    } else {
      indicators[key].classList.remove('completed');
    }
  });

  // Update counts
  document.getElementById('student-count').textContent = state.students.length;
  document.getElementById('room-count').textContent = state.rooms.length;
  const totalCap = state.rooms.reduce((sum, r) => sum + r.capacity, 0);
  document.getElementById('total-capacity').textContent = totalCap;
}

function setupEventListeners() {
  // Student Upload
  const studentInput = document.getElementById('student-file-input');
  studentInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
      await handleStudentUpload(e.target.files[0]);
    }
  });

  // Drag and Drop for Students


  // Init DnD for Students
  setupDragAndDrop('student-upload-area', handleStudentUpload);


  async function handleStudentUpload(file) {
    try {
      const data = await parseExcel(file);
      // Assume Excel has headers: No, Name, Class (or similar)
      // We need to map generic columns to our structure
      // For now, let's take: 1st col -> No, 2nd -> Name, 3rd -> Class

      if (!data || data.length === 0) {
        alert("Dosya boş. Lütfen geçerli bir Excel dosyası yükleyin.");
        return;
      }

      if (data.length === 1) {
        alert("Dosyada öğrenci kaydı bulunamadı. Lütfen öğrenci bilgilerini ekleyip tekrar deneyiniz.");
        return;
      }

      const headers = data[0]; // First row is header
      const rows = data.slice(1);

      state.students = rows.map((row, index) => {
        // User Specified Mapping:
        // Col 1 (Idx 0): Ad
        // Col 2 (Idx 1): Soyad
        // Col 3 (Idx 2): Telefon
        // Col 4 (Idx 3): Öğrenci No
        // Col 5 (Idx 4): Tc No
        // Col 6 (Idx 5): Sınıf
        // Col 7 (Idx 6): Bölüm

        const name = row[0] || '';
        const surname = row[1] || '';
        const fullName = (name + ' ' + surname).trim() || 'Bilinmiyor';

        return {
          id: row[3] || index + 1,       // Öğrenci No (Col 4)
          tc: row[4] || '',              // TC Kimlik (Col 5)
          name: fullName,                // Ad Soyad (Col 1 + 2)
          phone: row[2] || '',           // Telefon (Col 3) - NEW
          classRef: row[5] || '',        // Sınıfı (Col 6)
          department: row[6] || ''       // Bölümü (Col 7)
        };
      }).filter(s => s.name !== 'Bilinmiyor');

      renderStudentTable();
      updateUI();

      // Show Preview
      document.getElementById('student-preview').classList.remove('hidden');
      document.getElementById('student-upload-area').classList.add('hidden'); // Hide upload area to save space? Or keep it?
      // Let's keep upload area small or replace content

    } catch (err) {
      console.error(err);
      alert("Dosya okuma hatası: " + err.message);
    }
  }

  function renderStudentTable() {
    const tbody = document.querySelector('#student-table tbody');
    const thead = document.querySelector('#student-table thead');

    // Update headers dynamically
    thead.innerHTML = `
      <tr>
        <th>No</th>
        <th>TC No</th>
        <th>Ad Soyad</th>
        <th>Sınıf</th>
        <th>Bölüm</th>
        <th>Telefon</th>
      </tr>
    `;

    tbody.innerHTML = '';
    // Show first 50 for preview
    const limit = 50;
    state.students.slice(0, limit).forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.tc}</td>
        <td>${s.name}</td>
        <td>${s.classRef}</td>
        <td>${s.department}</td>
        <td>${s.phone}</td>
      `;
      tbody.appendChild(tr);
    });

    if (state.students.length > limit) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="3" style="text-align:center; font-style:italic;">... ve ${state.students.length - limit} öğrenci daha ...</td>`;
      tbody.appendChild(tr);
    }
  }

  // Navigation
  document.getElementById('btn-to-step-2').addEventListener('click', () => {
    if (state.students.length === 0) {
      alert('Lütfen önce öğrenci listesi yükleyin.');
      return;
    }
    setStep(2);
  });

  document.getElementById('btn-back-to-step-1').addEventListener('click', () => {
    setStep(1);
  });

  // Room Upload
  const roomInput = document.getElementById('room-file-input');
  roomInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
      await handleRoomUpload(e.target.files[0]);
    }
  });

  // Init DnD for Rooms
  setupDragAndDrop('room-upload-area', handleRoomUpload);

  async function handleRoomUpload(file) {
    try {
      const data = await parseExcel(file);
      if (!data || data.length < 2) return;

      const rows = data.slice(1);
      // Mapping: 1st -> Name, 2nd -> Capacity
      const newRooms = rows.map((row, index) => {
        return {
          id: Date.now() + index, // unique id
          name: row[0] || `Salon ${index + 1}`,
          capacity: parseInt(row[1]) || 20,
          priority: parseInt(row[2]) || 999
        };
      }).filter(r => r.capacity > 0);

      state.rooms = [...state.rooms, ...newRooms];
      updateUI();
      renderRoomTable();
    } catch (err) {
      console.error(err);
      alert("Hata: " + err.message);
    }
  }

  // Manual Room Entry
  let editingRoomId = null; // Track which room is being edited

  document.getElementById('btn-add-room').addEventListener('click', () => {
    const nameInput = document.getElementById('manual-room-name');
    const capInput = document.getElementById('manual-room-capacity');
    const priorityInput = document.getElementById('manual-room-priority');
    const btnAdd = document.getElementById('btn-add-room');

    const name = nameInput.value.trim();
    const cap = parseInt(capInput.value);
    const priority = parseInt(priorityInput.value) || 999;

    if (!name || isNaN(cap) || cap <= 0) {
      alert("Lütfen geçerli bir salon adı ve kapasite giriniz.");
      return;
    }

    // Check for duplicate priority
    // Ignore default priority 999
    if (priority !== 999) {
      const duplicate = state.rooms.find(r => r.priority === priority && r.id !== editingRoomId);
      if (duplicate) {
        alert(`Dikkat: ${priority} öncelik sırası zaten "${duplicate.name}" salonunda kullanılıyor!`);
        // We allow proceeding, just warning as requested? "Uyarı vermeli" usually means just warn.
        // But usually users want to fix it. Let's asking for confirmation if they want to proceed.
        // If strictly "prevent", we would return. Let's stick to Alert + Continue or Confirm?
        // "Uyarı vermeli" -> Alert. 
        // Let's assume user might want to fix it, so we don't clear/add immediately?
        // Actually, let's use confirm to give them a choice.
        if (!confirm(`Bu öncelik sırası (${priority}) zaten kullanılıyor. Yine de devam edilsin mi?`)) {
          return;
        }
      }
    }

    if (editingRoomId) {
      // Update existing
      const roomIndex = state.rooms.findIndex(r => r.id === editingRoomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex] = {
          ...state.rooms[roomIndex],
          name: name,
          capacity: cap,
          priority: priority
        };
      }
      editingRoomId = null;
      btnAdd.innerHTML = '+'; // Reset button
      btnAdd.classList.remove('btn-warning');
      btnAdd.classList.add('btn-primary');
    } else {
      // Add new
      state.rooms.push({
        id: Date.now(),
        name: name,
        capacity: cap,
        priority: priority
      });
    }

    // Auto-sort by priority
    state.rooms.sort((a, b) => a.priority - b.priority);

    nameInput.value = '';
    capInput.value = '';
    priorityInput.value = '';
    updateUI();
    renderRoomTable();
  });

  document.getElementById('btn-export-rooms').addEventListener('click', () => {
    if (state.rooms.length === 0) {
      alert('Dışa aktarılacak salon yok.');
      return;
    }
    exportRoomsToExcel(state.rooms);
  });

  function renderRoomTable() {
    const tbody = document.querySelector('#room-table tbody');
    const thead = document.querySelector('#room-table thead');
    const nameInput = document.getElementById('manual-room-name');
    const capInput = document.getElementById('manual-room-capacity');
    const priorityInput = document.getElementById('manual-room-priority');
    const btnAdd = document.getElementById('btn-add-room');

    tbody.innerHTML = '';

    // Ensure sorted before render
    state.rooms.sort((a, b) => a.priority - b.priority);

    state.rooms.forEach((r, index) => {
      const tr = document.createElement('tr');
      // Highlight row being edited
      if (r.id === editingRoomId) {
        tr.style.background = '#eef2ff';
        tr.style.border = '2px solid #6366f1';
      }

      tr.innerHTML = `
        <td>${r.name}</td>
        <td>${r.capacity}</td>
        <td>${r.priority === 999 ? '-' : r.priority}</td>
        <td>
          <button class="btn-delete-room" style="color:red; background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:4px;" data-index="${index}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg> 
            Sil
          </button>
        </td>
      `;

      // Edit on double click
      tr.addEventListener('dblclick', () => {
        editingRoomId = r.id;
        nameInput.value = r.name;
        capInput.value = r.capacity;
        priorityInput.value = r.priority === 999 ? '' : r.priority;

        btnAdd.innerHTML = '💾'; // Save icon
        btnAdd.classList.remove('btn-primary');
        btnAdd.classList.add('btn-warning'); // Orange for edit mode? Or just keep styling simple

        renderRoomTable(); // Re-render to show highlight
      });

      tbody.appendChild(tr);
    });

    // Re-attach listeners for delete buttons
    document.querySelectorAll('.btn-delete-room').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // If deleting the room being edited, cancel edit mode
        const idx = parseInt(e.target.getAttribute('data-index'));
        const roomToDelete = state.rooms[idx];

        if (roomToDelete && editingRoomId === roomToDelete.id) {
          editingRoomId = null;
          nameInput.value = '';
          capInput.value = '';
          priorityInput.value = '';
          btnAdd.innerHTML = '+';
          btnAdd.classList.remove('btn-warning');
          btnAdd.classList.add('btn-primary');
        }

        state.rooms.splice(idx, 1);
        updateUI();
        renderRoomTable();
      });
    });
  }

  document.getElementById('btn-to-step-3').addEventListener('click', () => {
    if (state.rooms.length === 0) {
      alert('Lütfen en az bir salon tanımlayın.');
      return;
    }

    // Ensure sorted before distrib
    state.rooms.sort((a, b) => a.priority - b.priority);

    // Check capacity

    distributeStudents();
    setStep(3);
  });

  document.getElementById('btn-back-to-step-2').addEventListener('click', () => {
    setStep(2);
  });

  document.getElementById('btn-restart').addEventListener('click', () => {
    if (confirm('Tüm veriler silinecek ve başa dönülecek. Onaylıyor musunuz?')) {
      location.reload();
    }
  });

  document.getElementById('btn-export-excel').addEventListener('click', () => {
    if (!state.distribution) return;
    exportToExcel(state.distribution, state.rooms);
  });

  document.getElementById('btn-export-pdf').addEventListener('click', async () => {
    if (!state.distribution) return;
    const btn = document.getElementById('btn-export-pdf');
    const originalText = btn.textContent;
    btn.textContent = 'Hazırlanıyor...';
    btn.disabled = true;

    try {
      await generatePDF(state.distribution, state.rooms);
    } catch (e) {
      console.error(e);
      alert('PDF oluşturulurken hata oluştu.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

function setStep(step) {
  state.step = step;
  updateUI();
}

function distributeStudents() {
  console.log("Distributing...");

  // 1. Shuffle students
  let studentsToDistribute = [...state.students];
  shuffleArray(studentsToDistribute);

  // 2. Distribute
  const result = {}; // roomId -> [students]
  state.rooms.forEach(r => result[r.id] = []);

  const overflow = [];

  let currentRoomIndex = 0;

  studentsToDistribute.forEach(student => {
    // Find next available room
    let placed = false;

    // Try to fill current room first (Sequential Fill)
    if (currentRoomIndex < state.rooms.length) {
      const room = state.rooms[currentRoomIndex];
      if (result[room.id].length < room.capacity) {
        result[room.id].push(student);
        placed = true;
      } else {
        // Room full, move to next
        currentRoomIndex++;
        if (currentRoomIndex < state.rooms.length) {
          const nextRoom = state.rooms[currentRoomIndex];
          result[nextRoom.id].push(student);
          placed = true;
        }
      }
    }

    if (!placed) {
      overflow.push(student);
    }
  });

  state.distribution = {
    results: result,
    overflow: overflow
  };

  renderDistributionResults();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderDistributionResults() {
  const summaryEl = document.getElementById('distribution-summary');
  const resultsEl = document.getElementById('distribution-results');

  const totalDistributed = state.students.length - state.distribution.overflow.length;

  summaryEl.innerHTML = `
    <div class="card" style="background: rgba(16, 185, 129, 0.1); border-color: #10b981;">
      <h3>Dağıtım Özeti</h3>
      <p>Toplam Öğrenci: <strong>${state.students.length}</strong></p>
      <p>Yerleşen: <strong>${totalDistributed}</strong></p>
      <p>Açıkta Kalan: <strong style="color: ${state.distribution.overflow.length > 0 ? 'red' : 'green'}">${state.distribution.overflow.length}</strong></p>
      
      ${state.distribution.overflow.length > 0 ? `
        <button id="btn-export-overflow" class="btn btn-warning" style="margin-top: 10px; background-color: #dc2626; border-color: #dc2626; color: white;">
          ⚠️ Açıkta Kalanları İndir (Excel)
        </button>
      ` : ''}
    </div>
  `;

  // Attach listener for overflow export
  const btnExportOverflow = document.getElementById('btn-export-overflow');
  if (btnExportOverflow) {
    btnExportOverflow.addEventListener('click', () => {
      exportOverflowToExcel(state.distribution.overflow);
    });
  }

  let html = '';

  state.rooms.forEach(room => {
    const studentsInRoom = state.distribution.results[room.id];
    html += `
      <div class="card">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 1rem 1.5rem; margin: -1.5rem -1.5rem 1.5rem -1.5rem; border-radius: 1rem 1rem 0 0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: white; font-size: 1.25rem;">${room.name}</h3>
            <span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
                Kapasite: ${studentsInRoom.length} / ${room.capacity}
            </span>
        </div>
        <div class="data-table-container">
          <table>
             <thead>
               <tr>
                 <th>Sıra</th>
                 <th>Öğrenci No</th>
                 <th>TC No</th>
                 <th>Ad Soyad</th>
                 <th>Sınıf</th>
                 <th>Bölüm</th>
                 <th>Telefon</th>
               </tr>
             </thead>
             <tbody>
               ${studentsInRoom.length === 0 ? '<tr><td colspan="7">Öğrenci yok</td></tr>' :
        studentsInRoom.map((s, i) => `
                   <tr>
                     <td>${i + 1}</td>
                     <td>${s.id}</td>
                     <td>${s.tc}</td>
                     <td>${s.name}</td>
                     <td>${s.classRef}</td>
                     <td>${s.department}</td>
                     <td>${s.phone}</td>
                   </tr>
                 `).join('')}
             </tbody>
          </table>
        </div>
      </div>
    `;
  });

  if (state.distribution.overflow.length > 0) {
    html += `
      <div class="card" style="border-color: red;">
        <h3 style="color: red;">Açıkta Kalan Öğrenciler</h3>
        <div class="data-table-container">
          <table>
             <thead><tr><th>No</th><th>TC No</th><th>Ad</th><th>Sınıf</th><th>Bölüm</th><th>Telefon</th></tr></thead>
             <tbody>
               ${state.distribution.overflow.map(s => `
                 <tr>
                   <td>${s.id}</td>
                   <td>${s.tc}</td>
                   <td>${s.name}</td>
                   <td>${s.classRef}</td>
                   <td>${s.department}</td>
                   <td>${s.phone}</td>
                 </tr>
               `).join('')}
             </tbody>
          </table>
        </div>
      </div>
    `;
  }

  resultsEl.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', init);
