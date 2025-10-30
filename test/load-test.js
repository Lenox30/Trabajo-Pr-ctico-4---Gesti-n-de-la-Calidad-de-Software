import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics'; 

// --- Métricas personalizadas para contar las respuestas de cada versión ---
const v1Counter = new Counter('v1_requests');
const v2Counter = new Counter('v2_requests');

// --- Configuración de la prueba de carga ---
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Sube de 0 a 20 usuarios en 30 segundos
    { duration: '1m', target: 20 },  // Mantiene 20 usuarios durante 1 minuto
    { duration: '10s', target: 0 },  // Baja a 0 usuarios en 10 segundos
  ],
  // Umbrales: La prueba fallará si más del 1% de las peticiones dan error.
  thresholds: {
    'http_req_failed': ['rate<0.01'], 
  },
};

// --- El código que ejecuta cada usuario virtual ---
export default function () {
  // --- Configuración para apuntar a tu Ingress en Minikube ---
  const minikubeIP = '192.168.49.2';
  const hostname = 'myapp.local';

  const res = http.get(`http://${minikubeIP}/`, {
    headers: { 'Host': hostname },
  });

  // --- Verificaciones (Checks) ---
  const successfulRequest = check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Si la petición fue exitosa, revisamos el contenido y contamos
  if (successfulRequest) {
    if (res.body.includes('VERSION 2.0')) {
      v2Counter.add(1); // Incrementa el contador de V2
    } else {
      v1Counter.add(1); // Incrementa el contador de V1
    }
  }

  sleep(1); // Espera 1 segundo antes de la siguiente petición
}