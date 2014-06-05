var go = {};
go;

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
    var JsonApi = vumigo.http.api.JsonApi;

    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');

       self.init = function() {
           self.http = new JsonApi(self.im);
       };

        self.states.add('states:start', function(name) {
            return new ChoiceState(name, {
                question: 'Welcome to the Medicine Price Registry! Please select an option.',

                choices: [
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
                                name: 'states:search:results',
                                creator_opts: {
                                    medicines: resp.data
                                }
                            };
                        });
                }
            });
        });

        self.states.add('states:search:results', function(name, opts) {
            var choices = opts.medicines
                .map(function(d) {
                    return new Choice(d.id, [d.name, d.sep].join(': '));
                });

            return new PaginatedChoiceState(name, {
                question: 'Choose your medicine:',
                choices: choices,
                characters_per_page: 140,
                options_per_page: 3,
                next: function(choice) {
                    if (choice.value !== "not_available")
                        return self.set_ward_data(choice,opts);
                    else {
                        return self.handle_unavailable_location(choice,opts);
                    }
                }
            });
        });

        self.states.add('states:end', function(name) {
            return new EndState(name, {
                text: 'Thank you!',
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
