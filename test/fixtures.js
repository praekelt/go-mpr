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
    }];
};
