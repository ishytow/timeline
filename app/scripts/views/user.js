/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'EventListener',
    'jquery-ui'
], function ($, _, Backbone, JST, EventListener) {
    'use strict';

    var UserView = Backbone.View.extend({
        template: JST['app/scripts/templates/user.hbs'],
        templateSelectItem: JST['app/scripts/templates/user-select-item.hbs'],
        editModalTemplate: JST['app/scripts/templates/user-edit-modal.hbs'],
        removeModalTemplate: JST['app/scripts/templates/user-remove-modal.hbs'],

        tagName: 'div',

        className: 'user row',

        events: {
            'dblclick': 'renderEditModal'
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },

        renderEditModal: function(options){
            $('#modals-container').html(this.editModalTemplate(this.model.toJSON()));
            this.editModal = $('#modals-container #edit-modal-' + this.model.get('uuid'));
            this.editModal.modal('show');

            this.editModal.find('.save').on('click', function(){
                var updatedValues = {
                    firstName: this.editModal.find('.firstName').val(),
                    lastName: this.editModal.find('.lastName').val()
                };

                this.model.set(updatedValues);
                this.editModal.modal('hide');
                //TODO:
                //this.model.save();
                if(options && options.save){
                    options.save.call({}, this.model);
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

        render: function () {
            this.$el.html(this.template(this.model.toJSON())).attr('data-uuid', this.model.get('uuid'));
            this.$el.draggable({
                cursor: 'move',
                cursorAt:{
                    top: 5,
                    left: 5
                },
                helper: 'clone',
                start: function(e, ui){
                    $(ui.helper).addClass("draggable-user");
                },
                revert: false
            });

            EventListener.get('users').off('edit-user-' + this.model.get('uuid'))
                .on('edit-user-' + this.model.get('uuid'), this.renderEditModal.bind(this));
            EventListener.get('users').off('remove-user-' + this.model.get('uuid'))
                .on('remove-user-' + this.model.get('uuid'), this.renderRemoveModal.bind(this));

            return this;
        },

        renderSelectItem: function () {
            this.$selectItemEl = $(this.templateSelectItem(this.model.toJSON()));
            return this;
        }
    });

    return UserView;
});
