define(['dataTables', 'validate_cn', 'sb_admin', 'sco'], function(){

$(document).ready(function() {
	if(user_name){
		document.title = user_name+' | '+document.title;
	}
	$('#menu_sys_profile').addClass('active').find('ul').addClass('in');

	//datatable, 动态处理
	var name = $("#user_name").val();

    $('#eeda-table').DataTable({
            "processing": true,
            "searching": false,
            paging: false,
            //"serverSide": true,
            "scrollX": true,
            //"scrollY": "300px",
            "scrollCollapse": true,
            "autoWidth": false,
            "language": {
                "url": "/js/lib/datatables/i18n/Chinese.json"
            },
            "ajax" : "/userRole/roleList?username="+name,
            "columns": [
                { "data": null, "width":"10%",
                    "render": function ( data, type, full, meta ) {
                        if(full.IS_AUTH!=1){
                             return '<input type="checkbox" name="roleCheck" class="unChecked" value="'+full.ID+'">';
                         }else{
                             return '<input type="checkbox" checked="true" class="unChecked" name="roleCheck" value="'+full.ID+'">';
                         }
                    }
                },
                { "data": "NAME", "width":"90%"}
            ]
        });


    var role=[];
    $("#eeda-table").on('click','.unChecked',function(){
		 role.splice(0,role.length);
		 $("input[name='roleCheck']").each(function(){
	        	if($(this).prop('checked') == true){
	        		role.push($(this).val());
	        	}
	     });
		 console.log(role);
	  });
    $('#saveBtn').click(function(e){
        e.preventDefault();

        var username = $("#user_name").val();
        var roles = role.toString();
    	$.post('/userRole/updateRole?name='+username+'&roles='+roles,function(data){
    		$.scojs_message('更新成功', $.scojs_message.TYPE_OK);
    		//$("#saveBtn").attr("disabled",true);
    	},'json');

    });

});

});
