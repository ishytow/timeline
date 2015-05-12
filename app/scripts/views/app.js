define([
    'jquery',
    'underscore',
    'backbone',
    'routes/router',
    'bootstrap',
    'jquery-mousewheel'
], function ($, _, Backbone, Router) {
    'use strict';

    var AppView = Backbone.View.extend({
        initialize: function () {
            $( document ).ready(function() {
                new Router();
                Backbone.history.start();
            });
        }
    });

    return AppView;
});
