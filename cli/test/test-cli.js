#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const CLI_PATH = path.resolve(__dirname, '../bin/menu-cli.js');
const ENV_PATH = path.resolve(__dirname, '../.env');

let passed = 0;
let failed = 0;
let serverAvailable = false;

function run(cmd, env = {}) {
  const mergedEnv = { ...process.env, ...env };
  try {
    return {
      code: 0,
      stdout: execSync(cmd, { encoding: 'utf8', env: mergedEnv, stdio: 'pipe' }),
      stderr: ''
    };
  } catch (e) {
    return {
      code: e.status || 1,
      stdout: e.stdout ? e.stdout.toString() : '',
      stderr: e.stderr ? e.stderr.toString() : ''
    };
  }
}

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}: ${e.message}`);
  }
}

function assertContains(text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`Expected output to contain "${expected}", got: ${text.substring(0, 200)}`);
  }
}

function assertEquals(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

function checkServerAvailability(callback) {
  // Read base URL from .env if exists
  let baseUrl = '';
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    const match = envContent.match(/MENU_BASE_URL=(.+)/);
    if (match) baseUrl = match[1].trim();
  }
  if (!baseUrl) {
    baseUrl = process.env.MENU_BASE_URL || 'http://localhost:8080/api/adm/menu';
  }

  const url = new URL(baseUrl + '/app/menus');
  const req = http.get(url, { timeout: 3000 }, (res) => {
    serverAvailable = res.statusCode < 500;
    callback();
  });
  req.on('error', () => {
    serverAvailable = false;
    callback();
  });
  req.on('timeout', () => {
    req.destroy();
    serverAvailable = false;
    callback();
  });
}

// Backup original .env if exists
let originalEnv = null;
if (fs.existsSync(ENV_PATH)) {
  originalEnv = fs.readFileSync(ENV_PATH, 'utf8');
}

console.log('\n=== CLI Structure Tests ===\n');

// Test 1: No .env should fail
if (fs.existsSync(ENV_PATH)) fs.unlinkSync(ENV_PATH);
test('fails when MENU_BASE_URL is missing', () => {
  const result = run(`node ${CLI_PATH} --help`, { MENU_BASE_URL: '' });
  assertEquals(result.code, 1);
  assertContains(result.stdout + result.stderr, 'MENU_BASE_URL is not configured');
});

// Create a test .env for remaining tests
fs.writeFileSync(ENV_PATH, 'MENU_BASE_URL=http://localhost:8080/api/adm/menu\nMENU_TOKEN=\n');

test('shows help with --help', () => {
  const result = run(`node ${CLI_PATH} --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Menu Management CLI Tool');
});

test('shows version with --version', () => {
  const result = run(`node ${CLI_PATH} --version`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, '21.0.0');
});

test('menu list --help works', () => {
  const result = run(`node ${CLI_PATH} menu list --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'List menus');
});

test('menu get --help works', () => {
  const result = run(`node ${CLI_PATH} menu get --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Get menu by ID');
});

test('menu create --help works', () => {
  const result = run(`node ${CLI_PATH} menu create --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Create a new menu');
});

test('menu update --help works', () => {
  const result = run(`node ${CLI_PATH} menu update --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Update an existing menu');
});

test('menu delete --help works', () => {
  const result = run(`node ${CLI_PATH} menu delete --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Delete a menu');
});

test('menu move --help works', () => {
  const result = run(`node ${CLI_PATH} menu move --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Move menu');
});

test('menu promote --help works', () => {
  const result = run(`node ${CLI_PATH} menu promote --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Promote menu');
});

test('app group --help works', () => {
  const result = run(`node ${CLI_PATH} app group --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Get menu group tree');
});

test('app menus --help works', () => {
  const result = run(`node ${CLI_PATH} app menus --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Get all menus');
});

test('app invisible --help works', () => {
  const result = run(`node ${CLI_PATH} app invisible --help`);
  assertEquals(result.code, 0);
  assertContains(result.stdout, 'Set menu invisible status');
});

// Check server availability and run API tests if available
checkServerAvailability(() => {
  if (serverAvailable) {
    console.log('\n=== API Integration Tests ===\n');

    let testMenuId = null;

    // ==================== MENU COMMANDS ====================
    test('menu list returns menus', () => {
      const result = run(`node ${CLI_PATH} menu list`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'Page');
    });

    test('menu get returns menu details', () => {
      const result = run(`node ${CLI_PATH} menu get 1`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'Menu [1]');
    });

    test('menu create creates a menu', () => {
      const result = run(`node ${CLI_PATH} menu create -n "CLI Test Menu" --path "/cli-test-${Date.now()}"`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'Created menu');
      const match = result.stdout.match(/\[(\d+)\]/);
      if (match) testMenuId = parseInt(match[1]);
    });

    test('menu update updates a menu', () => {
      if (!testMenuId) throw new Error('No menu ID from previous test');
      const result = run(`node ${CLI_PATH} menu update ${testMenuId} -n "CLI Updated Menu"`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'Updated menu');
    });

    test('menu move moves a menu', () => {
      if (!testMenuId) throw new Error('No menu ID from previous test');
      const result = run(`node ${CLI_PATH} menu move ${testMenuId} -p null`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'Moved menu');
    });

    test('menu promote promotes a menu', () => {
      if (!testMenuId) throw new Error('No menu ID from previous test');
      const result = run(`node ${CLI_PATH} menu promote ${testMenuId}`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'Promoted menu');
    });

    test('menu delete deletes a menu', () => {
      if (!testMenuId) throw new Error('No menu ID from previous test');
      const result = run(`node ${CLI_PATH} menu delete ${testMenuId}`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'Deleted menu');
    });

    // ==================== APP COMMANDS ====================
    test('app group returns menu group', () => {
      const result = run(`node ${CLI_PATH} app group`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'Menu Group');
    });

    test('app menus returns all menus', () => {
      const result = run(`node ${CLI_PATH} app menus`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'All Menus');
    });

    test('app invisible sets menu invisible', () => {
      const result = run(`node ${CLI_PATH} app invisible 1 -v 1`);
      assertEquals(result.code, 0);
      assertContains(result.stdout, 'invisible=1');
    });

    // JSON output tests
    test('json output works', () => {
      const result = run(`node ${CLI_PATH} -j menu list`);
      assertEquals(result.code, 0);
      try {
        JSON.parse(result.stdout);
      } catch (e) {
        throw new Error('Output is not valid JSON');
      }
    });
  } else {
    console.log('\n=== API Integration Tests ===\n');
    console.log('  ⚠ Server is not available, skipping API integration tests');
  }

  // Restore original .env
  if (originalEnv !== null) {
    fs.writeFileSync(ENV_PATH, originalEnv);
  } else if (fs.existsSync(ENV_PATH)) {
    fs.unlinkSync(ENV_PATH);
  }

  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
});
