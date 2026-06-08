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
  currentEditingTask: null
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
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #ebf1f5 0%, #c2f4e7 50%, #d6c8fa 100%)';
    document.getElementById('page-icon').textContent = '📋';
    document.getElementById('page-title').textContent = 'Tablero Backlog';
    document.getElementById('properties-block').style.display = 'flex';
    
    const container = document.getElementById('workspace-content');
    container.innerHTML = `
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
    `;

    // Render Cards with current filters
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
        <span class="card-origin">Ref: ${task.origin || 'N/A'}</span>
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
  if (workspace) workspace.classList.remove('minimal-view');

  // Highlight active Nav Link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  if (hash.startsWith('#doc/')) {
    state.activeView = 'doc';
    state.activeDocPath = hash.replace('#doc/', '');
    buildDocTree(); // Rebuild tree to show active state
    renderers.doc(state.activeDocPath);
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
    });

    col.el.addEventListener('dragleave', () => {
      col.el.classList.remove('drag-over');
    });

    col.el.addEventListener('drop', (e) => {
      e.preventDefault();
      col.el.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const task = state.tasks.find(t => t.id === taskId);
      if (task && task.status !== col.status) {
        task.status = col.status;
        localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks));
        renderKanbanCards();
      }
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
const taskOrigin = document.getElementById('task-origin');
const taskDeleteBtn = document.getElementById('task-delete-btn');
const taskGoRef = document.getElementById('task-go-ref');

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
  
  taskAssignee.value = task.assignedTo || '';
  taskOrigin.value = task.origin || '';
  
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
  taskAssignee.value = '';
  taskOrigin.value = '';
  
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
  const assignee = taskAssignee.value.trim();
  const origin = taskOrigin.value.trim();
  
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
