/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'vis',
    'moment',
    'utils',
    'EventListener',
    'collections/events',
    'views/events',
    'models/event',
    'views/event'
], function ($, _, Backbone, JST, vis, moment, Utils, EventListener, EventsCollection, EventsView, EventModel, EventView) {
    'use strict';

    var TimelineView = Backbone.View.extend({
        template: JST['app/scripts/templates/timeline.hbs'],
        contextMenuTemplates: {
            onTimeline: JST['app/scripts/templates/menu-timeline.hbs'],
            onItem: JST['app/scripts/templates/menu-item.hbs']
        },

        tagName: 'div',
        items: [],
        calendar: null,
        timeline: null,

        offset: Utils.config.offset,
        depth: Utils.config.depth,

        currentDay: Utils.getDayByOffset(this.offset),

        loadedDays: {
            start: null,
            end: null
        },

        initialize: function (options) {
            this.calendar = options.calendar;
            this.eventsCollection = new EventsCollection({
                calendarId: this.calendar.get('id')
            });
        },

        initPopovers: function(){
            EventListener.get('timeline').trigger('timeline-created');
        },

        initEvents: function(){
            this.timeline.on('select', function (options) {
                this.timeline.setSelection([]);
                if(options && options.items) {
                    _.each(options.items, function (itemId) {
                        var selectedId = Utils.getEventIdByItemId(itemId);
                        var itemsById = [];
                        for (var i = 0; i < this.timeline.groupsData.length; i++){
                            itemsById.push(selectedId + '-g-' + i);
                        }
                        this.timeline.setSelection(itemsById);
                    }.bind(this));
                }
            }.bind(this));
        },

        //renderTimeline: function(options){
        //    this.$el.parent('.timeline-container').height(this.$el.height());
        //    if(options && options.scrollDirection){
        //        var animationParams;
        //        if(options.scrollDirection === 'prev'){
        //            animationParams = {
        //                marginTop: '+=1500px',
        //                marginTopReverse: '-=3000px'
        //            }
        //        }else{
        //            animationParams = {
        //                marginTop: '-=1500px',
        //                marginTopReverse: '+=3000px'
        //            }
        //        }
        //        this.$el.stop().animate({'marginTop' : animationParams.marginTop, 'opacity': 0},200,function(){
        //            this.initTimeline();
        //            if (options && options.callback){
        //                options.callback.call();
        //            }
        //            this.$el.css('marginTop', animationParams.marginTopReverse)
        //                .animate({'marginTop' : '0px', 'opacity': 1},200,function(){
        //                    this.$el.parent('.timeline-container').animate({'height' : this.$el.height() + 'px'},200,function(){
        //                        this.$el.parent('.timeline-container').height(this.$el.height());
        //                    }.bind(this));
        //                }.bind(this));
        //        }.bind(this));
        //    }else{
        //        this.$el.fadeOut(500, function(){
        //            this.initTimeline();
        //            if (options && options.callback){
        //                options.callback.call();
        //            }
        //            this.$el.parent('.timeline-container').animate({'height' : this.$el.height() + 'px'},200,function(){
        //                this.$el.parent('.timeline-container').height(this.$el.height());
        //            }.bind(this));
        //            this.$el.fadeIn(500);
        //        }.bind(this));
        //    }
        //},

        addEvent: function(properties, userId){
            if(properties.group !== null){
                var options = {};
                options = Utils.getNewEventDefaultDates(this.timeline.groupsData.get(properties.group).day, properties.snappedTime);
                if(userId){
                    options.assignTo = userId;
                }
                var eventModel = new EventModel(options);
                var eventView = new EventView({model: eventModel, timeline: this.timeline, calendar: this.calendar});
                this.eventsCollection.add(eventModel);
                eventView.renderCreateModal({
                    create: function(model){
                        this.eventsCollection.add(model);
                        //this.timeline.itemSet.getItems().add(eventView.renderItem().items);
                    }.bind(this)
                });
            }
        },

        onDoubleClick: function(properties){
            if(properties){
                switch (properties.what) {
                    case 'background':
                        this.addEvent(properties);
                        break;
                    case 'item':
                        EventListener.get('timeline').trigger('edit-event-'+Utils.getEventIdByItemId(properties.item));
                        break;
                }
            }
        },

        showContextMenu: function(properties){
            if(properties){
                if (properties.event.ctrlKey) return;
                properties.event.preventDefault();
                switch (properties.what) {
                    case 'background':
                        this.contextMenu.html(this.contextMenuTemplates.onTimeline());
                        break;
                    case 'item':
                        this.contextMenu.html(this.contextMenuTemplates.onItem());
                        break;
                }

                this.contextMenu.css({
                    display: 'block',
                    position: 'absolute',
                    left: properties.pageX + 'px',
                    top: properties.pageY + 'px'
                }).off('click');
                this.contextMenu.find('.add').on('click', function(){
                    this.addEvent(properties);
                }.bind(this));
                this.contextMenu.find('.edit').on('click', function(){
                    EventListener.get('timeline').trigger('edit-event-'+Utils.getEventIdByItemId(properties.item));
                }.bind(this));
                this.contextMenu.find('.remove').on('click', function(){
                    EventListener.get('timeline').trigger('remove-event-'+Utils.getEventIdByItemId(properties.item));
                }.bind(this));
                this.contextMenu.find('.show-next').on('click', function(){
                    this.updateTimeline({scrollDirection: 'next'})
                }.bind(this));
                this.contextMenu.find('.show-prev').on('click', function(){
                    this.updateTimeline({scrollDirection: 'prev'})
                }.bind(this));
            }
            return false;
        },

        onDrop: function(e, el){
            var eventProperties = this.timeline.getEventProperties(e);
            this.addEvent(eventProperties, $(el.draggable).data('id'));
        },

        fetchEvents: function(options){
            var defaultOptions = {
                remove: false,
                data: {
                    offset: this.offset,
                    depth: this.depth
                }
            };
            $.extend(true, defaultOptions, options);
            this.eventsCollection.fetch(defaultOptions);
        },

        onMouseWheel: function(e){
            var events = e.originalEvent.wheelDelta || e.originalEvent.detail*-1;
            var newOffset = this.offset;
            var newCurrentDay = this.currentDay;
            if(e.deltaY > 0) {
                newCurrentDay -= 1;
                newOffset = this.offset - this.depth;
            }else{
                newCurrentDay += 1;
                newOffset = this.offset + this.depth;
            }

            this.fetchEvents({
                data: {
                    offset: newOffset
                },
                success: function(){
                    this.offset = newOffset;
                    this.currentDay = newCurrentDay;

                    var newStartDay = Utils.getDayByOffset(this.offset);
                    var newEndDay = Utils.getDayByOffset(this.offset + this.depth);

                    if(newStartDay.isBefore(this.loadedDays.start, 'hour')){
                        this.loadedDays.start = newStartDay;
                    }
                    if(newEndDay.isAfter(this.loadedDays.end, 'hour')){
                        this.loadedDays.end = newEndDay;
                    }

                    this.timeline.setGroups(Utils.getGroups(step, this.depth));
                    this.timeline.days = Utils.getDays(this.offset, this.depth);
                    this.timeline.setItems(this.eventsView.renderItems().items);
                    this.initEvents();
                    this.initPopovers();
                }.bind(this)
            });
        },

        render: function () {
            this.contextMenu = $('#context-menu');
            this.$el.html(this.template()).attr('id', 'timeline-' + this.calendar.get('id'));

            if(this.timeline === null){
                this.timeline = new vis.Timeline(this.el);
            }

            this.timeline.$el = this.$el;

            this.timeline.setOptions(Utils.getTimelineOptions(this.calendar));
            this.timeline.setGroups(Utils.getGroups(this.offset, this.depth));

            this.timeline.on('doubleClick', this.onDoubleClick.bind(this));
            this.timeline.on('contextmenu', this.showContextMenu.bind(this));
            this.$el.on('mousewheel', this.onMouseWheel.bind(this));

            this.$el.find('.vis-foreground .vis-group').droppable({
                hoverClass: 'hovered-group',
                tolerance: 'pointer',
                drop: this.onDrop.bind(this)
            });

            this.fetchEvents({
                success: function(){
                    this.loadedDays.start = Utils.getDayByOffset(this.offset);
                    this.loadedDays.end = Utils.getDayByOffset(this.offset+ this.depth);
                    this.timeline.days = Utils.getDays(this.offset, this.depth);
                    this.eventsView = new EventsView({
                        collection: this.eventsCollection,
                        timeline: this.timeline,
                        calendar: this.calendar
                    });
                    this.timeline.setItems(this.eventsView.renderItems().items);
                    this.initEvents();
                    this.initPopovers();

                }.bind(this)
            });

            return this;
        }
    });

    return TimelineView;
});
