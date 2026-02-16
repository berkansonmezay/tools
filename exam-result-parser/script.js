const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const outputContent = document.getElementById('output-content');

// Stepper Elements
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const stepIndicator1 = document.getElementById('step-indicator-1');
const stepIndicator2 = document.getElementById('step-indicator-2');
const selectedFilename = document.getElementById('selected-filename');
const changeFileBtn = document.getElementById('change-file-btn');
const lineCountDisplay = document.getElementById('line-count');
const contextMenu = document.getElementById('context-menu');
const parametersList = document.getElementById('parameters-list');
const clearParamsBtn = document.getElementById('clear-params-btn');

let currentFile = null;
let lastClickedColumn = 1;

// Drag and Drop Events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (file.name.endsWith('.txt') || file.name.endsWith('.dat')) {
        currentFile = file;
        selectedFilename.textContent = file.name;
        goToStep(2);
        parseFile(file);
    } else {
        alert('Lütfen geçerli bir .txt veya .dat dosyası yükleyin.');
    }
}

// Stepper Navigation
function goToStep(stepNumber) {
    if (stepNumber === 1) {
        step1.style.display = 'block';
        step2.style.display = 'none';
        stepIndicator1.classList.add('active');
        stepIndicator2.classList.remove('active');
    } else if (stepNumber === 2) {
        step1.style.display = 'none';
        step2.style.display = 'block';
        stepIndicator1.classList.add('active'); // Step 1 remains active as completed
        stepIndicator2.classList.add('active');
    }
}

changeFileBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    outputContent.textContent = 'Henüz veri ayrıştırılmadı.';
    goToStep(1);
});



function parseFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        displayOutput(content);
    };
    reader.readAsText(file, 'ISO-8859-9'); // Turkish encoding
}

function displayOutput(content) {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lineCountDisplay) {
        lineCountDisplay.textContent = `${lines.length} Satır`;
    }

    // Show full content
    outputContent.textContent = content;
}
// Context Menu Logic
outputContent.addEventListener('click', (e) => {
    // Detect column index
    lastClickedColumn = getColumnIndex(e);

    // Show menu at click position
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    e.stopPropagation();
});

function getColumnIndex(e) {
    let range, textNode, offset;
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
        textNode = range.startContainer;
        offset = range.startOffset;
    } else if (document.caretPositionFromPoint) {
        range = document.caretPositionFromPoint(e.clientX, e.clientY);
        textNode = range.offsetNode;
        offset = range.offset;
    } else {
        return 1;
    }

    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return 1;

    const text = textNode.textContent;
    const textBefore = text.slice(0, offset);
    const lastNewLine = textBefore.lastIndexOf('\n');
    return offset - lastNewLine;
}

// Close menu on outside click
document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// Menu Item Click
contextMenu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const fieldName = item.textContent;
        addParameterToPanel(fieldName, lastClickedColumn);
        contextMenu.style.display = 'none';
    });
});

function addParameterToPanel(name, index) {
    // Check if parameter already exists
    const existingRows = parametersList.querySelectorAll('.parameter-row');
    let found = false;

    existingRows.forEach(row => {
        const nameInput = row.querySelector('.param-name-input');
        if (nameInput.value === name) {
            const indexInput = row.querySelector('.param-index-input');
            indexInput.value = index;
            found = true;

            // Highlight the update
            row.style.backgroundColor = '#fef3c7';
            setTimeout(() => row.style.backgroundColor = 'transparent', 500);
        }
    });

    if (found) return;

    const row = document.createElement('div');
    row.className = 'parameter-row';
    row.draggable = true;
    row.innerHTML = `
        <div class="drag-handle"><i class="ph ph-dots-six-vertical"></i></div>
        <input type="text" class="param-name-input" value="${name}" readonly>
        <input type="text" class="param-index-input" value="${index}">
        <button class="btn-delete-row" title="Sil"><i class="ph ph-trash"></i></button>
    `;

    // Delete Event
    row.querySelector('.btn-delete-row').addEventListener('click', (e) => {
        e.stopPropagation();
        row.remove();
    });

    // Drag Events (Reordering + Cross-Tab Sync)
    row.addEventListener('dragstart', (e) => {
        row.classList.add('dragging');

        // Prepare sync data (Only THIS parameter)
        const name = row.querySelector('.param-name-input').value;
        const index = row.querySelector('.param-index-input').value;
        const data = { [name]: index };

        const jsonData = JSON.stringify(data);

        e.dataTransfer.setData('application/json', jsonData);
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'copy';
    });

    row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
    });

    parametersList.appendChild(row);
    parametersList.scrollTop = parametersList.scrollHeight;
}

// Drag and Drop Logic for Reordering
parametersList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingRow = parametersList.querySelector('.dragging');
    const afterElement = getDragAfterElement(parametersList, e.clientY);
    if (afterElement == null) {
        parametersList.appendChild(draggingRow);
    } else {
        parametersList.insertBefore(draggingRow, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.parameter-row:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Clear All
clearParamsBtn.addEventListener('click', () => {
    if (confirm('Tüm parametreleri silmek istediğinize emin misiniz?')) {
        parametersList.innerHTML = '';
    }
});


// Row-based Cross-Tab Sync is handled via dragstart in addParameterToPanel
// and global drop handler below.

// Global Drop Handler for receiving parameters
document.addEventListener('dragover', (e) => {
    // Only allow drop if it's not a row being reordered inside this list
    if (!parametersList.querySelector('.dragging')) {
        e.preventDefault();
    }
});

document.addEventListener('drop', (e) => {
    // If it's a reorder drag from this list, let the reorder logic handle it
    if (parametersList.querySelector('.dragging')) return;

    e.preventDefault();
    const jsonData = e.dataTransfer.getData('application/json');
    const textData = e.dataTransfer.getData('text/plain');

    if (jsonData) {
        try {
            const data = JSON.parse(jsonData);
            for (const [name, index] of Object.entries(data)) {
                addParameterToPanel(name, index);
            }
        } catch (err) {
            console.error('JSON drop error:', err);
        }
    } else if (textData && textData.includes('=')) {
        const indices = textData.split('=').filter(id => id.trim().length > 0);
        const menuItems = contextMenu.querySelectorAll('.menu-item');
        indices.forEach((index, i) => {
            if (menuItems[i]) {
                addParameterToPanel(menuItems[i].textContent, index);
            }
        });
    }
});
