/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'moment',
    'utils',
    'EventListener',
    'collections/users',
    'views/users',
    'bootstrap-datepicker'
], function ($, _, Backbone, JST, moment, Utils, EventListener, UsersCollection, UsersView) {
    'use strict';

    var EventView = Backbone.View.extend({
        items: [],

        editModalTemplate: JST['app/scripts/templates/event-edit-modal.hbs'],
        removeModalTemplate: JST['app/scripts/templates/event-remove-modal.hbs'],

        initialize: function (options) {
            if(_.isObject(options)){
                if(_.isObject(options.calendar)){
                    this.calendar = options.calendar;
                }
                if(_.isObject(options.timeline)){
                    this.timeline = options.timeline;
                }
            }
        },

        getItemsByEvent: function(){
            var items = [];
            var days = this.timeline.days;
            var eventStartDate = moment(this.model.get('startDate'));
            var eventEndDate = moment(this.model.get('endDate'));
            var startScaleDate = moment(Utils.getStartScaleDate(this.calendar));
            var endScaleDate = moment(Utils.getEndScaleDate(this.calendar));
            var lastDate = days[days.length - 1].clone();

            for (var i = 0; i < days.length; i++) {
                var start = null;
                var end = null;
                var nextDay = (days[i+1]) ? days[i+1] : lastDate.add(1, 'days');

                if(eventStartDate.isBetween(days[i], nextDay, 'minute')){
                    start = moment().hour(eventStartDate.hour()).minute(eventStartDate.minute()).second(0);
                }else if(eventStartDate.isBefore(days[i], 'minute') || eventStartDate.isSame(days[i], 'minute')){
                    start = startScaleDate;
                }

                if(eventEndDate.isBetween(days[i], nextDay, 'minute')){
                    end = moment().hour(eventEndDate.hour()).minute(eventEndDate.minute()).second(0);
                }else if(eventEndDate.isAfter(nextDay, 'minute') || eventEndDate.isSame(nextDay, 'minute')){
                    end = endScaleDate;
                }

                if(start !== null && end !== null){
                    items.push({
                        id: this.model.get('id') + '-g-' + i,
                        eventId: this.model.get('id'),
                        className: 'event-item-' + this.model.get('id'),
                        assignTo: this.model.get('assignTo'),
                        eventTitle: this.model.get('title'),
                        description: this.model.get('description'),
                        startDate: eventStartDate.locale('en').format('MMM DD, '+ Utils.getHoursFormat()),
                        endDate: eventEndDate.locale('en').format('MMM DD, '+ Utils.getHoursFormat()),
                        start: start,
                        end: end,
                        group: i,
                        subgroup: 'sg-' + this.model.get('id') + '-g-' + i
                    });
                }
            }
            
            return items;
        },

        edit: function(){
            this.renderEditModal();
        },

        removeEvent: function(){
            this.renderRemoveModal();
        },

        isEventInitialized: false,

        initEvents: function(){
            if(this.isEventInitialized === false){
                var selector = '.popover-content .event-id-' + this.model.get('id');
                $(document).off('click', selector + ' .edit').on('click', selector + ' .edit', this.edit.bind(this));
                $(document).off('click', selector + ' .remove').on('click', selector + ' .remove', this.removeEvent.bind(this));

                EventListener.get('timeline')
                    .off('edit-event-' + this.model.get('id'))
                    .on('edit-event-' + this.model.get('id'), function(){
                        this.edit();
                }.bind(this));
                EventListener.get('timeline')
                    .off('remove-event-' + this.model.get('id'))
                    .on('remove-event-' + this.model.get('id'), function(){
                        this.removeEvent();
                }.bind(this));
                this.isEventInitialized = true;
            }
        },

        renderCreateModal: function(options){
            this.renderEditModal(options);
        },

        getMinDate: function(date){
            return moment(date).clone().add(Utils.config.defaultEventMinHours,'hours');
        },

        renderEditModal: function(options){
            this.editModal = $(this.editModalTemplate(this.model.toJSON()));
            $('#modals-container').html(this.editModal);
            this.editModal.modal('show');
            this.editModal.find('.start-dp').datetimepicker({
                defaultDate: this.model.get('startDate'),
                locale: 'en',
                format: 'MMM DD, '+ Utils.getHoursFormat()
            });
            this.editModal.find('.end-dp').datetimepicker({
                defaultDate: this.model.get('endDate'),
                locale: 'en',
                format: 'MMM DD, '+ Utils.getHoursFormat(),
                minDate: this.getMinDate(this.model.get('startDate'))
            });

            this.editModal.find('.start-dp').on("dp.change", function (e) {
                var minDate = this.getMinDate(e.date);
                this.editModal.find('.end-dp').data("DateTimePicker").minDate(minDate).date(minDate);
            }.bind(this));

            this.usersCollection = new UsersCollection();
            this.usersCollection.setCalendarId(this.calendar.get('id')).fetch({
                success: function(){
                    var usersView = new UsersView({collection: this.usersCollection});
                    this.editModal.find('.user').html(usersView.renderSelect().$selectEl);
                    this.editModal.find('.users-select').select2({
                        multiple: false,
                        dropdownCssClass: 'select2-event-users'
                    });

                    if(this.model.get('assignTo')){
                        this.editModal.find('.users-select').val(this.model.get('assignTo')).trigger('change');
                    }else{
                        this.editModal.find('.users-select').val('').trigger('change');
                    }
                }.bind(this)
            });

            this.editModal.find('.save').on('click', function(){
                var updatedValues = {
                    title: this.editModal.find('.title').val(),
                    description: this.editModal.find('.description').val(),
                    startDate: moment(this.editModal.find('.start-dp').val(), 'MMM DD, '+ Utils.getHoursFormat(), 'en').toDate().getTime(),
                    endDate: moment(this.editModal.find('.end-dp').val(), 'MMM DD, '+ Utils.getHoursFormat(), 'en').toDate().getTime(),
                    assignTo: this.editModal.find('.users-select').val()
                };

                this.model.setCalendarId(this.calendar.get('id')).set(updatedValues);
                this.model.save(null, {
                    success: function(){
                        this.editModal.modal('hide');
                        this.updateItems();
                        if(options && options.create){
                            options.create.call({}, this.model);
                        }
                    }.bind(this)
                });
            }.bind(this));

            this.editModal.find('.cancel').on('click', function(){

            }.bind(this));
        },

        updateItems: function(){
            this.removeItems();
            this.items = this.getItemsByEvent();
            this.timeline.itemSet.getItems().add(this.items);
            this.initPopover();
            this.initEvents();
        },

        removeItems: function(){
            this.timeline.itemSet.getItems().remove(this.items);
        },

        renderRemoveModal: function(){
            this.removeModal = $(this.removeModalTemplate(this.model.toJSON()));
            this.removeModal.modal('show');
            this.removeModal.find('.remove').on('click', function(){
                this.model.destroy({success: function(){
                    this.removeModal.modal('hide');
                    this.removeItems();
                }.bind(this),
                error: function(){
                    console.log(arguments);
                }});
            }.bind(this));
        },

        initPopover: function(){
            var _this = this;
            this.$el = $(this.timeline.dom.center).find('.event-item-' + this.model.get('id'));

            this.$el.popover({
                html : true,
                title: function() {
                    return $(this).find('.popover-header').html();
                },
                content: function() {
                    return $(this).find('.popover-content').html();
                },
                trigger: 'click',
                container: 'body',
                placement: 'top'
            });

            var popovers = this.timeline.$el.find('.popover-trigger').parents('.vis-item[class*="event-item-"]');
            popovers.click(function(){
                popovers.not(this).popover('hide');
            });
            $(document).on('click', function (e) {
                if ((!$(e.target).is('.vis-item[class*="event-item-"]')
                    && $(e.target).parents('.vis-item[class*="event-item-"]').length === 0
                    && $(e.target).parents('.popover.in').length === 0)
                    || $(e.target).is('.display-mode .edit, .display-mode .remove')) {
                    popovers.popover('hide');
                }
            });
        },

        renderItem: function(){
            this.items = this.getItemsByEvent();
            EventListener.get('timeline').on('timeline-created', function(){
                this.initPopover();
                this.initEvents();
            }.bind(this));
            console.log(this.timeline);
            return this;
        }
    });

    return EventView;
});
