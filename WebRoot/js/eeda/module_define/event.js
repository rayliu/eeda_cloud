define(function(){
    var template = require('template');

    $('#addEventBtn').on('click', function(event) {
        var item={
            "ID": '',
            "EVENT_NAME": '',
            "EVENT_TYPE": '',
            "EVENT_DESC": ''
        };
        event_table.row.add(item).draw(false);
    });
    //-------------   子表的动态处理

    var event_tableSetting = {
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
            { "data": "EVENT_NAME", width: '100px',
                 "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<input type="text" name="event_name" value="'+data+'" class="form-control"/>';
                }
            },
            { "data": "EVENT_TYPE", width: '90px',
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                    var disabled ='';
                    if(full.LEVEL == 'default'){
                        disabled='disabled';
                    }
                    return '<select name="event_type" class="form-control" '+disabled+'>'
                        +'    <option '+(data=='查询'?'selected':'')+'>新增打开后</option>'
                        +'    <option '+(data=='编辑'?'selected':'')+'>新增保存前</option>'
                        +'    <option '+(data=='查询'?'selected':'')+'>新增保存后</option>'
                        +'    <option '+(data=='查询'?'selected':'')+'>修改打开后</option>'
                        +'    <option '+(data=='编辑'?'selected':'')+'>修改保存前</option>'
                        +'    <option '+(data=='查询'?'selected':'')+'>修改保存后</option>'
                        +'    <option '+(data=='值改变'?'selected':'')+'>值改变</option>'
                        +'</select>';
                }
            },
            { "data": "EVENT_SCRIPT", class:"event_script",
                "render": function ( data, type, full, meta ) {
                    var html_detail = '';
                    if(!data){
                        html_detail = '';
                    }else{
                        for (var i = 0; i < data.length; i++) {
                            var command = data[i];
                            if(!command)
                                continue;

                            var command_setting_str = JSON.stringify(command);
                            
                            if(!command_setting_str)
                            	continue;
                            
                            html_detail = html_detail + '<li style="margin-top: 5px;">'
                            +'    <a class="remove delete_command" href="javascript:void(0)" title="删除"><i class="glyphicon glyphicon-remove"></i></a>&nbsp;'
                            +'    <strong style="color: green;" name="command_name">' + command.COMMAND_NAME + '</strong> ...'
                            +'    <a name="btnCommandSetting" style="cursor: pointer;"><i class="fa fa-edit"></i></a>'
                            +"    <input name='eventCommandJson' type='text' value='"+command_setting_str+"'>"
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

    var event_table = $('#event_table').DataTable(event_tableSetting);

    var $event_table = $("#event_table tbody");

    //行中增加一个动作命令
    $event_table.on('click', '.add_command', function(e){
        e.preventDefault();
        //$('#actionModal').modal('show');
        var html = template('module_event_command_template', 
                        {
                            id: 'sub'
                        }
                    );
        $(this).parent().find('ol').append(html);
    });

    //行中一个动作命令的编辑
    $event_table.on('click', 'a[name=btnCommandSetting]', function(e){
        e.preventDefault();
        var li = $(this).parent();
        var tr = $(this).parent().parent().parent().parent();

        var row_id = tr.attr('id');
        if(!row_id){
            $.scojs_message('请先保存单据', $.scojs_message.TYPE_ERROR);
            return;
        }

        $('#editEventCommandModal').modal('show');

        
        $('#editEventCommandModal [name=modal_row_id]').val(row_id);
        $('#editEventCommandModal [name=modal_command_li_index]').val(li.index());

       
        $('#editEventCommandModal [name=table_list]').empty();
        var modal_form = $('#editEventCommandModal #modalForm');
        var command_json = li.find('input[name=eventCommandJson]').val();

        if(command_json){//回显
            commandObj = JSON.parse(command_json);
            modal_form.find('input[name=command_name]').val(commandObj.COMMAND_NAME);
            //modal_form.find('input[name=modal_condition]').val(commandObj.condition.EXP);
            modal_form.find('input[name=modal_operation_obj]').val(commandObj.OPERATION_OBJ.EXP);

            var fieldSetRow = $('#editEventCommandModal #modal_add_field_div .row');
            fieldSetRow.empty();
            
            var setValueList = commandObj.SETVALUELIST;
            $.each(setValueList, function(i, item){
                var html = template('editEventCommandModal_add_field_template', 
                    {
                        field_value: item.EXP
                    }
                );
                fieldSetRow.append(html);
            });
        }
    });

    //行中删除一个动作命令
    $event_table.on('click', '.delete_command', function(e){
        e.preventDefault();
        //$('#actionModal').modal('show');
        $(this).parent().remove();
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

    //editEventCommandModal/
    $('#editEventCommandModal').on('change', 'select[name=condition]', function(){
        var selected_value = $(this).val();
        $('#editEventCommandModal select[name=table_list]').empty();
        if(selected_value == '列表中存在上级单据'){
            for (var i = 0; i < module_obj.STRUCTURE_LIST.length; i++) {
                var structure = module_obj.STRUCTURE_LIST[i];
                if(structure.STRUCTURE_TYPE=='列表' && structure.ADD_BTN_TYPE=="弹出列表, 从其它数据表选取"){
                    var ref_structure = structure.ADD_BTN_SETTING_STRUCTURE;
                    $('#editEventCommandModal select[name=table_list]')
                        .append('<option value="'+ref_structure.ID +'">'+ref_structure.NAME+'</option>')
                }
            };
            $('#editEventCommandModal div[name=table_list]').css('display', 'initial');
        }else{
            $('#editEventCommandModal div[name=table_list]').css('display', 'none');
        }
    });

    //editEventCommandModal 添加字段
    $('#editEventCommandModal').on('click', 'button[name=addField]', function(e){
        e.preventDefault();
        var selected_value = $('#editEventCommandModal select[name=condition]').val();

        var html;
        if(selected_value == '列表中存在上级单据'){
            var orderFieldList;
            var table_selected_value = $('#editEventCommandModal select[name=table_list]').val();
            for (var i = 0; i < module_obj.STRUCTURE_LIST.length; i++) {
                var structure = module_obj.STRUCTURE_LIST[i];
                if(structure.STRUCTURE_TYPE=='列表' && structure.ADD_BTN_TYPE=="弹出列表, 从其它数据表选取"){
                    var ref_structure = structure.ADD_BTN_SETTING_STRUCTURE;
                    if(table_selected_value == ref_structure.ID){
                        orderFieldList = ref_structure.FIELDS_LIST;
                    }
                }
            };

            html = template('editEventCommandModal_add_field_template', 
                    {
                        field_list: orderFieldList
                    }
                );
        }else{
            var orderFieldList = getModuleFields();

            html = template('editEventCommandModal_add_field_template', 
                    {
                        field_list: orderFieldList
                    }
                );
        }
        
        $(this).parent().parent().find('.row').append(html);
    });

    //editEventCommandModal 添加字段
    $('#editEventCommandModal #modalForm').on('click', 'a.delete', function(){
        $(this).parent().remove();
    });

    //editEventCommandModal 点击确定时，回填JSON到 Btn 行
    $('#editEventCommandModal').on('click', 'button[name=ok_btn]', function(){
        var row_id = $('#editEventCommandModal input[name=modal_row_id]').val();
        var row_command_li_index = $('#editEventCommandModal input[name=modal_command_li_index]').val();

        var tr = $('#action table tr#'+row_id)[0];
        var command_name = $('#editEventCommandModal input[name=command_name]').val();
        var condition = $('#editEventCommandModal input[name=modal_condition]').val();
        var operation_obj = $('#editEventCommandModal input[name=modal_operation_obj]').val();

        var form = $('#editEventCommandModal #modalForm');

        var setValueList = [];
        var fieldSetRow = $('#editEventCommandModal #modal_add_field_div .col-lg-12');
        for(var i=0; i< fieldSetRow.length; i++){
            var row = $(fieldSetRow[i]);
            var exp = row.find('input[name=field_exp]').val();
            var obj={
                EXP:exp,
                EXP_KEY:""
            }
            setValueList.push(obj);
        }
        
        var json_obj = {
            COMMAND_NAME: command_name,
            CONDITION: {EXP:condition, EXP_KEY:""},
            OPERATION_OBJ: {EXP:operation_obj, EXP_KEY:""},
            SETVALUELIST: setValueList
        }

        var tr = $('#event table tr#'+row_id)[0];
        var command_name_text = $(tr).find('td.event_script ol li:eq('+row_command_li_index+') strong[name=command_name]');
        //var command_li_condition = $(tr).find('td.event_script ol li:eq('+row_command_li_index+') strong[name=condition]');
        var command_json_input = $(tr).find('td.event_script ol li:eq(' +row_command_li_index+') input[name=eventCommandJson]');

        command_name_text.text(command_name);
     
        command_json_input.val(JSON.stringify(json_obj));

        $('#editEventCommandModal').modal('hide');
    });

    var buildEventArray=function(){
        var table_rows = $event_table.find('tr');
        var items_array=[];
        for(var index=0; index<table_rows.length; index++){
            var row = table_rows[index];

            var id = $(row).attr('id');
            if(!id){
                id='';
            }

            var event_name = $(row).find('input[name=event_name]').val();
            var event_type = $(row).find('select[name=event_type]').val();
            var event_script = '';

            var lis =$(row).find('td.event_script li input[name=eventCommandJson]');
            var event_script_arr=[];
            $.each(lis, function(i, item){
                event_script_arr.push($(item).val());
            });

            var item={
                id: id,
                event_name: event_name, 
                event_type: event_type,
                event_script: event_script_arr
            };

            if(item.event_name.length>0){
                items_array.push(item);
            }
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
        event_tableSetting: event_tableSetting,
        buildEventArray: buildEventArray,
        clearDeletedActionIds: function(){
            deletedActionIds = [];
        }
    }
});