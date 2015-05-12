/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'views/timeline',
    'views/events',
    'utils'
], function ($, _, Backbone, JST, TimelineView, EventsView, Utils) {
    'use strict';

    var TimelinePageView = Backbone.View.extend({
        template: JST['app/scripts/templates/timeline-page.hbs'],
        tagName: 'div',
        timelineView: null,

        getTimelineView: function(){
            this.eventsView = new EventsView();
            var items = this.eventsView.renderItems().items;
            console.log(items);
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

        render: function () {
            this.$el.html(this.template());
            this.$el.find('#timeline-container').html(this.renderTimeline().$el);

            this.$el.find('#timeline-container').on('mousewheel', function(e){
                if(e.originalEvent.wheelDelta /120 > 0) {
                    Utils.setWeek(Utils.getWeek() - 1);
                }else{
                    Utils.setWeek(Utils.getWeek() + 1);
                }

                this.$el.find('#timeline-container').html(this.renderTimeline().$el);
            }.bind(this));
            return this;
        }
    });

    return TimelinePageView;
});
