var go = {};
go;

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var HttpApi = vumigo.http.api.HttpApi;

    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');

       self.init = function() {
           self.http = new HttpApi(self.im);
       };

        self.states.add('states:start', function(name) {
            return new ChoiceState(name, {
                question: 'Hi there! What do you want to do?',

                choices: [
                    new Choice('states:start', 'Show this menu again'),
                    new Choice('states:teapot', 'Show a teapot'),
                    new Choice('states:end', 'Exit')],

                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.states.add('states:end', function(name) {
            return new EndState(name, {
                text: 'Thanks, cheers!',
                next: 'states:start'
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
