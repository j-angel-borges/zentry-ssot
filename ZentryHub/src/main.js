import './style.css';
import db from './ssot-db.json';

// App State
const state = {
  activeView: 'backlog', // 'backlog', 'ideas', 'metrics', 'branding', 'doc'
  activeDocPath: '',
  collapsedFolders: {
    '01-vision-y-producto': false,
    '02-arquitectura-tecnica': false,
    '03-marketing-y-ventas': false,
    '04-operaciones-y-roadmap': false,
    '05-mesa-de-trabajo': false
  },
  filters: {
    vertical: 'all',
    priority: 'all',
    status: 'all'
  },
  tasks: [],
  currentEditingTask: null,
  // Espacio Personal state
  personalDate: new Date().toISOString().split('T')[0],
  chatMessages: [],
  pendingSuggestions: null,
  calendarEvents: [],
  calendarConnected: false
};

// Initialize Tasks from LocalStorage or DB
function initTasks() {
  const stored = localStorage.getItem('zentry_tasks');
  if (stored) {
    try {
      state.tasks = JSON.parse(stored);
    } catch (e) {
      state.tasks = JSON.parse(JSON.stringify(db.tasks));
    }
  } else {
    state.tasks = JSON.parse(JSON.stringify(db.tasks));
    localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks));
  }
}

initTasks();

// --- Storage & Data Helpers for Backlog widgets ---
function getMITData() {
  const defaultMIT = [
    { text: 'Diseñar barra de tiempo superpuesta (Timer UI Overlay) en Jetpack Compose', checked: false },
    { text: 'Implementar lógica de límites de tiempo dinámicos basados en ciclo circadiano', checked: false },
    { text: 'Finalizar Demo Venta Directa con factor WOW', checked: false }
  ];
  const stored = localStorage.getItem('zentry_mit');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return defaultMIT; }
  }
  return defaultMIT;
}

function saveMITData(mit) {
  localStorage.setItem('zentry_mit', JSON.stringify(mit));
}

function getCorkboardObjectives() {
  const defaultObjs = [
    'Lanzar prototipo ZentryOS Kiosk Mode en Android.',
    'Completar guión comercial y cerrar primer cliente prospecto.',
    'Sincronizar base de conocimientos con todos los agentes de IA.'
  ];
  const stored = localStorage.getItem('zentry_objectives');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return defaultObjs; }
  }
  return defaultObjs;
}

function saveCorkboardObjectives(objs) {
  localStorage.setItem('zentry_objectives', JSON.stringify(objs));
}

// --- Timeblock Data Helpers ---
function getTimeblockData(dateStr) {
  const key = `zentry_timeblock_${dateStr}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return {}; }
  }
  return {};
}

function saveTimeblockData(dateStr, data) {
  localStorage.setItem(`zentry_timeblock_${dateStr}`, JSON.stringify(data));
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push({ time: `${hh}:${mm}`, isHour: m === 0 });
    }
  }
  return slots;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatTime12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getCurrentTimePosition() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (h < 6 || h > 23) return null;
  const slotIndex = (h - 6) * 4 + Math.floor(m / 15);
  const minuteOffset = m % 15;
  const pixelOffset = slotIndex * 38 + (minuteOffset / 15) * 38;
  return pixelOffset;
}

// --- AI Chat Helpers ---
function getChatHistory() {
  const stored = localStorage.getItem('zentry_chat_history');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return []; }
  }
  return [];
}

function saveChatHistory(messages) {
  // Keep only last 50 messages
  const trimmed = messages.slice(-50);
  localStorage.setItem('zentry_chat_history', JSON.stringify(trimmed));
}

// Markdown Parser Utility
function mdToHtml(md) {
  if (!md) return '';
  let html = md.trim().replace(/\r\n/g, '\n');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Emojis lists and checkboxes
  html = html.replace(/-\s*\[\s*\]\s*(.*$)/gim, '<li><input type="checkbox" disabled> $1</li>');
  html = html.replace(/-\s*\[x\]\s*(.*$)/gim, '<li><input type="checkbox" checked disabled> $1</li>');

  // Unordered lists
  html = html.replace(/^\s*[\*\-]\s+(.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\n<ul>/g, '\n');

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>');
  html = html.replace(/<\/ol>\n<ol>/g, '\n');

  // Tables
  const tableRegex = /((?:\|[^\n]*\|(?:\r?\n|$))+)/g;
  html = html.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 2) return match;
    if (!lines[1].includes('-')) return match;
    
    let tableHtml = '<table><thead>';
    const headers = lines[0].split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
    tableHtml += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
    
    for (let i = 2; i < lines.length; i++) {
      const cols = lines[i].split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableHtml += '<tr>' + cols.map(c => `<td>${c}</td>`).join('') + '</tr>';
    }
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // Bold / Italic
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

  // Links (convert file scheme or relative md files to hash routes)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (url.startsWith('file:///') || url.includes('.md')) {
      const cleanUrl = url.replace('file:///', '');
      const parts = cleanUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const folderName = parts[parts.length - 2];
      if (folderName && lastPart) {
        return `<a href="#doc/${folderName}/${lastPart}" class="doc-link">${text}</a>`;
      }
    }
    return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
  });

  // Paragraphs
  const blocks = html.split('\n\n');
  const parsedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<pre') || trimmed.startsWith('<table') || trimmed.startsWith('---')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });
  
  return parsedBlocks.join('\n');
}

// Format Date Utility
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Set global metadata in sidebar footer
document.getElementById('db-generated-date').textContent = formatDate(db.metadata.generatedAt);

// Calculate overall progress across pages
function calculateGlobalProgress() {
  let totalProgress = 0;
  let count = 0;
  db.pages.forEach(p => {
    if (p.metadata && p.metadata.progress) {
      const pVal = parseInt(p.metadata.progress);
      if (!isNaN(pVal)) {
        totalProgress += pVal;
        count++;
      }
    }
  });
  return count > 0 ? Math.round(totalProgress / count) : 25;
}

const globalProgressValue = calculateGlobalProgress();
document.getElementById('global-progress').style.width = `${globalProgressValue}%`;
document.getElementById('global-progress-text').textContent = `${globalProgressValue}%`;

// Build Document Tree in Sidebar
function buildDocTree() {
  const treeContainer = document.getElementById('ssot-tree');
  treeContainer.innerHTML = '';

  const folders = {};
  // Group pages by directory
  db.pages.forEach(page => {
    if (!folders[page.directory]) {
      folders[page.directory] = [];
    }
    folders[page.directory].push(page);
  });

  // Order directory list alphabetically or logically
  const sortedFolders = Object.keys(folders).sort();

  sortedFolders.forEach(dir => {
    const folderNode = document.createElement('div');
    folderNode.className = `folder-node ${state.collapsedFolders[dir] ? 'collapsed' : ''}`;
    folderNode.dataset.dir = dir;

    // Friendly Folder Title
    let friendlyName = dir.replace(/^\d+-/, '').replace(/-/g, ' ');
    friendlyName = friendlyName.charAt(0).toUpperCase() + friendlyName.slice(1);
    if (dir === '05-mesa-de-trabajo') friendlyName = 'Mesa de Trabajo 🎨';

    const folderHeader = document.createElement('div');
    folderHeader.className = 'folder-header';
    folderHeader.innerHTML = `
      <span class="folder-toggle-icon">▼</span>
      <span class="folder-icon">📁</span>
      <span class="folder-title">${friendlyName}</span>
    `;

    // Toggle Collapse listener
    folderHeader.addEventListener('click', (e) => {
      state.collapsedFolders[dir] = !state.collapsedFolders[dir];
      folderNode.classList.toggle('collapsed');
    });

    const folderPages = document.createElement('div');
    folderPages.className = 'folder-pages';

    // Sort pages: index/readme first, then alphabetical
    const sortedPages = folders[dir].sort((a, b) => {
      if (a.filename.toLowerCase().includes('readme')) return -1;
      if (b.filename.toLowerCase().includes('readme')) return 1;
      return a.title.localeCompare(b.title);
    });

    sortedPages.forEach(page => {
      const pageNode = document.createElement('a');
      pageNode.href = `#doc/${page.path}`;
      pageNode.className = 'page-node';
      if (state.activeView === 'doc' && state.activeDocPath === page.path) {
        pageNode.classList.add('active');
      }
      
      // Page Emoji Icon
      let emoji = '📄';
      if (page.filename.includes('readme')) emoji = '📖';
      if (page.filename.includes('ludopatia') || page.filename.includes('adiccion')) emoji = '🎮';
      if (page.filename.includes('problema')) emoji = '🧠';
      if (page.filename.includes('control') || page.filename.includes('mdm')) emoji = '🔒';
      if (page.filename.includes('telemetria')) emoji = '📡';
      if (page.filename.includes('compose')) emoji = '🎨';
      if (page.filename.includes('demo')) emoji = '🎭';
      if (page.filename.includes('banco')) emoji = '💡';
      if (page.filename.includes('backlog') || page.filename.includes('tareas')) emoji = '📋';
      if (page.filename.includes('roadmap')) emoji = '📅';

      pageNode.innerHTML = `
        <span class="page-icon">${emoji}</span>
        <span class="page-title-text">${page.title}</span>
      `;
      folderPages.appendChild(pageNode);
    });

    folderNode.appendChild(folderHeader);
    folderNode.appendChild(folderPages);
    treeContainer.appendChild(folderNode);
  });
}

// Views Renderers
const renderers = {
  // 1. Kanban Backlog View
  backlog: () => {
    // Add backlog-view class to workspace
    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.add('backlog-view');

    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #ebf1f5 0%, #c2f4e7 50%, #d6c8fa 100%)';
    document.getElementById('page-icon').textContent = '📋';
    document.getElementById('page-title').textContent = 'Tablero Backlog';

    const container = document.getElementById('workspace-content');

    if (state.backlogMode === 'selection') {
      document.getElementById('properties-block').style.display = 'none';
      container.innerHTML = `
        <div class="backlog-selector-container">
          <a href="#backlog/personal" class="selector-card">
            <div class="selector-card-icon">🧘</div>
            <span class="selector-card-title">Espacio Personal</span>
            <span class="selector-card-desc">Tu cabina de productividad: timeblocking, asistente IA y conexión con Google Calendar.</span>
            <button class="btn-selector-enter">Entrar al Espacio</button>
          </a>
          <a href="#backlog/zentry" class="selector-card">
            <div class="selector-card-icon">☄️</div>
            <span class="selector-card-title">Tablero Zentry</span>
            <span class="selector-card-desc">Coordinación del roadmap comercial, arquitectura técnica MVP y ecosistema ZentryOS.</span>
            <button class="btn-selector-enter">Entrar al Tablero</button>
          </a>
        </div>
      `;
      return;
    }

    // Personal mode → Espacio Personal (timeblock + AI chat)
    if (state.backlogMode === 'personal') {
      document.getElementById('properties-block').style.display = 'none';
      document.getElementById('page-banner').style.display = 'none';
      document.querySelector('.workspace-header').style.display = 'none';
      renderEspacioPersonal(container);
      return;
    }

    document.getElementById('properties-block').style.display = 'flex';
    container.innerHTML = `
      <div class="backlog-layout-grid">
        <!-- Left panel: 3 M.I.T. -->
        <div class="backlog-left-col">
          <div class="mit-card glass-panel">
            <div class="mit-header">
              <span class="mit-icon">🎯</span>
              <h3 class="mit-title">3 Indispensables de Hoy</h3>
            </div>
            <div class="mit-list" id="mit-list-container">
              <!-- Loaded dynamically -->
            </div>
          </div>
        </div>

        <!-- Center panel: Kanban Board -->
        <div class="backlog-center-col">
          <div class="backlog-header-controls">
            <a href="#backlog" class="btn-back-to-selector">⬅️ Volver a Selección</a>
            <span class="backlog-mode-badge">${state.backlogMode === 'personal' ? 'Personal' : 'Zentry'}</span>
          </div>

          <div class="filter-bar">
            <div class="filter-group">
              <label class="filter-label">🏷️ Vertical:</label>
              <select id="filter-vertical" class="filter-select">
                <option value="all">Todas</option>
                <option value="tec">Técnica (02-arquitectura)</option>
                <option value="prod">Producto (01-vision)</option>
                <option value="mkt">Ventas / Marketing (03-ventas)</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">⚡ Prioridad:</label>
              <select id="filter-priority" class="filter-select">
                <option value="all">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div class="filter-bar-actions">
              <button id="add-task-btn" class="btn-add-task">＋ Nueva Tarea</button>
              <button id="reset-tasks-btn" class="btn-reset-tasks" title="Restaurar tareas por defecto del SSOT">🔄 Restaurar</button>
            </div>
          </div>
          <div class="kanban-board">
            <div class="kanban-column" id="col-pendiente">
              <div class="column-header">
                <span class="column-title">⏳ Por Hacer</span>
                <span class="column-count" id="count-pendiente">0</span>
              </div>
              <div class="kanban-cards" id="cards-pendiente"></div>
            </div>
            <div class="kanban-column" id="col-progreso">
              <div class="column-header">
                <span class="column-title">⚡ En Curso</span>
                <span class="column-count" id="count-progreso">0</span>
              </div>
              <div class="kanban-cards" id="cards-progreso"></div>
            </div>
            <div class="kanban-column" id="col-completado">
              <div class="column-header">
                <span class="column-title">✅ Completado</span>
                <span class="column-count" id="count-completado">0</span>
              </div>
              <div class="kanban-cards" id="cards-completado"></div>
            </div>
          </div>
        </div>

        <!-- Right panel: Corkboard objectives -->
        <div class="backlog-right-col">
          <div class="corkboard-widget glass-panel">
            <div class="corkboard-header">
              <span class="corkboard-icon">📌</span>
              <h3 class="corkboard-title">Objetivos de la Semana</h3>
            </div>
            <div class="corkboard-board" id="corkboard-objectives">
              <!-- Loaded dynamically -->
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Cards
    renderKanbanCards();

    // Bind Filter Change events
    document.getElementById('filter-vertical').value = state.filters.vertical;
    document.getElementById('filter-priority').value = state.filters.priority;

    document.getElementById('filter-vertical').addEventListener('change', (e) => {
      state.filters.vertical = e.target.value;
      renderKanbanCards();
    });
    document.getElementById('filter-priority').addEventListener('change', (e) => {
      state.filters.priority = e.target.value;
      renderKanbanCards();
    });

    // Add task click listener
    document.getElementById('add-task-btn').addEventListener('click', () => {
      openTaskModalForCreate();
    });

    // Reset tasks listener
    document.getElementById('reset-tasks-btn').addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas restaurar las tareas por defecto del SSOT? Esto borrará tus cambios locales.')) {
        localStorage.removeItem('zentry_tasks');
        initTasks();
        renderKanbanCards();
      }
    });

    // Render 3 M.I.T. Widget
    renderMITWidget();

    // Render Corkboard Objectives
    renderCorkboardObjectives();

    // Setup Drag and Drop dropzones
    setupDragAndDrop();
  },

  // 2. Google Keep Notes View
  ideas: () => {
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #1c142e 0%, #0c0d10 100%)';
    document.getElementById('page-icon').textContent = '💡';
    document.getElementById('page-title').textContent = 'Banco de Ideas (Keep)';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    
    let html = `<div class="keep-notes-container">`;
    db.ideas.forEach(note => {
      const taskListItems = note.tasks.map(t => `<li>${t}</li>`).join('');
      html += `
        <div class="keep-card">
          <div class="keep-header">
            <h3 class="keep-title">${note.fullTitle}</h3>
            <span class="keep-category">${note.category}</span>
          </div>
          <div class="keep-body">${note.body.replace(/\n/g, '<br>')}</div>
          ${taskListItems ? `<div class="keep-tasks-title">⚙️ Pendientes Inferidos:</div><ul class="keep-tasks-list">${taskListItems}</ul>` : ''}
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  },

  // 3. Metrics and KPIs View
  metrics: () => {
    const page = db.pages.find(p => p.filename === 'progreso-y-metricas.md');
    if (page) {
      renderers.doc(page.path);
    } else {
      document.getElementById('workspace-content').innerHTML = `<p>Documento de métricas no encontrado.</p>`;
    }
  },

  // 4. Branding and Colors (Mesa de Trabajo)
  branding: () => {
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #1c142e 0%, #0c0d10 100%)';
    document.getElementById('page-icon').textContent = '🎨';
    document.getElementById('page-title').textContent = 'Mesa de Trabajo (Branding)';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    
    // Core color variables matching style.css and colorimetria-y-diseno.md
    const colors = [
      { name: 'Púrpura Zentry', hex: '#533B87', desc: 'Color dominante. Utilizado en textos de botones activos, interruptores de selección y cabeceras destacadas.' },
      { name: 'Lavanda Zentry', hex: '#D6C8FA', desc: 'Color de acento e interactividad. Usado en fondos de botones principales ("Get Started") e iconos.' },
      { name: 'Verde Menta', hex: '#C2F4E7', desc: 'Color de éxito y progreso. Usado en barras de progreso y fondos de gradiente aurora.' },
      { name: 'Blanco Glacial', hex: '#EBF1F5', desc: 'Color de texto principal y de superficies claras para legibilidad premium.' },
      { name: 'Gris Neutro Oscuro', hex: '#4A5160', desc: 'Color secundario de contraste y legibilidad. Usado en bordes y textos secundarios.' }
    ];

    let html = `
      <div class="markdown-body">
        <h2>🎨 Colorimetría Oficial de ZentryOS</h2>
        <p>Haz clic en cualquier tarjeta para copiar el código de color HEX en tu portapapeles y aplicarlo en tus entornos de desarrollo.</p>
        <div class="color-swatch-grid">
    `;

    colors.forEach(c => {
      html += `
        <div class="color-card" data-hex="${c.hex}">
          <div class="color-preview" style="background-color: ${c.hex}"></div>
          <div class="color-info">
            <span class="color-name">${c.name}</span>
            <span class="color-code">${c.hex}</span>
            <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${c.desc}</span>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <h2 style="margin-top: 40px;">✏️ Tipografía y Fuentes</h2>
        <p>ZentryOS utiliza una combinación tipográfica moderna y legible de Google Fonts:</p>
        <ul>
          <li><strong>Outfit</strong>: Para titulares de nivel superior, títulos de retos y logos. Da un estilo tecnológico premium.</li>
          <li><strong>Inter</strong>: Para textos de lectura largos, cuadros de diálogo y respuestas del tutor de IA. Ofrece legibilidad óptima.</li>
        </ul>
      </div>
      <div class="copy-toast" id="copy-toast">Código HEX copiado!</div>
    `;

    container.innerHTML = html;

    // Clipboard Listener
    container.querySelectorAll('.color-card').forEach(card => {
      card.addEventListener('click', () => {
        const hex = card.dataset.hex;
        navigator.clipboard.writeText(hex).then(() => {
          const toast = document.getElementById('copy-toast');
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 2000);
        });
      });
    });
  },

  // 5. IA Context View
  iacontext: () => {
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #1c142e 0%, #0c0d10 100%)';
    document.getElementById('page-icon').textContent = '🤖';
    document.getElementById('page-title').textContent = 'Contextos de Inteligencia Artificial';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    
    const contexts = [
      {
        id: 'global',
        title: 'Manifiesto Global Completo',
        desc: 'Recopila toda la base de conocimientos unificada. Recomendado para agentes de IA de rol general (PMs o arquitectos de negocio).',
        file: 'zentryos-ssot-completo.md',
        emoji: '🌌',
        color: '#D6C8FA'
      },
      {
        id: '01',
        title: '01. Visión y Producto',
        desc: 'Contiene los pilares éticos y neurológicos, análisis de la adicción a pantallas y segmentación etaria.',
        file: 'ssot-01-vision-y-producto.md',
        emoji: '🧠',
        color: '#C2F4E7'
      },
      {
        id: '02',
        title: '02. Arquitectura Técnica MVP',
        desc: 'Detalla el Kiosk Mode en Android/iOS, bridges JS, telemetría Firestore, Gemini TTS y analítica.',
        file: 'ssot-02-arquitectura-tecnica.md',
        emoji: '💻',
        color: '#D6C8FA'
      },
      {
        id: '03',
        title: '03. Marketing y Ventas',
        desc: 'Estructura el guion de ventas, el DemoBook (slides, videos, evidencias) y Zentry Prospect (GAS/Sheets para captación de leads).',
        file: 'ssot-03-marketing-y-ventas.md',
        emoji: '🎭',
        color: '#C2F4E7'
      },
      {
        id: '04',
        title: '04. Operaciones y Roadmap',
        desc: 'Contiene hitos de las 4 fases, métricas DAU/LTV/CAC, banco de ideas de Keep y backlog de tareas.',
        file: 'ssot-04-operaciones-y-roadmap.md',
        emoji: '📅',
        color: '#D6C8FA'
      },
      {
        id: '05',
        title: '05. Mesa de Trabajo (Branding)',
        desc: 'Consolida la colorimetría HEX/HSL oficial (Púrpura, Lavanda, Menta), tipografías y recursos visuales.',
        file: 'ssot-05-mesa-de-trabajo.md',
        emoji: '🎨',
        color: '#C2F4E7'
      }
    ];

    let html = `
      <div class="markdown-body">
        <h2>🤖 Descarga de Contextos para Agentes Especializados</h2>
        <p style="margin-bottom: 24px;">Optimiza la ventana de contexto de tus chats de Gemini, Claude o ChatGPT descargando únicamente el segmento del SSOT que requiere tu agente de IA. Esto reduce el ruido cognitivo, acelera las respuestas y ahorra tokens.</p>
        
        <div class="ia-cards-grid">
    `;

    contexts.forEach(c => {
      html += `
        <div class="ia-card" style="border-left: 4px solid ${c.color}">
          <div class="ia-card-header">
            <span class="ia-card-emoji">${c.emoji}</span>
            <h3 class="ia-card-title">${c.title}</h3>
          </div>
          <p class="ia-card-desc">${c.desc}</p>
          <div class="ia-card-footer">
            <code class="ia-card-filename">${c.file}</code>
            <a href="/${c.file}" download="${c.file}" class="ia-download-btn">
              <span>📥 Descargar</span>
            </a>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        
        <div class="ia-instruction-box">
          <h3>💡 Consejo Pro de Workflow: Google Drive & Gemini Extensions</h3>
          <p>
            Gracias a la sincronización automática de Google Drive, no tienes que descargar y subir archivos manualmente en cada chat. Cada una de estas verticales se guarda y actualiza automáticamente bajo el nombre de <code>ssot-actualizado.md</code> dentro de su respectiva subcarpeta <code>registro-diario</code> en Drive.
          </p>
          <p style="margin-top: 8px;">
            Solo escribe esto en el chat de Gemini Web (usando la extensión @Google Drive):
          </p>
          <pre><code>@Google Drive lee ssot-actualizado.md en la carpeta 02-arquitectura-tecnica y explícame el funcionamiento de...</code></pre>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  // 6. Demobook View
  demobook: () => {
    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.add('minimal-view');

    document.getElementById('page-title').textContent = 'Demobook';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="demobook-minimal-container">
        <div class="demobook-grid">
          <a href="https://script.google.com/macros/s/AKfycbxcL87WoSNKkbFl7WyWi6UqvDHjsCRbz1gBdB9XCDLn7MWNUX1mPFEoHgxRVIE5RHPB/exec" target="_blank" rel="noopener noreferrer" class="demobook-card-link">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon">📋</span>
                <span class="demobook-card-title">Preguntas-Bienestar</span>
              </div>
              <span class="demobook-card-arrow">➔</span>
            </div>
          </a>
          <a href="https://script.google.com/macros/s/AKfycbwZS6erGX6Urcf3rPMoQRTf1x-eLluWte3O2ZSg-j4Mu-hzMYZLTkKmekpU0RtV6OtOFA/exec" target="_blank" rel="noopener noreferrer" class="demobook-card-link">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon">📊</span>
                <span class="demobook-card-title">Slides - Demobook</span>
              </div>
              <span class="demobook-card-arrow">➔</span>
            </div>
          </a>
        </div>
      </div>
    `;
  },

  // 5. Page Document renderer
  doc: (docPath) => {
    const page = db.pages.find(p => p.path === docPath);
    if (!page) {
      document.getElementById('workspace-content').innerHTML = `<h2>Página no encontrada</h2><p>El documento solicitado no existe en la base de datos.</p>`;
      return;
    }

    // Set custom page icon/banner
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #C2F4E7 0%, #D6C8FA 50%, #533B87 100%)';
    
    let emoji = '📄';
    if (page.filename.includes('readme')) emoji = '📖';
    if (page.filename.includes('ludopatia') || page.filename.includes('adiccion')) emoji = '🎮';
    if (page.filename.includes('problema')) emoji = '🧠';
    if (page.filename.includes('control') || page.filename.includes('mdm')) emoji = '🔒';
    if (page.filename.includes('telemetria')) emoji = '📡';
    if (page.filename.includes('compose')) emoji = '🎨';
    if (page.filename.includes('demo')) emoji = '🎭';
    
    document.getElementById('page-icon').textContent = emoji;
    document.getElementById('page-title').textContent = page.title;
    
    // Properties Row
    const propBlock = document.getElementById('properties-block');
    propBlock.style.display = 'flex';
    
    let tagsHtml = '';
    if (page.metadata.tags) {
      const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan', 'grey'];
      page.metadata.tags.forEach((tag, idx) => {
        const c = colors[idx % colors.length];
        tagsHtml += `<span class="tag tag-${c}">${tag}</span>`;
      });
    }

    propBlock.innerHTML = `
      <div class="property-row">
        <span class="property-label">📂 Módulo</span>
        <span class="property-value" style="font-weight: 600; text-transform: uppercase;">${page.directory.replace(/^\d+-/, '')}</span>
      </div>
      <div class="property-row">
        <span class="property-label">🏷️ Etiquetas</span>
        <span class="property-value" id="page-tags">${tagsHtml || 'Ninguna'}</span>
      </div>
      <div class="property-row">
        <span class="property-label">⏳ Progreso Módulo</span>
        <div class="property-value progress-bar-container">
          <div class="progress-bar" style="width: ${page.metadata.progress || '0%'}"></div>
          <span class="progress-text">${page.metadata.progress || '0%'}</span>
        </div>
      </div>
      <div class="property-row">
        <span class="property-label">📅 Deadline Hito</span>
        <span class="property-value">${page.metadata.deadline || 'Sin fecha'}</span>
      </div>
      <div class="property-row">
        <span class="property-label">⚖️ Estado SSOT</span>
        <span class="property-value"><span class="tag tag-green">${page.metadata.status || 'aprobado'}</span></span>
      </div>
    `;

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="markdown-body">
        ${mdToHtml(page.body)}
      </div>
    `;
  }
};

// --- Widget Renderers ---

// Render 3 M.I.T. Widget
function renderMITWidget() {
  const container = document.getElementById('mit-list-container');
  if (!container) return;

  const mitData = getMITData();
  container.innerHTML = '';

  mitData.forEach((item, idx) => {
    const mitItem = document.createElement('div');
    mitItem.className = `mit-item ${item.checked ? 'checked' : ''}`;
    
    mitItem.innerHTML = `
      <input type="checkbox" class="mit-checkbox" ${item.checked ? 'checked' : ''}>
      <input type="text" class="mit-input" value="${item.text}" placeholder="Hacer indispensable ${idx + 1}...">
    `;

    const checkbox = mitItem.querySelector('.mit-checkbox');
    const input = mitItem.querySelector('.mit-input');

    checkbox.addEventListener('change', (e) => {
      mitData[idx].checked = e.target.checked;
      mitItem.classList.toggle('checked', e.target.checked);
      saveMITData(mitData);
    });

    input.addEventListener('input', (e) => {
      mitData[idx].text = e.target.value;
      saveMITData(mitData);
    });

    container.appendChild(mitItem);
  });
}

// Render Corkboard Objectives
function renderCorkboardObjectives() {
  const container = document.getElementById('corkboard-objectives');
  if (!container) return;

  const objs = getCorkboardObjectives();
  container.innerHTML = '';

  objs.forEach((text, idx) => {
    const postIt = document.createElement('div');
    postIt.className = 'sticky-note';
    
    postIt.innerHTML = `
      <span class="sticky-note-pin">📌</span>
      <textarea class="sticky-note-content" placeholder="Escribe un objetivo semanal...">${text}</textarea>
    `;

    const textarea = postIt.querySelector('.sticky-note-content');
    textarea.addEventListener('input', (e) => {
      objs[idx] = e.target.value;
      saveCorkboardObjectives(objs);
    });

    // Auto-resize textarea to fit content
    const resizeTextarea = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };
    textarea.addEventListener('focus', resizeTextarea);
    textarea.addEventListener('input', resizeTextarea);
    
    // Initial size setting
    setTimeout(resizeTextarea, 0);
    container.appendChild(postIt);
  });
}

// ========================================
// ESPACIO PERSONAL: Timeblock + AI Chat
// ========================================

function renderEspacioPersonal(container) {
  // Load chat history
  state.chatMessages = getChatHistory();
  if (state.chatMessages.length === 0) {
    state.chatMessages = [{
      role: 'assistant',
      text: '¡Hola! Soy **Zentry AI** 🧘. Puedo ayudarte a organizar tu día. Dime qué tienes pendiente y llenaré tu timeblock con sugerencias inteligentes.\n\nEjemplo: *\"Necesito trabajar en la interfaz de Compose, preparar el pitch de ventas y revisar métricas\"*'
    }];
  }

  const dateStr = state.personalDate;
  const timeblockData = getTimeblockData(dateStr);
  const slots = generateTimeSlots();
  const isToday = dateStr === new Date().toISOString().split('T')[0];

  // Build timeblock rows
  let slotsHtml = '';
  slots.forEach(slot => {
    const data = timeblockData[slot.time] || {};
    const hasCalEvent = data.source === 'calendar';
    const isAI = data.source === 'ai';
    const currentHour = isToday && slot.time === `${String(new Date().getHours()).padStart(2,'0')}:${String(Math.floor(new Date().getMinutes()/15)*15).padStart(2,'0')}`;

    let extraClass = slot.isHour ? ' is-hour' : '';
    if (currentHour) extraClass += ' is-current-hour';
    if (hasCalEvent) extraClass += ' has-calendar-event';
    if (isAI) extraClass += ' ai-suggested';

    const timeLabel = slot.isHour ? formatTime12h(slot.time) : slot.time.split(':')[1];
    const badgeHtml = hasCalEvent ? '<span class="timeblock-cal-badge">📅 Calendar</span>' : (isAI ? '<span class="timeblock-ai-badge">🤖 IA</span>' : '');

    slotsHtml += `
      <div class="timeblock-slot${extraClass}" data-time="${slot.time}">
        <div class="timeblock-time-label">${timeLabel}</div>
        <div class="timeblock-content">
          <input type="text" class="timeblock-text" value="${data.text || ''}" placeholder="${slot.isHour ? 'Bloque disponible...' : ''}" data-time="${slot.time}" ${hasCalEvent ? 'readonly' : ''}>
          ${badgeHtml}
        </div>
      </div>
    `;
  });

  // Build chat messages
  let chatMessagesHtml = '';
  state.chatMessages.forEach(msg => {
    chatMessagesHtml += `<div class="ai-msg ${msg.role}">${msg.text}</div>`;
  });

  container.innerHTML = `
    <div class="espacio-personal-header">
      <a href="#backlog" class="btn-back-personal">⬅️ Volver a Selección</a>
      <h2>🧘 Espacio Personal</h2>
      <div style="width: 140px;"></div>
    </div>

    <div class="date-navigator">
      <button class="date-nav-btn" id="date-prev">◀</button>
      <span class="date-nav-today">${formatDateLabel(dateStr)}</span>
      ${!isToday ? '<button class="date-nav-today-btn" id="date-today">Hoy</button>' : ''}
      <button class="date-nav-btn" id="date-next">▶</button>
      <button class="gcal-sign-in-btn ${state.calendarConnected ? 'connected' : ''}" id="gcal-connect">
        ${state.calendarConnected ? '✅ Calendar Conectado' : '📅 Conectar Calendar'}
      </button>
    </div>

    <div class="espacio-personal-layout">
      <div class="timeblock-container">
        <div class="timeblock-grid" id="timeblock-grid">
          ${isToday ? '<div class="timeblock-current-time" id="current-time-line"></div>' : ''}
          ${slotsHtml}
        </div>
      </div>

      <div class="ai-chat-panel">
        <div class="ai-chat-header">
          <span class="ai-chat-header-icon">🤖</span>
          <div class="ai-chat-header-info">
            <span class="ai-chat-header-title">Zentry AI</span>
            <span class="ai-chat-header-sub">Asistente de productividad</span>
          </div>
        </div>
        <div class="ai-chat-messages" id="ai-chat-messages">
          ${chatMessagesHtml}
        </div>
        <div class="ai-chat-input-area">
          <textarea class="ai-chat-input" id="ai-chat-input" placeholder="Escribe qué necesitas hacer hoy..." rows="1"></textarea>
          <button class="ai-chat-send" id="ai-chat-send" title="Enviar">➤</button>
        </div>
      </div>
    </div>
  `;

  // --- Bind Events ---

  // Date navigation
  document.getElementById('date-prev')?.addEventListener('click', () => {
    state.personalDate = shiftDate(state.personalDate, -1);
    renderEspacioPersonal(container);
  });
  document.getElementById('date-next')?.addEventListener('click', () => {
    state.personalDate = shiftDate(state.personalDate, 1);
    renderEspacioPersonal(container);
  });
  document.getElementById('date-today')?.addEventListener('click', () => {
    state.personalDate = new Date().toISOString().split('T')[0];
    renderEspacioPersonal(container);
  });

  // Timeblock editing
  container.querySelectorAll('.timeblock-text').forEach(input => {
    input.addEventListener('blur', (e) => {
      const time = e.target.dataset.time;
      const val = e.target.value.trim();
      const data = getTimeblockData(state.personalDate);
      if (val) {
        data[time] = { text: val, source: data[time]?.source || 'manual' };
      } else {
        delete data[time];
      }
      saveTimeblockData(state.personalDate, data);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
        // Focus next slot
        const allInputs = [...container.querySelectorAll('.timeblock-text')];
        const idx = allInputs.indexOf(e.target);
        if (idx < allInputs.length - 1) allInputs[idx + 1].focus();
      }
    });
  });

  // Current time indicator
  if (isToday) {
    updateCurrentTimeLine();
    // Update every 60 seconds
    if (window._timeblockInterval) clearInterval(window._timeblockInterval);
    window._timeblockInterval = setInterval(updateCurrentTimeLine, 60000);

    // Scroll to current time
    setTimeout(() => {
      const pos = getCurrentTimePosition();
      if (pos) {
        const grid = document.getElementById('timeblock-grid');
        if (grid) grid.parentElement.scrollTop = Math.max(0, pos - 120);
      }
    }, 200);
  }

  // AI Chat
  const chatInput = document.getElementById('ai-chat-input');
  const chatSend = document.getElementById('ai-chat-send');
  const chatMessages = document.getElementById('ai-chat-messages');

  // Scroll to bottom of chat
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;

  // Auto-resize textarea
  chatInput?.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
  });

  chatSend?.addEventListener('click', () => sendChatMessage(container));
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage(container);
    }
  });

  // Google Calendar connect button
  document.getElementById('gcal-connect')?.addEventListener('click', () => {
    if (!state.calendarConnected) {
      // Placeholder: will require OAuth Client ID configuration
      alert('Para conectar Google Calendar, configura tu OAuth Client ID en el panel de Vercel.\n\nInstrucciones:\n1. Ve a console.cloud.google.com\n2. Habilita Calendar API\n3. Crea un OAuth Client ID\n4. Agrega el dominio de Vercel como origen autorizado');
    }
  });
}

function updateCurrentTimeLine() {
  const line = document.getElementById('current-time-line');
  if (!line) return;
  const pos = getCurrentTimePosition();
  if (pos !== null) {
    line.style.top = pos + 'px';
    line.style.display = 'block';
  } else {
    line.style.display = 'none';
  }
}

async function sendChatMessage(container) {
  const chatInput = document.getElementById('ai-chat-input');
  const chatMessages = document.getElementById('ai-chat-messages');
  if (!chatInput || !chatMessages) return;

  const message = chatInput.value.trim();
  if (!message) return;

  // Add user message
  state.chatMessages.push({ role: 'user', text: message });
  chatMessages.innerHTML += `<div class="ai-msg user">${message}</div>`;
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // Show typing indicator
  chatMessages.innerHTML += `<div class="ai-typing-indicator" id="ai-typing"><span></span><span></span><span></span></div>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Disable send button
  const sendBtn = document.getElementById('ai-chat-send');
  if (sendBtn) sendBtn.disabled = true;

  try {
    const timeblockData = getTimeblockData(state.personalDate);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        currentDate: state.personalDate,
        existingBlocks: timeblockData,
        calendarEvents: state.calendarEvents
      })
    });

    const data = await response.json();

    // Remove typing indicator
    document.getElementById('ai-typing')?.remove();

    // Add assistant reply
    let replyHtml = data.reply || 'Sin respuesta del modelo.';

    // If there are suggestions, add action buttons
    if (data.suggestions && data.suggestions.length > 0) {
      state.pendingSuggestions = data.suggestions;

      // Show preview of suggestions
      let previewHtml = '<br><br>📋 **Sugerencias de timeblock:**<br>';
      data.suggestions.forEach(s => {
        previewHtml += `• \`${formatTime12h(s.time)}\` — ${s.text}<br>`;
      });

      replyHtml += previewHtml;
      replyHtml += `
        <div class="ai-suggestions-actions">
          <button class="btn-apply-suggestions" id="btn-apply-ai">✨ Aplicar al Timeblock</button>
          <button class="btn-dismiss-suggestions" id="btn-dismiss-ai">Descartar</button>
        </div>
      `;
    }

    state.chatMessages.push({ role: 'assistant', text: replyHtml });
    chatMessages.innerHTML += `<div class="ai-msg assistant">${replyHtml}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save chat history
    saveChatHistory(state.chatMessages);

    // Bind suggestion action buttons
    document.getElementById('btn-apply-ai')?.addEventListener('click', () => {
      applyAISuggestions(container);
    });
    document.getElementById('btn-dismiss-ai')?.addEventListener('click', () => {
      state.pendingSuggestions = null;
      document.querySelector('.ai-suggestions-actions')?.remove();
      const sysMsg = document.createElement('div');
      sysMsg.className = 'ai-msg system';
      sysMsg.textContent = 'Sugerencias descartadas.';
      chatMessages.appendChild(sysMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });

  } catch (err) {
    document.getElementById('ai-typing')?.remove();
    const errorHtml = '⚠️ No se pudo conectar con el agente IA. Verifica tu conexión o la configuración de la API Key en Vercel.';
    state.chatMessages.push({ role: 'assistant', text: errorHtml });
    chatMessages.innerHTML += `<div class="ai-msg assistant">${errorHtml}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveChatHistory(state.chatMessages);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function applyAISuggestions(container) {
  if (!state.pendingSuggestions) return;

  const data = getTimeblockData(state.personalDate);

  state.pendingSuggestions.forEach(suggestion => {
    if (!data[suggestion.time]) {
      data[suggestion.time] = { text: suggestion.text, source: 'ai' };
    }
  });

  saveTimeblockData(state.personalDate, data);
  state.pendingSuggestions = null;

  // Add system message
  const chatMessages = document.getElementById('ai-chat-messages');
  if (chatMessages) {
    const sysMsg = document.createElement('div');
    sysMsg.className = 'ai-msg system';
    sysMsg.textContent = `✅ ${Object.keys(data).length} bloques aplicados al timeblock.`;
    chatMessages.appendChild(sysMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Remove action buttons
  document.querySelector('.ai-suggestions-actions')?.remove();

  // Re-render the timeblock
  const workspaceContent = document.getElementById('workspace-content');
  if (workspaceContent) renderEspacioPersonal(workspaceContent);
}


// Render Kanban board lists based on active filters
function renderKanbanCards() {
  const cardsPendiente = document.getElementById('cards-pendiente');
  const cardsProgreso = document.getElementById('cards-progreso');
  const cardsCompletado = document.getElementById('cards-completado');

  cardsPendiente.innerHTML = '';
  cardsProgreso.innerHTML = '';
  cardsCompletado.innerHTML = '';

  let cPendiente = 0;
  let cProgreso = 0;
  let cCompletado = 0;

  // Filter Tasks
  state.tasks.forEach(task => {
    // 0. Backlog mode filter
    if (state.backlogMode === 'personal') {
      if (task.origin !== 'Personal') return;
    } else if (state.backlogMode === 'zentry') {
      if (task.origin === 'Personal') return;
    }

    // 1. Vertical filter
    if (state.filters.vertical !== 'all') {
      const v = state.filters.vertical; // 'tec', 'prod', 'mkt'
      if (v === 'tec' && !task.id.startsWith('TEC')) return;
      if (v === 'prod' && !task.id.startsWith('PROD')) return;
      if (v === 'mkt' && !task.id.startsWith('MKT')) return;
    }

    // 2. Priority filter
    if (state.filters.priority !== 'all') {
      if (task.priority.toLowerCase() !== state.filters.priority.toLowerCase()) return;
    }

    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.setAttribute('draggable', 'true');
    
    // Drag and Drop card event listeners
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
    
    let pClass = 'priority-media';
    if (task.priority.toLowerCase() === 'alta') pClass = 'priority-high';
    if (task.priority.toLowerCase() === 'baja') pClass = 'priority-baja';

    // Assignee initials
    let initials = 'UA';
    if (task.assignedTo) {
      initials = task.assignedTo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    card.innerHTML = `
      <div class="card-header">
        <span class="card-id">${task.id}</span>
        <span class="card-priority ${pClass}">${task.priority}</span>
      </div>
      <div class="card-body">${task.description}</div>
      <div class="card-footer">
        <span class="card-origin">Acción: ${task.origin || 'N/A'}</span>
        <span class="card-assignee">
          <div class="assignee-avatar">${initials}</div>
          <span>${task.assignedTo || 'Unassigned'}</span>
        </span>
      </div>
    `;

    // Click on Card opens the edit modal
    card.addEventListener('click', () => {
      openTaskModalForEdit(task);
    });

    const cleanStatus = task.status.toLowerCase().replace(/\s+/g, '');
    if (cleanStatus.includes('pendiente') || cleanStatus.includes('hacer') || cleanStatus.includes('todo')) {
      cardsPendiente.appendChild(card);
      cPendiente++;
    } else if (cleanStatus.includes('progreso') || cleanStatus.includes('curso') || cleanStatus.includes('proceso')) {
      cardsProgreso.appendChild(card);
      cProgreso++;
    } else {
      cardsCompletado.appendChild(card);
      cCompletado++;
    }
  });

  document.getElementById('count-pendiente').textContent = cPendiente;
  document.getElementById('count-progreso').textContent = cProgreso;
  document.getElementById('count-completado').textContent = cCompletado;
}

// Router Logic
function handleRouting() {
  const hash = window.location.hash || '#backlog';
  
  // Reset minimal-view by default
  const workspace = document.querySelector('.workspace');
  if (workspace) {
    workspace.classList.remove('minimal-view');
    workspace.classList.remove('backlog-view'); // Reset backlog view full width
  }

  // Restore elements that might be hidden by Espacio Personal
  const pageBanner = document.getElementById('page-banner');
  const wsHeader = document.querySelector('.workspace-header');
  if (pageBanner) pageBanner.style.display = '';
  if (wsHeader) wsHeader.style.display = '';

  // Highlight active Nav Link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  if (hash.startsWith('#doc/')) {
    state.activeView = 'doc';
    state.activeDocPath = hash.replace('#doc/', '');
    buildDocTree(); // Rebuild tree to show active state
    renderers.doc(state.activeDocPath);
  } else if (hash.startsWith('#backlog')) {
    state.activeView = 'backlog';
    if (hash === '#backlog/zentry') {
      state.backlogMode = 'zentry';
    } else if (hash === '#backlog/personal') {
      state.backlogMode = 'personal';
    } else {
      state.backlogMode = 'selection';
    }
    const navLink = document.querySelector(`.nav-link[data-view="backlog"]`);
    if (navLink) navLink.classList.add('active');
    
    buildDocTree(); // Clear tree highlights
    renderers.backlog();
  } else {
    state.activeView = hash.replace('#', '');
    const navLink = document.querySelector(`.nav-link[data-view="${state.activeView}"]`);
    if (navLink) navLink.classList.add('active');
    
    buildDocTree(); // Clear tree highlights

    if (renderers[state.activeView]) {
      renderers[state.activeView]();
    } else {
      renderers.backlog();
    }
  }
}

// Listen to Hash Changes
window.addEventListener('hashchange', handleRouting);

// Sidebar Toggle Event Handler
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  const app = document.getElementById('app');
  app.classList.toggle('sidebar-collapsed');
  const isCollapsed = app.classList.contains('sidebar-collapsed');
  localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
});

// Sidebar Backdrop Click Event Handler (close sidebar when clicking outside)
document.getElementById('sidebar-backdrop').addEventListener('click', () => {
  const app = document.getElementById('app');
  app.classList.add('sidebar-collapsed');
  localStorage.setItem('sidebar_collapsed', 'true');
});

// Load Sidebar Collapsed State Preference
const sidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
if (sidebarCollapsed) {
  document.getElementById('app').classList.add('sidebar-collapsed');
}

// Drag-and-drop vertical position calculation helper
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
  
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

// Drag & Drop Setup
function setupDragAndDrop() {
  const columns = [
    { el: document.getElementById('cards-pendiente'), status: 'Pendiente' },
    { el: document.getElementById('cards-progreso'), status: 'En curso' },
    { el: document.getElementById('cards-completado'), status: 'Completado' }
  ];

  columns.forEach(col => {
    if (!col.el) return;
    
    col.el.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.el.classList.add('drag-over');
      
      const afterElement = getDragAfterElement(col.el, e.clientY);
      const draggingCard = document.querySelector('.kanban-card.dragging');
      if (draggingCard) {
        if (afterElement == null) {
          col.el.appendChild(draggingCard);
        } else {
          col.el.insertBefore(draggingCard, afterElement);
        }
      }
    });

    col.el.addEventListener('dragleave', () => {
      col.el.classList.remove('drag-over');
    });

    col.el.addEventListener('drop', (e) => {
      e.preventDefault();
      col.el.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      const task = state.tasks[taskIndex];
      // Update status
      task.status = col.status;
      
      // Determine the position of the dropped card relative to other cards in the column
      const children = [...col.el.querySelectorAll('.kanban-card')];
      const newIndexInColumn = children.findIndex(child => child.querySelector('.card-id').textContent === taskId);
      
      // Remove from array
      state.tasks.splice(taskIndex, 1);
      
      if (newIndexInColumn === children.length - 1) {
        // Drop at the end
        if (children.length > 1) {
          const prevCardId = children[newIndexInColumn - 1].querySelector('.card-id').textContent;
          const prevTaskIndex = state.tasks.findIndex(t => t.id === prevCardId);
          state.tasks.splice(prevTaskIndex + 1, 0, task);
        } else {
          state.tasks.push(task);
        }
      } else {
        // Drop before a visible sibling card
        const nextCardId = children[newIndexInColumn + 1].querySelector('.card-id').textContent;
        const nextTaskIndex = state.tasks.findIndex(t => t.id === nextCardId);
        state.tasks.splice(nextTaskIndex, 0, task);
      }
      
      localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks));
      renderKanbanCards();
    });
  });
}

// Modal View Elements
const modal = document.getElementById('task-modal');
const modalTaskId = document.getElementById('modal-task-id');
const modalClose = document.getElementById('modal-close');
const taskForm = document.getElementById('task-form');
const taskDesc = document.getElementById('task-desc');
const taskPriority = document.getElementById('task-priority');
const taskStatus = document.getElementById('task-status');
const taskAssignee = document.getElementById('task-assignee');
const taskActionType = document.getElementById('task-action-type');
const taskActionCustom = document.getElementById('task-action-custom');
const taskDeleteBtn = document.getElementById('task-delete-btn');
const taskGoRef = document.getElementById('task-go-ref');

// Toggle Custom Input based on Action Type selection
taskActionType.addEventListener('change', (e) => {
  if (e.target.value === 'Otro') {
    taskActionCustom.style.display = 'block';
    taskActionCustom.required = true;
  } else {
    taskActionCustom.style.display = 'none';
    taskActionCustom.required = false;
    taskActionCustom.value = '';
  }
});

// Open Modal for Editing
function openTaskModalForEdit(task) {
  state.currentEditingTask = task;
  
  modalTaskId.textContent = task.id;
  taskDesc.value = task.description || '';
  taskPriority.value = task.priority || 'Media';
  
  // Map internal status string to select value
  const cleanStatus = task.status.toLowerCase().replace(/\s+/g, '');
  if (cleanStatus.includes('pendiente') || cleanStatus.includes('hacer') || cleanStatus.includes('todo')) {
    taskStatus.value = 'Pendiente';
  } else if (cleanStatus.includes('progreso') || cleanStatus.includes('curso') || cleanStatus.includes('proceso')) {
    taskStatus.value = 'En curso';
  } else {
    taskStatus.value = 'Completado';
  }
  
  taskAssignee.value = task.assignedTo === 'Agente' ? 'Agente' : 'Jose Angel';
  
  if (task.origin === 'Zentry' || !task.origin) {
    taskActionType.value = 'Zentry';
    taskActionCustom.style.display = 'none';
    taskActionCustom.value = '';
  } else if (task.origin === 'Personal') {
    taskActionType.value = 'Personal';
    taskActionCustom.style.display = 'none';
    taskActionCustom.value = '';
  } else {
    taskActionType.value = 'Otro';
    taskActionCustom.style.display = 'block';
    taskActionCustom.value = task.origin;
  }
  
  // Show Delete and Ref buttons
  taskDeleteBtn.style.display = 'block';
  if (task.origin || task.id) {
    taskGoRef.style.display = 'block';
  } else {
    taskGoRef.style.display = 'none';
  }
  
  // Open modal animation
  modal.classList.add('show');
}

// Open Modal for Creating
function openTaskModalForCreate() {
  state.currentEditingTask = null;
  
  // Auto-generate task ID based on active filters
  let prefix = 'TASK';
  if (state.filters.vertical === 'tec') prefix = 'TEC';
  else if (state.filters.vertical === 'prod') prefix = 'PROD';
  else if (state.filters.vertical === 'mkt') prefix = 'MKT';
  
  const matches = state.tasks.filter(t => t.id.startsWith(prefix));
  let nextNum = 1;
  if (matches.length > 0) {
    const ids = matches.map(t => {
      const parts = t.id.split('-');
      const num = parseInt(parts[parts.length - 1]);
      return isNaN(num) ? 0 : num;
    });
    nextNum = Math.max(...ids) + 1;
  }
  
  const paddedNum = String(nextNum).padStart(2, '0');
  modalTaskId.textContent = `Crear Nueva Tarea (${prefix}-${paddedNum})`;
  
  // Clear fields
  taskDesc.value = '';
  taskPriority.value = 'Media';
  taskStatus.value = 'Pendiente';
  taskAssignee.value = 'Jose Angel';
  
  if (state.backlogMode === 'personal') {
    taskActionType.value = 'Personal';
  } else {
    taskActionType.value = 'Zentry';
  }
  taskActionCustom.style.display = 'none';
  taskActionCustom.value = '';
  
  // Hide Delete and Ref buttons for new task
  taskDeleteBtn.style.display = 'none';
  taskGoRef.style.display = 'none';
  
  modal.classList.add('show');
}

// Close Modal
function closeModal() {
  modal.classList.remove('show');
}

// Bind Modal Close listeners
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Delete Task Handler
taskDeleteBtn.addEventListener('click', () => {
  if (state.currentEditingTask && confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
    state.tasks = state.tasks.filter(t => t.id !== state.currentEditingTask.id);
    localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks));
    closeModal();
    renderKanbanCards();
  }
});

// Go to Reference Document Handler
taskGoRef.addEventListener('click', () => {
  if (!state.currentEditingTask) return;
  const task = state.currentEditingTask;
  closeModal();
  
  if (task.origin && task.origin.includes('Keep')) {
    window.location.hash = '#ideas';
  } else {
    // Navigate based on prefix
    if (task.id.startsWith('TEC')) {
      window.location.hash = '#doc/02-arquitectura-tecnica/README.md';
    } else if (task.id.startsWith('MKT')) {
      window.location.hash = '#doc/03-marketing-y-ventas/README.md';
    } else {
      window.location.hash = '#doc/01-vision-y-producto/README.md';
    }
  }
});

// Form Submit Handler
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const desc = taskDesc.value.trim();
  const priority = taskPriority.value;
  const status = taskStatus.value; // 'Pendiente', 'En curso', 'Completado'
  const assignee = taskAssignee.value;
  
  let origin = 'Zentry';
  if (taskActionType.value === 'Personal') {
    origin = 'Personal';
  } else if (taskActionType.value === 'Otro') {
    origin = taskActionCustom.value.trim() || 'Otro';
  }
  
  if (state.currentEditingTask) {
    // Edit Mode
    const task = state.tasks.find(t => t.id === state.currentEditingTask.id);
    if (task) {
      task.description = desc;
      task.priority = priority;
      task.status = status;
      task.assignedTo = assignee;
      task.origin = origin;
    }
  } else {
    // Create Mode
    // Calculate final ID
    let prefix = 'TASK';
    if (state.filters.vertical === 'tec') prefix = 'TEC';
    else if (state.filters.vertical === 'prod') prefix = 'PROD';
    else if (state.filters.vertical === 'mkt') prefix = 'MKT';
    
    const matches = state.tasks.filter(t => t.id.startsWith(prefix));
    let nextNum = 1;
    if (matches.length > 0) {
      const ids = matches.map(t => {
        const parts = t.id.split('-');
        const num = parseInt(parts[parts.length - 1]);
        return isNaN(num) ? 0 : num;
      });
      nextNum = Math.max(...ids) + 1;
    }
    const paddedNum = String(nextNum).padStart(2, '0');
    const finalId = `${prefix}-${paddedNum}`;
    
    state.tasks.push({
      id: finalId,
      description: desc,
      priority: priority,
      status: status,
      assignedTo: assignee,
      origin: origin
    });
  }
  
  localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks));
  closeModal();
  renderKanbanCards();
});

// Initial Load
buildDocTree();
handleRouting();
