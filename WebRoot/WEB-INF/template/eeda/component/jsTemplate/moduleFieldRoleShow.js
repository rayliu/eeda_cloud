<script id="module_field_role_show" type="text/html">
    <div style="margin-top: 5px; ">
        <a class="delete" href="javascript:void(0)" title="删除"><i class="glyphicon glyphicon-remove"></i></a>
        <select class="form-control" name="modal_field_role" style="width: 25%;display: inline;">
           
            {{each list as item i}}
                <option value="{{item.id}}" style="margin-top: 0px;margin-left: -10px;" {{if default_val==item.id}}selected{{/if}}>{{item.name}}</option>
            {{/each}}
                
        </select>
    </div>
</script>
