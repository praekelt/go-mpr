var go = {};
go;

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    //var HttpApi = vumigo.http.api.HttpApi;
    var JsonApi = vumigo.http.api.JsonApi;

    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');

       self.init = function() {
           self.http = new JsonApi(self.im);
       };

        self.states.add('states:start', function(name) {
            return new ChoiceState(name, {
                question: 'Welcome to MPR! Please select an option.',

                choices: [
                    new Choice('states:start', 'Show this menu again'),
                    new Choice('states:search', 'Search for medicine'),
                    new Choice('states:end', 'Exit')],

                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.states.add('states:search', function(name) {
            return new FreeText(name, {
                question: 'Which medicine would you like to search for?',

                next: function(content) {
                    return self
                        .http.get('http://mpr.code4sa.org/api/search-lite', {
                            params: {q: content}
                        })
                        .then(function(resp) {
                            return {
                                name: 'states:done',
                                creator_opts: {
                                    search_query: content,
                                    medicines: resp.data
                                }
                            };
                        });
                }
            });
        });

        self.states.add('states:done', function(name, opts) {
            var result = opts.medicines
                .map(function(d) {
                    return [d.name, d.sep].join(': ');
                })
                .join('\n');

            return new EndState(name, {
                text: [
                    "Showing results for search \'" + opts.search_query + "\'.",
                    result
                ].join(' '),
                next: 'states:start'
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

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoApp = go.app.GoApp;


    return {
        im: new InteractionMachine(api, new GoApp())
    };
}();
