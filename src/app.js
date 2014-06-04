go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    var HttpApi = vumigo.http.api.HttpApi;

    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');

       self.init = function() {
           self.http = new HttpApi(self.im);
       };

        self.states.add('states:start', function(name) {
            return new ChoiceState(name, {
                question: 'Welcome to MPR! Please select an option.',

                choices: [
                    new Choice('states:start', 'Show this menu again'),
                    new Choice('states:input', 'Search for medicine'),
                    new Choice('states:end', 'Exit')],

                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.states.add('states:input', function(name) {
            return new FreeText(name, {
                question: 'Which medicine would you like to search for?',

                next: function(content) {
                    return self
                        .http.get('http://mpr.code4sa.org/api/search-lite', {params:{q:content}})
                        .then(function(resp) {
                            return new EndState(name, {
                                text: resp.data,
                                name: 'states:start',
                            });
                        });
                }
            });
        });

        self.states.add('states:post', function(name) {
            return new FreeText(name, {
                question: 'What would you like to post?',

                next: function(content) {
                    return self
                        .http.post('http://httpbin.org/post', {
                            data: {message: content}
                        })
                        .then(function(resp) {
                            return {
                                name: 'states:start',
                                creator_opts: {
                                    method: 'post',
                                    echo: resp.data.json.message
                                }
                            };
                        });
                }
            });
        });
        
        self.states.add('states:teapot', function(name) {
            return self
            .http.get('http://httpbin.org/status/418')
            .catch(function(e) {
                return new EndState(name, {
                    text: e.response.data,
                    next: 'states:start'
                });
            });
        });

        self.states.add('states:end', function(name) {
            return new EndState(name, {
                text: 'Thanks, cheers!',
                next: 'states:start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
