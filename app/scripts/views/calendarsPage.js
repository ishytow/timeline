/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'utils',
    'EventListener',
    'collections/calendars',
    'collections/users',
    'views/calendars',
    'views/users',
    'select2',
    'helpers/use24'
], function ($, _, Backbone, JST, Utils, EventListener, CalendarsCollection, UsersCollection, CalendarsView, UsersView) {
    'use strict';

    var CalendarsPage = Backbone.View.extend({
        template: JST['app/scripts/templates/calendars-page.hbs'],
        tagName: 'div',
        calendarsCollection: null,
        calendarsView: null,

        initialize: function(){
            this.calendarsCollection = new CalendarsCollection();
            this.usersCollection = new UsersCollection();
        },

        renderUsers: function(calendarUuid){
            var _this = this;

            this.usersCollection.set(Utils.getMockedUsers(calendarUuid));
            this.usersView = new UsersView({collection: this.usersCollection});
            this.$el.find('#users .select').html(this.usersView.renderSelect().$selectEl);
            this.$el.find('.users-select').select2({
                placeholder: "Select users",
                allowClear: true,
                multiple: true,
                dropdownCssClass: 'select2-users'
            });
            this.$el.find('.users-select').val('').trigger('change');
            this.$el.find('.users-select').on('change', function(e){
                var selectedIds = $(this).val();
                $.each(_this.$el.find('#users .user'), function(){
                    if(selectedIds === null){
                        $(this).fadeIn();
                    }else if($.inArray($(this).data('uuid').toString(), selectedIds) === -1){
                        $(this).fadeOut();
                    }else{
                        $(this).fadeIn();
                    }
                });
            });
            this.$el.find('#users .list-container').html(this.usersView.render().el);
        },

        initEvents: function(){
            EventListener.get('timeline').on('calendar-shown', function(e){
                this.renderUsers(e.uuid);
            }.bind(this));

            $(document).off('mouseenter mouseleave','.vis-item').on({
                mouseenter: function () {
                    var userId = $(this).find('.event-item-content').data('eventUserId');
                    $('.user[data-uuid="' + userId + '"]').addClass('hoverUser');
                    $('.event-item-content[data-event-user-id="' + userId + '"]').parents('.vis-item').addClass('hoverEvent');
                },
                mouseleave: function () {
                    var userId = $(this).find('.event-item-content').data('eventUserId');
                    $('.user[data-uuid="' + userId + '"]').removeClass('hoverUser');
                    $('.event-item-content[data-event-user-id="' + userId + '"]').parents('.vis-item').removeClass('hoverEvent');
                }
            },'.vis-item');

            $(document).off('mouseenter mouseleave','#users .user').on({
                mouseenter: function () {
                    var userId = $(this).data('uuid');
                    $(this).addClass('hoverUser');
                    $('.event-item-content[data-event-user-id="' + userId + '"]').parents('.vis-item').addClass('hoverEvent');
                },
                mouseleave: function () {
                    var userId = $(this).data('uuid');
                    $(this).removeClass('hoverUser');
                    $('.event-item-content[data-event-user-id="' + userId + '"]').parents('.vis-item').removeClass('hoverEvent');
                }
            },'#users .user');

            $(document).on('change', '.use24 input', function(){
                Utils.setUse24($(this).prop("checked"));
                EventListener.get('timeline').trigger('use24');
            });
            $(document).on('click', function(e){
                if($(e.target).parents('.use24').length === 0){
                    $('#context-menu').hide();
                }
            }.bind(this));
        },

        render: function () {
            this.$el.html(this.template());
            this.calendarsCollection.fetch({
                success: function(){
                    this.calendarsView = new CalendarsView({collection: this.calendarsCollection});
                    this.$el.find('#calendars-container').html(this.calendarsView.render().$el);
                }.bind(this)
            });
            this.initEvents();

            return this;
        }
    });

    return CalendarsPage;
});
