Ext.define('TodoApp.controller.Main', {
	extend: 'Ext.app.Controller',
	config: {
		views: [
			'SignIn',
			'List',
			'New',
			'Edit',
			'Location',
			'TodoListItem'
		],
		models: [
			'User',
			'Item'
		],
		stores: [
			'User',
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
			editForm: 'todo-edit formpanel',
			locationPanel: {
				selector: 'todo-location',
				xtype: 'todo-location',
				autoCreate: true
			},
			signInPanel: {
				selector: 'todo-sign-in',
				xtype: 'todo-sign-in',
				autoCreate: true
			},
			signInForm: 'todo-sign-in formpanel'
		},
		control: {
			// HACK: Sencha says you shouldn’t define listeners in the config object, so don’t do this
			'todo-list button[action=new]': {
				tap: 'showNewView'
			},
			'todo-list button[action=signin]': {
				tap: 'showSignInView'
			},
			'todo-list button[action=signout]': {
				tap: 'signOut'
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
				tap: 'goBack'
			},
			'todo-edit button[action=save]': {
				tap: 'saveTodoItem'
			},
			'todo-edit button[action=back]': {
				tap: 'goBack'
			},
			'todo-map button[action=set]': {
				tap: 'showLocationView'
			},
			'todo-location button[action=back]': {
				tap: 'goBack'
			},
			'todo-location button[action=set]': {
				tap: 'setLocation'
			},
			'todo-sign-in button[action=back]': {
				tap: 'goBack'
			},
			'todo-sign-in button[action=submit]': {
				tap: 'signIn'
			}
		}
	},
	syncHandler: null,
	init: function() {
		var me = this,
			store = Ext.getStore('Item'),
			record = Ext.getStore('User').first(),
			data;

		store.localDB = new PouchDB('lists');

		if (record) {
			data = record.getData();
			store.username = data.username;
			me.connect(data.username, data.password);
		}
	},
	createTodoItem: function(button, e, eOpts) {
		var store = Ext.getStore('Item');

		store.add(this.getNewForm().getValues());
		
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
		} else {
			imagePanel.down('panel').setHtml('No image loaded');
			imagePanel.down('button[text=Select]').setHidden(false);
			imagePanel.down('button[text=Remove]').setHidden(true);
		}

		this.showEditView();
	},
	deleteTodoItem: function(button, e, eOpts) {
		var dataview = this.getListDataView(),
			store = dataview.getStore(),
			record = store.findRecord('id', button.getData()).erase();

		store.remove(record);
	},
	saveTodoItem: function(button, e, eOpts) {
		var store = Ext.getStore('Item'),
			values = this.getEditForm().getValues(),
			record = store.findRecord('id', values.id);

		record.setData(values);
		record.setDirty(); // Needed otherwise update record will not sync
		store.sync();

		this.showListView();
	},
	showView: function(view, index) {
		this.createMapResource();
		this.unloadMapResource();

		for (var i = this.getMainPanel().getItems().length - 1; i >= index; --i) {
			this.getMainPanel().remove(this.getMainPanel().getAt(i), false);
		}
		this.getMainPanel().add(view);
		this.getMainPanel().setActiveItem(index);
		this.getMainPanel().activeIndex = index;

		this.loadMapResource();
	},
	goBack: function() {
		this.unloadMapResource();

		if (this.getMainPanel().activeIndex > 0) {
			this.getMainPanel().activeIndex--;
		}
		this.getMainPanel().setActiveItem(this.getMainPanel().activeIndex);

		this.loadMapResource();
	},
	showNewView: function() {
		var newPanel = this.getNewPanel(),
			newForm = this.getNewForm();

		// Reset the new panel
		newForm.reset();
		newForm.down('todo-image').down('panel').setHtml('No image loaded');
		newForm.down('todo-image').down('button[text=Select]').setHidden(false);
		newForm.down('todo-image').down('button[text=Remove]').setHidden(true);

		this.showView(newPanel, 1);
	},
	showSignInView: function() {
		this.showView(this.getSignInPanel(), 1);
	},
	showEditView: function() {
		this.showView(this.getEditPanel(), 1);
	},
	showListView: function() {
		this.showView(this.getListPanel(), 0);
	},
	showLocationView: function() {
		this.showView(this.getLocationPanel(), 2);
	},
	setLocation: function() {
		var panel = this.getLocationPanel(),
			position,
			map;

		position = panel.down('map').getMap().mapMarker.getPosition();
		this.goBack();

		panel = this.getMainPanel().getActiveItem().down('todo-map');
		panel.down('hiddenfield[name=latitude]').setValue(position.lat());
		panel.down('hiddenfield[name=longitude]').setValue(position.lng());
		panel.hideMap(panel, false);
    	panel.setMarker(panel, position.lat(), position.lng());
	},
	createMapResource: function() {
		var me = this;
		if (!this.mapResource) {
			this.mapResource = Ext.create('widget.map', {
	            xtype: 'map',
	            mapOptions: {
	                zoom: 15,
	                disableDefaultUI: true
	            },
	            listeners: {
	            	maprender: function(obj, map) {
				        var mapPanel = obj.up('todo-map') || obj.up('todo-location');

						map.mapMarker = new google.maps.Marker({
							map: map
						});

						// Trigger a resize when the bounds of the map change
						google.maps.event.addListener(map, 'bounds_changed', function() {
							var panel = obj.up('todo-map') || obj.up('todo-location');
							panel.onMapAdd(obj, map);
						});

				        if (!mapPanel.mapRendered) {
				            map.mapRendered = true;
				            mapPanel.onMapAdd(obj, map);
				        }
				    }
	            }
	        });
		}
	},
	unloadMapResource: function() {
		var map = this.getMainPanel().down('map');

		if (map) {
			map.up('panel').remove(this.mapResource, false);
		}
	},
	loadMapResource: function() {
		var map = this.getMainPanel().getActiveItem().down('todo-map') || this.getMainPanel().down('todo-location');

		if (map) {
			map.down('panel').add(this.mapResource);
		}
	},
	signIn: function() {
		var values = this.getSignInForm().getValues();
		this.getSignInForm().down('passwordfield').reset();
		this.connect(values.username, values.password);
		this.showListView();
	},
	signOut: function() {
		this.disconnect();
	},
	connect: function(username, password) {
		var itemStore = Ext.getStore('Item'),
			userStore = Ext.getStore('User');

		userStore.removeAll();
		userStore.add({
			username: username,
			password: password
		});

		itemStore.username = username;
		itemStore.password = password;

		if (this.syncHandler) {
			this.syncHandler.cancel();
		} else {
			this.startSyncing(this);
		}
	},
	disconnect: function() {
		var itemStore = Ext.getStore('Item'),
			userStore = Ext.getStore('User');

		if (this.syncHandler) {
			userStore.removeAll();
			itemStore.removeAll();
			itemStore.username = 'nobody';
			itemStore.password = null;
			this.syncHandler.cancel();
		}
	},
	startSyncing: function(me) {
		var me = this,
			store = Ext.getStore('Item');

		store.remoteDB = new PouchDB('https://' + store.username + ':' + store.password + '@djsauble.cloudant.com/lists');
		me.syncHandler = store.localDB.sync(store.remoteDB, {
			live: true,
			retry: true
		}).on('change', function (change) {
			if (change.direction == "pull" && change.change.docs.length > 0) {
				console.log("Change occurred. Synchronizing.");
				store.load();
			}
		}).on('paused', function (info) {
		}).on('active', function (info) {
		}).on('error', function (err) {
		});
		me.syncHandler.on('complete', function (info) {
			store.localDB.destroy().then(function() {
				store.localDB = new PouchDB('lists');
				me.syncHandler = null;
				me.getListPanel().down('button[action=signin]').show();
				me.getListPanel().down('button[action=signout]').hide();
				if (store.username && store.password) {
					me.startSyncing(me);
				}
			});
		});
		setTimeout(function() {
			me.getListPanel().down('button[action=signin]').hide();
			me.getListPanel().down('button[action=signout]').show();	
		}, 50);
	}
});