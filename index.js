const httpDispatcher = require('httpdispatcher');
const http = require('http');
const https = require('https');
const fs = require('fs');
var server, tls_server;

module.exports = {
	serve: init,
	stop: stop
}


function init(opts, cb){
	try{
		opts = Object.assign({
			port: 8888,
			stubs: []
		}, opts);

	    var loadStatus = true;
	    opts.stubs.forEach(file=> {
	      loadStatus = loadStatus?stub(file, httpDispatcher):loadStatus;
	    })

	    if(!loadStatus){
	      console.log('stub server is failed, cannot load all stub files');
	      return -1;
	    }

		server = http.createServer((req, res) => {
	        httpDispatcher.dispatch(req, res);
	    }).listen(opts.port, '127.0.0.1',()=>{
	    	console.log('stub server is open:', opts.port)
	    	if(cb) cb(); //for test purpose
	    });

	    if(opts.certs){
	    	var options = {
			  key: fs.readFileSync(opts.certs.key),
			  cert: fs.readFileSync(opts.certs.cert)
			};
			const tls_port = opts.tls_port || opts.port - 1

			tls_server = https.createServer(options, function (req, res) {
			  httpDispatcher.dispatch(req, res);
			}).listen(tls_port, ()=>{
	    		console.log('stub https server is open:', tls_port);
		    });
	    }
	}catch(e){
		console.log('cannot create server', e)
	}
}

function stop(){
	if(server) server.close(()=>{
    	console.log('stub server is closed')
    });
	if(tls_server) tls_server.close(()=>{
    	console.log('stub https server is closed')
    });
}

function stub(fileName, dispatcher){
	//todo, it's better do it async
	try{
		const data = fs.readFileSync(fileName, {encoding:'utf8'});
		const httpStructure = JSON.parse(data);
		if(httpStructure.request.method === 'POST'){
			dispatcher.onPost(httpStructure.request.url, function(req, res) {
				writeCORSHeaders(res, httpStructure.response.status || 200)
		        res.end(JSON.stringify(httpStructure.response.body));
		    });
		    console.log('registered POST on ', httpStructure.request.url)
		}else if(httpStructure.request.method === 'GET'){
			dispatcher.onGet(httpStructure.request.url, function(req, res) {
		        writeCORSHeaders(res, httpStructure.response.status || 200)
		        res.end(JSON.stringify(httpStructure.response.body));
		    });
		    console.log('registered GET on ', httpStructure.request.url)
		}else{
			console.log('cannot process http structure', fileName, data)
	      return false;
	    }
	    return true;
	  } catch (e) {
	    console.log('cannot process file', fileName, e)
	    return false;
	  }
}

function writeCORSHeaders(res, status){
	res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
      'Access-Control-Allow-Credentials': true
    });
}