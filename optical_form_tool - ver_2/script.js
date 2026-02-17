document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('inputArea');
    const processBtn = document.getElementById('processBtn');
    const resultBody = document.getElementById('resultBody');

    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');

    processBtn.addEventListener('click', processData);

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            readFile(file);
        }
    });

    // Drag and drop handlers
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

        const file = e.dataTransfer.files[0];
        if (file) {
            readFile(file);
        }
    });

    // Click on drop zone triggers file input
    dropZone.addEventListener('click', (e) => {
        if (e.target !== fileInput && !e.target.closest('.file-select-btn')) {
            fileInput.click();
        }
    });

    // Read file and populate textarea with proper encoding
    function readFile(file) {
        // Try Windows-1254 (Turkish) encoding first
        const reader = new FileReader();
        reader.onload = (e) => {
            let content = e.target.result;

            // Check if content has replacement characters (encoding issue)
            if (content.includes('�')) {
                // Try reading with UTF-8 instead
                const readerUtf8 = new FileReader();
                readerUtf8.onload = (ev) => {
                    inputArea.value = ev.target.result;
                    processData();
                };
                readerUtf8.readAsText(file, 'UTF-8');
            } else {
                inputArea.value = content;
                processData();
            }
        };
        reader.onerror = () => {
            alert('Dosya okunamadı!');
        };
        // Try Windows-1254 (Turkish Windows encoding) first
        reader.readAsText(file, 'windows-1254');
    }

    // Run once on load to populate example
    processData();

    function processData() {
        const text = inputArea.value.trim();
        const lines = text.split('\n');

        resultBody.innerHTML = ''; // Clear previous results

        let currentStart = 1;

        // First pass: Calculate initial offset if needed? 
        // Based on analysis, the first line might be metadata, but the example accumulates logic starts at 1.
        // However, the example shows [KURUM KODU] starting at 5.
        // Preceding items [KOD-1], [KOD-1], [KOD-2], [KOD-3] exist in input.
        // Their lengths are 1 each. Total 4. 1 + 4 = 5.
        // So we just process logic for ALL lines, but maybe filter what we DISPLAY?
        // The screenshot shows only meaningful fields.
        // Let's filter out "KOD-1", "KOD-2" etc. if they are not in the desired visual list?
        // Or just display everything and let the user delete lines they don't want.
        // User instruction: "Verilen örnekteki girdiler sağ tarafta çıktı olarak verilmiştir."
        // Meaning the INPUT provided produces the OUTPUT provided.
        // So I must match that behavior.

        // Strategy: Process all items to update 'currentStart'.
        // Only render items that don't look like internal control codes?
        // Or render everything. The screenshot doesn't show KOD-1.
        // I will implement a filter: If name starts with "KOD-", don't show, but DO increment start?
        // Wait, "KOD-1" length is 17-17+1 = 1? No, 17=17 is col?
        // Let's look at KOD-1: 01=01=17=17=H=D=1=X=[KOD-1]
        // D -> Col 17-17 -> Len 1.
        // Four such items -> 4 units.
        // Start 1 + 4 = 5. Correct.
        // So they consume space.
        // Maybe I just hide rows where Name starts with "KOD-"?

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            const parts = line.split('=');

            // En az 6 parça olmalı (temel format kontrolü)
            // Format: Row1=Row2=Col1=Col2=Type=Orientation=Val=X2=Name=
            if (parts.length < 6) return;

            // Parse indices
            // 0: StartRow
            // 1: EndRow
            // 2: StartCol
            // 3: EndCol
            // 4: Type (K veya S)
            // 5: Orientation (D veya Y)
            // 6: Value/Digits
            // 7: X2
            // 8: Name (opsiyonel)

            const startRow = parseInt(parts[0], 10);
            const endRow = parseInt(parts[1], 10);
            const startCol = parseInt(parts[2], 10);
            const endCol = parseInt(parts[3], 10);
            const orientation = parts[5]; // "D" or "Y"

            // Geçersiz sayıları kontrol et
            if (isNaN(startRow) || isNaN(endRow) || isNaN(startCol) || isNaN(endCol)) return;

            // İsim parts[8]'de bulunur veya boş olabilir
            let displayName = (parts.length > 8 && parts[8]) ? parts[8].trim() : '';

            // Boş isimli alanları "Tanımsız Alan" olarak göster
            if (!displayName) {
                displayName = 'Tanımsız Alan';
            }

            // Uzunluk hesaplaması: (bitiş - başlangıç) + 1
            let length = 0;
            if (orientation === 'D') {
                length = (endCol - startCol) + 1;
            } else if (orientation === 'Y') {
                length = (endRow - startRow) + 1;
            } else {
                length = 1;
            }

            // Add to list as card row
            const row = document.createElement('div');
            row.classList.add('list-row');

            // Drag Handle
            const dragHandle = document.createElement('div');
            dragHandle.classList.add('row-drag-handle');
            dragHandle.textContent = '⋮⋮';
            row.appendChild(dragHandle);

            // Name Cell
            const nameCell = document.createElement('div');
            nameCell.classList.add('row-name');
            nameCell.textContent = displayName;
            row.appendChild(nameCell);

            // Start Cell
            const startCell = document.createElement('div');
            startCell.classList.add('row-number', 'start-val');
            startCell.textContent = currentStart;
            startCell.draggable = true;
            startCell.addEventListener('dragstart', handleDragStart);
            row.appendChild(startCell);

            // Length Cell
            const lenCell = document.createElement('div');
            lenCell.classList.add('row-number', 'length-val');
            lenCell.textContent = length;
            lenCell.draggable = true;
            lenCell.addEventListener('dragstart', handleDragStart);
            row.appendChild(lenCell);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('row-delete-btn');
            deleteBtn.innerHTML = '🗑';
            deleteBtn.title = 'Satırı sil';
            deleteBtn.addEventListener('click', () => {
                row.remove();
            });
            row.appendChild(deleteBtn);

            resultBody.appendChild(row);

            // Increment currentStart
            currentStart += length;
        });
    }

    // Drag-and-drop handlers for number cells
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.textContent);
        e.dataTransfer.effectAllowed = 'copy';
        e.target.classList.add('dragging');
        // Remove dragging class after drag ends
        e.target.addEventListener('dragend', () => {
            e.target.classList.remove('dragging');
        }, { once: true });
    }

    // Allow drop on any input/textarea on the page
    document.addEventListener('dragover', (e) => {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            target.classList.add('drop-target');
        }
    });

    document.addEventListener('dragleave', (e) => {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            target.classList.remove('drop-target');
        }
    });

    document.addEventListener('drop', (e) => {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            e.preventDefault();
            target.classList.remove('drop-target');
            const data = e.dataTransfer.getData('text/plain');
            // Insert at cursor position or append
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const value = target.value;
            target.value = value.substring(0, start) + data + value.substring(end);
            target.selectionStart = target.selectionEnd = start + data.length;
            target.focus();
        }
    });

    // Export button listeners
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
    document.getElementById('exportTxt').addEventListener('click', exportToTxt);

    // Get table data from card rows
    function getTableData() {
        const rows = resultBody.querySelectorAll('.list-row');
        const data = [];
        rows.forEach(row => {
            const name = row.querySelector('.row-name')?.textContent || '';
            const start = row.querySelector('.start-val')?.textContent || '';
            const length = row.querySelector('.length-val')?.textContent || '';
            data.push({ name, start: parseInt(start), length: parseInt(length) });
        });
        return data;
    }

    // Export to Excel
    function exportToExcel() {
        const data = getTableData();
        if (data.length === 0) {
            alert('İndirilecek veri yok!');
            return;
        }

        const wsData = [['ALAN ADI', 'BAŞLANGIÇ', 'UZUNLUK']];
        data.forEach(row => {
            wsData.push([row.name, row.start, row.length]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Column widths
        ws['!cols'] = [
            { wch: 25 },
            { wch: 12 },
            { wch: 12 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Optik Parametreler');
        XLSX.writeFile(wb, 'optik_parametreler.xlsx');
    }

    // Export to TXT
    function exportToTxt() {
        const data = getTableData();
        if (data.length === 0) {
            alert('İndirilecek veri yok!');
            return;
        }

        let txt = 'ALAN ADI\tBAŞLANGIÇ\tUZUNLUK\n';
        txt += '─'.repeat(40) + '\n';
        data.forEach(row => {
            txt += `${row.name}\t${row.start}\t${row.length}\n`;
        });

        const blob = new Blob(['\uFEFF' + txt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'optik_parametreler.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
});
