define(['jquery_ui'], function(){
    var template = require('template');
    //-------------   子表的动态处理

    var view_tableSetting = {
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
            { "data": "FIELD_NAME", class: 'field_name'},
            { "data": "FIELD_DISPLAY_NAME",
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                    return "<input type='text' value='"+data+"' class='display_name form-control'/>";
                }
            },
            { "data": "FIELD_TYPE",
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                  return '<select class="form-control field_type">'
                        +'    <option '+(data=='文本'?'selected':'')+'>文本</option>'
                        +'    <option '+(data=='日期'?'selected':'')+'>日期</option>'
                        +'</select>';
                }
            },
            { "data": "AS_CONDITION",
                 "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='';
                    return '<select class="form-control as_condition">'
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
                          +'   <option '+(data=='N'?'selected':'')+'>N</option>'
                          +'   <option '+(data=='Y'?'selected':'')+'>Y</option>'
                          +'</select>';
                }
            },
            { "data": "WIDTH",
                "render": function ( data, type, full, meta ) {
                    if(!data)
                        data='100';
                    return "<input type='text' value='"+data+"' class='width form-control'/>";
                }
            }
        ]
    };

    var view_table = $('#view_table').DataTable(view_tableSetting);

    var $view_table = $("#view_table tbody");

    $('#view_select').change(function() {
        var select = $(this);
        var viewName=select.val();
        view_table.clear().draw(false);
        $.post('/module/getCustomizeView', {name: viewName}, function(data){
            if(!data)
                return;
            for(var p in data){
                var item={
                    FIELD_NAME: p,
                    FIELD_DISPLAY_NAME: '',
                    FIELD_TYPE: '',
                    AS_CONDITION: 'Y',
                    LISTED: 'Y',
                    WIDTH: ''
                };
                view_table.row.add(item).draw(false);
            }
            $('#view_table tbody').sortable();//可拖动排序
        });
    });


    //for save build dto
    var buildSearchObj=function(){

        var view_name = $('#view_select').val();
        var jump_target = $('#jump_target').val();
        var table_rows = $("#view_table tbody").find('tr');
        var items_array=[];

        $.each(table_rows, function(i, row){
            var row_obj={
                FIELD_NAME: $(row).find('.field_name').text(),
                FIELD_DISPLAY_NAME: $(row).find('.display_name').val(),
                FIELD_TYPE: $(row).find('.field_type').val(),
                AS_CONDITION: $(row).find('.as_condition').val(),
                LISTED: $(row).find('.listed').val(),
                WIDTH: $(row).find('.width').val()
            };

            items_array.push(row_obj);
        });

        console.log(items_array);
        var search_obj={
            view_name: view_name,
            jump_target: jump_target,
            field_list: items_array
        };
        return search_obj;
    };

    //data reshow in UI
    var buildSearchObjUI=function(json){
        var search_obj_str = json.SEARCH_OBJ;
        if(search_obj_str){
            var search_obj =  $.parseJSON(search_obj_str);
            $('#view_select').val(search_obj.view_name);
            $('#jump_target').val(search_obj.jump_target);
            view_table.clear().draw(false);
            $.each(search_obj.field_list, function(i, item){
                var item={
                    FIELD_NAME: item.FIELD_NAME,
                    FIELD_DISPLAY_NAME: item.FIELD_DISPLAY_NAME,
                    FIELD_TYPE: item.FIELD_TYPE,
                    AS_CONDITION: item.AS_CONDITION,
                    LISTED: item.LISTED,
                    WIDTH: item.WIDTH
                };
                view_table.row.add(item).draw(false);
            });

            $('#view_table tbody').sortable();//可拖动排序
        }
    };

    return {
        view_tableSetting: view_tableSetting,
        buildSearchObj: buildSearchObj,
        buildSearchObjUI: buildSearchObjUI,
    }
});
