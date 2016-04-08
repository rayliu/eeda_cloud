define(function(){
    var template = require('template');

    $.ajaxSetup({
        async : false
    });

    var role_list_html;//提前获取rolelist
    var role_list=[];
    var generateRoleList=function(default_val){
        // if(role_list_html)
        //     return role_list_html;

        var role_list_template =
                '<select class="role_id form-control">'+
                    '{{each list as item i}}'+
                    '    <option value="{{item.id}}" style="margin-top: 0px;margin-left: -10px;" {{if default_val==item.id}}selected{{/if}}>{{item.name}}</option>'+
                    '{{/each}}'+
                '</select>';
        var render = template.compile(role_list_template);



        if(role_list.length>0){
            var html = render({
                default_val: default_val,
                list: role_list
            });
            return html;
        }

        $.post('/module/getRoleList', function(data){
            if(data){
                $.each(data, function(i, item){
                    var role={
                        id: item.ID,
                        name: item.NAME
                    };
                    role_list.push(role);
                });

                var html = render({
                    default_val: default_val,
                    list: role_list
                });
                role_list_html = html;
            }
        });
        return role_list_html;
    };

    //generateRoleList();

    $('#addAuthBtn').on('click', function(event) {
        var btn_tr = $('#action_table tbody>tr');
        var need_save = false;
        $.each(btn_tr, function(i, item){
            if($(item).attr('id') == '')
                need_save = true;
        });

        if(need_save){
            $.scojs_message('有新增的按钮未保存,请先保存', $.scojs_message.TYPE_ERROR);
            return;
        }

        var item={
            //"ID": '',
            "ROLE_ID": '',
            "ROLE_PERMISSION": ''
        };
        auth_table.row.add(item).draw(false);
    });
    //-------------   子表的动态处理

    var auth_tableSetting = {
        "paging": false,
        "ordering": false,

        "processing": true,
        "searching": false,
        "autoWidth": true,
        "language": {
            "url": "/js/lib/datatables/i18n/Chinese.json"
        },
        "createdRow": function ( row, data, index ) {
            $(row).attr('id', data.ID);
            $(row).attr('level', data.LEVEL);
        },
        //"ajax": "/damageOrder/list",
        "columns": [
            { "width": "5%", "orderable":false,
                "render": function ( data, type, full, meta ) {
                    if(full.LEVEL == 'default'){
                        return '';
                    }else{
                        return '<a class="remove delete" href="javascript:void(0)" title="删除"><i class="glyphicon glyphicon-remove"></i></a>&nbsp;&nbsp;';
                    }
                }
            },
            { "data": "ROLE_ID", width: '15%',
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                    return generateRoleList(data);
                }
            },
            { "data": "ROLE_PERMISSION", width: '80%',
                "render": function ( data, type, full, meta ) {
                    var html = generateCheckGroup(data);
                    return html;
                }
            }
        ]
    };

    var generateCheckGroup=function(data){
        var btn_list = $('#action_table tbody tr');
        var check_box_template =
            '<div class="form-group">'+
            '{{each list as item i}}'+
            '    <label> </label>'+
            '    <label class="checkbox-inline">'+
            '        <input type="checkbox" class="btn_id" style="margin-top: 0px;margin-left: 0px;" '+
            '           name="{{item.name}}" value="{{item.id}}" {{item.checked}}>{{item.name}}'+
            '    </label>'+
            '{{/each}}'+
            '</div>';
        var btn_arr=[];
        $.each(btn_list, function(i, tr){
            var id=$(tr).attr('id');
            var name = $(tr).find('input.action_name').val()
            var checked='checked';
            if(data){
                $.each(data, function(i, item){
                    if(id == item.ID && item.BAUTH == false)
                        checked='';
                });
            }

            var item={
                id: id,
                name: name,
                checked: checked
            };
            btn_arr.push(item);
        });

        var render = template.compile(check_box_template);
        var html = render({
            list: btn_arr
        });
        return html;
    };

    var auth_table = $('#auth_table').DataTable(auth_tableSetting);

    var $auth_table = $("#auth_table");

    //按钮行中增加一个动作命令
    $auth_table.on('click', '.add_command', function(e){
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
    $auth_table.on('click', 'a[name=btnCommandSetting]', function(e){
        e.preventDefault();
        $('#editEventCommandModal').modal('show');

        var li = $(this).parent();
        var tr = $(this).parent().parent().parent().parent();
        $('#editEventCommandModal[name=modal_row_id]').val(tr.attr('id'));
        $('#editEventCommandModal[name=modal_command_li_index]').val(li.index());

        var fieldSetRow = $('#editEventCommandModalmodal_add_field_div .row');
        fieldSetRow.empty();
        $('#editEventCommandModal[name=table_list]').empty();
        var modal_form = $('#editEventCommandModalmodalForm');
        var command_json = li.find('input[name=actionCommandJson]').val();

        if(command_json){//回显
            commandObj = JSON.parse(command_json);
            modal_form.find('select[name=condition]').val(commandObj.condition);

            if(commandObj.condition == '列表中存在上级单据'){
                for (var i = 0; i < module_obj.STRUCTURE_LIST.length; i++) {
                    var structure = module_obj.STRUCTURE_LIST[i];
                    if(structure.STRUCTURE_TYPE=='列表' && structure.ADD_BTN_TYPE=="弹出列表, 从其它数据表选取"){
                        var ref_structure = structure.ADD_BTN_SETTING_STRUCTURE;
                        $('#editEventCommandModal[name=table_list]')
                            .append('<option value="'+ref_structure.ID +'">'+ref_structure.NAME+'</option>')
                    }
                };

                $('#editEventCommandModal[name=table_list]').val(commandObj.structure_id);

                var orderFieldList;
                var table_selected_value = commandObj.structure_id;
                for (var i = 0; i < module_obj.STRUCTURE_LIST.length; i++) {
                    var structure = module_obj.STRUCTURE_LIST[i];
                    if(structure.STRUCTURE_TYPE=='列表' && structure.ADD_BTN_TYPE=="弹出列表, 从其它数据表选取"){
                        var ref_structure = structure.ADD_BTN_SETTING_STRUCTURE;
                        if(table_selected_value == ref_structure.ID){
                            orderFieldList = ref_structure.FIELDS_LIST;
                        }
                    }
                };
                var field_list = commandObj.setValueList;
                for(var i=0; i<field_list.length; i++){
                    var field = field_list[i];
                    for(var key in field){
                        var display_name = key.split(',')[2].split(':')[1];
                        var value = field[key];
                        var html = template('editEventCommandModal',
                            {
                                field_list: orderFieldList,
                                display_name: display_name,
                                field_value: value
                            }
                        );
                        fieldSetRow.append(html);
                    }
                }
                $('#editEventCommandModal[name=table_list]').css('display', 'initial');
            }else{
                var orderFieldList = getModuleFields();
                var field_list = commandObj.setValueList;
                for(var i=0; i<field_list.length; i++){
                    var field = field_list[i];
                    for(var key in field){
                        var display_name = key.split(',')[2].split(':')[1];
                        var value = field[key];
                        var html = template('editEventCommandModal',
                            {
                                field_list: orderFieldList,
                                display_name: display_name,
                                field_value: value
                            }
                        );
                        fieldSetRow.append(html);
                    }
                }
            }


        }
    });

    //按钮行中删除一个动作命令
    $auth_table.on('click', '.delete_command', function(e){
        e.preventDefault();
        //$('#actionModal').modal('show');
        $(this).parent().remove();
    });

    var deletedActionIds=[];
    //删除表中一个按钮
    $auth_table.on('click', '.delete', function(e){
        e.preventDefault();
        var tr = $(this).parent().parent();
        deletedActionIds.push(tr.attr('id'))

        auth_table.row(tr).remove().draw();
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
        auth_tableSetting: auth_tableSetting,
        buildActionArray: buildActionArray,
        clearDeletedActionIds: function(){
            deletedActionIds = [];
        }
    }
});
