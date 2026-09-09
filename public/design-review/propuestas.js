'use strict';
// Standalone design study. Every injected string comes from this local, fixed data.
const palettes = [
 {id:'coral',name:'Coral de papel',tag:'Alternativa coral',accent:'#ff653b',second:'#ffd52f',bone:'#f7f5ef',ink:'#252520',soft:'#ffdfd3',description:'Coral intenso, amarillo solar y verde hoja para salir a volar.',reason:'Coral en los controles, con un volantín de identidad propia. Mi elección para una sensación más alegre.'},
 {id:'mandarina',name:'Mandarina',tag:'Más luminosa',accent:'#ff9024',second:'#f44851',bone:'#f8f6ef',ink:'#252520',soft:'#ffe7ce',description:'Controles mandarina y verde de jardín para buen viento.',reason:'Naranja y verde de jardín en la interfaz, con papel de identidad propia.'},
 {id:'solar',name:'Sol de septiembre',tag:'Paleta elegida',accent:'#ffda24',second:'#f45138',bone:'#f8f7f2',ink:'#252520',soft:'#f9edbb',description:'Amarillo luminoso en las acciones y escenas de colores plenos.',reason:'La opción más solar: amarillo limpio en la interfaz y nada de ocre.'},
 {id:'carbon',name:'Papel y tinta',tag:'Contraste más fuerte',accent:'#ff7040',second:'#ffbd59',bone:'#f5f3ec',ink:'#282823',soft:'#e9e6dd',button:'#282823',buttonInk:'#f5f3ec',description:'Controles carbón y escenas intensas; el papel se elige aparte.',reason:'Carbón para operar y color intenso a gran escala en el pronóstico.'}
];
const states={
 ideal:{label:'Buen viento',headline:'ANDA',line:'ahora.',bg:'#18764f',ink:'#faf7ee',wind:'14',gust:'20',trend:'Igual',time:'2 h',light:'19:29',copy:'Buen momento para tu volantín. Viento parejo en este ejemplo.',pose:[220,92,12,.86],why:'Verde hoja para buen viento, con texto hueso y papel cálido. El contraste nace de colores definidos, sin matiz lima ni fluorescencia.',posture:'Arriba, hilo tenso, cola extendida.'},
 liviano:{label:'Viento justo',headline:'APENAS',line:'igual sale.',bg:'#ffda32',ink:'#27291f',wind:'8',gust:'16',trend:'Sube',time:'En 1 h',light:'19:29',copy:'Con uno liviano puede andar. Con cola, espera un poco más.',pose:[192,122,-18,.76],why:'Amarillo solar para viento justo. El mensaje APENAS mantiene clara la condición: un color luminoso no promete buen vuelo.',posture:'Más bajo, hilo con caída, cola suelta.'},
 plancha:{label:'Falta viento',headline:'NO ANDA',line:'ni un soplo.',bg:'#f2dfb2',ink:'#27291f',wind:'3',gust:'6',trend:'Igual',time:'Sin tramo',light:'19:29',copy:'Falta viento por ahora. El volantín descansa.',pose:[173,185,-66,.8],why:'Calma en un neutro claro. No hay razón para que poco viento y peligro compartan la misma pantalla negra.',posture:'En reposo, hilo flojo. No aparece volando.'},
 bravo:{label:'Rachas fuertes',headline:'BRAVO',line:'agárralo firme.',bg:'#ff9743',ink:'#27291f',wind:'26',gust:'35',trend:'Sube',time:'Mejor espera',light:'19:29',copy:'Va con tirones. Mejor espera a que baje.',pose:[220,95,28,.82],why:'Naranja intenso para las rachas. La fuerza visual acompaña la precaución y el texto indica que conviene esperar.',posture:'Inclinado, hilo tenso y cola desplazada.'},
 peligro:{label:'No encumbres',headline:'NO SALGAS',line:'en serio.',bg:'#c83236',ink:'#faf7ee',wind:'46',gust:'53',trend:'Sube',time:'No encumbres',light:'19:29',copy:'No encumbres con estas rachas. Mantén el volantín guardado.',pose:[182,190,-62,.82],why:'Rojo reservado a peligro, acompañado por una orden explícita. El volantín queda recogido: la ilustración no invita a hacer lo contrario.',posture:'Recogido, cola enrollada, hilo sin tensión.'},
 noche:{label:'Sin luz',headline:'POR HOY',line:'hasta aquí.',bg:'#252821',ink:'#f7f5ef',wind:'12',gust:'17',trend:'Baja',time:'Sin luz',light:'Terminó',copy:'Ya no queda luz. Revisa las condiciones antes de salir mañana.',pose:[182,190,-62,.82],why:'Carbón para noche, no para castigar un día sin viento. La falta de luz prevalece sobre que el viento sea favorable.',posture:'Guardado aunque haya viento. La escena descansa.'},
 'sin-datos':{label:'Sin datos',headline:'SIN DATOS',line:'por ahora.',bg:'#f9f4e6',ink:'#27291f',wind:'—',gust:'—',trend:'—',time:'Sin dato',light:'Sin dato',copy:'No llegó el pronóstico. No podemos decir si conviene salir.',pose:[182,190,-62,.82],why:'Ausencia de datos no significa poco viento. No inventamos una condición ni una postura de vuelo.',posture:'Sin vuelo. Datos vacíos y mensaje honesto.'}
};
// Hue categories keep their meaning; each direction tunes saturation and temperature.
const scenePalettes = {
 coral: ['#18764f','#ffda32','#f2dfb2','#ff9743','#c83236','#252821','#f9f4e6'],
 mandarina: ['#237a56','#ffce33','#f3e2bb','#ff8544','#be293d','#232b27','#f7f4e9'],
 solar: ['#287348','#ffc937','#f6e5ba','#ff9938','#c72f27','#29271f','#faf5e4'],
 carbon: ['#176d52','#ffe239','#ede1bd','#ff8847','#bc263a','#232720','#f7f5eb']
};
function applySceneColors() {
 Object.keys(states).forEach((id,i)=>{
  states[id].bg=scenePalettes[palette.id][i];
  states[id].ink=['ideal','peligro','noche'].includes(id)?'#faf7ee':'#27291f';
 });
 document.documentElement.style.setProperty('--good-bg',states.ideal.bg);
 document.documentElement.style.setProperty('--good-ink',states.ideal.ink);
 document.querySelectorAll('.scene-palette-options').forEach(el=>{
  el.innerHTML=palettes.map(p=>`<button data-palette="${p.id}" aria-pressed="${p.id===palette.id}"><span style="background:${scenePalettes[p.id][0]}"></span><span style="background:${p.accent}"></span>${p.name}${p.id===palette.id?' · elegida':''}</button>`).join('');
 });
}
const kiteDesigns = [
 {id:'mate',name:'Atmósfera mate',tag:'Nueva dirección',paper:'#f8f7f2',colors:['#dfe9df','#a3bca8','#287348'],tail:'#91aa96',description:'Grano visible en el cielo y la vela. Color integrado, sin reflejos ni borde brillante.'},
 {id:'tonal',name:'Papel a contraluz',tag:'Prueba de textura',paper:'#f8f7f2',colors:['#dbe5ce','#86a58b','#287348'],tail:'#66896b',description:'Papel translúcido que toma el tono del cielo. Luz suave y grano compartido entre el fondo y la vela.'},
 {id:'semitono',name:'Papel y semitono',tag:'Nueva propuesta',paper:'#f8f7f2',colors:['#252520','#f45138','#f8f7f2'],tail:'#f45138',description:'Vela hueso, una curva de tinta que se disuelve en puntos y lazos bermellón. El mismo papel sobre cualquier cielo.'},
 {id:'paneles',name:'Paneles de color',tag:'Primera referencia',paper:'#fbf5e4',colors:['#27978d','#edc441','#e54c40','#ce647f'],tail:'#d94e43',description:'Cuatro paños que se encuentran cerca del tirante. Laterales curvos y punta inferior larga.'},
 {id:'arcos',name:'Naranja con arcos',tag:'Diseño elegido',paper:'#fbf5e4',colors:['#f36d24','#ffae27','#df4f20'],tail:'#dc592d',description:'Una vela naranja con arcos dorados. Un dibujo propio, sencillo y sin emblemas.'},
 {id:'papeles',name:'Papeles cálidos',tag:'Variante multicolor',paper:'#fbf5e4',colors:['#ecae47','#cb607e','#368d78','#ed7850'],tail:'#cb607e',description:'Damasco, rosa, jade y coral en paños amplios. Color fijo en todos los estados.'}
];
let selectedDesign='mate',kiteInstance=0,textureMode='grain',weatherMode='sol';
let palette=palettes[0], selectedState='ideal',profile='cola',skyMode='semantic',clusterStyle='label',mapExpanded=false,appTab='salida',appHour=1;
const brandMarkup=[['e',66],['n',70],['c',78],['u',92],['m',122],['b',125],['r',92],['a',70]].map(([c,w])=>`<span style="font-variation-settings:'wdth' ${w},'wght' 900">${c}</span>`).join('')+'<i aria-hidden="true"></i>';
function brands(){document.querySelectorAll('.brand').forEach(el=>{el.innerHTML=brandMarkup;if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label','Encumbra');});}
function luminance(hex){const a=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return ((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(1);}
function applyPalette(id){palette=palettes.find(p=>p.id===id)||palettes[0];applySceneColors();for(const key of ['accent','bone','ink','soft'])document.documentElement.style.setProperty('--'+key,palette[key]);document.documentElement.style.setProperty('--accent2',palette.second);document.documentElement.style.setProperty('--cta',palette.button||palette.accent);document.documentElement.style.setProperty('--cta-ink',palette.buttonInk||palette.ink);renderPalettes();renderApp();renderFlight();renderGallery();document.getElementById('landing-kite').innerHTML=kiteSvg('ideal','cola',selectedDesign,palette.ink);brands();}
function renderPalettes(){document.getElementById('palette-grid').innerHTML=palettes.map(p=>`<button class="palette-card" data-palette="${p.id}" aria-pressed="${p.id===palette.id}" style="--paper:${p.bone};--button:${p.button||p.accent};--button-ink:${p.buttonInk||p.ink}"><span class="palette-tag">${p.id===palette.id?'Elegida · ':''}${p.tag}</span><h3>${p.name}</h3><p>${p.description}</p><span class="swatches" aria-hidden="true">${[p.bone,p.ink,p.accent,p.second].map(c=>`<span style="background:${c}"></span>`).join('')}</span><code>${p.accent.toUpperCase()} · ${p.bone.toUpperCase()}</code><span class="palette-mini-button">Ver los parques ↗</span><span class="palette-contrast">Texto de botón · ${contrast(p.buttonInk||p.ink,p.button||p.accent)}:1</span></button>`).join('');document.getElementById('selected-name').textContent=palette.name;document.getElementById('selected-reason').textContent=palette.reason;}
// One transformed knot is the endpoint for both bridle and line.
// The curved kite sail, bowed spar and attached tail bows are authored vector geometry.
function tint(a,b,t) {
 const rgb=c=>c.slice(1).match(/../g).map(v=>parseInt(v,16));
 return '#'+rgb(a).map((v,i)=>Math.round(v*(1-t)+rgb(b)[i]*t).toString(16).padStart(2,'0')).join('');
}
function kiteSvg(stateId,model=profile,designId=selectedDesign,backdrop=sky(stateId).bg) {
 const st=states[stateId],design=kiteDesigns.find(d=>d.id===designId)||kiteDesigns[0];
 const [x,y,angle,scale]=st.pose,rad=angle*Math.PI/180;
 const resting=['plancha','peligro','noche','sin-datos'].includes(stateId);
 const stored=['peligro','noche','sin-datos'].includes(stateId);
 const threadColor=luminance(backdrop)<.3?'#ebe5d6':'#56594c';
 const knotY=model==='delta'?30:15,knotX=model==='delta'?-24:0;
 const point=(px,py)=>({x:x+(px*Math.cos(rad)-py*Math.sin(rad))*scale,y:y+(px*Math.sin(rad)+py*Math.cos(rad))*scale});
 const end=point(knotX,knotY),secondEnd=point(24,30);
 const stringPath=resting?`M52 273 C88 292 105 244 ${end.x} ${end.y}`:stateId==='liviano'?`M52 286 Q132 270 ${end.x} ${end.y}`:`M52 286 Q142 201 ${end.x} ${end.y}`;
 const silhouette=model==='delta'?'M0 -72 -96 60 0 30 96 60Z':'M0 -90 Q34 -48 82 -18 Q30 38 0 120 Q-30 38 -82 -18 Q-34 -48 0 -90Z';
 const clipId=`paper-cut-${++kiteInstance}`;
 const mate=design.id==='mate';
 const tonal=design.id==='tonal'||mate;
 const paperLight=tint(backdrop,'#f8f7e8',.76),paperShade=tint(backdrop,'#252520',.18);
 const rib=tonal?tint(backdrop,'#252520',.52):'#b39d73';
 const gradient=tonal?`<linearGradient id="${clipId}-light" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${paperLight}"/><stop offset=".48" stop-color="${tint(backdrop,'#f8f7e8',.48)}"/><stop offset="1" stop-color="${paperShade}"/></linearGradient>`:'';

 const panelPrint=`<path d="M0 -90 82 -18 0 -12Z" fill="${design.colors[0]}"/><path d="M82 -18 0 120 0 -12Z" fill="${design.colors[1]}"/><path d="M0 120 -82 -18 0 -12Z" fill="${design.colors[2]}"/><path d="M-82 -18 0 -90 0 -12Z" fill="${design.colors[3]||design.colors[0]}"/>`;
 // A single curved ink field fades through spaced, size-varying dots.
 // Coarse spacing keeps the print readable in the smallest gallery previews.
 let halftone='';
 if(design.id==='semitono') {
  for(let row=0;row<36;row++) {
   const cy=-96+row*6;
   const edge=-35+24*Math.sin((cy+60)/62);
   for(let col=0;col<35;col++) {
    const cx=-102+col*6+(row%2)*3;
    const density=Math.max(0,Math.min(1,(edge+43-cx)/43));
    if(density>.12 && cx>edge-5) halftone+=`<circle cx="${cx}" cy="${cy}" r="${(2.65*density).toFixed(2)}"/>`;
   }
  }
  const inkEdge=Array.from({length:115},(_,i)=>{const y=-96+i*2;return `${-35+24*Math.sin((y+60)/62)} ${y}`;});
  halftone=`<g fill="#252520"><path d="M-110 -96 L${inkEdge.join(' L')} L-110 132Z"/>${halftone}</g>`;
 }
 const print=tonal?`<path d="${silhouette}" fill="url(#${clipId}-light)"/><path d="M0 -90 0 120 -82 -18Z" fill="${paperLight}" opacity=".15"/>`:design.id==='semitono'?halftone:design.id==='arcos'?`<path d="${silhouette}" fill="${design.colors[0]}"/><path d="M-110 -65 0 -12 -24 145H-110Z" fill="${design.colors[2]}"/><circle cx="30" cy="95" r="47" fill="none" stroke="${design.colors[1]}" stroke-width="17"/><circle cx="30" cy="95" r="79" fill="none" stroke="${design.colors[1]}" stroke-width="12"/>`:panelPrint;
 // Bows are sampled from the exact tail Béziers, including their tangent.
 const curves=stored?[[[0,120],[30,123],[32,143],[12,144]],[[12,144],[-5,146],[-13,132],[2,133]]]:[[[0,120],[-24,132],[46,148],[22,165]],[[22,165],[2,181],[-36,191],[-10,205]]];
 const tailPath=curves.map((c,i)=>`${i===0?`M${c[0].join(' ')} `:''}C${c.slice(1).map(p=>p.join(' ')).join(' ')}`).join(' ');
 const bowAt=(segment,t,color)=>{
  const c=curves[segment],u=1-t;
  const pos=[0,1].map(i=>u*u*u*c[0][i]+3*u*u*t*c[1][i]+3*u*t*t*c[2][i]+t*t*t*c[3][i]);
  const tangent=[0,1].map(i=>3*u*u*(c[1][i]-c[0][i])+6*u*t*(c[2][i]-c[1][i])+3*t*t*(c[3][i]-c[2][i]));
  const rotation=Math.atan2(tangent[1],tangent[0])*180/Math.PI-90;
  return `<g transform="translate(${pos[0]} ${pos[1]}) rotate(${rotation})"><path d="M0 0 Q-8 -8 -14 -6 Q-11 0 -14 6 Q-6 7 0 0 Q8 -7 14 -6 Q11 0 14 6 Q6 7 0 0Z" fill="${tonal?paperLight:color}" stroke="${tonal?paperShade:design.paper}" stroke-width=".5"/><path d="M-1 -2 1 2" stroke="${design.tail}" stroke-width="1.5"/></g>`;
 };
 const ribbon=`<path d="${tailPath}" fill="none" stroke="${threadColor}" stroke-width="1.3"/>${bowAt(0,.4,design.id==='semitono'?design.tail:design.colors[0])}${stored?'':bowAt(0,.95,design.colors[1])}${bowAt(1,.8,design.id==='semitono'?design.tail:design.colors[2])}`;
 const spar=model==='delta'?'M0 -72V30M-96 60 0 30 96 60':'M0 -90V120M-82 -18Q0 -36 82 -18';
 const bridle=model==='delta'?'M-24 30 0 25 24 30':'M-24 -25 0 15 24 -25M0 15V47';
 return `<svg viewBox="0 0 360 300" role="img" aria-label="${design.name}, ${model==='delta'?'acrobático':model==='papel'?'papel liviano':'con cola'}: ${posture(stateId,model)}"><defs><clipPath id="${clipId}"><path d="${silhouette}"/></clipPath>${gradient}</defs>${resting?`<path d="M100 273 Q225 279 314 272" fill="none" stroke="${threadColor}" opacity=".3"/>`:''}<path d="${stringPath}" fill="none" stroke="${threadColor}" stroke-width="1.2"/>${model==='delta'?`<path d="M64 288 Q158 225 ${secondEnd.x} ${secondEnd.y}" fill="none" stroke="${threadColor}" stroke-width="1"/>`:''}<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${model==='cola'?ribbon:''}<path d="${silhouette}" fill="${tonal?backdrop:design.paper}" stroke="${tonal?paperLight:design.paper}" stroke-width="${tonal?.6:3.5}"/><g class="kite-print" data-design="${design.id}" clip-path="url(#${clipId})">${print}</g><path d="${silhouette}" fill="none" stroke="${tonal?paperShade:'#30322b'}" stroke-width="${tonal?.65:.85}"/><path d="${spar}" fill="none" stroke="${rib}" stroke-width="1.15"/><path d="${bridle}" fill="none" stroke="#494a40" stroke-width=".9"/><circle cx="${knotX}" cy="${knotY}" r="1.7" fill="#494a40"/>${model==='delta'?'<circle cx="24" cy="30" r="1.7" fill="#494a40"/>':''}</g></svg>`;
}
function renderKiteDesigns() {
 document.getElementById('kite-designs').innerHTML=kiteDesigns.map(d=>`<button data-kite-design="${d.id}" class="kite-design-card" aria-pressed="${selectedDesign===d.id}"><span>${d.tag}${selectedDesign===d.id?' · elegido':''}</span><div class="kite-design-art ${['tonal','mate'].includes(d.id)?'paper-atmosphere':''}" style="--sky:#287348">${kiteSvg('ideal','cola',d.id,['tonal','mate'].includes(d.id)?'#287348':'#f7f5ef')}</div><h4>${d.name}</h4><p>${d.description}</p><span class="kite-design-colors">${[d.paper,...d.colors].map(c=>`<i style="background:${c}"></i>`).join('')}${['tonal','mate'].includes(d.id)?'Tono tomado del fondo':'Colores propios y fijos'}</span></button>`).join('');
}
function chooseKiteDesign(id) {
 if(!kiteDesigns.some(d=>d.id===id))return;
 selectedDesign=id;document.getElementById('landing-kite').parentElement.classList.toggle('paper-atmosphere',['tonal','mate'].includes(id));renderKiteDesigns();renderFlight();renderGallery();
 document.getElementById('landing-kite').innerHTML=kiteSvg('ideal','cola',selectedDesign,palette.ink);
 document.getElementById('kite-design-summary').textContent=['tonal','mate'].includes(id)?'Prueba mate: cada estado conserva su color y el papel toma ese tono. Sol o nubes solo modulan la luz; puedes comparar con grano o sin él. Sol de septiembre + Atmósfera mate con grano fino es el diseño aplicado al sitio.':`${kiteDesigns.find(d=>d.id===id).name}: el papel conserva este diseño en las cuatro paletas y los siete estados.`;
}
function posture(id, model=profile) {
 if(model==='cola') return states[id].posture;
 const thread=model==='delta'?'Dos hilos unidos a sus tirantes.':'Hilo unido al tirante, sin cola.';
 if(['peligro','noche'].includes(id)) return 'En reposo, '+(model==='delta'?'ambos hilos flojos.':'hilo flojo.');
 if(id==='sin-datos') return 'Sin vuelo. Datos vacíos y mensaje honesto.';
 if(id==='plancha') return 'En reposo. '+thread;
 if(id==='bravo') return 'Inclinado, '+(model==='delta'?'dos hilos tensos.':'hilo tenso.');
 if(id==='liviano') return 'Más bajo. '+thread;
 return 'Arriba. '+thread;
}
function sky(id){
 const st=states[id];
 return {bg:skyMode==='semantic'?st.bg:palette.bone,ink:skyMode==='semantic'?st.ink:palette.ink};
}
function renderFlight(){document.documentElement.dataset.texture=textureMode;document.documentElement.dataset.weather=weatherMode;const st=states[selectedState],s=sky(selectedState);const el=document.getElementById('flight-phone');el.classList.toggle('paper-atmosphere',['tonal','mate'].includes(selectedDesign));el.style.setProperty('--sky',s.bg);el.style.setProperty('--sky-ink',s.ink);el.style.setProperty('--semantic-bg',st.bg);el.style.setProperty('--semantic-ink',st.ink);el.innerHTML=`<header class="flight-header"><span class="brand"></span><span>${selectedState==='sin-datos'?'Sin actualización':'Hace 2 min'}</span></header><p class="flight-place">Araucano · Las Condes<small>${profile==='cola'?'Volantín con cola':profile==='papel'?'Volantín de papel liviano':'Volantín acrobático'}</small></p><div class="flight-art">${kiteSvg(selectedState)}</div><div class="flight-answer">${skyMode==='neutral'||selectedDesign==='mate'?`<span class="flight-status">${st.label}</span>`:''}<h3>${st.headline}<span class="outline">${st.line}</span></h3><p>${st.copy}</p></div><dl class="flight-metrics"><div><dt>VIENTO</dt><dd>${st.wind}${st.wind!=='—'?'<small> km/h</small>':''}</dd></div><div><dt>RACHAS</dt><dd>${st.gust}${st.gust!=='—'?'<small> km/h</small>':''}</dd></div><div><dt>EN 60 MIN</dt><dd>${st.trend}</dd></div></dl><div class="flight-limits"><div><small>${selectedState==='noche'?'Por hoy':'Viento'}</small><strong>${st.time}</strong></div><div><small>Luz</small><strong>${st.light}</strong></div></div><button class="flight-back" id="back-to-app">Volver a planear</button>`;document.getElementById('flight-reason-title').textContent=st.label;document.getElementById('flight-reason').textContent=['tonal','mate'].includes(selectedDesign)?'El color y la postura expresan el estado: verde hoja para buen viento, amarillo para viento justo, arena para calma, naranja para rachas y rojo para peligro. Sol o nubes solo cambian la luz de la superficie, sin sustituir esos colores. El grano es un acabado gráfico, no representa lluvia ni fuerza del viento.':st.why;document.getElementById('contrast-note').textContent=`${['tonal','mate'].includes(selectedDesign)?'Contraste con el fondo base, sin incluir textura: ' : 'Texto principal / fondo: '} ${contrast(s.ink,s.bg)}:1. Texto de viento / pastilla: ${contrast(palette.bone,palette.ink)}:1.`;brands();}
function renderGallery(){document.getElementById('state-gallery').innerHTML=Object.entries(states).map(([id,st])=>{const s=sky(id);return `<button class="state-card ${['tonal','mate'].includes(selectedDesign)?'paper-atmosphere':''}" data-state="${id}" aria-pressed="${id===selectedState}" style="--sky:${s.bg};--sky-ink:${s.ink}"><strong>${st.label}</strong><span class="state-art">${kiteSvg(id)}</span><h4>${st.headline}</h4><p>${posture(id)}</p><small class="state-colors">${s.bg.toUpperCase()} · ${['tonal','mate'].includes(selectedDesign)?'base':'texto'} ${contrast(s.ink,s.bg)}:1</small></button>`;}).join('');}
const hourStates=['liviano','ideal','ideal','bravo'];
function renderApp(){const content=document.getElementById('app-content');const actions=document.getElementById('app-actions');actions.hidden=appTab!=='salida';actions.innerHTML=appTab==='salida'?'<a href="#mapas">Cómo llegar ↗</a><a href="#volantines">Ya estoy afuera ↗</a>':'';document.querySelectorAll('.app-tabs [data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===appTab)));if(appTab==='salida'){const st=states[hourStates[appHour]];content.innerHTML=`<h3>Araucano</h3><p class="park-subtitle">Las Condes</p><article class="weather-panel" style="--state-bg:${st.bg};--state-ink:${st.ink}"><div class="now-row"><span>${appHour===0?'Ahora':['','15:00','16:00','17:00'][appHour]}</span><span>Pronóstico</span></div><h4>${st.label}</h4><p>${st.copy}</p><dl><div><dt>Viento</dt><dd>${st.wind}<small>km/h</small></dd></div><div><dt>Rachas</dt><dd>${st.gust}<small>km/h</small></dd></div><div><dt>Lluvia</dt><dd>0<small>%</small></dd></div></dl></article><h5>Elige tu momento</h5><div class="time-options" aria-label="Hora del ejemplo">${['Ahora','15:00','16:00','17:00'].map((h,i)=>`<button data-hour="${i}" aria-pressed="${i===appHour}">${h}<strong>${states[hourStates[i]].wind}</strong>km/h</button>`).join('')}</div><p class="park-subtitle" style="margin-top:16px">Actualizado hace 2 min · Open-Meteo</p>`;}else if(appTab==='parques'){content.innerHTML=`<h3>El cielo es tuyo.</h3><p class="park-subtitle">Encuentra tu parque para encumbrar.</p><div class="search-demo">Parque o comuna</div><div class="tiny-map"><span class="cluster label">5 parques</span></div><h5>Explora los parques</h5>${['Araucano','Bicentenario','De la Familia'].map((n,i)=>`<div class="mock-park"><b>${i+1}</b><span><strong>${n}</strong><small>${i?'Viento justo · 8 km/h':'Buen viento · 14 km/h'}</small></span></div>`).join('')}`;}else{content.innerHTML=`<h3>Antes de soltar hilo</h3><h5>¿Cuál llevas?</h5>${[['papel','Papel liviano'],['cola','Con cola'],['delta','Acrobático']].map(([id,name])=>`<label class="mock-profile"><input type="radio" name="app-profile" value="${id}" ${profile===id?'checked':''}><strong>${name}</strong></label>`).join('')}<h5>Una última mirada</h5>${['Hilo sin curar y carrete en buen estado','Espacio abierto, lejos de cables y calles','Agua, protección solar y tiempo para volver'].map(t=>`<label class="mock-profile"><input type="checkbox">${t}</label>`).join('')}`;}}
function clusterMarkup(n){return `<span class="cluster ${clusterStyle}">${clusterStyle==='label'?n+' parques':n}</span>`;}
function renderMap(){document.querySelectorAll('[data-cluster]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cluster===clusterStyle)));const points=mapExpanded?[[26,52,'Araucano'],[39,60,'Bicentenario'],[50,40,'San Cristóbal'],[62,63,'De la Familia'],[75,45,'Mahuidahue']]:[[32,53,5],[69,65,3]];document.getElementById('map-markers').innerHTML=points.map(([x,y,n],i)=>`<button class="map-marker ${mapExpanded?'single-marker':''}" style="left:${x}%;top:${y}%" ${mapExpanded?`data-park="${n}" aria-pressed="false" aria-label="Ver ${n}"`:`data-expand aria-label="Acercar grupo de ${n} parques"`}>${mapExpanded?i+1:clusterMarkup(n)}</button>`).join('');document.getElementById('map-instruction').textContent=mapExpanded?'Cinco parques separados · toca uno para seleccionarlo':'Toca un grupo para ver sus parques';}
function renderNavSamples(){const markup=document.querySelector('.app-tabs').innerHTML.replaceAll('data-tab=','data-nav-sample=').replaceAll('aria-pressed="true"','aria-pressed="false"');document.querySelectorAll('.nav-mini').forEach(n=>{n.innerHTML=markup;n.querySelector('[data-nav-sample="salida"]').setAttribute('aria-pressed','true');});}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.kiteDesign)chooseKiteDesign(b.dataset.kiteDesign);if(b.dataset.palette)applyPalette(b.dataset.palette);if(b.dataset.tab){appTab=b.dataset.tab;renderApp();}if(b.dataset.hour!==undefined){appHour=Number(b.dataset.hour);renderApp();}if(b.dataset.cluster){clusterStyle=b.dataset.cluster;renderMap();}if(b.hasAttribute('data-expand')){mapExpanded=true;renderMap();}if(b.id==='map-reset'){mapExpanded=false;renderMap();}if(b.dataset.park){document.querySelectorAll('[data-park]').forEach(p=>p.setAttribute('aria-pressed',String(p===b)));document.getElementById('map-instruction').textContent=b.dataset.park+' seleccionado · ejemplo';}if(b.dataset.navSample){document.querySelectorAll('[data-nav-sample]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.navSample===b.dataset.navSample)));}if(b.dataset.state){selectedState=b.dataset.state;document.getElementById('flight-state').value=selectedState;renderFlight();renderGallery();document.getElementById('flight-phone').scrollIntoView({block:'center'});}if(b.id==='back-to-app'){document.getElementById('app-demo').scrollIntoView({block:'start'});}});
document.addEventListener('change',e=>{if(e.target.id==='texture-mode'){textureMode=e.target.value;renderFlight();renderGallery();}if(e.target.id==='weather-mode'){weatherMode=e.target.value;renderFlight();renderGallery();}if(e.target.id==='flight-state'){selectedState=e.target.value;renderFlight();renderGallery();}if(e.target.id==='kite-profile'||e.target.name==='app-profile'){profile=e.target.value;document.getElementById('kite-profile').value=profile;renderFlight();renderGallery();if(appTab==='guia')renderApp();}if(e.target.name==='sky-mode'){skyMode=e.target.value;renderFlight();renderGallery();}});
applyPalette('solar');renderMap();renderNavSamples();chooseKiteDesign('mate');
