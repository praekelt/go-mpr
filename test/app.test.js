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
                            'Welcome to MPR! Please select an option.',
                            '1. Show this menu again',
                            '2. Search for medicine',
                            '3. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user asks to see the menu again", function() {
            it("should show the menu again", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('1')
                    .check.interaction({
                        state: 'states:start',
                        reply: [
                            'Welcome to MPR! Please select an option.',
                            '1. Show this menu again',
                            '2. Search for medicine',
                            '3. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user asks to search for medicine", function() {
            it("should allow input for searching", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('2')
                    .check.interaction({
                        state: 'states:search',
                        reply: 'Hello world'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("when the user asks to exit", function() {
            it("should say thank you and end the session", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('3')
                    .check.interaction({
                        state: 'states:end',
                        reply: 'Thanks, cheers!'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });
    });
});
