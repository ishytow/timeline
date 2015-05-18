/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'models/calendar',
    'views/calendar',
    'EventListener',
    'jquery-ui'
], function ($, _, Backbone, JST, CalendarModel, CalendarView, EventListener) {
    'use strict';

    var CalendarsView = Backbone.View.extend({
        template: JST['app/scripts/templates/calendars.hbs'],
        tabItemTemplate: JST['app/scripts/templates/calendar-tab-item.hbs'],
        tagName: 'div',

        onTabSoreted: function(e, ui){
            $.each(this.$el.find('.calendars-tabs li.tab-item'), function(index, value){
                var uuid = $(value).data('uuid');
                this.collection.get($(value).data('uuid')).set({position: index});
            }.bind(this));
            //TODO:
            //this.collection.update();
        },

        renderCalendar: function(calendar){
            var tabItem = this.tabItemTemplate(calendar.toJSON());
            $(tabItem).insertBefore(this.$el.find('.calendars-tabs .add-calendar'));
            var calendarView = new CalendarView({model : calendar, tabItem: $(tabItem)});
            this.$el.find('.tab-content').append(calendarView.render().$el);
        },

        addDblClickHendler: function(){
            this.$el.find('.calendars-tabs .calendar-tab-item').off('dblclick').on('dblclick', function(){
                EventListener.get('timeline').trigger('edit-calendar-'+ $(this).data('uuid'));
            });
        },

        render: function () {
            this.$el.html(this.template());
            this.collection.each(function(calendar){
                this.renderCalendar(calendar);
            }, this);
            this.$el.find('.calendars-tabs li').first().addClass('active');
            this.$el.find('.tab-content .tab-pane').first().addClass('active in');
            this.$el.find('.calendars-tabs a').click(function (e) {
                e.preventDefault();
                $(this).tab('show')
            });
            this.$el.find('.calendars-tabs').sortable({
                containment: this.$el.find('.calendars-tabs'),
                stop: this.onTabSoreted.bind(this),
                items: "> li.tab-item"
            });
            this.$el.find('.calendars-tabs').disableSelection();
            this.addDblClickHendler();
            this.$el.find('.calendars-tabs .add-calendar').on('click', function(){
                var calendarModel = new CalendarModel();
                this.collection.add(calendarModel);
                this.renderCalendar(calendarModel);
                this.addDblClickHendler();
            }.bind(this));
            return this;
        }
    });

    return CalendarsView;
});
