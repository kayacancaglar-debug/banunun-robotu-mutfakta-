"use strict";
const STORE='banun_robotu_v1';const defaultPrefs={likes:[],dislikes:[],overrides:{},notes:{},avoid:'',checks:{},muted:false};
let prefs={...defaultPrefs};try{const x=JSON.parse(localStorage.getItem(STORE));if(x&&typeof x==='object')prefs={...prefs,...x}}catch(e){}
if(prefs.menuFormat!==2){prefs.checks={};prefs.menuFormat=2;}
function save(){try{localStorage.setItem(STORE,JSON.stringify(prefs))}catch(e){toast('Cihazda kayıt yapılamadı')}}
function toast(t){let el=document.getElementById('toast');el.textContent=t;el.style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.style.display='none',2400)}
function plusDays(d,n){const o=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);o.setDate(o.getDate()+n);return o}
function key(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function num(d){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000)}
function validFish(d){const m=d.getMonth()+1;return m>=9||m<=3||(m===4&&d.getDate()<15)}
const days=['Tavuk','Bakliyat','Sebze','Kırmızı et','Bakliyat','Balık','Hindi'];
const emoji={"Tavuk":"🍗","Balık":"🐟","Bakliyat":"🥘","Kırmızı et":"🍖","Sebze":"🥦","Hindi":"🍲"};
function ingredientsAvoid(){return (prefs.avoid||'').toLocaleLowerCase('tr').split(/[;,\n]+/).map(s=>s.trim()).filter(Boolean)}
function seasonal(d){const mo=d.getMonth()+1,avoid=ingredientsAvoid();let pool=MENUS.filter(m=>![6,15,18,21,28,43,50].includes(m.id)&&m.months.includes(mo)&&(! (m.category==='Balık')||validFish(d))&&!prefs.dislikes.includes(m.id));const filtered=pool.filter(m=>!m.ingredients.some(i=>avoid.some(s=>i.name.toLocaleLowerCase('tr').includes(s))));return filtered.length?filtered:pool}
function choose(date,used){let pool=seasonal(date);if(!pool.length)pool=MENUS.filter(m=>m.months.includes(date.getMonth()+1));let override=pool.find(m=>m.id===prefs.overrides[key(date)]);if(override)return override;
let fresh=pool.filter(m=>!used.includes(m.id));if(!fresh.length)fresh=pool;const day=(date.getDay()+6)%7;let category=days[day],cat=fresh.filter(m=>m.category===category);if(!cat.length&&category==='Balık')cat=fresh.filter(m=>m.category==='Tavuk');if(!cat.length&&category==='Hindi')cat=fresh.filter(m=>m.category==='Tavuk');if(!cat.length)cat=fresh;cat.sort((a,b)=>a.id-b.id);const idx=((num(date)*17+Math.floor(num(date)/7)*13)%cat.length+cat.length)%cat.length;return cat[idx]}
function meal(date){const recent=[];let selected=null;const anchor=new Date(2026,0,1,12);let start=anchor>date?plusDays(date,-15):anchor;for(let d=new Date(start);d<=date;d=plusDays(d,1)){const a=choose(d,recent);recent.push(a.id);if(recent.length>14)recent.shift();selected=a}return selected}

// Üç kişilik ek tabaklar. Kalori/makrolar porsiyon başına yaklaşık değerlerdir.
const MEVSIM_BASLANGIC=[
 {id:'ezo',name:'Ezogelin çorbası',kind:'Çorba',months:[1,2,3,4,10,11,12],prep:10,cook:22,kcal:110,protein:5,carb:17,fat:2,ingredients:[{name:'Kırmızı mercimek (kuru)',amount:'55 g'},{name:'İnce bulgur',amount:'20 g'},{name:'Soğan',amount:'1 küçük adet'},{name:'Domates salçası',amount:'1 tatlı kaşığı'},{name:'Zeytinyağı',amount:'1 tatlı kaşığı'},{name:'Kuru nane',amount:'1 tatlı kaşığı'}],steps:['Kırmızı mercimeği yıka; küçük doğranmış soğan ve bulgurla 700 ml suda 20 dakika pişir.','Salça, nane ve zeytinyağını ekle; gerekirse sıcak suyla üç küçük kaseye bölünecek kıvama getir.']},
 {id:'yayla',name:'Hafif yayla çorbası',kind:'Çorba',months:[1,2,3,4,5,9,10,11,12],prep:8,cook:20,kcal:100,protein:5,carb:13,fat:3,ingredients:[{name:'Yoğurt',amount:'250 g'},{name:'Pirinç',amount:'30 g'},{name:'Kuru nane',amount:'1 tatlı kaşığı'},{name:'Zeytinyağı',amount:'1 tatlı kaşığı'}],steps:['Pirinci 650 ml suda yumuşayıncaya kadar haşla.','Yoğurdu çorbanın suyuyla ılıştır, azar azar ekleyip karıştır; kaynatmadan ısıt.','Nane ve zeytinyağını ilave ederek üç küçük kaseye paylaştır.']},
 {id:'sehz',name:'Sebzeli şehriye çorbası',kind:'Çorba',months:[1,2,3,4,5,6,7,8,9,10,11,12],prep:10,cook:18,kcal:95,protein:3,carb:15,fat:3,ingredients:[{name:'Tel şehriye',amount:'45 g'},{name:'Havuç',amount:'1 küçük adet'},{name:'Soğan',amount:'1 küçük adet'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'},{name:'Limon',amount:'1/2 adet'}],steps:['Soğanı ve ince rendelenmiş havucu yağda 2 dakika çevir.','750 ml su ve şehriyeyi ekle, 12-15 dakika pişir; üç kaseye paylaştır.','Serviste birkaç damla limon sık.']},
 {id:'karn',name:'Karnabahar çorbası',kind:'Çorba',months:[1,2,3,10,11,12],prep:10,cook:22,kcal:105,protein:4,carb:15,fat:3,ingredients:[{name:'Karnabahar',amount:'450 g'},{name:'Patates',amount:'1 küçük adet'},{name:'Soğan',amount:'1 küçük adet'},{name:'Yoğurt',amount:'80 g'},{name:'Zeytinyağı',amount:'1 tatlı kaşığı'}],steps:['Karnabahar, soğan ve küçük patatesi 650 ml suda yumuşayıncaya kadar haşla.','Blenderdan geçir; yoğurdu sıcak çorbayla ılıştırıp ekle, zeytinyağıyla bitir.']},
 {id:'brok',name:'Brokoli çorbası',kind:'Çorba',months:[1,2,3,10,11,12],prep:9,cook:17,kcal:95,protein:5,carb:13,fat:2,ingredients:[{name:'Brokoli',amount:'450 g'},{name:'Patates',amount:'100 g'},{name:'Sarımsak',amount:'1 diş'},{name:'Zeytinyağı',amount:'1 tatlı kaşığı'}],steps:['Brokoli ve patatesi 650 ml suyla haşla, sarımsak ekle.','Pürüzsüz kıvama getir; üç küçük porsiyon olarak servis et.']},
 {id:'kabak',name:'Hafif kabak çorbası',kind:'Çorba',months:[5,6,7,8,9],prep:10,cook:18,kcal:85,protein:3,carb:12,fat:3,ingredients:[{name:'Kabak',amount:'450 g'},{name:'Havuç',amount:'1 adet'},{name:'Patates',amount:'120 g'},{name:'Zeytinyağı',amount:'1 tatlı kaşığı'}],steps:['Kabak, havuç ve patatesi küp doğrayıp 700 ml suda pişir.','Blenderdan geçir, zeytinyağı ekle; üç küçük kaseye ayır.']},
 {id:'mantar',name:'Sarımsaklı mantar sote',kind:'Ara sıcak',months:[1,2,3,4,5,6,7,8,9,10,11,12],prep:8,cook:10,kcal:80,protein:4,carb:5,fat:5,ingredients:[{name:'Kültür mantarı',amount:'450 g'},{name:'Sarımsak',amount:'2 diş'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'},{name:'Maydanoz',amount:'1/4 demet'}],steps:['Mantarları iri doğra, geniş tavada yüksek ateşte suyunu bırakıp çekinceye kadar çevir.','Zeytinyağı ve sarımsak ekleyip 2 dakika daha pişir; maydanozla üç küçük tabakta servis et.']},
 {id:'mucver',name:'Fırında mini kabak mücveri',kind:'Ara sıcak',months:[5,6,7,8,9],prep:14,cook:18,kcal:110,protein:5,carb:12,fat:5,ingredients:[{name:'Kabak',amount:'500 g'},{name:'Yumurta',amount:'1 adet'},{name:'Un',amount:'30 g'},{name:'Dereotu',amount:'1/4 demet'},{name:'Zeytinyağı',amount:'1 tatlı kaşığı'}],steps:['Kabağı rendeleyip suyunu sık; yumurta, un ve dereotuyla karıştır.','Yağlanmış tepside 6 küçük mücver yap ve 190°C fırında 18 dakika pişir.','Kişi başı iki küçük mücver olacak şekilde servis et.']}
];
const MEVSIM_SALATALAR=[
 {id:'lahanah',name:'Mor lahana ve havuç salatası',kind:'Mevsim salatası',months:[1,2,3,4,10,11,12],prep:12,cook:0,kcal:65,protein:1,carb:8,fat:3,ingredients:[{name:'Mor lahana',amount:'250 g'},{name:'Havuç',amount:'2 adet'},{name:'Limon',amount:'1 adet'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'}],steps:['Mor lahanayı ince kıy, havucu rendele.','Limon ve zeytinyağıyla harmanlayıp üç salata kasesine böl.']},
 {id:'roka',name:'Roka ve turp salatası',kind:'Mevsim salatası',months:[1,2,3,4,9,10,11,12],prep:8,cook:0,kcal:55,protein:2,carb:5,fat:3,ingredients:[{name:'Roka',amount:'1 demet'},{name:'Kırmızı turp',amount:'4 adet'},{name:'Limon',amount:'1 adet'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'}],steps:['Rokayı yıka ve kurula; turpu ince doğra.','Limon ve az zeytinyağıyla karıştır.']},
 {id:'pancar',name:'Pancar ve maydanoz salatası',kind:'Mevsim salatası',months:[1,2,3,4,10,11,12],prep:12,cook:25,kcal:65,protein:2,carb:9,fat:3,ingredients:[{name:'Pancar',amount:'2 küçük adet'},{name:'Maydanoz',amount:'1/2 demet'},{name:'Limon',amount:'1/2 adet'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'}],steps:['Pancarı haşlayıp soğut; küp doğra.','Maydanoz, limon ve yağla karıştırıp servis et.']},
 {id:'yesil',name:'Mevsim yeşillikleri salatası',kind:'Mevsim salatası',months:[1,2,3,4,5,6,7,8,9,10,11,12],prep:10,cook:0,kcal:55,protein:2,carb:5,fat:3,ingredients:[{name:'Mevsim marulu',amount:'1/2 adet'},{name:'Maydanoz',amount:'1/4 demet'},{name:'Limon',amount:'1 adet'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'}],steps:['Mevsim marulunu ve maydanozu yıkayıp doğra.','Limon ve zeytinyağı ekle; üç porsiyon hazırla.']},
 {id:'coban',name:'Çoban salata',kind:'Mevsim salatası',months:[6,7,8,9],prep:10,cook:0,kcal:65,protein:2,carb:7,fat:4,ingredients:[{name:'Domates',amount:'2 adet'},{name:'Salatalık',amount:'1 adet'},{name:'Yeşil biber',amount:'1 adet'},{name:'Maydanoz',amount:'1/4 demet'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'},{name:'Limon',amount:'1 adet'}],steps:['Domates, salatalık ve biberi doğra.','Maydanoz, yağ ve limon ekle; üç tabağa ayır.']},
 {id:'semiz',name:'Limonlu semizotu salatası',kind:'Mevsim salatası',months:[5,6,7,8,9],prep:8,cook:0,kcal:60,protein:2,carb:5,fat:4,ingredients:[{name:'Semizotu',amount:'1 demet'},{name:'Limon',amount:'1 adet'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'}],steps:['Semizotunun yapraklarını yıka, iyice kurut.','Limon ve yağla karıştır; bekletmeden servis et.']},
 {id:'sogan',name:'Sumaklı soğan ve maydanoz salatası',kind:'Mevsim salatası',months:[1,2,3,4,5,6,7,8,9,10,11,12],prep:8,cook:0,kcal:60,protein:1,carb:8,fat:3,ingredients:[{name:'Kuru soğan',amount:'2 küçük adet'},{name:'Maydanoz',amount:'1/2 demet'},{name:'Sumak',amount:'1 tatlı kaşığı'},{name:'Limon',amount:'1/2 adet'},{name:'Zeytinyağı',amount:'2 tatlı kaşığı'}],steps:['Soğanı ince piyazlık doğra, sumakla ov.','Maydanoz, limon ve zeytinyağı ekleyerek servis et.']}
];
const HAFIF_TATLILAR=[
 {id:'elma',name:'Fırın elma ve tarçın',kind:'Hafif tatlı',months:[1,2,3,10,11,12],prep:8,cook:18,kcal:105,protein:1,carb:22,fat:1,ingredients:[{name:'Elma',amount:'3 küçük adet'},{name:'Tarçın',amount:'1 tatlı kaşığı'},{name:'Ceviz içi',amount:'6 g'}],steps:['Elmaların içini çıkarıp tarçın serp.','180°C fırında 18 dakika yumuşat, çok az cevizle üç porsiyon olarak sun.']},
 {id:'kabakt',name:'Fırında hafif balkabağı tatlısı',kind:'Hafif tatlı',months:[1,2,10,11,12],prep:10,cook:25,kcal:95,protein:2,carb:17,fat:2,ingredients:[{name:'Balkabağı',amount:'400 g'},{name:'Bal',amount:'20 g'},{name:'Ceviz içi',amount:'12 g'},{name:'Tarçın',amount:'1 çay kaşığı'}],steps:['Balkabağını küçük dilimle ve az suyla 190°C fırında yumuşat.','Piştikten sonra üzerine bal, tarçın ve kıyılmış cevizi üç kişiye bölerek ekle.']},
 {id:'irmik',name:'Az şekerli sütlü irmik tatlısı',kind:'Hafif tatlı',months:[1,2,3,4,5,6,7,8,9,10,11,12],prep:8,cook:10,kcal:125,protein:5,carb:19,fat:3,ingredients:[{name:'Süt',amount:'300 ml'},{name:'İrmik',amount:'30 g'},{name:'Şeker',amount:'20 g'},{name:'Tarçın',amount:'1 çay kaşığı'}],steps:['Süt, irmik ve şekeri kısık ateşte kıvam alana kadar karıştır.','Üç küçük kaseye paylaştır, tarçın serp; soğuk servis et.']},
 {id:'armut',name:'Tarçınlı fırın armut',kind:'Hafif tatlı',months:[1,2,3,9,10,11,12],prep:7,cook:15,kcal:100,protein:1,carb:23,fat:1,ingredients:[{name:'Armut',amount:'3 küçük adet'},{name:'Tarçın',amount:'1 çay kaşığı'},{name:'Ceviz içi',amount:'6 g'}],steps:['Armutları ortadan böl; tarçın serperek 180°C fırında 15 dakika pişir.','Ufak ceviz parçalarıyla üç küçük porsiyon olarak sun.']}
];
function planExtraChoice(set,date,salt){const avoid=ingredientsAvoid(),month=date.getMonth()+1;
 let possible=set.filter(x=>x.months.includes(month)&&!x.ingredients.some(y=>avoid.some(a=>y.name.toLocaleLowerCase('tr').includes(a))));
 if(!possible.length)possible=set.filter(x=>x.months.includes(month));
 if(!possible.length)return null;
 return possible[Math.abs(num(date)*29+salt*17)%possible.length];}
function coursePlan(date,m){
 const starter=planExtraChoice(MEVSIM_BASLANGIC,date,3+m.id);
 const salad=planExtraChoice(MEVSIM_SALATALAR,date,7+m.id);
 // Ana yemek ve varsa mevcut yan tabaklar, eski tarifin porsiyonlarıyla korunur.
 const courses=[{kind:'Ana yemek',name:m.name,prep:m.prep,cook:m.cook,kcal:m.kcal,protein:m.protein,carb:m.carb,fat:m.fat,ingredients:m.ingredients,steps:m.steps}];
 if(starter)courses.unshift(starter);
 if(salad)courses.push(salad);
 const day=date.getDay();
 let dessert=null;
 if(day===2||day===6){
   let cand=planExtraChoice(HAFIF_TATLILAR,date,m.id+5);
   const base= courses.reduce((a,c)=>a+c.kcal,0);
   if(cand && base+cand.kcal<=850){dessert=cand;courses.push(cand)}
 }
 const totals={kcal:0,protein:0,carb:0,fat:0};
 for(const c of courses)for(const k of Object.keys(totals))totals[k]+=c[k];
 return {courses,totals,dessert,dessertNote:dessert?'Bugün hafif tatlı da menüye sığdı.':'Bugün toplam enerjiyi dengede tutmak için tatlı eklemedim.'};
}
function combinedIngredients(courses){
 const res=[],index=new Map();
 for(const c of courses)for(const item of c.ingredients){
   const k=item.name.trim().toLocaleLowerCase('tr');
   if(!index.has(k)){index.set(k,res.length);res.push({name:item.name,amount:item.amount,from:[c.kind]});}
   else{const a=res[index.get(k)];
     if(a.amount!==item.amount)a.amount=a.amount+' + '+item.amount;
     else a.amount=a.amount+' + '+item.amount;
     if(!a.from.includes(c.kind))a.from.push(c.kind);
   }
 }
 return res;
}

let selectedDate=plusDays(new Date(),1);let selectedPage='menu';
function pickPage(name){selectedPage=name;document.querySelectorAll('.page').forEach(e=>e.classList.toggle('active',e.id==='page-'+name));document.querySelectorAll('.bottomnav button').forEach(e=>e.classList.toggle('active',e.dataset.page===name));render();window.scrollTo({top:0,behavior:'smooth'})}
function drawMeal(){
 const m=meal(selectedDate),p=coursePlan(selectedDate,m),display=selectedDate.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 document.getElementById('dateLabel').textContent=display;
 document.getElementById('category').textContent=m.category;
 document.getElementById('dishIcon').textContent=emoji[m.category]||'🍲';
 document.getElementById('mealName').textContent=m.name;
 document.getElementById('mealSummary').textContent='🤖 Banu, yarın '+p.courses.length+' çeşit hazır! '+(p.dessert?'Tatlıyı da ekledim.':'Hafif ve dengeli bir sofra seçtim.');
 document.getElementById('timeLabel').textContent='⏱ Yaklaşık '+(m.prep+m.cook)+' dk + başlangıç';
 for(const x of ['kcal','protein','carb','fat'])document.getElementById(x).textContent=p.totals[x];
 document.getElementById('seasonNote').textContent=(m.seasonNote||'Bu dönemin ürünleriyle hazırlanan Türk ev yemeği.')+' '+p.dessertNote;
 const list=document.getElementById('courseList');list.replaceChildren();
 p.courses.forEach(c=>{const box=document.createElement('div');box.className='course-item';
  const icon=document.createElement('span');icon.className='course-emoji';icon.textContent=c.kind==='Çorba'?'🥣':c.kind==='Ara sıcak'?'🧆':c.kind==='Ana yemek'?'🍲':c.kind==='Mevsim salatası'?'🥗':'🍮';
  const b=document.createElement('div');b.className='course-text';const type=document.createElement('small');type.textContent=c.kind;const name=document.createElement('strong');name.textContent=c.name;b.append(type,name);
  const cal=document.createElement('span');cal.className='course-kcal';cal.textContent=c.kcal+' kcal';box.append(icon,b,cal);list.append(box);});
 document.getElementById('stepsCount').textContent=p.courses.length+' ayrı tarif';
 const recipes=document.getElementById('recipes');recipes.replaceChildren();
 p.courses.forEach(c=>{
   const container=document.createElement('section');container.className='course-recipe';
   const title=document.createElement('h3');title.textContent=(c.kind==='Çorba'?'🥣 ':c.kind==='Ara sıcak'?'🧆 ':c.kind==='Ana yemek'?'🍲 ':c.kind==='Mevsim salatası'?'🥗 ':'🍮 ')+c.name;
   const sub=document.createElement('p');sub.className='muted small';sub.textContent=c.kind+' · Kişi başı yaklaşık '+c.kcal+' kcal · P '+c.protein+' g / K '+c.carb+' g / Y '+c.fat+' g · Hazırlık '+c.prep+' dk / Pişirme '+c.cook+' dk';
   const ol=document.createElement('ol');ol.className='steps';c.steps.forEach(s=>{let li=document.createElement('li');li.textContent=s;ol.append(li)});
   const listen=document.createElement('button');listen.className='recipe-sound';listen.type='button';listen.textContent='🔊 Tarifi dinle';listen.dataset.course=String(p.courses.indexOf(c));container.append(title,sub,listen,ol);recipes.append(container);
 });
 document.getElementById('like').textContent=(prefs.likes.includes(m.id)?'♥':'♡')+' Kaydet';
 document.getElementById('like').classList.toggle('active',prefs.likes.includes(m.id));
 document.getElementById('dislike').textContent=(prefs.dislikes.includes(m.id)?'↩ Geri al':'👎 İsteme');
 document.getElementById('mealNote').value=prefs.notes[m.id]||'';
}
function drawShop(){
 const m=meal(selectedDate),p=coursePlan(selectedDate,m),items=combinedIngredients(p.courses),ck=key(selectedDate),mark=prefs.checks[ck]||[];
 document.getElementById('shopDate').textContent=selectedDate.toLocaleDateString('tr-TR',{day:'numeric',month:'long'});
 document.getElementById('shopTitle').textContent=p.courses.length+' çeşit · '+p.totals.kcal+' kcal/kişi';
 const ul=document.getElementById('ingredientList');ul.replaceChildren();let completed=0;
 items.forEach((it,i)=>{const checked=mark.includes(i);if(checked)completed++;
  let li=document.createElement('li');li.className='rowitem'+(checked?' done':'');const inp=document.createElement('input');inp.className='tick';inp.type='checkbox';inp.checked=checked;inp.setAttribute('aria-label',it.name);
  inp.onchange=()=>{let active=prefs.checks[ck]||[];prefs.checks[ck]=inp.checked?[...new Set([...active,i])]:active.filter(x=>x!==i);save();drawShop()};
  let name=document.createElement('span');name.className='itemname';name.textContent=it.name;const amt=document.createElement('span');amt.className='itemamt';amt.textContent=it.amount;
  li.append(inp,name,amt);ul.append(li)});
 document.getElementById('progressLabel').textContent=completed+' / '+items.length;
 document.getElementById('progressFill').style.width=(100*completed/items.length)+'%';
}
function drawWeek(){const week=document.getElementById('weekList'),daysEl=document.getElementById('weekDays');week.replaceChildren();daysEl.replaceChildren();let tally={};for(let i=1;i<=7;i++){let d=plusDays(new Date(),i),m=meal(d),pl=coursePlan(d,m);tally[m.category]=(tally[m.category]||0)+1;let b=document.createElement('button');b.className='weekitem'+(key(d)===key(selectedDate)?' active':'');const e=document.createElement('span');e.className='emoji';e.textContent=emoji[m.category]||'🍽️';const n=document.createElement('span');n.className='name';n.textContent=m.name;const sub=document.createElement('small');sub.textContent=d.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})+' · '+pl.courses.length+' çeşit · '+pl.totals.kcal+' kcal/kişi';n.appendChild(sub);let arr=document.createElement('span');arr.className='arrow';arr.textContent='›';b.append(e,n,arr);b.onclick=()=>{selectedDate=d;pickPage('menu')};week.appendChild(b);let chip=document.createElement('button');chip.className=key(d)===key(selectedDate)?'active':'';const sm=document.createElement('small');sm.textContent=d.toLocaleDateString('tr-TR',{weekday:'short'});const num=document.createElement('strong');num.textContent=d.getDate();chip.append(sm,num);chip.onclick=()=>{selectedDate=d;pickPage('menu')};daysEl.appendChild(chip)}document.getElementById('balanceNote').textContent=Object.entries(tally).map(([k,v])=>k+': '+v+' gün').join(' · ')}
function render(){if(selectedPage==='menu')drawMeal();if(selectedPage==='shop')drawShop();if(selectedPage==='week')drawWeek();if(selectedPage==='settings'){document.getElementById('avoid').value=prefs.avoid||'';document.getElementById('recipeCount').textContent=MENUS.length+' ana yemekten üretilen en az 3 çeşitlik mevsim menüleri. Tatlılar bazı günler eklenir.'}}
document.querySelectorAll('.bottomnav button').forEach(x=>x.onclick=()=>pickPage(x.dataset.page));
document.getElementById('swap').onclick=()=>{const m=meal(selectedDate),pool=seasonal(selectedDate).filter(x=>x.id!==m.id);if(!pool.length){toast('Uygun başka tarif bulunamadı');return}let i=pool.findIndex(x=>x.id===prefs.overrides[key(selectedDate)]);const next=pool[(i+1+pool.length)%pool.length];prefs.overrides[key(selectedDate)]=next.id;save();render();toast('Robotun yeni bir menü seçti 🤖')};
document.getElementById('like').onclick=()=>{let id=meal(selectedDate).id;prefs.likes=prefs.likes.includes(id)?prefs.likes.filter(x=>x!==id):[...prefs.likes,id];save();render();toast('Tercihin kaydedildi 💛')};
document.getElementById('dislike').onclick=()=>{let id=meal(selectedDate).id;const exists=prefs.dislikes.includes(id);prefs.dislikes=exists?prefs.dislikes.filter(x=>x!==id):[...prefs.dislikes,id];if(!exists)delete prefs.overrides[key(selectedDate)];save();render();toast(exists?'Yemek yeniden önerilebilir':'Gelecek menülerden çıkarıldı')};
document.getElementById('saveNote').onclick=()=>{prefs.notes[meal(selectedDate).id]=document.getElementById('mealNote').value;save();toast('Notunu unutmayacağım! 💌')};
document.getElementById('savePrefs').onclick=()=>{prefs.avoid=document.getElementById('avoid').value;save();toast('Tercihler kaydedildi')};
document.getElementById('shareList').onclick=async()=>{const m=meal(selectedDate),p=coursePlan(selectedDate,m),items=combinedIngredients(p.courses),s='🛒 '+p.courses.length+' çeşit · '+key(selectedDate)+' · 3 kişilik\n'+p.courses.map(c=>'• '+c.kind+': '+c.name).join('\n')+'\n\n'+items.map(i=>'• '+i.name+': '+i.amount).join('\n');if(window.BanuAndroid&&BanuAndroid.share){BanuAndroid.share(s);return}try{if(navigator.share)await navigator.share({text:s,title:'Banu’nun alışveriş listesi'});else if(navigator.clipboard){await navigator.clipboard.writeText(s);toast('Liste kopyalandı')}else fallbackCopy(s)}catch(e){if(e.name!=='AbortError')fallbackCopy(s)}};
function fallbackCopy(s){let a=document.createElement('textarea');a.value=s;document.body.append(a);a.select();document.execCommand('copy');a.remove();toast('Liste kopyalandı')}
document.getElementById('notifyBtn').onclick=()=>{if(window.BanuAndroid&&BanuAndroid.enableNotifications){BanuAndroid.enableNotifications();toast('Android bildirim ayarları açıldı')}else{toast('Web sürümünde bildirim yok; takviminize hatırlatıcı ekleyin.');}}
document.getElementById('exportBtn').onclick=()=>{const s=JSON.stringify(prefs,null,2);if(window.BanuAndroid&&BanuAndroid.share){BanuAndroid.share(s);return}const blob=new Blob([s],{type:'application/json'});let u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='banunun_robotu_yedek.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();document.getElementById('importFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{let p=JSON.parse(await f.text());if(!Array.isArray(p.likes)||!Array.isArray(p.dislikes))throw Error('invalid');prefs={...defaultPrefs,...p};save();render();toast('Tercihler geri yüklendi')}catch(ex){toast('Yedek okunamadı')}};
render();if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

/* Banu'nun Robotu v1.2 – çevrimdışı mutfak yardımcısı ve sesli etkileşim */
const ROBOT_GREETS={
 morning:["Günaydın Banu! Şef Banu göreve! Bugün mutfakta neler yapıyoruz?","Günaydın Banu! Robot aşçın hazır, sen de hazır mısın?","Günaydın Banu! Lezzetli bir gün başlıyor!"],
 noon:["Merhaba Banu! Yarınki soframız hazır, birlikte bakalım mı?","Banuuu! Robot şefin burada! Bugünün menüsüne göz atalım!","Şef Banu, mutfakta yardımcın hazır!"],
 evening:["İyi akşamlar Banu! Mis gibi yemekler yapmaya ne dersin?","Banu, mutfakta birlikte harikalar yaratacağız!","İyi akşamlar Banu! Menüyü birlikte hazırlayalım!"]
};
const ROBOT_TIPS={
 salt:'Yemek fazla tuzluysa tuzsuz bir eşlikçi ekle ve bir miktar suyla dengele. Sadece patates atmak tuzu sihirli biçimde çekmez.',
 meat:'Köfteyi çok uzun yoğurma, harcı dinlendir ve fazla pişirme. Sertleşiyorsa daha yağsız kıyma yerine ölçülü yağlı kıyma da deneyebilirsin.',
 cream:'Krema yoksa yemeğe göre sütle biraz nişasta, süzme yoğurt veya beşamel kullanılabilir. Yoğurdu sıcak yemeğe eklerken ılıştır, kesilmesin.',
 yogurt:'Yoğurt yoksa cacık için kefir veya sulandırılmış süzme yoğurt deneyebilirsin. Yayla çorbasında ise yoğurdu atlamak tarifi değiştirir.',
 egg:'Yumurta yoksa köftede biraz galeta unu ve su bağlayıcı olabilir. Hamur işlerinde bire bir alternatif tarifine bağlıdır.',
 lemon:'Limon yoksa salatada az miktarda elma sirkesi kullanabilirsin. Ekşilik farklı olacağı için azar azar ekle.',
 flour:'Un yoksa kıvam için az miktarda nişasta, bazı tariflerde yulaf unu kullanabilirsin. Hamur işlerinde bire bir değişim garanti değildir.',
 butter:'Tereyağı yoksa çoğu sebze yemeğinde zeytinyağı kullanabilirsin. Tat değişir ama daha hafif olur.',
 bake:'Fırın yoksa bazı sebzeleri kapaklı tavada az suyla veya tencerede pişirebilirsin. Süre ve kıvam değişebilir.',
 dry:'Yemek kuru olduysa az sıcak su veya kendi sosunu ekleyip kısık ateşte birkaç dakika çevir. Çok karıştırma.',
 spicy:'Yemek çok acı olduysa miktarı artırmak veya uygun yemeğe yoğurt eklemek acılığı hafifletebilir.',
 watery:'Sosu çok suluysa kapağı açık, kısık ateşte çektir. Un veya nişasta ekleyeceksen önce soğuk suyla aç.',
 protein:'Proteini artırmak için ana yemekte yağsız et, baklagil veya yoğurt porsiyonunu dengeli yükseltebilirsin. Kalori de artar.',
 light:'Daha hafif hazırlamak için kızartma yerine fırın veya ızgara seç. Yağı ölçerek kullan; pilav ve ekmek porsiyonlarını gözden geçir.',
 storage:'Pişmiş yemeği oda sıcaklığında iki saatten fazla bekletme. Hızla soğutup buzdolabına kaldır; tekrar iyice ısıt.',
 ready:'Banu, buradayım! Tarifleri, malzeme değişimlerini ve menüyü sorabilirsin.',
 help:'Bana örneğin köfte neden sert olur, krema yerine ne kullanabilirim veya bugün tavuk istemiyorum diye sorabilirsin.'
};
let robotBusy=false;
let robotLastQuestion='';
function robotIsMuted(){return !!prefs.muted}
function robotVoiceEvent(status){
 if(status==='start'){robotBusy=true;document.body.classList.add('robot-speaking')}
 else {robotBusy=false;document.body.classList.remove('robot-speaking');}
}
function robotStopAudio(){
 try{window.speechSynthesis?.cancel()}catch(e){}
 try{if(window.BanuAndroid&&BanuAndroid.stopSpeak)BanuAndroid.stopSpeak()}catch(e){}
 robotVoiceEvent('done');
}
function robotPlayAsset(path,text){
 if(robotIsMuted())return;
 robotStopAudio();
 const say=String(text||'').trim();if(!say)return;
 try{if(window.BanuAndroid && typeof BanuAndroid.speak==='function'){
   if(typeof BanuAndroid.ttsAvailable==='function'&&!BanuAndroid.ttsAvailable()){
     toast('Ses henüz hazır değil. Biraz sonra tekrar dene.');return;
   }
   BanuAndroid.speak(say);return;
 }}catch(e){console.warn('Android TTS',e)}
 // Android dışı tarayıcılarda desteklenirse Web Speech API.
 try{if(window.speechSynthesis&&window.SpeechSynthesisUtterance){
   const u=new SpeechSynthesisUtterance(say);u.lang='tr-TR';u.rate=0.98;u.pitch=1.0;
   const available=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('tr'));
   if(available.length)u.voice=available[0];
   u.onstart=()=>robotVoiceEvent('start');u.onend=()=>robotVoiceEvent('done');u.onerror=()=>robotVoiceEvent('error');
   window.speechSynthesis.speak(u);return;
 }}catch(e){console.warn('Web TTS',e)}
 toast('Bu cihazda Türkçe konuşma motoru bulunamadı.');
}
function robotFallbackSpeak(text){robotPlayAsset(null,text)}
function robotRefreshVoices(){
 const select=document.getElementById('robotVoiceSelect');if(!select)return;
 const note=document.getElementById('robotVoiceInfo');
 let arr=[];
 try{if(window.BanuAndroid&&typeof BanuAndroid.voices==='function')arr=JSON.parse(BanuAndroid.voices()||'[]');}catch(e){}
 if(!arr.length){select.replaceChildren();const o=document.createElement('option');o.value='';o.textContent='Türkçe ses bulunamadı veya henüz hazır değil';select.append(o);if(note)note.textContent='Ayarlar → Genel yönetim → Metin okuma çıkışı bölümünde Türkçe ses paketini kontrol et.';return;}
 const saved=prefs.robotVoice||'';
 select.replaceChildren();arr.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=v.name+(v.network?' · İnternetli':' · Cihazda')+(v.quality>=400?' · Yüksek kalite':'');o.selected=(saved?v.name===saved:!!v.selected);select.append(o)});
 if(saved && arr.some(x=>x.name===saved))try{BanuAndroid.chooseVoice(saved)}catch(e){}
 if(note)note.textContent=arr.length+' Türkçe ses bulundu. İstersen farklı sesleri dinleyip seçebilirsin.';
}
window.banuNativeReady=()=>{robotRefreshVoices();setTimeout(robotMaybeGreet,550);};
window.robotVoiceEvent=robotVoiceEvent;
function robotMaybeGreet(){
 if(robotIsMuted()||sessionStorage.getItem('banu_greeted'))return;
 try{if(window.BanuAndroid && typeof BanuAndroid.ttsAvailable==='function' && !BanuAndroid.ttsAvailable())return}catch(e){}
 sessionStorage.setItem('banu_greeted','1');robotGreet();
}
function robotMaybeGreet(){
 if(robotIsMuted()||sessionStorage.getItem('banu_greeted'))return;
 try{if(window.BanuAndroid && typeof BanuAndroid.ttsAvailable==='function' && !BanuAndroid.ttsAvailable())return}catch(e){}
 sessionStorage.setItem('banu_greeted','1');robotGreet();
}
function robotMaybeGreet(){
 if(robotIsMuted()||sessionStorage.getItem('banu_greeted'))return;
 try{if(window.BanuAndroid && typeof BanuAndroid.ttsAvailable==='function' && !BanuAndroid.ttsAvailable())return}catch(e){}
 sessionStorage.setItem('banu_greeted','1');robotGreet();
}
function robotGreet(){const h=new Date().getHours();const period=h<11?'morning':h<18?'noon':'evening';const i=Math.floor(Date.now()/86400000)%3;const line=ROBOT_GREETS[period][i];const subtitle=document.getElementById('robotSpeechBubble');if(subtitle)subtitle.textContent='🤖 “'+line+'”';robotPlayAsset('greet-'+period+'-'+i,line)}
function robotCourseAudio(c,m){if(c.kind==='Ana yemek')return 'main-'+m.id; if(c.kind==='Çorba'||c.kind==='Ara sıcak')return 'bas-'+c.id;if(c.kind==='Mevsim salatası')return 'sal-'+c.id;return 'tat-'+c.id}
function robotPlayRecipe(c,m){const txt=c.kind+': '+c.name+'. '+c.steps.map((s,i)=>(i+1)+'. adım: '+s).join(' ');robotPlayAsset(robotCourseAudio(c,m),txt)}
function robotNorm(t){return String(t||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
function robotSwapAvoid(category){const current=meal(selectedDate),d=selectedDate;let options=seasonal(d).filter(m=>m.id!==current.id&&(category ?robotNorm(m.category)!==category :true));if(!options.length)return null;const chosen=options[Math.abs(num(d)*11+current.id*3)%options.length];prefs.overrides[key(d)]=chosen.id;save();render();return chosen;}
function robotFormatAmount(text,ratio){return String(text).replace(/(\d+)\s*\/\s*(\d+)|\d+(?:[.,]\d+)?/g,(raw,n1,n2,offset,source)=>{
 let amount=n1&&n2?Number(n1)/Number(n2):Number(raw.replace(',','.'));if(!Number.isFinite(amount))return raw;
 let unit=source.slice(offset+raw.length).split('+')[0].toLocaleLowerCase('tr-TR');let value=amount*ratio;
 if(/^\s*(?:g|gram|ml)\b/.test(unit))value=Math.max(5,Math.round(value/5)*5);
 else if(/adet|diş/.test(unit))value=Math.ceil(value*2)/2;
 else if(/demet/.test(unit))value=Math.round(value*4)/4;
 else if(/kaşığı|bardak/.test(unit))value=Math.round(value*2)/2;
 else value=Math.round(value*10)/10;
 return Number.isInteger(value)?String(value):String(value).replace('.',',');
})}
function robotReply(question){
 const t=robotNorm(question),m=meal(selectedDate),p=coursePlan(selectedDate,m);let text='',audio=null;
 let count=t.match(/\b([2-9])\s*kisilik\b/);
 if(count){const n=Number(count[1]);const names=combinedIngredients(p.courses).slice(0,13);text=n+' kişi için malzemeleri yaklaşık '+n+'/3 oranında ayarlayabilirsin. İlk malzemeler:\n'+names.map(x=>'• '+x.name+': '+robotFormatAmount(x.amount,n/3)).join('\n')+'\n\nPişirme kabına ve süreye göre kontrol et; bu miktarlar yaklaşık.';}
 else if((/tavuk|hindi|balik|kirmizi et|bakliyat/.test(t))&&/istemiyorum|olmasin|degistir|baska/.test(t)){
  const c=t.includes('tavuk')?'tavuk':t.includes('hindi')?'hindi':t.includes('balik')?'balik':t.includes('kirmizi et')?'kirmizi et':'bakliyat';const n=robotSwapAvoid(c);
  text=n?'Tamam Banu! Bu gün için '+n.name+' seçtim. Menü ve alışveriş listesi de güncellendi.':'Bu tarih için uygun farklı ana yemek bulamadım.';
 }
 else if(/menuyu degistir|menu degistir|baska yemek|yemegi degistir/.test(t)){const n=robotSwapAvoid(null);text=n?'Tamam Banu! Yeni ana yemek '+n.name+'. Üç çeşit menüyü yeniden hazırladım.':'Bu tarih için başka uygun menü bulamadım.';}
 else if(/tuz/.test(t)&&/fazla|cok|kacti|tuzlu|denge/.test(t)){text=ROBOT_TIPS.salt;audio='tip-salt'}
 else if(/kofte/.test(t)&&/sert|kuru|neden/.test(t)){text=ROBOT_TIPS.meat;audio='tip-meat'}
 else if(/krema/.test(t)&&/yok|yerine|kullan|alternatif/.test(t)){text=ROBOT_TIPS.cream;audio='tip-cream'}
 else if(/yogurt/.test(t)&&/yok|yerine|kullan|alternatif/.test(t)){text=ROBOT_TIPS.yogurt;audio='tip-yogurt'}
 else if(/yumurta/.test(t)&&/yok|yerine/.test(t)){text=ROBOT_TIPS.egg;audio='tip-egg'}
 else if(/limon/.test(t)&&/yok|yerine/.test(t)){text=ROBOT_TIPS.lemon;audio='tip-lemon'}
 else if(/un /.test(' '+t+' ')&&/yok|yerine/.test(t)){text=ROBOT_TIPS.flour;audio='tip-flour'}
 else if(/tereyag/.test(t)&&/yok|yerine/.test(t)){text=ROBOT_TIPS.butter;audio='tip-butter'}
 else if(/firin/.test(t)&&/yok|olmadan/.test(t)){text=ROBOT_TIPS.bake;audio='tip-bake'}
 else if(/kuru oldu|kurudu/.test(t)){text=ROBOT_TIPS.dry;audio='tip-dry'}
 else if(/cok aci|acisi fazla/.test(t)){text=ROBOT_TIPS.spicy;audio='tip-spicy'}
 else if(/cok sulu|sosu sulu/.test(t)){text=ROBOT_TIPS.watery;audio='tip-watery'}
 else if(/protein/.test(t)){text=ROBOT_TIPS.protein+' Bu akşamın toplam tahmini proteini kişi başına '+p.totals.protein+' gram.';audio='tip-protein'}
 else if(/hafif|az yagli|kalori dusur|diyet/.test(t)){text=ROBOT_TIPS.light+' Bu menü normal porsiyonda yaklaşık '+p.totals.kcal+' kcal/kişi.';audio='tip-light'}
 else if(/sakla|buzdolabi|ertesi gun|bozul/.test(t)){text=ROBOT_TIPS.storage;audio='tip-storage'}
 else if(/ne kadar sure|kac dakika|ne kadar pis/.test(t)){text='Ana yemek '+m.name+' için hazırlık yaklaşık '+m.prep+' dakika, pişirme '+m.cook+' dakika. Çorba ve salatayı eş zamanlı hazırlayabilirsin.';}
 else if(/(?:tarif(?:i|ini)? (?:bana )?(?:anlat|oku|ver)|tarif nasil yapilir|bu yemek nasil yapilir|tarifi nasil yapilir|nasil pisiririm)/.test(t)&&!/acisiz|glutensiz|vegan|vejetaryen|alerji|cocuk|bebek|az tuzlu|ekstra|degistir/.test(t)){text='Banu, '+m.name+' tarifini sesli anlatıyorum. Yarın menüsünde her tabağın yanında “Tarifi dinle” düğmesi de var.';return {text,recipe:m};}
 else if(/malzeme|alisveris/.test(t)){text='Yarının '+p.courses.length+' çeşit menüsünde '+combinedIngredients(p.courses).length+' malzeme satırı var. Alışveriş sekmesinde üç kişilik tam listeyi görebilirsin.';}
 else if(/tatli/.test(t)){text=p.dessert?'Bu menüde hafif tatlı olarak '+p.dessert.name+' var. Toplam yaklaşık '+p.totals.kcal+' kcal/kişi.':'Bu günün menüsü için kaloriyi dengede tutmak amacıyla tatlı eklemedim.';}
 else if(/kalori|kac kalori/.test(t)){text='Yarının toplam menüsü kişi başı yaklaşık '+p.totals.kcal+' kalori. Protein '+p.totals.protein+' gram, karbonhidrat '+p.totals.carb+' gram ve yağ '+p.totals.fat+' gram. Bunlar tahmindir.';}
 else if(/merhaba|selam|nasilsin|burada misin/.test(t)){text=ROBOT_TIPS.ready;audio='tip-ready'}
 else if(/yardim|ne sorabilirim|neler biliyorsun/.test(t)){text=ROBOT_TIPS.help;audio='tip-help'}
 else if(/bugun ne|yarin ne|menude ne/.test(t)){text='Seçili günün menüsü: '+p.courses.map(c=>c.kind+' olarak '+c.name).join(', ')+'. Yaklaşık '+p.totals.kcal+' kalori/kişi.';}
 else{text='Banu, bu sorunun cevabını hazır tarif bilgilerimden güvenle çıkaramıyorum. Aşağıdaki “ChatGPT’de aç” seçeneğine dokunursan sorunu bugünkü menüyle birlikte iletebilirsin. ChatGPT ücretsiz kullanım sınırları içinde çalışabilir.';}
 return {text,audio};
}
function robotAppendMessage(who,body){const list=document.getElementById('chatMessages');if(!list)return;const item=document.createElement('div');item.className='chat-message '+(who==='Banu'?'user':'assistant');const prefix=document.createElement('strong');prefix.textContent=who==='Banu'?'Banu':'🤖 Robot';const msg=document.createElement('div');msg.className='chat-content';msg.textContent=body;item.append(prefix,msg);list.append(item);list.scrollTop=list.scrollHeight;}
function robotAsk(input){const q=String(input||'').trim().slice(0,400);if(!q)return;robotLastQuestion=q;const field=document.getElementById('robotQuestion');field.value='';robotAppendMessage('Banu',q);const ans=robotReply(q);robotAppendMessage('Robot',ans.text);if(ans.recipe){robotPlayRecipe(coursePlan(selectedDate,ans.recipe).courses.find(c=>c.kind==='Ana yemek'),ans.recipe)}else if(ans.audio)robotPlayAsset(ans.audio,ans.text);else if(!robotIsMuted())robotPlayAsset(null,ans.text);}
function robotAskChatGPT(){
 const raw=document.getElementById('robotQuestion')?.value.trim()||robotLastQuestion||'Bu akşamın menüsünü daha lezzetli nasıl yapabilirim?';
 const m=meal(selectedDate),plan=coursePlan(selectedDate,m);
 const dishes=plan.courses.map(c=>c.kind+': '+c.name).join('; ');
 const prompt='Türkçe yanıtla. Ben Banu, üç kişilik akşam yemeği hazırlıyorum. Seçili tarih: '+selectedDate.toLocaleDateString('tr-TR')+'. Menü: '+dishes+'. Kişi başı yaklaşık '+plan.totals.kcal+' kcal. Sorum: '+raw+'\nTarife uygun, güvenilir ve kısa adımlarla yanıtla; gerekirse eksik bilgi sor.';
 try{if(window.BanuAndroid&&typeof BanuAndroid.askChatGPT==='function'){BanuAndroid.askChatGPT(prompt);return;}}catch(e){console.warn(e)}
 // Android dışı önizleme için soruyu kopyalama ve ayrı sekme
 try{navigator.clipboard.writeText(prompt).catch(()=>{});}catch(e){}
 try{window.open('https://chatgpt.com/','_blank');toast('Soruyu kopyalayıp ChatGPT’ye yapıştır.');}catch(e){toast('ChatGPT bağlantısı bu önizlemede açılamadı.');}
}
function robotListen(){
 if(window.BanuAndroid&&typeof BanuAndroid.listen==='function'){BanuAndroid.listen();return;}
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(Speech){try{const r=new Speech();r.lang='tr-TR';r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>robotAsk(e.results[0][0].transcript);r.onerror=()=>{document.getElementById('robotQuestion').focus();toast('Klavye mikrofonunu kullanabilirsin')};r.start();toast('Seni dinliyorum Banu 🎤');return}catch(e){}}
 document.getElementById('robotQuestion').focus();toast('Klavyendeki 🎤 mikrofon tuşuyla konuşabilirsin');
}
window.robotReceiveVoice=function(text){robotAsk(text)};
function robotBindUI(){
 document.getElementById('robotTouch').onclick=robotGreet;
 document.getElementById('robotGreetBtn').onclick=robotGreet;
 document.getElementById('robotStopBtn').onclick=robotStopAudio;
 document.getElementById('robotMicBtn').onclick=robotListen;
 document.getElementById('robotAskAiBtn').onclick=robotAskChatGPT;
 document.getElementById('robotSendBtn').onclick=()=>robotAsk(document.getElementById('robotQuestion').value);
 document.getElementById('robotQuestion').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();robotAsk(e.target.value)}});
 document.querySelectorAll('[data-robot-q]').forEach(el=>el.onclick=()=>robotAsk(el.dataset.robotQ));
 const vSelect=document.getElementById('robotVoiceSelect');
 vSelect.onchange=()=>{if(!vSelect.value)return;prefs.robotVoice=vSelect.value;save();try{BanuAndroid.chooseVoice(vSelect.value)}catch(e){};toast('Ses seçildi. “Seçilen sesi dinle”ye dokun.')};
 document.getElementById('robotTestVoice').onclick=()=>robotPlayAsset(null,'Merhaba Banu! Ben senin mutfak arkadaşınım. Bugün birlikte harika yemekler yapacağız.');
 document.getElementById('robotVoiceSettings').onclick=()=>toast('Telefon Ayarları → Genel yönetim → Metin okuma çıkışı.');
 setTimeout(robotRefreshVoices,1400);setTimeout(robotRefreshVoices,4500);
 const chk=document.getElementById('robotMute');chk.checked=!!prefs.muted;
 chk.onchange=()=>{prefs.muted=chk.checked;save();if(chk.checked)robotStopAudio();toast(chk.checked?'Robotun sesi kapatıldı':'Robotun sesi açıldı')};
 const cs=document.getElementById('chatMessages');if(cs)robotAppendMessage('Robot','Merhaba Banu! 🤖 Ben çevrimdışı tarif yardımcınım. Menümüz, porsiyonlar ve yemek tüyolarını sorabilirsin. Anlayamadığım bir soruyu ücretsiz kullanım sınırlarıyla ChatGPT’ye aktarabiliriz.');
 document.getElementById('recipes').addEventListener('click',e=>{const btn=e.target.closest('.recipe-sound');if(!btn)return;const m=meal(selectedDate),c=coursePlan(selectedDate,m).courses[Number(btn.dataset.course)];if(c)robotPlayRecipe(c,m)});
}
robotBindUI();
// Android WebView otomatik sesi engelleyebilir. Böyle cihazlarda ilk dokunuşla güvenilir biçimde çalışır.
window.addEventListener('load',()=>setTimeout(robotMaybeGreet,950));


// Android WebView'daki dosya yedekleri için panoya yapıştırma seçeneği.
document.getElementById('restoreTextBtn').onclick=()=>{try{let data=JSON.parse(document.getElementById('restoreText').value.trim());if(!Array.isArray(data.likes)||!Array.isArray(data.dislikes))throw Error('invalid');prefs={...defaultPrefs,...data};save();document.getElementById('robotMute').checked=!!prefs.muted;render();toast('Yedeğin geri yüklendi 💛')}catch(e){toast('Geçerli JSON yedeğini yapıştır')} };
