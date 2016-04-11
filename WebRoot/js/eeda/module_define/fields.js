
/*
    jquery_ui:  use sortable
    sco: save success/err msg

 */
define(['jquery_ui', 'sco', 'w2ui', './action', './event', './auth', './fields_add_btn_type', './customize_search'],
    function(jquery_ui, sco, w2ui, actionController, eventController, authContr, fieldAddBtnContr, customContr){

    var template = require('template');
    var w2ui = window.w2ui;

    //注意这里！
    //直接使用actionController 在saveAction()中是访问不到的，原因 ？？
    var buildActionArray = actionController.buildActionArray;
    var buildEventArray = eventController.buildEventArray;

	document.title = '模块定义 | '+document.title;
    $('#menu_sys_dev').addClass('active').find('ul').addClass('in');
    $('[data-toggle=tooltip]').tooltip();
    //-------------   子表的动态处理
    var subIndex=0;
    //添加一个新子表
    $('#addTableBtn').click(function function_name (argument) {

        var structure_names = [];
        var s_names = $('section .s_name');
        for(var i=0; i<s_names.length; i++){
            structure_names.push($(s_names[i]).val());
        }

        var html = template('table_template',
            {s_name: 'sub'+subIndex,
             structure_names: structure_names,
             s_type:'字段'
            });
        $('#fields_body').append(html);
        $('#fields_body table:last').DataTable(tableSetting);

        subIndex++;

        bindFieldTableEvent();
    });

    var deletedTableIds=[];
    //删除一个新子表
    $('#fields_body').on('click', 'a.remove', function(event) {
        var s_id = $(this).parent().find('input.s_id').val();
        $(this).parent().remove();
        if(s_id != '')
            deletedTableIds.push(s_id);
    });

    //添加字段
    $('#fields_body').on('click', 'button[name=addFieldBtn]', function(event) {
        var section = $(this).parent().parent();
        var sectionDataTable = $(section.find('table:first')[0]).DataTable();
        var item={
            "ID": '',
            "FIELD_NAME": '',
            "FIELD_TYPE": '',
            "REQUIRED": '',
            "LISTED": '',
            "FIELD_TEMPLATE_PATH": '',
            "INDEX_NAME": ''
        };
        sectionDataTable.row.add(item).draw(false);
    });

    //定义子表“显示类型”：字段，列表
    $('#fields_body').on('change', 'select.s_type', function(event) {
        var select = $(this);
        var add_btn_type_field = select.parent().parent().parent().find('div[name=add_btn_type_field]')
        if('字段' == select.val()){
            add_btn_type_field.hide();
        }else{
            add_btn_type_field.show();
        }
    });
    //定义“新增”按钮类型
    $('#fields_body').on('change', 'select.s_add_btn_type', function(event) {
        var select = $(this);
        var editIcon = select.parent().find('a[name=addBtnSetting]');
        if('添加空行' == select.val()){
            editIcon.hide();
        }else{
            editIcon.show();
        }
    });
    //-------------   子表的动态处理

    var tableSetting = {
        paging: false,
        sortable: false,
        "info": false,
        "processing": true,
        "searching": false,
        "autoWidth": true,
        "language": {
            "url": "/yh/js/plugins/datatables-1.10.9/i18n/Chinese.json"
        },
        "createdRow": function ( row, data, index ) {
            $(row).attr('id', data.ID);
            $(row).append("<input class='ext_type' type='hidden' value='"+data.FIELD_TYPE_EXT_TYPE+"'/>");
            $(row).append("<textarea class='ext_text' style='display: none;' >'"+data.FIELD_TYPE_EXT_TEXT+"</textarea>");
        },
        //"ajax": "/damageOrder/list",
        "columns": [
            { "width": "10px", "orderable":false,
                "render": function ( data, type, full, meta ) {
                  return '&nbsp;&nbsp;<a class="remove delete" href="javascript:void(0)" title="删除"><i class="glyphicon glyphicon-remove"></i> </a>&nbsp;&nbsp;';
                }
            },
            { "data": "ID", visible: false},
            { "data": "FIELD_DISPLAY_NAME", "width": "130px",
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<input type="text" value="'+data+'" class="field_display_name form-control"/>';
                }
            },
            { "data": "FIELD_TYPE", "width": "130px",
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                    return  '<div class="form-group input-group" style="    padding-top: 4px;">'+
                            '    <input type="text" class="form-control field_type" disabled value="'+data+'">'+
                            '    <span class="input-group-addon" style="color:#428bca;cursor: pointer;"><i class="glyphicon glyphicon-edit"></i></span>'
                            '</div>';
                }
            },
            // { "data": "FIELD_RULE", "width": "80px",
            //     "render": function ( data, type, full, meta ) {
            //         if(!data)
            //             data='';

            //         return  '<div class="form-group input-group">'+
            //                 '    <input type="text" class="form-control">'+
            //                 '    <span class="input-group-addon">.00</span>'
            //                 '</div>';
            //     }
            // },
            { "data": "FIELD_TYPE_EXT_TYPE", visible: false,
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return "<input type='text' value='"+data+"' class='ext_type form-control'/>";
                }
            },
            { "data": "FIELD_TYPE_EXT_TEXT", visible: false,
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<input class="form-control" rows="1">'+data+'</input>';
                }
            },
            { "data": "FIELD_DATA_TYPE", visible: true,
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<select class="form-control">'
                        +'    <option '+(data=='文本'?'selected':'')+'>文本</option>'
                        +'    <option '+(data=='数值'?'selected':'')+'>数值</option>'
                        +'    <option '+(data=='日期'?'selected':'')+'>日期</option>'
                        +'</select>';
                }
            },
            { "data": "REQUIRED",
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<select class="form-control required">'
                        +'   <option '+(data=='N'?'selected':'')+'>N</option>'
                        +'   <option '+(data=='Y'?'selected':'')+'>Y</option>'
                        +'</select>';
                }
            },
            { "data": "LISTED",
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<select class="form-control listed">'
                        +'   <option '+(data=='Y'?'selected':'')+'>Y</option>'
                        +'    <option '+(data=='N'?'selected':'')+'>N</option>'
                        +'</select>';
                }
            },
            { "data": "WIDTH",
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='100';
                  return '<input type="text" value="'+data+'" class="width form-control"/>';
                }
            },
            { "data": "FIELD_TEMPLATE_PATH", visible: false,
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<input type="text" value="'+data+'" class="product_no form-control"/>';
                }
            },
            { "data": "INDEX_NAME", visible: false,
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<input type="text" value="'+data+'" class="product_no form-control"/>';
                }
            }
        ]
    };

    fields_table_setting = function(){
        return tableSetting;
    }

    var dataTable = $('#fields-table').DataTable(tableSetting);

    var renderGrid = function(field_type_ext){
        var row_id = $('#modal_row_id').val();
        var tr = $('tbody').find('tr#'+row_id)[0];

        var fields = $(tr).closest('tbody').find('input.field_display_name');

        var records=[];
        if(!field_type_ext){
            $.each(fields, function(i, item){
                var rec={
                    "recid": i+1,
                    "name": $(item).val(),
                    "exp": ""
                };
                records.push(rec);
            });
        }else{
            records = field_type_ext.assignment_list;
        }



        if(w2ui.hasOwnProperty('modal_field_grid')){
             w2ui['modal_field_grid'].destroy();
        }

        $('#modal_field_grid').w2grid({
            name: 'modal_field_grid',
            columns: [
                { field: 'name', caption: '字段<br>', size: '30%' },
                { field: 'exp' ,caption: '表达式', size: '70%', editable: { type: 'text' }}
            ],
            records:records
        });


    };
    //等页面组件装载完成后，再绑定事件
    var bindFieldTableEvent= function(){
        var $fields_table = $("#fields_body table");

        $('.addBtnSetting').click(function(){
            fieldAddBtnContr.addBtnSettingClick(this);
        });

        //编辑表中一行字段的属性
        $fields_table.on('click', '.edit, .input-group-addon', function(e){
            e.preventDefault();

            $("#modalForm")[0].reset();
            $("#modal_field_type_ext_div").hide();
            $("#customize_list").hide();

            var tr = $(this).parent().parent().parent()[0];

            var row_id= $(tr).attr('id');
            if(!row_id){
                $.scojs_message('请先保存单据', $.scojs_message.TYPE_ERROR);
                return;
            }

            $('#modal_row_id').val($(tr).attr('id'));

            $("#modal_field_name").val($(tr.children[1]).find('input').val());
            var field_type = $(tr.children[2]).find('input').val();
            if(field_type == '')
                field_type='文本编辑框';
            $("#modal_field_type").val(field_type);

            var ext_type=$(tr).find('input.ext_type').val();
            if(ext_type.length>0 && ext_type !='undefined'){
                var field_type_ext = $.parseJSON(ext_type);
                if('下拉列表' == field_type){
                    loadDropdownList(field_type_ext.id);
                    $("#modal_field_type_ext_div").show();
                }else if('数据列表' == field_type){

                    loadDataGridList(field_type_ext, this);
                }
                if(field_type_ext && field_type_ext.enter_next_line){
                    $('#modal_field_enter_next_line').prop('checked', true);
                }
                if(field_type_ext && field_type_ext.modal_field_default_value_type){
                    $("#modal_field_default_value_type").val(field_type_ext.modal_field_default_value_type)
                    if('系统内置' == field_type_ext.modal_field_default_value_type){
                        $("#modal_field_default_value_text").hide();
                        $("#modal_field_default_value").show();
                        loadSysVar(field_type_ext.modal_field_default_value);
                    }else if('自动编号' == field_type_ext.modal_field_default_value_type){
                        $("#modal_field_default_value_text").hide();
                        $("#modal_field_default_value").show();
                        loadAutoNumber(field_type_ext.modal_field_default_value);
                    }else{
                        $("#modal_field_default_value").hide();
                        $("#modal_field_default_value_text").val(field_type_ext.modal_field_default_value_text)
                        $("#modal_field_default_value_text").css('display', 'inline');
                    }
                }
            }

            $("#editField").modal('show');

        });

        //删除表中一行
        $fields_table.on('click', '.delete', function(e){
            e.preventDefault();
            var tr = $(this).parent().parent();
            var dataTable = $fields_table.DataTable();
            dataTable.row(tr).remove().draw();
        });

        $fields_table.find('tbody').sortable({
          revert: true
        });

    }

    var loadDropdownList = function(default_value){
        $.post('/m_search?&structure_id=9', function(json){
            if(json){
                var dataArr = json.data;
                var el = $("#modal_field_type_ext_type");
                el.empty();
                $.each(dataArr, function(i, item){
                    el.append('<option value="'+item.ID+'">'+item.F27_MC+'</option>');
                });
                //特殊的城市选择列表，额外加
                el.append('<option value="-1">城市列表</option>');

                if(default_value)
                    el.val(default_value);

                $("#modal_field_type_ext_div").show();
                $('#modal_field_grid_div').hide();
            }
        });
    };
    var loadDataGridList = function(field_type_ext, table_cell){
        //查找出 数据列表 有多少行
        $.post('/m_search?&structure_id=21&structure_name=数据列表', function(json){
            if(json){
                var dataArr = json.data;
                var el = $("#modal_field_type_ext_type");
                el.empty();
                $.each(dataArr, function(i, item){
                    el.append('<option value="'+item.ID+'">'+item.F46_MC+'</option>');
                });
                if(field_type_ext && field_type_ext.id){
                    el.val(field_type_ext.id);
                }else{
                    renderGrid(field_type_ext, table_cell);
                }
                $("#modal_field_type_ext_div").show(0);
                $('#modal_field_grid_div').show();
                //render grid after modal shown, 否则grid width会有问题
                $('#editField').on('shown.bs.modal', function (e) {
                    console.log('shown.bs.modal');
                    renderGrid(field_type_ext, table_cell);
                });
            }
        });
    };

    $("#modal_field_type").on('change', function(){
        if('下拉列表' == $(this).val()){
            $("#modal_field_type_ext_div").show();
            $('#modal_field_grid_div').hide();
            loadDropdownList();
        }else if('数据列表' == $(this).val()){
            $("#modal_field_type_ext_div").show();
            $('#modal_field_grid_div').show();

            loadDataGridList();
        }else{
            $("#modal_field_type_ext_div").hide();
        }
    });

    var loadSysVar = function(default_value){
        $.post('/module/getSysVar', function(dataArr){
            if(dataArr){
                var el = $("#modal_field_default_value");
                el.empty();
                $.each(dataArr, function(i, item){
                    el.append('<option value="'+item.ID+'">'+item.NAME+'</option>');
                });
                if(default_value)
                    el.val(default_value);
            }
        });
    };

    var loadAutoNumber = function(default_value){
        $.post('/m_search?structure_name=自动编号', function(json){
            if(json){
                var dataArr = json.data;
                var el = $("#modal_field_default_value");
                el.empty();
                $.each(dataArr, function(i, item){
                    el.append('<option value="'+item.ID+'">'+item.F35_MC+'</option>');
                });
                if(default_value)
                    el.val(default_value);
            }
        });
    };

    $("#modal_field_default_value_type").on('change', function(){
        if('系统内置' == $(this).val()){
            $("#modal_field_default_value_text").hide();
            $("#modal_field_default_value").show();
            loadSysVar();
        }else if('自动编号' == $(this).val()){
            $("#modal_field_default_value_text").hide();
            $("#modal_field_default_value").show();
            loadAutoNumber();
        }else{
            $("#modal_field_default_value").hide();
            $("#modal_field_default_value_text").css('display', 'inline');
        }
    });



    //对话框关闭，填值到列表中
    $('#modalFormOkBtn').click(function(){
        var row_id = $('#modal_row_id').val();
        var tr = $('tbody').find('tr#'+row_id)[0];//$('tr#'+row_id)[0];

        var field_type=$("#modal_field_type").val()
        $(tr).find('input.field_type').val(field_type);
        var enter_next_line = $('#modal_field_enter_next_line').prop('checked');
        if('下拉列表'== field_type|| '数据列表' == field_type){
            var field_type_ext={
                id: $("#modal_field_type_ext_type").val(),
                name: $("#modal_field_type_ext_type").find("option:selected").text(),
                assignment_list: w2ui['modal_field_grid']==null?[]:w2ui['modal_field_grid'].records
            }
            $(tr).find('input.ext_type').val(JSON.stringify(field_type_ext));
        }else{
            var field_type_ext={
                enter_next_line: enter_next_line,
                modal_field_default_value_type: $("#modal_field_default_value_type").val(),
                modal_field_default_value: $("#modal_field_default_value").val(),
                modal_field_default_value_text: $("#modal_field_default_value_text").val(),
            }
            $(tr).find('input.ext_type').val(JSON.stringify(field_type_ext));
        }


        $(tr).find('textarea.ext_text').text($("#modal_field_type_ext_text").val());

        $("#editField").modal('hide');
    });

    var deletedItemIds=[];

    var buildStructureFieldsArray=function(structure_table){
        var table_rows = $(structure_table).find('tr');
        var items_array=[];
        for(var index=0; index<table_rows.length; index++){
            if(index==0)
                continue;

            var row = table_rows[index];
            var id = $(row).attr('id');
            if(!id){
                id='';
            }

            var item={
                id: id,
                //field_name: $(row.children[2]).find('input').val(),
                field_display_name: $(row).find('input.field_display_name').val(),
                field_type: $(row).find('input.field_type').val(),
                field_type_ext_type:$(row).find('input.ext_type').val(),//取自行隐藏字段
                // field_type_ext_text:$(row).find('textarea.ext_text').val(),
                required: $(row).find('select.required').val(),
                listed: $(row).find('select.listed').val(),
                width: $(row).find('input.width').val(),
                //field_template_path: $(row.children[col_index+5]).find('input').val(),
                index_name:'',
                action: $('#module_id').val().length>0?'UPDATE':'CREATE',
                seq: index
            };

            if(item.field_display_name.length>0){
                items_array.push(item);
            }
        }

        //add deleted items
        for(var index=0; index<deletedItemIds.length; index++){
            var id = deletedItemIds[index];
            var item={
                id: id,
                action: 'DELETE'
            };
            items_array.push(item);
        }
        return items_array;
    };

    var buildStructureTableArray=function(){
        var structure_sections = $("section.structure");
        console.log('structure_sections.length:'+structure_sections.length);

        var structure_table_array=[];
        for(var i=0; i<structure_sections.length; i++){
            var structure_section = structure_sections[i];
            var structure_table = $(structure_section).find('table')[0];
            var fields = buildStructureFieldsArray(structure_table);
            var structure={
                id: $($(structure_section).find('.s_id')[0]).val(),
                name: $($(structure_section).find('.s_name')[0]).val(),
                structure_type: $($(structure_section).find('.s_type')[0]).val(),
                add_btn_type: $($(structure_section).find('.s_add_btn_type')[0]).val(),
                add_btn_setting: $($(structure_section).find('input[name=s_add_btn_setting]')).val(),
                parent_id: $($(structure_section).find('.s_parent_id')[0]).val(),
                field_list: fields
            }
            structure_table_array.push(structure);
        }
        //add deleted tables
        for(var index=0; index<deletedTableIds.length; index++){
            var id = deletedTableIds[index];
            var structure={
                id: id,
                action: 'DELETE'
            };
            structure_table_array.push(structure);
        }
        return structure_table_array;
    };

    var reDrawTable=function(order){
        deletedTableIds=[];
        cargoTable.clear();
        for (var i = 0; i < order.ITEM_LIST.length; i++) {
            var item = order.ITEM_LIST[i];
            var item={
                "ID": item.ID,
                "PRODUCT_NO": item.PRODUCT_NO,
                "SERIAL_NO": item.SERIAL_NO,
                "REMARK": item.REMARK
            };

            cargoTable.row.add(item).draw(false);
        }
    };

    var buildAuthArray=function(){
        var table_rows = $("#auth_table tbody").find('tr');
        var items_array=[];

        $.each(table_rows, function(i, row){
            var id = $(row).attr('id');
            if(!id){
                id='';
            }

            var btn_id_list = [];
            var btn_inputs = $(row).find('input.btn_id');
            $.each(btn_inputs, function(j, btn_input){
                var obj={
                    id:$(btn_input).val(),
                    name:$(btn_input).attr('name'),
                    bAuth:$(btn_input).prop('checked')
                };

                btn_id_list.push(obj);
            });

            var item={
                id: id,
                role_id: $(row).find('select.role_id').val(),
                role_auth_list: btn_id_list,
            };

            items_array.push(item);
        });

        //add deleted items
        // for(var index=0; index<deletedItemIds.length; index++){
        //     var id = deletedItemIds[index];
        //     var item={
        //         id: id,
        //         action: 'DELETE'
        //     };
        //     items_array.push(item);
        // }
        console.log(items_array);
        return items_array;
    };

    var saveAction=function(btn, is_start){
        is_start = is_start || false;
        var structure_list=buildStructureTableArray();
        var action_list= buildActionArray();
        var event_list = buildEventArray();
        var auth_list = buildAuthArray();
        var search_obj = customContr.buildSearchObj();
        var dto = {
            module_id: $('#module_id').text(),
            structure_list: structure_list,
            action_list: action_list,
            event_list: event_list,
            auth_list: auth_list,
            search_obj: JSON.stringify(search_obj),
            is_start: is_start,
            sys_only: $('#module_sys_only').prop('checked')
        };

        console.log('saveBtn.click....');
        console.log(dto);

        //异步向后台提交数据
        $.post('/module/saveStructure', {params:JSON.stringify(dto)}, function(data){
            var order = data;
            console.log(order);
            if(order.MODULE_ID>0){
                $.scojs_message('保存成功', $.scojs_message.TYPE_OK);
                showModuleDetail($("#module_id").text());
                btn.attr('disabled', false);
            }else{
                $.scojs_message('保存失败', $.scojs_message.TYPE_ERROR);
                btn.attr('disabled', false);
            }
        },'json').fail(function() {
            $.scojs_message('保存失败', $.scojs_message.TYPE_ERROR);
            btn.attr('disabled', false);
        });
    };


    $('#saveBtn').on('click', function(e){
        $(this).attr('disabled', true);

        //阻止a 的默认响应行为，不需要跳转
        e.preventDefault();
        //提交前，校验数据
        // if(!$("#orderForm").valid()){
        //     return;
        // }

        saveAction($(this));
    });

    //单据预览
    $('#previewBtn').click(function(){
        window.open('/module/preview/'+$("#module_id").text());
    });

    $('#startBtn').click(function(e){
        $(this).attr('disabled', true);

        //阻止a 的默认响应行为，不需要跳转
        e.preventDefault();

        saveAction($(this), true);
    });

    var showModuleDetail = function(module_id){
            $.post('/module/getOrderStructure', {module_id: module_id}, function(json){
                console.log('getOrderStructure....');
                console.log(json);
                module_obj = json;

                if(module_obj.SYS_ONLY=='Y'){
                    $('#module_sys_only').prop('checked', true);
                }else{
                    $('#module_sys_only').prop('checked', false);
                }

                deletedTableIds=[];//清空delete子表的arr
                actionController.clearDeletedActionIds();
                $('#fields_body').empty();

                for (var i = 0; i < json.STRUCTURE_LIST.length; i++) {
                    var structure = json.STRUCTURE_LIST[i];
                    var html = template('table_template',
                        {
                            id: 'sub'+subIndex,
                            s_id: structure.ID,
                            s_name: structure.NAME,
                            s_type: structure.STRUCTURE_TYPE,
                            s_parent_id: structure.PARENT_ID,
                            s_add_btn_type: structure.ADD_BTN_TYPE,
                            s_add_btn_setting: structure.ADD_BTN_SETTING
                        }
                    );

                    $('#fields_body').append(html);
                    var dataTable = $('body').find('table#'+'sub'+subIndex+'_table').DataTable(tableSetting);
                    subIndex++;

                    $('[data-toggle=tooltip]').tooltip();
                    // Module.dataTable.clear().draw();

                    if(!structure.FIELDS_LIST)
                        return;


                    for (var j = 0; j < structure.FIELDS_LIST.length; j++) {
                        var field = structure.FIELDS_LIST[j];
                        var item={
                            "ID": field.ID,
                            "FIELD_NAME": field.FIELD_NAME,
                            "FIELD_DISPLAY_NAME": field.FIELD_DISPLAY_NAME,
                            "FIELD_TYPE": field.FIELD_TYPE,
                            "FIELD_TYPE_EXT_TYPE": field.FIELD_TYPE_EXT_TYPE,
                            "FIELD_TYPE_EXT_TEXT": field.FIELD_TYPE_EXT_TEXT,
                            "REQUIRED": field.REQUIRED,
                            "LISTED": field.LISTED,
                            "WIDTH": field.WIDTH,
                            "FIELD_TEMPLATE_PATH": field.FIELD_TEMPLATE_PATH,
                            "INDEX_NAME": ''
                        };
                        dataTable.row.add(item).draw(false);
                    }
                }

                buildActionUI(json);
                buildEventUI(json);
                buildAuthUI(json);
                customContr.buildSearchObjUI(json);

                bindFieldTableEvent();//click event
            }, 'json');
        };

        var buildActionUI=function(json){
            if(!json.ACTION_LIST)
                return;

            var action_table = $('#action_table').DataTable();//actionController.action_tableSetting
            action_table.clear().draw(false);
            for (var k = 0; k < json.ACTION_LIST.length; k++) {
                var action = json.ACTION_LIST[k];
                var item={
                    "ID": (action.LEVEL=='default' && action.MODULE_ID==null)?'':action.ID,
                    "LEVEL": action.LEVEL,
                    "ACTION_NAME": action.ACTION_NAME,
                    "ACTION_TYPE": action.ACTION_TYPE,
                    "BTN_VISIBLE_CONDITION": action.BTN_VISIBLE_CONDITION,
                    "ACTION_SCRIPT": action.ACTION_SCRIPT,
                    "UI_TYPE": action.UI_TYPE,

                };
                action_table.row.add(item).draw(false);
            }
        };

        var buildEventUI=function(json){
            if(!json.EVENT_LIST)
                return;

            var event_table = $('#event_table').DataTable();
            event_table.clear().draw(false);
            $.each(json.EVENT_LIST, function(index, val) {
                var event_obj = val;
                var item={
                    ID: event_obj.ID,
                    EVENT_NAME: event_obj.EVENT_NAME,
                    EVENT_TYPE: event_obj.EVENT_TYPE,
                    EVENT_SCRIPT: event_obj.EVENT_SCRIPT
                };
                event_table.row.add(item).draw(false);
            });
        };

        var buildAuthUI=function(json){
            if(!json.AUTH_LIST)
                return;

            var auth_table = $('#auth_table').DataTable();//actionController.action_tableSetting
            auth_table.clear().draw(false);
            $.each(json.AUTH_LIST, function(index, val) {
                var auth_obj = val;
                var item={
                    ROLE_ID: auth_obj.ROLE_ID,
                    ROLE_PERMISSION: auth_obj.ROLE_AUTH_LIST
                };
                auth_table.row.add(item).draw(false);
            });
        };

        var buildCustomizeSearchUI=function(json){
            if(!json.AUTH_LIST)
                return;

            var auth_table = $('#auth_table').DataTable();//actionController.action_tableSetting
            auth_table.clear().draw(false);
            $.each(json.AUTH_LIST, function(index, val) {
                var auth_obj = val;
                var item={
                    ROLE_ID: auth_obj.ROLE_ID,
                    ROLE_PERMISSION: auth_obj.ROLE_AUTH_LIST
                };
                auth_table.row.add(item).draw(false);
            });
        };

    return {
        tableSetting: tableSetting,
        showModuleDetail: showModuleDetail
    };


});
