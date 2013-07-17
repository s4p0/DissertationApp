/// <reference path="jquery-1.9.1-vsdoc.js" />
/// <reference path="jquery-1.9.1.intellisense.js" />
/// <reference path="../cordova.js" />
/// <reference path="jquery.mobile-1.3.1.js" />
/// <reference path="knockout-2.2.1.debug.js" />
/// <reference path="knockout.mapping-latest.debug.js" />
/// <reference path="cordova.js" />



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
            ko.applyBindings(pictureViewModel, document.getElementById('picture'));
            ko.applyBindings(homeViewModel, document.getElementById('home'));
            ko.applyBindings(gpsViewModel, document.getElementById('gps'));
            ko.applyBindings(compassViewModel, document.getElementById('compass'));
            ko.applyBindings(optionsViewModel, document.getElementById('setup'));
            ko.applyBindings(homeViewModel, document.getElementById('result'));
        }
    }

    if (event.type == 'pagehide') {
        if (event.target['id'] == 'result') {
            //homeViewModel.save();
        }
    }
    if (event.type == 'pageshow') {
        if (event.target['id'] == 'home') {

           
        }

        if (event.target['id'] == 'result') {

        }
    }
});



$(document).bind('deviceready', function () {
    //window.localStorage.clear();
    

    var load = window.localStorage.getItem(key);
    if (load) {
        console.log(load);
        var json = JSON.parse(load);
        console.log(json);
        console.log('json[0]::' + JSON.stringify(json.entries[0]));

        homeViewModel.load(json);

        //homeViewModel = ko.mapping.fromJS(json, {}, entriesModel);
        //ko.applyBindings(homeViewModel, document.getElementById('home'));
        
    }
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


    self.CompassWrapper.orientation = ko.computed(function () {
        var heading = self.CompassWrapper.trueHeading();
        var index = (parseInt(heading) + 1) / 45;
        var point = self.compassPoinsts[Math.floor(index)];

        return point;
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

    self.serverPath = ko.observable('http://192.168.2.120:4000/mobile/upload/');

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

    self.clearEntries = function () {
        localStorage.clear();
        homeViewModel.entries.removeAll();
        homeViewModel.persist();
    };
}

var pictureModel = function () {
    var self = this;

    self.PictureWrapper = {
        uri: ko.observable('')
    };

    self.Orientation = ko.computed(function () {

    });

    self.TakePicture = function () {
        navigator.camera.getPicture(
            function (data) {
                self.PictureWrapper.uri(data);
                //console.log('pic::' + self.PictureWrapper.uri());

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

                //console.log(img);
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

    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = allBindingsAccessor().selectmenudisable();
        try {
            $(element).selectmenu(value);
        } catch (e) {

        }
    }
};
//selectmenudisable
ko.bindingHandlers.selectmenuenable = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = allBindingsAccessor().selectmenuenable();
        try {
            $(element).selectmenu(value);
        } catch (e) {

        }
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

var entriesModel = function () {
    var self = this;
    self.entries = ko.observableArray([]);
    self.selected = ko.observable({});

    self.load = function (data) {
        //ko.mapping.fromJS(data, {}, self);
        console.log('entries::' + data.entries.length);
        //self.entries(data.entries);

        for (var i = 0; i < data.entries.length; i++) {

            console.log('start');
            console.log('');
            console.log( JSON.stringify( data.entries[i] ));
            console.log('end');
            //var entry = ko.mapping.fromJS(data.entries[i], {'copy':['picture'], 'ignore': ['compass', 'gps','options']}, entryModel);
            entry = new entryModel();
            entry.load(data.entries[i]);
            self.entries.push( entry );
        }

        //console.log('loaded::' + self.entries().length);
        $('#entries').listview('refresh');
    }

    self.addEntry = function (entry) {
        self.entries.push(entry);
        $('#entries').listview('refresh');
    };

    self.removeEntry = function (entry) {
        console.log('before::' + self.entries().length);
        self.entries.remove(entry.selected());
        console.log('after::' + self.entries().length);
        $('#entries').listview('refresh');
        $('.ui-dialog').dialog('close');
    };

    self.save = function () {
        console.log('saved');
        //var result = new entryModel(compassViewModel, gpsViewModel, pictureViewModel, optionsViewModel);

        var result = new entryModel();
        result.store(compassViewModel, gpsViewModel, pictureViewModel, optionsViewModel);

        self.addEntry( ko.toJS( result ));
        self.persist();
    };

    self.persist = function () {
        var toSave = { entries: ko.toJS(self.entries) };
        window.localStorage.setItem(key, JSON.stringify(toSave));
        $.mobile.changePage('#home', { changeHash: false });
    };

    self.detail = function (entry) {
        console.log('::');
        console.log('::' + JSON.stringify(entry));

        //if (!entry.remove) {
        //    entry.remove = function (entry) {
        //        self.removeEntry(entry);
        //        console.log('removed');
        //        self.persist();
        //        $.mobile.changePage('#home');
        //    }
        //}
        self.selected(entry);
        ko.applyBindings(self, document.getElementById('detail'));
        $.mobile.changePage('#detail', { role: 'dialog' });
    }

    self.uploadOld = function () {
        console.log('upload...');
        var arr = self.entries();

        for (var i = 0; i < 1 /*arr.length*/; i++) {
            console.log('entry');
            var entry = ko.toJS(arr[i]);
            console.log(entry.picture);

            $('#image').removeWithDependents();

            var filePath = entry.picture;
            
            console.log('file::' + filePath);
            var serverPath = optionsViewModel.serverPath();

            var opt = new FileUploadOptions();
            opt.fileKey = 'file';
            opt.fileName = device.uuid + '_' + filePath.substr(filePath.lastIndexOf('/') + 1);
            opt.mimeType = 'image/jpeg';

            var par = {};
            par.entry = JSON.stringify(entry);

            opt.params = par;

            var ft = new FileTransfer();
            ft.chunckedMode = true;

            ft.onprogress = function (progressEvent) {
                console.log('onprogress');

            };
            ft.upload(filePath, encodeURI(serverPath), self.successUpload, self.failureUpload, opt);
        }
    }

    self.upload = function (currentValue) {

        

        console.log('type :: ' + typeof (currentValue));

        var pos = 0;

        if (typeof (currentValue) == 'number') {
            console.log('current ' + currentValue);
            pos = currentValue;
            pos++;
            console.log('pos alt :: ' + pos);
        }

        $('#message').popup('option', 'dismissible', false);
        $('#message h3').text('transferring... # ' + pos);
        $('#message').popup('option', 'positionTo', 'window');
        $('#message').popup('open');

        console.log('to upload : ' + pos);
        self.uploadEntry(pos);

    }

    self.finishUpload = function () {
        $('#entries').listview('refresh');
        
        $('#message').popup('option', 'dismissible', true);
        $('#message h3').text('completed!');
        $('#message').popup('option', 'positionTo', 'window');
        //$('#message').popup('close')

        console.log('finished');
    }

    self.errorUpload = function (pos) {
        console.log('error upload:: ' + pos);

        $('#message').popup('option', 'dismissible', true);
        $('#message h3').text('Error on # ' + pos);
        $('#message').popup('option', 'positionTo', 'window');
        //$('#message').popup('close')
        
    }

    self.uploadEntry = function (pos) {

        var position = pos;
        var current_entries = self.entries();

        var len = current_entries.length;
        console.log('len::' + len);


        if (position < len) {
            console.log('to upload more');

            // to upload more

            var koEntry = current_entries[pos];
            var entry = ko.toJS(koEntry);
            
            console.log('');
            console.log('json::' + JSON.stringify(entry));
            console.log('');
            //entry = JSON.parse(entry);

            console.log('entry  set');

            var filePath = entry.picture;
            console.log('file::' + filePath);
            var serverPath = optionsViewModel.serverPath();

            var opt = new FileUploadOptions();
            opt.fileKey = 'file';
            opt.fileName = device.uuid + '_' + filePath.substr(filePath.lastIndexOf('/') + 1);
            opt.mimeType = 'image/jpeg';

            device = {
                version: device.cordova,
                cordova: device.cordova,
                platform: device.platform,
                uuid: device.uuid,
                model: device.model
            };

            var json_entry = JSON.stringify(entry);
            var json_device = JSON.stringify(device);

            console.log(json_device);
            //opt.params = { entry: json_entry, 'device': json_device };
            opt.params = new Object();
            opt.params.entry = escape(json_entry);
            opt.params.device = escape(json_device);

            //opt.params = { entry: ko.toJSON(entry) };

            var ft = new FileTransfer();
            ft.upload(
                filePath,
                encodeURI(serverPath),
                //self.successUpload, // added
                //self.failureUpload, // added

                function (data) {
                    if (data.response.result !== 'sucess') {
                        console.log('up suc of ' + position);
                        console.log('code::' + data.responseCode);
                        console.log('bytes::' + data.bytesSent);
                        console.log('response::' + data.response);
                        koEntry.sync(true);

                        self.upload(position);
                    } else {
                        self.errorUpload(position);
                    }
                },

                function (err) {
                    console.log('err' + JSON.stringify(err));
                    self.errorUpload(position);
                },
                opt);


        } else {
            // finish
            self.finishUpload();
        }
    }

    self.successUpload = function (data) {
        console.log('code::' + data.responseCode);
        console.log('bytes::' + data.bytesSent);
        console.log('response::' + data.response);
    }

    self.failureUpload = function (data) {
        console.log('error::' + JSON.stringify(data));
    }

}

var key = 'data';
var homeViewModel = new entriesModel();
var pictureViewModel = new pictureModel();
var optionsViewModel = new optionsModel();
var compassViewModel = new compassModel();
var gpsViewModel = new GPSModel();
var orientation = window.orientationchange;
var device = null;

var entryModel = function () {
    var self = this;
    self.compass = ko.observable();
    self.picture = ko.observable();
    self.gps = ko.observable();
    self.options = ko.observable();

    self.store = function (compass, gps, picture, options) {
        self.compass(ko.toJS(compass.CompassWrapper));
        self.gps(ko.toJS(gps.GPSWrapper))
        self.picture(ko.toJS(picture.PictureWrapper.uri()));
        self.options(ko.toJS(options));
    };


    self.load = function (data) {
        self.compass = data.compass;
        self.picture = data.picture;
        self.options = data.options;
        self.gps = data.gps;

        self.sync(data.sync);

        self.date = data.date;
    }

    self.sync = ko.observable(false);

    var now = new Date();

    self.date = now.getFullYear() + '-' +
                now.getMonth() + '-' +
                now.getDay() + ' ' +
                now.getHours() + ':' +
                now.getMinutes() + ':' +
                now.getSeconds();

    self.status = ko.computed(function () {
        var value = self.sync();
        if (value)
            return 'check';
        return 'delete';
    });
};


ko.bindingHandlers.listupdate = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        //var value = valueAccessor();
        //$(window).bind('orientationchange', function (event, ui) {
        //    console.log('orientation changed');
        //    value();
        //});
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        try {
            $(element).parents('ul').listview('refresh');
            $(element).parents('li').buttonMarkup({ icon: valueAccessor() });
        } catch (e) {

        }
    }
};


