// =================================================================
// Cornell Notes App - Editor Logic
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENT REFERENCES ---
    const notesContainer = document.getElementById('notes-container');
    const addPairBtn = document.getElementById('add-pair-btn');
    const mainTopicInput = document.getElementById('main-topic');
    const summaryTextarea = document.getElementById('summary');
    const downloadJsonBtn = document.getElementById('download-json-btn');
    const downloadMdBtn = document.getElementById('download-md-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const notification = document.getElementById('notification');

    // Bulk Add Modal Elements
    const bulkAddBtn = document.getElementById('bulk-add-btn');
    const bulkAddModal = document.getElementById('bulk-add-modal');
    const cancelBulkAddBtn = document.getElementById('cancel-bulk-add');
    const importBulkAddBtn = document.getElementById('import-bulk-add');
    const bulkInputArea = document.getElementById('bulk-input-area');

    // --- CORE FUNCTIONS ---

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
        if (isError) {
            notification.classList.add('bg-red-100', 'text-red-800');
        } else {
            notification.classList.add('bg-green-100', 'text-green-800');
        }
        setTimeout(() => notification.classList.add('hidden'), 4000);
    }

    function updateMoveButtons() {
        const pairs = notesContainer.querySelectorAll('.note-pair');
        pairs.forEach((pair, index) => {
            pair.querySelector('.move-up-btn').disabled = (index === 0);
            pair.querySelector('.move-down-btn').disabled = (index === pairs.length - 1);
        });
    }

    // --- Drag & Drop Helpers ---
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.note-pair:not(.dragging)')];

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

    // Container Drag Over Event
    notesContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(notesContainer, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            if (afterElement == null) {
                notesContainer.appendChild(draggable);
            } else {
                notesContainer.insertBefore(draggable, afterElement);
            }
        }
    });

    // Cleanup on drop
    notesContainer.addEventListener('drop', (e) => {
        // Just to trigger update buttons if needed
        updateMoveButtons();
    });


    function createNotePair(cue = '', notes = '', isImportant = false) {
        const notePair = document.createElement('div');
        notePair.className = 'note-pair p-5 bg-slate-50 rounded-xl space-y-4 transition-colors';
        // notePair.setAttribute('draggable', 'true'); // Removed default draggable
        if (isImportant) {
            notePair.classList.add('is-important');
        }

        notePair.innerHTML = `
            <div class="flex justify-end items-center gap-2">
                <div class="drag-handle control-btn cursor-grab" title="Drag to reorder">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM7 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM7 8.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM7 11.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM4 8.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM4 11.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                   </svg>
                </div>
                <button class="control-btn star-btn" title="Mark as important">⭐</button>
                <button class="control-btn move-up-btn" title="Move Up">▲</button>
                <button class="control-btn move-down-btn" title="Move Down">▼</button>
                <button class="control-btn remove-btn text-red-500" title="Remove">×</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-1">
                    <label class="block text-sm font-medium text-slate-600 mb-1">Cue / Question</label>
                    <textarea rows="3" class="cue-input w-full p-2 bg-white border border-slate-300 rounded-md resize-y">${cue}</textarea>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-slate-600 mb-1">Notes (Markdown supported)</label>
                    <textarea rows="3" class="notes-input w-full p-2 bg-white border border-slate-300 rounded-md resize-y">${notes}</textarea>
                </div>
            </div>`;

        notesContainer.appendChild(notePair);

        // --- Drag Logic ---
        const dragHandle = notePair.querySelector('.drag-handle');

        // 1. Activate Draggable Mode ONLY when handle is pressed
        dragHandle.addEventListener('mousedown', () => {
            notePair.setAttribute('draggable', 'true');
        });

        // 2. Deactivate Draggable Mode on mouseup (if click didn't result in drag)
        dragHandle.addEventListener('mouseup', () => {
            notePair.setAttribute('draggable', 'false');
        });

        // 3. Drag Start
        notePair.addEventListener('dragstart', (e) => {
            // Double check: if not draggable, don't start
            if (notePair.getAttribute('draggable') !== 'true') {
                e.preventDefault();
                return;
            }

            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';

            document.body.classList.add('is-dragging');

            // Timeout allows the ghost image to form before we hide the source
            setTimeout(() => {
                notePair.classList.add('dragging');
            }, 0);
        });

        // 4. Drag End / Cleanup
        notePair.addEventListener('dragend', () => {
            document.body.classList.remove('is-dragging');
            notePair.classList.remove('dragging');
            notePair.setAttribute('draggable', 'false'); // Reset state
            updateMoveButtons();
        });

        const starBtn = notePair.querySelector('.star-btn');
        if (isImportant) starBtn.classList.add('is-important');

        starBtn.addEventListener('click', () => {
            notePair.classList.toggle('is-important');
            starBtn.classList.toggle('is-important');
        });
        notePair.querySelector('.remove-btn').addEventListener('click', () => {
            notePair.remove();
            updateMoveButtons();
        });
        notePair.querySelector('.move-up-btn').addEventListener('click', () => {
            if (notePair.previousElementSibling) {
                notesContainer.insertBefore(notePair, notePair.previousElementSibling);
                updateMoveButtons();
            }
        });
        notePair.querySelector('.move-down-btn').addEventListener('click', () => {
            if (notePair.nextElementSibling) {
                notesContainer.insertBefore(notePair.nextElementSibling, notePair);
                updateMoveButtons();
            }
        });

        updateMoveButtons();
    }

    // --- DATA HANDLING ---

    function getAppState() {
        const notePairsData = [];
        document.querySelectorAll('.note-pair').forEach(pair => {
            notePairsData.push({
                cue: pair.querySelector('.cue-input').value,
                notes: pair.querySelector('.notes-input').value,
                isImportant: pair.classList.contains('is-important')
            });
        });

        return {
            topic: mainTopicInput.value,
            summary: summaryTextarea.value,
            pairs: notePairsData,
            lastModified: new Date().toISOString()
        };
    }

    function saveNotesAsJson() {
        const currentState = getAppState();
        const stateJson = JSON.stringify(currentState, null, 2);
        const topic = currentState.topic.trim() || 'untitled-notes';
        const filename = `${topic.toLowerCase().replace(/[\s\W-]+/g, '-')}.json`;

        const blob = new Blob([stateJson], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('✅ Notes saved as JSON!');
    }

    function generateMarkdown(state) {
        const { topic, summary, pairs } = state;
        let notesContent = '';
        pairs.forEach(pair => {
            let cue = pair.cue.trim();
            const notes = pair.notes.trim();
            if (pair.isImportant) cue = `⭐ ${cue}`;
            if (cue || notes) {
                notesContent += `> [!QUESTION]- ${cue}\n`;
                notes.split('\n').forEach(line => {
                    notesContent += `> ${line}\n`;
                });
                notesContent += `\n`;
            }
        });

        let summaryContent = '';
        if (summary) {
            summaryContent += `> [!SUMMARY] Summary\n`;
            summary.split('\n').forEach(line => {
                summaryContent += `> ${line.trim()}\n`;
            });
        }

        return `# ${topic || 'My Notes'}\n\n${notesContent.trim()}\n\n${summaryContent.trim()}`.trim();
    }

    function saveNotesAsMarkdown() {
        const currentState = getAppState();
        const markdownString = generateMarkdown(currentState);
        const topic = currentState.topic.trim() || 'untitled-notes';
        const filename = `${topic.toLowerCase().replace(/[\s\W-]+/g, '-')}.md`;

        const blob = new Blob([markdownString], { type: 'text/markdown' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('✅ Notes saved as Markdown!');
    }

    // --- EVENT LISTENERS ---

    addPairBtn.addEventListener('click', () => createNotePair());
    downloadJsonBtn.addEventListener('click', saveNotesAsJson);
    downloadMdBtn.addEventListener('click', saveNotesAsMarkdown);

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
            mainTopicInput.value = '';
            summaryTextarea.value = '';
            notesContainer.innerHTML = '';
            createNotePair();
            showNotification('Notes have been cleared.');
        }
    });

    bulkAddBtn.addEventListener('click', () => { bulkAddModal.style.display = 'flex'; });
    cancelBulkAddBtn.addEventListener('click', () => { bulkAddModal.style.display = 'none'; });

    importBulkAddBtn.addEventListener('click', () => {
        let text = bulkInputArea.value;
        if (!text.trim()) return;

        // 1. Normalize Line Endings (handle Windows \r\n)
        text = text.replace(/\r\n/g, '\n').trim();

        // 2. Split by blank lines (flexible for multiple newlines)
        const pairs = text.split(/\n\s*\n/);

        let count = 0;
        pairs.forEach(p => {
            // 3. Robust Separator Logic:
            // Looks for a newline, optional whitespace, 3 or more dashes, optional whitespace, newline.
            const parts = p.split(/\n\s*-{3,}\s*\n/);

            if (parts.length === 2) {
                const cue = parts[0].trim();
                const notes = parts[1].trim();
                if (cue || notes) {
                    createNotePair(cue, notes);
                    count++;
                }
            } else if (parts.length === 1 && p.includes('---')) {
                // Fallback: If regex failed but '---' exists, try simpler split
                const simpleParts = p.split('---');
                if (simpleParts.length >= 2) {
                        // Join rest in case notes had --- in them (unlikely but possible)
                        const cue = simpleParts[0].trim();
                        const notes = simpleParts.slice(1).join('---').trim();
                        createNotePair(cue, notes);
                        count++;
                }
            }
        });

        bulkInputArea.value = '';
        bulkAddModal.style.display = 'none';

        if (count > 0) {
            showNotification(`✅ Imported ${count} note pairs!`);
        } else {
            showNotification(`⚠️ Could not find valid notes. Check format.`, true);
        }
    });

    // --- INITIALIZATION ---
    createNotePair();
});