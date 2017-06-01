const log = require('../index');

describe('Fruster log', () => {

  it('should info log a json object', () => {
    log.info('Info: A JSON object', {
      foo: 1,
      bar: {
        a: 1,
        b: 2
      }
    }, 'yeah!');
  });

  it('should debug log a json object', () => {
    log.debug('Debug: A JSON object', {
      foo: 1,
      bar: {
        a: 1,
        b: 2
      }
    }, 'yeah!');
  });

  it('should error log a json object', () => {
    log.error('Error: A JSON object', {
      foo: 1,
      bar: {
        a: 1,
        b: 2
      }
    }, 'yeah!');
  });

});