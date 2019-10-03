export const config = {

  // application environment mode
  environment: process.env.ENVIRONMENT,

  // host domain options
  protocol: process.env.PROTOCOL || 'http',
  host: process.env.HOST || 'localhost',
  exposedPort: process.env.EXPOSED_PORT || 80,
  port: 80,

  // MongoDB connection options
  mongo: {
    uri: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/?authSource=admin`,
    options: {
      dbName: process.env.DB_NAME,
      user: process.env.DB_ROOT_USERNAME,
      pass: process.env.DB_ROOT_PASSWORD,
    }
  },

  // oauth2 options
  oauth2: {
    // application secrets
    // https://randomkeygen.com/
    secrets: {
      accessToken: 'M7mdE39cEeHFw8bQBPPDndcpfwBLOD91',
      refreshToken: 'JztZQ3VOtmkWn69CG8r8WqDkezb3tyda'
    },
    // supported clients
    defaultClients: [
      {
        id: 'Avn3NVJfH9',
        secret: 'RDHndORacDbzAaBkpUh1xUphLqwkEdt7',
        redirectUris: ['/'],
        // Available grants options are:
        // Implemented: 'password', 'refresh_token', 'client_credentials'
        // Not implemented: 'authorization_code'
        grants: ['password', 'refresh_token']
      }
    ]
  },

  // sockets options
  sockets: {
    path: '/socket.io-client'
  },

  // redis options
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  }
};


/**
 * Indicates whether process is in production mode
 *
 * @export
 * @returns {boolean}
 */
export function isProd(): boolean {
  return config.environment === 'production';
}

/**
 * Indicates whether process is in development mode
 *
 * @export
 * @returns {boolean}
 */
export function isDev(): boolean {
  return config.environment === 'development';
}

/**
 * Get full host domain
 * e.g. http://localhost:80
 *
 * @export
 * @returns {string}
 */
export function getHostDomain(): string {
  return `${config.protocol}://${config.host}:${config.exposedPort}`;
}
