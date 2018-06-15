define(['jquery',
        'underscore',
	    'backbone',
        'core/config',
        'appViews/views'

    ], function($,_, Backbone,config,  views){

   var Workspace = Backbone.Router.extend({
              routes: {
                '*filter': 'renderDesc'
              },
              renderDesc    : function(param){
                  this.nowUrl = param;
                  views.render(param);
              },
              nowUrl : undefined
        });


        return new Workspace();

    });