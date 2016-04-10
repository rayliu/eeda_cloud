package controllers.eeda.order;

import java.util.ArrayList;
import java.util.List;

public class SearchDto {
    String module_id = "";
    String structur_id = "";
    String structure_name = "";
    String draw = "";
    String start = "0";
    String length = "50";
    boolean isSysModule=false;
    
    public List<String> fieldIdList = new ArrayList<String>();
    public List<String> fieldNameList = new ArrayList<String>();
}
