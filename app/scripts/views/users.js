/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'models/user',
    'views/user',
    'EventListener'
], function ($, _, Backbone, JST, UserModel, UserView, EventListener) {
    'use strict';

    var UsersView = Backbone.View.extend({
        template: JST['app/scripts/templates/users.hbs'],
        selectTemplate: JST['app/scripts/templates/users-select.hbs'],
        templateMenuUser: JST['app/scripts/templates/menu-user.hbs'],
        templateMenuUserDefault: JST['app/scripts/templates/menu-user-default.hbs'],

        tagName: 'div',
        className: 'list',

        initialize: function () {
            this.listenTo(this.collection, 'add', this.render );
            this.listenTo(this.collection, "destroy", this.render );
        },

        addUser: function(){
            var userModel = new UserModel();
            var userView = new UserView({model: userModel});
            userView.renderEditModal({
                save: function(model){
                    console.log(model);
                    this.collection.add(model);
                }.bind(this)
            });
        },

        editUser: function(uuid){
            EventListener.get('users').trigger('edit-user-' + uuid);
        },

        removeUser: function(uuid){
            EventListener.get('users').trigger('remove-user-' + uuid);
        },

        renderContextMenu: function(e){
            e.preventDefault();
            var uuid = null;

            if($(e.target).hasClass('user')){
                uuid = $(e.target).data('uuid');
            }else if($(e.target).parents('.user').length > 0){
                uuid = $(e.target).parents('.user').data('uuid');
            }

            if(uuid !== null){
                this.contextMenu.html(this.templateMenuUser());
            }else{
                this.contextMenu.html(this.templateMenuUserDefault());
            }

            this.contextMenu.css({
                display: 'block',
                position: 'absolute',
                left: e.pageX + 'px',
                top: e.pageY + 'px'
            }).off('click');

            this.contextMenu.find('.add').on('click', function(){
                this.addUser();
            }.bind(this));
            this.contextMenu.find('.edit').on('click', function(){
                this.editUser(uuid);
            }.bind(this));
            this.contextMenu.find('.remove').on('click', function(){
                this.removeUser(uuid);
            }.bind(this));
        },

        render: function () {
            this.contextMenu = $('#context-menu');
            this.$el.html(this.template());
            this.collection.each(function(user){
                var userView = new UserView({model: user});
                this.$el.append(userView.render().$el);
            }.bind(this), this);

            return this;
        },

        renderSelect: function () {
            this.$selectEl = $(this.selectTemplate());
            this.collection.each(function(user){
                var userView = new UserView({model: user});
                this.$selectEl.append(userView.renderSelectItem().$selectItemEl);
            }.bind(this), this);
            this.$el.off('contextmenu').on('contextmenu', this.renderContextMenu.bind(this));

            return this;
        }
    });

    return UsersView;
});
