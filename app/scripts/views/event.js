/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'moment',
    'utils',
    'EventListener',
    'bootstrap-datepicker'
], function ($, _, Backbone, JST, moment, Utils, EventListener) {
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

        getItemsByEvent: function(){
            var items = [];
            var days = Utils.getDays();
            var eventStartDate = moment(this.model.get('startDate'));
            var eventEndDate = moment(this.model.get('endDate'));
            var startScaleDate = moment(Utils.getStartScaleDate());
            var endScaleDate = moment(Utils.getEndScaleDate());
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
                        userName: this.model.get('userName'),
                        eventTitle: this.model.get('eventTitle'),
                        eventDescription: this.model.get('eventDescription'),
                        eventStartDate: eventStartDate.locale('en').format('MM.DD, HH:mm'),
                        eventEndDate: eventEndDate.locale('en').format('MM.DD, HH:mm'),
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
            $('#modals-container').html(this.editModalTemplate(this.model.toJSON()));
            this.initEditModal();
        },

        removeEvent: function(){
            $('#modals-container').html(this.removeModalTemplate(this.model.toJSON()));
            this.initRemoveModal();
        },

        initEvents: function(){
            var selector = '.popover-content .event-id-' + this.model.get('id');
            $(document).off('click', selector + ' .edit').on('click', selector + ' .edit', this.edit.bind(this));
            $(document).off('click', selector + ' .remove').on('click', selector + ' .remove', this.removeEvent.bind(this));
        },

        initEditModal: function(){
            this.editModal = $('#modals-container #edit-modal-' + this.model.get('id'));
            this.editModal.modal('show');
            this.editModal.find('.start-dp').datetimepicker({
                defaultDate: this.model.get('startDate'),
                locale: 'en',
                format: 'MMM.DD.YYYY, HH:mm'
            });
            this.editModal.find('.end-dp').datetimepicker({
                defaultDate: this.model.get('endDate'),
                locale: 'en',
                format: 'MMM.DD.YYYY, HH:mm',
                minDate: this.model.get('startDate')
            });

            this.editModal.find('.start-dp').on("dp.change", function (e) {
                this.editModal.find('.end-dp').data("DateTimePicker").minDate(e.date);
            }.bind(this));

            this.editModal.find('.end-dp').on("dp.change", function (e) {
                this.editModal.find('.start-dp').data("DateTimePicker").maxDate(e.date);
            }.bind(this));

            this.editModal.find('.save').on('click', function(){
                var updatedValues = {
                    title: this.editModal.find('.title'),
                    description: this.editModal.find('.description'),
                    startDate: new Date(this.editModal.find('.start-dp').val()),
                    endDate: new Date(this.editModal.find('.end-dp').val())
                };
                this.model.set(updatedValues);
                this.editModal.modal('hide');
                //TODO:
                //this.model.save();
            }.bind(this));
        },

        initRemoveModal: function(){
            this.removeModal = $('#modals-container #remove-modal-' + this.model.get('id'));
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
            this.$el = timeLineEl.find('.event-item-' + this.model.get('id'));
            this.$el.popover({
                html : true,
                title: function() {
                    return $(this).parent().find('.popover-header').html();
                },
                content: function() {
                    return $(this).parent().find('.popover-content').html();
                },
                trigger: 'click',
                container: 'body',
                placement: 'top'
            });

            this.initEvents();
        },

        renderItem: function(){
            this.items = this.getItemsByEvent(this.days);
            return this;
        }
    });

    return EventView;
});
