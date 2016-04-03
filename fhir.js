function getName (medication) {
    if (medication.text) {
        return medication.text;
    } else if (medication.coding && medication.coding[0].display) {  //logic to return and set rules for returning the type of medication. 
        return medication.coding[0].display;
    } else {
      return "Unnamed Medication(TM)";
    }
}

function getVit (vital) {
    if (vital.value) {
        return vital.value;
    } 
     else {
      return "Unnamed vital(TM)";
    }
}

var demo = {
    serviceUrl: "https://fhir-open-api-dstu2.smarthealthit.org",        //allows you to connect to your smar server and query a patient 
    patientId: "hca-pat-55"  // josuah p willams hca-pat-55 1137192
};

// Create a FHIR client (server URL, patient id in `demo`)
var smart = FHIR.client(demo),
    pt = smart.patient;                        //you will then store your queryed patient in a varible

// Create a patient banner by fetching + rendering demographics
pt.read()
    .then(function (p) {
    var name = p.name[0];
    var formatted = name.given.join(" ") + " " + name.family;
    $("#patient_name").text(formatted);
});

pt.read()
    .then(function (p) {
    var phone = p.telecom[0];
    var formatted = phone.value;
    $("#patient_phone").text(formatted);
});

// A more advanced query: search for active Prescriptions, including med details
pt.api.search({type: "MedicationOrder"})
    .then(function(prescriptions) {
        prescriptions.data.entry.forEach(function(prescription){
            var med = prescription.resource.medicationCodeableConcept;
            var row = $("<a class='list-group-item'> " + getName(med) + "</a>");
            $("#med_list").append(row);
        });
    });

    
    // A more advanced query: search for vitals
pt.api.search({type: "Observation", query: {code:  {$or: ['26499-4', '26515-7']}}}) // it worked you need to identifey what code you waan
    .then(function(prescriptions) {
        prescriptions.data.entry.forEach(function(prescription){            // how can we access diffrent datat from the model 
              var vit= prescription.resource;
            var row = $("<h2>"+vit.code.text+"</h2>"+ //get name of the coded oberservation type
                "<a class='list-group-item'> " +  vit.valueQuantity.value+" "+vit.valueQuantity.unit+"   date taken:  " +vit.meta.lastUpdated+"</a>");
            console.log(vit)
            $("#vital_list").append(row);
        });
    });
    
    
    
    // pt.api.search({type: "Observation"})
    // .then(function(prescriptions) {
    //     prescriptions.data.entry.forEach(function(prescription){    recipie to search for resource and return a value. next step is to put data into an arraw for ds3
    //         var med = prescription.resource.id;
    //         var row = $("<a class='list-group-item'> " + med + "</a>");
    //         $("#vital_list").append(row);
    //     });
    // });
   // pt.api.search({type: "Observation", query: {code: '26515-7'}})
    // .then(function(prescriptions) {
    //     prescriptions.data.entry.forEach(function(prescription){            // how can we access diffrent datat from the model 
    //         var med = prescription.resource.code.coding[0].display;                 // when you have a brackt [ ] you need to index it from the array
    //          var vita= prescription.resource.code.text;
    //           var vit= prescription.resource;
    //         var row = $("<a class='list-group-item'> " + med +": "+vita+ ":  "+ vit.valueQuantity.value+"</a>");
    //         console.log(vit)
    //         $("#vital_list").append(row);
    //     });
    // });