define(function(){

    var template = require('template');
    var $action_table = $("#action_table");

    //按钮行中增加一个按钮显示条件
    $action_table.on('click', '.add_btn_visible_condition', function(e){
        e.preventDefault();
        //$('#actionModal').modal('show');
        var html = template('module_action_table_btn_visible_template', 
                        {
                            id: 'sub'
                        }
                    );
        $(this).parent().find('ol').append(html);
    });


    //按钮行中一个按钮显示条件的编辑
    $action_table.on('click', 'a[name=edit_btn_visible_condition]', function(e){
        e.preventDefault();
        $('#editBtnVisibleConditionModal').modal('show');

        var li = $(this).parent();
        var tr = $(this).parent().parent().parent().parent();
        $('#editBtnVisibleConditionModal input[name=modal_row_id]').val(tr.attr('id'));
        $('#editBtnVisibleConditionModal input[name=modal_command_li_index]').val(li.index());

        var fieldSetRow = $('#editBtnVisibleConditionModal #modal_add_field_div .row');
        fieldSetRow.empty();

        var modal_form = $('#editBtnVisibleConditionModal #modalForm');
        var visible_json = li.find('input[name=edit_btn_visible_condition_json]').val();

        if(visible_json){//回显
            var orderFieldList = getModuleFields();
            var visible_obj = JSON.parse(visible_json);
            var b_visible = visible_obj.bVisible;
            $('#editBtnVisibleConditionModal select[name=b_display]').val(b_visible);

            var condition_list = visible_obj.condition_list;
            for(var i=0; i<condition_list.length; i++){
                var field = condition_list[i];
                
                var display_name = field.key.split(',')[2].split(':')[1];
                
                var html = template('editBtnVisibleConditionModal_add_btn_visible_condition_template', 
                    {
                        field_list: orderFieldList,
                        display_name: display_name,
                        operator: field.operator,
                        field_value: field.value
                    }
                );
                fieldSetRow.append(html);
                
            }
        }
    });

    //按钮行中删除按钮显示条件
    $action_table.on('click', '.delete_visible', function(e){
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

    // 添加字段
    $('#editBtnVisibleConditionModal').on('click', 'button[name=addField]', function(){
        var orderFieldList = getModuleFields();

        var html = template('editBtnVisibleConditionModal_add_btn_visible_condition_template', 
                        {
                            field_list: orderFieldList
                        }
                    );
        $(this).parent().parent().find('.row').append(html);
    });

    //editBtnVisibleConditionModal 
    $('#editBtnVisibleConditionModal #modalForm').on('click', 'a.delete', function(){
        $(this).parent().remove();
    });

    //editBtnActionModal 点击确定时，回填JSON到 Btn 行
    $('#editBtnVisibleConditionModal').on('click', 'button[name=ok_btn]', function(){
        var row_id = $('#editBtnVisibleConditionModal input[name=modal_row_id]').val();
        var row_command_li_index = $('#editBtnVisibleConditionModal input[name=modal_command_li_index]').val();

        var tr = $('#action table tr#'+row_id)[0];
        var command_json_input = $(tr).find('ol li:eq('
            +row_command_li_index+') input[name=edit_btn_visible_condition_json]');

        var form = $('#editBtnVisibleConditionModal #modalForm');

        var conditionList = [];
        var fieldSetRow = $('#editBtnVisibleConditionModal #modal_add_field_div .col-lg-12');
        for(var i=0; i< fieldSetRow.length; i++){
            var row = $(fieldSetRow[i]);
            var key = row.find('select[name=modal_field_name]').val();
            var operator = row.find('select[name=operator]').val();
            var value = row.find('input[name=field_value]').val();
            var obj ={
                key: key,
                operator: operator,
                value: value
            };
            conditionList.push(obj);
        }

        var visible_obj={
            bVisible: $('#editBtnVisibleConditionModal select[name=b_display]').val(),
            condition_list: conditionList
        };

        command_json_input.val(JSON.stringify(visible_obj));
        $('#editBtnVisibleConditionModal').modal('hide');
    });

    return {

    };

});