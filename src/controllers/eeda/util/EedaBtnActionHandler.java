package controllers.eeda.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;
import com.google.gson.reflect.TypeToken;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

import controllers.eeda.report.Printer;

/**
 * //action处理：针对 保存，审核，撤销 等按钮动作做相应的打印 或 赋值
 * 
 * 类型有：
 * 1. 固定值 赋值; 打印
 * 2. 单据号码 自动生成
 * 3. ？撤销时，判断是否有下级单据
 * 
 * @author Ray Liu
 *
 */
public class EedaBtnActionHandler {
    private static Logger logger = Logger.getLogger(EedaBtnActionHandler.class);
    
    public static String handleBtnAction(String moduleId, String btnAction, String orderId){
        String returnStr ="";//打印时需要返回文件名给前台去下载
        
        Record actionRec = Db.findFirst("select * from eeda_structure_action where module_id=? and action_name=?"
                , moduleId, btnAction);
        if(actionRec == null)
            return "";
        
        String actionScript = actionRec.getStr("action_script");
        Gson gson = new Gson();  
        List<LinkedTreeMap> list = gson.fromJson(actionScript, new TypeToken<List<LinkedTreeMap>>(){}.getType()); 
        for (Map commandMap: list) {
            String commandStr = commandMap.get("command").toString();
            Map<String, ?> commandDto = gson.fromJson(commandStr, HashMap.class);
            
            String commandName = commandDto.get("command_name").toString();
            String condition = commandDto.get("condition").toString();
            String targetObj = commandDto.get("target_obj").toString();
            String action = commandDto.get("action").toString();
            List setValueList = (List)commandDto.get("setValueList");
            
            if("打印".equals(action)){
                String templateName = commandDto.get("print_template").toString();
                Record printTemplateRec = Db.findFirst("select * from eeda_print_template where name=?", templateName);
                if(printTemplateRec !=null){
                    String filePath = printTemplateRec.getStr("file_path");
                    HashMap<String, Object> params = new HashMap<String, Object>();
                    params.put("orderId", new Integer(orderId));
                    String outputFileName = Printer.getInstance().print(filePath, templateName, params);
                    returnStr = outputFileName;
                }
            }else{
                
            }
            
            //processCondition(orderId, commandDto, condition, moduleId);
        }
        return returnStr;
    }

    private static void processCondition(String orderId,
            Map<String, ?> commandDto, String condition, String moduleId) {
        if(StringUtils.isEmpty(condition)){//condition为空,即任意情况下都执行
            List<Map<String, String>> fieldList = (List)commandDto.get("setValueList");
            for (Map<String, String> fieldMap: fieldList) {
                for (Entry<String, String> entry: fieldMap.entrySet()) {
                    String key = entry.getKey();
                    String value = entry.getValue();
                    logger.debug(key+":"+value);
                    String[] keys= key.split(",");
                    String structureId = keys[0].split(":")[1];
                    String fieldName = keys[1].split(":")[1];
                    
                    Db.update("update t_"+structureId+" set "+fieldName+"='" + value + "' where id="+orderId);
                    
                }
            }
        }else if("ID为空".equals(condition) || "ID不为空".equals(condition)){
            List<Map<String, String>> fieldList = (List)commandDto.get("setValueList");
            for (Map<String, String> fieldMap: fieldList) {
                for (Entry<String, String> entry: fieldMap.entrySet()) {
                    String key = entry.getKey();
                    String value = entry.getValue();
                    logger.debug(key+":"+value);
                    String[] keys= key.split(",");
                    String structureId = keys[0].split(":")[1];
                    String fieldName = keys[1].split(":")[1];
                    if(("自动生成单号").equals(value)){
                        //判断单号是否已经生成
                        Record rec = Db.findFirst("select " + fieldName + " from t_" + structureId + " where id="+orderId);
                        if(rec != null && rec.getStr(fieldName) == null){
                            Db.update("update t_" + structureId + " set " + fieldName + " = " + 
                                    OrderNoGenerator.getNextOrderNo("") + " where id=" + orderId);
                        }
                    }else{
                        Db.update("update t_"+structureId+" set "+fieldName+"='" + value + "' where id="+orderId);
                    }
                }
            }
        }
    }
    
}
