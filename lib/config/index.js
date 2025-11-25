const path = require('path');
const nconf = require('nconf');
const env = process.env.NODE_ENV || 'development' // By default development environment is picked 

//  1. `process.argv`
//  2. `process.env`
nconf.argv().env()

// 3. Pick up the base configuration
nconf.file(path.join(__dirname, './base_config.json'))

// 4. Override arguments based on environment
nconf.file(path.join(__dirname, `./${env}_env_config.json`))

// 5. Update API Url
const apiUrl = nconf.get('express').protocol + (nconf.get('express').useFqdnForApis ? nconf.get('express').fqdn : nconf.get('express').ipAddress) + ':' + nconf.get('express').port + '/'
nconf.set('express:apiUrl', apiUrl)

module.exports = nconf
