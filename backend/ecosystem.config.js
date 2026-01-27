module.exports = {
  apps: [{
    name: "cs2-backend",
    script: "./server.js",
    instances: 1, // <--- ИСПРАВЛЕНИЕ 1: 1 экземпляр для 1 vCPU
    exec_mode: "fork", // <--- ИСПРАВЛЕНИЕ 2: Режим форка, так как кластер не нужен
    env: {
      NODE_ENV: "development",
      // Можно оставить 400M для dev, чтобы быстро ловить утечки
      max_memory_restart: '400M'
    },
    env_production: {
      NODE_ENV: "production", // <--- ИСПРАВЛЕНИЕ 3: Явно указываем production
      max_memory_restart: '750M' // <--- ИСПРАВЛЕНИЕ 4: Лимит памяти в продакшене
    }
  }]
}