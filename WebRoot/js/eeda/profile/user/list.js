define(['dataTables', 'sb_admin'], function(){
	
	$(document).ready(function() {
		document.title = '登录用户查询 | '+document.title;
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
	        "ajax" : "/loginUser/listUser",
	        "columns": [
	        	{ "data": 'USER_NAME', "width":"30%",
	        		"render": function ( data, type, full, meta ) {
	        			// if(User.update){
							return "<a  href='/loginUser/edit/"+full.ID+"' target='_blank' >" + data + "</a>";
						// }else{
						// 	return data;
						// }
	        		}
	        	},
	            { "data": "C_NAME", "width":"30%"},
	            { "data": "PASSWORD_HINT", "width":"30%"},
	            { "data": null, "width":"10%",
	            	"render": function ( data, type, full, meta ) {
						var str = "<nobr>";
	                	// if(User.update){
                			str = str + "<a class='btn  btn-primary btn-sm editbutton' href='/loginUser/edit/"+full.ID+"' target='_blank'>"+
                            		 "<i class='fa fa-edit'> </i>编辑</a> ";
                		// }
	                	// if(User.del){
	                		if(full.IS_STOP != true){
	                			str = str +"<a class='btn  btn-danger btn-sm ' href='/loginUser/del/"+full.ID+"'>"+
				                             "<i class='fa fa-trash-o fa-edit'></i>停用</a>";       
		                	}else{
		                		str = str + "<a class='btn  btn-success btn-sm dropdown-toggle' href='/loginUser/del/"+full.ID+"'>"+
				                             "<i class='fa fa-trash-o fa-edit'></i>启用 </a>";
		                	}
	                	// }
	                	return str+"</nobr>"
	                }
	            }
	        ]
		});
		
	});
});