# Banu’nun Robotu Mutfakta — Android APK projesi

Bu ZIP **hazır APK değil**, Android Studio ile **APK oluşturulabilecek açık kaynak proje**dir. Kaynak kodu ve tüm tarifler dahildir.

## APK oluşturma (Windows / macOS)
1. **Android Studio** kurun: https://developer.android.com/studio
2. **android-project** klasörünü proje olarak açın (File → Open).
3. Android SDK Platform 35 ve JDK 17 hazır olduğunda Gradle Sync işlemini bitirin.
4. Build → Build Bundle(s) / APK(s) → Build APK(s) seçin.
5. `app/build/outputs/apk/debug/app-debug.apk` oluşur. Bu dosyayı Android telefona gönderin, bilinmeyen uygulama yükleme iznini verdikten sonra kurun.

**Alternatif:** `android-project` içeriğini yeni GitHub deposuna yükleyin. Actions → “Android APK oluştur” → Run workflow → Artifacts altında imzalı debug APK bulunur. Bilmediğiniz APK sitelerini kullanmayın.

## İşleyiş
- 50 adet mevsime göre filtrelenen 3 kişilik tarif, yaklaşık makro ve kalori, haftalık plan, alışveriş işaretleme, beğen / beğenme, kişisel notlar.
- İnternetsiz çalışır. Yeni yapay zekâ tarifleri üretmez; hazır tarifleri tarihe/mevsime göre seçer.
- Telefonda her gün saat 12.00 civarı **yerel bildirim** ayarlar. Android 13+ bildirim izni gerektirir. Tam 12.00 için Android'de “Alarmlar ve hatırlatıcılar” özel erişim izni gerekebilir. İzin verilmezse Android saati geciktirebilir.
- Telefon yeniden başlayınca hatırlatıcı yeniden planlanır. Bazı üreticilerin güç tasarrufu ayarları bildirimi geciktirebilir.
- Kişisel tercih ve alışveriş listeleri yalnızca telefonun yerel depolamasında tutulur.
- Balık türü ve mevsim filtresi mevcut tariflerin ay etiketlerine bağlıdır; canlı yasa/av/pazar verisi içermez, satın almadan önce tazeliği ve güncel av yasağını kontrol edin.
- Besin değerleri yaklaşık tahminlerdir, diyetisyen tarafından doğrulanmış laboratuvar değerleri değildir.

## Gelecekte yapılabilecekler
Uygulama içinden her gün **yeni** ve canlı bilgili yapay zekâ menüsü üretmek için güvenli bir sunucu (API anahtarı telefona gömülmeden), veri saklama, internet bağlantısı ve uzaktan bildirim altyapısı gerekir.
