/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'views/timeline',
    'views/events',
    'utils',
    'EventListener'
], function ($, _, Backbone, JST, TimelineView, EventsView, Utils, EventListener) {
    'use strict';

    var TimelinePageView = Backbone.View.extend({
        template: JST['app/scripts/templates/timeline-page.hbs'],
        tagName: 'div',
        timelineView: null,

        getTimelineView: function(){
            this.eventsView = new EventsView();
            var items = this.eventsView.renderItems().items;

            if(this.timelineView === null){
                this.timelineView = new TimelineView({items: items});
            }else{
                this.timelineView.setTimelineOptions({items: items});
            }

            return this.timelineView;
        },

        renderTimeline: function(){
            return this.getTimelineView().render();
        },

        updateTimeline: function(options){
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
            return this;
        }
    });

    return TimelinePageView;
});
