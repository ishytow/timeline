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
        modalEl: null,

        initialize: function () {
            EventListener.get('timeline').on('timeline-created', function(options){
                this.initPopover(options.timeLineEl);
            }.bind(this));
        },

        getItemsByEvent: function(calendar){
            var items = [];
            var days = Utils.getDays();
            var eventStartDate = moment(this.model.get('startDate'));
            var eventEndDate = moment(this.model.get('endDate'));
            var startScaleDate = moment(Utils.getStartScaleDate(calendar));
            var endScaleDate = moment(Utils.getEndScaleDate(calendar));
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
                        id: this.model.get('uuid') + '-g-' + i,
                        uuid: this.model.get('uuid'),
                        className: 'event-item-' + this.model.get('uuid'),
                        assignTo: this.model.get('assignTo'),
                        eventTitle: this.model.get('title'),
                        description: this.model.get('description'),
                        startDate: eventStartDate.locale('en').format('MMM DD, '+ Utils.getHoursFormat()),
                        endDate: eventEndDate.locale('en').format('MMM DD, '+ Utils.getHoursFormat()),
                        start: start,
                        end: end,
                        group: i,
                        subgroup: 'sg-' + this.model.get('uuid') + '-g-' + i
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
                var selector = '.popover-content .event-uuid-' + this.model.get('uuid');
                $(document).off('click', selector + ' .edit').on('click', selector + ' .edit', this.edit.bind(this));
                $(document).off('click', selector + ' .remove').on('click', selector + ' .remove', this.removeEvent.bind(this));
                EventListener.get('timeline')
                    .off('edit-event-' + this.model.get('uuid'))
                    .on('edit-event-' + this.model.get('uuid'), function(){
                        this.edit();
                }.bind(this));
                EventListener.get('timeline')
                    .off('remove-event-' + this.model.get('uuid'))
                    .on('remove-event-' + this.model.get('uuid'), function(){
                        this.removeEvent();
                }.bind(this));
                this.isEventInitialized = true;
            }
        },

        renderCreateModal: function(){
            this.renderEditModal(true);
        },

        renderEditModal: function(isNew){
            $('#modals-container').html(this.editModalTemplate(this.model.toJSON()));
            this.editModal = $('#modals-container #edit-modal-' + this.model.get('uuid'));
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
                minDate: this.model.get('startDate')
            });

            this.editModal.find('.start-dp').on("dp.change", function (e) {
                this.editModal.find('.end-dp').data("DateTimePicker").minDate(e.date);
            }.bind(this));

            var usersCollection = new UsersCollection(Utils.getMockedUsers());
            var usersView = new UsersView({collection: usersCollection});
            this.editModal.find('.user').html(usersView.renderSelect().$selectEl);

            this.editModal.find('.users-select').select2({
                multiple: false,
                dropdownCssClass: 'select2-event-users'
            });

            this.editModal.find('.users-select').val('').trigger('change');

            this.editModal.find('.save').on('click', function(){
                var updatedValues = {
                    title: this.editModal.find('.title').val(),
                    description: this.editModal.find('.description').val(),
                    startDate: moment(this.editModal.find('.start-dp').val(), 'MMM DD, '+ Utils.getHoursFormat(), 'en').toDate().getTime(),
                    endDate: moment(this.editModal.find('.end-dp').val(), 'MMM DD, '+ Utils.getHoursFormat(), 'en').toDate().getTime()
                };
                this.model.set(updatedValues);
                this.editModal.modal('hide');
                //TODO:
                //this.model.save();
            }.bind(this));

            this.editModal.find('.cancel').on('click', function(){
                if(isNew && isNew === true){
                    this.model.trigger('cancel-create', this.model);
                    //TODO:
                    // this.model.destroy();
                }
            }.bind(this));
        },

        renderRemoveModal: function(){
            $('#modals-container').html(this.removeModalTemplate(this.model.toJSON()));
            this.removeModal = $('#modals-container #remove-modal-' + this.model.get('uuid'));
            this.removeModal.modal('show');
            this.removeModal.find('.remove').on('click', function(){
                this.removeModal.modal('hide');
                this.model.trigger('destroy', this.model);
                //TODO:
                // this.model.destroy();
            }.bind(this));
        },

        initPopover: function(timeLineEl){
            var _this = this;
            this.$el = timeLineEl.find('.event-item-' + this.model.get('uuid'));
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

            this.initEvents();
        },

        renderItem: function(calendar){
            this.items = this.getItemsByEvent(calendar);
            return this;
        }
    });

    return EventView;
});
