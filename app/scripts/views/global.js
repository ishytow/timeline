/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var global = null;

    var GlobalView = Backbone.View.extend({
        template: JST['app/scripts/templates/global.hbs'],
        headerTemplate : JST['app/scripts/templates/header.hbs'],

        el: $('body'),

        renderGlobalView : function(){
            this.$el.html(this.template());
            this.$el.find('header').html(this.headerTemplate());
            return this;
        }
    });

    var getGlobal = function(){
        if(!global){
            global = new GlobalView();
        }
        return global;
    };

    return getGlobal();
});
