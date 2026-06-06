module.exports = {
  apps: [{
    name: "invoice-guard",
    script: "./dist/src/app/server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
    }
  }]
}
