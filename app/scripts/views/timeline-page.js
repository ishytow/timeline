/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'models/event',
    'views/timeline',
    'collections/events',
    'views/events',
    'utils',
    'EventListener'
], function ($, _, Backbone, JST, EventModel, TimelineView, EventsCollection, EventsView, Utils, EventListener) {
    'use strict';

    var TimelinePageView = Backbone.View.extend({
        template: JST['app/scripts/templates/timeline-page.hbs'],
        newModalTemplate: JST['app/scripts/templates/event-edit-modal.hbs'],
        tagName: 'div',
        timelineView: null,
        eventsCollection: null,
        eventsView: null,

        initialize: function(){
            this.eventsCollection = new EventsCollection();
            this.eventsView = new EventsView({collection: this.eventsCollection});
            this.listenTo(this.eventsCollection, "change", this.onEventChange);
            this.listenTo(this.eventsCollection, "destroy", this.onEventRemove);
        },

        getTimelineView: function(){
            var items = this.eventsView.renderItems().items;
            if(this.timelineView === null){
                this.timelineView = new TimelineView({items: items});
            }else{
                this.timelineView.setTimelineOptions({items: items});
            }

            return this.timelineView;
        },

        fetchEvents: function(){
            //TODO: fetch!!!
            this.eventsCollection.set(Utils.getMockedEvents());
        },

        renderTimeline: function(){
            this.fetchEvents();
            return this.getTimelineView().render();
        },

        onEventChange: function(){
            this.getTimelineView().updateTimeline();
        },

        onEventRemove: function(model){
            this.eventsCollection.remove(model);
            this.getTimelineView().updateTimeline();
        },

        updateTimeline: function(options){
            this.fetchEvents();
            this.getTimelineView().updateTimeline(options);
        },

        onMouseWheel: function(e){
            var events = e.originalEvent.wheelDelta || e.originalEvent.detail*-1;
            var scrollDirection;
            if(events / 120 > 0) {
                Utils.setWeek(Utils.getWeek() - 1);
                scrollDirection = 'up';
            }else{
                Utils.setWeek(Utils.getWeek() + 1);
                scrollDirection = 'down';
            }
            EventListener.get('timeline').trigger('timelineScrolled');
            this.updateTimeline({scrollDirection: scrollDirection});
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.find('#timeline-container').html(this.renderTimeline().$el);
            this.$el.find('#timeline-container').on('mousewheel', this.onMouseWheel.bind(this));

            //TODO: move out
            this.timelineView.timeline.on('doubleClick', function(properties){
                console.log(properties);
                if(properties && properties.item === null){
                    var newEvent = new EventModel();
                    $('#modals-container').html(this.newModalTemplate(newEvent.toJSON()));
                    var newEventView = $('#modals-container #edit-modal-');
                    newEventView.modal('show');


                    //var updatedValues = {
                    //    title: newEventView.find('.title'),
                    //    description: newEventView.find('.description'),
                    //    startDate: new Date(newEventView.find('.start-dp').val()),
                    //    endDate: new Date(newEventView.find('.end-dp').val())
                    //};
                    //newEvent.set(updatedValues);
                }
            }.bind(this));
            return this;
        }
    });

    return TimelinePageView;
});
