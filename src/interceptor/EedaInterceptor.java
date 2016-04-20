package interceptor;

import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import models.Office;
import models.UserLogin;
import models.UserOffice;
import models.eeda.profile.OfficeConfig;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.subject.Subject;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.config.Constants;
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
//	        loadMenu(ai.getController());
	    }else{
	        if(!"/login".equals(ai.getActionKey())){
	            ai.getController().redirect("/login");
	            return;
	        }
	    }
		ai.invoke();
	}
	
	
	private void checkPermission(Invocation ai) {
	    String actionKey = ai.getActionKey();
	    if("/m".equals(actionKey)){
	        String para = ai.getController().getPara();
	        String[] params = para.split("-");
	        String module_id = params[0];
	        Long office_id = UserLogin.getCurrentUser().getLong("office_id");
	        Record rec = Db.findFirst("select * from eeda_modules where office_id=? and id=?", office_id, module_id);
	        if(rec == null){
	            //throw new AuthorizationException("no permission...");
	            ai.getController().renderError(403);
	        }
	    }
	    
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
			
            Office office = Office.dao.findById(office_id);
            ai.getController().setAttr("office_name", office.get("office_name"));
	        
	        
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
