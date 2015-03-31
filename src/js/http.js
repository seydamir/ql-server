// HTTP server

var File = false;

// string to bytes
function stob(s){
	var b = [];
	for (var i=0; i<s.length; i++) b.push(s.charCodeAt(i) & 0xFF);
	return b;
}

// bytes to string
function btos(b,start,end){
	var s = [];
	if (start === undefined) start = 0;
	if (end === undefined)   end = b.length-1;
	while (start < end) s.push(String.fromCharCode(b[start++] & 0xFF));
	return s.join('');
}

// get file extension
function fext(s){
	var ss = s.split('.');
	return ss.length > 1 ? ss.pop().toLowerCase() : '';
};

// parse HTTP request
function parseRequest(request){
	if (request instanceof Array) request = btos(request);
	var lines = request.split('\r\n');
	
	request = {error:true, lines:lines, headers:{},};
	
	if (lines.length > 2){
		request.request = lines[0];
		
		// parse 1st line (method/URI/version)
		var m = /^([A-Z]+) (.*) HTTP\/([0-9])\.([0-9])$/.exec(lines[0]);
		if (m){
			request.method=m[1]; request.uri=m[2];
			request.verh=m[3]; request.verl=m[4];
			request.ver = m[3] + '.' + m[4];
			
			// get URL query/hash from full URI
			var u = request.uri.split('?');
			request.url = u[0];                          // URL
			request.query = (u.length > 1) ? u[1] : '';  // query
			u = request.query.split('#');
			request.query = u[0];
			request.hash = (u.length > 1) ? u[1] : '';   // hash
			
			// split query to params
			request.queries = {};
			u = request.query.split('&');
			for (var i=0; i<u.length; i++){
				var uu = u[i].split('=');
				if (uu.length == 2) request.queries[uu[0]] = uu[1];
			}
			
			// get headers
			var i = 1;
			while ((i < lines.length) && (lines[i].length > 0)){
				var m = /^([A-Za-z\\-]+): (.*)$/.exec(lines[i]);
				if (m) request.headers[m[1]] = m[2];
				i++;
			}
			i++;
			
			// get rest of content
			var b = [];
			while (i < lines.length) b.push( lines[i++] );
			request.content = b.join('\r\n');
			request.error = false;
		}
	}
	return request;
}

// available methods
var methods = [ 'OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT' ];

// codes names
var codes = {
	100:'Continue', 101:'Switching Protocols', 200:'OK', 201:'Created', 202:'Accepted', 203:'Non-Authoritative Information',
	204:'No Content', 205:'Reset Content', 206:'Partial Content', 300:'Multiple Choices', 301:'Moved Permanently',
	302:'Found', 303:'See Other', 304:'Not Modified', 305:'Use Proxy', 307:'Temporary Redirect', 400:'Bad Request',
	401:'Unauthorized', 402:'Payment Required', 403:'Forbidden', 404:'Not Found', 405:'Method Not Allowed',
	406:'Not Acceptable', 407:'Proxy Authentication Required', 408:'Request Time-out', 409:'Conflict', 410:'Gone',
	411:'Length Required', 412:'Precondition Failed', 413:'Request Entity Too Large', 414:'Request-URI Too Large',
	415:'Unsupported Media Type', 416:'Requested range not satisfiable', 417:'Expectation Failed',
	500:'Internal Server Error', 501:'Not Implemented', 502:'Bad Gateway', 503:'Service Unavailable',
	504:'Gateway Time-out', 505:'HTTP Version not supported',
};

// content types
var types = {
	txt:'text/plain; charset="utf-8"', bin:'application/octet-stream',
	html:'text/html; charset="utf-8"', js:'application/javascript; charset="utf-8"',
	json:'application/json; charset="utf-8"', jsonp:'application/javascript; charset="utf-8"',
	css:'text/css; charset="utf-8"',
	png:'image/png', jpg:'image/jpg', gif:'image/gif', bmp:'image/bmp',
	pdf:'application/pdf',
};


// create new server object listening port, static content in dir, callback function
function serve(parent, port, dir, callback){

	var s = Qt.createQmlObject('import com.ql.server 1.0; QlServer {}', parent, 'Main');
	if (!File) File = Qt.createQmlObject('import com.ql.files 1.0; QlFiles {}', parent, 'Http');

	// start serving at port
	s.listenPort(port);
	
	// connect callback
	s.requestHandler.connect(function(s,dir,callback){
		return function(request){
			var request = parseRequest(request);
			if (!request.error){
				console.log('QlServer serving',request.method,request.uri);

				// response object
				var response = { served:false,
					ver:request.ver,
					code:200,    // response code
					content:'',  // text/html content
					blob:[],     // binary content
					headers:{ 'Content-Type':types.html }
				}

				// call callback
				if (callback) callback(request,response);

				// serve static file
				if (!response.served){
					if (request.method === 'GET'){
						var file = dir + request.url;
						if (File.exists(file) && File.isFile(file)){
							var ext = fext(file); // get extension
							// serve text content
							if (['txt','html','js','css'].indexOf(ext) != -1){
								response.content = File.readString(file,'utf8');
								response.headers['Content-Type'] = types[ext];
								response.served = true;
							}
							// serve image/document
							else if (['png','jpg','gif','bmp','pdf'].indexOf(ext) != -1){
								response.blob = File.readBytes(file);
								response.headers['Content-Type']   = types[ext];
								response.headers['Content-Length'] = response.blob.length;
								response.served = true;
							}
							// serve other binary content
							else {
								response.blob = File.readBytes(file);
								response.headers['Content-Type']   = types['bin'];
								response.headers['Content-Length'] = response.blob.length;
								response.served = true;
							}
							if (response.served) console.log('QlServer served file',file);
						}
					}
				}
				
				// not served - error
				if (!response.served) response = {served:true, ver:request.ver, code:404, headers:[], content:'', blob:[]};
				
				// serve response packet
				if (response.served){
					var resp = ['HTTP/' + response.ver + ' ' + response.code + ' ' + codes[response.code]];
					for (var k in response.headers) resp.push(k + ': ' + response.headers[k]);
					resp.push('');
					if (response.code === 200){
						resp.push(response.content);
						s.blob(response.blob);
					}
					s.respond(resp.join('\r\n'));
				}
			}
		}
	}(s,dir,callback));
	return s;
}

