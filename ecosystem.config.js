module.exports = {
  apps: [{
    name: 'vx-engine',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3008
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3008
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3008
    },
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Memory and performance
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024',
    
    // Restart settings
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    health_check_http_url: 'http://localhost:3008/health',
    health_check_grace_period: 3000,
    
    // Environment specific settings
    kill_timeout: 3000,
    listen_timeout: 3000,
    
    // Process management
    merge_logs: true,
    combine_logs: true,
    
    // Graceful shutdown
    kill_retry_time: 100
  }],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/heyIshwar/vx-engine.git',
      path: '/var/www/vx-engine',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'ubuntu',
      host: 'your-staging-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/heyIshwar/vx-engine.git',
      path: '/var/www/vx-engine-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    }
  }
}; 