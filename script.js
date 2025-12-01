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

    // Import Elements
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file-input');

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

    function createNotePair(cue = '', notes = '', isImportant = false) {
        const notePair = document.createElement('div');
        notePair.className = 'note-pair p-5 bg-slate-50 rounded-xl space-y-4';
        if (isImportant) {
            notePair.classList.add('is-important');
        }

        notePair.innerHTML = `
            <div class="flex justify-end items-center gap-2">
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

    // --- IMPORT LOGIC ---

    importBtn.addEventListener('click', () => importFileInput.click());

    importFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            handleFileUpload(file);
            importFileInput.value = '';
        }
    });

    function handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                if (file.name.endsWith('.json')) {
                    loadFromJson(content);
                } else if (file.name.endsWith('.md')) {
                    loadFromMarkdown(content);
                } else {
                    showNotification('Unsupported file type. Use JSON or MD.', true);
                }
            } catch (err) {
                console.error(err);
                showNotification('Error parsing file.', true);
            }
        };
        reader.readAsText(file);
    }

    function loadFromJson(jsonString) {
        const data = JSON.parse(jsonString);
        clearEditor();

        if (data.topic) mainTopicInput.value = data.topic;
        if (data.summary) summaryTextarea.value = data.summary;

        if (data.pairs && Array.isArray(data.pairs)) {
            data.pairs.forEach(pair => {
                createNotePair(pair.cue, pair.notes, pair.isImportant);
            });
        }

        if (notesContainer.children.length === 0) createNotePair();
        showNotification('✅ Notes imported from JSON!');
    }

    function loadFromMarkdown(mdString) {
        clearEditor();

        const topicMatch = mdString.match(/^# (.*)/);
        if (topicMatch) mainTopicInput.value = topicMatch[1].trim();

        const summaryRegex = /> \[!SUMMARY\] Summary\n((?:> .*\n?)*)/;
        const summaryMatch = mdString.match(summaryRegex);
        if (summaryMatch) {
            const rawSummary = summaryMatch[1].replace(/^> /gm, '').trim();
            summaryTextarea.value = rawSummary;
        }

        const pairRegex = /> \[!QUESTION\]- (.*)\n((?:> .*\n?)*)/g;
        let match;
        let pairCount = 0;

        while ((match = pairRegex.exec(mdString)) !== null) {
            let cue = match[1].trim();
            let notesRaw = match[2];

            let isImportant = false;
            if (cue.startsWith('⭐')) {
                isImportant = true;
                cue = cue.replace('⭐', '').trim();
            }

            const notes = notesRaw.replace(/^> /gm, '').trim();

            createNotePair(cue, notes, isImportant);
            pairCount++;
        }

        if (pairCount === 0) createNotePair();
        showNotification('✅ Notes imported from Markdown!');
    }

    function clearEditor() {
        mainTopicInput.value = '';
        summaryTextarea.value = '';
        notesContainer.innerHTML = '';
    }

    // --- EXPORT LOGIC ---

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
            clearEditor();
            createNotePair();
            showNotification('Notes have been cleared.');
        }
    });

    bulkAddBtn.addEventListener('click', () => { bulkAddModal.style.display = 'flex'; });
    cancelBulkAddBtn.addEventListener('click', () => { bulkAddModal.style.display = 'none'; });

    importBulkAddBtn.addEventListener('click', () => {
        const text = bulkInputArea.value.trim();
        if (!text) return;
        const pairs = text.split(/\n\s*\n/);
        let count = 0;
        pairs.forEach(p => {
            const parts = p.split(/\n---\n/);
            if (parts.length === 2) {
                const cue = parts[0].trim();
                const notes = parts[1].trim();
                if (cue || notes) {
                    createNotePair(cue, notes);
                    count++;
                }
            }
        });
        bulkInputArea.value = '';
        bulkAddModal.style.display = 'none';
        if (count > 0) showNotification(`✅ Imported ${count} note pairs!`);
    });

    // --- INITIALIZATION ---
    createNotePair();
});