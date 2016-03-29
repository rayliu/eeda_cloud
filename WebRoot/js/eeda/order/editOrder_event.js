define(['app/eeda-common', './orderController'], function(eeda, orderController){
    var template = require('template');
    //var editOrderController = require('./editOrder');
    var global_order_structure;

    var bindEvent=function(){
        $('section').on('blur', 'input', function(e){
            e.preventDefault();
            var el = $(this);
            var input_name = el.attr('name');
            if(isBlurField(input_name)){
                var setValueList = getEventScriptList(input_name);
                $.each(setValueList, function(i, expObj){
                    var expStr = expObj.EXP_KEY;
                    var target_field_name = expStr.split('=')[0];
                    var expPost = expStr.split('=')[1];
                    console.log(expStr);

                    var target_field_name = target_field_name.split('.')[1].toUpperCase();
                    var target_field_input = el.closest('tr').find('[name='+target_field_name+']');
                    console.log(target_field_input);

                    var params = getExpParams(expPost);
                    $.each(params, function(index, full_name) {
                        var field_name = full_name.split('.')[1].toUpperCase();
                        var field_input = el.closest('tr').find('[name='+field_name+']');
                        var field_val = field_input.val();

                        expPost = expPost.replace(new RegExp(full_name, "g"), field_val);
                    });

                    target_field_input.val(eval(expPost));
                });
            }
        });
    };

    var getExpParams=function(exp){
        var params = [];
        var param_str = "";
        var operators = [];
        for (var i = 0, len = exp.length; i < len; i++) {
          if(isOperator(exp[i])){
            operators.push(exp[i]);
          }
        }

        $.each(operators, function(index, op) {
            var reg = null;
            if(op=='*'){
                reg = new RegExp("\\*", "g");
            }else{
                reg = new RegExp(op, "g");
            }
            exp = exp.replace(reg, " ");
        });
        console.log(exp);
        params = exp.split(' ');
        return params;
    };

    var isOperator= function(c) {
        return c == '+' || c == '-' || c == '*' || c == '/' || c == '(' || c == ')';
    }

    var isBlurField=function(input_name){
        var is_blur = false;
        $.each(global_order_structure.EVENT_LIST, function(index, event) {
             var event_script_list =event.EVENT_SCRIPT;
             var event_script_objs = event_script_list;
             $.each(event_script_objs, function(i, event_script_obj){
                var operation_obj = event_script_obj.OPERATION_OBJ.EXP_KEY.toUpperCase();
                 if(operation_obj.indexOf(input_name)>-1){
                    is_blur = true;
                    return false;//break
                 }
             });
        });
        return is_blur;
    };

    var getEventScriptList=function(input_name){
        var setValueList = "";
        $.each(global_order_structure.EVENT_LIST, function(index, event) {
             var event_script =event.EVENT_SCRIPT;
             var event_script_objs = event_script;
             $.each(event_script_objs, function(i, event_script_obj){
                var operation_obj = event_script_obj.OPERATION_OBJ.EXP_KEY.toUpperCase();
                 if(operation_obj.indexOf(input_name)>-1){
                    setValueList = event_script_obj.SETVALUELIST;
                    return false;
                 }
             });
        });
        return setValueList;
    };

    return {
        global_order_structure: {},
        bindEvent: bindEvent,
        set_global_order_structure: function(order_structure){
            global_order_structure = order_structure
        }
    }
});