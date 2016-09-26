const log = require('../index');

describe('Fruster log', () => {
  
  it('should log a json object', () => {   
    log.info('A JSON object', { 
      foo: 1, 
      bar: { 
        a: 1, 
        b: 2
      } 
    }, 'yeah!');
  });

});