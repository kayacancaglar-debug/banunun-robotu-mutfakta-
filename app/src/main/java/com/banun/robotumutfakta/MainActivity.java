package com.banun.robotumutfakta;
import android.Manifest;
import android.annotation.SuppressLint;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.*;
import android.provider.Settings;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.speech.tts.UtteranceProgressListener;
import android.content.ClipData;
import android.content.ClipboardManager;
import org.json.JSONArray;
import java.util.List;
import java.util.Collections;
import java.util.Comparator;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Locale;
import android.net.Uri;
import android.webkit.*;
import android.widget.*;

public class MainActivity extends Activity {
 private WebView w;
 private ValueCallback<Uri[]> fileCallback;
 private static final int PICK_JSON=654;
 private static final int VOICE_REQUEST=655;
 private TextToSpeech speechEngine;
 private volatile boolean speechReady=false;
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
   speechEngine = new TextToSpeech(this, status -> {
     if(status == TextToSpeech.SUCCESS){
       int result=speechEngine.setLanguage(new Locale("tr","TR"));
       speechReady=result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED;
       if (speechReady) {
         speechEngine.setSpeechRate(0.98f);
         speechEngine.setPitch(1.0f);
         speechEngine.setOnUtteranceProgressListener(new UtteranceProgressListener() {
           @Override public void onStart(String id){notifyWeb("window.robotVoiceEvent&&window.robotVoiceEvent('start')");}
           @Override public void onDone(String id){notifyWeb("window.robotVoiceEvent&&window.robotVoiceEvent('done')");}
           @Override public void onError(String id){notifyWeb("window.robotVoiceEvent&&window.robotVoiceEvent('error')");}
         });
       }
       notifyWeb("window.banuNativeReady&&window.banuNativeReady()");
     }
   });
   w.addJavascriptInterface(new Bridge(),"BanuAndroid");w.loadUrl("file:///android_asset/index.html");
   ReminderReceiver.channel(this);ReminderReceiver.schedule(this);
   if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},20);
 }
 @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){
   super.onActivityResult(requestCode,resultCode,data);
   if(requestCode==VOICE_REQUEST){
     if(resultCode==RESULT_OK && data!=null){
       ArrayList<String> results=data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
       if(results!=null && !results.isEmpty() && w!=null){
          w.evaluateJavascript("window.robotReceiveVoice&&window.robotReceiveVoice("+JSONObject.quote(results.get(0))+ ");",null);
       }
     } else notifyWeb("window.robotVoiceEvent&&window.robotVoiceEvent('cancel')");
     return;
   }
   if(requestCode==PICK_JSON&&fileCallback!=null){Uri[] result=null;
     if(resultCode==RESULT_OK&&data!=null&&data.getData()!=null)result=new Uri[]{data.getData()};
     fileCallback.onReceiveValue(result);fileCallback=null;
   }
 }
 @Override protected void onDestroy(){
   if(speechEngine!=null){speechEngine.stop();speechEngine.shutdown();}
   if(w!=null){w.destroy();w=null;}
   super.onDestroy();
 }
 @Override protected void onResume(){super.onResume();ReminderReceiver.schedule(this);}
 @Override public void onBackPressed(){if(w!=null&&w.canGoBack())w.goBack();else super.onBackPressed();}
 private void notifyWeb(String javascript) {
   runOnUiThread(() -> { if (w != null) w.evaluateJavascript(javascript, null); });
 }
 private List<Voice> turkishVoices() {
   List<Voice> candidates = new ArrayList<>();
   if (speechEngine == null || !speechReady || speechEngine.getVoices() == null) return candidates;
   for (Voice v : speechEngine.getVoices()) {
     if (v != null && v.getLocale() != null && "tr".equals(v.getLocale().getLanguage())) candidates.add(v);
   }
   Collections.sort(candidates, (a,b) -> {
     int net = Boolean.compare(a.isNetworkConnectionRequired(), b.isNetworkConnectionRequired());
     if (net != 0) return net;
     return Integer.compare(b.getQuality(), a.getQuality());
   });
   return candidates;
 }
 class Bridge {
   @JavascriptInterface public boolean ttsAvailable() { return speechReady; }
   @JavascriptInterface public String voices() {
     JSONArray voices = new JSONArray();
     try { for (Voice v : turkishVoices()) {
       JSONObject o = new JSONObject();
       o.put("name", v.getName());o.put("locale",v.getLocale().toLanguageTag());
       o.put("network",v.isNetworkConnectionRequired());o.put("quality",v.getQuality());
       o.put("selected",speechEngine.getVoice()!=null && v.getName().equals(speechEngine.getVoice().getName()));
       voices.put(o);
     }}catch(Exception ignored){};
     return voices.toString();
   }
   @JavascriptInterface public void chooseVoice(String voiceName){runOnUiThread(()->{
     if (!speechReady || voiceName==null) return;
     for(Voice v:turkishVoices()) if(voiceName.equals(v.getName())){speechEngine.setVoice(v);break;}
   });}
   @JavascriptInterface public void speechRate(float rate) {runOnUiThread(()->{
     if(speechEngine!=null && rate>=0.7f && rate<=1.3f) speechEngine.setSpeechRate(rate);
   });}
   @JavascriptInterface public void askChatGPT(String prompt){runOnUiThread(()->{
     try {
       ClipboardManager cb=(ClipboardManager)getSystemService(CLIPBOARD_SERVICE);
       cb.setPrimaryClip(ClipData.newPlainText("Banu mutfak sorusu",prompt));
       Toast.makeText(MainActivity.this,"Soru kopyalandı. ChatGPT'de yapıştırıp gönder.",Toast.LENGTH_LONG).show();
       Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse("https://chatgpt.com/"));
       startActivity(i);
     }catch(Exception ex){Toast.makeText(MainActivity.this,"ChatGPT açılamadı, soru kopyalandı.",Toast.LENGTH_LONG).show();}
   });}
   @JavascriptInterface public void speak(String text){runOnUiThread(()->{
       if(speechReady && speechEngine!=null){
         String limited=text==null?"":text;
         if(limited.length()>3500)limited=limited.substring(0,3500);
         speechEngine.speak(limited,TextToSpeech.QUEUE_FLUSH,null,"banu_voice_"+System.currentTimeMillis());
       }else{Toast.makeText(MainActivity.this,"Türkçe ses motoru hazır değil. Biraz sonra tekrar dene veya ses ayarlarını kontrol et.",Toast.LENGTH_LONG).show();}
   });}
   @JavascriptInterface public void stopSpeak(){runOnUiThread(()->{if(speechEngine!=null)speechEngine.stop();});}
   @JavascriptInterface public void listen(){runOnUiThread(()->{
     try{
       Intent intent=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
       intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
       intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE,"tr-TR");
       intent.putExtra(RecognizerIntent.EXTRA_PROMPT,"Banu, seni dinliyorum");
       startActivityForResult(intent,VOICE_REQUEST);
     }catch(Exception ex){Toast.makeText(MainActivity.this,"Ses tanıma uygulaması bulunamadı. Klavye mikrofonunu kullanabilirsin.",Toast.LENGTH_LONG).show();}
   });}

   @JavascriptInterface public void share(String s){runOnUiThread(()->{Intent i=new Intent(Intent.ACTION_SEND);i.setType("text/plain");i.putExtra(Intent.EXTRA_TEXT,s);startActivity(Intent.createChooser(i,"Banu'nun listesini paylaş"));});}
   @JavascriptInterface public void enableNotifications(){runOnUiThread(()->{
      if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},21);}
      if(Build.VERSION.SDK_INT>=31){AlarmManager alarm=(AlarmManager)getSystemService(ALARM_SERVICE);if(!alarm.canScheduleExactAlarms()){
       try{Intent i=new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);i.setData(android.net.Uri.parse("package:"+getPackageName()));startActivity(i);}catch(Exception e){Toast.makeText(MainActivity.this,"Alarm ayarlarından izin verin",Toast.LENGTH_LONG).show();}
      }}ReminderReceiver.schedule(MainActivity.this);
   });}
 }
}
