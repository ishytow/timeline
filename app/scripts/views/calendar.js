/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'models/event',
    'views/event',
    'views/timeline',
    'collections/events',
    'views/events',
    'utils',
    'moment',
    'EventListener',
    'slider',
    'jquery-ui'
], function ($, _, Backbone, JST, EventModel, EventView, TimelineView, EventsCollection, EventsView, Utils, moment, EventListener) {
    'use strict';

    var CalendarView = Backbone.View.extend({
        template: JST['app/scripts/templates/calendar.hbs'],
        contextMenuTemplates: {
            onTimeline: JST['app/scripts/templates/menu-timeline.hbs'],
            onItem: JST['app/scripts/templates/menu-item.hbs'],
            default: JST['app/scripts/templates/menu-default.hbs']
        },
        timelineView: null,
        eventsCollection: null,
        eventsView: null,
        isTitleEdit: false,

        attributes: {
            'role': 'tabpanel',
            'class': 'tab-pane fade'
        },

        initialize: function(options){
            this.model.bind('remove', this.remove, this);
            this.eventsCollection = new EventsCollection();
            this.eventsView = new EventsView({collection: this.eventsCollection});
            this.listenTo(this.eventsCollection, "change", this.onEventChange);
            this.listenTo(this.eventsCollection, "destroy", this.onEventRemove);
            this.listenTo(this.eventsCollection, "cancel-create", this.onEventCancelCreate);
        },

        getTimelineView: function(updateItems){
            var items;
            if(updateItems && updateItems === true){
                items = this.eventsView.renderItems(this.model).items;
            }else{
                items = this.eventsView.updateItems(this.model).items;
            }
            if(this.timelineView === null){
                this.timelineView = new TimelineView({items: items, calendar: this.model});
            }else{
                this.timelineView.setTimelineOptions({items: items});
            }
            return this.timelineView;
        },

        fetchEvents: function(){
            //TODO: fetch!!!
            this.eventsCollection.set(Utils.getMockedEvents(this.model));
        },

        renderTimeline: function(){
            this.fetchEvents();
            return this.getTimelineView().render();
        },

        onEventChange: function(){
            //TODO: change to this.updateTimeline
            this.getTimelineView().updateTimeline({callback: this.initDroppable.bind(this)});
        },

        onEventCancelCreate: function(model){
            this.eventsCollection.remove(model);
        },

        onEventRemove: function(model){
            this.eventsCollection.remove(model);
            //TODO: change to this.updateTimeline
            this.getTimelineView().updateTimeline({callback: this.initDroppable.bind(this)});
        },

        updateTimeline: function(options){
            if(options && options.scrollDirection){
                if(options.scrollDirection === 'prev'){
                    Utils.setWeek(Utils.getWeek() - 1);
                }else{
                    Utils.setWeek(Utils.getWeek() + 1);
                }
            }
            options.callback = this.initDroppable.bind(this);
            this.fetchEvents();
            this.getTimelineView(true).updateTimeline(options);
        },

        onMouseWheel: function(e){
            var events = e.originalEvent.wheelDelta || e.originalEvent.detail*-1;
            var scrollDirection;
            if(e.deltaY > 0) {
                scrollDirection = 'prev';
            }else{
                scrollDirection = 'next';
            }
            this.updateTimeline({scrollDirection: scrollDirection});
        },

        onAddEvent: function(properties, userId){
            if(properties.group !== null){
                var options = {};
                options = Utils.getNewEventDefaultDates(this.timelineView.groups.get(properties.group).day, properties.snappedTime);
                if(userId){
                    options.assignTo = userId;
                }
                var eventModel = new EventModel(options);
                var eventView = new EventView({model: eventModel, calendar: this.model});
                this.eventsCollection.add(eventModel);
                eventView.renderCreateModal();
            }
        },

        onChangeScale: function(){
            this.$el.find('.timeline-scale-range-container').slideDown();
        },

        onDoubleClick: function(properties){
            if(properties){
                switch (properties.what) {
                    case 'background':
                        this.onAddEvent(properties);
                        break;
                    case 'axis':
                        this.onChangeScale();
                        break;
                    case 'item':
                        EventListener.get('timeline').trigger('edit-event-'+Utils.getEventIdByItemId(properties.item));
                        break;
                }
            }
        },

        onTimelineContextMenu: function(properties){
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
                    default :
                        this.contextMenu.html(this.contextMenuTemplates.default());
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
                this.contextMenu.find('.change-scale').on('click', this.onChangeScale.bind(this));
            }
            return false;
        },

        renderScaleRange: function(){
            var startTime = this.model.get('startTime');
            var endTime = this.model.get('endTime');
            var startTimeMinutes = startTime.hours * 60 + startTime.minutes;
            var endTimeMinutes = endTime.hours * 60 + endTime.minutes;
            var updateLowerTooltip = function(value){
                var selectedMinutes = value.substr(0, value.indexOf('.'));
                var time = moment().locale('en').hour(0).minute(0).second(0).add(selectedMinutes, 'minutes');
                var formattedTime = time.format(Utils.getHoursFormat());
                $(this).html(
                    '<div class="tooltip-arrow"></div>' +
                    '<div class="tooltip-inner">' + formattedTime + '</div>'
                );
            };
            var updateUpperTooltip = function(value){
                var selectedMinutes = value.substr(0, value.indexOf('.'));
                var time = moment().locale('en').hour(0).minute(0).second(0).add(selectedMinutes, 'minutes');
                var formattedTime = (time.format(Utils.getHoursFormat()) !== '00:00') ? time.format(Utils.getHoursFormat()) : '24:00';
                $(this).html(
                    '<div class="tooltip-arrow"></div>' +
                    '<div class="tooltip-inner">' + formattedTime + '</div>'
                );
            };

            this.$el.find(".timeline-scale-range .slider").noUiSlider({
                start: [startTimeMinutes, endTimeMinutes],
                behaviour: 'drag-tap',
                connect: true,
                step: 10,
                margin: 480,
                range: {
                    'min': 0,
                    'max': 1440    //minutes in one day
                }
            });
            this.$el.find(".timeline-scale-range .slider").Link('upper').to('-inline-<div class="range-tooltip tooltip top" role="tooltip"></div>', updateUpperTooltip);
            this.$el.find(".timeline-scale-range .slider").Link('lower').to('-inline-<div class="range-tooltip tooltip top" role="tooltip"></div>', updateLowerTooltip);

            this.$el.find(".timeline-scale-range .save").on('click', function(){
                var sliderValue = this.$el.find('.timeline-scale-range .slider').val();
                var startTimeMinutes = sliderValue[0].substring(0, sliderValue[0].indexOf('.'));
                var endTimeMinutes = sliderValue[1].substring(0, sliderValue[1].indexOf('.'));
                var startTime = moment().locale('en').hour(0).minute(0).second(0).add(startTimeMinutes, 'minutes');
                var endTime = moment().locale('en').hour(0).minute(0).second(0).add(endTimeMinutes, 'minutes');

                this.model.set('startTime', {hours: startTime.hour(), minutes: startTime.minute()});
                this.model.set('endTime', {hours: (endTime.hour() !== 0) ? endTime.hour() : 24, minutes: endTime.minute()});
                this.timelineView.updateTimeline({});
                this.$el.find('.timeline-scale-range-container').slideUp();
            }.bind(this));
            this.$el.find(".timeline-scale-range .remove").on('click', function(){
                this.$el.find('.timeline-scale-range-container').slideUp();
            }.bind(this));
        },

        onTabEdit: function(){
            $(this.tabItemSelector).find('.calendar-tab-item').slideUp(1000);
            $(this.tabItemSelector).find('.calendar-title-edit').slideDown(1000, function(){
                $(this.tabItemSelector).find('.calendar-title-edit input').focus();
                this.isTitleEdit = true;
            }.bind(this));
        },

        onTabEditFinish: function(){
            var value = $(this.tabItemSelector).find('.calendar-title-edit input').val();
            this.model.set({title: value});
            //TODO:
            //this.model.save();
            $(this.tabItemSelector).find('.calendar-tab-item').text(this.model.get('title'));
            $(this.tabItemSelector).find('.calendar-tab-item').slideDown();
            $(this.tabItemSelector).find('.calendar-title-edit').slideUp();
            this.isTitleEdit = false;
        },

        onDrop: function(e, el){
            var eventProperties = this.timelineView.timeline.getEventProperties(e);
            this.onAddEvent(eventProperties, $(el.draggable).data('uuid'));
        },

        initDroppable: function(){
            this.timelineView.$el.find('.vis-foreground .vis-group').droppable({
                hoverClass: 'hovered-group',
                tolerance: 'pointer',
                drop: this.onDrop.bind(this)
            });
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON())).attr('id', 'calendar-' + this.model.get('uuid'));
            this.tabItemSelector = '.calendars-tabs li[data-uuid="' + this.model.get('uuid') + '"]';
            this.contextMenu = $('#context-menu');
            this.$el.find('.timeline-container').html(this.renderTimeline().$el);
            this.$el.find('.timeline-container').on('mousewheel', this.onMouseWheel.bind(this));
            this.timelineView.timeline.on('doubleClick', this.onDoubleClick.bind(this));
            this.timelineView.timeline.on('contextmenu', this.onTimelineContextMenu.bind(this));
            this.initDroppable();
            $(document).on('click', function(e){
                if($(e.target).parents(this.tabItemSelector).length === 0
                    && !$(e.target).is(this.tabItemSelector)
                    && this.isTitleEdit === true){
                       this.onTabEditFinish();
                }
                if($(e.target).parents('.use24').length === 0){
                    this.contextMenu.hide();
                }
            }.bind(this));
            $(document).keypress(function(e) {
                if(e.which == 13) {
                    if($(e.target).parents(this.tabItemSelector).length > 0
                        && $(e.target).parents().find(this.tabItemSelector).length > 0){
                        this.onTabEditFinish();
                    }
                }
            }.bind(this));
            this.renderScaleRange();
            EventListener.get('timeline').on('use24', function(){
                this.updateTimeline({});
                this.$el.find(".timeline-scale-range .slider")[0].destroy();
                this.renderScaleRange();
            }.bind(this));
            EventListener.get('timeline').on('edit-calendar-' + this.model.get('uuid'), this.onTabEdit.bind(this));
            EventListener.get('timeline').on('change-scale-' + this.model.get('uuid'), this.onChangeScale.bind(this));
            return this;
        }
    });

    return CalendarView;
});
