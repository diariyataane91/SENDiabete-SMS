module.exports = {
  apps: [
    {
      name: "medisuivi-app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};