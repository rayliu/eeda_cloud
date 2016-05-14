define(['./action_btn_visible', './fields_add_btn_type'],function(v_c, a_c){

    var template = require('template');

    $('#addActionBtn').on('click', function(event) {
        var item={
            "ID": '',
            "ACTION_NAME": '',
            "ACTION_TYPE": '',
            "ACTION_DESC": ''
        };
        action_table.row.add(item).draw(false);
    });
    //-------------   子表的动态处理

    var action_tableSetting = {
        "paging": false,
        "ordering": false,

        "processing": true,
        "searching": false,
        "autoWidth": true,
        "language": {
            "url": "/yh/js/plugins/datatables-1.10.9/i18n/Chinese.json"
        },
        "createdRow": function ( row, data, index ) {
            $(row).attr('id', data.ID);
            $(row).attr('level', data.LEVEL);
        },
        //"ajax": "/damageOrder/list",
        "columns": [
            { "width": "30px", "orderable":false,
                "render": function ( data, type, full, meta ) {
                    if(full.LEVEL == 'default'){
                        return '';
                    }else{
                        return '<a class="remove delete" href="javascript:void(0)" title="删除"><i class="glyphicon glyphicon-remove"></i> </a>&nbsp;&nbsp;';
                    }
                }
            },
            { "data": "ID", visible: false},
            { "data": "ACTION_NAME", width: '70px',
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                    var disabled = ''
                    if(full.LEVEL == 'default'){
                        disabled = 'disabled';
                    }
                  return '<input type="text" value="'+data+'" class="action_name form-control" '+disabled+'/>';
                }
            },
            { "data": "ACTION_TYPE", width: '90px',
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                    var disabled ='';
                    if(full.LEVEL == 'default'){
                        disabled='disabled';
                    }
                    var disabled ='';
                    if(full.LEVEL == 'default'){
                        disabled='disabled';
                    }
                    return '<select class="form-control" '+disabled+'>'
                        +'    <option '+(data=='按钮'?'selected':'')+'>按钮</option>'
                        +'    <option '+(data=='不可见按钮'?'selected':'')+'>不可见按钮</option>'
                        +'</select>';
                }
            },
            { "data": "UI_TYPE", width: '90px',
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                    var disabled ='';
                    if(full.LEVEL == 'default'){
                        disabled='disabled';
                    }
                    return '<select class="form-control" '+disabled+'>'
                        +'    <option '+(data=='编辑'?'selected':'')+'>编辑</option>'
                        +'    <option '+(data=='查询'?'selected':'')+'>查询</option>'
                        +'</select>';
                }
            },
            { "data": "BTN_VISIBLE_CONDITION", width: '200px', class:'visible_condtion',
                "render": function ( data, type, full, meta ) {
                  var html_detail = '';
                    if(!data){
                        html_detail = '';
                    }else{
                        var command_list = JSON.parse(data);
                        for (var i = 0; i < command_list.length; i++) {
                            var command = command_list[i];
                            if(!command)
                                continue;

                            var command_setting_str = command;
                            //var obj = JSON.parse(command.command);

                            html_detail = html_detail + '<li style="margin-top: 5px;">'
                            +'    <a class="delete_visible" href="javascript:void(0)" title="删除"><i class="glyphicon glyphicon-remove"></i></a>&nbsp;'
                            +'    当<a href="">条件</a>成立时显示'
                            +'    <a name="edit_btn_visible_condition" style="cursor: pointer;"><i class="fa fa-edit"></i></a>'
                            +"    <input name='edit_btn_visible_condition_json' type='hidden' value='"+command_setting_str+"'>"
                            +'    </li>';
                        }
                    }
                    var html = '<input class="add_btn_visible_condition btn btn-success btn-xs defineAction" type="button" value="增加条件">'
                            +'<ol>'+ html_detail +'</ol>';
                    return html;

                }
            },
            { "data": "ACTION_SCRIPT", class:'command',
                "render": function ( data, type, full, meta ) {
                    if(full.LEVEL == 'default'){
                        return '';
                    }

                    var html_detail = '';
                    if(!data){
                        html_detail = '';
                    }else{
                        var command_list = JSON.parse(data);
                        for (var i = 0; i < command_list.length; i++) {
                            var command = command_list[i];
                            if(!command)
                                continue;

                            var command_setting_str = command.command;

                            if(!command_setting_str)
                            	continue;

                            var obj = JSON.parse(command_setting_str);


                            html_detail = html_detail + '<li style="margin-top: 5px;">'
                            +'    <a class="remove delete_command" href="javascript:void(0)" title="删除"><i class="glyphicon glyphicon-remove"></i></a>&nbsp;'
                            +'    <strong style="color: green;">' + obj.command_name + '</strong> ...'
                            +'    <a name="btnCommandSetting" style="cursor: pointer;"><i class="fa fa-edit"></i></a>'
                            +"    <input name='actionCommandJson' type='hidden' value='"+command_setting_str+"'>"
                            +'    </li>';
                        };
                    }
                    var html = '<input class="add_command btn btn-success btn-xs defineAction" type="button" value="增加命令">'
                            +'<ol>'+ html_detail +'</ol>';
                    return html;
                }
            }
        ]
    };

    var action_table = $('#action_table').DataTable(action_tableSetting);

    var $action_table = $("#action_table");

    //按钮行中增加一个动作命令
    $action_table.on('click', '.add_command', function(e){
        e.preventDefault();
        //$('#actionModal').modal('show');
        var html = template('module_action_command_template',
                        {
                            id: 'sub'
                        }
                    );
        $(this).parent().find('ol').append(html);
    });

    //按钮行中一个动作命令的编辑
    $action_table.on('click', 'a[name=btnCommandSetting]', function(e){
        e.preventDefault();
        $('#editBtnActionModal').modal('show');

        var li = $(this).parent();
        var tr = $(this).parent().parent().parent().parent();
        $('#editBtnActionModal input[name=modal_row_id]').val(tr.attr('id'));
        $('#editBtnActionModal input[name=modal_command_li_index]').val(li.index());

        var fieldSetRow = $('#editBtnActionModal #field_setting_div .row');
        fieldSetRow.empty();
        $('#editBtnActionModal select[name=table_list]').empty();
        var modal_form = $('#editBtnActionModal #modalForm');
        var command_json = li.find('input[name=actionCommandJson]').val();

        if(command_json){//回显
            commandObj = JSON.parse(command_json);
            modal_form.find('input[name=command_name]').val(commandObj.command_name);
            var action_select = modal_form.find('select[name=action]')
            action_select.val(commandObj.action);
            action_select.trigger('change');
            modal_form.find('select[name=target_order]').val(commandObj.target_order);

            modal_form.find('input[name=condition]').val(commandObj.condition);
            modal_form.find('input[name=target_obj]').val(commandObj.target_obj);

            modal_form.find('input[name=print_template]').val(commandObj.print_template);

            if(commandObj.link_setting){
                modal_form.find('select[name=link_action]').val(commandObj.link_setting.link_action);
                modal_form.find('input[name=target_module]').val(commandObj.link_setting.target_module);
            };

            if(commandObj.sms_setting){
                modal_form.find('input[name=sms_user]').val(commandObj.sms_setting.sms_user);
                modal_form.find('input[name=sms_pwd]').val(commandObj.sms_setting.sms_pwd);
                modal_form.find('input[name=sms_body]').val(commandObj.sms_setting.sms_body);
                modal_form.find('input[name=sms_phone_no]').val(commandObj.sms_setting.sms_phone_no);
            }

            if(commandObj.setValueList.length>0){
              modal_form.find('input[name=email_user]').val(commandObj.email_setting.email_user);
              modal_form.find('input[name=email_pwd]').val(commandObj.email_setting.email_pwd);
              modal_form.find('input[name=email_body]').val(commandObj.email_setting.email_body);
            }

            if(commandObj.setValueList.length>0){
                var fieldSetRow = $('#editBtnActionModal #field_setting_div .row');
                fieldSetRow.empty();
                $.each(commandObj.setValueList, function(i, item){
                    var html = template('editBtnActionModal_add_field_template',
                        {
                            field_value: item
                        }
                    );
                    fieldSetRow.append(html);
                });
            }

            if(commandObj.action_list.length>0){
                $('#command_tab_list li:not(:first)').remove();
                $('[name=tab-content] div.tab-pane:not(:first)').remove();
                $('#command_tab_list').show();
                    // data_source: tab.find('[name=data_source]').val(),
                    // target_obj: tab.find('[name=target_obj]').val(),
                    // condtion: tab.find('[name=condition]').val(),
                    // action_set_value_list: action_set_value_list
                // fieldSetRow.empty();
                $.each(commandObj.action_list, function(i, action){
                    var action_num = i+1;
                    if(action_num==1)
                        return true;

                    var li_html = '<li role="presentation">'+
                       '    <i class="remove glyphicon glyphicon-remove" style="position: absolute; z-index: 1; margin-top: 1px; margin-left: 2px;"></i>'+
                       '    <a href="#action_tab_'+action_num+'" aria-controls="fields" role="tab" data-toggle="tab">动作'+action_num+'</a>'+
                       '</li>';
                    $('#command_tab_list').append(li_html);
                    $('#command_tab_list li').removeClass('active');
                    $('#command_tab_list li:last').addClass('active');

                    var html = template('module_btn_action_tab', 
                        {
                            seq: action_num,
                            module_source_list: a_c.module_source_list
                        });
                    $('#modalForm .tab-content .tab-pane').removeClass('active');
                    $('#modalForm .tab-content').append(html);
                    var tab = $('.tab-content .tab-pane:last');
                    tab.find('[name=data_source]').val(action.data_source);
                    tab.find('[name=target_obj]').val(action.target_obj);
                    tab.find('[name=condition]').val(action.condition);
                    $.each(action.action_set_value_list, function(index, el) {
                        var html = template('editBtnActionModal_add_field_template',
                            {
                                field_list: []
                            }
                        );
                        tab.find('[name=field_setting_div] .row').append(html);
                        tab.find('[name=field_setting_div] .row input:last').val(el);
                    });
                });
            }
        }
    });

    //按钮行中删除一个动作命令
    $action_table.on('click', '.delete_command', function(e){
        e.preventDefault();
        //$('#actionModal').modal('show');
        $(this).parent().remove();
    });

    var deletedActionIds=[];
    //删除表中一个按钮
    $action_table.on('click', '.delete', function(e){
        e.preventDefault();
        var tr = $(this).parent().parent();
        deletedActionIds.push(tr.attr('id'))

        action_table.row(tr).remove().draw();
    });

    var getModuleFields = function(){
        var orderFieldList;
        for (var i = 0; i < module_obj.STRUCTURE_LIST.length; i++) {
                var structure = module_obj.STRUCTURE_LIST[i];
                if('字段' == structure.STRUCTURE_TYPE && null == structure.PARENT_ID){
                    orderFieldList = structure.FIELDS_LIST;
                    break;
                }
        }
        return orderFieldList;
    };

    // ------------------------------modal setting event handle
   

    //editBtnActionModal 添加字段
    $('#editBtnActionModal').on('click', 'button[name=addField]', function(){
        var selected_value = $('#editBtnActionModal select[name=condition]').val();

        var html;
        if(selected_value == '列表中存在上级单据'){
            var orderFieldList;
            var table_selected_value = $('#editBtnActionModal select[name=table_list]').val();
            for (var i = 0; i < module_obj.STRUCTURE_LIST.length; i++) {
                var structure = module_obj.STRUCTURE_LIST[i];
                if(structure.STRUCTURE_TYPE=='列表' && structure.ADD_BTN_TYPE=="弹出列表, 从其它数据表选取"){
                    var ref_structure = structure.ADD_BTN_SETTING_STRUCTURE;
                    if(table_selected_value == ref_structure.ID){
                        orderFieldList = ref_structure.FIELDS_LIST;
                    }
                }
            };

            html = template('editBtnActionModal_add_field_template',
                    {
                        field_list: orderFieldList
                    }
                );
        }else{
            var orderFieldList = getModuleFields();

            html = template('editBtnActionModal_add_field_template',
                    {
                        field_list: orderFieldList
                    }
                );
        }

        $(this).parent().parent().find('.row').append(html);
    });

    //editBtnActionModal 添加字段
    $('#editBtnActionModal #modalForm').on('click', 'a.delete', function(){
        $(this).parent().remove();
    });

    //editBtnActionModal 点击确定时，回填JSON到 Btn 行
    $('#editBtnActionModal').on('click', 'button[name=ok_btn]', function(){
        var row_id = $('#editBtnActionModal input[name=modal_row_id]').val();
        var row_command_li_index = $('#editBtnActionModal input[name=modal_command_li_index]').val();

        var tr = $('#action table tr#'+row_id)[0];
        var command_li_command_name = $(tr).find('td.command ol li:eq('
            +row_command_li_index+') strong[name=command_name]');
        var command_json_input = $(tr).find('td.command ol li:eq('
            +row_command_li_index+') input[name=actionCommandJson]');

        var form = $('#editBtnActionModal #modalForm');

        var setValueList = [];
        var fieldSetRow = $('#editBtnActionModal #modal_add_field_div .row');
        for(var i=0; i< fieldSetRow.length; i++){
            var row = $(fieldSetRow[i]);
            var value = row.find('input[name=field_value]').val();
            if(value)
                setValueList.push(value);
        }
        var command_name = form.find('input[name=command_name]').val();
        var action = form.find('select[name=action]').val();
        var target_order = form.find('select[name=target_order]').val();

        var condition = form.find('input[name=condition]').val();
        var target_obj = form.find('input[name=target_obj]').val();
        
        var print_template= form.find('input[name=print_template]').val();

        var link_setting = {
            link_action: form.find('select[name=link_action]').val(),
            target_module: form.find('input[name=target_module]').val()
        };
        var sms_setting = {
            sms_user: form.find('input[name=sms_user]').val(),
            sms_pwd:  form.find('input[name=sms_pwd]').val(),
            sms_body: form.find('input[name=sms_body]').val(),
            sms_phone_no: form.find('input[name=sms_phone_no]').val()
        };

        var email_setting = {
            email_user: form.find('input[name=email_user]').val(),
            email_pwd:  form.find('input[name=email_pwd]').val(),
            email_body: form.find('input[name=email_body]').val()
        };

        action_list = [];
        if(action=='新增' || action=='更新'){
            var tabs = $('#modalForm .tab-content [role=tabpanel]');

            $.each(tabs, function(i, tab){
                var tab = $(tab);
                var action_set_value_list = [];
                var field_set_row = tab.find('[name=field_setting_div] .row [name=field_value]');
                for(var i=0; i< field_set_row.length; i++){
                    var input = $(field_set_row[i]);
                    var value = input.val();
                    if(value)
                        action_set_value_list.push(value);
                }

                var action = {
                    data_source: tab.find('[name=data_source]').val(),
                    target_obj: tab.find('[name=target_obj]').val(),
                    condition: tab.find('[name=condition]').val(),
                    action_set_value_list: action_set_value_list
                };
                action_list.push(action);
            });
        }

        var json_obj = {
            command_name: command_name,
            action: action,
            target_order: target_order,

            target_obj: target_obj,
            condition: condition,
            print_template:print_template,
            link_setting: link_setting,
            sms_setting: sms_setting,
            email_setting: email_setting,
            setValueList: setValueList,
            action_list: action_list
        }
        console.log(json_obj);
        command_li_command_name.text(json_obj.command_name);
        command_json_input.val(JSON.stringify(json_obj));
        $('#editBtnActionModal').modal('hide');
    });

    var buildActionArray=function(){
        var table_rows = $action_table.find('tr');
        var items_array=[];
        for(var index=0; index<table_rows.length; index++){
            if(index==0)
                continue;

            var row = table_rows[index];

            if($(row).find('td').text() == '表中数据为空')
                continue;

            var id = $(row).attr('id');
            if(!id){
                id='';
            }

            var level = $(row).attr('level');
            var col_index= 1;
            var item={
                id: id,
                //field_name: $(row.children[2]).find('input').val(),
                level: level,
                action_name: $(row.children[col_index]).find('input').val(),
                action_type: $(row.children[col_index+1]).find('select').val(),
                ui_type: $(row.children[col_index+2]).find('select').val(),
                btn_visible_condition: buildBtnVisibleConditionArray($(row.children[col_index+3])),
                action_script: buildActionCommandArray($(row.children[col_index+4])),
                action: $('#module_id').val().length>0?'UPDATE':'CREATE'
            };

            if(item.action_name.length>0){
                items_array.push(item);
            }
        }

        //add deleted items
        for(var index=0; index<deletedActionIds.length; index++){
            var id = deletedActionIds[index];
            var item={
                id: id,
                action: 'DELETE'
            };
            items_array.push(item);
        }
        return items_array;
    };

    var buildBtnVisibleConditionArray=function(commandSection){
        var scriptArray = [];
        var command_list = commandSection.find('li');
        for(var index=0; index<command_list.length; index++){
            var $li = $(command_list[index]);
            var visible_condtion = $li.find('input[name=edit_btn_visible_condition_json]').val();
            scriptArray.push(visible_condtion);
        }
        return JSON.stringify(scriptArray);
    }

    var buildActionCommandArray=function(commandSection){
        var scriptArray = [];
        var command_list = commandSection.find('li');
        for(var index=0; index<command_list.length; index++){
            var $li = $(command_list[index]);
            var command_obj = {
                command: $li.find('input[name=actionCommandJson]').val(),
            };
            scriptArray.push(command_obj);
        }
        return JSON.stringify(scriptArray);
    }

    return {
        action_tableSetting: action_tableSetting,
        buildActionArray: buildActionArray,
        clearDeletedActionIds: function(){
            deletedActionIds = [];
        }
    }
});
