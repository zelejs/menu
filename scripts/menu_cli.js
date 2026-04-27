#!/usr/bin/env node
/**
 * Menu Management CLI Tool
 *
 * For accessing and managing menu API, supports:
 * - List all menu items
 * - Show menu tree structure
 * - Debug menu hierarchy
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Load .env file if exists
const dotenv = require('dotenv');
const envPaths = [
    path.join(path.dirname(__dirname), '.env'),           // project root
    path.join(process.cwd(), '.env'),                     // current working dir
    path.join(require('os').homedir(), '.env')            // user home dir
];
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        break;
    }
}

const DEFAULT_TIMEOUT = 30000;

// Config file paths
const CONFIG_DIR = path.join(require('os').homedir(), '.config', 'menu-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Menu Item class
 */
class MenuItem {
    constructor(data = {}) {
        this.id = data.id;
        this.pid = data.pid;
        this.name = data.name || '';
        this.path = data.path || null;
        this.component = data.component || null;
        this.redirect = data.redirect || null;
        this.icon = data.icon || null;
        this.menuType = data.menuType || data.menu_type || null;
        this.visible = data.visible || null;
        this.status = data.status || null;
        this.orderNum = data.orderNum || data.order_num || null;
        this.permId = data.permId || data.perm_id || null;
        this.pageId = data.pageId || data.page_id || null;
        this.children = (data.children || []).map(child => new MenuItem(child));
    }

    toDict() {
        return {
            id: this.id,
            pid: this.pid,
            name: this.name,
            path: this.path,
            component: this.component,
            redirect: this.redirect,
            icon: this.icon,
            menuType: this.menuType,
            visible: this.visible,
            status: this.status,
            orderNum: this.orderNum,
            permId: this.permId,
            pageId: this.pageId,
            children: this.children.map(child => child.toDict())
        };
    }
}

/**
 * Configuration management
 */
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const content = fs.readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(content);
        }
    } catch (e) {
        // Ignore errors, return empty config
    }
    return {};
}

function saveConfig(config) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * HTTP request wrapper
 */
function httpRequest(options) {
    return new Promise((resolve, reject) => {
        const url = new URL(options.url);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        const reqOptions = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: options.timeout || DEFAULT_TIMEOUT
        };

        if (options.body) {
            reqOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
        }

        if (options.verbose) {
            console.error(`[DEBUG] ${reqOptions.method} ${options.url}`);
            if (options.params) {
                console.error(`[DEBUG] Params: ${JSON.stringify(options.params)}`);
            }
        }

        const req = client.request(reqOptions, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    const error = new Error(`HTTP ${res.statusCode}`);
                    error.statusCode = res.statusCode;
                    error.response = data;
                    try {
                        error.responseJson = JSON.parse(data);
                    } catch (e) {
                        // Ignore parse error
                    }
                    reject(error);
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Request timeout (${reqOptions.timeout}ms)`));
        });

        req.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
                reject(new Error(`Cannot connect to server: ${options.url}`));
            } else {
                reject(err);
            }
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

/**
 * Menu API client
 */
class MenuAPIClient {
    constructor(options = {}) {
        const config = loadConfig();

        // Priority: CLI args > config file > env vars
        this.baseUrl = (options.baseUrl ||
                        config.base_url ||
                        process.env.MENU_BASE_URL ||
                        process.env.MENU_CLI_BASE_URL).replace(/\/$/, '');

        this.token = options.token || config.token || process.env.MENU_TOKEN;
        this.timeout = options.timeout || DEFAULT_TIMEOUT;
        this.verbose = options.verbose || false;

        if (!this.baseUrl) {
            throw new Error('API endpoint not configured. Set it via:\n' +
                '  1. Command line: --url <URL>\n' +
                '  2. Config file: ~/.config/menu-cli/config.json (base_url)\n' +
                '  3. Environment: MENU_BASE_URL or MENU_CLI_BASE_URL\n' +
                '  4. .env file: MENU_BASE_URL=http://your-server/api/adm/menu');
        }

        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (this.token) {
            this.headers['Authorization'] = `Bearer ${this.token}`;
        }
    }

    async _request(method, endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const params = new URLSearchParams(options.params || {});
        const queryString = params.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        try {
            return await httpRequest({
                url: fullUrl,
                method: method,
                headers: this.headers,
                timeout: this.timeout,
                verbose: this.verbose,
                body: options.body
            });
        } catch (error) {
            if (options.noExit) {
                // Re-throw error for caller to handle
                throw error;
            }
            if (error.message.includes('timeout')) {
                console.error(`Error: Request timeout (${this.timeout / 1000}s)`);
                console.error('Hint: Use --timeout option to increase timeout');
            } else if (error.message.includes('Cannot connect')) {
                console.error(`Error: ${error.message}`);
                console.error(`URL: ${url}`);
                console.error('Hint: Check if URL is correct and server is running');
            } else if (error.statusCode) {
                console.error(`Error: HTTP ${error.statusCode}`);
                if (error.responseJson) {
                    console.error(`Details: ${JSON.stringify(error.responseJson)}`);
                } else {
                    console.error(`Details: ${error.response}`);
                }
            } else {
                console.error(`Request failed: ${error.message}`);
            }
            process.exit(1);
        }
    }

    async getMenus(page = 1, pageSize = 1000, search = null, filters = {}) {
        const params = { pageNum: page, pageSize: pageSize };
        if (search) params.search = search;
        Object.assign(params, filters);
        return this._request('GET', '/menus', { params });
    }

    async getMenuTree(status = null, search = null) {
        const params = {};
        if (status) params.status = status;
        if (search) params.search = search;

        // Use /api/adm/menu/app/group endpoint
        const result = await this._request('GET', '/app/group', { params });

        // Parse returned data
        const data = result.data || result; // Compatible with different return formats
        return data.map(item => new MenuItem(item));
    }

    async getMenu(menuId) {
        return this._request('GET', `/menus/${menuId}`, { noExit: true });
    }

    async createMenu(data) {
        return this._request('POST', '/menus', {
            body: JSON.stringify(data)
        });
    }

    async deleteMenu(menuId) {
        return this._request('DELETE', `/menus/${menuId}`);
    }

    // Dev mode methods - bypass appId filter
    async devGetAllMenus() {
        const result = await this._request('GET', '/dev/menu/menus');
        const data = result.data || result;
        return Array.isArray(data) ? data : (data.records || data.list || []);
    }

    async devGetMenuTree() {
        const result = await this._request('GET', '/dev/menu/tree');
        const data = result.data || result;
        return Array.isArray(data) ? data : [];
    }

    async devGetMenu(menuId) {
        return this._request('GET', `/dev/menu/menus/${menuId}`);
    }

    async devCreateMenu(data) {
        return this._request('POST', '/dev/menu/menus', {
            body: JSON.stringify(data)
        });
    }

    async devDeleteMenu(menuId, recursive = false) {
        const params = {};
        if (recursive) params.recursive = 'true';
        return this._request('DELETE', `/dev/menu/menus/${menuId}`, { params });
    }

    async updateMenu(menuId, data) {
        return this._request('PUT', `/menus/${menuId}`, {
            body: JSON.stringify(data)
        });
    }

    // Dev mode update - bypass appId filter
    async devUpdateMenu(menuId, data) {
        return this._request('PUT', `/dev/menu/menus/${menuId}`, {
            body: JSON.stringify(data)
        });
    }

    async moveMenu(menuId, newParentId, devMode = false) {
        const endpoint = devMode ? `/dev/menu/menus/${menuId}/move` : `/menus/${menuId}/move`;
        const params = {};
        // Only add pid parameter if it's not null (null means move to top level)
        if (newParentId !== null && newParentId !== undefined) {
            params.pid = newParentId;
        }
        return this._request('PUT', endpoint, { params });
    }

    async promoteMenuToTop(menuId, devMode = false) {
        const endpoint = devMode ? `/dev/menu/menus/${menuId}/promote` : `/menus/${menuId}/promote`;
        return this._request('PUT', endpoint, {});
    }

    async batchMoveMenus(menuIds, newParentId, devMode = false) {
        const results = [];
        for (const menuId of menuIds) {
            try {
                const result = await this.moveMenu(menuId, newParentId, devMode);
                results.push({ menuId, success: true, result });
            } catch (error) {
                results.push({ menuId, success: false, error: error.message });
            }
        }
        return results;
    }
}

/**
 * Menu tree printer
 */
class MenuTreePrinter {
    constructor(options = {}) {
        this.showDetails = options.showDetails || false;
    }

    printTree(items, prefix = '', isLast = true) {
        items.forEach((item, i) => {
            const isLastItem = i === items.length - 1;
            const connector = isLastItem ? '└── ' : '├── ';
            console.log(`${prefix}${connector}${this._formatItem(item)}`);

            // Recursively print children
            if (item.children && item.children.length > 0) {
                const extension = isLastItem ? '    ' : '│   ';
                this.printTree(item.children, prefix + extension, isLastItem);
            }
        });
    }

    printFlat(items, indent = 0) {
        items.forEach(item => {
            const prefix = '│   '.repeat(indent);
            const connector = indent === 0 || !item.children || item.children.length === 0 ? '└── ' : '├── ';
            console.log(`${prefix}${connector}[${item.id}] ${item.name}`);

            if (this.showDetails) {
                const detailPrefix = '│   '.repeat(indent + 1);
                if (item.path) {
                    console.log(`${detailPrefix}path: ${item.path}`);
                }
                if (item.component) {
                    console.log(`${detailPrefix}component: ${item.component}`);
                }
            }

            if (item.children && item.children.length > 0) {
                this.printFlat(item.children, indent + 1);
            }
        });
    }

    _formatItem(item) {
        const parts = [this._colorize(`[${item.id}] ${item.name}`, item.status)];

        // Always show appId in dev mode (even when showDetails is false)
        const appId = item.appId || item.app_id || null;
        if (appId) {
            parts.push(`appId: ${appId}`);
        }

        if (this.showDetails) {
            if (item.path) {
                parts.push(`path: ${item.path}`);
            }
            if (item.component) {
                parts.push(`component: ${item.component}`);
            }
            if (item.menuType) {
                const typeStr = this._menuTypeStr(item.menuType);
                parts.push(`type: ${typeStr}`);
            }
            if (item.status) {
                const statusStr = item.status === '0' ? '✓' : '✗';
                parts.push(`status: ${statusStr}`);
            }
            if (item.orderNum !== null && item.orderNum !== undefined) {
                parts.push(`order: ${item.orderNum}`);
            }
        }

        return parts.join(' ');
    }

    _colorize(text, status) {
        if (status === '1') {
            return `${text} [disabled]`;
        }
        return text;
    }

    _menuTypeStr(menuType) {
        const typeMap = {
            'C': 'Directory',
            'M': 'Menu',
            'F': 'Button'
        };
        return typeMap[menuType] || menuType;
    }
}

/**
 * Menu debugger
 */
class MenuDebugger {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    checkTreeIntegrity(items) {
        const issues = [];
        const seenIds = new Set();
        const pathStack = [];

        const checkItem = (item, parent = null) => {
            // Check duplicate ID
            if (seenIds.has(item.id)) {
                issues.push(`Duplicate menu ID: ${item.id} (${item.name})`);
            }
            seenIds.add(item.id);

            // Check parent-child relationship
            if (parent && item.pid !== parent.id) {
                issues.push(
                    `Parent-child mismatch: [${item.id}] ${item.name} ` +
                    `pid=${item.pid}, but parent id=${parent.id}`
                );
            }

            // Check circular reference
            if (pathStack.includes(item.id)) {
                issues.push(
                    `Circular reference detected: ${pathStack.join(' -> ')} -> ${item.id} (${item.name})`
                );
                return;
            }

            // Recursively check children
            pathStack.push(item.id);
            if (item.children) {
                item.children.forEach(child => checkItem(child, item));
            }
            pathStack.pop();
        };

        items.forEach(item => checkItem(item));

        return issues;
    }

    findOrphanNodes(items) {
        const allIds = new Set();

        const collectIds = (item) => {
            allIds.add(item.id);
            if (item.children) {
                item.children.forEach(child => collectIds(child));
            }
        };

        items.forEach(item => collectIds(item));

        const orphans = [];

        const checkOrphan = (item) => {
            if (item.pid !== 0 && !allIds.has(item.pid)) {
                orphans.push(item);
            }
            if (item.children) {
                item.children.forEach(child => checkOrphan(child));
            }
        };

        items.forEach(item => checkOrphan(item));

        return orphans;
    }

    analyzeMenuStats(items) {
        const stats = {
            totalMenus: 0,
            byType: {},
            byStatus: {},
            maxDepth: 0,
            rootCount: items.length
        };

        const countItems = (item, depth = 0) => {
            stats.totalMenus++;
            stats.maxDepth = Math.max(stats.maxDepth, depth);

            if (item.menuType) {
                stats.byType[item.menuType] = (stats.byType[item.menuType] || 0) + 1;
            }
            if (item.status) {
                stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
            }

            if (item.children) {
                item.children.forEach(child => countItems(child, depth + 1));
            }
        };

        items.forEach(item => countItems(item));

        return stats;
    }
}

/**
 * Print JSON output
 */
function printJson(data, pretty = true) {
    let output;

    if (Array.isArray(data)) {
        output = data.map(item => (item.toDict ? item.toDict() : item));
    } else if (data.toDict) {
        output = data.toDict();
    } else {
        output = data;
    }

    if (pretty) {
        console.log(JSON.stringify(output, null, 2));
    } else {
        console.log(JSON.stringify(output));
    }
}

/**
 * Print menu details in a formatted way
 */
function printMenuDetails(menu) {
    if (!menu) {
        console.error('Error: No menu data found');
        return;
    }

    console.log('='.repeat(70));
    console.log(`MENU DETAILS [${menu.id}]`);
    console.log('='.repeat(70));

    // Basic fields
    console.log(`\n[BASIC INFO]`);
    console.log(`  ID:              ${menu.id}`);
    console.log(`  Name:            ${menu.name || 'N/A'}`);
    console.log(`  Parent ID:       ${menu.pid ?? 'null (top level)'}`);

    // Path & Route
    console.log(`\n[PATH & ROUTE]`);
    console.log(`  Path:            ${menu.path || 'N/A'}`);
    console.log(`  Component:       ${menu.component || 'N/A'}`);
    console.log(`  Redirect:        ${menu.redirect || 'N/A'}`);

    // Menu Type
    const typeNames = { 'C': 'Catalog/Directory', 'M': 'Menu', 'F': 'Button/Function' };
    console.log(`\n[MENU TYPE]`);
    console.log(`  Type:            ${menu.menuType || menu.menu_type || 'N/A'} (${typeNames[menu.menuType || menu.menu_type] || 'Unknown'})`);

    // Display Options
    console.log(`\n[DISPLAY OPTIONS]`);
    console.log(`  Visible:         ${menu.visible ?? 'N/A'}`);
    console.log(`  Status:          ${menu.status ?? 'N/A'} (${menu.status === '0' ? 'Enabled' : menu.status === '1' ? 'Disabled' : 'Unknown'})`);
    console.log(`  Icon:            ${menu.icon || 'N/A'}`);
    console.log(`  Order Num:       ${menu.orderNum ?? menu.order_num ?? 'N/A'}`);

    // Permissions
    console.log(`\n[PERMISSIONS]`);
    console.log(`  Permission ID:   ${menu.permId ?? menu.perm_id ?? 'N/A'}`);
    console.log(`  Page ID:         ${menu.pageId ?? menu.page_id ?? 'N/A'}`);

    // App Relation
    console.log(`\n[APP RELATION]`);
    console.log(`  App ID:          ${menu.appId ?? menu.app_id ?? 'N/A'}`);
    console.log(`  App Relation ID: ${menu.appResRelationId ?? menu.app_res_relation_id ?? 'N/A'}`);

    // Timestamps
    console.log(`\n[TIMESTAMPS]`);
    console.log(`  Created At:      ${menu.createTime || menu.create_time || 'N/A'}`);
    console.log(`  Updated At:      ${menu.updateTime || menu.update_time || 'N/A'}`);

    // Any additional fields
    const knownFields = ['id', 'pid', 'name', 'path', 'component', 'redirect', 'icon',
        'menuType', 'menu_type', 'visible', 'status', 'orderNum', 'order_num',
        'permId', 'perm_id', 'pageId', 'page_id', 'appId', 'app_id',
        'appResRelationId', 'app_res_relation_id', 'createTime', 'create_time',
        'updateTime', 'update_time', 'data', 'records', 'total', 'pages', 'current'];

    const extraFields = Object.keys(menu).filter(k => !knownFields.includes(k));
    if (extraFields.length > 0) {
        console.log(`\n[EXTRA FIELDS]`);
        extraFields.forEach(field => {
            console.log(`  ${field}:           ${JSON.stringify(menu[field])}`);
        });
    }

    console.log('\n' + '='.repeat(70));
}

/**
 * Command line argument parser
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        command: null,
        subCommand: null,
        baseUrl: null,
        token: null,
        timeout: null,
        json: false,
        verbose: false,
        saveConfig: false,
        showHelp: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case '--url':
                options.baseUrl = args[++i];
                break;
            case '--token':
                options.token = args[++i];
                break;
            case '--timeout':
                options.timeout = parseInt(args[++i]) * 1000;
                break;
            case '--json':
                options.json = true;
                break;
            case '-v':
            case '--verbose':
                options.verbose = true;
                break;
            case '--save-config':
                options.saveConfig = true;
                break;
            case '-h':
            case '--help':
                options.showHelp = true;
                break;
            case 'dev':
                options.command = 'dev';
                // Next arg is the sub-command
                if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                    options.subCommand = args[++i];
                    options.commandArgs = args.slice(i + 1);
                } else {
                    options.commandArgs = [];
                }
                return options;
            case 'list':
            case 'tree':
            case 'get':
            case 'new':
            case 'move':
            case 'debug':
            case 'config':
            case 'delete':
                options.command = arg;
                options.commandArgs = args.slice(i + 1);
                return options;
            default:
                // If command, stop parsing global options
                if (!arg.startsWith('-')) {
                    options.command = arg;
                    options.commandArgs = args.slice(i + 1);
                    return options;
                }
        }
    }

    return options;
}

/**
 * Parse sub-command arguments
 * Returns: { options: {...}, positional: [...] }
 */
function parseCommandArgs(args, spec) {
    const result = { options: {}, positional: [] };
    const flags = spec.flags || [];
    const consumed = new Set();

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        // Check if defined flag
        const flag = flags.find(f => f.names.includes(arg));
        if (flag) {
            consumed.add(i);
            if (flag.hasValue) {
                result.options[flag.key] = args[++i];
                consumed.add(i);
            } else {
                result.options[flag.key] = true;
            }
        }
    }

    // Collect positional arguments (not consumed)
    result.positional = args.filter((_, idx) => !consumed.has(idx));

    return result;
}

/**
 * Show help information
 */
function showHelp() {
    console.log(`
Menu CLI v1.1.0

USAGE:
  menu-cli [options] <command> [args]

COMMANDS:
  list       List menu items (API)
  tree       Show menu tree (API)
  get <id>   Get menu details by ID (API)
  new        Create new menu with defaults
  move       Move menu(s) to new parent
  promote    Promote menu(s) to top level (menu_type='C', pid=null)
  delete <id> Delete a menu (API)
  debug      Debug menu structure
  dev        Dev mode - bypass appId filter
  config     Manage configuration
  help       Show this help

GET COMMAND:
  menu-cli get <id>                  # Show menu details
  menu-cli get 69                    # Show details for menu ID 69
  menu-cli get 69 --json             # Output as JSON

NEW COMMAND:
  menu-cli new                       # Create menu with defaults
  menu-cli new -n "我的菜单"          # Create with custom name
  menu-cli new -n "子菜单" -p 2      # Create under parent 2
  menu-cli new -n "菜单" -t C -p 2   # Create catalog type under parent 2
  menu-cli new -f                    # Create without confirmation

  Options:
    -n, --name <name>        Menu name (default: "新菜单")
    -t, --type <type>        Menu type: C=Directory, M=Menu, F=Button (default: M)
    -p, --parent <pid>       Parent menu ID (default: null/top level)
    --path <path>            Menu path
    --component <component>  Component path
    --icon <icon>            Icon name
    -f, --force              Skip confirmation

DEV NEW COMMAND:
  menu-cli dev new                    # Create menu with defaults (dev mode)
  menu-cli dev new -n "我的菜单"       # Create with custom name
  menu-cli dev new -n "子菜单" -p 2   # Create under parent 2
  menu-cli dev new -f                 # Create without confirmation

  Options:
    -n, --name <name>        Menu name (default: "新菜单")
    -t, --type <type>        Menu type: C=Directory, M=Menu, F=Button (default: M)
    -p, --parent <pid>       Parent menu ID (default: null/top level)
    --path <path>            Menu path
    --component <component>  Component path
    --icon <icon>            Icon name
    -f, --force              Skip confirmation

  Note: appId is automatically retrieved from JWT token and used to create
        t_app_res_relation record if available

MOVE COMMAND:
  menu-cli move <id> [<id>...] --parent <pid>|null
  menu-cli move 69 --parent null       # Move to top level
  menu-cli move 69 74 81 --parent 56   # Batch move to parent 56
  menu-cli move 69 --parent null -f    # Force without confirm

PROMOTE COMMAND:
  menu-cli promote <id> [<id>...]      # Promote to top level (menu_type='C', pid=null)
  menu-cli promote 69                  # Promote single menu
  menu-cli promote 69 74 -f            # Promote multiple menus without confirm

DEV COMMANDS:
  dev list       List all menus (no appId filter)
  dev tree       Show menu tree (no appId filter)
  dev get <id>   Get menu details (no appId filter)
  dev delete <id> Delete menu (no appId filter)
  dev move       Move menu(s) in dev mode
  dev promote    Promote menu(s) in dev mode
  dev new        Create new menu (no appId filter)
  dev promote    Promote menu(s) in dev mode

OPTIONS:
  --url <url>        API base URL
  --token <token>    Auth token
  --json             JSON output
  -v, --verbose      Debug mode
  -f, --force        Skip confirmation

EXAMPLES:
  menu-cli tree
  menu-cli dev tree
  menu-cli dev delete 134 -f
  menu-cli dev list --json
  menu-cli dev new -n "My Menu" -f
  menu-cli move 69 74 81 --parent null -f

CONFIG:
  Config: ~/.config/menu-cli/config.json
  Env: MENU_BASE_URL, MENU_TOKEN
`);
}

/**
 * Main function
 */
async function main() {
    const options = parseArgs();

    if (options.showHelp || !options.command) {
        showHelp();
        process.exit(options.showHelp ? 0 : 1);
    }

    // Handle config command
    if (options.command === 'config') {
        const config = loadConfig();
        const args = options.commandArgs || [];

        if (args.includes('--show')) {
            console.log('Current configuration:');
            console.log(JSON.stringify(config, null, 2));
        } else if (args.includes('--clear')) {
            if (fs.existsSync(CONFIG_FILE)) {
                fs.unlinkSync(CONFIG_FILE);
                console.log('Configuration cleared');
            } else {
                console.log('No configuration file found');
            }
        } else if (args.includes('--set')) {
            const idx = args.indexOf('--set');
            const key = args[idx + 1];
            const value = args[idx + 2];
            if (key && value) {
                config[key] = value;
                saveConfig(config);
                console.log(`Set: ${key} = ${value}`);
            } else {
                console.error('--set requires KEY and VALUE');
            }
        } else {
            console.log(`
CONFIG COMMANDS:
  --show              Show config
  --set <k> <v>       Set value
  --clear             Clear config
`);
        }
        return;
    }

    // Handle dev command (via /dev/menu API)
    if (options.command === 'dev') {
        const subCommand = options.subCommand;
        const commandArgs = options.commandArgs || [];

        if (!subCommand || !['list', 'tree', 'get', 'delete', 'move', 'promote', 'new'].includes(subCommand)) {
            console.error('Error: dev requires a sub-command: list, tree, get, delete, move, promote, or new');
            console.error('Usage: menu-cli dev <list|tree|get|delete|move|promote|new> [args]');
            process.exit(1);
        }

        // Create API client for dev mode
        let client;
        try {
            client = new MenuAPIClient({
                baseUrl: options.baseUrl,
                token: options.token,
                timeout: options.timeout,
                verbose: options.verbose
            });
        } catch (err) {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        }

        try {
            if (subCommand === 'list') {
                const menus = await client.devGetAllMenus();

                if (options.json) {
                    printJson(menus);
                } else {
                    console.log(`Dev mode: ${menus.length} menus (bypass appId filter)`);
                    console.log('-'.repeat(80));
                    menus.forEach(item => {
                        const statusStr = item.status === '0' ? '✓' : '✗';
                        const type = (item.menuType || item.menu_type || 'N/A').padEnd(4);
                        const appId = item.appId || item.app_id || null;
                        const appIdStr = appId ? `appId: ${appId}` : 'appId: -';
                        console.log(`[${item.id}] ${item.name} - type: ${type} status: ${statusStr} ${appIdStr}`);
                    });
                }

            } else if (subCommand === 'tree') {
                const tree = await client.devGetMenuTree();

                if (options.json) {
                    printJson(tree);
                } else {
                    console.log('Dev mode: menu tree (bypass appId filter)');
                    console.log('-'.repeat(80));
                    const printer = new MenuTreePrinter({ showDetails: false });
                    printer.printTree(tree);
                }

            } else if (subCommand === 'delete') {
                const deleteSpec = {
                    flags: [
                        { names: ['-f', '--force'], key: 'force', hasValue: false },
                        { names: ['-r', '--recursive'], key: 'recursive', hasValue: false }
                    ]
                };
                const cmdOptions = parseCommandArgs(commandArgs, deleteSpec);

                const menuId = cmdOptions.positional[0];
                if (!menuId) {
                    console.error('Error: Menu ID is required');
                    console.error('Usage: menu-cli dev delete <id> [options]');
                    process.exit(1);
                }

                const id = parseInt(menuId);
                if (isNaN(id)) {
                    console.error(`Error: Invalid menu ID: ${menuId}`);
                    process.exit(1);
                }

                // Confirm deletion
                if (!cmdOptions.options.force) {
                    const readline = require('readline');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    const answer = await new Promise(resolve => {
                        rl.question(`Delete menu [${id}]? (y/N): `, resolve);
                    });
                    rl.close();

                    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                        console.log('Cancelled');
                        process.exit(0);
                    }
                }

                // Perform deletion via API
                await client.devDeleteMenu(id, cmdOptions.options.recursive);
                console.log(`✓ Menu [${id}] deleted`);

            } else if (subCommand === 'get') {
                const menuId = commandArgs[0];
                if (!menuId) {
                    console.error('Error: Menu ID is required');
                    console.error('Usage: menu-cli dev get <id>');
                    process.exit(1);
                }

                const id = parseInt(menuId);
                if (isNaN(id)) {
                    console.error(`Error: Invalid menu ID: ${menuId}`);
                    process.exit(1);
                }

                const result = await client.devGetMenu(id);

                if (options.json) {
                    printJson(result);
                } else {
                    const data = result.data || result;
                    printMenuDetails(data);
                }

            } else if (subCommand === 'move') {
                const moveSpec = {
                    flags: [
                        { names: ['-p', '--parent'], key: 'parent', hasValue: true },
                        { names: ['-f', '--force'], key: 'force', hasValue: false }
                    ]
                };
                const cmdOptions = parseCommandArgs(commandArgs, moveSpec);

                // Get menu IDs from positional args
                const menuIds = cmdOptions.positional
                    .map(arg => parseInt(arg))
                    .filter(id => !isNaN(id));

                if (menuIds.length === 0) {
                    console.error('Error: At least one menu ID is required');
                    console.error('Usage: menu-cli dev move <id> [<id>...] --parent <pid>|null');
                    process.exit(1);
                }

                // Parse parent ID
                let newParentId = cmdOptions.options.parent;
                if (newParentId === 'null' || newParentId === 'NULL' || newParentId === '0') {
                    newParentId = null;
                } else if (newParentId !== undefined && newParentId !== null) {
                    newParentId = parseInt(newParentId);
                    if (isNaN(newParentId)) {
                        console.error(`Error: Invalid parent ID: ${cmdOptions.options.parent}`);
                        process.exit(1);
                    }
                } else if (newParentId === undefined) {
                    console.error('Error: --parent option is required');
                    console.error('Usage: menu-cli dev move <id> [<id>...] --parent <pid>|null');
                    process.exit(1);
                }

                // Get menu info
                const menuTree = await client.devGetMenuTree();

                const findMenu = (items, targetId) => {
                    for (const item of items) {
                        if (item.id === targetId) {
                            return item;
                        }
                        if (item.children && item.children.length > 0) {
                            const result = findMenu(item.children, targetId);
                            if (result) return result;
                        }
                    }
                    return null;
                };

                const menusToMove = menuIds.map(id => findMenu(menuTree, id)).filter(m => m !== null);
                const notFound = menuIds.filter(id => findMenu(menuTree, id) === null);

                if (notFound.length > 0) {
                    console.error(`Error: Menu(s) not found: ${notFound.join(', ')}`);
                    process.exit(1);
                }

                const parentDesc = newParentId === null ? 'top level' : `parent [${newParentId}]`;
                console.log(`Dev mode: Will move ${menuIds.length} menu(s) to ${parentDesc}:`);
                menusToMove.forEach(m => {
                    const currentParent = m.pid === null ? 'top level' : `parent [${m.pid}]`;
                    console.log(`  [${m.id}] ${m.name} (currently: ${currentParent})`);
                });

                // Confirm move
                if (!cmdOptions.options.force) {
                    const readline = require('readline');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    const answer = await new Promise(resolve => {
                        rl.question(`Proceed with move? (y/N): `, resolve);
                    });
                    rl.close();

                    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                        console.log('Cancelled');
                        process.exit(0);
                    }
                }

                // Perform move via dev API
                const results = await client.batchMoveMenus(menuIds, newParentId, true);

                // Show results
                const successCount = results.filter(r => r.success).length;
                const failCount = results.filter(r => !r.success).length;

                if (failCount > 0) {
                    console.log(`\nMoved ${successCount} menu(s), ${failCount} failed:`);
                    results.forEach(r => {
                        if (r.success) {
                            console.log(`  ✓ [${r.menuId}] moved`);
                        } else {
                            console.log(`  ✗ [${r.menuId}] failed: ${r.error}`);
                        }
                    });
                    process.exit(1);
                } else {
                    console.log(`✓ Successfully moved ${successCount} menu(s) to ${parentDesc}`);
                }
            }

            // Dev promote command
            if (subCommand === 'promote') {
                const promoteSpec = {
                    flags: [
                        { names: ['-f', '--force'], key: 'force', hasValue: false }
                    ]
                };
                const cmdOptions = parseCommandArgs(commandArgs, promoteSpec);

                // Get menu IDs from positional args
                const menuIds = cmdOptions.positional
                    .map(arg => parseInt(arg))
                    .filter(id => !isNaN(id));

                if (menuIds.length === 0) {
                    console.error('Error: At least one menu ID is required');
                    console.error('Usage: menu-cli dev promote <id> [<id>...]');
                    process.exit(1);
                }

                // Get menu info from tree for display
                const menuTree = await client.devGetMenuTree();

                const findMenu = (items, targetId) => {
                    for (const item of items) {
                        if (item.id === targetId) {
                            return item;
                        }
                        if (item.children && item.children.length > 0) {
                            const result = findMenu(item.children, targetId);
                            if (result) return result;
                        }
                    }
                    return null;
                };

                const menusToPromote = menuIds.map(id => findMenu(menuTree, id)).filter(m => m !== null);
                const notFound = menuIds.filter(id => findMenu(menuTree, id) === null);

                console.log(`Dev mode: Will promote ${menuIds.length} menu(s) to top level (menu_type='C', pid=null):`);
                if (menusToPromote.length > 0) {
                    menusToPromote.forEach(m => {
                        const currentParent = m.pid === null ? 'top level' : `parent [${m.pid}]`;
                        console.log(`  [${m.id}] ${m.name} (currently: ${currentParent}, type: ${m.menuType || 'N/A'})`);
                    });
                }
                if (notFound.length > 0) {
                    notFound.forEach(id => {
                        console.log(`  [${id}] (unknown - will promote anyway)`);
                    });
                }

                // Confirm promote
                if (!cmdOptions.options.force) {
                    const readline = require('readline');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    const answer = await new Promise(resolve => {
                        rl.question(`Proceed with promote? (y/N): `, resolve);
                    });
                    rl.close();

                    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                        console.log('Cancelled');
                        process.exit(0);
                    }
                }

                // Perform promote via dev API
                const results = [];
                for (const menuId of menuIds) {
                    try {
                        const result = await client.promoteMenuToTop(menuId, true);
                        results.push({ menuId, success: true, result });
                    } catch (error) {
                        results.push({ menuId, success: false, error: error.message });
                    }
                }

                // Show results
                const successCount = results.filter(r => r.success).length;
                const failCount = results.filter(r => !r.success).length;

                if (failCount > 0) {
                    console.log(`\nPromoted ${successCount} menu(s), ${failCount} failed:`);
                    results.forEach(r => {
                        if (r.success) {
                            console.log(`  ✓ [${r.menuId}] promoted`);
                        } else {
                            console.log(`  ✗ [${r.menuId}] failed: ${r.error}`);
                        }
                    });
                    process.exit(1);
                } else {
                    console.log(`✓ Successfully promoted ${successCount} menu(s) to top level`);
                }

            } else if (subCommand === 'new') {
                const newSpec = {
                    flags: [
                        { names: ['-n', '--name'], key: 'name', hasValue: true },
                        { names: ['-t', '--type'], key: 'menuType', hasValue: true },
                        { names: ['-p', '--parent'], key: 'pid', hasValue: true },
                        { names: ['--path'], key: 'path', hasValue: true },
                        { names: ['--component'], key: 'component', hasValue: true },
                        { names: ['--icon'], key: 'icon', hasValue: true },
                        { names: ['-f', '--force'], key: 'force', hasValue: false }
                    ]
                };
                const cmdOptions = parseCommandArgs(commandArgs, newSpec);

                // Build menu data with defaults
                const menuData = {};

                // Set defaults
                menuData.name = cmdOptions.options.name || '新菜单';
                menuData.menuType = cmdOptions.options.menuType || 'M';
                menuData.pid = cmdOptions.options.pid || null;
                menuData.visible = '0';
                menuData.status = '0';
                menuData.orderNum = 0;
                menuData.isFrame = 0;
                menuData.isCache = 0;
                menuData.hideInMenu = 0;

                // Optional fields
                if (cmdOptions.options.path) menuData.path = cmdOptions.options.path;
                if (cmdOptions.options.component) menuData.component = cmdOptions.options.component;
                if (cmdOptions.options.icon) menuData.icon = cmdOptions.options.icon;

                // Convert pid to number if provided
                if (menuData.pid) {
                    menuData.pid = parseInt(menuData.pid);
                    if (isNaN(menuData.pid)) {
                        console.error(`Error: Invalid parent ID: ${cmdOptions.options.pid}`);
                        process.exit(1);
                    }
                }

                // Confirm creation
                if (!cmdOptions.options.force) {
                    const readline = require('readline');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    const parentInfo = menuData.pid ? ` under parent [${menuData.pid}]` : ' at top level';
                    const answer = await new Promise(resolve => {
                        rl.question(`Create new menu "${menuData.name}"${parentInfo}? (y/N): `, resolve);
                    });
                    rl.close();

                    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                        console.log('Cancelled');
                        process.exit(0);
                    }
                }

                // Create menu via dev API
                const result = await client.devCreateMenu(menuData);

                if (options.json) {
                    printJson(result);
                } else {
                    const data = result.data || result;
                    if (data && data.id) {
                        console.log(`✓ Menu created with ID: ${data.id}`);
                    } else {
                        console.log('✓ Menu created');
                    }
                }
            }

        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
        return;
    }

    // Save configuration
    if (options.saveConfig) {
        const config = loadConfig();
        if (options.baseUrl) {
            config.base_url = options.baseUrl;
        }
        if (options.token) {
            config.token = options.token;
        }
        saveConfig(config);
        console.log(`Configuration saved to: ${CONFIG_FILE}`);
    }

    // Create API client
    let client;
    try {
        client = new MenuAPIClient({
            baseUrl: options.baseUrl,
            token: options.token,
            timeout: options.timeout,
            verbose: options.verbose
        });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        showHelp();
        process.exit(1);
    }

    // Parse command-specific args
    const commandArgs = options.commandArgs || [];

    if (options.command === 'list') {
        const listSpec = {
            flags: [
                { names: ['-p', '--page'], key: 'page', hasValue: true },
                { names: ['-s', '--page-size'], key: 'pageSize', hasValue: true },
                { names: ['--search'], key: 'search', hasValue: true },
                { names: ['--status'], key: 'status', hasValue: true }
            ]
        };
        const cmdOptions = parseCommandArgs(commandArgs, listSpec);
        const page = parseInt(cmdOptions.options.page) || 1;
        const pageSize = parseInt(cmdOptions.options.pageSize) || 100;

        // Build filters object, only include non-null values
        const filters = {};
        if (cmdOptions.options.search) filters.search = cmdOptions.options.search;
        if (cmdOptions.options.status) filters.status = cmdOptions.options.status;

        const result = await client.getMenus(
            page,
            pageSize,
            cmdOptions.options.search || null,
            filters
        );

        if (options.json) {
            printJson(result);
        } else {
            const data = result.data || result;
            let records, total, pages, current;

            if (typeof data === 'object' && !Array.isArray(data)) {
                records = data.records || [];
                total = data.total || records.length;
                pages = data.pages || 1;
                current = data.current || page;
                console.log(`Menu list (Page ${current} of ${pages}, ${total} records)`);
            } else {
                records = data || [];
                total = records.length;
                console.log(`Menu list (${total} records)`);
            }

            console.log('-'.repeat(80));

            records.forEach(item => {
                const statusStr = item.status === '0' ? '✓' : '✗';
                const path = (item.path || 'N/A').padEnd(20);
                const type = (item.menuType || 'N/A').padEnd(4);
                const appId = item.appId || item.app_id || null;
                const appIdStr = appId ? `appId: ${appId}` : '';
                console.log(`[${item.id}] ${item.name} - path: ${path} type: ${type} status: ${statusStr} ${appIdStr}`);
            });
        }

    } else if (options.command === 'tree') {
        const treeSpec = {
            flags: [
                { names: ['-d', '--details'], key: 'details', hasValue: false },
                { names: ['-f', '--flat'], key: 'flat', hasValue: false },
                { names: ['-s', '--search'], key: 'search', hasValue: true },
                { names: ['--status'], key: 'status', hasValue: true }
            ]
        };
        const cmdOptions = parseCommandArgs(commandArgs, treeSpec);

        const menuTree = await client.getMenuTree(
            cmdOptions.options.status || null,
            cmdOptions.options.search || null
        );

        if (options.json) {
            printJson(menuTree);
        } else {
            const printer = new MenuTreePrinter({ showDetails: cmdOptions.options.details });
            if (cmdOptions.options.flat) {
                printer.printFlat(menuTree);
            } else {
                printer.printTree(menuTree);
            }
        }

    } else if (options.command === 'get') {
        const menuId = commandArgs[0];
        if (!menuId) {
            console.error('Error: Menu ID is required');
            console.error('Usage: menu-cli get <menu-id>');
            process.exit(1);
        }

        const id = parseInt(menuId);
        if (isNaN(id)) {
            console.error(`Error: Invalid menu ID: ${menuId}`);
            process.exit(1);
        }

        let result;
        let usedDevApi = false;

        // Try regular API first
        try {
            result = await client.getMenu(id);
        } catch (error) {
            // Fallback to dev API
            if (options.verbose) {
                console.log(`Regular API failed, trying dev API...`);
            }
            result = await client.devGetMenu(id);
            usedDevApi = true;
        }

        if (options.json) {
            printJson(result);
        } else {
            if (usedDevApi) {
                console.log('(Using dev API - no appId filter)');
            }
            const data = result.data || result;
            printMenuDetails(data);
        }

    } else if (options.command === 'new') {
        const newSpec = {
            flags: [
                { names: ['-n', '--name'], key: 'name', hasValue: true },
                { names: ['-t', '--type'], key: 'menuType', hasValue: true },
                { names: ['-p', '--parent'], key: 'pid', hasValue: true },
                { names: ['--path'], key: 'path', hasValue: true },
                { names: ['--component'], key: 'component', hasValue: true },
                { names: ['--icon'], key: 'icon', hasValue: true },
                { names: ['-f', '--force'], key: 'force', hasValue: false }
            ]
        };
        const cmdOptions = parseCommandArgs(commandArgs, newSpec);

        // Build menu data with defaults
        const menuData = {};

        // Set defaults (all required fields)
        menuData.name = cmdOptions.options.name || '新菜单';
        menuData.path = cmdOptions.options.path || '/';
        menuData.menuType = cmdOptions.options.menuType || 'M';
        menuData.pid = cmdOptions.options.pid || null;
        menuData.visible = '0';
        menuData.status = '0';
        menuData.orderNum = 0;
        menuData.isFrame = 0;
        menuData.isCache = 0;
        menuData.hideInMenu = 0;

        // Optional fields
        if (cmdOptions.options.component) menuData.component = cmdOptions.options.component;
        if (cmdOptions.options.icon) menuData.icon = cmdOptions.options.icon;

        // Convert pid to number if provided
        if (menuData.pid) {
            menuData.pid = parseInt(menuData.pid);
            if (isNaN(menuData.pid)) {
                console.error(`Error: Invalid parent ID: ${cmdOptions.options.pid}`);
                process.exit(1);
            }
        }

        // Confirm creation
        if (!cmdOptions.options.force) {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const parentInfo = menuData.pid ? ` under parent [${menuData.pid}]` : ' at top level';
            const answer = await new Promise(resolve => {
                rl.question(`Create new menu "${menuData.name}"${parentInfo}? (y/N): `, resolve);
            });
            rl.close();

            if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                console.log('Cancelled');
                process.exit(0);
            }
        }

        // Create menu via API
        const result = await client.createMenu(menuData);

        if (options.json) {
            printJson(result);
        } else {
            const data = result.data || result;
            if (data && data.id) {
                console.log(`✓ Menu created with ID: ${data.id}`);
                console.log(`  Name: ${data.name || menuData.name}`);
                console.log(`  Type: ${data.menuType || menuData.menuType}`);
                console.log(`  Parent: ${data.pid ?? menuData.pid ?? 'null (top level)'}`);
            } else {
                console.log('✓ Menu created');
                printJson(data, true);
            }
        }

    } else if (options.command === 'debug') {
        const debugSpec = {
            flags: [
                { names: ['--check-integrity'], key: 'checkIntegrity', hasValue: false },
                { names: ['--find-orphans'], key: 'findOrphans', hasValue: false },
                { names: ['--stats'], key: 'stats', hasValue: false }
            ]
        };
        const cmdOptions = parseCommandArgs(commandArgs, debugSpec);

        const menuDebugger = new MenuDebugger(client);
        const menuTree = await client.getMenuTree();

        // Run all debug checks if no specific option provided
        const runAll = !cmdOptions.options.checkIntegrity && !cmdOptions.options.findOrphans && !cmdOptions.options.stats;

        if (runAll || cmdOptions.options.checkIntegrity) {
            const issues = menuDebugger.checkTreeIntegrity(menuTree);
            if (issues.length > 0) {
                console.log('Found issues:');
                issues.forEach(issue => console.log(`  ❌ ${issue}`));
            } else {
                console.log('✓ No structural issues found');
            }
        }

        if (runAll || cmdOptions.options.findOrphans) {
            if (runAll) console.log();
            const orphans = menuDebugger.findOrphanNodes(menuTree);
            if (orphans.length > 0) {
                console.log(`Found ${orphans.length} orphan node(s):`);
                orphans.forEach(orphan => {
                    console.log(`  ⚠️  [${orphan.id}] ${orphan.name} (pid: ${orphan.pid})`);
                });
            } else {
                console.log('✓ No orphan nodes found');
            }
        }

        if (runAll || cmdOptions.options.stats) {
            if (runAll) console.log();
            const stats = menuDebugger.analyzeMenuStats(menuTree);
            console.log('📊 Menu Statistics:');
            console.log(`  Total menus: ${stats.totalMenus}`);
            console.log(`  Root menus: ${stats.rootCount}`);
            console.log(`  Max depth: ${stats.maxDepth}`);

            const typeNames = { 'C': 'Directory', 'M': 'Menu', 'F': 'Button' };
            if (Object.keys(stats.byType).length > 0) {
                console.log(`  By type:`);
                Object.entries(stats.byType)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .forEach(([menuType, count]) => {
                        const name = typeNames[menuType] || menuType;
                        console.log(`    ${name}: ${count}`);
                    });
            }

            if (Object.keys(stats.byStatus).length > 0) {
                console.log(`  By status:`);
                Object.entries(stats.byStatus)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .forEach(([status, count]) => {
                        const statusStr = status === '0' ? 'Active' : 'Disabled';
                        console.log(`    ${statusStr}: ${count}`);
                    });
            }
        }
    } else if (options.command === 'delete') {
        const deleteSpec = {
            flags: [
                { names: ['-f', '--force'], key: 'force', hasValue: false },
                { names: ['-r', '--recursive'], key: 'recursive', hasValue: false }
            ]
        };
        const cmdOptions = parseCommandArgs(commandArgs, deleteSpec);

        // Get menu ID from positional args
        const menuId = cmdOptions.positional[0];
        if (!menuId) {
            console.error('Error: Menu ID is required');
            console.error('Usage: menu_cli.js delete <id> [options]');
            process.exit(1);
        }

        // Validate menu ID
        const id = parseInt(menuId);
        if (isNaN(id)) {
            console.error(`Error: Invalid menu ID: ${menuId}`);
            process.exit(1);
        }

        // Get menu info from tree first
        try {
            const menuTree = await client.getMenuTree();

            const findMenu = (items, targetId, parent = null) => {
                for (const item of items) {
                    if (item.id === targetId) {
                        return { menu: item, parent };
                    }
                    if (item.children && item.children.length > 0) {
                        const result = findMenu(item.children, targetId, item);
                        if (result) return result;
                    }
                }
                return null;
            };

            const result = findMenu(menuTree, id);
            if (!result) {
                console.error(`Error: Menu [${id}] not found`);
                process.exit(1);
            }

            const menuName = result.menu.name || 'Unknown';

            // Show what will be deleted
            console.log(`Will delete menu: [${id}] ${menuName}`);

            // Check for children if not recursive
            if (!cmdOptions.options.recursive && result.menu.children && result.menu.children.length > 0) {
                console.log(`Warning: This menu has ${result.menu.children.length} child(ren).`);
                console.log('Use -r or --recursive to delete with submenus.');
                process.exit(1);
            }

            // Confirm deletion
            if (!cmdOptions.options.force) {
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const answer = await new Promise(resolve => {
                    rl.question(`Delete menu [${id}]? (y/N): `, resolve);
                });
                rl.close();

                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    console.log('Cancelled');
                    process.exit(0);
                }
            }

            // Perform deletion
            const deleteResult = await client.deleteMenu(id);
            console.log(`✓ Menu [${id}] deleted successfully`);

        } catch (error) {
            if (error.statusCode === 404) {
                console.error(`Error: Menu [${id}] not found`);
            } else if (error.statusCode === 403) {
                console.error(`Error: Permission denied`);
            } else {
                console.error(`Error: ${error.message}`);
            }
            process.exit(1);
        }
    } else if (options.command === 'move') {
        const moveSpec = {
            flags: [
                { names: ['-p', '--parent'], key: 'parent', hasValue: true },
                { names: ['-f', '--force'], key: 'force', hasValue: false },
                { names: ['--skip-verify'], key: 'skipVerify', hasValue: false }
            ]
        };
        const cmdOptions = parseCommandArgs(commandArgs, moveSpec);

        // Get menu IDs from positional args
        const menuIds = cmdOptions.positional
            .map(arg => parseInt(arg))
            .filter(id => !isNaN(id));

        if (menuIds.length === 0) {
            console.error('Error: At least one menu ID is required');
            console.error('Usage: menu-cli move <id> [<id>...] --parent <pid>|null');
            process.exit(1);
        }

        // Parse parent ID (null means top level)
        let newParentId = cmdOptions.options.parent;
        if (newParentId === 'null' || newParentId === 'NULL' || newParentId === '0') {
            newParentId = null;
        } else if (newParentId !== undefined && newParentId !== null) {
            newParentId = parseInt(newParentId);
            if (isNaN(newParentId)) {
                console.error(`Error: Invalid parent ID: ${cmdOptions.options.parent}`);
                process.exit(1);
            }
        } else if (newParentId === undefined) {
            console.error('Error: --parent option is required');
            console.error('Usage: menu-cli move <id> [<id>...] --parent <pid>|null');
            process.exit(1);
        }

        // Get menu info from tree for display
        try {
            const menuTree = await client.getMenuTree();

            const findMenu = (items, targetId) => {
                for (const item of items) {
                    if (item.id === targetId) {
                        return item;
                    }
                    if (item.children && item.children.length > 0) {
                        const result = findMenu(item.children, targetId);
                        if (result) return result;
                    }
                }
                return null;
            };

            const menusToMove = menuIds.map(id => findMenu(menuTree, id)).filter(m => m !== null);
            const notFound = menuIds.filter(id => findMenu(menuTree, id) === null);

            if (notFound.length > 0) {
                if (cmdOptions.options.skipVerify) {
                    console.warn(`Warning: Could not verify menu(s) ${notFound.join(', ')} (may be filtered by appId)`);
                    console.warn(`Proceeding anyway due to --skip-verify flag`);
                } else {
                    console.error(`Error: Menu(s) not found: ${notFound.join(', ')}`);
                    console.error(`Hint: Use --skip-verify to move menus that are not visible in current app context`);
                    process.exit(1);
                }
            }

            const parentDesc = newParentId === null ? 'top level' : `parent [${newParentId}]`;
            console.log(`Will move ${menuIds.length} menu(s) to ${parentDesc}:`);
            if (menusToMove.length > 0) {
                menusToMove.forEach(m => {
                    const currentParent = m.pid === null ? 'top level' : `parent [${m.pid}]`;
                    console.log(`  [${m.id}] ${m.name} (currently: ${currentParent})`);
                });
            }
            if (notFound.length > 0) {
                notFound.forEach(id => {
                    console.log(`  [${id}] (unknown - will move anyway)`);
                });
            }

            // Confirm move
            if (!cmdOptions.options.force) {
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const answer = await new Promise(resolve => {
                    rl.question(`Proceed with move? (y/N): `, resolve);
                });
                rl.close();

                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    console.log('Cancelled');
                    process.exit(0);
                }
            }

            // Perform move
            const results = await client.batchMoveMenus(menuIds, newParentId);

            // Show results
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            if (failCount > 0) {
                console.log(`\nMoved ${successCount} menu(s), ${failCount} failed:`);
                results.forEach(r => {
                    if (r.success) {
                        console.log(`  ✓ [${r.menuId}] moved`);
                    } else {
                        console.log(`  ✗ [${r.menuId}] failed: ${r.error}`);
                    }
                });
                process.exit(1);
            } else {
                console.log(`✓ Successfully moved ${successCount} menu(s) to ${parentDesc}`);
            }

        } catch (error) {
            if (error.statusCode === 404) {
                console.error(`Error: Menu not found`);
            } else if (error.statusCode === 403) {
                console.error(`Error: Permission denied`);
            } else {
                console.error(`Error: ${error.message}`);
            }
            process.exit(1);
        }
    } else if (options.command === 'promote') {
        const promoteSpec = {
            flags: [
                { names: ['-f', '--force'], key: 'force', hasValue: false }
            ]
        };
        const cmdOptions = parseCommandArgs(commandArgs, promoteSpec);

        // Get menu IDs from positional args
        const menuIds = cmdOptions.positional
            .map(arg => parseInt(arg))
            .filter(id => !isNaN(id));

        if (menuIds.length === 0) {
            console.error('Error: At least one menu ID is required');
            console.error('Usage: menu-cli promote <id> [<id>...]');
            process.exit(1);
        }

        // Get menu info from tree for display
        try {
            const menuTree = await client.getMenuTree();

            const findMenu = (items, targetId) => {
                for (const item of items) {
                    if (item.id === targetId) {
                        return item;
                    }
                    if (item.children && item.children.length > 0) {
                        const result = findMenu(item.children, targetId);
                        if (result) return result;
                    }
                }
                return null;
            };

            const menusToPromote = menuIds.map(id => findMenu(menuTree, id)).filter(m => m !== null);
            const notFound = menuIds.filter(id => findMenu(menuTree, id) === null);

            console.log(`Will promote ${menuIds.length} menu(s) to top level (menu_type='C', pid=null):`);
            if (menusToPromote.length > 0) {
                menusToPromote.forEach(m => {
                    const currentParent = m.pid === null ? 'top level' : `parent [${m.pid}]`;
                    console.log(`  [${m.id}] ${m.name} (currently: ${currentParent}, type: ${m.menuType || 'N/A'})`);
                });
            }
            if (notFound.length > 0) {
                notFound.forEach(id => {
                    console.log(`  [${id}] (unknown - will promote anyway)`);
                });
            }

            // Confirm promote
            if (!cmdOptions.options.force) {
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const answer = await new Promise(resolve => {
                    rl.question(`Proceed with promote? (y/N): `, resolve);
                });
                rl.close();

                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    console.log('Cancelled');
                    process.exit(0);
                }
            }

            // Perform promote
            const results = [];
            for (const menuId of menuIds) {
                try {
                    const result = await client.promoteMenuToTop(menuId);
                    results.push({ menuId, success: true, result });
                } catch (error) {
                    results.push({ menuId, success: false, error: error.message });
                }
            }

            // Show results
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            if (failCount > 0) {
                console.log(`\nPromoted ${successCount} menu(s), ${failCount} failed:`);
                results.forEach(r => {
                    if (r.success) {
                        console.log(`  ✓ [${r.menuId}] promoted`);
                    } else {
                        console.log(`  ✗ [${r.menuId}] failed: ${r.error}`);
                    }
                });
                process.exit(1);
            } else {
                console.log(`✓ Successfully promoted ${successCount} menu(s) to top level`);
            }

        } catch (error) {
            if (error.statusCode === 404) {
                console.error(`Error: Menu not found`);
            } else if (error.statusCode === 403) {
                console.error(`Error: Permission denied`);
            } else {
                console.error(`Error: ${error.message}`);
            }
            process.exit(1);
        }
    }
}

// Run main function
main().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
