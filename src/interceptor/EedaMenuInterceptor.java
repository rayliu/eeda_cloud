package interceptor;

import java.util.Collections;
import java.util.List;

import models.UserLogin;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;
import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class EedaMenuInterceptor implements Interceptor{
	private Logger logger = Logger.getLogger(EedaMenuInterceptor.class);
	
	@Override
	public void intercept(Invocation ai) {
	    Subject currentUser = SecurityUtils.getSubject();
	    if(currentUser.isAuthenticated()){
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
}
