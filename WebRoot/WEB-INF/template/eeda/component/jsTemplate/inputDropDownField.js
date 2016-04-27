<!-- 这个是下拉列表的模板 -->
<script id="input_dropdown_template" type="text/html">
	<div class="col-lg-4">
		<input id="{{id}}" type="text" name="{{id}}" value="{{value}}" field_type='list' style="display:none;"/>
		<div class="form-group">
		    <label class="search-label">{{label}}
		    {{if is_require=='Y'}} <span style='color:red;display: inherit;'>*</span> {{/if}}
		    </label>
		    <input type="text" class="form-control search-control" 
		    id="{{id}}_INPUT" name="{{id}}_INPUT" placeholder="请选择" value="{{display_value}}">
		    <ul id='{{id}}_list' tabindex="-1" 
			    class="pull-right dropdown-menu default dropdown-scroll" 
			    style="top: 22%; left: 33%;">
		    </ul>
		</div>
	</div>
	<script>

	$(document).ready(function() {
		//获取客户列表，自动填充
		var dropdownList =$("#{{id}}_list");
		var inputField = $('#{{id}}_INPUT');
		var hiddenField = $('#{{id}}');
		
		inputField.on('keyup click', function(event){
		    var me = this;
		    var inputStr = inputField.val();
		    
		     $.get("/m_search", {structure_id: {{structure_id}}}, function(json){
		    	if(inputStr!=inputField.val()){//查询条件与当前输入值不相等，返回
					return;
				}
		        dropdownList.empty();
		        
		        for(var i = 0; i < json.data.length; i++){
		        	var data = json.data[i];
		        	console.log(data);
		            dropdownList.append("<li><a tabindex='-1' class='li_item' id='"+data.ID+"'>"+data.{{field_name}}+"</a></li>");
		        }
		            
		        dropdownList.css({ 
			    	left:$(me).position().left+"px", 
			    	top:$(me).position().top+28+"px" 
			    });
		        dropdownList.show();    
		    },'json');
		});
		
		dropdownList.on('click', '.li_item', function(e){
			inputField.val($(this).text());
		    dropdownList.hide();
		    var id = $(this).attr('id');
		    hiddenField.val(id);
		});

		// 1 没选中客户，焦点离开，隐藏列表
		inputField.on('blur', function(){
			if (inputField.val().trim().length ==0) {
				hiddenField.val('');
			};
			dropdownList.hide();
		});
		
		// 2 当用户只点击了滚动条，没选客户，再点击页面别的地方时，隐藏列表
		dropdownList.on('mousedown', function(){
		    return false;//阻止事件回流，不触发 $('#spMessage').on('blur'
		});
		
	});
	</script>
</script>