Ext.define('TodoApp.view.Map', {
	extend: 'Ext.form.FieldSet',
	alias: 'widget.todo-map',
	requires: [
		'Ext.Map'
	],

	config: {
        xtype: 'fieldset',
        title: 'Location',
        items: [
        	{
        		xtype: 'hiddenfield',
        		name: 'latitude'
        	},
        	{
        		xtype: 'hiddenfield',
        		name: 'longitude'
        	},
        	{
        		xtype: 'map',
        		useCurrentLocation: true,
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
        	},
            {
                xtype: 'button',
                text: 'Set',
                handler: function(button) {
                	var parent = button.up('todo-map');
                	parent.setMarker(parent);

                    var position = parent.mapMarker.getPosition();
                    parent.down('hiddenfield[name=latitude]').setValue(position.lat());
                    parent.down('hiddenfield[name=longitude]').setValue(position.lng());
                }
            },
            {
            	xtype: 'button',
            	text: 'Clear',
            	hidden: true,
            	handler: function(button) {
            		var parent = button.up('todo-map');
            		parent.clearMarker(parent);

                    parent.down('hiddenfield[name=latitude]').setValue(null);
                    parent.down('hiddenfield[name=longitude]').setValue(null);
            	}
            }
        ]
	},

	mapMarker: null,
	mapCenter: null,

    onMapRender: function(obj, map) {
        var mapPanel = obj.up('todo-map'),
            longitude = mapPanel.down('hiddenfield[name=longitude]').getValue(),
            latitude = mapPanel.down('hiddenfield[name=latitude]').getValue(),
            centerMarker = new google.maps.Marker({
                map: map,
                opacity: 0.5
            });

        centerMarker.bindTo('position', map, 'center');
        mapPanel.mapCenter = centerMarker;

        if (longitude && latitude) {
            mapPanel.setMarker(mapPanel, latitude, longitude);
        } else {
            mapPanel.mapCenter.setVisible(true);
        }
    },

	setMarker: function(me, latitude, longitude) {
		var map = me.down('map').getMap(),
            position;

		if (me.mapMarker) {
			me.mapMarker.setMap(null);
		}

        if (latitude && longitude) {
            position = new google.maps.LatLng(latitude, longitude);
        } else {
            position = map.getCenter();
        }

		me.mapMarker = new google.maps.Marker({
			position: position,
			map: map
		});

		me.down('button[text=Set]').setHidden(true);
		me.down('button[text=Clear]').setHidden(false);
        me.down('map').setUseCurrentLocation(false);
		me.down('map').setMapOptions({
            center: me.mapMarker.getPosition(),
            draggable: false
        });
		me.mapCenter.setVisible(false);
	},

	clearMarker: function(me) {
		if (me.mapMarker) {
			me.mapMarker.setMap(null);
		}

		me.down('button[text=Set]').setHidden(false);
		me.down('button[text=Clear]').setHidden(true);
		me.down('map').setMapOptions({draggable: true});
		me.mapCenter.setVisible(true);
	}
});