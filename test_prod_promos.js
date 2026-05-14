import http from 'https';

const options = {
  hostname: 'api-efbbevhoca-uc.a.run.app',
  port: 443,
  path: '/api/promotions',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${body.slice(0, 500)}...`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
