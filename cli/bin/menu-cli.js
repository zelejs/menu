#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.MENU_BASE_URL) {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}

const packageJson = require('../package.json');

// Load configuration from environment only (no config files)
const BASE_URL = (process.env.MENU_BASE_URL || '').replace(/\/$/, '');
const TOKEN = process.env.MENU_TOKEN || '';

if (!BASE_URL) {
  console.error('Error: MENU_BASE_URL is not configured in .env file');
  console.error('Example: MENU_BASE_URL=http://localhost:8080/api/adm/menu');
  process.exit(1);
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(config => {
  if (TOKEN) {
    config.headers.Authorization = `Bearer ${TOKEN}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      const msg = error.response.data?.message || error.response.data?.error || JSON.stringify(error.response.data);
      throw new Error(`HTTP ${error.response.status}: ${msg}`);
    } else if (error.request) {
      throw new Error(`Cannot connect to server: ${BASE_URL}`);
    }
    throw error;
  }
);

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

function printTable(records) {
  if (!records || records.length === 0) {
    console.log('No records found.');
    return;
  }
  records.forEach(item => {
    const statusStr = item.status === '0' ? 'enabled' : (item.status === '1' ? 'disabled' : item.status);
    const type = (item.menuType || item.menu_type || 'N/A').padEnd(4);
    const name = (item.name || 'N/A').padEnd(20);
    const pathStr = (item.path || '-').padEnd(20);
    console.log(`[${String(item.id).padStart(4)}] ${name} type:${type} status:${statusStr} path:${pathStr}`);
  });
}

function printTree(items, prefix = '', isLast = true) {
  items.forEach((item, i) => {
    const isLastItem = i === items.length - 1;
    const connector = isLastItem ? '└── ' : '├── ';
    const name = item.name || 'Unnamed';
    const id = item.id || '?';
    console.log(`${prefix}${connector}[${id}] ${name}`);
    if (item.children && item.children.length > 0) {
      const extension = isLastItem ? '    ' : '│   ';
      printTree(item.children, prefix + extension, isLastItem);
    }
  });
}

function collectIds(value, previous) {
  return previous.concat([value]);
}

const program = new Command();
program
  .name('menu-cli')
  .description('Menu Management CLI Tool')
  .version(packageJson.version);

program
  .option('-j, --json', 'output as JSON')
  .option('-v, --verbose', 'verbose output');

// ==================== MENU COMMANDS ====================
const menuCmd = program.command('menu').description('Menu management API (/api/adm/menu/menus)');

menuCmd
  .command('list')
  .description('List menus with pagination and filters')
  .option('-p, --page <num>', 'page number', '1')
  .option('-s, --page-size <size>', 'page size', '10')
  .option('--search <keyword>', 'search keyword')
  .option('--name <name>', 'filter by name')
  .option('--path <path>', 'filter by path')
  .option('--status <status>', 'filter by status')
  .action(async (options) => {
    const params = {
      pageNum: options.page,
      pageSize: options.pageSize
    };
    if (options.search) params.search = options.search;
    if (options.name) params.name = options.name;
    if (options.path) params.path = options.path;
    if (options.status) params.status = options.status;

    const result = await api.get('/menus', { params });
    if (program.opts().json) {
      printJson(result);
    } else {
      const data = result.data || {};
      const records = data.records || [];
      console.log(`Page ${data.current || 1} of ${data.pages || 1}, Total: ${data.total || records.length}`);
      printTable(records);
    }
  });

menuCmd
  .command('get <id>')
  .description('Get menu by ID')
  .action(async (id) => {
    const result = await api.get(`/menus/${id}`);
    if (program.opts().json) {
      printJson(result);
    } else {
      console.log(`Menu [${result.data?.id || id}]`);
      printJson(result.data || result);
    }
  });

menuCmd
  .command('create')
  .description('Create a new menu')
  .requiredOption('-n, --name <name>', 'menu name')
  .option('--path <path>', 'menu path', '/')
  .option('-t, --type <type>', 'menu type (C/M/F)', 'M')
  .option('-p, --parent <pid>', 'parent menu ID')
  .option('--component <component>', 'component path')
  .option('--icon <icon>', 'icon name')
  .option('--visible <visible>', 'visible flag', '0')
  .option('--status <status>', 'status flag', '0')
  .action(async (options) => {
    const body = {
      name: options.name,
      path: options.path,
      menuType: options.type,
      visible: options.visible,
      status: options.status,
      orderNum: 0,
      isFrame: 0,
      isCache: 0,
      hideInMenu: 0
    };
    if (options.parent) body.pid = parseInt(options.parent);
    if (options.component) body.component = options.component;
    if (options.icon) body.icon = options.icon;

    const result = await api.post('/menus', body);
    if (program.opts().json) {
      printJson(result);
    } else {
      console.log(`Created menu [${result.data}]`);
    }
  });

menuCmd
  .command('update <id>')
  .description('Update an existing menu')
  .option('-n, --name <name>', 'menu name')
  .option('--path <path>', 'menu path')
  .option('-t, --type <type>', 'menu type')
  .option('-p, --parent <pid>', 'parent menu ID')
  .option('--component <component>', 'component path')
  .option('--icon <icon>', 'icon name')
  .option('--visible <visible>', 'visible flag')
  .option('--status <status>', 'status flag')
  .action(async (id, options) => {
    const body = {};
    if (options.name !== undefined) body.name = options.name;
    if (options.path !== undefined) body.path = options.path;
    if (options.type !== undefined) body.menuType = options.type;
    if (options.parent !== undefined) body.pid = parseInt(options.parent);
    if (options.component !== undefined) body.component = options.component;
    if (options.icon !== undefined) body.icon = options.icon;
    if (options.visible !== undefined) body.visible = options.visible;
    if (options.status !== undefined) body.status = options.status;

    if (Object.keys(body).length === 0) {
      console.error('Error: No fields to update. Provide at least one option.');
      process.exit(1);
    }

    const result = await api.put(`/menus/${id}`, body);
    if (program.opts().json) {
      printJson(result);
    } else {
      console.log(`Updated menu [${id}]: affected ${result.data} row(s)`);
    }
  });

menuCmd
  .command('delete <id>')
  .description('Delete a menu')
  .action(async (id) => {
    const result = await api.delete(`/menus/${id}`);
    if (program.opts().json) {
      printJson(result);
    } else {
      console.log(`Deleted menu [${id}]: affected ${result.data} row(s)`);
    }
  });

menuCmd
  .command('move <id>')
  .description('Move menu to a new parent')
  .requiredOption('-p, --parent <pid>', 'new parent menu ID (null for top level)')
  .action(async (id, options) => {
    const params = {};
    if (options.parent !== 'null' && options.parent !== 'NULL') {
      params.pid = parseInt(options.parent);
    }
    const result = await api.put(`/menus/${id}/move`, null, { params });
    if (program.opts().json) {
      printJson(result);
    } else {
      console.log(`Moved menu [${id}] to parent [${options.parent}]: affected ${result.data} row(s)`);
    }
  });

menuCmd
  .command('promote <id>')
  .description('Promote menu to top level')
  .action(async (id) => {
    const result = await api.put(`/menus/${id}/promote`);
    if (program.opts().json) {
      printJson(result);
    } else {
      console.log(`Promoted menu [${id}]: affected ${result.data} row(s)`);
    }
  });

// ==================== APP COMMANDS ====================
const appCmd = program.command('app').description('App menu API (/api/adm/menu/app)');

appCmd
  .command('group')
  .description('Get menu group tree (excludes invisible menus)')
  .option('-s, --search <keyword>', 'search keyword')
  .action(async (options) => {
    const params = {};
    if (options.search) params.search = options.search;
    const result = await api.get('/app/group', { params });
    if (program.opts().json) {
      printJson(result);
    } else {
      const data = result.data || [];
      console.log(`Menu Group (${data.length} root items, excludes invisible)`);
      printTree(data);
    }
  });

appCmd
  .command('menus')
  .description('Get all menus including invisible ones')
  .option('-s, --search <keyword>', 'search keyword')
  .action(async (options) => {
    const params = {};
    if (options.search) params.search = options.search;
    const result = await api.get('/app/menus', { params });
    if (program.opts().json) {
      printJson(result);
    } else {
      const data = result.data || [];
      console.log(`All Menus (${data.length} root items, includes invisible)`);
      printTree(data);
    }
  });

appCmd
  .command('invisible <id>')
  .description('Set menu invisible status (0=visible, 1=invisible)')
  .option('-v, --value <val>', 'invisible value', '1')
  .action(async (id, options) => {
    const value = parseInt(options.value);
    if (value !== 0 && value !== 1) {
      console.error('Error: value must be 0 or 1');
      process.exit(1);
    }
    const result = await api.post(`/app/menus/${id}/op/invisible`, { value });
    if (program.opts().json) {
      printJson(result);
    } else {
      console.log(`Set menu [${id}] invisible=${value}: affected ${result.data} row(s)`);
    }
  });

// Global error handler
program.exitOverride();
try {
  program.parse();
} catch (err) {
  if (err.code === 'commander.help' || err.message === '(outputHelp)') {
    process.exit(0);
  } else if (err.code === 'commander.version' || err.message === '(outputVersion)') {
    process.exit(0);
  } else if (err.code === 'commander.missingArgument') {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  } else if (err.code === 'commander.unknownOption') {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  } else {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
