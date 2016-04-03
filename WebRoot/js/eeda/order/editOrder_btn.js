define(['app/eeda-common', './orderController'], function(eeda, orderController){
    var template = require('template');
    //var editOrderController = require('./editOrder');

    var global_order_structure;

    var buildButtonUI = function(module, order_dto) {
        //$('#button-bar').empty();
        for (var i = 0; i < module.ACTION_LIST.length; i++) {
            var buttonObj = module.ACTION_LIST[i];
            var is_show = true;

            console.log('buttonObj ACTION_NAME='+buttonObj.ACTION_NAME);
            if(buttonObj.UI_TYPE =='查询'){
                continue;
            }else if(buttonObj.BTN_VISIBLE_CONDITION == '[]' && buttonObj.UI_TYPE =='编辑' ){
                if(buttonObj.IS_AUTH=='Y'){
                    is_show = true;
                }else{
                    is_show = false;
                }

            }else{
                if(buttonObj.IS_AUTH=='N'){
                    is_show = false;
                    continue;
                }

                var btn_v_conditons = JSON.parse(buttonObj.BTN_VISIBLE_CONDITION);
                for (var j = 0; j < btn_v_conditons.length; j++) {
                    var v_condition = btn_v_conditons[j];

                    var visible_obj = $.parseJSON(v_condition);
                    var b_visible = (visible_obj.bVisible==='true');
                    var condition_list = visible_obj.condition_list;

                    $.each(condition_list, function(index, field){
                        // fields = JSON.parse(item);
                        // $.each(fields, function(ii, field){
                            //var field = fields[k];
                            var field_name = field.key.split(',')[1].split(':')[1];
                            var operator = field.operator;
                            var value = field.value;

                            var order_field_value = getOrderFieldValue(field_name, order_dto);
                            if('=' == operator){
                                if(order_field_value == value){
                                    is_show = b_visible;
                                    return true;
                                }
                            }else if('!=' == operator){
                                if(order_field_value != value){
                                    is_show = b_visible;
                                    return true;//break;
                                }
                            }else if('包含' == operator){
                                var valueArr = value.split(',');
                                for (var l = 0; l < valueArr.length; l++) {
                                    var temp_value = valueArr[l];
                                    if(order_field_value == temp_value){
                                        is_show = b_visible;
                                        return true;//break;
                                    }
                                };
                            }else if('不包含' == operator){

                            }
                        //});
                    });
                };
            }

            if(is_show){
                var button_html = template('button_template', {
                    id: buttonObj.ID,
                    label: buttonObj.ACTION_NAME
                });
                $('#button-bar').append(button_html);
            }
        }
    };

    var buildDtoFields = function(){
        //循环处理字段
        var field_sections = $("#fields section");
        var fields_list = [];
        for (var index = 0; index < field_sections.length; index++) {
            var field_section = field_sections[index];
            var fields_obj = {
                id: $("#order_id").val(),
                structure_id: $(field_section).attr('id')
            }
            var fields_input = $(field_section).find('input');
            for (var i = 0; i < fields_input.length; i++) {
                var field = fields_input[i];
                if ($(field).attr('name') && $(field).val() != '') {
                    fields_obj[$(field).attr('name')] = $(field).val();
                }
            }
            var fields_select = $(field_section).find('select');
            if (fields_select.length > 0) {
                for (var l = 0; l < fields_select.length; l++) { //遍历当前行的所有fields_select
                    var field = fields_select[l];
                    fields_obj[$(field).attr('name')] = $(field).val();
                }
            }
            fields_list.push(fields_obj);
        }
        return fields_list;
    }

    var buildDtoTables = function(tables){
        var table_list = [];
        for (var i = 0; i < tables.length; i++) { //多个从表
            var table = tables[i];
            var current_structure = orderController.getStructure(global_order_structure, $(table).attr('structure_id'));
            var parent_structure_id = $(table).attr('parent_structure_id');
            var parent_structure = orderController.getStructure(global_order_structure, parent_structure_id);

            var is_3rd_table = $(table).attr('is_3rd_table') == 'true';

            var table_rows = $(table).find('tr');
            var row_list = [];

            for (var j = 0; j < table_rows.length; j++) { //遍历当前表的所有行
                if(j == 0)
                    continue;
                var table_row = table_rows[j];
                var row_obj = {};
                var fields_input = $(table_row).find('input');
                if (fields_input.length > 0) {
                    for (var k = 0; k < fields_input.length; k++) { //遍历当前行的所有input
                        var field = fields_input[k];
                        row_obj[$(field).attr('name')] = $(field).val();
                    }
                }
                var fields_select = $(table_row).find('select');
                if (fields_select.length > 0) {
                    for (var l = 0; l < fields_select.length; l++) { //遍历当前行的所有fields_select
                        var field = fields_select[l];
                        row_obj[$(field).attr('name')] = $(field).val();
                    }
                }
                if(fields_input.length > 0 || fields_select.length > 0){
                    row_obj.parent_id = $(table).attr("parent_table_row_id");

                    //当前Structure是否有下级表定义
                    var detail_struture_id = orderController.checkHaveDetailTable(global_order_structure, current_structure);
                    if(detail_struture_id){
                        //查当前行是否有下级表数据
                        if(row_obj.id){//当前行有ID
                            var tables = $('div [name=table_'+detail_struture_id+'_div][parent_table_row_id='+row_obj.id+'] table');
                            row_obj.table_list = buildDtoTables(tables);//递归构造
                        }else{//当前行无ID，需要用index取Table
                            var tables = $('div [name=table_'+detail_struture_id+'_div][parent_table_row_index='+$(table_row).index()+'] table');
                            row_obj.table_list = buildDtoTables(tables);//递归构造
                        }
                    }

                    row_list.push(row_obj);
                }
            };

            var table_obj = {
                structure_id: $(table).attr("structure_id"),
                row_list: row_list
            };
            table_list.push(table_obj);
        }//end of tables loop
        return table_list;
    };

    var buildOrderDto = function() {
        var fields_list = buildDtoFields();

        //循环处理从表
        var tables = $("#list").find('table');
        var table_list = buildDtoTables(tables);

        var order_dto = {
            module_id: $('#module_id').val(),
            id: $('#order_id').val(),
            fields_list: fields_list,
            table_list: table_list,
            action: ''
        };

        return order_dto;
    };


    var bindBtnClick = function() {
        $('button.order_level').on('click', function(e) {
            //阻止a 的默认响应行为，不需要跳转
            e.preventDefault();

            var btnClass = $(this).attr('class');
            var btn = $(this);
            btn.attr('disabled', true);

            //提交前，校验数据
            // if(!$("#orderForm").valid()){
            //     return;
            // }

            // 关闭所有打开的下级从表
            $('i.fa-chevron-down').closest('a').click();

            btn.attr('disabled', false);

            var order_dto = buildOrderDto();
            order_dto.action = btn.text();

            console.log('save OrderData....');
            console.log(order_dto);

            //异步向后台提交数据
            $.post('/m_save', {
                params: JSON.stringify(order_dto)
            }, function(data) {
                var order = data;
                console.log(order);
                if (order.ID > 0) {
                    if(btn.text().indexOf('打印')>-1){
                        var pdf_path = '/download/'+order.RETURN_STR;
                        console.log(pdf_path);
                        window.open(pdf_path, 'download');
                        return;//no need to refresh UI
                    }

                    $('#order_id').val(order.ID);
                    $.scojs_message('保存成功', $.scojs_message.TYPE_OK);

                    eeda.urlAfterSave($("#module_id").val(), order.ID);
                    //重新取一次数据渲染页面
                    var structure_json_str = $('#module_structure').val();
                    var structure_json = JSON.parse(structure_json_str);
                    structure_json.id = order.ID;

                    //TODO:  这里跟editOrder.js 中重复了,看看如何优化?
                    var commonHandle=function(){
                        buildButtonUI(global_order_structure);
                        bindBtnClick(); //绑定按钮事件
                        eventController.bindEvent();
                        $('[data-toggle=tooltip]').tooltip();
                    };
                    orderController.fillOrderData(structure_json, commonHandle);

                    $('#saveBtn').attr('disabled', false);
                } else {
                    $.scojs_message('保存失败', $.scojs_message.TYPE_ERROR);
                    $('#saveBtn').attr('disabled', false);
                }
            }, 'json').fail(function() {
                $.scojs_message('保存失败', $.scojs_message.TYPE_ERROR);
                $('#saveBtn').attr('disabled', false);
            });
        });
    };

    var getOrderFieldValue = function (field_name, order_dto){
        var fiedl_value ='null';
        if(order_dto){
            for (var j = 0; j < order_dto.FIELDS_LIST.length; j++) {
                var order = order_dto.FIELDS_LIST[j];
                for(key in order){
                    if(key == field_name){
                        fiedl_value = order[key];
                        break;
                    }
                }
                if(fiedl_value.length>0)
                    break;
            }
        }
        return fiedl_value;
    };



    return {
        global_order_structure: {},

        buildButtonUI: buildButtonUI,
        bindBtnClick: bindBtnClick,
        set_global_order_structure: function(order_structure){
            global_order_structure = order_structure
        }
    }
});
