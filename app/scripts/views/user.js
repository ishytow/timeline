/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'jquery-ui'
], function ($, _, Backbone, JST) {
    'use strict';

    var UserView = Backbone.View.extend({
        template: JST['app/scripts/templates/user.hbs'],
        templateSelectItem: JST['app/scripts/templates/user-select-item.hbs'],

        tagName: 'div',

        className: 'user row',

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
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
            return this;
        },

        renderSelectItem: function () {
            this.$selectItemEl = $(this.templateSelectItem(this.model.toJSON()));
            return this;
        }
    });

    return UserView;
});
