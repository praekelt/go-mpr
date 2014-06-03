module.exports = function() {
    return [{
        "request": {
            "method": "GET",
            "url": "http://httpbin.org/status/418",
            "headers": {
                "Content-Type": ["text/plain"]
            }
        },
        "response": {
            "code": 418,
            "body": 'Hello world'
        }
    }];
};
