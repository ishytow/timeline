require.config({
    baseUrl: './',
    noGlobal: true,
    shim: {
        handlebars: {
            exports: 'Handlebars'
        },
        shim : {
            "bootstrap" : { "deps" :['jquery'] },
            "bootstrap-datepicker" : { "deps" :['jquery', 'moment'] },
            "jquery-mousewheel" : { "deps" :['jquery'] },
            "slider": { "deps" :['jquery']},
            "select2": { "deps" :['jquery'] }
        }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/lodash/dist/lodash',
        handlebars: '../bower_components/handlebars/handlebars',
        templates: '../../.tmp/scripts/templates',
        moment: '../bower_components/moment/min/moment-with-locales.min',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        slider: '../bower_components/nouislider/distribute/jquery.nouislider.all.min',
        select2: '../bower_components/select2/dist/js/select2.full.min',
        'jquery-ui': '../bower_components/jquery-ui/jquery-ui.min',
        'bootstrap-datepicker': '../bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min',
        'jquery-mousewheel': '../bower_components/jquery-mousewheel/jquery.mousewheel.min'
    }
});

require(['views/app'], function (App) {
    new App;
});
