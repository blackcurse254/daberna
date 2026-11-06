import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

describe('Live API Security Endpoints Verification', () => {

  it('Checkpoint 1 & 2: Unauthenticated user cannot access admin APIs (401)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/overview`);
    assert.strictEqual(res.status, 401, 'Must return 401 Unauthorized without token');
    const json = await res.json();
    assert.ok(json.error);
  });

  it('Checkpoint 2 & 3: Normal user token CANNOT access admin APIs (403 Forbidden)', async () => {
    // 1. Login as normal user
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'shah_normal_test_user' })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.token);
    assert.strictEqual(loginData.user.isAdmin, false);

    // 2. Attempt to call admin overview with normal user token
    const adminRes = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    assert.strictEqual(adminRes.status, 403, 'Normal user must be forbidden (403) from admin endpoints');
    const adminJson = await adminRes.json();
    assert.strictEqual(adminJson.error.includes('دسترسی غیرمجاز'), true);
  });

  it('Checkpoint 1 & 5: Public endpoints do not leak private emails, phone numbers, or passwords', async () => {
    const res = await fetch(`${BASE_URL}/api/leaderboard`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.leaderboard));

    // Inspect every entry in leaderboard
    for (const item of data.leaderboard) {
      assert.strictEqual('password' in item, false, 'No password field');
      assert.strictEqual('passwordHash' in item, false, 'No passwordHash field');
      assert.strictEqual('salt' in item, false, 'No salt field');
      assert.strictEqual('email' in item, false, 'No private email field');
      assert.strictEqual('phone' in item, false, 'No private phone field');
      assert.ok('rank' in item);
      assert.ok('name' in item);
      assert.ok('wins' in item);
      assert.ok('totalWon' in item);
    }
  });

  it('Checkpoint 6: Normal user can only see their own transactions, not other users', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user_privacy_check_1' })
    });
    const loginData = await loginRes.json();

    const txRes = await fetch(`${BASE_URL}/api/user/transactions`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    assert.strictEqual(txRes.status, 200);
    const txData = await txRes.json();
    // Should have zero transactions or only for this user
    for (const t of txData.transactions) {
      assert.strictEqual(t.username, 'user_privacy_check_1');
    }
  });

  it('Checkpoint 7: Admin authentication with correct credentials grants access to overview and logs', async () => {
    const adminLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'AdminSecurePassword@90' })
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminData = await adminLogin.json();
    assert.strictEqual(adminData.user.isAdmin, true);
    assert.ok(adminData.token);

    const overviewRes = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${adminData.token}` }
    });
    assert.strictEqual(overviewRes.status, 200);
    const overviewData = await overviewRes.json();
    assert.ok('totalUsers' in overviewData);
    assert.ok('auditLogs' in overviewData);
  });

});
