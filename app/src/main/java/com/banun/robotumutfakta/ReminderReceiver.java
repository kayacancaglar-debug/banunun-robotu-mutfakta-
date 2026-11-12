package com.banun.robotumutfakta;
import android.app.*;
import android.content.*;
import android.os.*;
import java.util.*;

public class ReminderReceiver extends android.content.BroadcastReceiver {
 static final String CHANNEL="daily_menu";
 static void channel(Context c){
   if(Build.VERSION.SDK_INT>=26){NotificationManager m=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);NotificationChannel ch=new NotificationChannel(CHANNEL,"Yarının yemek menüsü",NotificationManager.IMPORTANCE_DEFAULT);ch.setDescription("Her gün öğlen ertesi günün akşam menüsü");m.createNotificationChannel(ch);}
 }
 static void schedule(Context c){
   AlarmManager a=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
   Intent i=new Intent(c,ReminderReceiver.class);
   PendingIntent p=PendingIntent.getBroadcast(c,111,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
   Calendar date=Calendar.getInstance();date.set(Calendar.HOUR_OF_DAY,12);date.set(Calendar.MINUTE,0);date.set(Calendar.SECOND,0);date.set(Calendar.MILLISECOND,0);
   if(date.getTimeInMillis()<=System.currentTimeMillis())date.add(Calendar.DATE,1);
   try{if(Build.VERSION.SDK_INT>=31&&a.canScheduleExactAlarms())a.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,date.getTimeInMillis(),p);
   else if(Build.VERSION.SDK_INT<31)a.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,date.getTimeInMillis(),p);
   else a.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,date.getTimeInMillis(),p);
   }catch(SecurityException e){a.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,date.getTimeInMillis(),p);}
 }
 @Override public void onReceive(Context c,Intent i){
   channel(c);
   Intent open=new Intent(c,MainActivity.class);open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
   PendingIntent pi=PendingIntent.getActivity(c,112,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
   Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(c,CHANNEL):new Notification.Builder(c);
   b.setSmallIcon(android.R.drawable.ic_menu_today).setContentTitle("🤖 Banu, yarının menüsü hazır!")
    .setContentText("3 kişilik tarifin ve alışveriş listen seni bekliyor 💛")
    .setContentIntent(pi).setAutoCancel(true).setWhen(System.currentTimeMillis());
   NotificationManager n=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
   try{n.notify(1200,b.build());}catch(SecurityException ignored){}
   schedule(c);
 }
}
