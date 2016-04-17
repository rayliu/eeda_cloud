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
                    <button class="btn btn-default" type="button"><i class="fa fa-cloud-upload"></i>
                    </button>
                </span>
                
            </div>
			<input type="file" id="{{id}}_img_file" name="{{id}}fimg_file"  accept="image/*" style="display:none;">
		    <label class="search-label"></label>
		    <img id="{{id}}_img" alt="180x180" style="height: 180px; width: 180px;" 
		    src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTcxIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE3MSAxODAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjwhLS0KU291cmNlIFVSTDogaG9sZGVyLmpzLzEwMCV4MTgwCkNyZWF0ZWQgd2l0aCBIb2xkZXIuanMgMi42LjAuCkxlYXJuIG1vcmUgYXQgaHR0cDovL2hvbGRlcmpzLmNvbQooYykgMjAxMi0yMDE1IEl2YW4gTWFsb3BpbnNreSAtIGh0dHA6Ly9pbXNreS5jbwotLT48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWyNob2xkZXJfMTU0MjM1OGU1NTIgdGV4dCB7IGZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB0IH0gXV0+PC9zdHlsZT48L2RlZnM+PGcgaWQ9ImhvbGRlcl8xNTQyMzU4ZTU1MiI+PHJlY3Qgd2lkdGg9IjE3MSIgaGVpZ2h0PSIxODAiIGZpbGw9IiNFRUVFRUUiLz48Zz48dGV4dCB4PSI1OS41NTQ2ODc1IiB5PSI5NC41Ij4xNzF4MTgwPC90ZXh0PjwvZz48L2c+PC9zdmc+" 
		    data-holder-rendered="true">
		   
		</div>

	</div>

</script>
