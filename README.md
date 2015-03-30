# ql-server
Qt/QML Web server with pure-JS HTTP processing.

Registration:

```c++
#include "lib/ql-files.hpp"
#include "lib/ql-server.hpp"

// files operations module
qmlRegisterType<QlFiles>("com.ql.files", 1,0, "QlFiles");
// server module
qmlRegisterType<QlServer>("com.ql.server", 1,0, "QlServer");
```

Use:

```Javascript

// import HTTP processing module
import 'js/http.js'    as Http

ApplicationWindow { id:app; visible:true

	Component.onCompleted: {
		// start server on port 8090, serve static content from ./static folder, set callback function for dynamic content
		server = Http.serve(app, 8090, './static', function(req,resp){
			if (req.method === 'GET'){ // check request method
				if (req.url === '/data.json'){ // check request URL
					// serve JSON data
					resp.headers['Content-Type'] = Http.types.json;
					resp.content = '[0,1,2,3,4,5,6,7,8,9]';
					resp.served = true;
				}
			}
		});
	}
}

