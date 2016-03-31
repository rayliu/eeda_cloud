package interceptor;

import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import models.Office;
import models.UserLogin;
import models.UserOffice;
import models.eeda.profile.OfficeConfig;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;
import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class EedaInterceptor implements Interceptor{
	private Logger logger = Logger.getLogger(EedaInterceptor.class);
	
	@Override
	public void intercept(Invocation ai) {
	    Subject currentUser = SecurityUtils.getSubject();
	    if(currentUser.isAuthenticated()){
	        setLoginUser(ai);
	        setSysTitle(ai.getController());
	        checkPermission(ai);
	        loadMenu(ai.getController());
	    }
		ai.invoke();
	}
	
	/*
	 * 这个如果不放这里,那么每个controller的index凡是要render HTML的地方都要写调用
	 */
	private void loadMenu(Controller controller) {
	    logger.debug("EedaInterceptor loadMenu...");
        UserLogin user = UserLogin.getCurrentUser();
        
        //获取user的权限,看看是否有查询权限
        String authSql="select group_concat(distinct cast(mp.module_id as char) separator ',') module_ids"+
                " from eeda_user u, eeda_user_role ur, eeda_role r, eeda_module_permission mp, eeda_structure_action sa "+
                " where u.user_name = ur.user_name and ur.role_id = r.id"+
                " and ur.role_id = mp.role_id and mp.permission_id = sa.id and mp.is_auth='Y' and sa.action_name='查询'"+
                " and ur.user_name =?";
        Record module_ids_rec = Db.findFirst(authSql, user.getStr("user_name"));
        String module_ids=module_ids_rec.getStr("module_ids");
        //查询当前用户菜单
        String sql ="select distinct module.* from eeda_modules sub, eeda_modules module "
                + "where sub.parent_id = module.id and sub.office_id=? and sub.status = '启用' "
                + " and sub.sys_only='N' and sub.id in("+module_ids+") order by seq";
        List<Record> modules = Db.find(sql, user.get("office_id"));
        for (Record module : modules) {
            sql ="select * from eeda_modules where parent_id =? and status = '启用' and id in("+module_ids+") order by seq";
            logger.debug("parent module id: "+module.get("id") +", ids:"+ module_ids);
            List<Record> orders = Db.find(sql, module.get("id"));
            module.set("orders", orders);
        }
        logger.debug(" "+modules.size());
        if(modules == null)
            modules = Collections.EMPTY_LIST;
        controller.setAttr("modules", modules);
        
        //查询开发者菜单
        String sysSql ="select * from eeda_modules module where sys_only='Y' order by seq";
        List<Record> sys_modules = Db.find(sysSql);
        if(sys_modules == null)
            sys_modules = Collections.EMPTY_LIST;
        controller.setAttr("sys_modules", sys_modules);
    }

	private void checkPermission(Invocation ai) {
	    
	}
	
    private void setLoginUser(Invocation ai) {
        Subject currentUser = SecurityUtils.getSubject();
		if(currentUser.isAuthenticated()){
			UserLogin user = UserLogin.getUserByName(currentUser.getPrincipal().toString());
			if(user.get("c_name") != null && !"".equals(user.get("c_name"))){
				ai.getController().setAttr("userId", user.get("c_name"));
			}else{
				ai.getController().setAttr("userId", currentUser.getPrincipal());
			}
			
			Long office_id = user.getLong("office_id");//总公司office_id
			UserOffice uo = UserOffice.dao.findFirst("select * from user_office where office_id =?", office_id);
	        if(uo != null){
	            Office office = Office.dao.findById(uo.get("office_id"));
	            ai.getController().setAttr("office_name", office.get("office_name"));
	        }
	        
			ai.getController().setAttr("user_login_id", currentUser.getPrincipal());
			ai.getController().setAttr("permissionMap", ai.getController().getSessionAttr("permissionMap"));
		}
    }
	
	private void setSysTitle(Controller controller) {
		HttpServletRequest request = controller.getRequest();
		String serverName = request.getServerName();
        String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+"/";
        
        logger.debug("Current host path:"+basePath);
        OfficeConfig of = OfficeConfig.dao.findFirst("select * from eeda_office_config where domain like '"+serverName +"%' or domain like '%"+serverName +"%'");
        if(of==null){//没有配置公司的信息会导致页面出错，显示空白页
        	of = new OfficeConfig();
        	of.set("system_title", "易达物流");
        	of.set("logo", "/eeda/img/eeda_logo.ico");
        }
        controller.setAttr("SYS_CONFIG", of);
	}

}
