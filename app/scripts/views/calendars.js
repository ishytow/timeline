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
        calendarMenuTemplate: JST['app/scripts/templates/menu-calendar.hbs'],
        calendarMenuDefaultTemplate: JST['app/scripts/templates/menu-calendar-default.hbs'],
        tagName: 'div',

        onTabSoreted: function(e, ui){
            $.each(this.$el.find('.calendars-tabs li.tab-item'), function(index, value){
                var id = $(value).data('id');
                this.collection.get(id).set({position: index});
            }.bind(this));
            //TODO:
            //this.collection.update();
        },

        onCalendarContextMenu: function(e){
            e.preventDefault();
            var target = $(e.target);
            if(target.hasClass('glyphicon-plus')){
                return false;
            }
            if(target.hasClass('calendar-tab-item')){
                this.contextMenu.html(this.calendarMenuTemplate());
            }else{
                this.contextMenu.html(this.calendarMenuDefaultTemplate());
            }
            this.contextMenu.css({
                display: 'block',
                position: 'absolute',
                left: e.pageX + 'px',
                top: e.pageY + 'px'
            }).off('click');
            this.contextMenu.find('.add-calendar').on('click', function(){
                this.addCalendar();
            }.bind(this));
            this.contextMenu.find('.edit-calendar').on('click', function(){
                target.tab('show');
                EventListener.get('timeline').trigger('edit-calendar-'+ target.data('id'));
            });
            this.contextMenu.find('.remove-calendar').on('click', function(){
                target.tab('show');
                this.removeCalendar(target);
            }.bind(this));
            this.contextMenu.find('.change-scale').on('click', function(){
                target.tab('show');
                EventListener.get('timeline').trigger('change-scale-'+ target.data('id'));
            });
        },

        renderCalendar: function(calendar){
            var tabItem = this.tabItemTemplate(calendar.toJSON());
            $(tabItem).insertBefore(this.$el.find('.calendars-tabs .add-calendar'));
            var calendarView = new CalendarView({model : calendar, tabItem: $(tabItem)});
            this.$el.find('.tab-content').append(calendarView.render().$el);
            return $(tabItem);
        },

        addDblClickHendler: function(){
            this.$el.find('.calendars-tabs .calendar-tab-item').off('dblclick').on('dblclick', function(){
                EventListener.get('timeline').trigger('edit-calendar-'+ $(this).data('id'));
            });
        },

        addCalendar: function(){
            var calendarModel = new CalendarModel();
            calendarModel.save(null, {
                success: function (model, response, options) {
                    this.collection.add(calendarModel);
                    this.renderCalendar(calendarModel);
                    this.addDblClickHendler();
                    EventListener.get('timeline').trigger('edit-calendar-'+ calendarModel.get('id'));
                }.bind(this),
                error: function (model, xhr, options) {
                    console.log("error");
                }
            });
        },

        removeCalendar: function(target){
            var calendarModel = this.collection.get(target.data('id'));
            calendarModel.destroy({
                success: function(){
                    this.collection.remove(calendarModel);
                    if(target.parent('.tab-item').hasClass('active') && target.parent('.tab-item').prev().length > 0){
                        target.parent('.tab-item').prev().find('a.calendar-tab-item').tab('show');
                    }
                    target.parent('.tab-item').remove();
                }.bind(this)
            });
        },

        render: function () {
            this.$el.html(this.template());
            this.contextMenu = $('#context-menu');
            this.collection.each(function(calendar){
                this.renderCalendar(calendar);
            }, this);
            this.$el.find('.calendars-tabs li').first().addClass('active');
            this.$el.find('.tab-content .tab-pane').first().addClass('active in');
            this.$el.find('.calendars-tabs a').click(function (e) {
                e.preventDefault();
                $(this).tab('show')
            });

            EventListener.get('timeline').trigger('calendar-shown',{id: this.$el.find('.calendars-tabs li a').first().data('id')});
            this.$el.find('.calendars-tabs a').on('shown.bs.tab', function (e) {
                EventListener.get('timeline').trigger('calendar-shown',{id: $(e.target).data('id')});
            });
            this.$el.find('.calendars-tabs').sortable({
                containment: this.$el.find('.calendars-tabs'),
                stop: this.onTabSoreted.bind(this),
                items: "> li.tab-item"
            });
            this.$el.find('.calendars-tabs').disableSelection();
            this.addDblClickHendler();
            this.$el.find('.calendars-tabs .add-calendar').on('click', this.addCalendar.bind(this));
            this.$el.find('.calendars-tabs').on('contextmenu', this.onCalendarContextMenu.bind(this));
            return this;
        }
    });

    return CalendarsView;
});
