<script id="table_select_field_template" type="text/html">
	<div class="form-group">
		<select name="{{name}}" 
	    	field_type='list'
	    	class="form-control search-control" {{disabled}}>
	    	{{each option_list as item}}
                <option value="{{item.ID}}">{{item.NAME}}</option>
            {{/each}}
	    </select>
	</div>
</script>