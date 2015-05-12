/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'vis',
    'moment',
    'utils',
    'EventListener'
], function ($, _, Backbone, JST, vis, moment, Utils, EventListener) {
    'use strict';

    var TimelineView = Backbone.View.extend({
        template: JST['app/scripts/templates/timeline.hbs'],

        tagName: 'div',

        id: 'timeline',

        items: [],

        initialize: function (options) {
            this.setTimelineOptions(options);
            this.options = Utils.getTimelineOptions();
        },

        setTimelineOptions: function(options){
            this.items = new vis.DataSet(options.items);
            this.groups = new vis.DataSet(Utils.getGroups());
        },

        initPopovers: function(){
            EventListener.get('timeline').trigger('timeline-created', {timeLineEl: this.$el});
            var $popoverEls = this.$el.find('.popover-trigger').parents('.item[class*="event-item-"]');
            $popoverEls.click(function(){
                $popoverEls.not(this).popover('hide');
            });
        },

        renderTimeline: function(){
            var timeline = new vis.Timeline(this.el, this.items, this.groups, this.options);
            timeline.on('select', function (options) {
                timeline.setSelection([]);
                if(options && options.items) {
                    _.each(options.items, function (itemId) {
                        var selectedId = itemId.substr(0, itemId.indexOf('-g-'));
                        var itemsById = [];
                        for (var i = 0; i < this.groups.length; i++){
                            itemsById.push(selectedId + '-g-' + i);
                        }
                        timeline.setSelection(itemsById);
                    }.bind(this));
                }
            }.bind(this));

            this.initPopovers();
        },

        render: function () {
            this.$el.html(this.template());
            this.renderTimeline();
            return this;
        }
    });

    return TimelineView;
});
