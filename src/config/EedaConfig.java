package config;

import handler.UrlHanlder;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.sql.SQLException;

import models.Location;
import models.Office;
import models.Permission;
import models.Role;
import models.RolePermission;
import models.UserCustomer;
import models.UserLogin;
import models.UserOffice;
import models.UserRole;
import models.eeda.profile.Action;
import models.eeda.profile.Module;
import models.eeda.profile.OfficeConfig;
import models.eeda.structure.Field;
import models.eeda.structure.Structure;

import org.apache.log4j.Logger;
import org.bee.tl.ext.jfinal.BeetlRenderFactory;
import org.h2.tools.Server;

import com.jfinal.config.Constants;
import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.ext.plugin.shiro.ShiroInterceptor;
import com.jfinal.ext.plugin.shiro.ShiroKit;
import com.jfinal.ext.plugin.shiro.ShiroPlugin;
import com.jfinal.kit.PathKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.CaseInsensitiveContainerFactory;
import com.jfinal.plugin.activerecord.SqlReporter;
import com.jfinal.plugin.activerecord.dialect.MysqlDialect;
import com.jfinal.plugin.c3p0.C3p0Plugin;
import com.jfinal.weixin.eeda.WeixinApiController;
import com.jfinal.weixin.eeda.WeixinMsgController;
import com.jfinal.weixin.sdk.api.ApiConfigKit;

import controllers.eeda.ModuleController;

public class EedaConfig extends JFinalConfig {
    private Logger logger = Logger.getLogger(EedaConfig.class);

    private static final String H2 = "H2";
    private static final String Mysql = "Mysql";
    private static final String ProdMysql = "ProdMysql";
      
    public static String mailUser;
    public static String mailPwd;
    
    /**
     * 
     * 供Shiro插件使用 。
     */
    Routes routes;

    C3p0Plugin cp;
    ActiveRecordPlugin arp;

    @Override
	public void configConstant(Constants me) {
        //加载配置文件
        File file = new File(PathKit.getWebRootPath()+"/WEB-INF/config/app_config.txt");
        loadPropertyFile(file);
        
        me.setDevMode(getPropertyToBoolean("devMode", false));
        
    	// ApiConfigKit 设为开发模式可以在开发阶段输出请求交互的 xml 与 json 数据
    	ApiConfigKit.setDevMode(me.getDevMode());
        
    	

        BeetlRenderFactory templateFactory = new BeetlRenderFactory();
        me.setMainRenderFactory(templateFactory);

        BeetlRenderFactory.groupTemplate.setCharset("utf-8");// 没有这句，html上的汉字会乱码

        // 注册后，可以使beetl html中使用shiro tag
        BeetlRenderFactory.groupTemplate.registerFunctionPackage("shiro", new ShiroExt());

        //没有权限时跳转到login
        me.setErrorView(401, "/eeda/noLogin.html");//401 authenticate err
        
        String unauthorizedUrl="/eeda/noPermission.html";
        ShiroKit.setUnauthorizedUrl(unauthorizedUrl);
        me.setErrorView(403, unauthorizedUrl);// authorization err
        
        //内部出错跳转到对应的提示页面，需要考虑提供更详细的信息。
        me.setError404View("/eeda/err404.html");
        me.setError500View("/eeda/err500.html");
        
        // me.setErrorView(503, "/login.html");
        // get name representing the running Java virtual machine.
        String name = ManagementFactory.getRuntimeMXBean().getName();
        System.out.println(name);
        // get pid
        String pid = name.split("@")[0];
        logger.info("Pid is: " + pid);
    }

    @Override
	public void configRoute(Routes me) {
        this.routes = me;
        setRoute(me, "/");
    }
    
	private void setRoute(Routes me, String contentPath) {
		//  project controller
        me.add("/", controllers.HomeController.class, contentPath);
        me.add("/module", ModuleController.class, contentPath);
        me.add("/role", controllers.eeda.profile.RoleController.class, contentPath);
        me.add("/userRole",controllers.eeda.profile.UserRoleController.class,contentPath);
        me.add("/privilege", controllers.eeda.profile.PrivilegeController.class, contentPath); 
        me.add("/location", controllers.eeda.profile.LocationController.class, contentPath); 
        me.add("/office", controllers.eeda.profile.OfficeController.class, contentPath);
        me.add("/officeConfig", controllers.eeda.profile.OfficeConfigController.class, contentPath); 
        
        me.add("/debug", controllers.eeda.profile.LogController.class, contentPath);
        
        me.add("/loginUser", controllers.eeda.profile.LoginUserController.class, contentPath);
        //register loginUser
        me.add("/register",controllers.eeda.profile.RegisterUserController.class,contentPath);
        me.add("/reset",controllers.eeda.profile.ResetPassWordController.class,contentPath);
       
//        me.add("/toll", controllers.yh.TollController.class, contentPath);
//        
//        me.add("/pay", controllers.yh.PayController.class, contentPath);
//        me.add("/ownCarPay", controllers.yh.PayController.class, contentPath);
//        me.add("/customer", controllers.yh.profile.CustomerController.class, contentPath);
//        
//        
//        me.add("/customerContract", controllers.yh.contract.ContractController.class, contentPath);
//        me.add("/spContract", controllers.yh.contract.ContractController.class, contentPath);
//        me.add("/route", controllers.yh.RouteController.class, contentPath);
//        
//        me.add("/product", controllers.yh.profile.ProductController.class, contentPath);
//        me.add("/warehouse", controllers.yh.profile.WarehouseController.class, contentPath);
//        me.add("/orderStatus", controllers.yh.profile.OrderStatusController.class, contentPath);
//        me.add("/account", controllers.yh.AccountController.class, contentPath);
//        me.add("/transferOrder", controllers.yh.order.TransferOrderController.class);
//        me.add("/transferOrderItem", controllers.yh.order.TransferOrderItemController.class, contentPath);
//        me.add("/transferOrderItemDetail", controllers.yh.order.TransferOrderItemDetailController.class, contentPath);
//        me.add("/transferOrderMilestone", controllers.yh.order.TransferOrderMilestoneController.class, contentPath);
//        me.add("/returnOrder", controllers.yh.returnOrder.ReturnOrderController.class, contentPath);
//        me.add("/delivery", controllers.yh.delivery.DeliveryController.class, contentPath);
//        me.add("/damageOrder", controllers.yh.damageOrder.DamageOrderController.class, contentPath);
//        me.add("/deliverySpContract", controllers.yh.contract.ContractController.class, contentPath);
//
//        me.add("/deliveryOrderMilestone", controllers.yh.delivery.DeliveryOrderMilestoneController.class, contentPath);
//        me.add("/pickupOrder", controllers.yh.pickup.PickupOrderController.class, contentPath);
//
//        me.add("/paymentCheckOrder", controllers.yh.arap.PaymentCheckOrderController.class, contentPath);
//
//        me.add("/copeCheckOrder", controllers.yh.arap.CopeCheckOrderController.class, contentPath);
//        me.add("/departOrder", controllers.yh.departOrder.DepartOrderController.class, contentPath);
//        me.add("/gateIn", controllers.yh.inventory.InventoryController.class, contentPath);
//        me.add("/gateOut", controllers.yh.inventory.InventoryController.class, contentPath);
//        me.add("/stock", controllers.yh.inventory.InventoryController.class, contentPath);
//        me.add("/carinfo", controllers.yh.profile.CarinfoController.class, contentPath);
//        me.add("/carmanage", controllers.yh.profile.CarinfoController.class, contentPath);
//        me.add("/carsummary", controllers.yh.carmanage.CarSummaryController.class, contentPath);
//        me.add("/carreimbursement", controllers.yh.carmanage.CarReimbursementController.class, contentPath);
//        me.add("/driverinfo", controllers.yh.profile.CarinfoController.class, contentPath);
//        me.add("/spdriverinfo", controllers.yh.profile.CarinfoController.class, contentPath);
//        me.add("/spcarinfo", controllers.yh.profile.CarinfoController.class, contentPath);
//        me.add("/deliveryMilestone", controllers.yh.delivery.DeliveryController.class, contentPath);
//        
//        //保险单
//        me.add("/insurance",controllers.yh.profile.InsuranceController.class);
//        //配送调车单
//        me.add("/deliveryPlanOrder", controllers.yh.delivery.DeliveryPlanOrderController.class, contentPath);
//        
//        //ar= account revenue  应收条目处理
//        me.add("/chargeConfiremList", controllers.yh.arap.ar.ChargeItemConfirmController.class, contentPath);
//        me.add("/chargeCheckOrder", controllers.yh.arap.ar.ChargeCheckOrderController.class, contentPath);
//        me.add("/chargePreInvoiceOrder", controllers.yh.arap.ar.ChargePreInvoiceOrderController.class, contentPath);
//        me.add("/chargeInvoiceOrder", controllers.yh.arap.ar.ChargeInvoiceOrderController.class, contentPath);
//        me.add("/chargeAdjustOrder", controllers.yh.arap.ar.ChargeAdjustOrderController.class, contentPath);
//        me.add("/chargeMiscOrder", controllers.yh.arap.ar.chargeMiscOrder.ChargeMiscOrderController.class, contentPath);
//        me.add("/chargeAcceptOrder", controllers.yh.arap.ar.ChargeAcceptOrderController.class, contentPath);
//        me.add("/chargeConfirm", controllers.yh.arap.ar.ChargeConfirmController.class, contentPath);
//        //ap 应付条目处理
//        me.add("/costConfirmList", controllers.yh.arap.ap.CostItemConfirmController.class, contentPath);
//        me.add("/costCheckOrder", controllers.yh.arap.ap.CostCheckOrderController.class, contentPath);
//        me.add("/costPreInvoiceOrder", controllers.yh.arap.ap.CostPreInvoiceOrderController.class, contentPath);
//        me.add("/costAdjustOrder", controllers.yh.arap.ap.CostAdjustOrderController.class, contentPath);
//        me.add("/costAcceptOrder", controllers.yh.arap.ap.CostAcceptOrderController.class, contentPath);
//        me.add("/costConfirm", controllers.yh.arap.ap.CostConfirmController.class, contentPath);
//        //应付报销单
//        me.add("/costReimbursement", controllers.yh.arap.ap.CostReimbursementOrder.class, contentPath);
//        //财务转账单
//        me.add("/transferAccountsOrder", controllers.yh.arap.ap.TransferAccountsController.class, contentPath);
//        me.add("/reimbursementItem", controllers.yh.ReimbursementItemController.class, contentPath);
//        //手工成本单
//        me.add("/costMiscOrder", controllers.yh.arap.ap.costMiscOrder.CostMiscOrderController.class, contentPath);
//        
//        me.add("/inOutMiscOrder", controllers.yh.arap.financial.inOutOrder.InOutMiscOrderController.class, contentPath);
//        
//        //预付单
//        me.add("/costPrePayOrder", controllers.yh.arap.ap.PrePayOrderController.class, contentPath);
//        //audit log
//        me.add("/accountAuditLog", controllers.yh.arap.AccountAuditLogController.class, contentPath);
//        //insuranceOrder
//        me.add("/insuranceOrder", controllers.yh.insurance.InsuranceOrderController.class, contentPath);
//        me.add("/report", controllers.yh.report.ReportController.class, contentPath);
//        me.add("/statusReport", controllers.yh.statusReport.StatusReportController.class, contentPath);
        
       
        //微信API路由
        me.add("/msg", WeixinMsgController.class);
		me.add("/api", WeixinApiController.class, "/api");
//		//跟车人员
//		me.add("/driverAssistant", DriverAssistantController.class, contentPath);
//		//退货单
//		me.add("/returnTransfer",ReturnTransferController.class,contentPath);
//		//app 
//		
//		me.add("/bzGateOutOrder", BzGateOutOrderController.class, "bz");
		
//		me.add("/home", HomeController.class, contentPath);
		
		
	}

    @Override
	public void configPlugin(Plugins me) {
        // 加载Shiro插件, for backend notation, not for UI
    	me.add(new ShiroPlugin(routes));
    	
    	//job启动
//    	SchedulerPlugin sp = new SchedulerPlugin("job.properties");
//        me.add(sp);
    	
        mailUser = getProperty("mail_user_name");
        mailPwd = getProperty("mail_pwd");
        // H2 or mysql
        initDBconnector();

        me.add(cp);

        arp = new ActiveRecordPlugin(cp);
        arp.setShowSql(getPropertyToBoolean("devMode", false));// 控制台打印Sql
        SqlReporter.setLogger(getPropertyToBoolean("devMode", false));// log4j 打印Sql
        me.add(arp);

        arp.setDialect(new MysqlDialect());
        // 配置属性名(字段名)大小写不敏感容器工厂
        arp.setContainerFactory(new CaseInsensitiveContainerFactory());

        arp.addMapping("eeda_office", Office.class);
        arp.addMapping("eeda_user", UserLogin.class);
        arp.addMapping("eeda_role", Role.class);
        arp.addMapping("eeda_permission", Permission.class);
        arp.addMapping("eeda_user_role", UserRole.class);
        arp.addMapping("eeda_role_permission", RolePermission.class);
        //common
        arp.addMapping("eeda_modules", Module.class);
        arp.addMapping("eeda_structure_action", Action.class); 
        
        arp.addMapping("eeda_structure", Structure.class);
        arp.addMapping("eeda_field", Field.class);
        
        arp.addMapping("location", Location.class);
        //基本数据用户网点
        arp.addMapping("user_office", UserOffice.class);
        arp.addMapping("user_customer", UserCustomer.class);
        
        
        arp.addMapping("eeda_office_config", OfficeConfig.class);
        
        /*
        arp.addMapping("leads", Leads.class);
        arp.addMapping("support_case", Case.class);
        
        arp.addMapping("order_header", Order.class);
        arp.addMapping("order_item", OrderItem.class);
        arp.addMapping("party", Party.class);
        arp.addMapping("party_attribute", PartyAttribute.class);
        arp.addMapping("dp_prof_provider_info", ServiceProvider.class);

        arp.addMapping("contact", Contact.class);        
        arp.addMapping("fin_account", Account.class);
        
        arp.addMapping("fin_item", Toll.class);        
        arp.addMapping("route", Route.class);
        arp.addMapping("product", Product.class);
        arp.addMapping("category", Category.class);
        arp.addMapping("warehouse", Warehouse.class);
        arp.addMapping("contract_item", ContractItem.class);
        arp.addMapping("order_status", OrderStatus.class);
        arp.addMapping("contract", Contract.class);
        arp.addMapping("transfer_order", TransferOrder.class);
        arp.addMapping("transfer_order_item", TransferOrderItem.class);
        arp.addMapping("transfer_order_item_detail", TransferOrderItemDetail.class);
        arp.addMapping("return_order", ReturnOrder.class);
        arp.addMapping("return_order_fin_item", ReturnOrderFinItem.class);
        arp.addMapping("delivery_order", DeliveryOrder.class);
        arp.addMapping("transfer_order_milestone", TransferOrderMilestone.class);
        arp.addMapping("billing_order", BillingOrder.class);
        arp.addMapping("billing_order_item", BillingOrderItem.class);
        arp.addMapping("delivery_order_milestone", DeliveryOrderMilestone.class);
        
        //配送调车单
        arp.addMapping("delivery_plan_order", DeliveryPlanOrder.class);
        arp.addMapping("delivery_plan_order_detail", DeliveryPlanOrderDetail.class);
        arp.addMapping("delivery_plan_order_milestone", DeliveryPlanOrderMilestone.class);
        arp.addMapping("delivery_plan_order_carinfo", DeliveryPlanOrderCarinfo.class);
        //arp.addMapping("fin_account_item", AccountItem.class);
        arp.addMapping("delivery_order_item", DeliveryOrderItem.class);
        arp.addMapping("depart_order", DepartOrder.class);
        arp.addMapping("depart_transfer", DepartTransferOrder.class);
        arp.addMapping("depart_pickup", DepartPickupOrder.class);
        arp.addMapping("warehouse_order", WarehouseOrder.class);
        arp.addMapping("warehouse_order_item", WarehouseOrderItem.class);
        arp.addMapping("inventory_item", InventoryItem.class);
        arp.addMapping("carinfo", Carinfo.class);
        arp.addMapping("fin_item", FinItem.class);
        arp.addMapping("delivery_order_fin_item", DeliveryOrderFinItem.class);
        arp.addMapping("transfer_order_fin_item", TransferOrderFinItem.class);
        arp.addMapping("depart_order_fin_item", DepartOrderFinItem.class);//提货拼车单、发车单的应付表
        arp.addMapping("pickup_order_fin_item", PickupOrderFinItem.class);//提货拼车单、发车单的应付表
        arp.addMapping("arap_charge_order", ArapChargeOrder.class);
        arp.addMapping("arap_charge_item", ArapChargeItem.class);
        arp.addMapping("arap_charge_invoice", ArapChargeInvoice.class);
        arp.addMapping("insurance_order", InsuranceOrder.class);
        arp.addMapping("insurance_fin_item", InsuranceFinItem.class);
        
        arp.addMapping("arap_charge_invoice_application_order", ArapChargeInvoiceApplication.class);
        arp.addMapping("arap_charge_invoice_application_item", ArapChargeInvoiceApplicationItem.class);
        arp.addMapping("arap_charge_invoice_item_invoice_no", ArapChargeInvoiceItemInvoiceNo.class);
        arp.addMapping("arap_charge_application_invoice_no", ArapChargeApplicationInvoiceNo.class);
        arp.addMapping("charge_application_order_rel", ChargeApplicationOrderRel.class);
        arp.addMapping("arap_charge_receive_confirm_order_detail", ArapChargeReceiveConfirmOrderDtail.class);
        arp.addMapping("arap_charge_receive_confirm_order_detail_log", ArapChargeReceiveConfirmOrderDtailLog.class);
        arp.addMapping("arap_charge_receive_confirm_order", ArapChargeReceiveConfirmOrder.class);
        arp.addMapping("arap_charge_receive_confirm_order_log", ArapChargeReceiveConfirmOrderLog.class);
        
        arp.addMapping("arap_misc_charge_order", ArapMiscChargeOrder.class);
        arp.addMapping("arap_misc_charge_order_item", ArapMiscChargeOrderItem.class);
        arp.addMapping("arap_account_audit_log", ArapAccountAuditLog.class);
        arp.addMapping("arap_account_audit_summary", ArapAccountAuditSummary.class);
        // 应付对账单
        arp.addMapping("arap_cost_order", ArapCostOrder.class);
        arp.addMapping("arap_cost_item", ArapCostItem.class);
        arp.addMapping("arap_cost_invoice_application_order", ArapCostInvoiceApplication.class);
        arp.addMapping("arap_cost_invoice", ArapCostInvoice.class);
        arp.addMapping("arap_cost_invoice_item_invoice_no", ArapCostInvoiceItemInvoiceNo.class);
        arp.addMapping("arap_cost_order_invoice_no", ArapCostOrderInvoiceNo.class);
        arp.addMapping("arap_misc_cost_order", models.yh.arap.ArapMiscCostOrder.class);
        arp.addMapping("arap_misc_cost_order_item", models.yh.arap.ArapMiscCostOrderItem.class);
        arp.addMapping("cost_application_order_rel", CostApplicationOrderRel.class);
        arp.addMapping("arap_cost_pay_confirm_order_detail", ArapCostPayConfirmOrderDtail.class);
        arp.addMapping("arap_cost_pay_confirm_order_detail_log", ArapCostPayConfirmOrderDtailLog.class);
        arp.addMapping("arap_cost_pay_confirm_order", ArapCostPayConfirmOrder.class);
        arp.addMapping("arap_cost_pay_confirm_order_log", ArapCostPayConfirmOrderLog.class);
        arp.addMapping("arap_in_out_misc_order", ArapInOutMiscOrder.class);
        //财务转账单
        arp.addMapping("transfer_accounts_order", TransferAccountsOrder.class);
        //应付报销单
        arp.addMapping("reimbursement_order", ReimbursementOrder.class);
        arp.addMapping("reimbursement_order_fin_item", ReimbursementOrderFinItem.class);
        //预付单
        arp.addMapping("arap_pre_pay_order", ArapPrePayOrder.class);
        arp.addMapping("arap_pre_pay_order_item", ArapPrePayOrderItem.class);
        // yh mapping
        //行车单
        arp.addMapping("car_summary_order", CarSummaryOrder.class);
        arp.addMapping("car_summary_detail", CarSummaryDetail.class);
        arp.addMapping("car_summary_detail_route_fee", CarSummaryDetailRouteFee.class);
        arp.addMapping("car_summary_detail_oil_fee", CarSummaryDetailOilFee.class);
        arp.addMapping("car_summary_detail_salary", CarSummaryDetailSalary.class);
        arp.addMapping("car_summary_detail_other_fee", CarSummaryDetailOtherFee.class);
        
        arp.addMapping("damage_order", DamageOrder.class);
        arp.addMapping("damage_order_item", DamageOrderItem.class);
        arp.addMapping("damage_order_fin_item", DamageOrderFinItem.class);
        
        
        //单据附件上传
        arp.addMapping("order_attachment_file", OrderAttachmentFile.class);
        //跟车人员 
        arp.addMapping("driver_assistant", DriverAssistant.class);
        arp.addMapping("pickup_driver_assistant", PickupDriverAssistant.class);
        //跟车人员 
        arp.addMapping("party_insurance_item", PartyInsuranceItem.class);
        //供应商客户计费方式
        arp.addMapping("charge_type", ProviderChargeType.class);
        //微信位置信息
        arp.addMapping("wechat_location", WechatLocation.class);
        arp.addMapping("customer_route_provider", CustomerRoute.class);
        
        
        
        //bz
        arp.addMapping("bz_gate_out_order", BzGateOutOrder.class);
        arp.addMapping("bz_gate_out_order_item", BzGateOutOrderItem.class);
        
        */
        
    }

    private void initDBconnector() {
        String dbType = getProperty("dbType");
        String url = getProperty("dbUrl");
        String username = getProperty("username");
        String pwd = getProperty("pwd");

        if (H2.equals(dbType)) {
            connectH2();
        } else {
        	logger.info("DB url: " + url);
            cp = new C3p0Plugin(url, username, pwd);
            //DataInitUtil.initH2Tables(cp);

        }

    }

    private void connectH2() {
        // 这个启动web console以方便通过localhost:8082访问数据库
        try {
            Server.createWebServer().start();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        cp = new C3p0Plugin("jdbc:h2:mem:eeda;", "sa", "");
        // cp = new C3p0Plugin("jdbc:h2:data/sample;IFEXISTS=TRUE;", "sa", "");
        cp.setDriverClass("org.h2.Driver");
//        DataInitUtil.initH2Tables(cp);
    }

    @Override
	public void configInterceptor(Interceptors me) {
    	if("Y".equals(getProperty("is_check_permission"))){
    		logger.debug("is_check_permission = Y");
         	me.add(new ShiroInterceptor());
    	}
        //me.add(new SetAttrLoginUserInterceptor());
    }

    @Override
	public void configHandler(Handlers me) {
        
        me.add(new UrlHanlder());
        
    }
}
