module.exports = function() {
    return [{
        "request": {
            "method": "GET",
            "url": "http://mpr.code4sa.org/api/search-lite",
            "params": {
                "q": "salbutamol"
            }
        },
        "response": {
            "code": 200,
            "data": {
                "data": "salbutamol"
            }
        }
    },
    {
        "request": {
            "method": "POST",
            "url": "http://httpbin.org/post",
            "data": {
                "message": "hello world!"
            }
        },
        "response": {
            "code": 200,
            "data": {
                "data": "{\"message\":\"hello world!\"}",
                "form": {},
                "origin": "192.168.0.23",
                "url": "http://httpbin.org/post",
                "args": {},
                "files": {},
                "headers": {
                    "Content-Type": "application/json",
                    "Host": "httpbin.org",
                    "Cookie": "",
                    "X-Request-Id": "a3b50df8-d3d0-40cb-ab33-bcada3e7d012",
                    "Content-Length": "26",
                    "Accept-Encoding": "gzip, deflate",
                    "Connection": "close"
                },
                "json": {
                    "message": "hello world!"
                }
            }
        }
    }];
};
