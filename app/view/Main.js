Ext.define('TodoApp.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    requires: [
        'Ext.TitleBar',
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.field.Radio',
        'Ext.List'
    ],
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                title: 'List',
                iconCls: 'home',

                xtype: 'list',

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

                itemTpl: '{name}',

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Things to do',
                        items: {
                            align: 'right',
                            text: 'Add'
                        }
                    }
                ]
            },
            {
                title: 'Create',
                iconCls: 'action',

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Add item',
                        items: {
                            align: 'right',
                            text: 'Save'
                        }
                    },
                    {
                        xtype: 'formpanel',
                        height: '100%',
                        scrollable: true,

                        items: [
                            {
                                xtype: 'fieldset',
                                title: 'Description',
                                items: {xtype: 'textfield'}
                            },
                            {
                                xtype: 'fieldset',
                                title: 'Image',
                                items: {
                                    xtype: 'button',
                                    text: 'Select image…'
                                }
                            },
                            {
                                xtype: 'fieldset',
                                title: 'Location',
                                defaults: {
                                    labelAlign: 'right',
                                    labelWidth: '240px',
                                    xtype: 'radiofield',
                                    name: 'location'
                                },
                                items: [
                                    {value: 'here', label: 'Current location'},
                                    {value: 'home', label: 'Home'},
                                    {value: 'work', label: 'Work'}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Edit',
                iconCls: 'action',

                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Edit item',
                        items: {
                            align: 'right',
                            text: 'Save'
                        }
                    },
                    {
                        xtype: 'formpanel',
                        height: '100%',
                        scrollable: true,

                        items: [
                            {
                                xtype: 'fieldset',
                                title: 'Description',
                                items: {
                                    xtype: 'textfield',
                                    value: 'Chase the mail carrier'
                                }
                            },
                            {
                                xtype: 'fieldset',
                                title: 'Image',
                                items: [
                                    {
                                        xtype: 'panel',
                                        width: '100%',
                                        height: 156,
                                        style: 'background: #AAAAAA'
                                    },
                                    {
                                        xtype: 'button',
                                        text: 'Remove image'
                                    }
                                ]
                            },
                            {
                                xtype: 'fieldset',
                                title: 'Location',
                                defaults: {
                                    labelAlign: 'right',
                                    labelWidth: '240px',
                                    xtype: 'radiofield',
                                    name: 'location'
                                },
                                items: [
                                    {value: 'home', label: 'Home', checked: true},
                                    {value: 'work', label: 'Work'},
                                    {value: 'other', label: 'Other'}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
});