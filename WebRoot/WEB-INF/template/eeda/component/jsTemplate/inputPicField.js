<script id="input_pic_template" type="text/html">
	<div class="col-lg-4">
		<div class="form-group">
		    <label class="search-label">{{label}}
		    {{if is_require=='Y'}} <span style='color:red;display: inherit;'>*</span> {{/if}}
		    </label>
            <div class="form-group input-group" style='display: inline-flex; width: 53%;'>
                <input type="text" id="{{id}}" name="{{id}}" class="form-control" placeholder="选择本地图片或粘贴URL" value=""
					onchange="$('#{{id}}_img').attr('src', $('#{{id}}').val());"
                >
                <span class="input-group-btn">
                    <button class=" btn_pic_upload btn btn-default" target_id="{{id}}_fimg_file" type="button">
                    <i class="fa fa-cloud-upload"></i>
                    <!-- 注意这里只能是 name="file" -->
                    <input id="{{id}}_img_file" accept="image/*" type="file" name="file" multiple
                    style="cursor: pointer;opacity: 0;position: absolute;top: 0;right: 0;margin: 0;width: 100%; height: 100%;">
                    
                    </button>
                </span>
                
            </div>
			
			<label class="search-label"></label>
		    <img id="{{id}}_img" alt="180x180" style="height: 180px; width: 180px;" 
		    src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTcxIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE3MSAxODAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjwhLS0KU291cmNlIFVSTDogaG9sZGVyLmpzLzEwMCV4MTgwCkNyZWF0ZWQgd2l0aCBIb2xkZXIuanMgMi42LjAuCkxlYXJuIG1vcmUgYXQgaHR0cDovL2hvbGRlcmpzLmNvbQooYykgMjAxMi0yMDE1IEl2YW4gTWFsb3BpbnNreSAtIGh0dHA6Ly9pbXNreS5jbwotLT48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWyNob2xkZXJfMTU0MjM1OGU1NTIgdGV4dCB7IGZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB0IH0gXV0+PC9zdHlsZT48L2RlZnM+PGcgaWQ9ImhvbGRlcl8xNTQyMzU4ZTU1MiI+PHJlY3Qgd2lkdGg9IjE3MSIgaGVpZ2h0PSIxODAiIGZpbGw9IiNFRUVFRUUiLz48Zz48dGV4dCB4PSI1OS41NTQ2ODc1IiB5PSI5NC41Ij4xNzF4MTgwPC90ZXh0PjwvZz48L2c+PC9zdmc+" 
		    data-holder-rendered="true">
		   
		</div>

	</div>
	 <script>
		$(function () {
		    'use strict';
			var url ="http://up.imgapi.com/?deadline="+(Math.round(new Date().getTime()/1000))+"&aid=1215225&from=web";
		    $('#{{id}}_img_file').fileupload({
                url: url,
                dataType: 'json',
                singleFileUploads: true,
                limitMultiFileUploads: 1,
                formData:{
                	'Token':'a996d9770a25dfddf58fc788d121c770da503bda:Z0NTNFo0cWYtUjQ4Z0pXekFWTXJ5LUR0R0tJPQ==:eyJkZWFkbGluZSI6MTQ2MDcxNDIzOCwiYWN0aW9uIjoiZ2V0IiwidWlkIjoiNTYyNTczIiwiYWlkIjoiMTIxNTIyNSIsImZyb20iOiJmaWxlIn0='
                },
                submit: function (e, data) {
			        $.each(data.files, function (index, file) {
			            console.log('Selected file: ' + file.name);
			        });
			    },
                done: function (e, data) {
                    $("#{{id}}").val(data.result.linkurl).change();
                },
                progressall: function (e, data) {
                    console.log(data);
                },
                fail: function(e, data){
                	console.log(data);
                }
            }).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
		});
	</script>
</script>
