var assert = require('assert');
var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("app", function() {
    describe("GoApp", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();

            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'test_app'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("when the user starts a session", function() {
            it("should ask them to select an option", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'states:start',
                        reply: [
                            'Welcome to the Medicine Price Registry! Please select an option.',
                            '1. Search for medicine',
                            '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user chooses to search for medicine", function() {
                it("should ask them to enter medicine name", function() {
                    return tester
                        .setup.user.state('states:start')
                        .input('1')
                        .check.interaction({
                            state: 'states:search',
                            reply: 'Which medicine would you like to search for?'
                        })
                        .run();
                });
            });

        describe("when the user enters medicine to be searched for", function() {
            it("should send a request to the registry", function() {
                return tester
                    .setup.user.state('states:search')
                    .input('salbutamol')
                    .check(function(api) {
                        var req = api.http.requests[0];
                        assert.deepEqual(req.params, {q: 'salbutamol'});
                    })
                    .run();
            });

            it("should tell them the result", function() {
                return tester
                    .setup.user.state('states:search')
                    .input('salbutamol')
                    .check.interaction({
                        state: 'states:search:results',
                        reply: [
                            "Choose your medicine:",
                            "1. Vari-Salbutamol 2Mg/5Ml Syrup: R 22.46",
                            "2. Venteze: R 25.88",
                            "3. Asthavent Syrup: R 26.35",
                            "4. More"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user asks to exit", function() {
            it("should say thank you and end the session", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('2')
                    .check.interaction({
                        state: 'states:end',
                        reply: 'Thank you!'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });
    });
});
