module.exports = {
  // Applications log level (error|warn|info|debug|silly)
  logLevel: parseLogLevel(process.env.LOG_LEVEL) || 'debug',

  // Syslog host and port, if any
  // Example: `localhost:5499`
  syslog: process.env.SYSLOG || null,
  
  // Name of syslog
  syslogName: process.env.SYSLOG_NAME || 'fruster noname',
  
  // Syslog program name
  syslogProgram: process.env.SYSLOG_PROGRAM || process.env.DEIS_APP || 'default'
};

function parseLogLevel(str) {
  if(str) {
    str = str.toLowerCase();
  }
  // align log level naming so `trace` becomes `silly
  return str == 'trace' ? 'silly' : str;
}