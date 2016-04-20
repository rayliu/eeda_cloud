define(['sb_admin', 'dataTables', 'template', 'datetimepicker_CN', 'sco'], function (sb, dataTables) {
    var template = require('template');

    template.helper('replaceReturn', function (content) {
        return content.replace(/\n/g, "$");
    });

    $.ajaxSetup({
        async : false
    });

    //$('#menu_sys_profile').addClass('active').find('ul').addClass('in');
    $('[data-toggle=tooltip]').tooltip();

    var buildButtonUI = function(module) {
        //$('#button-bar').empty();
        for (var i = 0; i < module.ACTION_LIST.length; i++) {
            var buttonObj = module.ACTION_LIST[i];
            var is_show = true;

            if(buttonObj.UI_TYPE =='查询'){
                if(buttonObj.ACTION_NAME =='查看' || buttonObj.ACTION_NAME =='删除')//查看按钮不需要生成
                    continue;

                if(buttonObj.IS_AUTH=='Y'){
                    is_show = true;
                }else{
                    is_show = false;
                }
            }else{
                continue;
            }


            if(is_show){
                var button_html = template('button_template', {
                    id: buttonObj.ID,
                    label: buttonObj.ACTION_NAME,
                    action: buttonObj.ACTION_NAME
                });
                $('#button-bar').append(button_html);
            }
        }
    };

    var checkEditable = function(module){
        var isEditable=false;
        $.each(module.ACTION_LIST, function(i, buttonObj){
            if(buttonObj.UI_TYPE =='查询' && buttonObj.ACTION_NAME =='查看' && buttonObj.IS_AUTH=='Y'){
                isEditable = true;
                return true;
            }
        });
        return isEditable;
    };

    var checkDeletable = function(module){
        var isEditable=false;
        $.each(module.ACTION_LIST, function(i, buttonObj){
            if(buttonObj.UI_TYPE =='查询' && buttonObj.ACTION_NAME =='删除' && buttonObj.IS_AUTH=='Y'){
                isEditable = true;
                return true;
            }
        });
        return isEditable;
    };

    var buildCustomizeSearchUI = function(field_list){
        $.each(field_list, function(i, field){
            var field_html = '';
            if(field.AS_CONDITION == 'N')
                return true;

            if(field.FIELD_TYPE == '文本'){
                field_html = template('input_field',
                    {
                        id: field.FIELD_NAME,
                        label: field.FIELD_DISPLAY_NAME,
                        type: field.FIELD_TYPE
                    }
                );
            }else if(field.FIELD_TYPE == '日期'){
                field_html = template('input_date_query_template',
                    {
                        id: field.FIELD_NAME,
                        label: field.FIELD_DISPLAY_NAME,
                        type: field.FIELD_TYPE
                    }
                );
            }
            $('#fields').append(field_html);
        });
    };

    var buildCustomizeSearchResultList= function(structure, module, field_list){
        var isEditable = checkEditable(module);
        var isDelete = checkDeletable(module);

        var list_html = template('search_table_template',
                {
                    id: structure.ID,
                    label: structure.NAME,
                    field_list: field_list,
                    module_id: $('#module_id').val(),
                    isEditable: isEditable,
                    isDelete: isDelete
                }
            );
        $('#list').append(list_html);

        //setting 是动态跟随table生成的
        var table_setting = window['table_' + structure.ID + '_setting'];
        $('#list table:last').DataTable(table_setting);
    };

    var buildStructureUI = function(json){
            var structure = json.STRUCTURE_LIST[0];//主表结构
            $('#structure_id').val(structure.ID);
            if(!structure.FIELDS_LIST)
                return;

            if(json.SEARCH_OBJ){//自定义查询
                var search_obj_str = json.SEARCH_OBJ;
                var search_obj = $.parseJSON(search_obj_str);
                buildCustomizeSearchUI(search_obj.field_list);
                buildCustomizeSearchResultList(structure, json, search_obj.field_list);
            }else{
                if(structure.STRUCTURE_TYPE == '字段'){
                    var field_html = template('input_hidden_field',
                        {
                            id: 'structure_id',
                            value: structure.ID
                        }
                    );
                    $('#fields').append(field_html);

                    buildQueryFields(structure);
                    buildResultList(structure, json);
                }
            }

    };

    var buildResultList = function(structure, module){
        var isEditable = checkEditable(module);
        var isDelete = checkDeletable(module);

        var list_html = template('search_table_template',
                {
                    id: structure.ID,
                    label: structure.NAME,
                    field_list: structure.FIELDS_LIST,
                    module_id: $('#module_id').val(),
                    isEditable: isEditable,
                    isDelete: isDelete
                }
            );
        $('#list').append(list_html);

        //setting 是动态跟随table生成的
        var table_setting = window['table_' + structure.ID + '_setting'];
        $('#list table:last').DataTable(table_setting);
    };

    var buildQueryFields = function(structure){
        for (var j = 0; j < structure.FIELDS_LIST.length; j++) {
            var field = structure.FIELDS_LIST[j];

            var field_html = '';
            if(field.LISTED == 'N')
                continue;
            if(field.FIELD_TYPE == '仅显示值'){
                field_html = template('input_field',
                    {
                        id: 'F' + field.ID + '_' +field.FIELD_NAME,
                        label: field.FIELD_DISPLAY_NAME,
                        field_type: field.FIELD_TYPE
                    }
                );
            }else if(field.FIELD_TYPE == '文本编辑框'){
                field_html = template('input_field',
                    {
                        id: 'F' + field.ID + '_' +field.FIELD_NAME,
                        label: field.FIELD_DISPLAY_NAME,
                        type: field.FIELD_TYPE
                    }
                );
            }else if(field.FIELD_TYPE == '日期编辑框'){
                field_html = template('input_date_query_template',
                    {
                        id: 'F' + field.ID + '_' +field.FIELD_NAME,
                        label: field.FIELD_DISPLAY_NAME,
                        type: field.FIELD_TYPE
                    }
                );
            } else if (field.FIELD_TYPE == '下拉列表') {
                var ext_type = $.parseJSON(field.FIELD_TYPE_EXT_TYPE);
                if(ext_type.id>0){
                    var dropdown_id = ext_type.id;
                    $.post('/m_search', {structure_id: 9, id:dropdown_id}, function(json){//查找下拉列表的定义
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
                                structure_id: list_structure.ID,
                                field_name: 'F' + list_field.ID + '_' + list_field.FIELD_NAME
                            });
                        }else{
                            console.error('dropdown template not found for:'+field.FIELD_NAME);
                        }
                    });
                }else if(ext_type.name == '城市列表') {
                    field_html = template('input_location_template', {//特殊处理
                        id: 'F' + field.ID + '_' + field.FIELD_NAME,
                        label: field.FIELD_DISPLAY_NAME,
                        value: '',
                        is_require: field.REQUIRED
                    });
                }else{
                    console.error('dropdown template not found for:'+field.FIELD_NAME);
                }


            } else{
                field_html = template('input_field',
                    {
                        id: 'F' + field.ID + '_' +field.FIELD_NAME,
                        label: field.FIELD_DISPLAY_NAME,
                        type: field.FIELD_TYPE
                    }
                );
            }

            $('#fields').append(field_html);
        }
    };

    var buildStructureSearchUrl=function(){
        var url = '/m_search?';
        var search_inputs = $("section#fields input");

        var search_list=[];
        for(var i=0; i<search_inputs.length; i++){
            var input_field = $(search_inputs[i]);
            var name = input_field.attr('name');
            var value = input_field.val();

            url += '&' + name + '=' + value;
        }
        url += '&module_id=' + $('#module_id').val();
        return url;
    };

    var callback=function(json){
        console.log('getOrderStructure....');
        console.log(json);

        $('#module_name').text(json.MODULE_NAME);
        document.title = json.MODULE_NAME + '查询 | ' + document.title;

        $('#fields_body').empty();

        buildStructureUI(json);
        buildButtonUI(json);
    }

    var getModuleDefine=function(){
        $.post('/module/getOrderStructure', {module_id: $("#module_id").val()}, function(json){
            callback(json);
            if(!!window.localStorage){
                localStorage.setItem('m_'+$("#module_id").val(), JSON.stringify(json));
            }
        }, 'json');
    }

    if(!!window.localStorage){
            var json_str = localStorage.getItem('m_'+$("#module_id").val());
            if(json_str){
                var json = $.parseJSON(json_str);
                if(json.MODULE_VERSION == $("#module_version").val()){
                    callback(json);
                }else{
                    getModuleDefine();
                }
            }else{
                getModuleDefine();
            }

    }


    var search=function(){
        var url = buildStructureSearchUrl();
        var dataTable = $('#list table:last').DataTable();
        dataTable.ajax.url(url).load();
    };

    $('#button-bar button').on('click', function(e){
        //阻止a 的默认响应行为，不需要跳转
        e.preventDefault();
        var action = $(this).attr("action");
        console.log('btn click. action:'+action);
        if('查询' == action){
            search();
        }else if('新增' == action){
            window.open('/m/'+$("#module_id").val()+'-add');
            //window.location.href='/m/'+$("#module_id").val()+'-add';
        }
    });

    $('#list').on('click', '.delete', function(e){
        var el = $(this);
        var order_id = el.attr('delete_id');
        var s_id=$('#structure_id').val();
        $.post('/module/orderDelete', {structure_id:s_id, order_id: order_id}, function(json){
            if(json=='OK'){
                $.scojs_message('操作成功', $.scojs_message.TYPE_OK);
                search();
            }else{
                $.scojs_message('操作失败', $.scojs_message.TYPE_ERROR);
            }
        });
    });

    $("#resetBtn").click(function(){
        $('#searchForm')[0].reset();
    });

    search();
});
