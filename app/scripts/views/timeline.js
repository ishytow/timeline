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
        items: [],
        calendar: null,
        timeline: null,

        initialize: function (options) {
            this.calendar = options.calendar;
            this.setTimelineOptions(options);
        },

        setTimelineOptions: function(options){
            this.items = new vis.DataSet(options.items);
            this.groups = new vis.DataSet(Utils.getGroups());
        },

        initPopovers: function(){
            EventListener.get('timeline').trigger('timeline-created', {timeLineEl: this.$el});
            var popoversSelectors = this.$el.find('.popover-trigger').parents('.item[class*="event-item-"]');
            popoversSelectors.click(function(){
                popoversSelectors.not(this).popover('hide');
            });
            $(document).on('click', function (e) {
                if ((!$(e.target).is('.item[class*="event-item-"]')
                    && $(e.target).parents('.item[class*="event-item-"]').length === 0
                    && $(e.target).parents('.popover.in').length === 0)
                    || $(e.target).is('.display-mode .edit, .display-mode .remove')) {
                    popoversSelectors.popover('hide');
                }
            });
        },

        initTimeline: function(){
            this.options = Utils.getTimelineOptions(this.calendar);
            if(this.timeline !== null){
                this.timeline.clear();
            }else{
                this.timeline = new vis.Timeline(this.el);
                this.timeline.setOptions(this.options);
            }
            this.timeline.setOptions(this.options);
            this.timeline.setGroups(this.groups);
            this.timeline.setItems(this.items);
            //console.log(this.items);

            this.timeline.on('select', function (options) {
                this.timeline.setSelection([]);
                if(options && options.items) {
                    _.each(options.items, function (itemId) {
                        var selectedId = Utils.getEventIdByItemId(itemId);
                        var itemsById = [];
                        for (var i = 0; i < this.groups.length; i++){
                            itemsById.push(selectedId + '-g-' + i);
                        }
                        this.timeline.setSelection(itemsById);
                    }.bind(this));
                }
            }.bind(this));
            this.initPopovers();
        },

        renderTimeline: function(options){
            this.$el.parent('.timeline-container').height(this.$el.height());
            if(options && options.scrollDirection){
                var animationParams;
                if(options.scrollDirection === 'prev'){
                    animationParams = {
                        marginTop: '+=1500px',
                        marginTopReverse: '-=3000px'
                    }
                }else{
                    animationParams = {
                        marginTop: '-=1500px',
                        marginTopReverse: '+=3000px'
                    }
                }
                this.$el.stop().animate({'marginTop' : animationParams.marginTop, 'opacity': 0},200,function(){
                    this.initTimeline();
                    this.$el.css('marginTop', animationParams.marginTopReverse)
                        .animate({'marginTop' : '0px', 'opacity': 1},200,function(){
                            this.$el.parent('.timeline-container').animate({'height' : this.$el.height() + 'px'},200,function(){
                                this.$el.parent('.timeline-container').height(this.$el.height());
                            }.bind(this));
                        }.bind(this));
                }.bind(this));
            }else{
                this.$el.fadeOut(500, function(){
                    this.initTimeline();
                    this.$el.parent('.timeline-container').animate({'height' : this.$el.height() + 'px'},200,function(){
                        this.$el.parent('.timeline-container').height(this.$el.height());
                    }.bind(this));
                    this.$el.fadeIn(500);
                }.bind(this));
            }
        },

        updateTimeline: function(options){
            console.log(1);
            this.renderTimeline(options);
        },

        render: function () {
            this.$el.html(this.template()).attr('id', 'timeline-' + this.calendar.get('uuid'));
            this.renderTimeline();
            return this;
        }
    });

    return TimelineView;
});
