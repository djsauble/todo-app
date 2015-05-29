Ext.define('TodoApp.view.List', {
    extend: 'Ext.Panel',
    alias: 'widget.todo-list',
    requires: [
        'Ext.TitleBar',
        'Ext.List'
    ],

    config: {
    	items: [
	        {
	            docked: 'top',
	            xtype: 'titlebar',
	            title: 'Things to do',
	            items: {
	                align: 'right',
	                text: 'Add',
	                action: 'new'
	            }
	        },
	        {
	        	xtype: 'list',
	        	height: '100%',

			    store: {
			        fields: ['name'],
			        data: [
			            {name: 'Eat food'},
			            {name: 'Fetch slippers'},
			            {name: 'Sit/stay'},
			            {name: 'Chew bone'},
			            {name: 'Go for a walk'},
			            {name: 'Chase the mail carrier'},
			            {name: ''},
			            {name: 'Deleted items'},
			            {name: 'Play with Sparky'},
			            {name: 'Howl at the moon'},
			            {name: 'Chase the cat'}
			        ]
			    },

			    itemTpl: '{name}'
	        }
    	]
    }
});