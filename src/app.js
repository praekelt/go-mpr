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

            // insert option to return to main menu every 3 options
            // 4 options per page, 4th option is that to return
            for (var i=3; i < choices.length + (choices.length / 4); i+=4) {
                choices.splice(i, 0, new Choice('states:start', 'Return to menu'));
            }

            // FOR TESTING
            for (var j=0; j < choices.length; j++) {
                console.log(choices[j].label);
            }

            return new PaginatedChoiceState(name, {
                question: 'Choose your medicine:',
                choices: choices,
                characters_per_page: 160,
                options_per_page: 4,
                next: function(choice) {
                    if (choice.value == 'states:start') {
                        return choice.value;
                    } else {
                        return self
                            .http.get('http://mpr.code4sa.org/api/detail', {
                                params: {product: choice.value}
                            })
                            .then(function(resp) {
                                return {
                                    name: 'states:search:details',
                                    creator_opts: {
                                        details: resp.data
                                    }
                                };
                            }); 
                    }    
                }
            });
        });

        self.states.add('states:search:details', function(name, opts) {
            return new EndState(name, {
                text: [
                    opts.details.name,
                    "Schedule: ".concat(opts.details.schedule),
                    "Dosage form: ".concat(opts.details.dosage_form),
                    "Reg. No.: ".concat(opts.details.regno),
                    "SEP: ".concat(opts.details.sep)
                ].join('\n'),
                next: 'states:start'
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
