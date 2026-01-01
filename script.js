// Calendar state
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Storage key
const STORAGE_KEY = 'happyCalendarEntries';

// Day labels
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Get entries from localStorage
function getEntries() {
    const entries = localStorage.getItem(STORAGE_KEY);
    return entries ? JSON.parse(entries) : {};
}

// Save entries to localStorage
function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Get entry key for a date
function getEntryKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Count words in text
function countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Initialize calendar
function initCalendar() {
    renderCalendar();
    setupEventListeners();
}

// Render calendar
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthDisplay = document.getElementById('currentMonth');
    
    // Update month display
    monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear grid
    calendarGrid.innerHTML = '';
    
    // Add day labels
    dayLabels.forEach(day => {
        const label = document.createElement('div');
        label.className = 'day-label';
        label.textContent = day;
        calendarGrid.appendChild(label);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const entries = getEntries();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'sticky-note-card empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const noteCard = document.createElement('div');
        const entryKey = getEntryKey(currentYear, currentMonth, day);
        const entry = entries[entryKey];
        
        noteCard.className = 'sticky-note-card';
        if (entry) {
            noteCard.classList.add('has-entry');
        }
        
        const dateNumber = document.createElement('div');
        dateNumber.className = 'date-number';
        dateNumber.textContent = day;
        noteCard.appendChild(dateNumber);
        
        if (entry) {
            const emoji = document.createElement('div');
            emoji.className = 'emoji-preview';
            emoji.textContent = '💛';
            noteCard.appendChild(emoji);
            
            const preview = document.createElement('div');
            preview.className = 'preview-text';
            preview.textContent = entry;
            noteCard.appendChild(preview);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'preview-text';
            placeholder.textContent = 'Click to add...';
            placeholder.style.color = '#999';
            placeholder.style.fontStyle = 'italic';
            noteCard.appendChild(placeholder);
        }
        
        noteCard.addEventListener('click', () => openNoteModal(currentYear, currentMonth, day));
        calendarGrid.appendChild(noteCard);
    }
}

// Open note modal
function openNoteModal(year, month, day) {
    const modal = document.getElementById('noteModal');
    const noteDate = document.getElementById('noteDate');
    const noteText = document.getElementById('noteText');
    const wordCount = document.getElementById('wordCount');
    
    const entryKey = getEntryKey(year, month, day);
    const entries = getEntries();
    const existingEntry = entries[entryKey] || '';
    
    // Set date display
    const dateObj = new Date(year, month, day);
    noteDate.textContent = `${monthNames[month]} ${day}, ${year}`;
    
    // Set text
    noteText.value = existingEntry;
    updateWordCount();
    
    // Show modal
    modal.classList.add('show');
    noteText.focus();
    
    // Setup save handler
    const saveBtn = document.getElementById('saveNote');
    saveBtn.onclick = () => saveNote(year, month, day);
    
    // Setup word count listener
    noteText.oninput = updateWordCount;
    
    // Setup enter key handler (prevent new lines if at word limit)
    noteText.onkeydown = (e) => {
        const words = countWords(noteText.value);
        if (e.key === 'Enter' && words >= 15) {
            e.preventDefault();
        }
    };
}

// Update word count display
function updateWordCount() {
    const noteText = document.getElementById('noteText');
    const wordCountElement = document.getElementById('wordCount');
    const wordCountSpan = wordCountElement.parentElement;
    
    const words = countWords(noteText.value);
    wordCountElement.textContent = words;
    
    // Update styling based on word count
    wordCountSpan.classList.remove('warning', 'error');
    if (words > 15) {
        wordCountSpan.classList.add('error');
        document.getElementById('saveNote').disabled = true;
    } else if (words === 15) {
        wordCountSpan.classList.add('warning');
        document.getElementById('saveNote').disabled = false;
    } else {
        document.getElementById('saveNote').disabled = false;
    }
    
    // Truncate text if over 15 words
    if (words > 15) {
        const wordsArray = noteText.value.trim().split(/\s+/);
        const first15 = wordsArray.slice(0, 15).join(' ');
        const cursorPos = noteText.selectionStart;
        noteText.value = first15;
        // Try to maintain cursor position
        noteText.setSelectionRange(Math.min(cursorPos, first15.length), Math.min(cursorPos, first15.length));
    }
}

// Save note
function saveNote(year, month, day) {
    const noteText = document.getElementById('noteText');
    const text = noteText.value.trim();
    const words = countWords(text);
    
    if (words > 15) {
        alert('Please limit your response to 15 words or less!');
        return;
    }
    
    const entryKey = getEntryKey(year, month, day);
    const entries = getEntries();
    
    if (text) {
        entries[entryKey] = text;
    } else {
        delete entries[entryKey];
    }
    
    saveEntries(entries);
    closeNoteModal();
    renderCalendar();
}

// Close note modal
function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    modal.classList.remove('show');
}

// Export entries to JSON file
function exportEntries() {
    const entries = getEntries();
    const exportData = {
        happyCalendarEntries: entries
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `happy-calendar-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Import entries from JSON file
function importEntries(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate that it's an object (not array or other type)
            if (typeof importedData !== 'object' || Array.isArray(importedData)) {
                alert('Invalid file format. Please select a valid JSON file.');
                return;
            }
            
            // Handle both new format (with happyCalendarEntries key) and old format (plain object)
            let entriesToImport;
            if (importedData.happyCalendarEntries && typeof importedData.happyCalendarEntries === 'object') {
                // New format with happyCalendarEntries key
                entriesToImport = importedData.happyCalendarEntries;
            } else {
                // Old format - plain object (for backward compatibility)
                entriesToImport = importedData;
            }
            
            // Validate entries structure
            if (typeof entriesToImport !== 'object' || Array.isArray(entriesToImport)) {
                alert('Invalid file format. The file should contain happyCalendarEntries data.');
                return;
            }
            
            // Ask user if they want to merge or replace
            const currentEntries = getEntries();
            const hasExistingEntries = Object.keys(currentEntries).length > 0;
            
            if (hasExistingEntries) {
                const choice = confirm('You have existing entries. Click OK to replace all data, or Cancel to merge with existing entries.');
                if (choice) {
                    // Replace all data
                    saveEntries(entriesToImport);
                } else {
                    // Merge data (imported data takes precedence for overlapping dates)
                    const mergedData = { ...currentEntries, ...entriesToImport };
                    saveEntries(mergedData);
                }
            } else {
                // No existing data, just import
                saveEntries(entriesToImport);
            }
            
            renderCalendar();
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error reading file. Please make sure it\'s a valid JSON file.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// Setup event listeners
function setupEventListeners() {
    // Previous month button
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    // Next month button
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportEntries);
    
    // Import file input
    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importEntries(file);
            // Reset the input so the same file can be imported again if needed
            e.target.value = '';
        }
    });
    
    // Close modal buttons
    document.getElementById('closeModal').addEventListener('click', closeNoteModal);
    
    // Close modal when clicking outside
    document.getElementById('noteModal').addEventListener('click', (e) => {
        if (e.target.id === 'noteModal') {
            closeNoteModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNoteModal();
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCalendar);

