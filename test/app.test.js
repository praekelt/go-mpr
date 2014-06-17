var assert = require('assert');
var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var _ = require('lodash');
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
                    name: 'test_app',
                    endpoints: {sms: {delivery_class: 'sms'}}
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("when the user starts a session", function() {
            it("should ask them search for medicine", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'states:start',
                        reply: 'Welcome to the Medicine Price Registry! Please enter a medicine to search for.'
                    })
                    .run();
            });
        });

        describe("when the user enters medicine to be searched for", function() {
            it("should send a request to the registry", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('salbutamol')
                    .check(function(api) {
                        var req = api.http.requests[0];
                        assert.deepEqual(req.params, {q: 'salbutamol'});
                    })
                    .run();
            });

            it("should tell them the result", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('salbutamol')
                    .check.interaction({
                        state: 'states:search:results',
                        reply: [
                            "Choose your medicine:",
                            "1. Vari-Salbutamol 2Mg/5Ml Syrup: R 22.46",
                            "2. Venteze: R 25.88",
                            "3. Asthavent Syrup: R 26.35",
                            "4. Menu",
                            "5. More"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user searches for a medicine", function() {

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
                    }
                ];

                tester
                    .setup.user.state('states:search:results', {
                        creator_opts: { medicines : medicines }
                });
            });

            describe("when the user pages through the search results", function() {            
                it ("should display the second page of medicine details", function() {
                    return tester
                        .input('5')
                        .check.interaction({
                            state: 'states:search:results',
                            reply: [
                                "Choose your medicine:",
                                "1. Asthavent Dp-Caps: R 31.14",
                                "2. Asthavent Syrup: R 35.94",
                                "3. Asthavent: R 41.57",
                                "4. Menu",
                                "5. More", 
                                "6. Back"
                            ].join('\n'),
                        })
                        .run();
                });

                it ("should display the last page of medicine details", function() {
                    return tester
                        .setup.user.state.metadata( {page_start: 6} )
                        .input('4')
                        .check.interaction({
                            state: 'states:search:results',
                            reply: [
                                "Choose your medicine:",
                                "1. Venteze Cfc Free: R 42.42",
                                "2. Menu",
                                "3. Back"
                            ].join('\n'),
                        })
                        .run();
                });
            });

            describe("when the user selects the menu option", function() {
                it ("should return to the main menu", function() {
                    return tester
                        .input('4')
                        .check.interaction({
                            state: 'states:start',
                            reply: 'Welcome to the Medicine Price Registry! Please enter a medicine to search for.'
                        })
                        .run();
                });
            });

            describe("when the user selects a search result", function() {
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
                                "Packs: 1",
                                "Pack size: 100",
                                "RegNo: 35/10.2/0142",
                                "SEP: R 22.46", 
                                "1. SMS details",
                                "2. New search",
                                "3. Exit",
                            ].join('\n'),
                        })
                        .run();
                });
            });
        });

        describe("when the user views medicine details", function() {

            beforeEach(function() {
                var details = {
                    name: "Vari-Salbutamol 2Mg/5Ml Syrup",
                    schedule: "S2",
                    dosage_form: "syrup",
                    num_packs: "1",
                    pack_size: "100",
                    regno: "35/10.2/0142",
                    sep: "R 22.46"
                };

                tester
                    .setup.user.state('states:search:details', {
                        creator_opts: { details : details }
                });
            });

            describe("when the user asks to receive an sms", function() {
                it ("should send an sms", function() {
                    return tester
                        .input('1')
                        .check.interaction({
                            state: 'states:search:sms',
                            reply: 'An sms has been sent to you'
                        })
                        .check(function(api) {
                            var smses = _.where(api.outbound.store, {
                                endpoint: 'sms'
                            });
                            var sms = smses[0];
                            assert.equal(smses.length,1);
                            assert.equal(sms.content, [
                                "Vari-Salbutamol 2Mg/5Ml Syrup",
                                "Schedule: S2",
                                "Dosage form: syrup",
                                "Packs: 1",
                                "Pack size: 100",
                                "RegNo: 35/10.2/0142",
                                "SEP: R 22.46"
                            ].join('\n'));
                        })
                        .run();
                });
            });

            describe("when the user asks to return to the main menu", function() {
                it ("should return to the main menu", function() {
                    return tester
                        .input('2')
                        .check.interaction({
                            state: 'states:start',
                            reply: 'Welcome to the Medicine Price Registry! Please enter a medicine to search for.'
                        })
                        .run();
                });
            });

            describe("when the asks to exit", function() {
                it ("should say thank you and end the session", function() {
                    return tester
                        .input('3')
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
});
