Ext.define('TodoApp.view.Edit', {
    extend: 'Ext.Panel',
    alias: 'widget.todo-edit',
    requires: [
        'Ext.TitleBar',
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.field.Radio'
    ],

    config: {
        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                title: 'Edit item',
                items: {
                    align: 'right',
                    text: 'Save',
                    action: 'save'
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
});