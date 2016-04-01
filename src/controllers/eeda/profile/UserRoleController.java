package controllers.eeda.profile;

import interceptor.EedaInterceptor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import models.Office;
import models.ParentOfficeModel;
import models.Permission;
import models.Role;
import models.RolePermission;
import models.UserLogin;
import models.UserOffice;
import models.UserRole;

import org.apache.commons.lang.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.apache.shiro.subject.Subject;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

import controllers.eeda.util.CompareStrList;
import controllers.eeda.util.ParentOffice;
import controllers.eeda.util.PermissionConstant;
@RequiresAuthentication
@Before(EedaInterceptor.class)
public class UserRoleController extends Controller {
	private Logger logger = Logger.getLogger(PrivilegeController.class);
	Subject currentUser = SecurityUtils.getSubject();
	
	Long office_id = UserLogin.getCurrentUser().getLong("office_id");
	ParentOfficeModel pom = ParentOffice.getInstance().getOfficeId(this);

	public void index(){
		render("/eeda/profile/userRole/userRoleList.html");
	}
	
	/*查询用户角色*/
//	@RequiresPermissions(value = {PermissionConstant.PERMSSION_UR_LIST})
	public void list(){
		String sLimit = "";
		String pageIndex = getPara("sEcho");
		if (getPara("iDisplayStart") != null
		        && getPara("iDisplayLength") != null) {
			sLimit = " LIMIT " + getPara("iDisplayStart") + ", "
			        + getPara("iDisplayLength");
		}
		
		String sql = "select ur.user_name,ul.c_name, group_concat(r.name separator '<br>') role_name,ur.remark,ur.role_id from eeda_user_role ur "
             +" left join eeda_role r on r.id=ur.role_id" 
             +" left join eeda_user ul on ur.user_name = ul.user_name "
             +" left join eeda_office o on ul.office_id = o.id "
             +" where ul.office_id=? group by ur.user_name" ;

		Record rec = Db.findFirst("select count(1) total from ("+sql+") A", office_id);
		logger.debug("total records:" + rec.getLong("total"));
		// 获取当前页的数据
		List<Record> orders = Db.find(sql + sLimit, office_id);

		Map orderMap = new HashMap();
		orderMap.put("sEcho", pageIndex);
		orderMap.put("iTotalRecords", rec.getLong("total"));
		orderMap.put("iTotalDisplayRecords", rec.getLong("total"));

		orderMap.put("aaData", orders);

		renderJson(orderMap);
	}
	/*编辑*/
//	@RequiresPermissions(value = {PermissionConstant.PERMSSION_UR_UPDATE})
	public void edit(){
		String user_name = getPara("username");
		setAttr("user_name", user_name);
		render("/eeda/profile/userRole/assigning_roles.html");
	}
	
	/*给新用户分配角色*/
//	@RequiresPermissions(value = {PermissionConstant.PERMSSION_UR_CREATE})
	public void add(){
		render("/eeda/profile/userRole/addRole.html");
	}
	public void addOrUpdate(){
		String id = getPara("id");
		UserLogin user = UserLogin.dao.findFirst("select * from eeda_user where id = ?",id);
		List<UserRole> list = UserRole.dao.find("select * from eeda_user_role where user_name = ?",user.get("user_name"));
		if(list.size()>0){
			setAttr("user_name", user.get("user_name"));		
			render("/eeda/profile/userRole/assigning_roles.html");
		}else{
			render("/eeda/profile/userRole/addRole.html");
		}
		
	}
	/*列出没有角色的用户*/
//	@RequiresPermissions(value = {PermissionConstant.PERMSSION_UR_CREATE})
	public void userList(){
		String sql = "";
		Long parentID = pom.getBelongOffice();
		//系统管理员
		sql = "select u.*, ur.role_id from eeda_user u left join eeda_user_role ur on u.user_name=ur.user_name where ur.role_id is null and u.office_id=?";
		
		List<Record> orders = Db.find(sql, office_id);
        renderJson(orders);
	}
//	@RequiresPermissions(value = {PermissionConstant.PERMSSION_UR_CREATE})
	public void saveUserRole(){
		String name = getPara("name");
		String r = getPara("roles");
		String[] roles = r.split(",");
		for (String id : roles) {
			UserRole ur = new UserRole();
			ur.set("user_name", name);
			/*根据id找到Role*/
			Role role = Role.dao.findFirst("select * from eeda_role where id=?",id);
			ur.set("role_id", role.get("id"));
			ur.save();
		}
		renderJson();
	}
//	@RequiresPermissions(value = {PermissionConstant.PERMSSION_UR_UPDATE})
	public void updateRole(){
		String name = getPara("name");
		String r = getPara("roles");
		
		String[] roles = r.split(",");
		
		
        List<UserRole> list = UserRole.dao.find("select id from eeda_user_role where user_name=?",name);
        
        List<Object> ids = new ArrayList<Object>();
        for (UserRole ur : list) {
            ids.add(ur.get("id"));
        }
        
        CompareStrList compare = new CompareStrList();
        
        List<Object> returnList = compare.compare(ids, roles);
        
        ids = (List<Object>) returnList.get(0);
        List<String> saveList = (List<String>) returnList.get(1);
        if(ids.size()>0){
        	for (Object id : ids) {
                UserRole.dao.findFirst("select * from eeda_user_role where id=?", id).delete();
            }
        }
        
        if(saveList.size()>0){
        	for (Object object : saveList) {
                UserRole ur = new UserRole();
                ur.set("user_name", name);
                /*根据id找到Role*/
                Role role = Role.dao.findFirst("select * from eeda_role where id=?",object);
                if(role != null){
                	ur.set("role_id", role.get("id"));
                    ur.save();
                }
                
            }
        }
        
		renderJson();
	}
	
	
	public void roleList() {
		//获取选中的用户
		String username = getPara("username");
		String sLimit = "";
		String pageIndex = getPara("sEcho");
		if (getPara("iDisplayStart") != null
		        && getPara("iDisplayLength") != null) {
			sLimit = " LIMIT " + getPara("iDisplayStart") + ", "
			        + getPara("iDisplayLength");
		}

		
		String sql = "select r.*, (select count(1) from eeda_user_role ur where ur.role_id = r.id and ur.user_name=?) is_auth "
		        + "from eeda_role r where r.office_id=?";
		
		Record rec = Db.findFirst("select count(1) total from ("+sql+") A", username, office_id);
		logger.debug("total records:" + rec.getLong("total"));

		// 获取当前页的数据
		List<Record> orders = Db.find(sql, username, office_id);
		Map orderMap = new HashMap();
		orderMap.put("sEcho", pageIndex);
		orderMap.put("iTotalRecords", rec.getLong("total"));
		orderMap.put("iTotalDisplayRecords", rec.getLong("total"));

		orderMap.put("aaData", orders);

		renderJson(orderMap);

	}
	public void userPermissionRender(){
		String username = getPara("username");
		setAttr("username", username);
		render("/eeda/profile/userRole/userPermission.html");
	}
	//查询用户的权限
	public void permissionList(){
		/*获取到用户的名称*/
		String username = getPara("username");
		//查询当前用户的父类公司的id
		Office parentOffice = getCurrentUserOffice();
		Long parentID = parentOffice.get("belong_office");
		if(parentID == null || "".equals(parentID)){
			parentID = parentOffice.getLong("id");
		}
		
		
		List<Record> orders = new ArrayList<Record>();
		//List<Permission> parentOrders =Permission.dao.find("select module_name from permission group by module_name");
		List<Permission> parentOrders = Permission.dao.find("select p.module_name,rp.is_authorize from permission p left join role_permission rp on rp.permission_code = p.code where rp.role_code ='admin' and rp.office_id = ?",parentID);
		List<Permission> po = new ArrayList<Permission>();
		for (int i = 0; i < parentOrders.size(); i++) {
			if(i!=0){
				if(!parentOrders.get(i).get("module_name").equals(parentOrders.get(i-1).get("module_name"))){
					po.add(parentOrders.get(i));
				}
			}else{
				po.add(parentOrders.get(i));
			}
			
		}	
		
		for (Permission rp : po) {
			String key = rp.get("module_name");
			/*select p.code, p.name,p.module_name ,r.permission_code from permission p left join  (select * from role_permission rp where rp.role_code =?) r on r.permission_code = p.code where p.module_name=?*/
			
			List<RolePermission> childOrders = RolePermission.dao.find("select distinct p.id, p.code, p.name,p.module_name ,r.permission_code from permission p left join (select rp.* from eeda_user_role  ur left join role_permission  rp on rp.role_code = ur.role_code where ur.user_name =? and  rp.office_id =  " + parentID + ")r on r.permission_code = p.code where p.module_name=? order by p.id",username,key);
			Record r = new Record();
			r.set("module_name", key);
			r.set("childrens", childOrders);
			r.set("is_authorize", rp.get("is_authorize"));
			orders.add(r);
			
		}
		Map orderMap = new HashMap();
		orderMap.put("aaData", orders);

		orderMap.put("aaData", orders);

		renderJson(orderMap);
	}

	private Office getCurrentUserOffice() {
		String userName = currentUser.getPrincipal().toString();
		UserOffice currentoffice = UserOffice.dao.findFirst("select * from user_office where user_name = ? and is_main = ?",userName,true);
		Office parentOffice = Office.dao.findFirst("select * from eeda_office where id = ?",currentoffice.get("office_id"));
		return parentOffice;
	}
	
}
