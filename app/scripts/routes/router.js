define([
    'jquery',
    'backbone',
    'views/global'
], function ($, Backbone, Global) {
    'use strict';

    var Router = Backbone.Router.extend({

        initialize: function(){
            Global.renderGlobalView();
        },

        routes: {
            '': 'calendarsPage'
        },

        calendarsPage: function(){
            require(['views/calendarsPage'], function(CalendarsPage){
                var calendarsPage = new CalendarsPage();
                $('#main').html(calendarsPage.render().$el);
            });
        }
    });

    return Router;
});
