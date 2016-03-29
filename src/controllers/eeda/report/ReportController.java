package controllers.eeda.report;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

import org.apache.log4j.Logger;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;

import com.jfinal.core.Controller;

public class ReportController extends Controller {

	private Logger logger = Logger.getLogger(ReportController.class);
	private static String contextPath = null;
			
	public void index() {

	}

	private String getContextPath() {
		if(contextPath == null){
			contextPath = getRequest( ).getSession().getServletContext().getRealPath("/");
		}
		return contextPath;
	}

	
	
	public void printManualOrder() {
		String order_no = getPara("order_no").trim();
		String fileName = "report/arap_manual.jasper";
		String outFileName = "download/手工收入单";
		HashMap<String, Object> hm = new HashMap<String, Object>();
		hm.put("order_no", order_no);
        fileName = getContextPath() + fileName;
        outFileName = getContextPath() + outFileName + order_no;
		String file = Printer.getInstance().print(fileName, outFileName,
				hm);
		renderText(file.substring(file.indexOf("download")-1));
	}
	public void printdamageCutomer() {
		String order_no = getPara("order_no").trim();
		String damageType = getPara("damageType").trim();
		String unit = getPara("unit").trim();
		String fileName = "report/damage_customer.jasper";
		String outFileName = "download/货损记录单"+damageType;
		HashMap<String, Object> hm = new HashMap<String, Object>();
		hm.put("order_no", order_no);
		hm.put("damageType", damageType);
		hm.put("unit", unit);
        fileName = getContextPath() + fileName;
        outFileName = getContextPath() + outFileName + order_no;
		String file = Printer.getInstance().print(fileName, outFileName,
				hm);
		renderText(file.substring(file.indexOf("download")-1));
	}
	public void printArapMiscCost() {
		String order_no = getPara("order_no").trim();
		String fileName = "report/arap_misc_cost.jasper";
		String outFileName = "download/手工成本单";
		HashMap<String, Object> hm = new HashMap<String, Object>();
		hm.put("order_no", order_no);
        fileName = getContextPath() + fileName;
        outFileName = getContextPath() + outFileName + order_no;
		String file = Printer.getInstance().print(fileName, outFileName,
				hm);
		renderText(file.substring(file.indexOf("download")-1));
	}
	public void printCustomerOrder() {
		String order_no = getPara("order_no").trim();
		String fileName = "report/customer_checkOrder.jasper";
		String outFileName = "download/客户对账单";
		HashMap<String, Object> hm = new HashMap<String, Object>();
		hm.put("order_no", order_no);
        fileName = getContextPath() + fileName;
		outFileName = getContextPath() + outFileName + order_no;
		String file = Printer.getInstance().print(fileName, outFileName,
				hm);
		renderText(file.substring(file.indexOf("download")-1));
	}
	
	public String pritCheckOrderByPay(String order_no,long application_id) {
		String fileName = "report/checkOrder.jasper";
		String outFileName = "download/供应商对账单";
		HashMap<String, Object> hm = new HashMap<String, Object>();
		hm.put("order_no", order_no);
		hm.put("application_id", application_id);
        fileName = getContextPath() + fileName;
        outFileName = getContextPath() + outFileName + order_no;
		String file = Printer.getInstance().print(fileName,
				outFileName, hm);
		return file;
	}
	
	public void printReimburse() {
		String order_no = getPara("order_no");
		String fileName = "report/reimburse.jasper";
		String outFileName = "download/报销单";
		HashMap<String, Object> hm = new HashMap<String, Object>();
		hm.put("order_no", order_no);
        fileName = getContextPath() + fileName;
        outFileName = getContextPath() + outFileName + order_no;
		String file = Printer.getInstance().print(fileName,
				outFileName, hm);
		renderText(file.substring(file.indexOf("download")-1));
	}
	
	

	
	public void printSignCargo() {
		String type = getPara("sign");
		String order_no = getPara("order_no");
		String muban = type + ".jasper";

		String fileName = "report/" + muban;
		String outFileName = "download/普通签收单";
		HashMap<String, Object> hm = new HashMap<String, Object>();
		hm.put("order_no", order_no);
		
		fileName = getContextPath() + fileName;
		outFileName = getContextPath() + outFileName + order_no;
		
		StringBuffer buffer = new StringBuffer();
		String file = Printer.getInstance().print(fileName, outFileName,
				hm);
		buffer.append(file.substring(file.indexOf("download")-1));
		buffer.append(",");
		renderText(buffer.toString());
	}
	public void ZipOutput() throws IOException {
		String path=getContextPath()+"download/";;
		String order_no=getPara("order_no");
		 // 要被压缩的文件夹  
        File file = new File(path+order_no);  
        File zipFile = new File(path+order_no + ".zip");   
        ZipOutputStream zipOut = new ZipOutputStream(new FileOutputStream(  
        		zipFile));  
        zipOut.setEncoding("GBK"); 
        if(file.isDirectory()){  
           InputStream input = null; 
           File[] files = file.listFiles();  
            for(int i = 0; i < files.length; ++i){  
                input = new FileInputStream(files[i]);  
                zipOut.putNextEntry(new ZipEntry(file.getName()  
                        + File.separator + files[i].getName()));  
                int temp = 0;  
                while((temp = input.read()) != -1){  
                    zipOut.write(temp);  
                }  
                input.close();  
            }  
        	System.out.println("file");
        }  
        StringBuffer buffer = new StringBuffer();
        String strFile=zipFile.getPath();
        buffer.append(strFile.substring(strFile.indexOf("download")-1));
		buffer.append(",");
        zipOut.close(); 
        renderText(buffer.toString());
	    }
		
}
