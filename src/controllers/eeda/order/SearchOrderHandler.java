package controllers.eeda.order;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

import models.UserLogin;

import org.apache.commons.lang.StringUtils;

import com.google.gson.Gson;
import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

import controllers.eeda.ModuleController;

public class SearchOrderHandler {
    private static Logger logger = Logger.getLogger(SearchOrderHandler.class);
    
    
    public static Map searchOrder(Enumeration<String>  paraNames, HttpServletRequest request){
        Map orderListMap = new HashMap();
        
        String colCondition = "";
        String subCol = "";
        String sql = "";
        
        //获取field定义 
        SearchDto searchDto = buildSearchDto(paraNames, request);
        //是否自定义查询?
        Record customRec= Db.findFirst("select * from eeda_module_customize_search where module_id=?", searchDto.module_id);
        if(customRec!=null && customRec.getStr("setting_json").length()>0){
            sql = getCustomizeSearchSql(request, searchDto, customRec);
        }else{
            sql = getNormalSearchSql(request, colCondition, subCol,
                    searchDto);
        }
        
        List<Record> resultList;
        String totalSql = "select count(1) total from (" + sql + ") A";
        
        Record rec = Db.findFirst(totalSql);
        
        String sLimit = " limit " + searchDto.start + ", " +searchDto.length; 
        resultList = Db.find(sql +" order by id desc " + sLimit);
        if(resultList == null)
            resultList = Collections.EMPTY_LIST;
        
        
        orderListMap.put("draw", searchDto.draw);
        orderListMap.put("recordsTotal", rec.getLong("total"));
        orderListMap.put("recordsFiltered", rec.getLong("total"));

        orderListMap.put("data", resultList);

        return orderListMap;
    }

    private static String getNormalSearchSql(HttpServletRequest request,
            String colCondition, String subCol, SearchDto searchDto) {
        List<String> fieldIdList = searchDto.fieldIdList;
        List<String> fieldNameList = searchDto.fieldNameList;
        
        List<Record> resultList = null;
        //获取field定义, 判断是否需要针对特殊列表转换ID -> 名字
        String fieldSql ="";
        if(fieldIdList.size()>0){
            fieldSql = "select * from eeda_field where id in(" + StringUtils.join(fieldIdList, ", ")+")";
        }else{
            fieldSql = "select * from eeda_field where structure_id = " + searchDto.structur_id;
        }
        List<Record> fieldDefineList = Db.find(fieldSql);
        Map<String, Map> dateMap = new HashMap<String, Map>();
        for (String fieldName : fieldNameList) {
                String key = fieldName;
                String value = request.getParameter(key);
                
                logger.debug("key="+key);
                if(key.endsWith("_begin_time")){
                    String dateFieldKey = key.substring(0, key.indexOf("_begin_time"));
                    Map dateValueMap = new HashMap();
                    dateValueMap = dateMap.get(dateFieldKey);
                    if(dateValueMap==null){
                        dateValueMap = new HashMap();
                    }
                    dateValueMap.put("begin_time", value);
                }else if(key.endsWith("_end_time")){
                    String dateFieldKey = key.substring(0, key.indexOf("_end_time"));
                    Map dateValueMap = new HashMap();
                    dateValueMap = dateMap.get(dateFieldKey);
                    if(dateValueMap==null){
                        dateValueMap = new HashMap();
                    }
                    dateValueMap.put("end_time", value);
                }else{
                    Record fieldDefine = getFieldDefine(key, fieldDefineList);
                    if(fieldDefine!=null && "下拉列表".equals(fieldDefine.get("field_type"))) {
                        String ext_type_json = fieldDefine.get("field_type_ext_type");
                        Gson gson = new Gson();  
                        Map<String, ?> ext_type_dto= gson.fromJson(ext_type_json, HashMap.class);
                        String id = ext_type_dto.get("id").toString();
                        if(new BigInteger(id).intValue()>0){
                            String listFieldStr="列表定义.显示字段";//这里是写死的，以后都是找这个定义的表和字段作为基础信息生成列表
                            Record defineField = ModuleController.getFieldByName(listFieldStr);
                            
                            String defineFieldName = "F"+defineField.get("id")+"_"+defineField.getStr("field_name");
                            Record dropdown = Db.findFirst("select id, "+defineFieldName+" from t_"+defineField.get("structure_id")+" where id =?", id);
                            
                            String displayField = dropdown.getStr(defineFieldName);//这里获取了定义表中定义的值，如：客户.简称
                            
                            Record field = ModuleController.getFieldByName(displayField);
                            //注意structur_id为 查询主表的id
                            subCol += ", (select F"+field.get("id")+"_"+field.getStr("field_name")+" from t_"+field.get("structure_id")
                                    +" where id=t."+key+") "+ key +"_INPUT";
                            if(StringUtils.isNotEmpty(value)){
                                colCondition += " and " + key + " = '" + value + "'";
                            }
                        }else if("城市列表".equals(ext_type_dto.get("name").toString())){
                               subCol += ", (get_loc_full_name("+key+")) "+ key +"_INPUT";
                        }else{
                        }
                    }else{
                        if(StringUtils.isNotEmpty(value))
                            colCondition += " and " + key + " like '%" + value + "%'";
                    }
                }
        }
        
        //处理日期
        for (Entry<String, Map> entry: dateMap.entrySet()) {
            String key = entry.getKey();
            Map valueMap = entry.getValue();
            colCondition += "and " + key + " between '" + valueMap.get("begin_time") + " 00:00:00' and " + valueMap.get("end_time") +" 23:59:59";
        }
        //sys_only?
        if(searchDto.isSysModule){
            Long office_id = UserLogin.getCurrentUser().getLong("office_id");
            colCondition += " and office_id ="+office_id;
        }
        
        String sql = "select t.* "+ subCol +" from t_" + searchDto.structur_id +" t where 1=1 " + colCondition;
        return sql;
    }

    private static String getCustomizeSearchSql(HttpServletRequest request, SearchDto searchDto, Record rec) {
        Long office_id = UserLogin.getCurrentUser().getLong("office_id");
        String sql = "";
        String colCondition = "";
        String settingStr = rec.getStr("setting_json");
        Map<String, ?> dto= new Gson().fromJson(settingStr, HashMap.class);
        String viewName = dto.get("view_name").toString();
        Record viewRec = Db.findFirst("select * from eeda_sql_views where name = ? and office_id=?", viewName, office_id);
        if(viewRec!=null){
            String sqlName = viewRec.getStr("sql_name");
            sql ="select * from "+sqlName+" where 1=1 ";
        }
        //处理condition
        Map<String, Map> dateMap = new HashMap<String, Map>();
        List<String> fieldNameList = searchDto.fieldNameList;
        for (String fieldName : fieldNameList) {
            String key = fieldName;
            String value = request.getParameter(key);
            logger.debug("key="+key);
           
            if(key.endsWith("_begin_time")){
                String dateFieldKey = key.substring(0, key.indexOf("_begin_time"));
                Map dateValueMap = new HashMap();
                dateValueMap = dateMap.get(dateFieldKey);
                if(dateValueMap==null){
                    dateValueMap = new HashMap();
                }
                dateValueMap.put("begin_time", value);
            }else if(key.endsWith("_end_time")){
                String dateFieldKey = key.substring(0, key.indexOf("_end_time"));
                Map dateValueMap = new HashMap();
                dateValueMap = dateMap.get(dateFieldKey);
                if(dateValueMap==null){
                    dateValueMap = new HashMap();
                }
                dateValueMap.put("end_time", value);
            }else{
                if(StringUtils.isNotEmpty(value))
                    colCondition += " and " + key + " like '%" + value + "%'";
            }
        }
        //处理日期
        for (Entry<String, Map> entry: dateMap.entrySet()) {
            String key = entry.getKey();
            Map valueMap = entry.getValue();
            colCondition += "and " + key + " between '" + valueMap.get("begin_time") + " 00:00:00' and " + valueMap.get("end_time") +" 23:59:59";
        }
        return sql += colCondition;
    }
    
    private static SearchDto buildSearchDto(Enumeration<String> paraNames,
            HttpServletRequest request) {
        SearchDto searchDto = new SearchDto();
        List<String> fieldIdList = new ArrayList<String>();
        List<String> fieldNameList = new ArrayList<String>();
        for (Enumeration<String> e = paraNames; paraNames.hasMoreElements();){
            String paraName = e.nextElement();
            String paraValue = request.getParameter(paraName);
            System.out.println(paraName + "=" + paraValue);
            
            if("structure_name".equals(paraName)){
                searchDto.structure_name = paraValue;
            }
            if("module_id".equals(paraName)){
                searchDto.module_id = paraValue;
            }
            if("structure_id".equals(paraName)){
                searchDto.structur_id = paraValue;
            }
            if("draw".equals(paraName)){
                searchDto.draw = paraValue;
            }
            if("start".equals(paraName)){
                searchDto.start = paraValue;
            }
            if("length".equals(paraName)){
                searchDto.length = paraValue;
            }
            if(paraValue.startsWith("F")){//获取field定义
                if(!paraValue.endsWith("_INPUT")){
                    String id = paraValue.split("_")[0].replace("F", "");
                    fieldIdList.add(id);
                    fieldNameList.add(paraValue);
                }else{
                    String id = paraValue.split("_")[0].replace("F", "");
                    fieldIdList.add(id);
                    String value = paraValue.replace("_INPUT", "");
                    fieldNameList.add(value);
                }
            }
            if(paraName.equalsIgnoreCase("id")){
                fieldNameList.add(paraName);
            }
        }
        searchDto.fieldIdList = fieldIdList;
        searchDto.fieldNameList = fieldNameList;
        
        if(StringUtils.isNotEmpty(searchDto.structure_name)){
            Record s = ModuleController.getStructureByName(searchDto.structure_name);
            searchDto.structur_id = s.get("id").toString();
            searchDto.module_id = s.get("module_id").toString();
        }
        
        Record m = Db.findFirst("select * from eeda_modules where id=?", searchDto.module_id);
        if(m!=null){
            String isSys=m.getStr("sys_only");
            if("Y".equals(isSys)){
                searchDto.isSysModule = true;
            }
        }
        return searchDto;
    }
    
    private static Record getFieldDefine(String fieldName, List<Record> fieldDefineList){
        Record rec = null;
        for (Record record : fieldDefineList) {
            String recFieldName = "F" + record.get("id") + "_" + record.get("field_name");
            if(fieldName.equals(recFieldName)){
                rec = record;
                break;
            }
        }
        return rec;
    }
}
