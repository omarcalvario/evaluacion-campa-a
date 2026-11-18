/*
 * CONFIGURACIÓN: agrega tus piezas gráficas en este arreglo.
 * Ejemplo: { id:'pieza-1', name:'Ciencias de la Salud', image:'assets/salud.webp' }
 * Si no hay imagen, la encuesta muestra una tarjeta de referencia.
 */
const PROPOSALS = [
  { id:'imagen-1', name:'Propuesta 1', image:'propuestas correctas/imagen1.webp', category:'Propuestas correctas' },
  { id:'imagen-1-1', name:'Propuesta 2', image:'propuestas correctas/imagen1-1.jpg', category:'Propuestas correctas' },
  { id:'imagen-2', name:'Propuesta 3', image:'propuestas correctas/imagen2.webp', category:'Propuestas correctas' },
  { id:'imagen-2-1', name:'Propuesta 4', image:'propuestas correctas/imagen2-1.jpg', category:'Propuestas correctas' },
  { id:'imagen-3', name:'Propuesta 5', image:'propuestas correctas/imagen3.webp', category:'Propuestas correctas' },
  { id:'imagen-3-1', name:'Propuesta 6', image:'propuestas correctas/imagen3-1.jpg', category:'Propuestas correctas' },
  { id:'comparativo-1', name:'Comparativa 1', image:'comparativas/Vistas-comparativo1.webp', category:'Comparativas' },
  { id:'comparativo-2', name:'Comparativa 2', image:'comparativas/Vistas-comparativo2.webp', category:'Comparativas' }
];
const STORAGE_KEY = 'uvp_experiencias_respuestas_v1';
const DRAFT_KEY = 'uvp_experiencias_borrador_v1';
const steps = ['profile', 'impression', 'connection', 'effectiveness'];
function activeSteps(){ return selectionPhase==='comparative' ? ['comparative-question'] : steps; }
let currentStep = 0;
let answers = loadDraft() || { proposals: {} };
let selectedProposalId = answers.selectedProposalId || null;
let selectionPhase = answers.selectionPhase || 'proposal';

const $ = (selector) => document.querySelector(selector);
const show = (name) => {
  document.querySelectorAll('[data-screen]').forEach(el => el.classList.toggle('hidden', el.dataset.screen !== name));
  const home=$('#step-home-fixed'), panel=document.querySelector(`[data-screen="${name}"]`);
  if(panel) panel.prepend(home);
  home.classList.toggle('hidden',name==='welcome'||name==='admin');
};
function renderProposalGrid(){
  const groups=selectionPhase==='proposal'?['Propuestas correctas']:['Comparativas'];
  const kicker=document.querySelector('.select-proposal .eyebrow');
  const title=document.querySelector('.select-proposal h2');
  const intro=document.querySelector('.select-proposal .selection-intro');
  kicker.textContent=selectionPhase==='proposal'?'Paso 1 · Elige una pieza':'Paso 3 · Elige una comparativa';
  title.textContent=selectionPhase==='proposal'?'¿Qué propuesta te atrae más?':'¿Qué comparativa quieres evaluar?';
  intro.textContent=selectionPhase==='proposal'
    ?'Elige una propuesta. Después responderás un cuestionario sobre la imagen seleccionada.'
    :'Ya evaluaste una propuesta. Ahora elige una de las dos comparativas y responde nuevamente el cuestionario.';
  $('#proposal-grid').innerHTML=groups.map(group=>{
    const items=PROPOSALS.filter(p=>p.category===group);
    return `<section class="proposal-group">${group==='Comparativas'?`<h3>${group}</h3>`:''}<div class="proposal-subgrid">${items.map(p=>`<button class="proposal-choice" type="button" data-proposal="${p.id}"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}"><span>${escapeHtml(p.name)}</span><small>Seleccionar esta pieza →</small></button>`).join('')}</div></section>`;
  }).join('');
  document.querySelectorAll('.proposal-choice').forEach(btn=>btn.onclick=()=>{selectedProposalId=btn.dataset.proposal;answers.selectedProposalId=selectedProposalId;answers.selectionPhase=selectionPhase;saveDraft();currentStep=0;show('survey');renderStep();});
}

function loadDraft(){ try{return JSON.parse(localStorage.getItem(DRAFT_KEY));}catch(e){return null;} }
function saveDraft(){ localStorage.setItem(DRAFT_KEY, JSON.stringify(answers)); }
function optionGroup(name, options, type='radio', selected='') {
  return `<div class="options ${type === 'radio-scale' ? 'scale' : ''}">${options.map((option,i)=>{
    const value = typeof option === 'string' ? option : option.value, label = typeof option === 'string' ? option : option.label;
    const id = `${name}-${i}`; return `<div class="option"><input id="${id}" type="${type === 'checkbox' ? 'checkbox':'radio'}" name="${name}" value="${escapeHtml(value)}" ${Array.isArray(selected)&&selected.includes(value)?'checked':''} ${selected===value?'checked':''}><label for="${id}">${label}</label></div>`;
  }).join('')}</div>`;
}
function field(label, name, options, selected){ return `<div class="question"><span class="question-label">${label}</span>${optionGroup(name,options,'radio',selected||'')}</div>`; }
function checkboxField(label,name,options,selected=[]){return `<div class="question"><span class="question-label">${label}</span>${optionGroup(name,options,'checkbox',selected||[])}</div>`;}
function ageSelectField(label,name,value='',min=14,max=100){return `<div class="question"><label class="question-label" for="${name}">${label}</label><select class="text-input select-input" id="${name}" name="${name}"><option value="">Selecciona tu edad</option>${Array.from({length:max-min+1},(_,i)=>String(min+i)).map(age=>`<option value="${age}" ${String(value)===age?'selected':''}>${age} años</option>`).join('')}</select></div>`;}
function textField(label,name,value=''){return `<div class="question"><label class="question-label" for="${name}">${label}</label><textarea class="text-area" id="${name}" name="${name}" maxlength="1000">${escapeHtml(value)}</textarea></div>`;}
function scaleField(label,name,value){return `<div class="question"><span class="question-label">${label}</span>${optionGroup(name,['1','2','3','4','5'],'radio-scale',value||'')}<div class="scale-caption"><span>1 · Nada</span><span>5 · Mucho</span></div></div>`;}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function renderStep(){
  const flow=activeSteps(), id=flow[currentStep], content=$('#step-content'); let html='';
  $('#step-number').textContent=currentStep+1; $('#step-total').textContent=flow.length; $('#progress-bar').style.width=`${((currentStep+1)/flow.length)*100}%`;
  const proposal=PROPOSALS.find(item=>item.id===selectedProposalId)||PROPOSALS[0], p=answers.proposals[proposal.id]||{};
  const proposalVisual=`<div class="visual-card"><img src="${escapeHtml(proposal.image)}" alt="${escapeHtml(proposal.name)}"></div>`;
  if(id==='profile') { $('#section-kicker').textContent='Tu perfil'; $('#section-title').textContent='Conocerte nos ayuda'; html=ageSelectField('1. ¿Qué edad tienes?','age',answers.age)+field('2. ¿Cuál opción describe mejor tu situación actual?','situation',['Estudio preparatoria','Estoy buscando universidad','Soy madre, padre o tutor','Otro'],answers.situation); }
  if(id==='comparative-question') {
    const choices=proposal.id==='comparativo-1'
      ? ['POV / Rompe la cuarta pared','Contrapicado / Liderazgo','Cenital / Dinamismo','Ángulo holandés / Energía','Primer plano / Conexión','Plano completo / Proyección','3/4 posterior / Seguridad','Plano entero / Cercanía']
      : ['Vida universitaria','Ciencias de la vida','Ingenierías','Salud','Artes','Negocios'];
    $('#section-kicker').textContent=proposal.name;
    $('#section-title').textContent='¿Qué imagen se te hace más atractiva?';
    html=`${proposalVisual}${checkboxField('Puedes elegir varias opciones.','comparativeChoices',choices,p.comparativeChoices||[])}`;
  }
  if(id==='impression') { $('#section-kicker').textContent='Primera impresión'; $('#section-title').textContent='Mira antes de responder'; html=`${proposalVisual}${checkboxField('3. ¿Qué es lo primero que llama tu atención de esta imagen?','firstAttention',['Colores','Fotografía','Textos','Personajes'],p.firstAttention||[])}${field('4. ¿Qué piensas al ver esta imagen?','message',['Liderazgo','Aspiración','Genérico o irrelevante','Ninguna de las anteriores'],p.message)}${scaleField('5. ¿Qué tan atractiva te parece visualmente?','attractiveness',p.attractiveness)}`; }
  if(id==='connection') { $('#section-kicker').textContent='Conexión emocional'; $('#section-title').textContent='¿Qué te hace sentir?'; html=`${proposalVisual.replace('visual-card','visual-card visual-card-compact')}${checkboxField('6. ¿Qué emociones o sensaciones te transmite esta imagen?','emotions',['Confianza','Sentido de pertenencia','Indiferencia','Confusión','Otra'],p.emotions||[])}<div class="question other-answer ${p.emotions?.includes('Otra')?'':'hidden'}" id="emotions-other-wrap"><label class="question-label" for="emotionsOther">¿Cuál?</label><input class="text-input" id="emotionsOther" name="emotionsOther" type="text" maxlength="250" value="${escapeHtml(p.emotionsOther||'')}"></div>${scaleField('7. ¿Qué tanto te identificas con lo que muestra esta campaña?','identification',p.identification)}${scaleField('8. ¿Qué tan auténtica o realista te parece la situación?','authenticity',p.authenticity)}`; }
  if(id==='effectiveness') { $('#section-kicker').textContent='Efectividad'; $('#section-title').textContent='Tu opinión final'; html=proposalVisual.replace('visual-card','visual-card visual-card-compact')+scaleField('9. Después de ver esta imagen, ¿qué tanto te interesa conocer más sobre la universidad?','interest',p.interest)+textField('10. ¿De qué universidad recuerdas haber visto publicidad recientemente?','recentUniversityAd',p.recentUniversityAd)+textField('11. ¿Qué te atrajo de esa publicidad?','adAttraction',p.adAttraction); }
  content.innerHTML=html; $('#back-button').style.visibility=currentStep||selectionPhase==='comparative'?'visible':'hidden'; $('#next-button').innerHTML=currentStep===activeSteps().length-1?'Enviar respuesta <span>✓</span>':'Continuar <span>→</span>'; window.scrollTo({top:0,behavior:'smooth'});
}
function readStep(){
  const data={}; document.querySelectorAll('#step-content input:checked, #step-content input[type=number], #step-content input[type=text], #step-content textarea, #step-content select').forEach(el=>{if(el.type==='checkbox'){data[el.name]=data[el.name]||[];data[el.name].push(el.value);}else data[el.name]=el.value;});
  if(activeSteps()[currentStep]==='profile') Object.assign(answers,data); else answers.proposals[selectedProposalId]=Object.assign(answers.proposals[selectedProposalId]||{},data); saveDraft(); return data;
}
function valid(data){
  const step=activeSteps()[currentStep];
  if(step==='comparative-question'){
    if(!data.comparativeChoices?.length){alert('Selecciona al menos una opción.');return false;}
    return true;
  }
  const required=step==='profile'?['age','situation']:step==='impression'?['firstAttention','message','attractiveness']:step==='connection'?['emotions','identification','authenticity']:['interest','recentUniversityAd','adAttraction'];
  const missing=required.some(k=>!data[k]||(Array.isArray(data[k])&&!data[k].length)); if(missing){alert('Completa las preguntas para continuar.');return false;} if(step==='profile'&&(!Number.isInteger(Number(data.age))||Number(data.age)<14||Number(data.age)>100)){alert('Ingresa una edad válida entre 14 y 100 años.');return false;} if(step==='connection'&&data.emotions.includes('Otra')&&!data.emotionsOther?.trim()){alert('Especifica cuál emoción o sensación.');return false;} return true;
}
function submit(){
  if(selectionPhase==='proposal'){
    answers.proposalSelection=selectedProposalId;
    selectionPhase='comparative';
    answers.selectionPhase=selectionPhase;
    selectedProposalId=null;
    answers.selectedProposalId=null;
    saveDraft();
    renderProposalGrid();
    show('select');
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  answers.comparativeSelection=selectedProposalId;
  const records=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  const id=`UVP-${Date.now().toString(36).toUpperCase()}`;
  const record={id,createdAt:new Date().toISOString(),...answers,selectedProposalId:answers.proposalSelection,comparativeId:answers.comparativeSelection};
  records.push(record);localStorage.setItem(STORAGE_KEY,JSON.stringify(records)); localStorage.removeItem(DRAFT_KEY); $('#response-code').textContent=id; show('success'); sendToEndpoint(record);
}
function sendToEndpoint(record){const endpoint=window.UVP_ENDPOINT||'';if(endpoint) fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(record)}).catch(()=>{});}
function download(type){
  const records=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  if(!records.length){alert('Todavía no hay respuestas guardadas.');return;}
  let data,ext,mime;
  if(type==='json'){data=JSON.stringify(records,null,2);ext='json';mime='application/json';}
  else{
    const fields=['firstAttention','message','attractiveness','emotions','emotionsOther','identification','authenticity','interest','recentUniversityAd','adAttraction'];
    const headers=['primera_atencion','mensaje_percibido','atractivo','emociones','detalle_otra_emocion','identificacion','autenticidad','interes','universidad_con_publicidad_reciente','que_atrajo_de_publicidad'];
    const rows=records.map(r=>{
      const proposalId=r.proposalSelection||r.selectedProposalId,p=r.proposals[proposalId]||{},c=r.proposals[r.comparativeId]||{};
      const proposal=PROPOSALS.find(x=>x.id===proposalId)||{},comparative=PROPOSALS.find(x=>x.id===r.comparativeId)||{};
      const values=obj=>fields.map(k=>Array.isArray(obj[k])?obj[k].join(' | '):obj[k]||'');
      return [r.id,r.createdAt,proposal.name,comparative.name,r.age,r.situation,...values(p),...values(c),(c.comparativeChoices||[]).join(' | ')].map(csv).join(',');
    });
    data=[['id','fecha','propuesta','comparativa','edad','situacion',...headers.map(h=>`propuesta_${h}`),...headers.map(h=>`comparativa_${h}`),'selecciones_comparativa'].join(','),...rows].join('\n');
    ext='csv';mime='text/csv;charset=utf-8';
  }
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:mime}));a.download=`respuestas-uvp.${ext}`;a.click();URL.revokeObjectURL(a.href);
}
function csv(v=''){return `"${String(v).replace(/"/g,'""')}"`;}

$('.start-button').onclick=()=>{selectionPhase='proposal';answers.selectionPhase=selectionPhase;renderProposalGrid();show('select');};$('#next-button').onclick=()=>{const data=readStep();if(!valid(data))return;if(currentStep<activeSteps().length-1){currentStep++;renderStep();}else submit();};$('#back-button').onclick=()=>{readStep();if(currentStep){currentStep--;renderStep();}else{show('select');renderProposalGrid();}};$('.new-response').onclick=()=>{answers={proposals:{}};selectedProposalId=null;selectionPhase='proposal';show('welcome');};$('#home-from-admin').onclick=()=>{show('welcome');window.scrollTo({top:0,behavior:'smooth'});};$('#download-csv').onclick=()=>download('csv');$('#download-json').onclick=()=>download('json');$('#clear-data').onclick=()=>{if(confirm('¿Borrar todas las respuestas de este navegador?')){localStorage.removeItem(STORAGE_KEY);$('#response-count').textContent='0';}};
  $('#brand-home').onclick=()=>{show('welcome');window.scrollTo({top:0,behavior:'smooth'});};
  $('#step-home-fixed').onclick=()=>{show('welcome');window.scrollTo({top:0,behavior:'smooth'});};
  document.addEventListener('change',e=>{if(e.target.matches('input[type=checkbox][name=emotions]'))$('#emotions-other-wrap')?.classList.toggle('hidden',!document.querySelector('input[name=emotions][value="Otra"]')?.checked);});
