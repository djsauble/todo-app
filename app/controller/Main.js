Ext.define('TodoApp.controller.Main', {
	extend: 'Ext.app.Controller',
	config: {
		views: [
			'List',
			'New',
			'Edit',
			'TodoListItem'
		],
		models: [
			'Item'
		],
		stores: [
			'Item'
		],
		refs: {
			mainPanel: 'todo-main',
			listPanel: {
				selector: 'todo-list',
				xtype: 'todo-list',
				autoCreate: true
			},
			listDataView: 'todo-list dataview',
			newPanel: {
				selector: 'todo-new',
				xtype: 'todo-new',
				autoCreate: true
			},
			newForm: 'todo-new formpanel',
			editPanel: {
				selector: 'todo-edit',
				xtype: 'todo-edit',
				autoCreate: true
			},
			editForm: 'todo-edit formpanel'
		},
		control: {
			// HACK: Sencha says you shouldn’t define listeners in the config object, so don’t do this
			'todo-list button[action=new]': {
				tap: 'showNewView'
			},
			'todo-list button[action=edit]': {
				tap: 'editTodoItem'
			},
			'todo-list button[action=delete]': {
				tap: 'deleteTodoItem'
			},
			'todo-new button[action=create]': {
				tap: 'createTodoItem'
			},
			'todo-new button[action=back]': {
				tap: 'showListView'
			},
			'todo-edit button[action=save]': {
				tap: 'saveTodoItem'
			},
			'todo-edit button[action=back]': {
				tap: 'showListView'
			}
		}
	},
	createTodoItem: function(button, e, eOpts) {
		var store = Ext.create('TodoApp.store.Item');

		store.add(this.getNewForm().getValues())
		store.sync();
		
		this.showListView();
	},
	editTodoItem: function(button, e, eOpts) {
		var store = this.getListDataView().getStore(),
			editPanel = this.getEditPanel(),
			editForm = this.getEditForm(),
			imagePanel = editForm.down('todo-image'),
			record = store.findRecord('id', button.getData()),
			mediaData = record.get('media');

		editForm.setRecord(record);

		// Show the associated image
		if (mediaData) {
			imagePanel.down('panel').setHtml('<img src="' + record.get('media') + '" alt="todo image" width="100%"/>');
			imagePanel.down('button[text=Select]').setHidden(true);
			imagePanel.down('button[text=Remove]').setHidden(false);
		}

		this.showEditView();
	},
	deleteTodoItem: function(button, e, eOpts) {
		var dataview = this.getListDataView(),
			store = dataview.getStore(),
			record = store.findRecord('id', button.getData()).erase();

		record.erase();
		store.load();
		dataview.refresh();
	},
	saveTodoItem: function(button, e, eOpts) {
		var store = Ext.create('TodoApp.store.Item'),
			values = this.getEditForm().getValues(),
			record = store.findRecord('id', values.id);

		record.setData(values);
		record.setDirty(); // Needed otherwise update record will not sync
		store.sync();

		this.showListView();
	},
	showView: function(view) {
		if (!this.mapResource) {
			this.mapResource = Ext.create('widget.map', {
                xtype: 'map',
                width: 'auto',
                height: 300,
                mapOptions: {
                    zoom: 15
                },
                listeners: {
                    maprender: function(obj, map) {
                        var parent = this.up('todo-map');
                        parent.onMapRender(obj, map);
                    }
                }
            });
		}
		var map = this.getMainPanel().down('todo-map');
		if (map) {
			map.down('panel').remove(this.mapResource, false);
		}
		this.getMainPanel().removeAll();
		this.getMainPanel().add(view);
		map = this.getMainPanel().down('todo-map');
		if (map) {
			map.down('panel').add(this.mapResource);
		}
	},
	showNewView: function() {
		this.showView(this.getNewPanel());
	},
	showEditView: function() {
		this.showView(this.getEditPanel());
	},
	showListView: function() {
		this.showView(this.getListPanel());
	}
});
