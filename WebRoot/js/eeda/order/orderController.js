define(['template', 'datetimepicker_CN', './editOrder_btn', './editOrder_event'],function (t, dp, btnController, eventController) {
	$.ajaxSetup({
		async : false
	});
	var template = require('template');

    template.helper('replaceReturn', function (content) {
        return content.replace(/\n/g, "$");
    });

    var global_data_table=[];

	var generateField=function(structure){
	    var field_section_html = template('field_section', {
	        id: structure.ID
	    });

	    $('#fields').append(field_section_html);
	    var field_section = $('#fields #' + structure.ID + '>.col-lg-12');

	    for (var j = 0; j < structure.FIELDS_LIST.length; j++) {
	        var field = structure.FIELDS_LIST[j];
	        console.log(field.FIELD_DISPLAY_NAME +'FIELD_TYPE:'+field.FIELD_TYPE+'is_require:'+field.REQUIRED);

	        var disabled = "";
	        var hidden = false;//base on role to show
	        if(field.FIELD_TYPE_EXT_TYPE && field.FIELD_TYPE_EXT_TYPE !='undefined'){
	        	var ext_type_json = field.FIELD_TYPE_EXT_TYPE;
		        var ext_type_obj = $.parseJSON(ext_type_json);
		        if(ext_type_obj)
		        	disabled = (ext_type_obj.editable==true)?"":"disabled";
		        if(ext_type_obj.field_role_list){
		        	var user_roles = $.parseJSON($('#user_roles').val());
		        	var role_exist = false;
		        	$.each(user_roles, function(i, role_id){
		        		var _exist=$.inArray(role_id+'', ext_type_obj.field_role_list);
		        		if(_exist>=0){
		        			role_exist = true;
		        		}
		        	});
		        	if(!role_exist)
		        		continue;
		        }
	        }

	        var field_html = '';
	        if (field.FIELD_TYPE == '仅显示值') {
	            field_html = template('input_field', {
	                id: 'F' + field.ID + '_' + field.FIELD_NAME,
	                label: field.FIELD_DISPLAY_NAME,
	                disabled: disabled
	            });
	        } else if (field.FIELD_TYPE == '文本编辑框') {
	            field_html = template('input_field', {
	                id: 'F' + field.ID + '_' + field.FIELD_NAME,
	                label: field.FIELD_DISPLAY_NAME,
	                is_require: field.REQUIRED,
	                disabled: disabled
	            });
	        } else if (field.FIELD_TYPE == '多行文本编辑框') {
	            field_html = template('textarea_field', {
	                id: 'F' + field.ID + '_' + field.FIELD_NAME,
	                label: field.FIELD_DISPLAY_NAME,
	                is_require: field.REQUIRED,
	                disabled: disabled
	            });
	        } else if (field.FIELD_TYPE == '隐藏值') {
	            field_html = template('input_hidden_field', {
	                id: 'F' + field.ID + '_' + field.FIELD_NAME,
	                label: field.FIELD_DISPLAY_NAME
	            });
	        } else if (field.FIELD_TYPE == '日期编辑框') {
	            field_html = template('input_date_field_template', {
	                id: 'F' + field.ID + '_' + field.FIELD_NAME,
	                label: field.FIELD_DISPLAY_NAME,
	                is_require: field.REQUIRED,
	                disabled: disabled
	            });
	        } else if (field.FIELD_TYPE == '下拉列表') {
	        	var field_type = $.parseJSON(field.FIELD_TYPE_EXT_TYPE);
	            if (field_type.name == '城市列表') {
	                field_html = template('input_location_template', {//特殊处理
	                    id: 'F' + field.ID + '_' + field.FIELD_NAME,
	                    label: field.FIELD_DISPLAY_NAME,
	                    value: '',
	                    is_require: field.REQUIRED,
	                	disabled: disabled
	                });
	            }else{//common list field
	            	var dropdown_id = field_type.id;
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
			                    is_require: field.REQUIRED,
			                    structure_id: list_structure.ID,
			                    field_name: 'F' + list_field.ID + '_' + list_field.FIELD_NAME,
	                			disabled: disabled
			                });
	            		}else{
	            			console.error('dropdown template not found for:'+field.FIELD_NAME);
	            		}
	            	});
	            }
	        } else if (field.FIELD_TYPE == '图片') {
	            field_html = template('input_pic_template', {
	                id: 'F' + field.ID + '_' + field.FIELD_NAME,
	                label: field.FIELD_DISPLAY_NAME,
	                is_require: field.REQUIRED,
	                disabled: disabled
	            });
	        } else {
	            field_html = template('input_field', {
	                id: 'F' + field.ID + '_' + field.FIELD_NAME,
	                label: field.FIELD_DISPLAY_NAME,
	                is_require: field.REQUIRED,
	                disabled: disabled
	            });
	        }

	        field_section.append(field_html);
	    }
	};

	var generateTable=function(order_structure_dto, structure, parent_table_row_id){
	    var detail_table_id = checkHaveDetailTable(order_structure_dto, structure);//如果table是第二层，它需要知道下层table的ID
	    var is_3rd_table = checkIs3rdTable(order_structure_dto, structure);

	    var list_html = template('table_template', {
	        customer_id: '', //预留给table中根据此来过滤
	        id: structure.ID,
	        structure_id: structure.ID,
	        label: structure.NAME,
	        field_list: structure.FIELDS_LIST,
	        is_edit_order: true,
	        parent_table_id: structure.PARENT_ID,  //如果table是第三层，它需要知道上层table的ID
	        detail_table_id: detail_table_id,
	        parent_table_row_id: parent_table_row_id,
	        is_3rd_table: is_3rd_table
	    });
	    $('#list').append(list_html);

	    //setting 是动态跟随table生成的
	    var table_setting = window['table_' + structure.ID + '_setting'];

	    //从表列头重新处理
	    if(structure.ADD_BTN_TYPE == '数据列表选取'){
	        var btn_setting_obj = JSON.parse(structure.ADD_BTN_SETTING);
	        var headerTr = $('#table_' + structure.ID +' thead tr');

	        var col_list = btn_setting_obj.col_list;
	        for (var j = 0; j < col_list.length; j++) {
	            var field = JSON.parse(col_list[j].field_name);
	            headerTr.append('<th>'+field.FIELD_DISPLAY_NAME+'</th>');

	            //col setting
	            var col_item = {
	                data: 'F' + field.ID + '_' +field.FIELD_NAME
	            };
	            if (field.FIELD_TYPE == '下拉列表'
	                && (field.FIELD_TYPE_EXT_TYPE =='客户列表' || field.FIELD_TYPE_EXT_TYPE =='供应商列表')
	            ){
	                col_item = {
	                    data: 'F' + field.ID + '_' +field.FIELD_NAME + '_INPUT'
	                };
	            }
	            table_setting.columns.push(col_item);
	        };
	        //统一加上REF_T_ID
	        headerTr.append('<th>REF_T_ID</th>');
	        table_setting.columns.push({
	            data: 'REF_T_ID',
	            visible: false,
	            render: function ( data, type, full, meta ) {
	                if(!data)
	                    data = '';
	                return '<input type="hidden" name="REF_T_ID" value="' + data + '">';
	            }
	        });

	        window['table_' + structure.ID + '_setting'] = table_setting;
	    }

	    if(!is_3rd_table){
	        var dataTable = $('#table_' + structure.ID).DataTable(table_setting);
	        global_data_table['table_' + structure.ID+'_dataTable'] = dataTable;
	    }else{
	        var dataTable = $('div [name=table_' + structure.ID+'_div]:last table').DataTable(table_setting);
	        global_data_table['table_' + structure.ID+'_dataTable_'+parent_table_row_id] = dataTable;
	    }
	    bindTableClick();//after generated, bind click
	};

	var bindTableClick=function(){
		$('tbody').on('click', 'input', function(){
			var el = $(this);
			var tr = el.parent().parent();
			var field_type = el.attr('field_type');
			if(!field_type)
				return;
			var inputField = el;
			var hiddenField = el.parent().find('[name='+el.attr('name').substring(0, el.attr('name').indexOf("_INPUT"))+']');
			console.log(el.attr('field_type'));
			var ext_type_json=el.attr('ext_type');
			var ext_type = $.parseJSON(ext_type_json);

			//查找数据列表的定义
			var data_source, display_field_list;
			$.post('/m_search', {structure_id: 21, id:ext_type.id}, function(json){
				if(json.data.length==1){
					var define = json.data[0];
					data_source= define.F47_SJY;
					display_field_list = define.F48_XSZD;
				}
			});

			var list_structure;
			$.post('/module/getStructureByName', {name: data_source}, function(list_stru){
                list_structure=list_stru;
            });

            var list_field=[];
            if(display_field_list){
            	$.each(display_field_list.split(';'), function(i, item){
		            $.post('/module/getFieldByName', {name: item}, function(list_f){
		            	list_f.display_name=item;
		                list_field.push(list_f);
		            });
	            });
            }

			var html='<ul id="'+el.attr('name')+'_list" tabindex="-1" '+
			    	'class=" dropdown-menu  dropdown-scroll" '+
			    	'style="top: 22%; left: 33%; width: 50%;">'+
		    		'</ul>';
		    el.parent().append(html);
		    var dropdownList=$('#'+el.attr('name')+'_list');

		    function in_array(search, array){

			    for(var i in array){
			    	var field_key = 'F'+array[i].ID+'_'+array[i].FIELD_NAME;
			        if(field_key==search){
			            return i;
			        }
			    }
			    return false;
			};

		    var searchData=function(){
		    	//查询目标表
				$.post('/m_search', {structure_id: list_structure.ID}, function(json){
					if(!json.data)
						return;
					dropdownList.empty();
					$.each(json.data, function(i, item){
						var li_str = '';
						//遍历对象的所有属性
						for (prop in item) {
							var index = in_array(prop, list_field);
							if(index)
								li_str= li_str+' <span class="col-lg-3" display_name="'+list_field[index].display_name+'">'+item[prop]+'</span>';
						}

						dropdownList.append('<li><a tabindex="-1" class="li_item" id="'+item.ID+'">'+li_str+'</a></li>')
					});

				});
		    };

		    searchData();

		    el.keyup(function(event) {/*  触发查询 */
		    	console.log('触发查询');
		    	searchData();
		    });


		    dropdownList.css({
		    	left:el.position().left+"px",
		    	top: el.position().top+31+"px"
		    }).show();

		    dropdownList.on('click', '.li_item', function(e){
		    	var me = this;
		    	//回填规则
		    	var assigmment_list=ext_type.assignment_list;
		    	$.each(assigmment_list, function(i, item){
		    		if(item.changes){
		    			var target_field = tr.find('[display_name='+item.name+']');
		    			var li_field;
		    			var li_field_exp = item.changes.exp;
	    				if(li_field_exp.indexOf('.ID')>0){
		    				target_field.val($(me).attr('id'));
	    				}else {
    						li_field = $(me).find('[display_name="'+item.changes.exp+'"]');
	    					target_field.val(li_field.text());
		    			}
		    		}
		    	});
			    dropdownList.remove();
			});
		    // 1 没选列表选项，焦点离开，隐藏列表
			el.on('blur', function(){
				if (inputField.val().trim().length ==0) {
					hiddenField.val('');
				};
				dropdownList.remove();
			});
			// 2 当用户只点击了滚动条，没选中li，再点击页面别的地方时，隐藏列表
			dropdownList.on('mousedown', function(){
			    return false;//阻止事件回流，不触发 $('#spMessage').on('blur'
			});
		});
	};



	var checkHaveDetailTable = function(order_structure_dto, structure){
	    var structure_id = structure.ID;
	    for (var i = 0; i < order_structure_dto.STRUCTURE_LIST.length; i++) {
	        var temp_structure = order_structure_dto.STRUCTURE_LIST[i];
	        if(temp_structure.STRUCTURE_TYPE == '列表' && structure_id == temp_structure.PARENT_ID){
	            return temp_structure.ID;
	        }
	    }
	    return null;
	}

	var checkIs3rdTable = function(order_structure_dto, structure){
	    var structure_2rd_id = structure.PARENT_ID;
	    for (var i = 0; i < order_structure_dto.STRUCTURE_LIST.length; i++) {
	        var temp_structure = order_structure_dto.STRUCTURE_LIST[i];
	        if(structure_2rd_id == temp_structure.ID){
	            if(temp_structure.PARENT_ID)
	                return true;
	        }
	    }
	    return false;
	}

//---------------------------return ---------------------------
    return {
    	editOrder_btn_controller: null, //等load完后，设置进来
    	editOrder_event_controller: null, //等load完后，设置进来
    	get_global_data_table: function(){
    		return global_data_table;
    	},
    	getStructure: function(order_structure_dto, structure_id){
	        for (var i = 0; i < order_structure_dto.STRUCTURE_LIST.length; i++) {
	            var temp_structure = order_structure_dto.STRUCTURE_LIST[i];
	            if(structure_id == temp_structure.ID){
	                return temp_structure;
	            }
	        }
	    },
	    //新增时直接构造UI
		buildStructureUI: function(json) {
		    for (var i = 0; i < json.STRUCTURE_LIST.length; i++) {
		        var structure = json.STRUCTURE_LIST[i];

		        if (!structure.FIELDS_LIST)
		            continue;
		        if (structure.STRUCTURE_TYPE == '字段') {
		            generateField(structure);
		        } else {
		            generateTable(json, structure);
		        }
		    } //end of for
		    eventController.bindEvent(json);
		},
    	buildFieldsStructureUI: function(order_data_dto) {
		    for (var i = 0; i < order_data_dto.STRUCTURE_LIST.length; i++) {
		        var structure = order_data_dto.STRUCTURE_LIST[i];

		        if (!structure.FIELDS_LIST)
		            continue;
		        if (structure.STRUCTURE_TYPE == '字段') {
		            generateField(structure);
		        }
		    } //end of for
		},
		//编辑时回显(递归)构造table UI
		buildTableStructureUI: function(order_data_dto) {
			var me = this;
		    if(order_data_dto.TABLE_LIST.length>0){
		        for (var i = 0; i < order_data_dto.TABLE_LIST.length; i++) {
		            var tableObj = order_data_dto.TABLE_LIST[i];
		            var tableStructure = me.getStructure(me.global_order_structure, tableObj.STRUCTURE_ID);
		            var parent_table_row_id = order_data_dto.ID;

		            generateTable(me.global_order_structure, tableStructure, parent_table_row_id);
		            console.log('buildTableStructureUI: s_id='+tableObj.STRUCTURE_ID);

		            var table_div = $('div [name=table_' + tableObj.STRUCTURE_ID+'_div]:last');
		            table_div.attr('parent_table_row_id', order_data_dto.ID);
		            var dataTable = table_div.find('table').DataTable();
		            dataTable.clear();
		            var row_list = tableObj.ROW_LIST;
		            var row = {};
		            console.log(row_list);
		            if(row_list){
		                for (var j = 0; j < row_list.length; j++) {
		                    var row_rec = row_list[j];
		                    $.each(row_rec, function(key, value) {
		                        row[key] = value;
		                    });
		                    dataTable.row.add(row).draw(false);
		                    me.buildTableStructureUI(row_rec);
		                }
		            }
		        }
		    }
		},
    	fillOrderData: function(structure_json, callback) {
    		me = this;
		    $('#fields').empty();
		    $('#list').empty();
		    $('#button-bar').empty();

		    structure_json.id = $("#order_id").val();

		    $.post('/m_getOrderData', {
		            params: JSON.stringify(structure_json)
		        },
		        function(json) {
		            console.log('getOrderData....');
		            console.log(json);

		            me.buildFieldsStructureUI(structure_json);
		            for (var i = 0; i < json.FIELDS_LIST.length; i++) {
		                var fieldsObj = json.FIELDS_LIST[i];
		                $.each(fieldsObj, function(key, value) {
		                    $("#" + key).val(value).change();
		                });
		            }

		            me.buildTableStructureUI(json);
		            callback();
		            // me.editOrder_btn_controller.buildButtonUI(structure_json, json);
		            // me.editOrder_btn_controller.bindBtnClick();
		            // $('[data-toggle=tooltip]').tooltip();
		        }, 'json');
		},

		checkHaveDetailTable: checkHaveDetailTable
    };//end of return

});
