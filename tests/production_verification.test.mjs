import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

test('Production Verification Test Suite for Daberna Land VIP', async (t) => {

  let normalUserToken = '';
  let adminToken = '';

  await t.test('1. Normal User Registration & Free Starter Chips', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `test_player_${Date.now()}`,
        fullname: 'تست کننده پلتفرم',
        phone: '09121112233',
        password: 'PlayerPassword@123'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.ok(data.user.balance >= 350000, 'User should receive free starter chips');
    assert.equal(data.user.isAdmin, false);
    normalUserToken = data.token;
  });

  await t.test('2. Admin Authentication with Correct Credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'AdminSecurePassword@90'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.isAdmin, true);
    assert.ok(data.token);
    adminToken = data.token;
  });

  await t.test('3. RBAC Gate: Unauthenticated User Cannot Access Admin Overview (401)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/overview`);
    assert.equal(res.status, 401);
  });

  await t.test('4. RBAC Gate: Normal Player Cannot Access Admin Overview (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${normalUserToken}` }
    });
    assert.equal(res.status, 403);
  });

  await t.test('5. Admin Successfully Accesses Overview, Audit Logs & Settings', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.users));
    assert.ok(Array.isArray(data.rooms));
    assert.ok(Array.isArray(data.auditLogs));
    assert.ok(data.settings);
  });

  await t.test('6. Complete Financial Route Removal Verification (All return 404)', async () => {
    // Verify crypto deposit is removed
    const cryptoRes = await fetch(`${BASE_URL}/api/wallet/crypto-deposit`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${normalUserToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usdtAmount: '100' })
    });
    assert.equal(cryptoRes.status, 404, 'crypto-deposit route must return 404');

    // Verify voucher deposit is removed
    const voucherRes = await fetch(`${BASE_URL}/api/wallet/voucher-deposit`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${normalUserToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ voucherCode: 'TEST' })
    });
    assert.equal(voucherRes.status, 404, 'voucher-deposit route must return 404');

    // Verify card deposit is removed
    const cardRes = await fetch(`${BASE_URL}/api/wallet/card-deposit`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${normalUserToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: '500000' })
    });
    assert.equal(cardRes.status, 404, 'card-deposit route must return 404');

    // Verify crypto withdraw is removed
    const withdrawRes = await fetch(`${BASE_URL}/api/wallet/crypto-withdraw`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${normalUserToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usdtAmount: '50' })
    });
    assert.equal(withdrawRes.status, 404, 'crypto-withdraw route must return 404');
  });

  await t.test('7. Free Daily Rewards & Faucet API Verification', async () => {
    const statusRes = await fetch(`${BASE_URL}/api/rewards/daily-status`, {
      headers: { 'Authorization': `Bearer ${normalUserToken}` }
    });
    assert.equal(statusRes.status, 200);
    const statusData = await statusRes.json();
    assert.ok(typeof statusData.canClaim === 'boolean');
    assert.ok(statusData.rewardAmount > 0);

    const claimRes = await fetch(`${BASE_URL}/api/rewards/claim-daily`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${normalUserToken}` }
    });
    assert.equal(claimRes.status, 200);
    const claimData = await claimRes.json();
    assert.equal(claimData.success, true);
    assert.ok(claimData.rewardAmount > 0);
  });

  await t.test('8. Privacy Guard: Public Leaderboard Never Leaks Private Data', async () => {
    const res = await fetch(`${BASE_URL}/api/leaderboard`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.leaderboard));

    const stringified = JSON.stringify(data);
    assert.equal(stringified.includes('passwordHash'), false);
    assert.equal(stringified.includes('salt'), false);
    assert.equal(stringified.includes('0912'), false);
    assert.equal(stringified.includes('@vip.com'), false);
  });

});
