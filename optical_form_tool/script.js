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

            // Add to table
            const tr = document.createElement('tr');

            // Name Cell
            const tdName = document.createElement('td');
            tdName.textContent = displayName;
            tr.appendChild(tdName);

            // Start Cell
            const tdStart = document.createElement('td');
            tdStart.innerHTML = `<span style="color:red; font-weight:bold">${currentStart}</span> 'den başlar`;
            tr.appendChild(tdStart);

            // Length Cell
            const tdLen = document.createElement('td');
            tdLen.innerHTML = `<span style="color:red; font-weight:bold">${length}</span> Birim`;
            tr.appendChild(tdLen);

            resultBody.appendChild(tr);

            // Increment currentStart
            currentStart += length;
        });
    }
});
