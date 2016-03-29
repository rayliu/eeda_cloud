package controllers.eeda.util;

import java.util.ArrayList;
import java.util.List;

public class SearchDto {
    String structur_id = "";
    String structure_name = "";
    String draw = "";
    String start = "0";
    String length = "50";
    
    List<String> fieldIdList = new ArrayList<String>();
    List<String> fieldNameList = new ArrayList<String>();
}
