
requirejs.config({
    baseUrl: '/js/lib',
    paths: {
        app: '../eeda',
        jquery: 'jquery/jquery-1.10.2',
        jquery_ui:'jquery-ui-1.11.4/jquery-ui',
        template: 'aui-artTemplate-3/template',
        bootstrap:'bootstrap/bootstrap',
        metisMenu:'metisMenu/jquery.metisMenu',
        sb_admin: 'sb-admin/sb-admin',
        dataTables: 'datatables/jquery.dataTables',//注意这个js被我改过（$），否则dataTables不能用
        dt: 'dt/datatables',
        zTree: 'zTree_v3/js/jquery.ztree.all-3.5.min',
        sco: 'sco/js/sco.message',
        w2ui: 'w2ui-1.4.3/w2ui-1.4.3',//new UI for grid
        datetimepicker_CN: 'bootstrap-datetimepicker/bootstrap-datetimepicker.zh-CN',
        datetimepicker: 'bootstrap-datetimepicker/bootstrap-datetimepicker.min',
        validate: 'validate/jquery.validate.min',
        validate_cn: 'validate/jvalidate.messages_cn',
        jq_ui_widget: 'jQuery-File-Upload-9.9.3/js/vendor/jquery.ui.widget',
        file_upload: 'jQuery-File-Upload-9.9.3/js/jquery.fileupload'
    },
    shim: {
        bootstrap:{
            deps: ['jquery']
        },
        dataTables: {
            deps: ['jquery']
        },
        dt: {
            deps: ['jquery']
        },
        metisMenu: {
            deps: ['jquery', 'bootstrap']
        },
        sb_admin: {
            deps: ['metisMenu']
        },
        zTree: {
            deps: ['jquery']
        },
        jquery_ui: {
            deps: ['jquery']
        },
        sco: {
            deps: ['jquery']
        },
        w2ui: {
            deps: ['jquery']
        },
        datetimepicker:{
            deps: ['jquery']
        },
        datetimepicker_CN:{
            deps: ['datetimepicker']
        },
        validate:{
            deps: ['jquery']
        },
        validate_cn:{
            deps: ['validate']
        },
        jq_ui_widget:{
            deps: ['jquery']
        },
        file_upload:{
            deps: ['jq_ui_widget']
        }
    }
});
