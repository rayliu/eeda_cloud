package controllers.eeda.sms;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.util.EntityUtils;

import com.google.gson.Gson;

public class SendCloudSmsApi {

    public static void main(String[] args) {
        sendMsg("smsUser", "smsKey", "1", "18578200347");
        
    }

    public static String sendMsg(String smsUser, String smsKey, String smsId, String phoneNo) {
        String url = "http://sendcloud.sohu.com/smsapi/send";
        String returnStr = "smsOK";

        // 填充参数
        Map<String, String> params = new HashMap<String, String>();
        params.put("smsUser", smsUser);
        params.put("templateId", smsId);
        params.put("msgType", "0");
        params.put("phone", "13412345678");
        params.put("vars", "{\"code\":\"123455\"}");

        // 对参数进行排序
        Map<String, String> sortedMap = new TreeMap<String, String>(new Comparator<String>() {
            @Override
            public int compare(String arg0, String arg1) {
                // 忽略大小写
                return arg0.compareToIgnoreCase(arg1); 
            }
        });
        sortedMap.putAll(params);

        // 计算签名
        StringBuilder sb = new StringBuilder();
        sb.append(smsKey).append("&");
        for (String s : sortedMap.keySet()) {
            sb.append(String.format("%s=%s&", s, sortedMap.get(s)));
        }
        sb.append(smsKey);
        String sig = DigestUtils.md5Hex(sb.toString());

        // 将所有参数和签名添加到post请求参数数组里
        List<NameValuePair> postparams = new ArrayList<NameValuePair>();
        for (String s : sortedMap.keySet()) {
            postparams.add(new BasicNameValuePair(s, sortedMap.get(s)));
        }
        postparams.add(new BasicNameValuePair("signature", sig));

        HttpPost httpPost = new HttpPost(url);
        try {
            httpPost.setEntity(new UrlEncodedFormEntity(postparams, "utf8"));
            DefaultHttpClient httpclient = new DefaultHttpClient();
            httpclient.getParams().setIntParameter(CoreConnectionPNames.CONNECTION_TIMEOUT, 3000);
            httpclient.getParams().setIntParameter(CoreConnectionPNames.SO_TIMEOUT, 100000);
            HttpResponse response = httpclient.execute(httpPost);

            HttpEntity entity = response.getEntity();
            EntityUtils.consume(entity);
            
            returnStr = EntityUtils.toString(response.getEntity());
            Map<String, ?> smsReturnDto = new Gson().fromJson(returnStr, HashMap.class);
            if(!(Boolean)smsReturnDto.get("result")){
                returnStr="smsFailed";
            }
            System.out.println(returnStr);
        } catch (Exception e) {
            System.out.println(e.toString());
        } finally {
            httpPost.releaseConnection();
        }
        return returnStr;
    }

}
