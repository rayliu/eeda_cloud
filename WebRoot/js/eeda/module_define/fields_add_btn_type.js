define(function(){
    var template = require('template');
    var modal_module_list;

    var current_section;

    var module_source_list=[];
    $('#editBtnActionModal').on('show.bs.modal', function (e) {
        var target_order_el = $('#modalForm select[name=target_order]');
        target_order_el.empty();
        $.post("/module/getActiveModules", function(json){
            target_order_el.append('<option></option>');
            if(json){
                modal_module_list = json;
                for (var i = 0; i < json.length; i++) {
                    var module = json[i];
                    target_order_el.append('<option>'+module.MODULE_NAME+'</option>');
                };
            }
        });

        var s_name_arr = $('#fields_body .s_name');
        var data_source_el = $('.tab-content select[name=data_source]');
        data_source_el.empty();
        $.each(s_name_arr, function(i, item){
            var name = $(item).val();
            if(i>0){
                name = module_source_list[0]+'.'+$(item).val();
            }
            module_source_list.push(name);
            
            data_source_el.append('<option>'+name+'</option>');
        });
    });

    $('#add_command_tab').click(function(){
        var action_num=$('#command_tab_list li').length+1;
        if(action_num==6){
            alert('最多只能添加5个动作.');
            return;
        }
        var html = '<li role="presentation">'+
                   '    <i class="remove glyphicon glyphicon-remove" style="position: absolute; z-index: 1; margin-top: 1px; margin-left: 2px;"></i>'+
                   '    <a href="#action_tab_'+action_num+'" aria-controls="fields" role="tab" data-toggle="tab">动作'+action_num+'</a>'+
                   '</li>';
        $('#command_tab_list').append(html);
        $('#command_tab_list li').removeClass('active');
        $('#command_tab_list li:last').addClass('active');

        //添加 tab_pannel
        var html = template('module_btn_action_tab', 
            {
                seq: action_num,
                module_source_list: module_source_list
            });
        $('#modalForm .tab-content .tab-pane').removeClass('active');
        $('#modalForm .tab-content').append(html);
    });

    $('#command_tab_list').on('click', '.remove', function(){
        var seq = $(this).parent().index();
        $('#action_tab_'+seq).remove();
        $(this).parent().remove();
        $('#command_tab_list li').removeClass('active');
        $('#command_tab_list li:last').addClass('active');

        $('#modalForm .tab-content .tab-pane').removeClass('active');
        $('.tab-content .tab-pane:last').addClass('active');
    });

     //editBtnActionModal 动作切换
    $('#editBtnActionModal #modalForm').on('change', '[name=action]', function(){
        console.log($(this).val());
        var selected_value = $(this).val();

        var hideAllSetting = function(){
            $('#target_order_div').hide();
            $('#command_tab_list').hide();
            $('#action_row').hide();
            $('#modal_print_setting_div').hide();
            $('#modal_link_setting_div').hide();
            $('#sms_setting_div').hide();
            $('#email_setting_div').hide();
        };

        hideAllSetting();
        
        if(selected_value == '更新' || selected_value == '新增'){
            $('#command_tab_list li').removeClass('active');
            $('#command_tab_list li:first').addClass('active');
            $('#editBtnActionModal .tab-content .tab-pane').removeClass('active');
            $('#editBtnActionModal .tab-content .tab-pane:first').addClass('active');

            $('#command_tab_list').show();
            $('#action_row').show();
            $('#target_order_div').show();
        }else{
            $('#editBtnActionModal .tab-content .tab-pane').removeClass('active');
            $('#editBtnActionModal .tab-content .tab-pane:first').addClass('active');
            if(selected_value == '页面跳转'){
                $('#modal_link_setting_div').show();
            }else if(selected_value == '打印'){
                $('#modal_print_setting_div').show();
            }else if(selected_value == '发送短信'){
                $('#sms_setting_div').show();
            }else if(selected_value == '发送邮件'){
                $('#email_setting_div').show();
            }
        } 
    });

    var addBtnSettingClick = function(btn){
        var $select = $(btn).parent().find('select');
        current_section = $select.parent().parent().parent();
        var s_id = current_section.find('.s_id').val();
        var s_name = current_section.find('.s_name').val();
        var s_add_btn_setting = current_section.find('input[name=s_add_btn_setting]').val();

        $('#modal_module_source').empty();

        getModuleList(function(){
            if('数据列表选取' == $select.val()){
                if(s_add_btn_setting == ''){
                    $('#modal_s_id').val(s_id);
                    $('#modal_structure_name').val(s_name);
                    $('#editAddBtnType').modal('show');
                }else{//回显
                    var settingJson = JSON.parse(s_add_btn_setting);
                    var col_list_div = $('#modal_add_col_div section .row').empty();
                    var condition_list_div =$('#modal_add_condition_div section .row').empty();
                    var fillback_list_div =$('#modal_add_fillback_div section .row').empty();
                    $('#modal_s_id').val(settingJson.table_id);
                    $('#modal_structure_name').val(s_name);
                    $('#modal_module_source').val(settingJson.structure_id);
                    //显示字段的回显
                    var col_row_list = settingJson.col_list;
                    for (var i = 0; i < col_row_list.length; i++) {
                        var col_row = col_row_list[i];//显示字段
                        var col_field = JSON.parse(col_row.field_name);
                        
                        var display_name = col_field.FIELD_DISPLAY_NAME;
                        var module = getModuleStructure(col_field.STRUCTURE_ID);
                        var html = template('table_add_btn_field_template', 
                            {field_list: module.FIELD_LIST, 
                             display_name: display_name,
                             name: col_row.customize_name,
                             sql_name: col_row.customize_sql});
                        col_list_div.append(html);
                    };

                    var condition_row_list = settingJson.condition_list;
                    for (var i = 0; i < condition_row_list.length; i++) {
                        var col_row = condition_row_list[i];
                        var col_field = JSON.parse(col_row.field_name);
                        
                        var display_name = col_field.FIELD_DISPLAY_NAME;
                        var module = getModuleStructure(col_field.STRUCTURE_ID);
                        var html = template('table_add_btn_condtion_template', 
                            {field_list: module.FIELD_LIST, 
                             display_name: display_name,
                             condition: col_row.condition,
                             condition_value: col_row.condition_value});
                        condition_list_div.append(html);
                    };

                    // var fillback_row_list = settingJson.fillback_list;
                    // for (var i = 0; i < fillback_row_list.length; i++) {
                    //     var col_row = fillback_row_list[i];
                    //     var structure_id = col_row.from_field.split(',')[0].split(':')[1];
                    //     var display_name = col_row.to_field.split(',')[2].split(':')[1];
                    //     var module = getModuleStructure(structure_id);
                    //     var html = template('table_add_btn_field_template', 
                    //         {field_list: module.FIELD_LIST, 
                    //          display_name: display_name,
                    //          name: col_row.customize_name,
                    //          sql_name: col_row.customize_sql});
                    //     fillback_list_div.append(html);
                    // };

                    $('#editAddBtnType').modal('show');
                }
            }
        });
        
    };

    var getModuleList=function(callback){
        $.post("/module/getDataList", {name: '数据列表'}, function(json){
            if(json){
                modal_module_list = json;
                for (var i = 0; i < json.length; i++) {
                    var module = json[i];
                    $('#modal_module_source').append('<option value="'+module.ID+'">'+module.NAME+'</option>');
                };
                
                callback();
            }
        });
    }
    var getModuleStructure=function(structure_id){
        for (var i = 0; i < modal_module_list.length; i++) {
            var module = modal_module_list[i];
            if(structure_id == module.STRUCTURE_ID){
                return module;
            }
        }
    };

    $('.addFillbackField').click(function(event) {
        var table_id = $('#modal_s_id').val();
        var to_field_list=null;
        $.post('/module/getFieldsByStructureId', {structure_id: table_id}, function(data){
            to_field_list = data;
        });
        var module_id = $('#modal_module_source').val();
        for (var i = 0; i < modal_module_list.length; i++) {
            var module = modal_module_list[i];
            if(module_id == module.ID){

                var html = template('table_add_btn_fillback_template', 
                    {   field_list: module.FIELD_LIST,
                        to_field_list: to_field_list
                    });
                var div = $('.addFillbackField').parent();
                div.find('.row').append(html);
                break;
            }
        }
    });

    $('#modal_add_fillback_div').on('click', '.delete', function(e){
        $(this).parent().remove();
    });

    $('#modal_table_add_btn_type_ok_btn').click(function(event) {
        var settingObj={
            table_id: $('#modal_s_id').val(),  //当前列表id
            list_structure_id: $('#modal_module_source').val(),//数据列表id
            col_list: [],
            condition_list: [],
            fillback_list: []
        };

        var col_list = [];
        var col_row_list = $('#modal_add_col_div section .col-lg-12');
        for (var i = 0; i < col_row_list.length; i++) {
            var col_row = $(col_row_list[i]);
            var col_field = {
                field_name : col_row.find('select').val(),
                customize_name : col_row.find('input[name=name]').val(),
                customize_sql : col_row.find('input[name=sql_name]').val()
            }
            col_list.push(col_field);
        };
        settingObj.col_list = col_list;

        var condition_list = [];
        var condition_rows = $('#modal_add_condition_div section .col-lg-12');
        for (var i = 0; i < condition_rows.length; i++) {
            var row = $(condition_rows[i]);
            var field = {
                field_name : row.find('select').val(),
                condition : row.find('select[name=condition]').val(),
                condition_value : row.find('input[name=condition_value]').val()
            }
            condition_list.push(field);
        };
        settingObj.condition_list = condition_list;

        var fillback_list = [];
        var fillback_rows = $('#modal_add_fillback_div section .col-lg-12');
        for (var i = 0; i < fillback_rows.length; i++) {
            var row = $(fillback_rows[i]);
            var field = {
                from_field : row.find('select[name=modal_from_field_name]').val(),
                to_field : row.find('select[name=modal_to_field_name]').val()
            }
            fillback_list.push(field);
        };
        settingObj.fillback_list = fillback_list;

        current_section.find('input[name=s_add_btn_setting]').val(JSON.stringify(settingObj));
        $('#editAddBtnType').modal('hide');
    });

    return {
        addBtnSettingClick: addBtnSettingClick,
        module_source_list: module_source_list,
    }
});