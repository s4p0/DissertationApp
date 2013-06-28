/// <reference path="jquery-1.9.1-vsdoc.js" />
/// <reference path="jquery-1.9.1.intellisense.js" />
/// <reference path="../cordova.js" />
/// <reference path="jquery.mobile-1.3.1.js" />
/// <reference path="knockout-2.2.1.debug.js" />



var model = function () {
    self = this;

    self.hasInit = false;

    self.items = ko.observableArray([]);
    self.init = function () {
        if (self.hasInit) return;
        var icons = ['check', 'home', 'bars'];
        for (var i = 0; i < 13; i++) {
            self.items.push({ name: 'Entry#' + i, status: icons[i % icons.length] });
        }
        self.hasInit = true;
    }

    self.addItem = function (entry) {
        self.items.push(entry);
    }
}

$(document).bind('pagebeforeshow pagebeforehide pageinit pagebeforecreate pageshow pagehide', function (event, ui) {
    console.log('type::' + event.type + ' target::' + event.target['id']);

    if (event.type == 'pagebeforeshow') {

        if (event.target['id'] == 'picture') {
            pictureViewModel = new pictureModel();
            $('#image').removeWithDependents();
        }

        if (event.target['id'] == 'gps') {
            console.log('gps-options::' + ko.toJSON(optionsViewModel.GPSOptions));

            gpswatch = navigator.geolocation.watchPosition(
                function (data) {
                    gpsViewModel.UpdateValues(data);
                    console.log('gps received');
                },
                function (error) {
                    gpsViewModel.SetErrorMessage(error);
                    console.log('gps error');
                }, ko.toJS(optionsViewModel.GPSOptions));
        }

        if (event.target['id'] == 'compass') {

            compasswatch = navigator.compass.watchHeading(
                function (data) {
                    compassViewModel.UpdateValues(data);
                    console.log('compass received');
                },
                function (error) {
                    compassViewModel.SetErrorMessage(error);
                    console.log('compass error');
                }, ko.toJS(optionsViewModel.CompassOptions));

            console.log('compass-options::' + ko.toJSON(optionsViewModel.CompassOptions));
        }
    }

    if (event.type == 'pagebeforehide') {
        if (event.target['id'] == 'gps') {
            navigator.geolocation.clearWatch(gpswatch);
            gpswatch = null;
        }
        if (event.target['id'] == 'compass') {
            if (compasswatch) {
                navigator.compass.clearWatch(compasswatch);
                compasswatch = null;
            }
        }
    }

    if (event.type == 'pageinit') {

    }

    if (event.type == 'pagebeforecreate') {
        if (event.target['id'] == 'home') {
            console.log('binding...');


            pictureViewModel = new pictureModel();
            ko.applyBindings(pictureViewModel, document.getElementById('picture'));
            ko.applyBindings(mo, document.getElementById('entries'));
            ko.applyBindings(gpsViewModel, document.getElementById('gps'));
            ko.applyBindings(compassViewModel, document.getElementById('compass'));
            ko.applyBindings(optionsViewModel, document.getElementById('setup'));

        }
    }

    if (event.type == 'pagehide') {
        if (event.target['id'] == 'picture') {
            
        }
    }
    if (event.type == 'pageshow') {
        if (event.target['id'] == 'home') {
        }
    }
    
});

$(document).bind('deviceready', function () {

    //window.localStorage.clear();

    //var today = new Date();
    //var key = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDay();
    //console.log('key::' + key);

    //if (!window.localStorage.getItem(key)) {
    //    window.localStorage.setItem(key, mo);
    //    console.log(JSON.stringify(mo));
    //} else {
    //    $('#entries').listview('destroy');


    //    self.init($('#entries'));
    //}

    //console.log('device ready');
    //var len = window.localStorage.length;
    //for (var i = 0; i < len; i++) {
    //    var x = window.localStorage.key(i);
    //    console.log(i + ' .rkey::' + x);
    //}

});

var compassModel = function () {
    var self = this;

    self.hasError = ko.observable(true);
    self.errorMessage = ko.observable('initializing...');
    self.compassPoinsts = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    self.CompassWrapper = {
        magneticHeading: ko.observable(0),
        trueHeading: ko.observable(0),
        headingAccuracy: ko.observable(0),
        timestamp: ko.observable(0)
    };

    //self.orientation = ko.observable(0);

    self.CompassWrapper.orientation = ko.computed(function () {
        var heading = self.CompassWrapper.trueHeading();
        var index = (parseInt(heading) + 1) / 45;
        var point = self.compassPoinsts[Math.floor(index)];

        return point;

        //console.log(self.trueHeading());
        //var x = Math.floor((self.trueHeading() + 1) / 45);
        //console.log(x);
        //return self.compassPoinsts[x];
    });

    self.IsEnabled = ko.computed(function () {
        if (optionsViewModel.CompassOptions.IsEnabled())
            return true;
        return false;
    });

    self.CompassWrapper.useManual = ko.computed(function () {
        if (optionsViewModel.CompassOptions.IsEnabled())
            return "disable";
        return "enable";
    });

    ////self.MagneticHeading = ko.computed(function () {
    ////    var value = self.CompassWrapper.magneticHeading();
    ////    return value ? value : "unknown";
    ////});

    ////self.TrueHeading = ko.computed(function () {
    ////    var value = self.CompassWrapper.trueHeading();
    ////    return value ? value : "unknown";
    ////});

    ////self.HeadingAccuracy = ko.computed(function () {
    ////    var value = self.CompassWrapper.headingAccuracy();
    ////    return value ? value : "unknown";
    ////});

    ////self.Timestamp = ko.computed(function () {
    ////    var value = self.CompassWrapper.timestamp();
    ////    return value ? value : "unknown";
    ////});

    self.UpdateValues = function (data) {
        self.hasError(false);
        self.CompassWrapper.magneticHeading(data.magneticHeading);
        self.CompassWrapper.trueHeading(data.trueHeading);
        self.CompassWrapper.headingAccuracy(data.headingAccuracy);
        self.CompassWrapper.timestamp(data.timestamp);
        console.log('updating compass');
    }

    self.SetErrorMessage = function (err) {
        self.hasError(true);
        self.errorMessage(err);
    }

}

var GPSModel = function () {

    var self = this;

    self.hasError = ko.observable(true);
    self.errorMessage = ko.observable('initializing...');
    self.GPSWrapper = {
        latitude: ko.observable(0),
        longitude: ko.observable(0),
        altitude: ko.observable(0),
        accuracy: ko.observable(0),
        altitudeAccuracy: ko.observable(0),
        heading: ko.observable(0),
        speed: ko.observable(0),
        timestamp: ko.observable(0)
    };



    self.Timestamp = ko.computed(function () {
        var value = self.GPSWrapper.timestamp();
        return value ? value : "unknown";
    });

    self.Speed = ko.computed(function () {
        var value = self.GPSWrapper.speed();
        return value ? value : "unknown";
    });

    self.Heading = ko.computed(function () {
        var value = self.GPSWrapper.heading();
        return value ? value.toFixed(2) : "unknown";
    });

    self.AltitudeAccuracy = ko.computed(function () {
        var value = self.GPSWrapper.altitudeAccuracy();
        return value ? value.toFixed(3) : "unknown";
    });

    self.Accuracy = ko.computed(function () {
        var value = self.GPSWrapper.accuracy();
        return value ? value.toFixed(3) : "unknown";
    });

    self.Longitude = ko.computed(function () {
        var value = self.GPSWrapper.longitude();
        return value ? value.toFixed(6) : "unknown";
    });

    self.Latitude = ko.computed(function () {
        var value = self.GPSWrapper.latitude();
        return value ? value.toFixed(6) : "unknown";
    });

    self.Altitude = ko.computed(function () {
        var value = self.GPSWrapper.altitude();
        return value ? value.toFixed(3) : "unknown";
    });

    self.UpdateValues = function (data) {
        self.hasError(false);
        self.GPSWrapper.latitude(data.coords.latitude);
        self.GPSWrapper.longitude(data.coords.longitude);
        self.GPSWrapper.altitude(data.coords.altitude);
        self.GPSWrapper.accuracy(data.coords.accuracy);
        self.GPSWrapper.altitudeAccuracy(data.coords.altitudeAccuracy);
        self.GPSWrapper.heading(data.coords.heading);
        self.GPSWrapper.speed(data.coords.speed);
        self.GPSWrapper.timestamp(data.timestamp);
    }

    self.SetErrorMessage = function (err) {
        self.hasError(true);
        self.errorMessage(err);
    }
}

var optionsModel = function () {
    var self = this;
    self.GPSOptions = {
        accuracy: ko.observable("yes"),
        maximumAge: ko.observable(300),
        timeout: ko.observable(5000)
        //enableHighAccuracy: ko.observable(true)
        //enableHighAccuracy: ko.computed(function () {
        //    return true;
        //})
    };

    self.GPSOptions.enableHighAccuracy = ko.computed(function () {
        return self.GPSOptions.accuracy() === "yes";
    });

    self.SetGPSMaximumAge = function (value) {
        self.GPSOptions.maximumAge(value);
    };

    self.SetGPSTimeout = function (value) {
        self.GPSOptions.timeout(value);
    };

    self.SetGPSEnableHighAccuracy = function (value) {
        self.GPSOptions.enableHighAccuracy(value);
    };

    self.CompassOptions = {
        frequency: ko.observable(800),
        enabled: ko.observable('true')
    };

    self.CompassOptions.IsEnabled = ko.computed(function () {
        return self.CompassOptions.enabled() === "true";
    });

    self.SetCompassFrequency = function (value) {
        self.CompassOptions.frequency(value);
    };

    self.SetCompassMode = function (value) {
        console.log('SetCompassMode::' + value);
        self.CompassOptions.mode(value);
    };

    self.PictureOptions = {
        quality: ko.observable(75),
        destinationType: 1, // Camera.DestinationType.FILE_URI;
        //a: Camera
        sourceType: 1, // Camera.PictureSourceType.CAMERA;
        //allowEdit : true,
        //encodingType: Camera.EncodingType.JPEG,
        //targetWidth: 100,
        //targetHeight: 100,
        //popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true,
        cameraDirection: 0 // Camera.Direction.BACK;
    };
}

var pictureModel = function () {
    var self = this;

    self.PictureWrapper = {
        uri: ''
    };

    self.Orientation = ko.computed(function () {
        
    });

    self.TakePicture = function () {
        navigator.camera.getPicture(
            function (data) {
                self.PictureWrapper.uri = data;
                console.log('pic::' + self.PictureWrapper.uri);

                var elem = $('#image');
                var width = $(window).width() - 60 + "px";
                if (elem[0] == undefined) {
                    var width = $(window).width() - 60 + "px";
                    var picbtn = $('#picture-takepicture');
                    var img = '<img id="image" src="' + data + '" width="' + width + '"/>';
                    $(img).insertAfter(picbtn);
                } else {
                    elem.attr('src', data);
                    elem.attr('width', width);
                }
                
                console.log(img);
            },
            function (error) {
                console.log('picture error');

                console.error(error);
            }, ko.toJS(optionsViewModel.PictureOptions));
    };

    self.UpdateWidth = function () {

        console.log('orientation');

        var elem = $('#image');
        if (elem[0] != undefined) {
            console.log('has');
            var width = $(window).width() - 60 + "px";
            elem.width(width);
        }
    };
}


$(document).bind('slidestop', function (eventy, ui) {
    var x = 0;
});

var mo = new model();
//mo.init();
var gpswatch = null;
var compasswatch = null;





ko.bindingHandlers.slider = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        $(document).bind('slidestop', function (event, ui) {
            if (event.target['id'] == element.id) {
                var val = event.target.value;
                value(val);
            }
        });

        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = allBindingsAccessor().slider();
        $(element).attr('value', value);
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
    }
};

ko.bindingHandlers.flipswitch = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        $(document).bind('slidestop', function (event, ui) {
            if (event.target['id'] == element.id) {
                var val = event.target.value;
                value(val);
            }
        });

        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = allBindingsAccessor().flipswitch();
        var oldValue = $(element).val();
        if (value !== oldValue) {
            $(element).val(value);
            try {
                $(element).slider('refresh');
            } catch (e) {
                var x = 0;
            }
        }
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
    }
};

ko.bindingHandlers.selectmenu = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        $(document).bind('change', function (event, ui) {
            if (event.target['id'] == element.id) {
                var val = event.target.value;
                value(val);
            }
        });

        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = allBindingsAccessor().selectmenu();
        var oldValue = $(element).val();
        if (value !== oldValue) {
            $(element).val(value);
            try {
                $(element).selectmenu('refresh');
            } catch (e) {
                var x = 0;
            }
        }
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
    }
};

//selectmenudisable

ko.bindingHandlers.selectmenudisable = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        //var value = valueAccessor();
        //$(document).bind('change', function (event, ui) {
        //    if (event.target['id'] == element.id) {
        //        var val = event.target.value;
        //        value(val);
        //    }
        //});

        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = allBindingsAccessor().selectmenudisable();
        try {
            $(element).selectmenu(value);
        } catch (e) {

        }


        //var oldValue = $(element).val();
        //if (value !== oldValue) {
        //    $(element).val(value);
        //    try {
        //        $(element).selectmenu('refresh');
        //    } catch (e) {
        //        var x = 0;
        //    }
        //}
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
    }
};
//selectmenudisable
ko.bindingHandlers.selectmenuenable = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        //var value = valueAccessor();
        //$(document).bind('change', function (event, ui) {
        //    if (event.target['id'] == element.id) {
        //        var val = event.target.value;
        //        value(val);
        //    }
        //});

        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = allBindingsAccessor().selectmenuenable();
        try {
            $(element).selectmenu(value);
        } catch (e) {

        }


        //var oldValue = $(element).val();
        //if (value !== oldValue) {
        //    $(element).val(value);
        //    try {
        //        $(element).selectmenu('refresh');
        //    } catch (e) {
        //        var x = 0;
        //    }
        //}
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
    }
};
//orientationChanged
ko.bindingHandlers.orientation = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        $(window).bind('orientationchange', function (event, ui) {
            console.log('orientation changed');
            value();
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
    }
};

var pictureViewModel = null;
var optionsViewModel = new optionsModel();
//var pictureViewModel = new pictureModel();
var compassViewModel = new compassModel();
var gpsViewModel = new GPSModel();
var orientation = window.orientationchange;