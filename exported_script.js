import { sleep, check, group } from 'k6'
import http from 'k6/http'

export const options = {
  ext: {
    loadimpact: {
      distribution: { 'amazon:sg:singapore': { loadZone: 'amazon:sg:singapore', percent: 100 } },
      apm: [],
    },
  },
  thresholds: {
    // 95% of requests for add students must finish within 500 ms & 99% within 1500 ms
    'http_req_duration{url:https://studentregistry.cappricornia.repl.co/add-student}': [
      { threshold: 'p(95)<500', abortOnFail: true },
      { threshold: 'p(99)<1500', abortOnFail: true },
    ],
  },
  scenarios: {
    Students_System: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [{ target: 20, duration: '1m' }],
      gracefulRampDown: '30s',
      exec: 'students_System',
    },
  },
}

  
export default function students_System() {
  let response

  // HOME PAGE
  response = http.get('https://studentregistry.cappricornia.repl.co/')
  check(response, { 'status equals 200': response => response.status.toString() === '200' })
  sleep(2)

  group('VIEW STUDENTS', function () {
    // GET VIEW STUDENTS
    response = http.get('https://studentregistry.cappricornia.repl.co/students')
    check(response, { 'status equals 200': response => response.status.toString() === '200' })
  })

  sleep(2)
  group('ADD STUDENTS', function () {
    // GET ADD STUDENTS
    response = http.get('https://studentregistry.cappricornia.repl.co/add-student')
    check(response, { 'status equals 200': response => response.status.toString() === '200' })
  })

  // POST STUDENT
  response = http.post(
    'https://studentregistry.cappricornia.repl.co/add-student',
    'name=Alex+Goodman%2CClaire+McMillan&email=goodman.a%40gbb.com%2Cmcmillan.c%40gmail.com',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )
}
