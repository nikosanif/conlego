var migrateConfig = {
  migrationsDir: 'src/database/migrations',
  dbConnectionUri: `mongodb://`
    + `${process.env.DB_ROOT_USERNAME}:${process.env.DB_ROOT_PASSWORD}`
    + `@${process.env.DB_HOST}:${process.env.DB_PORT}`
    + `/${process.env.DB_NAME}`
    + `?authSource=admin`
};

module.exports = migrateConfig;
