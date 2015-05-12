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
            '': 'timeLinePage'
        },

        timeLinePage: function(){
            require(['views/timeline-page'], function(TimelinePageView){
                var pageView = new TimelinePageView();
                $('#main').html(pageView.render().$el);
            });
        }
    });

    return Router;
});
