package controllers.eeda.util;

import java.math.BigInteger;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Scanner;
import java.util.regex.MatchResult;

import javax.servlet.http.HttpServletRequest;

import models.UserLogin;

import org.apache.commons.lang.StringUtils;
import org.apache.shiro.util.CollectionUtils;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;
import com.google.gson.reflect.TypeToken;
import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

import controllers.eeda.ModuleController;

public class EedaCommonHandler {
    private static Logger logger = Logger.getLogger(EedaCommonHandler.class);
    
    /**
     * editOrder页面: save传回来的data结构, 查询order传出去的结构按以下格式构造
     * orderDto{
     *    id:1，                  //单据的id，
     *    module_id: 13，         //对应的模块id，
     *    action: "保存",         //对应的按钮动作
     *    fields_list:[{         //类型为“字段”的数据，只有一行
     *          id:1,            //对应表名T_3.id
     *          structure_id:3,  //对应表名T_3
     *          F1_DH: "YS1001", //对应表中字段T_3.F1_DH
     *          F2_KH: "1",      //对应表中字段T_3.F2_KH
     *          F3_GYS: "8"      //对应表中字段T_3.F3_GYS
     *      }，{}],
     *    table_list:[           //类型为“列表”的数据，相当于从表
     *      {
     *         structure_id: 5,         //对应表名T_5
     *         structure_parent_id: 3,  //此从表对应主表为structure_id:3,
     *         row_list:[               //对应表名T_5中的多行
     *              {
     *                  id: 1,          //对应表名T_5.id
     *                  parent_id:1,    //对应表名T_3.id=1
     *                  ref_t_id: 3,    //对应其它关联表 id =3
     *                  F13_XH: "533",  //对应表中字段T_5.F13_XH
     *                  F14_SL: ""
     *                  F15_TJ: ""
     *                  F16_ZL: ""
     *                  F17_DZ: ""
     *                  table_list:[           //类型为“单品列表”的数据，相当于从表的从表
     *                      {
     *                          structure_id: 6,         //对应表名T_6
     *                          structure_parent_id: 5,  //此从表对应主表为structure_id:5,
     *                          row_list:[
     *                              {
     *                                  id: 1,          //对应表名T_6.id
     *                                  parent_id:1,    //对应表名T_5.id=1
     *                                  ref_t_id: 0,    //无对应其它关联表
     *                                  F18_XLH: "A33", //对应表中字段T_6.F18_XLH
     *                                  F19_BZ: ""      //对应表中字段T_6.F18_BZ
     *                              }
     *                          ]
     *                      }
     *                  ]
     *              }
     *         ] 
     *      },{}
     *    ],  
     * }
     */
    public static Record getOrderDto(String jsonStr){
        Record orderRec = new Record();
        Gson gson = new Gson();  
        Map<String, ?> dto= gson.fromJson(jsonStr, HashMap.class);
        String order_id = dto.get("id").toString();
        String module_id = dto.get("MODULE_ID").toString();
        
        orderRec.set("id", order_id);
        orderRec.set("module_id", module_id);
        
        List fieldsList = new ArrayList();
        List tableList  = new ArrayList();
        orderRec.set("fields_list", fieldsList);
        orderRec.set("table_list", tableList);
        
        List<Record> strctureList = Db.find("select * from eeda_structure where module_id=?", module_id);
        Record rootStructure = null;
        for (Record structure : strctureList) {
            if("字段".equals(structure.get("STRUCTURE_TYPE"))){
                Record fieldRec = buildFieldRec(order_id, structure);
                fieldsList.add(fieldRec);
                rootStructure = structure;
            }
        }
        
        Record rootRec = new Record();
        long structureId = rootStructure.get("ID");
        rootRec.set("ID", structureId);
        rootRec.set("PARENT_ID", 0l);
        buildTableDto(order_id, tableList, rootRec);
        logger.debug(orderRec.toJson());
        return orderRec;
    }

    /*
     * 递归构造table数据
     */
    @SuppressWarnings({ "unused", "rawtypes", "unchecked" })
    private static void buildTableDto(String parent_id,
            List parentTableList, Record structureRec) {
        
        long structureId = structureRec.getLong("ID");
        long parentStructureId = structureRec.getLong("PARENT_ID");
        
        //查找下级从表
        List<Record> childStructureList = Db.find("select * from eeda_structure where parent_id="+ structureId);
        
        for (Record childStructure : childStructureList) {
            Record tableRec = new Record();
            tableRec.set("structure_id", childStructure.getLong("ID"));
            tableRec.set("structure_parent_id", childStructure.getLong("PARENT_ID"));
            
            String originStructureId = childStructure.get("id").toString();
            String tableName = "t_" + originStructureId;
            String refCon = "";
            String subCol = "";
            //获取field定义, 判断是否需要针对特殊列表转换ID -> 名字
            subCol = getSubCol(originStructureId);
            
            if("弹出列表, 从其它数据表选取".equals(childStructure.get("ADD_BTN_TYPE"))){
                String settingJson = childStructure.get("ADD_BTN_SETTING").toString();
                Gson gson = new Gson();  
                Map<String, ?> settingDto= gson.fromJson(settingJson, HashMap.class);
                String targetStructureId = settingDto.get("structure_id").toString();
                tableName += ", t_"+targetStructureId;
                refCon = " and t_"+originStructureId+".ref_t_id = t_"+targetStructureId+".id";
                subCol += getSubCol(targetStructureId);
            }
            List<Record> rowList = Db.find("select *, t_"+originStructureId+".id "//这里多写一个ID，因为DB中取最后一个列的ID
                    +subCol+" from "+tableName+" where t_"+originStructureId+".parent_id="+parent_id+refCon);
            
            //构造下级从表的结构
            if(rowList.size()>0){
                tableRec.set("row_list", rowList);
                for (Record record : rowList) {
                    List childTableList = new ArrayList();
                    record.set("table_list", childTableList);
                    buildTableDto(record.get("id").toString(), childTableList, childStructure);
                }
            }
            
            parentTableList.add(tableRec);
        }
    }

    @SuppressWarnings("unchecked")
    private static String getSubCol(String structureId) {
        String subCol = "";
        String fieldSql = "select * from eeda_field where structure_id = ?";
        List<Record> fieldDefineList = Db.find(fieldSql, structureId);
        for (Record fieldDefine : fieldDefineList) {
            if("下拉列表".equals(fieldDefine.get("field_type"))) {
                String key = "F"+fieldDefine.getLong("id")+"_"+fieldDefine.getStr("field_name");
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
                    
                }else if("城市列表".equals(ext_type_dto.get("name").toString())){
                       subCol += ", (get_loc_full_name("+key+")) "+ key +"_INPUT";
                }else{
                }
                
            }
        }
        return subCol;
    }
    
    private static Record buildFieldRec(String order_id, Record structure) {
        long structureId = structure.get("ID");
        Record orderRec;
        String subCol = getSubCol(String.valueOf(structureId));
        if(structure.get("PARENT_ID") == null){
            String tableName = "t_" + structureId;
            List<Map> fieldList = (ArrayList<Map>)structure.get("FIELDS_LIST");
            orderRec = Db.findFirst("select t.* "+subCol+" from "+tableName+ " t where id=?", order_id);
            
            orderRec.set("structure_id", structureId);
            logger.debug(orderRec.toJson());
            
        }else{
            int parentId = ((Double)structure.get("PARENT_ID")).intValue();
            String tableName = "t_" + structureId;
            orderRec = Db.findFirst("select * "+subCol+" from "+tableName+ " where parent_id=?", order_id);
            if(orderRec != null)
                orderRec.set("structure_id", structureId);
            logger.debug(orderRec.toJson());
        }
        return orderRec;
    }
    
    @SuppressWarnings("unchecked")
    public static String commonUpdate(Map<String, ?> dto) {
        String returnStr = "";
        String orderId = dto.get("id").toString();
        String actionName = dto.get("action").toString();
        if("保存".equals(actionName)){
            List<Map<String, String>> fields_list = (ArrayList<Map<String, String>>)dto.get("fields_list");
            for (Map<String, String> tableMap : fields_list) {//获取每一个主表+主表从属表
                String structure_id = tableMap.get("structure_id");
                String colSet = "";
                for (Entry<String, String> entry: tableMap.entrySet()) {
                    String key = entry.getKey();
                    String value = entry.getValue();
                    if("id".equals(key) || "structure_id".equals(key) || key.endsWith("_INPUT")){
                        continue;
                    }
                    colSet += ","+key + "='"+value+"'";
                }
                
                String sql = "update t_"+structure_id+" set " + colSet.substring(1) + " where id=" + orderId;
                logger.debug(sql);
                Db.update(sql);
            }
            
            List<Map<String, ?>> table_list = (ArrayList<Map<String, ?>>)dto.get("table_list");
            tablesUpdate(orderId, table_list);
        }else{
            //action 审核，撤销 等按钮动作
            returnStr = EedaBtnActionHandler.handleBtnAction(dto.get("module_id").toString(), 
                    dto.get("action").toString(), orderId);
        }
        return returnStr;
    }

    private static void tablesUpdate(String parentId,
            List<Map<String, ?>> table_list) {
        for (Map<String, ?> tableMap : table_list) {//获取每一个从表
            String structure_id = tableMap.get("structure_id").toString();
            
            List<Map> rowFieldsList = (ArrayList<Map>)tableMap.get("row_list");
            
            //先处理删除
            tableRowDelete(parentId, structure_id, rowFieldsList);
            
            for (Map<String, ?> rowMap : rowFieldsList) {//表中每一行, update or insert
                String rowId = rowMap.get("id").toString();
                if(StringUtils.isEmpty(rowId)){
                    rowId = tableRowInsert(parentId, structure_id, rowMap).toString();
                }else{
                    tableRowUpdate(structure_id, rowMap, rowId);
                }
                //从表的行中是否还有从表
                if(rowMap.get("table_list") != null){
                    List<Map<String, ?>> tableList = (ArrayList<Map<String, ?>>)rowMap.get("table_list");
                    tablesUpdate(rowId, tableList);
                }
            }
        }
    }

    private static void tableRowDelete(String orderId, String structure_id,
            List<Map> rowFieldsList) {
        List<String> idList = new ArrayList<String>();
        for (Map<String, String> rowMap : rowFieldsList) {
            String rowId = rowMap.get("id").toString();
            if(StringUtils.isNotEmpty(rowId)){
                idList.add(rowId);
            }
        }
        
        if(idList.size()>0){
            String deleteSql = "delete from t_" + structure_id + " where parent_id=" + orderId + " and id not in (" + StringUtils.join(idList, ", ") + ")";
            logger.debug(deleteSql);
            Db.update(deleteSql);
        }else{
            String deleteSql = "delete from t_" + structure_id + " where parent_id=" + orderId;
            logger.debug(deleteSql);
            Db.update(deleteSql);
        }
    }

    private static void tableRowUpdate(String structure_id,
            Map<String, ?> rowMap, String rowId) {
        String colSet = "";
        for (Entry<String, ?> entry: rowMap.entrySet()) {//行的每个字段
            String key = entry.getKey();
            String value = entry.getValue().toString();
            if("id".equals(key) || key.endsWith("_INPUT") || "table_list".equals(key)){
                continue;
            }
            colSet += ","+key + "='"+value+"'";
        }
        String sql = "update t_" + structure_id + " set " + colSet.substring(1) + " where id=" +rowId;
        logger.debug(sql);
        Db.update(sql);
    }

    private static String tableRowInsert(String parentId, String structure_id,
            Map<String, ?> rowMap) {
        String rowId = "";
        String colName = "";
        String colValue = "";
        
        for (Entry<String, ?> entry: rowMap.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue().toString();
            if("id".equals(key) || key.endsWith("_INPUT") || "table_list".equals(key)){
                continue;
            }
            //嵌套的从表有可能上级ID是新增的，所以此时row本身parent_id 为空
            if("parent_id".equals(key) && StringUtils.isEmpty(value)){
                value = parentId;
            }
            colName += ","+key;
            colValue+= ",'"+value+"'";
        }
        
        String sql = "insert into t_"+structure_id+"("+colName.substring(1)+") values("+colValue.substring(1)+")";
        logger.debug(sql);
        Db.update(sql);
        rowId = getLastInsertID("t_"+structure_id).toString();
        return rowId;
    }
    
    public static String commonInsert(Map<String, ?> dto) {
        Long order_id = new Long("0");
        List<Map<String, String>> fields_list = (ArrayList<Map<String, String>>)dto.get("fields_list");
        for (Map<String, String> tableMap : fields_list) {//获取每一行
            String tableName = tableMap.get("structure_id");
            
            TableObject tObj = new TableObject();
//            String colName = "parent_id";
//            String colValue = "null";
            for (Entry<String, String> entry: tableMap.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                logger.debug(key+":"+value);
                if("id".equals(key) || key.endsWith("_INPUT") || "structure_id".equals(key)){
                    continue;
                }
                tObj.colName += ","+key;
                tObj.colValue+= ",'"+value+"'";
            }
            
            //处理新增前设置的默认值
            setDefaultBeforeInsert(tableName, tObj);
            
            String sql = "insert into t_"+tableName+"("+tObj.colName+") values("+tObj.colValue+")";
            logger.debug(sql);
            Db.update(sql);
            order_id = getLastInsertID(tableName);
        }
        List<Map<String, ?>> table_list = (ArrayList<Map<String, ?>>)dto.get("table_list");
        tablesInsert(order_id, table_list);
        
        //action 保存，审核，撤销 等按钮动作
        EedaBtnActionHandler.handleBtnAction(dto.get("module_id").toString(), 
                dto.get("action").toString(), order_id.toString());
        return order_id.toString();
    }

    private static void setDefaultBeforeInsert(String tableName,
            TableObject tObj) {
        List<Record> fieldDefineList = Db.find("select * from eeda_field where structure_id=?", tableName);
        for (Record fieldDefine: fieldDefineList) {
            String field_ext_type = fieldDefine.getStr("FIELD_TYPE_EXT_TYPE");
            if(StringUtils.isNotEmpty(field_ext_type) && !"undefined".equals(field_ext_type)){
                Gson gson = new Gson();  
                Map<String, ?> ext_type_dto= gson.fromJson(field_ext_type, HashMap.class);
                if(ext_type_dto==null || ext_type_dto.get("modal_field_default_value_type") ==null 
                        || StringUtils.isEmpty(ext_type_dto.get("modal_field_default_value_type").toString()))
                    continue;
                String modal_field_default_value_type = ext_type_dto.get("modal_field_default_value_type").toString();
                String modal_field_default_value = ext_type_dto.get("modal_field_default_value").toString();
                if(StringUtils.isNotEmpty(modal_field_default_value_type)){
                    if("自动编号".equals(modal_field_default_value_type)){
                        proccessAutoNum(tObj, fieldDefine,
                                modal_field_default_value);
                    }else if("自定义".equals(modal_field_default_value_type)){
                        String fieldKey = "F"+fieldDefine.get("id")+"_"+fieldDefine.get("field_name").toString();
                        tObj.colName += ","+fieldKey;
                        tObj.colValue+= ",'"+ext_type_dto.get("modal_field_default_value_text")+"'";
                    }else if("系统内置".equals(modal_field_default_value_type)){
                        Record settingRec = Db.findFirst("select * from eeda_setting where id=?", modal_field_default_value);
                        String settingName = settingRec.getStr("name");
                        String colValue = "";
                        if("当前用户姓名".equals(settingName)){
                            colValue = "'"+UserLogin.getCurrentUser().getStr("c_name")+"'";
                        }else if("当前日期时间".equals(settingName)){
                            colValue = " now() ";
                        }else if("当前日期".equals(settingName)){
                            colValue = " DATE_FORMAT(NOW(),'%Y-%m-%d')";
                        }else if("当前用户登录账号".equals(settingName)){
                            colValue = "'"+UserLogin.getCurrentUser().getStr("user_name")+"'";
                        }
                        
                        
                        String fieldKey = "F"+fieldDefine.get("id")+"_"+fieldDefine.get("field_name").toString();
                        tObj.colName += ","+fieldKey;
                        tObj.colValue+= ","+colValue;
                    }
                }
            }
        }
    }

    private static void proccessAutoNum(TableObject tObj, Record fieldDefine,
            String modal_field_default_value) {
        Record bh_s = ModuleController.getStructureByName("自动编号");
        Record orderDto = EedaCommonHandler.getOrderDto("{id:"+modal_field_default_value+", MODULE_ID:"+bh_s.get("module_id")+"}");
        List<Record> list = orderDto.get("table_list");
        String lb_field = "规则.类别";
        Record lb_rec = ModuleController.getFieldByName(lb_field);
        String cs_field = "规则.参数";
        Record cs_rec = ModuleController.getFieldByName(cs_field);
        
        List<String> regList = new ArrayList<String>();
        List<Record> rowList = list.get(0).get("ROW_LIST");//只会有一个从表,所以这里直接取
        for (Record record : rowList) {
            String lb = record.get("F"+lb_rec.get("id")+"_"+lb_rec.get("field_name").toString());
            String cs = record.get("F"+cs_rec.get("id")+"_"+cs_rec.get("field_name").toString());
            if("固定文字".equals(lb)){
                regList.add(cs);
            }
            if("日期变量".equals(lb)){
                SimpleDateFormat sdf = new SimpleDateFormat(cs);
                String nowdate = sdf.format(new Date());
                regList.add(nowdate);
            }
            if("顺序号位数".equals(lb)){
                int length = Integer.parseInt(cs);
                String regCs = "(.+)";
                regList.add(regCs);
            }
        }
        //这里先判断单号已经存在,如存在就 获取序号并 +1
        boolean isNoExist = false;
        int currentSeq=0;
        String latestNo = getLatestValueFromField(fieldDefine);
        String regStr = StringUtils.join(regList, "");
        Scanner scanner = new Scanner(latestNo);
        String matchStr = scanner.findInLine (regStr);
        if(matchStr !=null){
            MatchResult result = scanner.match();
            if(result != null){//已存在
                isNoExist = true;
                logger.debug("seq:"+result.group(1));
                currentSeq = Integer.valueOf(result.group(1));
            } 
        }
        
        List<String> noList = new ArrayList<String>();
        for (Record record : rowList) {
            String lb = record.get("F"+lb_rec.get("id")+"_"+lb_rec.get("field_name").toString());
            String cs = record.get("F"+cs_rec.get("id")+"_"+cs_rec.get("field_name").toString());
            if("固定文字".equals(lb)){
                noList.add(cs);
            }
            if("日期变量".equals(lb)){
                SimpleDateFormat sdf = new SimpleDateFormat(cs);
                String nowdate = sdf.format(new Date());
                noList.add(nowdate);
            }
            if("顺序号位数".equals(lb)){
                int length = Integer.parseInt(cs);
                String regCs = "(.+)";
                String nextSeq=String.valueOf(currentSeq+1);
                int seqLength = length;//序列号长度00001
                for (int j = nextSeq.length(); j < seqLength; j++) {
                    nextSeq = "0" + nextSeq;
                }
                noList.add(nextSeq);
            }
        }
        String nextNo = StringUtils.join(noList, "");
        String fieldKey = "F"+fieldDefine.get("id")+"_"+fieldDefine.get("field_name").toString();
        tObj.colName += ","+fieldKey;
        tObj.colValue+= ",'"+nextNo+"'";
    }
    
    private static String getLatestValueFromField(Record field){
        String struture_id = field.get("STRUCTURE_ID").toString();
        Record rec = Db.findFirst("select * from t_"+struture_id+" order by id desc");
        if(rec == null)
            return "";
        String value = rec.get("F"+field.get("id")+"_"+field.get("FIELD_NAME"));
        return value==null?"":value;
    }
    /*
     * 递归对从表进行新增插入
     */
    private static void tablesInsert(Long parent_id,
            List<Map<String, ?>> table_list) {
        for (Map<String, ?> tableMap : table_list) {//获取每一行
            String tableName = tableMap.get("structure_id").toString();
            
            List<Map> rowFieldsList = (ArrayList<Map>)tableMap.get("row_list");
            for (Map<String, ?> rowMap : rowFieldsList) {
                String colName = "";
                String colValue = "";
                for (Entry<String, ?> entry: rowMap.entrySet()) {
                    String key = entry.getKey();
                    if("id".equals(key) || key.endsWith("_INPUT") || "structure_id".equals(key) || "table_list".equals(key)){
                        continue;
                    }
                    
                    String value = entry.getValue().toString();
                    if("parent_id".equals(key) && StringUtils.isEmpty(value)){
                        value = parent_id.toString();
                    }
                    colName += ","+key;
                    colValue+= ",'"+value+"'";
                }
                String sql = "insert into t_"+tableName+"("+colName.substring(1)+") values("+colValue.substring(1)+")";
                logger.debug(sql);
                Db.update(sql);
                List next_table_list = (List) rowMap.get("table_list");
                if(next_table_list!=null){
                    parent_id = getLastInsertID("t_"+tableName);
                    tablesInsert(parent_id, next_table_list);
                }
            }
        }
    }

    private static Long getLastInsertID(String tableName) {
        Long order_id = null;
        Record idRec = Db.findFirst("select LAST_INSERT_ID() id");
        Long big = new Long(idRec.get("id").toString());
        order_id = big;
        logger.debug(tableName+" last insert order_id = "+order_id);
        return order_id;
    }
    
     
}

class TableObject {
    String colName = "parent_id";
    String colValue = "null";
}