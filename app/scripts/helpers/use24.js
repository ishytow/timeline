require(['handlebars', 'utils'], function(Handlebars, Utils){
    Handlebars.registerHelper('use24', function() {
        if(Utils.isUse24() === true){
            return 'checked="checked"';
        }
        return '';
    });
});
