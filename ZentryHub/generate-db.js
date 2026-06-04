import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve('..');
const outputDir = path.join(repoRoot, 'ZentryHub', 'src');
const outputFile = path.join(outputDir, 'ssot-db.json');

const directories = [
  '01-vision-y-producto',
  '02-arquitectura-tecnica',
  '03-marketing-y-ventas',
  '04-operaciones-y-roadmap',
  '05-mesa-de-trabajo'
];

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return { metadata: {}, body: content };
  const yamlText = match[1];
  const body = content.replace(match[0], '').trim();
  const metadata = {};
  yamlText.split('\n').forEach(line => {
    const colIndex = line.indexOf(':');
    if (colIndex !== -1) {
      const key = line.slice(0, colIndex).trim();
      let value = line.slice(colIndex + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value.replace(/'/g, '"'));
        } catch (e) {
          value = value.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
        }
      }
      metadata[key] = value;
    }
  });
  return { metadata, body };
}

function extractMarkdownTables(body) {
  const tables = [];
  const lines = body.split('\n');
  let currentTable = null;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('|')) {
      if (!currentTable) {
        currentTable = [];
      }
      currentTable.push(line);
    } else {
      if (currentTable) {
        tables.push(currentTable);
        currentTable = null;
      }
    }
  }
  if (currentTable) {
    tables.push(currentTable);
  }

  // Parse markdown tables to JSON arrays
  return tables.map(rawTable => {
    if (rawTable.length < 3) return null; // Needs header, separator, and data
    const headers = rawTable[0].split('|').map(s => s.trim()).filter(s => s);
    const rows = [];
    for (let i = 2; i < rawTable.length; i++) {
      const cols = rawTable[i].split('|').map(s => s.trim());
      // The split leaves an empty string at index 0 and index length-1
      const actualCols = cols.slice(1, cols.length - 1);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = actualCols[idx] || '';
      });
      rows.push(row);
    }
    return rows;
  }).filter(t => t !== null);
}

function extractTasks(backlogBody) {
  const tables = extractMarkdownTables(backlogBody);
  const allTasks = [];
  tables.forEach(table => {
    table.forEach(row => {
      // Find rows with a Task ID (e.g. TEC-01, MKT-01, PROD-01)
      const idKey = Object.keys(row).find(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('tarea'));
      const descKey = Object.keys(row).find(k => k.toLowerCase().includes('inferred') || k.toLowerCase().includes('tarea') && k !== idKey);
      const statusKey = Object.keys(row).find(k => k.toLowerCase().includes('estado') || k.toLowerCase().includes('status'));
      const priorityKey = Object.keys(row).find(k => k.toLowerCase().includes('prioridad'));
      const originKey = Object.keys(row).find(k => k.toLowerCase().includes('origen'));
      const assignedKey = Object.keys(row).find(k => k.toLowerCase().includes('asignado') || k.toLowerCase().includes('responsable'));

      if (row[idKey] && row[idKey].match(/[A-Z]+-\d+/)) {
        allTasks.push({
          id: row[idKey].replace(/\*\*/g, '').trim(),
          description: row[descKey] ? row[descKey].replace(/\*\*/g, '').trim() : '',
          status: row[statusKey] ? row[statusKey].trim() : 'Pendiente',
          priority: row[priorityKey] ? row[priorityKey].trim() : 'Media',
          origin: row[originKey] ? row[originKey].trim() : '',
          assignedTo: row[assignedKey] ? row[assignedKey].trim() : 'Unassigned'
        });
      }
    });
  });
  return allTasks;
}

function extractKeepNotes(ideasBody) {
  const notes = [];
  // Keep notes are split by ### NoteTitle
  const sections = ideasBody.split(/(?=### )/);
  sections.forEach(section => {
    if (!section.trim().startsWith('###')) return;
    const lines = section.split('\n');
    const titleLine = lines[0].replace('###', '').trim();
    // Match titles like ZENTRY SPOT (1) or ZENTRY PRECIERRE (2)
    const title = titleLine.replace(/\(\d+\)/g, '').trim();

    // Body content is inside blockquote blocks starting with >
    let bodyText = '';
    let category = '';
    let tasks = [];
    let readingBody = false;

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('>')) {
        const bodyContent = line.replace(/^\s*>\s*(\*\*Cuerpo de la Nota \(Literal\):\*\*)?/, '').trim();
        bodyText += (bodyText ? '\n' : '') + bodyContent;
      } else if (cleanLine.includes('**Vertical Inferida**')) {
        category = cleanLine.split(':').slice(1).join(':').replace(/`/g, '').trim();
      } else if (cleanLine.match(/^\d+\.\s/)) {
        // Tareas derivadas lists
        tasks.push(cleanLine.replace(/^\d+\.\s/, '').trim());
      }
    });

    notes.push({
      title,
      fullTitle: titleLine,
      body: bodyText.replace(/`/g, '').trim(),
      category: category || 'General',
      tasks
    });
  });
  return notes;
}

function run() {
  console.log('Generating SSOT JSON Database...');
  const db = {
    pages: [],
    tasks: [],
    ideas: [],
    metadata: {
      generatedAt: new Date().toISOString(),
      projectName: 'ZentryOS SSOT',
      repoUrl: 'https://github.com/j-angel-borges/zentry-ssot'
    }
  };

  directories.forEach(dir => {
    const dirPath = path.join(repoRoot, dir);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      if (!file.endsWith('.md')) return;
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { metadata, body } = parseFrontmatter(content);

      const relPath = `${dir}/${file}`;
      db.pages.push({
        path: relPath,
        directory: dir,
        filename: file,
        title: metadata.title || file.replace('.md', ''),
        metadata,
        body
      });

      // Special parsers
      if (file === 'backlog-tareas.md') {
        db.tasks = extractTasks(body);
      } else if (file === 'banco-de-ideas.md') {
        db.ideas = extractKeepNotes(body);
      }
    });
  });

  if (db.pages.length === 0) {
    console.log('No pages found in parent directories. Skipping database write to preserve pre-existing database (e.g. in Vercel build container).');
    return;
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Database generated successfully at: ${outputFile}`);
  console.log(`Total Pages: ${db.pages.length}`);
  console.log(`Total Tasks: ${db.tasks.length}`);
  console.log(`Total Keep Notes: ${db.ideas.length}`);
}

run();
