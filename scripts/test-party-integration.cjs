#!/usr/bin/env node
/**
 * Party Backend Integration Tests
 *
 * Tests the signaling and room APIs on the VPS.
 * Run with: node scripts/test-party-integration.cjs
 */

const https = require('https');

const BASE_URL = 'https://saberloop.com/party/endpoints';

// Helper to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    // Construct full path manually (URL constructor drops base path with absolute paths)
    const fullPath = '/party/endpoints' + path;
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      method,
      hostname: 'saberloop.com',
      path: fullPath,
      headers: {
        'Content-Type': 'application/json',
        ...(bodyStr && { 'Content-Length': Buffer.byteLength(bodyStr) }),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

// Test results tracking
let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${details ? ` - ${details}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🧪 Party Backend Integration Tests\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const testRoomCode = 'TEST' + Math.random().toString(36).substring(2, 4).toUpperCase();
  const hostId = 'host-' + Date.now();
  const guestId = 'guest-' + Date.now();

  // ═══════════════════════════════════════════════════════════════
  // SIGNALING TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('📡 Signaling API Tests\n');

  // Test 1: Poll empty messages
  try {
    const res = await request('GET', `/signal.php/${testRoomCode}/${hostId}`);
    test('Poll returns empty messages', res.data?.success && res.data?.data?.messages?.length === 0);
  } catch (e) {
    test('Poll returns empty messages', false, e.message);
  }

  // Test 2: Send signaling message
  let messageId;
  try {
    const res = await request('POST', '/signal.php', {
      roomCode: testRoomCode,
      fromId: hostId,
      toId: guestId,
      type: 'offer',
      payload: { sdp: 'test-sdp', type: 'offer' },
    });
    messageId = res.data?.data?.messageId;
    test('Send signaling message', res.data?.success && messageId > 0);
  } catch (e) {
    test('Send signaling message', false, e.message);
  }

  // Test 3: Receive signaling message
  try {
    const res = await request('GET', `/signal.php/${testRoomCode}/${guestId}`);
    const messages = res.data?.data?.messages || [];
    const hasOffer = messages.some((m) => m.type === 'offer' && m.fromId === hostId);
    test('Receive signaling message', hasOffer);
  } catch (e) {
    test('Receive signaling message', false, e.message);
  }

  // Test 4: Send ICE candidate
  try {
    const res = await request('POST', '/signal.php', {
      roomCode: testRoomCode,
      fromId: hostId,
      toId: guestId,
      type: 'ice',
      payload: { candidate: 'candidate:123', sdpMid: '0', sdpMLineIndex: 0 },
    });
    test('Send ICE candidate', res.data?.success);
  } catch (e) {
    test('Send ICE candidate', false, e.message);
  }

  // ═══════════════════════════════════════════════════════════════
  // ROOM API TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🏠 Room API Tests\n');

  let roomCode;

  // Test 5: Create room
  try {
    const res = await request('POST', '/rooms.php', {
      hostId,
      hostName: 'Integration Test Host',
    });
    roomCode = res.data?.data?.code;
    test('Create room', res.data?.success && roomCode?.length === 6, `code=${roomCode}`);
  } catch (e) {
    test('Create room', false, e.message);
  }

  // Test 6: Get room info
  if (roomCode) {
    try {
      const res = await request('GET', `/rooms.php/${roomCode}`);
      test('Get room info', res.data?.success && res.data?.data?.code === roomCode);
    } catch (e) {
      test('Get room info', false, e.message);
    }
  }

  // Test 7: Join room
  if (roomCode) {
    try {
      const res = await request('POST', `/rooms.php/${roomCode}/join`, {
        participantId: guestId,
        name: 'Integration Test Guest',
      });
      const participants = res.data?.data?.participants || [];
      // API returns 'id' not 'participantId'
      const hasGuest = participants.some((p) => p.id === guestId);
      test('Join room', res.data?.success && hasGuest);
    } catch (e) {
      test('Join room', false, e.message);
    }
  }

  // Test 8: Get peers
  if (roomCode) {
    try {
      const res = await request('GET', `/signal.php/${roomCode}/${guestId}/peers`);
      const peers = res.data?.data?.peers || [];
      const hasHost = peers.includes(hostId);
      test('Get peers', res.data?.success && hasHost);
    } catch (e) {
      test('Get peers', false, e.message);
    }
  }

  // Test 9: Leave room
  if (roomCode) {
    try {
      const res = await request('POST', `/rooms.php/${roomCode}/leave`, {
        participantId: guestId,
      });
      test('Leave room', res.data?.success);
    } catch (e) {
      test('Leave room', false, e.message);
    }
  }

  // Test 10: End room (cleanup)
  if (roomCode) {
    try {
      // DELETE requires hostId in body, not query string
      const res = await request('DELETE', `/rooms.php/${roomCode}`, { hostId });
      test('End room', res.data?.success);
    } catch (e) {
      test('End room', false, e.message);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('❌ Test runner failed:', e.message);
  process.exit(1);
});
