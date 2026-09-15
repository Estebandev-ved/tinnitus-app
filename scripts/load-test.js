// k6 Load Test for TinnitOff Backend
// Usage: k6 run scripts/load-test.js
//
// Stages:
//   1. Ramp up to 50 users over 30s
//   2. Stay at 50 users for 1 minute
//   3. Ramp up to 100 users over 30s
//   4. Stay at 100 users for 1 minute
//   5. Ramp down to 0 over 30s

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiDuration = new Trend('api_duration');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.1'],
  },
};

function login() {
  const res = http.post(`${BASE_URL}/api/v1/auth/login`,
    'username=admin&password=admin123',
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  loginDuration.add(res.timings.duration);
  check(res, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => JSON.parse(r.body).token !== undefined,
  });
  if (res.status !== 200) {
    errorRate.add(1);
    return null;
  }
  errorRate.add(0);
  return JSON.parse(res.body).token;
}

function getStats(token) {
  const res = http.get(`${BASE_URL}/api/v1/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  apiDuration.add(res.timings.duration);
  check(res, { 'stats status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200 ? 1 : 0);
}

function getUsers(token) {
  const res = http.get(`${BASE_URL}/api/v1/admin/users?page=0&size=10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  apiDuration.add(res.timings.duration);
  check(res, { 'users status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200 ? 1 : 0);
}

function getAlerts(token) {
  const res = http.get(`${BASE_URL}/api/v1/admin/alerts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  apiDuration.add(res.timings.duration);
  check(res, { 'alerts status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200 ? 1 : 0);
}

function getHealth() {
  const res = http.get(`${BASE_URL}/actuator/health`);
  check(res, { 'health status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200 ? 1 : 0);
}

export default function () {
  // Health check (no auth)
  getHealth();

  // Login
  const token = login();
  if (!token) {
    sleep(1);
    return;
  }

  // API calls with auth
  getStats(token);
  sleep(0.5);
  getUsers(token);
  sleep(0.5);
  getAlerts(token);
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n=== Load Test Results ===');
  console.log(`Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Avg Duration: ${data.metrics.http_req_duration.values.avg.toFixed(0)}ms`);
  console.log(`p95 Duration: ${data.metrics.http_req_duration.values['p(95)'].toFixed(0)}ms`);
  console.log(`Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%`);
  console.log(`Login p95: ${data.metrics.login_duration.values['p(95)']?.toFixed(0) || 'N/A'}ms`);
  console.log(`API p95: ${data.metrics.api_duration.values['p(95)']?.toFixed(0) || 'N/A'}ms`);
  return {};
}
