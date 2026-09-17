import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp-up to 100 concurrent users
    { duration: '1m',  target: 100 },  // Sustained load at 100 users
    { duration: '30s', target: 1000 }, // Spike to 1,000 concurrent users
    { duration: '1m',  target: 1000 }, // Sustained load at 1,000 users
    { duration: '30s', target: 0 },    // Ramp-down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
    http_req_failed: ['rate<0.01'],    // Error rate must be under 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080/api/v1';

export default function () {
  // 1. Health check endpoint
  const healthRes = http.get(`${BASE_URL}/actuator/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Fetch stock market quotes
  const marketRes = http.get(`${BASE_URL}/market/stocks/quote/AAPL`);
  check(marketRes, {
    'market quote status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
