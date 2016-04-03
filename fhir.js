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
    patientId: "99912345"  // josuah p willams hca-pat-55 1137192
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
    
    pt.api.search({type: "Observation", query: {code:  {$or: ['8480-6',"8462-4" ]}}}) // it worked you need to identifey what code you waan
    .then(function(bps) {
        var dat=[];
       bps.data.entry.forEach(function(bp){            // how can we access diffrent datat from the model for a set of blood pressures do it for one blood pressure
              var blood= bp.resource;
            var row = $("<h2>"+blood.code.text+"</h2>"+ //get name of the coded oberservation type
                "<a class='list-group-item'> " +  blood.valueQuantity.value+" "+blood.valueQuantity.unit+"   date taken:  " +blood.meta.lastUpdated+"</a>");
            // console.log(blood.valueQuantity.value)
            console.log(blood.code.coding[0].code)
            if(blood.code.coding[0].code=="8480-6"){
            dat.push(blood.valueQuantity.value)
            }
             console.log(dat)
         
            $("#bp_list").append(row);
        });
        var data =dat,
			w = 400,
			h = 200,
			margin = 20,
			y = d3.scale.linear().domain([0, d3.max(data)]).range([0 + margin, h - margin]),
			x = d3.scale.linear().domain([0, data.length]).range([0 + margin, w - margin])

			var vis = d3.select("body")
			    .append("svg:svg")
			    .attr("width", w)
			    .attr("height", h)

			var g = vis.append("svg:g")
			    .attr("transform", "translate(0, 200)");
			
			var line = d3.svg.line()
			    .x(function(d,i) { return x(i); })
			    .y(function(d) { return -1 * y(d); })
			
			g.append("svg:path").attr("d", line(data));
			
			g.append("svg:line")
			    .attr("x1", x(0))
			    .attr("y1", -1 * y(0))
			    .attr("x2", x(w))
			    .attr("y2", -1 * y(0))

			g.append("svg:line")
			    .attr("x1", x(0))
			    .attr("y1", -1 * y(0))
			    .attr("x2", x(0))
			    .attr("y2", -1 * y(d3.max(data)))
			
			g.selectAll(".xLabel")
			    .data(x.ticks(5))
			    .enter().append("svg:text")
			    .attr("class", "xLabel")
			    .text(String)
			    .attr("x", function(d) { return x(d) })
			    .attr("y", 0)
			    .attr("text-anchor", "middle")

			g.selectAll(".yLabel")
			    .data(y.ticks(4))
			    .enter().append("svg:text")
			    .attr("class", "yLabel")
			    .text(String)
			    .attr("x", 0)
			    .attr("y", function(d) { return -1 * y(d) })
			    .attr("text-anchor", "right")
			    .attr("dy", 4)
			
			g.selectAll(".xTicks")
			    .data(x.ticks(5))
			    .enter().append("svg:line")
			    .attr("class", "xTicks")
			    .attr("x1", function(d) { return x(d); })
			    .attr("y1", -1 * y(0))
			    .attr("x2", function(d) { return x(d); })
			    .attr("y2", -1 * y(-0.3))

			g.selectAll(".yTicks")
			    .data(y.ticks(4))
			    .enter().append("svg:line")
			    .attr("class", "yTicks")
			    .attr("y1", function(d) { return -1 * y(d); })
			    .attr("x1", x(-0.3))
			    .attr("y2", function(d) { return -1 * y(d); })
			    .attr("x2", x(0))

         
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