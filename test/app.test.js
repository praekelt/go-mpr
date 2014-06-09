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
                            "4. Return to menu",
                            "5. More"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user selects a search result", function() {

            beforeEach(function() {
                var medicines = [
                    {
                        "dosage_form": "syrup", 
                        "sep": "R 22.46", 
                        "id": 4333, 
                        "name": "Vari-Salbutamol 2Mg/5Ml Syrup"
                    }, 
                    {
                        "dosage_form": "syrup", 
                        "sep": "R 25.88", 
                        "id": 6164, 
                        "name": "Venteze"
                    }, 
                    {
                        "dosage_form": "syrup", 
                        "sep": "R 26.35", 
                        "id": 2893, 
                        "name": "Asthavent Syrup"
                    }, 
                    {
                        "dosage_form": "capsule", 
                        "sep": "R 31.14", 
                        "id": 2741, 
                        "name": "Asthavent Dp-Caps"
                    }, 
                    {
                        "dosage_form": "syrup", 
                        "sep": "R 35.94", 
                        "id": 2894, 
                        "name": "Asthavent Syrup"
                    }, 
                    {
                        "dosage_form": "inhaler", 
                        "sep": "R 41.57", 
                        "id": 2887, 
                        "name": "Asthavent"
                    }, 
                    {
                        "dosage_form": "inhaler", 
                        "sep": "R 42.42", 
                        "id": 5811, 
                        "name": "Venteze Cfc Free"
                    },
                ];

                tester
                    .setup.user.state('states:search:results', {
                        creator_opts: { medicines : medicines }
                });
            });

            it ("should send a request to the registry", function() {
                return tester
                    .input('1')
                    .check(function(api) {
                        var req = api.http.requests[0];
                        assert.deepEqual(req.params, {product: '4333'});
                    })
                    .run();
            });

            it ("should display the medicine details", function() {
                return tester
                    .input('1')
                    .check.interaction({
                        state: 'states:search:details',
                        reply: [
                            "Vari-Salbutamol 2Mg/5Ml Syrup",
                            "Schedule: S2",
                            "Dosage form: syrup",
                            "Reg. No.: 35/10.2/0142",
                            "SEP: R 22.46", 
                        ].join('\n'),
                    })
                    .check.reply.ends_session()
                    .run();
            });

            it ("should return to the main menu", function() {
                return tester
                    .input('4')
                    .check.interaction({
                        state: 'states:start',
                        reply: [
                            'Welcome to the Medicine Price Registry! Please select an option.',
                            '1. Search for medicine',
                            '2. Exit'
                        ].join('\n'),
                    })
                    .run();
            });


            it ("should display the next page of medicine details", function() {
                return tester
                    .input('5')
                    .check.interaction({
                        state: 'states:search:results',
                        reply: [
                            "Choose your medicine:",
                            "1. Asthavent Dp-Caps: R 31.14",
                            "2. Asthavent Syrup: R 35.94",
                            "3. Asthavent: R 41.57",
                            "4. Return to menu",
                            "5. More", 
                            "6. Back"
                        ].join('\n'),
                    })
                    .run();
            });

            it ("should display the last page of medicine details", function() {
                return tester
                    .setup.user.state.metadata( {page_start: 5} )
                    .input('5')
                    .check.interaction({
                        state: 'states:search:results',
                        reply: [
                            "Choose your medicine:",
                            "1. Venteze Cfc Free: R 42.42",
                            "2. Return to menu", 
                            "3. Back"
                        ].join('\n'),
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
