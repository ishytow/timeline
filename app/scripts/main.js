require.config({
    baseUrl: './',
    noGlobal: true,
    shim: {
        handlebars: {
            exports: 'Handlebars'
        },
        shim : {
            "bootstrap" : { "deps" :['jquery'] },
            "jquery-mousewheel" : { "deps" :['jquery'] }
        }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/lodash/dist/lodash',
        handlebars: '../bower_components/handlebars/handlebars',
        templates: '../../.tmp/scripts/templates',
        vis: '../bower_components/vis/dist/vis.min',
        moment: '../bower_components/moment/min/moment-with-locales.min',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        'jquery-mousewheel': '../bower_components/jquery-mousewheel/jquery.mousewheel.min'
    }
});

require(['views/app'], function (App) {
    new App;
});
