const httpDispatcher = require('httpdispatcher');
const http = require('http');
const fs = require('fs');
var server;

module.exports = {
	serve: init,
	stop: stop
}


function init(opts, cb){
	opts = Object.assign({
		port: 8888,
		stubs: []
	}, opts);

	opts.stubs.forEach(file=>{
		stub(file, httpDispatcher);
	})

	server = http.createServer((req, res) => {
        httpDispatcher.dispatch(req, res);
    }).listen(opts.port, '127.0.0.1',()=>{
    	console.log('stub server is open:', opts.port)
    	if(cb) cb(); //for test purpose
    });
}

function stop(){
	if(server) server.close(()=>{
    	console.log('stub server is closed')
    });
}

function stub(fileName, dispatcher){
	//todo, it's better do it async
	try{
		const data = fs.readFileSync(fileName, {encoding:'utf8'});
		const httpStructure = JSON.parse(data);
		if(httpStructure.request.method === 'POST'){
			dispatcher.onPost(httpStructure.request.url, function(req, res) {
				console.log('it\'s POST', JSON.stringify(httpStructure.response.body),
					httpStructure.response.status || 200)
		        res.writeHead(httpStructure.response.status || 200, {'Content-Type': 'text/json'});
		        res.end(JSON.stringify(httpStructure.response.body));
		    });
		    console.log('registered POST on ', httpStructure.request.url)
		}else if(httpStructure.request.method === 'GET'){
			dispatcher.onGet(httpStructure.request.url, function(req, res) {
		        res.writeHead(httpStructure.response.status || 200, {'Content-Type': 'text/json'});
		        res.end(JSON.stringify(httpStructure.response.body));
		    });
		    console.log('registered GET on ', httpStructure.request.url)
		}else{
			console.log('cannot process http structure', fileName, data)
		}
	}catch(e){
		console.log('cannot process file', fileName, e)
	}

}