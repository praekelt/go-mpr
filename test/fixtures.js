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
            "data": [
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
            ]
        }
    },
    {
        "request": {
            "method": "GET",
            "url": "http://mpr.code4sa.org/api/detail",
            "params": {
                "product": "4333"
            }
        },
        "response": {
            "code": 200,
            "data": {
                "num_packs": 1, 
                "is_generic": "Generic", 
                "name": "Vari-Salbutamol 2Mg/5Ml Syrup", 
                "regno": "35/10.2/0142", 
                "schedule": "S2", 
                "pack_size": 100.0, 
                "ingredients": [
                    {
                        "strength": 2, 
                        "name": "Salbutamol", 
                        "unit": "mg/5ml"
                    }
                ], 
                "sep": "R 22.46", 
                "id": 4333, 
                "dosage_form": "syrup"
            }
        }
    }];
};
