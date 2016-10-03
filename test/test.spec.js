const expect = require('chai').expect;
const http = require('http');
const https = require('https');
const stub = require('../index.js');

//hack to pass self signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe('stub',function(){
	
	it('shold loaad json files and register http request in dispatcher', done=>{
		stub.serve({
			stubs:['./test/test.json']
		},()=>{
			const req = http.request({
				hostname: '127.0.0.1',
				port: 8888,
				path: '/api/test',
				method: 'POST'
			}, (res) => {	
				var data = '';
			  res.setEncoding('utf8');
			  res.on('data', (chunk) => {
			    console.log(`BODY: ${chunk}`);
			    data = data + chunk;
			  });
			  res.on('end', () => {
			    const response = JSON.parse(data);
			    expect(response.result).to.equal('ok')
			    stub.stop();
			    done();
			  });
			});
			req.end();
		});
	})

	it('shold work over https', done=>{
		stub.serve({
			stubs:['./test/test.json'],
			certs: {
				key:'./test/key.pem',
				cert: './test/cert.pem'
			}
		},()=>{
			const req = https.request({
				hostname: '127.0.0.1',
				port: 8887,
				path: '/api/test',
				method: 'POST'
			}, (res) => {	
				var data = '';
			  res.setEncoding('utf8');
			  res.on('data', (chunk) => {
			    console.log(`BODY: ${chunk}`);
			    data = data + chunk;
			  });
			  res.on('end', () => {
			    const response = JSON.parse(data);
			    expect(response.result).to.equal('ok')
			    stub.stop();
			    done();
			  });
			});
			req.end();
		});
	})
})