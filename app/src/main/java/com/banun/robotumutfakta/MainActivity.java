package com.banun.robotumutfakta;
import android.Manifest;
import android.annotation.SuppressLint;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.*;
import android.provider.Settings;
import android.net.Uri;
import android.webkit.*;
import android.widget.*;

public class MainActivity extends Activity {
 private WebView w;
 private ValueCallback<Uri[]> fileCallback;
 private static final int PICK_JSON=654;
 @SuppressLint("SetJavaScriptEnabled")
 @Override public void onCreate(Bundle b){super.onCreate(b);
   getWindow().setStatusBarColor(Color.rgb(255,248,237));getWindow().setNavigationBarColor(Color.rgb(255,248,237));
   if(Build.VERSION.SDK_INT>=23)getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
   w=new WebView(this);w.setBackgroundColor(Color.rgb(255,248,237));setContentView(w);
   WebSettings s=w.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(true);s.setAllowContentAccess(false);s.setJavaScriptCanOpenWindowsAutomatically(false);s.setSupportMultipleWindows(false);
   w.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return !request.getUrl().toString().startsWith("file:///android_asset/");}});
   w.setWebChromeClient(new WebChromeClient(){
     @Override public boolean onShowFileChooser(WebView web, ValueCallback<Uri[]> callback, FileChooserParams params){
       if(fileCallback!=null)fileCallback.onReceiveValue(null);
       fileCallback=callback;
       try{Intent i=new Intent(Intent.ACTION_GET_CONTENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("application/json");startActivityForResult(Intent.createChooser(i,"Yedek dosyasını seç"),PICK_JSON);return true;}
       catch(Exception ex){fileCallback=null;return false;}
     }
   });
   w.addJavascriptInterface(new Bridge(),"BanuAndroid");w.loadUrl("file:///android_asset/index.html");
   ReminderReceiver.channel(this);ReminderReceiver.schedule(this);
   if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},20);
 }
 @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){
   super.onActivityResult(requestCode,resultCode,data);
   if(requestCode==PICK_JSON&&fileCallback!=null){Uri[] result=null;
     if(resultCode==RESULT_OK&&data!=null&&data.getData()!=null)result=new Uri[]{data.getData()};
     fileCallback.onReceiveValue(result);fileCallback=null;
   }
 }
 @Override protected void onResume(){super.onResume();ReminderReceiver.schedule(this);}
 @Override public void onBackPressed(){if(w!=null&&w.canGoBack())w.goBack();else super.onBackPressed();}
 class Bridge {
   @JavascriptInterface public void share(String s){runOnUiThread(()->{Intent i=new Intent(Intent.ACTION_SEND);i.setType("text/plain");i.putExtra(Intent.EXTRA_TEXT,s);startActivity(Intent.createChooser(i,"Banu'nun listesini paylaş"));});}
   @JavascriptInterface public void enableNotifications(){runOnUiThread(()->{
      if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},21);}
      if(Build.VERSION.SDK_INT>=31){AlarmManager alarm=(AlarmManager)getSystemService(ALARM_SERVICE);if(!alarm.canScheduleExactAlarms()){
       try{Intent i=new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);i.setData(android.net.Uri.parse("package:"+getPackageName()));startActivity(i);}catch(Exception e){Toast.makeText(MainActivity.this,"Alarm ayarlarından izin verin",Toast.LENGTH_LONG).show();}
      }}ReminderReceiver.schedule(MainActivity.this);
   });}
 }
}
