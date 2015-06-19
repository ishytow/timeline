define([
    'underscore',
    'backbone',
    'utils'
], function (_, Backbone, Utils) {
    'use strict';

    var UserModel = Backbone.Model.extend({
        url: function(){
            if(typeof (this.get('id')) !== 'undefined' && this.get('id') !== null && this.get('id') !== ''){
                return 'https://193.106.27.210/services/users/' + this.get('id');
            }

            return 'https://193.106.27.210/services/calendars/' + this.calendarId + '/users';
        },

        idAttribute: 'id',

        initialize: function(data, options) {
            if(options && options.calendarId){
                this.calendarId = options.calendarId;
            }else if(this.collection && this.collection.calendarId){
                this.calendarId = this.collection.calendarId;
            }
        },

        defaults: function(){
            return {
                firstName: 'FName',
                lastName: 'LName',
                email: Utils.getUuid().substr(0,3) + '@gmail.com',
                altEmail: 'alt-blah@gmail.com',
                gender: false,
                mobileNumber: '+380746464646',
                workNumber: '+15322323345',
                address: 'address',
                active: true,
                workTimeFrom: {
                    hours: null,
                    minutes: null
                },
                workTimeTo: {
                    hours: null,
                    minutes: null
                }
            }
        }
    });

    return UserModel;
});
