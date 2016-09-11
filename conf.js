module.exports = {
  // Applications log level (error|warn|info|debug|silly)
  logLevel: parseLogLevel(process.env.LOG_LEVEL) || 'debug',

  // Syslog host and port, if any
  // Example: `localhost:5499`
  syslog: process.env.SYSLOG || null,
  
  // Name of syslog
  syslogName: process.env.SYSLOG_NAME || 'fruster noname',
  
  // Syslog program name
  syslogProgram: process.env.SYSLOG_PROGRAM || 'default'
};

function parseLogLevel(str) {
  // align log level naming so `trace` becomes `silly
  return str && str.toLowerCase() === 'trace' ? 'silly' : str;
}