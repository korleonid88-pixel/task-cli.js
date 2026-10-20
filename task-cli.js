const fs = require('fs');
const path = require('path');

const TASK_FILE = 'tasks.json';

const loadTasks = () => {
  if (!fs.existsSync(TASK_FILE)) return ;
  try { return JSON.parse(fs.readFileSync(TASK_FILE, 'utf8')); }
  catch { return ; }
};

const saveTasks = (tasks) => {
  fs.writeFileSync(TASK_FILE, JSON.stringify(tasks, null, 2), 'utf8');
};

const getNewId = (tasks) => tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
const nowIso = () => new Date().toISOString();

const addTask = (desc) => {
  const tasks = loadTasks();
  const id = getNewId(tasks);
  const task = { id, description: desc, status: 'todo', createdAt: nowIso(), updatedAt: nowIso() };
  tasks.push(task);
  saveTasks(tasks);
  console.log(`Task added successfully (ID: \${id})`);
};

const updateTask = (idStr, desc) => {
  const tasks = loadTasks();
  const id = parseInt(idStr, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) { console.error('Task not found'); return; }
  task.description = desc;
  task.updatedAt = nowIso();
  saveTasks(tasks);
  console.log('Task updated successfully');
};

const deleteTask = (idStr) => {
  const tasks = loadTasks();
  const id = parseInt(idStr, 10);
  const initialLen = tasks.length;
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === initialLen) { console.error('Task not found'); return; }
  saveTasks(filtered);
  console.log('Task deleted successfully');
};

const markStatus = (idStr, status) => {
  const tasks = loadTasks();
  const id = parseInt(idStr, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) { console.error('Task not found'); return; }
  task.status = status;
  task.updatedAt = nowIso();
  saveTasks(tasks);
  console.log(`Task marked as \${status}`);
};

const listTasks = (filter) => {
  const tasks = loadTasks();
  let result = tasks;
  if (filter === 'done') result = tasks.filter(t => t.status === 'done');
  else if (filter === 'todo') result = tasks.filter(t => t.status === 'todo');
  else if (filter === 'in-progress') result = tasks.filter(t => t.status === 'in-progress');
  if (result.length === 0) { console.log('No tasks found'); return; }
  result.forEach(t => console.log(`${t.id}: ${t.description} [${t.status}] (${t.createdAt})`));
};

const args = process.argv.slice(2);
if (args.length === 0) { console.error('Usage: task-cli <command> [args]'); process.exit(1); }

const cmd = args;
if (cmd === 'add') {
  if (args.length < 2) { console.error('Missing description'); process.exit(1); }
  addTask(args.slice(1).join(' '));
} else if (cmd === 'update') {
  if (args.length < 3) { console.error('Missing ID or description'); process.exit(1); }
  updateTask(args, args.slice(2).join(' '));
} else if (cmd === 'delete') {
  if (args.length < 2) { console.error('Missing ID'); process.exit(1); }
  deleteTask(args);
} else if (cmd === 'mark-in-progress') {
  if (args.length < 2) { console.error('Missing ID'); process.exit(1); }
  markStatus(args, 'in-progress');
} else if (cmd === 'mark-done') {
  if (args.length < 2) { console.error('Missing ID'); process.exit(1); }
  markStatus(args, 'done');
} else if (cmd === 'list') {
  const filter = args || null;
  listTasks(filter);
} else {
  console.error('Unknown command');
  process.exit(1);
}
