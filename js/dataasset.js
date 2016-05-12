$(document).ready(function() {
    var b = {};
    b.numpoints = 60;
    b.chart = {};
    b.dataUpdateIntervalSecs = 65;
    b.data = {};
    b.selectedSensor = "intpressure";
    $("input[id=radio-default]").attr("checked", true);
    b.colours = {
	intpressure: "#ee0000",
        extpressure: "#009933",
        inttemperature: "#00e810",
	exttemperature: "#707070",
        humidity: "#0099cc",
        shockX: "#6633cc",
        shockY: "#c71585",
        shockZ: "#ee6000",

    };
    b.sensorName = {
        intpressure: "internal pressure",
	extpressure : " external pressure",
	inttemperature: "internal temperature",
	exttemperature: "external temperature",
	humidity : "humidity",
	shockX : "shock X",
	shockY : "shock Y",
	shockZ : "shock Z",

    };
    b.sensorUnits = {
	intpressure: "mBar",
        extpressure: "Bar",
        inttemperature: "°C",
        exttemperature: "°C",
        humidity: "%",
        shockX: "g",
        shockY: "g",
        shockZ: "g",

    };
    
    // Asset sensors will be defined here and instead of looping over colors I'll loop over asset sensors.
    // b.assetsensors will be used as a loop to read data from returned jSON response. so comment those fields which are not in JSON response of API
    b.assetsensors = {
	intpressure : "intpressure",
	extpressure : " extpressure",
	inttemperature: "inttemperature",
	exttemperature: "exttemperature",
	humidity : "humidity",
	shockX : "shockX",
	shockY : "shockY",
	shockZ : "shockZ",
    }

    b.jqc = {};
    b.jqc.txt = {};
    b.jqc.txt.tableheading = $("#table-heading");
    b.jqc.txt.tblintpressure = $("#tbl-intpressure");
    b.jqc.txt.tblextpressure = $("#tbl-extpressure");
    b.jqc.txt.tblinttemperature = $("#tbl-inttemperature");
    b.jqc.txt.tblexttemperature = $("#tbl-exttemperature");
    b.jqc.txt.tblhumidity = $("#tbl-humidity");
    b.jqc.txt.tblshockX = $("#tbl-shockX");
    b.jqc.txt.tblshockY = $("#tbl-shockY");
    b.jqc.txt.tblshockZ = $("#tbl-shockZ");
    

    //We have defined a lot of variables. Now we simply call a function f().
    // f() uses Highcharts to plot a chart 
    $("input[name=radio-plot]").change(function() {// This is the event handler for radio button changes.
	// When a radio button changes value,$(this) refers to the radio button whose value changed.

        b.selectedSensor = $(this).val(); // The jQuery selector ("input[name=radio-plot]") selects the inputs whose name is 'radio-plot'.
        f()
    });
    Date.prototype.AddSeconds = function(i) {
        this.setSeconds(this.getSeconds() + i, this.getMilliseconds());
        return this
    };

    function e(i) {
	/*This function is called with one argugment i which is a string of date and time in 
	 ISO 8601 Format. e.g "2014-09-26T10:20:08Z"*/
        var k, j;
        k = i;
        k = k.replace(/\D/g, " ");
	/* We replace the delimiters like (-,:,T,Z) from the ISO 8601 format with simple spacec
	 The string now becomes  "2014 09 26 10 20 08 "*/
        j = k.split(" ");
	/*Now we split the string on spaces to get a list of strings
	 j = ["2014", "09", "26", "10", "20", "08", ""]*/
        j[1] --;
	/* This step decremented the 'month' of the date. Now sure why it was needed.
	 It also changed the type of 'month' data from String to Integer*/
        return new Date(Date.UTC(j[0], j[1], j[2], j[3], j[4], j[5]))
	//retruns a new date object  "Fri Sep 26 2014 11:20:08 GMT+0100 (BST)"
    }

    function h(m) {
        var l = 0,
            k = 0;
        for (; l < b.data.time.length; l++) {
            if (m <= b.data.time[l]) {
                break
            }
        }
        if (l == 0) {
            k = 0
        } else {
            if (Math.abs(b.data.time[l] - m) < Math.abs(b.data.time[l - 1] - m)) {
                k = l
            } else {
                k = l - 1
            }
        }
        return k
    }
    g();

    function g() {
	//g() sets up some timers and hence will execute periodically.

        var i = "/js/assetdata.json";
        $.getJSON(i, function(j) {//getJSON is used to read JSON data from the web sever. The second 
	    /* The second argument is anonymous function with one argument. This is a call back function
	     that will be called when the response from server is received. The response is unmarshalled 
	    into a JS object and assigned to the argument of function being passed to getJSON. Inside the anonymous function
	    we can manipulate the received JSON data as a javascript object. Here we set up a timer and call 
	     other function to manipulate data */
            b.serverDatasets = j.datasets;
	    b.assetdate      = j.assetdate; // assign date to global variable for safekeeping
            c(j, null);
            a();
            setTimeout(function() {
            }, b.dataUpdateIntervalSecs * 1000); // timeout specified in ms. To wait for n secnods specify n*1000.
            setTimeout(f, 0); //f() is called to plot data using HighCharts.js
            /*setTimeout(function() {
                d(b.data.time[b.data.time.length - 1])
            }, 0);*/
	    // I comment the above timeout because it tries to load a new image every minute, which we don't need.
        })
    }

    function c(k, l) {
        var j;
        b.datasetsInRange = k.datasets;
        dt = e(k.startdate); // e() being called only here.
	/*e() transforms date from ISO 8601 format to usual date time format.
	 It transforms "2014-09-26T10:20:08Z"  to "Fri Sep 26 2014 11:20:08 GMT+0100 (BST)" */
        dt_ms = dt.getTime();
	/*dt_ms is the date and time in milisecond format*/
        
	b.data.time = k.seconds;
	/*This is a list of times in seconds over which the samples were taken
	[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720] */
	
        for (j = 0; j < b.data.time.length; j++) {
            b.data.time[j] = dt_ms + b.data.time[j] * 1000
	    /* Here we convert the sample time series from reference '0' to a standard reference.
	     All times are converted to date time format in miliseconds after a set reference.*/
        }

	
	/*The following loop was over b.colours, I have changed it to b.assetsensors*/
        for (sensor in b.assetsensors) {
            b.data[sensor] = $.map(b.data.time, function(m, i) {
                return [
                    [m, k[sensor][i] / 100]
                ]
            })
        }
	/* jQuery.map(array, func(elem,index)) ---  jQuery.map will apply a function to each element of an array or object.
	 The applied function takes two arguments. First argument is the element of array and the second is the index of element in array.
	Here we use time array as a mapper to map time and sensed values to a list of lists. Each list contains time as first element 
	and the sensed data as the second element*/
        if (l != null) {
            setTimeout(l, 0) /*We call this function with l=NULL, so nothing happens here in our case*/
        }
    }
     
    //I will comment out the function d() which loads images which are not needed in our case 


    function a() {
        var m, n, i, q, r, l, k, p, j, o;
        m = new Date(Date.parse(b.assetdate));
	/*Get date for table heading to show the user the last time the data was updated.
	 note that we read the data from the end of file backwards. 
	In the following we pickup the last values of sensor readings which lies
	at the end of array. So [length -1] will be commonly seen.*/
        (b.jqc.txt.tableheading).text("This data will not be updated in future. This is a snapshot.");
        /*Updated the table heading*/
	/*After the loop was changed from b.colours to b.assetsensors in function c()
	 The following code brok because it no longer has any data associated to it*/
	intpressure = b.data.intpressure[b.data.intpressure.length - 1][1];
        extpressure = b.data.extpressure[b.data.extpressure.length - 1][1];
	inttemperature= b.data.inttemperature[b.data.inttemperature.length - 1][1];
	exttemperature= b.data.exttemperature[b.data.exttemperature.length - 1][1];
        humidity = b.data.humidity[b.data.humidity.length - 1][1];
        shockX = b.data.shockX[b.data.shockX.length - 1][1];
        shockY = b.data.shockY[b.data.shockY.length - 1][1];
        shockZ = b.data.shockZ[b.data.shockZ.length - 1][1];
        /*Finished reading the latest values of sensor data*/
	/*Now */
        (b.jqc.txt.tblintpressure).text(intpressure.toFixed(2));
        (b.jqc.txt.tblinttemperature).text(inttemperature.toFixed(2));
        (b.jqc.txt.tblextpressure).text(extpressure.toFixed(2));
        (b.jqc.txt.tblexttemperature).text(exttemperature.toFixed(2));
	
        (b.jqc.txt.tblhumidity).text(humidity.toFixed(2));
        (b.jqc.txt.tblshockX).text(shockX.toFixed(2));
        (b.jqc.txt.tblshockY).text(shockY.toFixed(2));
        (b.jqc.txt.tblshockZ).text(shockZ.toFixed(2));
        //(b.jqc.txt.tblTurbidity).text(l.toFixed(2));
        //(b.jqc.txt.tblAcoustic).text(k.toFixed(2));
        //(b.jqc.txt.tblChloro).text(p.toFixed(2));
        //(b.jqc.txt.tblFlowspd).text(j.toFixed(2));
        //(b.jqc.txt.tblFlowdir).text(o.toFixed(2));
        (b.jqc.txt.tableheading).attr("class", "alert alert-success pagination-centered");
        setTimeout(function() {
	    /*Another timeout function. It updates the table heading on top to reflect the time of latest sensor data available*/
            (b.jqc.txt.tableheading).attr("class", "alert pagination-centered")
        }, 2000)
    }

    function f() {
        if ($.isEmptyObject(b.chart) == false) {
            b.chart.destroy()
        } //Destroy the old chart so that a new one can be plotted.
       
	//Create a new chart.

        b.chart = new Highcharts.Chart({
            chart: {
                renderTo: "highcharts-container-for-asset", //Select container by ID.
                type: "spline"//, 
                //marginRight: 10
            },
            title: {
                text: b.sensorName[b.selectedSensor] + " (" + b.sensorUnits[b.selectedSensor] + ")",
                style: {
                    color: "#003145"
                }
            },
            credits: {
                enabled: false
            },
            colors: [b.colours[b.selectedSensor]],
            xAxis: {
                type: "datetime",
		labels: {
                    
                    style: {
                        color: b.colours[b.selectedSensor]
                    }
                },
                lineColor: b.colours[b.selectedSensor],
                lineWidth: 1,
		title:{
		    text: 'Time',
		    style: {
                        color: b.colours[b.selectedSensor]
                    }

		},
            },
            yAxis: {
                title: {
                    text: b.sensorName[b.selectedSensor],
                    style: {
                        color: b.colours[b.selectedSensor]
                    }
                },
                labels: {
                    align: "left",
                    x: 8,
                    y: -4,
                    style: {
                        color: b.colours[b.selectedSensor]
                    }
                },
                lineColor: b.colours[b.selectedSensor],
                lineWidth: 1,
                offset: 0
            },
            tooltip: {
                formatter: function() {
                    return Highcharts.dateFormat("%A, %b %d, %H:%M:%S UTC", this.x) + '<br/><span style="color:' + this.series.color + '; font-weight:bold;">' + b.sensorName[b.selectedSensor] + "</span>  <b>" + Highcharts.numberFormat(this.y, 2) + "</b> " + b.sensorUnits[b.selectedSensor]
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: b.sensorName[b.selectedSensor] + " (" + b.sensorUnits[b.selectedSensor] + ")",
                data: b.data[b.selectedSensor]
            }]
        })
    }

    // The new code for highcharts tes 
      /*var chart1 = new Highcharts.Chart({
        chart: {
            renderTo: 'highcharts-asset',
            type: 'bar'
        },
        title: {
            text: 'Test chart for Asset Monitor'
        },
        xAxis: {
            categories: ['Temperature', 'Pressure', 'Humidity']
        },
        yAxis: {
            title: {
                text: 'Daily Values'
            }
        },
        series: [{
            name: 'Monday',
            data: [11.5, 0.998, 45]
        }, {
            name: 'Tuesday',
            data: [10.2, 0.987, 53]
        }, {
            name: 'Wednesday',
            data: [13.4, 0.999, 60]
        }]
    });*/

});
