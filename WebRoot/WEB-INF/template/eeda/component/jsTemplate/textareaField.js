<script id="textarea_field" type="text/html">
	<div class="col-lg-4">
		<div class="form-group">
		    <label class="search-label" style="position: relative; top: -180px;">{{label}}{{if is_require=='Y'}} <span style='color:red;display: inherit;'>*</span> {{/if}}</label>
				<textarea rows="3" class="form-control search-control" style="height:200px;"
					id="{{id}}"
					name="{{id}}"
					field_type="{{field_type}}"
				>{{value}}</textarea>
		</div>
	</div>
</script>
