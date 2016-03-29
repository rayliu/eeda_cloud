define(['dataTables', 'sb_admin'], function(){
	
$(document).ready(function() {
    	document.title = '用户岗位查询 | '+document.title;
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
	        "ajax" : "/userRole/list",
	        "columns": [
	        	{ "data": null, "width":"20%",
	        		"render": function ( data, type, full, meta ) {
	        			return "<a href ='/userRole/edit?username=" + full.USER_NAME + "' target='_blank'>" + full.USER_NAME + "</a>";
	        		}
	        	},
	            { "data": "C_NAME", "width":"30%"},
	            { "data": "NAME", "width":"30%"},
	            { "data": "REMARK", "width":"20%"},
	            { "data": null, "width":"10%",
	            	"render": function ( data, type, full, meta ) {
	                    var str="";

						str += "<a class='btn  btn-primary btn-xs' href ='/userRole/edit?username=" + full.USER_NAME + "' target='_blank'>"
							+ "<i class='fa fa-edit fa-fw'></i> "
							+ "编辑"
							+ "</a> ";


						// str += "<a class='btn  btn-xs btn-danger' href='/role/deleteRole/"+full.ID+"'>"
						// 	+ "<i class='fa fa-trash-o fa-fw'></i> "
						// 	+ "删除"
						// 	+ "</a>";
						return str;
	                }
	            }
	        ]
		});
   	 
   		
   });
});