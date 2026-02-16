document.addEventListener('DOMContentLoaded', function () {
    const inputNumbers = document.getElementById('inputNumbers');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const tableBody = document.getElementById('tableBody');
    const totalCount = document.getElementById('totalCount');

    let formattedNumbers = [];

    // Format phone number to SMS format (only digits, without 90 prefix)
    function formatPhoneNumber(phone) {
        // Remove all non-digit characters
        let digits = phone.replace(/\D/g, '');

        // Handle different formats - remove country code if present
        if (digits.startsWith('90') && digits.length > 10) {
            // Has country code, remove it
            return digits.substring(2);
        } else if (digits.startsWith('0')) {
            // Starts with 0, remove it
            return digits.substring(1);
        } else if (digits.length === 10) {
            // 10 digit number, return as is
            return digits;
        }

        // Default: return cleaned digits
        return digits;
    }

    // Validate if a line looks like a phone number (has any digits)
    function isValidPhoneInput(line) {
        // Remove whitespace and check if it has at least some digits
        const digits = line.replace(/\D/g, '');
        return digits.length >= 3; // Accept any line with at least 3 digits
    }

    // Generate formatted numbers from input
    function generateNumbers() {
        const input = inputNumbers.value.trim();

        if (!input) {
            showEmptyState();
            return;
        }

        // Split by newlines and filter empty lines
        const lines = input.split(/[\r\n]+/).filter(line => line.trim());

        formattedNumbers = [];
        tableBody.innerHTML = '';

        let validCount = 0;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            if (isValidPhoneInput(trimmedLine)) {
                validCount++;
                const formatted = formatPhoneNumber(trimmedLine);
                const isInvalid = formatted.length !== 10;

                // Only add valid numbers to the export list
                if (!isInvalid) {
                    formattedNumbers.push(formatted);
                }

                const row = document.createElement('tr');
                row.style.animationDelay = `${index * 0.02}s`;
                row.dataset.rowIndex = validCount;

                if (isInvalid) {
                    row.classList.add('invalid-row');
                    const warningText = formatted.length < 10 ? 'Eksik numara!' : 'Fazla hane!';
                    row.innerHTML = `
                        <td>${validCount}</td>
                        <td>${escapeHtml(trimmedLine)}</td>
                        <td class="invalid-number">${formatted} <span class="warning-text">⚠️ ${warningText}</span></td>
                        <td class="delete-cell">
                            <button class="delete-btn" onclick="deleteRow(this)">Sil</button>
                        </td>
                    `;
                } else {
                    row.innerHTML = `
                        <td>${validCount}</td>
                        <td>${escapeHtml(trimmedLine)}</td>
                        <td>${formatted}</td>
                        <td></td>
                    `;
                }
                tableBody.appendChild(row);
            }
        });

        updateTotalCount();

        if (validCount === 0) {
            showEmptyState();
        }
    }

    // Update total count display
    function updateTotalCount() {
        const validRows = tableBody.querySelectorAll('tr:not(.invalid-row)').length;
        const invalidRows = tableBody.querySelectorAll('tr.invalid-row').length;
        if (invalidRows > 0) {
            totalCount.textContent = `Toplam: ${validRows} geçerli, ${invalidRows} hatalı numara`;
        } else {
            totalCount.textContent = `Toplam: ${validRows} numara`;
        }
    }

    // Delete row function (global scope)
    window.deleteRow = function (button) {
        const row = button.closest('tr');
        row.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            row.remove();
            // Renumber remaining rows
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach((r, i) => {
                r.querySelector('td:first-child').textContent = i + 1;
            });
            // Rebuild formattedNumbers from valid rows
            formattedNumbers = [];
            tableBody.querySelectorAll('tr:not(.invalid-row)').forEach(r => {
                const formattedCell = r.querySelector('td:nth-child(3)');
                if (formattedCell) {
                    formattedNumbers.push(formattedCell.textContent);
                }
            });
            updateTotalCount();
        }, 300);
    };

    // Show empty state message
    function showEmptyState() {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="empty-state">
                        <div class="empty-state-icon">📱</div>
                        <div class="empty-state-text">Henüz numara eklenmedi</div>
                    </div>
                </td>
            </tr>
        `;
        totalCount.textContent = 'Toplam: 0 numara';
        formattedNumbers = [];
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Copy formatted numbers to clipboard
    async function copyToClipboard() {
        if (formattedNumbers.length === 0) {
            showNotification('Kopyalanacak numara yok!', 'warning');
            return;
        }

        const text = formattedNumbers.join(',');

        try {
            await navigator.clipboard.writeText(text);
            showNotification('Numaralar panoya kopyalandı!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('Numaralar panoya kopyalandı!', 'success');
        }
    }

    // Download as TXT file
    function downloadAsTxt() {
        if (formattedNumbers.length === 0) {
            showNotification('İndirilecek numara yok!', 'warning');
            return;
        }

        const text = formattedNumbers.join(',');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `sms_numaralari_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('TXT dosyası indirildi!', 'success');
    }

    // Show notification
    function showNotification(message, type) {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;

        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            notification.style.color = 'white';
        } else if (type === 'warning') {
            notification.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            notification.style.color = 'white';
        }

        document.body.appendChild(notification);

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(50px); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2500);
    }

    // Event Listeners
    generateBtn.addEventListener('click', generateNumbers);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadAsTxt);

    // Initialize with empty state
    showEmptyState();
});
