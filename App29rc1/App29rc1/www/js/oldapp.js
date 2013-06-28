/// <reference path="jquery-1.9.1-vsdoc.js" />
/// <reference path="jquery-1.9.1.intellisense.js" />
/// <reference path="../cordova.js" />
/// <reference path="jquery.mobile-1.3.1.js" />
/// <reference path="knockout-2.2.1.debug.js" />






$(document).bind('deviceready', function () {
    console.log('>>device is ready<<');

    window.onerror = function (errmsg, filename, ln) {
        window.external.notify("jserror : " + errmsg +
                ", in file : " + filename +
                ", at line number:" + ln);
    }

    //var setup = new setupViewModel();
    //ko.applyBindings(setup, document.getElementById('setup'));

    //var cam = new cameraViewModel();
    //ko.applyBindings(cam, document.getElementById('camera'));

    //var setup = new setupViewModel();
    //ko.applyBindings(setup, document.getElementById('setup'));

    //var cam = new cameraViewModel();
    //ko.applyBindings(cam, document.getElementById('camera'));

});

$(document).bind('pagecreate pageinit pagebeforeshow pagebeforehide pageshow', function (event, ui) {
    console.log('event type::' + event.type);
    console.log('event target::' + event.target['id']);
    if (event.type == 'pagebeforeshow' && event.target['id'] === 'camera') {
        var cam = new cameraViewModel();
        ko.applyBindings(cam, document.getElementById('camera'));
    }

    if (event.type == 'pagebeforehide' && event.target['id'] === 'camera') {
    }

    if (event.type == 'pagecreate' && event.target['id'] === 'index') {
        try {
            var setup = new setupViewModel();
            ko.applyBindings(setup, document.getElementById('setup'));


        } catch (err) {
            console.log(err);
        }
    }

    if (event.type == 'pageinit' && event.target['id'] === 'index') {
        console.log('page index initted');
    }
});

var compassViewModel = function () {
    var self = this;

    self.magneticHeading = ko.observable();
    self.trueHeading = ko.observable();
    self.headingAccuracy = ko.observable();
    self.timestamp = ko.observable();
    self.error = ko.observable(true);
    self.orientation = ko.observable(0);
    self.compassPoinsts = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    self.errorMSG = ko.observable('initializing...');

    self.Orientation = ko.computed(function () {
        var value = self.orientation();
        return value ? value : "unknown";
    });

    self.MagneticHeading = ko.computed(function () {
        var value = self.magneticHeading();
        return value ? value : "unknown";
    });

    self.TrueHeading = ko.computed(function () {
        var value = self.trueHeading();
        return value ? value : "unknown";
    });

    self.HeadingAccuracy = ko.computed(function () {
        var value = self.headingAccuracy();
        return value ? value : "unknown";
    });

    self.Timestamp = ko.computed(function () {
        var value = self.timestamp();
        return value ? value : "unknown";
    });

    self.update = function (data) {
        self.error(false);
        self.magneticHeading(data.magneticHeading);
        self.trueHeading(data.trueHeading);
        self.headingAccuracy(data.headingAccuracy);
        self.timestamp(data.timestamp);

        var x = Math.floor((data.trueHeading + 1) / 45);
        self.orientation(self.compassPoinsts[x]);
    }

    self.updateError = function (err) {
        //self.error(err);
        self.error(true);
        switch (err.code) {
            case 20:
                self.errorMSG('Not Supported');
                break;
            case 4:
                self.errorMSG("Couldn't initialize");
                break;
            default:
                self.errorMSG('compass error');
                break;
        }
        //self.errorMSG('error::' + err.code);
    }

    self.log = function () {
        console.log('compass log');
    }
}

var gpsViewModel = function () {
    var self = this;

    self.latitude = ko.observable();
    self.longitude = ko.observable();
    self.altitude = ko.observable();
    self.accuracy = ko.observable();
    self.altitudeAccuracy = ko.observable();
    self.heading = ko.observable();
    self.speed = ko.observable();
    self.timestamp = ko.observable();
    self.error = ko.observable(true);
    self.errorMSG = ko.observable('initializing...');

    self.Timestamp = ko.computed(function () {
        var value = self.timestamp();
        return value ? value : "unknown";
    });

    self.Speed = ko.computed(function () {
        var value = self.speed();
        return value ? value : "unknown";
    });

    self.Heading = ko.computed(function () {
        var value = self.heading();
        return value ? value.toFixed(2) : "unknown";
    });

    self.AltitudeAccuracy = ko.computed(function () {
        var value = self.altitudeAccuracy();
        return value ? value.toFixed(3) : "unknown";
    });

    self.Accuracy = ko.computed(function () {
        var value = self.accuracy();
        return value ? value.toFixed(3) : "unknown";
    });

    self.Longitude = ko.computed(function () {
        var value = self.longitude();
        return value ? value.toFixed(6) : "unknown";
    });

    self.Latitude = ko.computed(function () {
        var value = self.latitude();
        return value ? value.toFixed(6) : "unknown";
    });

    self.Altitude = ko.computed(function () {
        var value = self.altitude();
        return value ? value.toFixed(3) : "unknown";
    });

    self.update = function (data) {
        self.error(false);
        self.latitude(data.coords.latitude);
        self.longitude(data.coords.longitude);
        self.altitude(data.coords.altitude);
        self.accuracy(data.coords.accuracy);
        self.altitudeAccuracy(data.coords.altitudeAccuracy);
        self.heading(data.coords.heading);
        self.speed(data.coords.speed);
        self.timestamp(data.timestamp);
    }

    self.updateError = function (err) {
        //self.error(err);
        self.errorMSG('error::' + err.code);
    }

    self.log = function () {
        console.log('gps log');
    }
}


var cameraViewModel = function () {
    var self = this;
    self.gps = {
        watch: null,
        data: null,
        mvvm: false
    }

    self.compass = {
        watch: null,
        data: null,
        mvvm: false
    }

    self.initialize = function () {
        console.log('cameraViewModel initializing...');
    }

    self.startGPS = function () {
        if (self.gps.watch) {
            navigator.geolocation.clearWatch(gps.watch);
            self.gps.watch = null;
        }

        navigator.geolocation.watchPosition(
            function (data) {
                self.gps.data = data;
                console.log('gps received');
                if (self.gps.mvvm) {
                    self.gps.mvvm.update(data);
                }
            },
            function (error) {
                self.gps.mvvm.updateError(error);
                //gps.mvvm.updateError(error.message);
                console.log('gps error::' + error.code);
                //stopGPS();
            },
            { maximumAge: 3000, timeout: 10000, enableHighAccuracy: true });


        self.gps.mvvm = new gpsViewModel();
        //ko.applyBindings(gps.mvvm, document.getElementById('gps'));
    }

    self.stopGPS = function () {
        navigator.geolocation.clearWatch(self.gps.watch);
        self.gps.watch = null;
    }

    self.startCompass = function () {
        if (self.compass.watch) {
            navigator.compass.clearWatch(self.compass.watch);
            self.compass.watch = null;
        }

        self.compass.watch = navigator.compass.watchHeading(
            function (data) {
                self.compass.data = data;
                if (self.compass.mvvm) {
                    self.compass.mvvm.update(data);
                }
            },
            function (error) {
                self.compass.mvvm.updateError(error);
                console.log('compass error::' + error.code);
                self.stopCompass();

            }, { frequency: 400 });

        self.compass.mvvm = new compassViewModel();
        //ko.applyBindings(compass.mvvm, document.getElementById('compass'));
    }

    self.stopCompass = function () {
        navigator.compass.clearWatch(self.compass.watch);
        self.compass.watch == null;
    }


    self.start = function () {
        //self.startCompass();
        self.startGPS();
    }

    self.stop = function () {
        self.stopCompass();
        self.stopGPS();
    }

    self.initialize();
}

var setupViewModel = function () {
    var self = this;
    self.compassMode = ko.observable('auto');
    self.compassUpdate = ko.observable(300);
    self.gpsUpdate = ko.observable(800);
    self.gpsTimeout = ko.observable(3000);

    self.update = function () {

    }

    self.load = function () {
        //var setupData = window.localStorage.getItem('setup');
    }

    self.initialize = function () {
        self.load();
        console.log('setupViewModel initted');
    }

    self.CompassMode = ko.computed(function () {
        return self.compassMode();
    });

    self.initialize();
}