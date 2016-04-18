define(['jquery_ui', 'sco', 'file_upload', './editOrder_btn', './editOrder_table_add_btn', './orderController', './editOrder_event'], 
    function(jquery_ui, sco, file_upload, editOrder_btn_controller, editOrder_table_add_btn, orderController, eventController){

    

    orderController.editOrder_btn_controller = editOrder_btn_controller;
    orderController.editOrder_event_controller = eventController;

    $('[data-toggle=tooltip]').tooltip();

    var global_order_structure;
    var global_customer_id;
    var global_data_table={};
    var orderModel = {
        global_order_structure: global_order_structure
    };

    $.post('/module/getOrderStructure', {
            module_id: $("#module_id").val()
        }, function(json) {
                console.log('getOrderStructure...test.');
                console.log(json);
                global_order_structure = json;
                orderController.global_order_structure=global_order_structure;
                

                editOrder_btn_controller.set_global_order_structure(global_order_structure);
                editOrder_table_add_btn.set_global_order_structure(global_order_structure);
                eventController.set_global_order_structure(global_order_structure);
                
                $('#module_structure').val(JSON.stringify(json));

                $('#module_name').text(json.MODULE_NAME);
                document.title = json.MODULE_NAME + ' | ' + document.title;

                var commonHandle=function(){
                   
                    editOrder_btn_controller.buildButtonUI(json);
                    editOrder_btn_controller.bindBtnClick(); //绑定按钮事件
                    eventController.bindEvent();
                    $('[data-toggle=tooltip]').tooltip();
                };
                //数据处理
                if($('#order_id').val()!=''){
                    orderController.fillOrderData(json, commonHandle);
                }else{
                    //UI 处理
                    orderController.buildStructureUI(json);
                    commonHandle();
                }
            },
    'json');
});
