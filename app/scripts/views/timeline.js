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
            onItem: JST['app/scripts/templates/menu-item.hbs'],
        },

        tagName: 'div',
        items: [],
        calendar: null,
        timeline: null,
        offset: Utils.config.offset,
        depth: Utils.config.depth,

        initialize: function (options) {
            this.calendar = options.calendar;
            this.eventsCollection = new EventsCollection({
                calendarId: this.calendar.get('id')
            });

            this.listenTo(this.eventsCollection, "change", this.onEventChange);
            this.listenTo(this.eventsCollection, "destroy", this.onEventRemove);
            this.listenTo(this.eventsCollection, "cancel-create", this.onEventCancelCreate);
        },

        initPopovers: function(){
            EventListener.get('timeline').trigger('timeline-created', {timeLineEl: this.$el});
            var popoversSelectors = this.$el.find('.popover-trigger').parents('.vis-item[class*="event-item-"]');
            popoversSelectors.click(function(){
                popoversSelectors.not(this).popover('hide');
            });
            $(document).on('click', function (e) {
                if ((!$(e.target).is('.vis-item[class*="event-item-"]')
                    && $(e.target).parents('.vis-item[class*="event-item-"]').length === 0
                    && $(e.target).parents('.popover.in').length === 0)
                    || $(e.target).is('.display-mode .edit, .display-mode .remove')) {
                    popoversSelectors.popover('hide');
                }
            });
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
            this.initPopovers();
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

        onEventChange: function(){
            //TODO: change itemset
            //this.getTimelineView().updateTimeline({callback: this.initDroppable.bind(this)});
        },

        onEventCancelCreate: function(model){
            this.eventsCollection.remove(model);
        },

        onEventRemove: function(model){
            //TODO: change itemset
            //this.eventsCollection.remove(model);

            //this.getTimelineView().updateTimeline({callback: this.initDroppable.bind(this)});
        },

        onMouseWheel: function(e){
            var events = e.originalEvent.wheelDelta || e.originalEvent.detail*-1;
            var scrollDirection;
            if(e.deltaY > 0) {
                scrollDirection = 'prev';
            }else{
                scrollDirection = 'next';
            }
        },

        addEvent: function(properties, userId){
            if(properties.group !== null){
                var options = {};
                options = Utils.getNewEventDefaultDates(this.timeline.groupsData.get(properties.group).day, properties.snappedTime);
                if(userId){
                    options.assignTo = userId;
                }
                var eventModel = new EventModel(options);
                var eventView = new EventView({model: eventModel, calendar: this.calendar});
                this.eventsCollection.add(eventModel);
                eventView.renderCreateModal({
                    save: function(model){
                        this.eventsCollection.add(model);
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
                    this.onAddEvent(properties);
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

        render: function () {
            this.$el.html(this.template()).attr('id', 'timeline-' + this.calendar.get('id'));

            if(this.timeline === null){
                this.timeline = new vis.Timeline(this.el);
            }

            this.timeline.setOptions(Utils.getTimelineOptions(this.calendar));
            this.timeline.setGroups(Utils.getGroups(this.offset, this.depth));

            this.timeline.on('doubleClick', this.onDoubleClick.bind(this));
            this.timeline.on('contextmenu', this.showContextMenu.bind(this));

            this.$el.on('mousewheel', this.onMouseWheel.bind(this));


            this.eventsCollection.fetch({
                data: {
                    offset: this.offset,
                    depth: this.depth
                },
                success: function(){
                    this.timeline.days = Utils.getDays(this.offset, this.depth);
                    this.eventsView = new EventsView({collection: this.eventsCollection, timeline: this.timeline});
                    this.timeline.setItems(this.eventsView.renderItems().items);
                }.bind(this)
            });




            this.initEvents();
            this.initPopovers();
            return this;
        }
    });

    return TimelineView;
});
