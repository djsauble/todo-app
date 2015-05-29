Ext.define('TodoApp.controller.Main', {
	extend: 'Ext.app.Controller',
	config: {
		views: [
			'List',
			'New',
			'Edit'
		],
		refs: {
			mainPanel: 'todo-main',
			listPanel: {
				selector: 'todo-list',
				xtype: 'todo-list',
				autoCreate: true
			},
			newPanel: {
				selector: 'todo-new',
				xtype: 'todo-new',
				autoCreate: true
			},
			editPanel: {
				selector: 'todo-edit',
				xtype: 'todo-edit',
				autoCreate: true
			}
		},
		control: {
			// HACK: Sencha says you shouldn’t define listeners in the config object, so don’t do this
			'todo-list button[action=new]': {
				tap: 'showNewView'
			},
			'todo-list list': {
				itemtap: 'showEditView'
			},
			'todo-new button[action=save]': {
				tap: 'showListView'
			},
			'todo-edit button[action=save]': {
				tap: 'showListView'
			}
		}
	},
	showView: function(view) {
		this.getMainPanel().removeAll();
		this.getMainPanel().add(view);
	},
	showListView: function() {
		this.showView(this.getListPanel());
	},
	showNewView: function() {
		this.showView(this.getNewPanel());
	},
	showEditView: function() {
		this.showView(this.getEditPanel());
	}
});