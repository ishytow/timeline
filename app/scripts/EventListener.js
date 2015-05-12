define(['backbone'], function (Backbone) {
    var listeners = {
        global: _.extend({}, Backbone.Events)
    };

    var get = function(namespace){
        if(namespace){
            if(typeof(listeners[namespace]) !== 'undefined' && listeners[namespace] !== null){
                return listeners[namespace];
            }else{
                listeners[namespace] = _.extend({}, Backbone.Events);
                return listeners[namespace]
            }
        }else{
            return listeners['global'];
        }
    };

    return {
        get: get,
        listeners: listeners
    };
});