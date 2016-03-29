define(['dataTables', 'validate_cn', 'sb_admin'], function(){
	
$(document).ready(function() {
	document.title = '岗位查询 | '+document.title;
	$('#menu_sys_profile').addClass('active').find('ul').addClass('in');
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
	        "ajax" : "/role/list",
	        "columns": [
	            { "data": "NAME", "width":"30%"},
	            { "data": "REMARK", "width":"50%"},
	            { "data": null, "width":"20%",
	            	"render": function ( data, type, full, meta ) {
	                    var str="";

						str += "<a class='btn  btn-primary btn-xs' href='/role/ClickRole?id="+full.ID+"' target='_blank'>"
							+ "<i class='fa fa-edit fa-fw'></i> "
							+ "编辑"
							+ "</a> ";


						str += "<a class='btn  btn-xs btn-danger' href='/role/deleteRole/"+full.ID+"'>"
							+ "<i class='fa fa-trash-o fa-fw'></i> "
							+ "删除"
							+ "</a>";
						return str;
	                }
	            }
	        ]
		});
	$("#createBtn").click(function(){
		document.title=document.title.substring(6, 11);
		$("#roleList").hide();
		$("#addRole").show();
	
	});	
    /*$("#saveBtn").click(function(){
    	$("#roleList").show();
		$("#addRole").hide();
    });	*/
    $('#addRoleForm').validate({
				rules : {
					rolename : {
						required : true,
						remote:{
		                	url: "/role/checkRoleNameExit", //后台处理程序    
                            type: "post",  //数据发送方式  
                            data:  {                     //要传递的数据   
                            	rolename: function() {   
                                    return $("#rolename").val();   
                                  }   
  
                            } 
						}
					}
				},
				 messages:{
	            	 rolename:{
	            		 remote:"岗位名称已存在"
	            	 }
	             },
				highlight : function(element) {
					$(element).closest('.form-group')
							.removeClass('has-success')
							.addClass('has-error');
				},
				success : function(element) {
					element.addClass('valid').closest(
							'.form-group').removeClass(
							'has-error').addClass(
							'has-success');
				}
			});
	});
});