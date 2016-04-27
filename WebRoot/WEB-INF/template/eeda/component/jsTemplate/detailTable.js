

<script id="${id}" type="text/html">
    <div id="table_{{id}}_div" name="table_{{id}}_div" class="col-lg-12"
        parent_table_row_id="{{parent_table_row_id}}"
        parent_table_row_index="{{parent_table_row_index}}"
        {{if is_3rd_table}} style="display:none;"{{/if}}>

        {{if is_edit_order}}
            <h4>{{label}}
                <button id="add_row_btn_{{id}}" table_id="table_{{id}}" structure_id="{{structure_id}}"
                    {{if is_3rd_table}} is_3rd_table="true" {{/if}}
                    parent_table_id="{{parent_table_id}}"
                    parent_table_row_id="{{parent_table_row_id}}"
                    parent_table_row_index="{{parent_table_row_index}}"
                    name="addRowBtn" type="button" class="btn btn-success btn-xs">添加</button>
            </h4>
        {{/if}}
        <table id="table_{{id}}" name="table_{{id}}" structure_id="{{structure_id}}"
            parent_structure_id="{{parent_table_id}}"
            parent_table_row_id="{{parent_table_row_id}}"
            parent_table_row_index="{{parent_table_row_index}}"
            {{if is_3rd_table}}
                is_3rd_table="true"

            {{/if}}
         class="display" cellspacing="0" style="width: 100%;">
            <thead class="eeda">
                <tr>
                    <th></th>
                    {{each field_list as field}}
                        <th>{{field.FIELD_DISPLAY_NAME}}</th>
                    {{/each}}
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>
    <script>
        var template = require('template');
        var table_{{id}}_setting = {
            paging: false,
            "info": false,
            "processing": true,
            "searching": false,
            "autoWidth": true,
            "language": {
                "url": "/js/lib/datatables/i18n/Chinese.json"
            },
            "createdRow": function ( row, data, index ) {
                var id='';
                if(data.ID){
                    id=data.ID;
                }
                $(row).attr('id', id);
                $(row).attr('index', index);
                $(row).attr('parent_row_id', data.PARENT_ROW_ID);
                $(row).attr('parent_row_index', data.PARENT_ROW_INDEX);
                $('td:eq(0)',row).append('<span style="float:right;">'+(index+1)+'</span>');

                $(row).append('<input type="hidden" name="id" value="' + id + '"/>');

                if(data.REF_T_ID != null)
                    $(row).append('<input type="hidden" name="ref_t_id" value="' + data.REF_T_ID + '"/>');
                //生成隐藏字段的input
                {{each field_list as field}}
                    {{if field.FIELD_TYPE == '隐藏值'}}
                        $(row).append('<input type="hidden" name="F{{field.ID}}_{{field.FIELD_NAME}}" display_name="{{field.FIELD_DISPLAY_NAME}}" value="'
                                + data.F{{field.ID}}_{{field.FIELD_NAME}} + '" />');
                    {{/if}}
                {{/each}}
            },
            "columns": [
                { "width": "30px", "orderable":false,
                    "render": function ( data, type, full, meta ) {
                      return '<a class="delete"  table_id="table_{{id}}" href="javascript:void(0)" title="删除"><i class="glyphicon glyphicon-remove"></i></a>&nbsp;&nbsp;&nbsp;'
                            {{if detail_table_id}}
                            +'<a name="show_detail" detail_table_id="{{detail_table_id}}" href="javascript:void(0)" title="显示明细"><i class="fa fa-chevron-right"></i></a>&nbsp;'
                            {{/if}};
                    }
                },
                {{each field_list as field}}
                    {   "data": "F{{field.ID}}_{{field.FIELD_NAME}}",
                        "visible": {{if field.FIELD_TYPE == '隐藏值'}}false{{else}}true{{/if}},
                        "width": "{{field.WIDTH}}px",
                        "render": function ( data, type, full, meta ) {
                            if(!data)
                                data = '';
                            {{if field.FIELD_TYPE == '仅显示值'}}
                                return '<input type="text" name="F{{field.ID}}_{{field.FIELD_NAME}}" display_name="{{field.FIELD_DISPLAY_NAME}}" value="' + data + '" class="form-control" disabled/>';
                            {{else if field.FIELD_TYPE == '日期编辑框'}}
                                var field_html = template('table_input_date_field_template', {
                                    id: 'F{{field.ID}}_{{field.FIELD_NAME}}',
                                    is_require: '{{field.REQUIRED}}'
                                });
                                return field_html;
                            {{else if field.FIELD_TYPE == '下拉列表'}}
                                var field_ext_type_str = '{{#field.FIELD_TYPE_EXT_TYPE}}';
                                var field_ext_type = $.parseJSON(field_ext_type_str);
                                if(field_ext_type.id>0){//common list
                                    $.post('/m_search', {structure_id: 9, id:field_ext_type.id}, function(json){//查找下拉列表的定义
                                        if(json.data.length==1){
                                            var define= json.data[0].F39_XSZD;
                                            //根据定义，找到 数据源， 显示字段
                                            var source=define.split('.')[0];

                                            var list_structure, list_field;
                                            $.post('/module/getStructureByName', {name: source}, function(list_stru){
                                                list_structure=list_stru;
                                            });
                                            $.post('/module/getFieldByName', {name: define}, function(list_f){
                                                list_field=list_f;
                                            });
                                            field_html = template('input_dropdown_template', {
                                                id: 'F' + field.ID + '_' + field.FIELD_NAME,
                                                label: field.FIELD_DISPLAY_NAME,
                                                is_require: field.REQUIRED,
                                                structure_id: list_structure.ID,
                                                field_name: 'F' + list_field.ID + '_' + list_field.FIELD_NAME
                                            });
                                            return field_html;
                                        }else{
                                            console.error('dropdown template not found for:'+field.FIELD_NAME);
                                        }
                                    });
                                }else if(field_ext_type.name=="城市列表"){
                                    // field_html = template('input_location_template', {//特殊处理
                                    //     id: 'F' + field.ID + '_' + field.FIELD_NAME,
                                    //     label: field.FIELD_DISPLAY_NAME,
                                    //     value: '',
                                    //     is_require: field.REQUIRED
                                    // });
                                }else if(field_ext_type.name="自动编号选项"){
                                    var selectHtml = '<select name="F{{field.ID}}_{{field.FIELD_NAME}}" class="form-control">';
                                    $.post('/module/getSysSetting', {code: 'auto_no_option'}, function(json){//查找下拉列表的定义
                                        if(json.length>0){
                                            $.each(json, function(i, item){
                                                var option = '<option value="'+item.NAME+'" '+
                                                    (item.NAME==data?"selected":"")
                                                    +'>'+item.NAME+'</option>';
                                                selectHtml = selectHtml + option;
                                            });
                                        }
                                    });
                                    return selectHtml + '</select>';;
                                }
                            {{else if field.FIELD_TYPE =='数据列表'}}
                                var field_ext_type_str = '{{#field.FIELD_TYPE_EXT_TYPE}}';
                                console.log(field_ext_type_str);
                                var field_ext_type = $.parseJSON(field_ext_type_str);
                                if(field_ext_type.id>0){//common list  TODO  promise here
                                    return "<input type='text' name='F{{field.ID}}_{{field.FIELD_NAME}}' display_name='{{field.FIELD_DISPLAY_NAME}}' value='"+data+"' class='form-control'"+
                                            " field_type='{{field.FIELD_TYPE}}' ext_type='"+field_ext_type_str+"' placeholder='请选择'/>";
                                }else{
                                    return data;
                                }
                            {{else if field.FIELD_TYPE_EXT_TYPE =='产品列表'}}
                                    var items = '{{replaceReturn field.FIELD_TYPE_EXT_TEXT}}'.split('$');
                                    var selectHtml = '<select name="F{{field.ID}}_{{field.FIELD_NAME}}" class="form-control">';
                                    for (var i = 0; i < items.length; i++) {
                                        if(data == items[i]){
                                            selectHtml += '<option selected>' + items[i] + '</option>';
                                        }else{
                                            selectHtml += '<option>' + items[i] + '</option>';
                                        }
                                    };
                                    return selectHtml+'</select>';
                                    //先动态构造数据，再动态生成component
                                    var field = {
                                        ID: {{field.ID}},
                                        FIELD_NAME: '{{field.FIELD_NAME}}',
                                        DISPLAY_VALUE:  full['F{{field.ID}}_{{field.FIELD_NAME}}_INPUT'],
                                        CUSTOMER_ID: '{{customer_id}}',
                                        VALUE: data
                                    }
                                    return buildProductInput(field);
                            {{else}}
                                return '<input type="text" name="F{{field.ID}}_{{field.FIELD_NAME}}" display_name="{{field.FIELD_DISPLAY_NAME}}" value="' + data + '" class="form-control"/>';
                            {{/if}}
                       }
                    },
                {{/each}}
            ]
        }

        var table_{{id}}_row = {
            {{each field_list as field}}
                F{{field.ID}}_{{field.FIELD_NAME}}: '',
            {{/each}}
        };

        var buildProductInput=function(field){

            var field_html = template('input_product_template', {
                customer_id: '{{customer_id}}',
                id: 'F' + field.ID + '_' + field.FIELD_NAME,
                display_value: field.DISPLAY_VALUE,
                value: field.VALUE
            });
            return field_html;
        };
    </script>
</script>
