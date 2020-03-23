const http = require('http');
const fs = require('fs');

const delayTime = 1000;

handle('./calls');

async function handle(dirName) {
  await fs.readdir(dirName, ((err, items) => {
    items.forEach(async (fileName) => {
      const fileContent = fs.readFileSync(dirName + '/' + fileName);
      
      const paramsList = JSON.parse(fileContent)['params'];
      const method = JSON.parse(fileContent)['method'];
      const host = JSON.parse(fileContent)['host'];
      const path = JSON.parse(fileContent)['path'];

      for (const params of paramsList) {
        const result = await call(host, path, method, params);
        console.log(result);
        await delay();
      }
    });
  }));
}

function call(host, path, method, params) {
  return new Promise(function(resolve, reject) {
    const httpOptions = {
      hostname: host,
      port: '80',
      path,
      method: 'POST',
      headers: {"Content-Type":"application/json; charset=utf-8"}
    };

      var req = http.request(httpOptions, function(res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('statusCode=' + res.statusCode));
        }

        var body = [];
        res.on('data', function(chunk) {
          body.push(chunk);
        });

        res.on('end', function() {
          try {
              body = JSON.parse(Buffer.concat(body).toString());
          } catch(e) {
              reject(e);
          }
          resolve(body);
        });
      });

      
      req.on('error', function(err) {
          reject(err);
      });
      
      req.write(JSON.stringify({
        'jsonrpc': '2.0',
        'id': 'ID321',
        'method': method,
        'params': params 
      }));

      req.end();
  });
}

function delay() {
  return new Promise(resolve => setTimeout(resolve, delayTime));
}