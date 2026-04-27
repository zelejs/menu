#!/usr/bin/env node
/**
 * Menu API Test Script
 *
 * 测试菜单创建、查询和删除的完整流程
 * 1. 创建新菜单
 * 2. 通过 /api/adm/menu/app/group 查询验证
 * 3. 清理新建的菜单
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

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Load config from file
 */
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        // Ignore config errors
    }
    return {};
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
            log(`[DEBUG] ${reqOptions.method} ${options.url}`, 'cyan');
            if (options.body) {
                log(`[DEBUG] Body: ${options.body}`, 'cyan');
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
 * Menu API Test Client
 */
class MenuAPITestClient {
    constructor(options = {}) {
        const config = loadConfig();

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

        // Build headers for this request
        const headers = { ...this.headers };

        // Remove Content-Type for GET requests (no body)
        if (method === 'GET' || method === 'HEAD') {
            delete headers['Content-Type'];
        }

        try {
            return await httpRequest({
                url: fullUrl,
                method: method,
                headers: headers,
                timeout: this.timeout,
                verbose: this.verbose,
                body: options.body
            });
        } catch (error) {
            if (error.message.includes('timeout')) {
                log(`Error: Request timeout (${this.timeout / 1000}s)`, 'red');
                log('Hint: Use --timeout option to increase timeout', 'yellow');
            } else if (error.message.includes('Cannot connect')) {
                log(`Error: ${error.message}`, 'red');
                log(`URL: ${url}`, 'yellow');
                log('Hint: Check if URL is correct and server is running', 'yellow');
            } else if (error.statusCode) {
                log(`Error: HTTP ${error.statusCode}`, 'red');
                if (error.responseJson) {
                    log(`Details: ${JSON.stringify(error.responseJson)}`, 'yellow');
                } else {
                    log(`Details: ${error.response}`, 'yellow');
                }
            } else {
                log(`Request failed: ${error.message}`, 'red');
            }
            throw error;
        }
    }

    /**
     * Create a new menu
     */
    async createMenu(menuData) {
        log('\n=== Step 1: Creating new menu ===', 'blue');
        log(`Menu name: ${menuData.name}`, 'cyan');
        log(`Menu path: ${menuData.path}`, 'cyan');

        const response = await this._request('POST', '/menus', {
            body: JSON.stringify(menuData)
        });

        if (response && response.code === 200) {
            log(`✓ Menu created successfully`, 'green');

            // Query to get the new menu ID by path
            log(`Querying to get the new menu ID...`, 'cyan');
            const menuList = await this._request('GET', '/menus', {
                params: {
                    pageSize: 100,
                    path: menuData.path
                }
            });

            if (menuList && menuList.data && menuList.data.records) {
                const newMenu = menuList.data.records.find(m => m.path === menuData.path);
                if (newMenu) {
                    log(`✓ Found new menu with ID: ${newMenu.id}`, 'green');
                    return newMenu.id;
                }
            }

            throw new Error('Created menu but could not find it in the list');
        } else {
            throw new Error('Failed to create menu: ' + JSON.stringify(response));
        }
    }

    /**
     * Get menu group (tree structure)
     */
    async getMenuGroup(search = null) {
        log('\n=== Step 2: Querying menu group ===', 'blue');
        log('Endpoint: GET /api/adm/menu/app/group', 'cyan');

        const response = await this._request('GET', '/app/group', {
            params: search ? { search } : undefined
        });

        if (response && response.data) {
            log(`✓ Menu group query successful`, 'green');
            log(`Total items in response: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`, 'cyan');
            return response.data;
        } else {
            throw new Error('Failed to get menu group: ' + JSON.stringify(response));
        }
    }

    /**
     * Check if menu exists in the group tree
     */
    findMenuInTree(menuId, tree, path = '') {
        for (const item of tree) {
            const currentPath = path ? `${path} > ${item.name || item.id}` : (item.name || String(item.id));

            if (item.id == menuId) {
                return { found: true, path: currentPath, item };
            }

            if (item.children && item.children.length > 0) {
                const result = this.findMenuInTree(menuId, item.children, currentPath);
                if (result.found) {
                    return result;
                }
            }
        }
        return { found: false, path: null };
    }

    /**
     * Delete a menu
     */
    async deleteMenu(menuId) {
        log('\n=== Step 4: Cleaning up - Deleting menu ===', 'blue');
        log(`Menu ID: ${menuId}`, 'cyan');

        const response = await this._request('DELETE', `/menus/${menuId}`);

        if (response && response.code === 200) {
            const affected = response.data !== undefined ? response.data : 'success';
            log(`✓ Menu deleted successfully`, 'green');
            log(`Affected rows: ${affected}`, 'cyan');
            return true;
        } else if (response && response.code === 400) {
            // Menu might have already been deleted or doesn't exist
            log(`⚠ Menu not found (may have been already deleted)`, 'yellow');
            return true;
        } else {
            log(`Warning: Delete response unexpected: ${JSON.stringify(response)}`, 'yellow');
            return false;
        }
    }

    /**
     * Run complete test flow
     */
    async runTest(menuData) {
        const startTime = Date.now();
        let createdMenuId = null;
        let testPassed = false;

        try {
            // Step 1: Create menu
            createdMenuId = await this.createMenu(menuData);

            // Step 2: Query menu group
            const menuGroup = await this.getMenuGroup();

            // Step 3: Verify menu exists in the tree
            log('\n=== Step 3: Verifying menu in tree structure ===', 'blue');
            const searchResult = this.findMenuInTree(createdMenuId, menuGroup);

            if (searchResult.found) {
                log(`✓ Menu found in tree structure!`, 'green');
                log(`Path: ${searchResult.path}`, 'cyan');
                log(`Menu details:`, 'cyan');
                log(`  - ID: ${searchResult.item.id}`, 'cyan');
                log(`  - Name: ${searchResult.item.name}`, 'cyan');
                log(`  - Type: ${searchResult.item.menuType || 'N/A'}`, 'cyan');
                testPassed = true;
            } else {
                log(`✗ Menu NOT found in tree structure!`, 'red');
                log(`Expected to find menu ID: ${createdMenuId}`, 'yellow');
            }

        } catch (error) {
            log(`\n✗ Test failed with error: ${error.message}`, 'red');
        } finally {
            // Step 4: Clean up - always try to delete
            if (createdMenuId) {
                try {
                    await this.deleteMenu(createdMenuId);
                } catch (error) {
                    log(`\n⚠ Warning: Failed to delete test menu (ID: ${createdMenuId})`, 'yellow');
                    log(`You may need to manually delete it`, 'yellow');
                    log(`Error: ${error.message}`, 'red');
                }
            }

            // Summary
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            log('\n=== Test Summary ===', 'blue');
            log(`Duration: ${duration}s`, 'cyan');
            log(`Status: ${testPassed ? 'PASSED ✓' : 'FAILED ✗'}`, testPassed ? 'green' : 'red');

            return testPassed;
        }
    }
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);

    // Parse command line arguments
    const options = {
        baseUrl: null,
        token: null,
        timeout: null,
        verbose: false,
        menuName: null,
        menuPath: null
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
            case '-v':
            case '--verbose':
                options.verbose = true;
                break;
            case '--name':
                options.menuName = args[++i];
                break;
            case '--path':
                options.menuPath = args[++i];
                break;
            case '--help':
                console.log(`
Menu API Test Script

Usage: node test_menu_api.js [options]

Options:
  --url <URL>           API base URL (default: from config or env)
  --token <TOKEN>       Authorization token
  --timeout <SECONDS>   Request timeout (default: 30s)
  --name <NAME>         Test menu name (default: "Test Menu [timestamp]")
  --path <PATH>         Test menu path (default: "/test-menu-[timestamp]")
  -v, --verbose         Show verbose output
  --help                Show this help message

Environment:
  MENU_BASE_URL         API base URL
  MENU_TOKEN            Authorization token

Examples:
  node test_menu_api.js
  node test_menu_api.js --url http://localhost:8080/api/adm/menu
  node test_menu_api.js --name "My Test Menu" --path "/my-test"
                `);
                process.exit(0);
        }
    }

    try {
        const client = new MenuAPITestClient(options);

        // Generate unique test menu data
        const timestamp = Date.now();
        const menuData = {
            name: options.menuName || `Test Menu ${timestamp}`,
            path: options.menuPath || `/test-menu-${timestamp}`,
            menuType: 'M',
            visible: '0',
            status: '0',
            orderNum: 999,
            // Add to an existing parent menu (e.g., "系统管理" with ID 81)
            // This ensures the menu will appear in the tree structure
            pid: 81
        };

        log('╔══════════════════════════════════════════════════════════════╗', 'blue');
        log('║           Menu API Integration Test                          ║', 'blue');
        log('╚══════════════════════════════════════════════════════════════╝', 'blue');
        log(`API URL: ${client.baseUrl}`, 'cyan');
        log(`Test menu: ${menuData.name}`, 'cyan');
        log(`Test path: ${menuData.path}`, 'cyan');

        const passed = await client.runTest(menuData);
        process.exit(passed ? 0 : 1);

    } catch (error) {
        log(`\nFatal error: ${error.message}`, 'red');
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { MenuAPITestClient };
