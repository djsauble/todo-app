Ext.define('TodoApp.view.item.Conflict', {
	extend: 'Ext.Container',
	alias: 'widget.todo-conflict',

	config: {
		layout: 'hbox',
	    items: [
	        {
	            xtype: 'button',
	            text: 'Accept',
	            action: 'accept'
	        },
	        {
	            xtype: 'button',
	            text: 'Reject',
	            action: 'reject'
	        }
	    ]
	}
});