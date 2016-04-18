<script id="search_table_template" type="text/html">
    <div class="col-lg-12">
        {{if is_edit_order}}
            <h4>{{label}}</h4>
            <div class="form-group button-bar" >
                <button id="add_row_btn_{{id}}" table_id="table_{{id}}" name="addRowBtn" type="button" class="btn btn-success btn-xs">添加</button>
            </div>
        {{/if}}
        <table id="table_{{id}}" structure_id="{{structure_id}}" class="display" cellspacing="0" style="width: 100%;">
            <thead class="eeda">
                <tr>
                    <th></th>
                    {{each field_list as field}}
                        {{if (field.LISTED == 'Y')}}
                            <th>{{field.FIELD_DISPLAY_NAME}}</th>
                        {{/if}}
                    {{/each}}
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>
    <script>
        var table_{{id}}_setting = {
            paging:true,
            info: true,
            serverSide: true,
            deferLoading: 0, //初次不查数据
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
                $(row).append('<input type="hidden" name="id" value="' + id + '"/>');
            },
            "columns": [
                { "width": "10px", "orderable":false,
                    "render": function ( data, type, full, meta ) {
                        var isEditable=false, isDelete=false;
                        {{if isEditable}}
                            isEditable=true;
                        {{/if}}
                        {{if isDelete}}
                            isDelete=true;
                        {{/if}}
                        var action_str="";
                        if(isEditable){
                            action_str = action_str+'<a class="edit"  target="_blank" href="/m/{{module_id}}-'+full.ID+'" title="编辑"><i class="fa fa-edit"></i></a>';
                        }
                        if(isDelete){
                            action_str = action_str+'&nbsp;&nbsp;&nbsp;<a class="delete" href="javascript:void(0)" title="删除" delete_id="'+full.ID+'"><i class="glyphicon glyphicon-remove"></i></a>';
                        }

                        return action_str;
                    }
                },
                {{each field_list as field}}
                    {{if (field.LISTED == 'Y' ) }}
                        {{if (field.FIELD_TYPE == '下拉列表' ) }}
                            // var ext_type_json='{{field.FIELD_TYPE_EXT_TYPE}}';
                            // var ext_type=$.parseJSON(ext_type_json);

                            { "data": "F{{field.ID}}_{{field.FIELD_NAME}}_INPUT",
                                "width": "{{field.WIDTH}}px",
                                "render": function ( data, type, full, meta ) {
                                    if(!data)
                                        data = '';
                                    return data;
                               }
                            },
                        {{else if (field.FIELD_TYPE == '图片' ) }}

                            { "data": "F{{field.ID}}_{{field.FIELD_NAME}}",
                                "width": "{{field.WIDTH}}px",
                                "render": function ( data, type, full, meta ) {
                                    console.log(data);
                                    if(!data){
                                        str = '';
                                    }else{
                                        str = '<img alt="30x30" style="height: 100px; " src="'+data+'">';
                                    }

                                    return str;
                               }
                            },
                        {{else}}
                            { "data":
                                {{if (field.ID !=null)}}
                                    "F{{field.ID}}_{{field.FIELD_NAME}}",
                                {{else}}
                                    "{{field.FIELD_NAME}}",
                                {{/if}}
                                "width": "{{field.WIDTH}}px",
                                "render": function ( data, type, full, meta ) {
                                    if(!data)
                                        data = '';
                                    return data;
                               }
                            },
                        {{/if}}
                    {{/if}}
                {{/each}}
            ]
        }

        var table_{{id}}_row = {
            {{each field_list as field}}
                F{{field.ID}}_{{field.FIELD_NAME}}: '',
            {{/each}}
        };
    </script>
</script>
