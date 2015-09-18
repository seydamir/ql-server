# ql-server
Qt/QML Web server with pure-JS HTTP processing.
Donate: Paypal edartuz@gmail.com

Registration:

```c++
#include "lib/ql-files.hpp"
#include "lib/ql-server.hpp"

int main(int argc, char **argv){
	QApplication app(argc, argv);

	QlFiles::argvSet(&app); // initialize ARGV
	qmlRegisterType<QlFiles>("QlFiles", 1,0, "QlFiles");

	qmlRegisterType<QlServer>("QlServer", 1,0, "QlServer");
}
```

Use:

```Javascript

import 'qml'

ApplicationWindow { id:app; visible:true

	// start server on port 8090, static content at './static' dir, set callback for dynamic content
	QlServer { port:8090; filesDir: './static'; callback: function(req,resp){
		// check request method and URL
		if ((req.method === 'GET')&&(req.url === '/data.json')){
			// serve JSON array
			resp.headers['Content-Type'] = types.json;
			resp.content = '[0,1,2,3,4,5,6,7,8,9]';
			resp.served  = true;
		}
	}}
}
```

