/*
 * CONFIGURACIÓN: agrega tus piezas gráficas en este arreglo.
 * Ejemplo: { id:'pieza-1', name:'Ciencias de la Salud', image:'assets/salud.jpg' }
 * Si no hay imagen, la encuesta muestra una tarjeta de referencia.
 */
const PROPOSALS = [
  { id:'nueva-01', name:'Propuesta 1', image:'assets/nueva-01.jpeg' },
  { id:'nueva-02', name:'Propuesta 2', image:'assets/nueva-02.jpeg' },
  { id:'nueva-03', name:'Propuesta 3', image:'assets/nueva-03.jpeg' },
  { id:'nueva-04', name:'Propuesta 4', image:'assets/nueva-04.png' },
  { id:'nueva-05', name:'Propuesta 5', image:'assets/nueva-05.png' },
  { id:'nueva-06', name:'Propuesta 6', image:'assets/nueva-06.png' },
  { id:'nueva-07', name:'Propuesta 7', image:'assets/nueva-07.png' },
  { id:'nueva-08', name:'Propuesta 8', image:'assets/nueva-08.png' },
  { id:'nueva-09', name:'Propuesta 9', image:'assets/nueva-09.png' },
  { id:'nueva-10', name:'Propuesta 10', image:'assets/nueva-10.png' },
  { id:'nueva-11', name:'Propuesta 11', image:'assets/nueva-11.png' },
  { id:'nueva-12', name:'Propuesta 12', image:'assets/nueva-12.png' },
  { id:'nueva-13', name:'Propuesta 13', image:'assets/nueva-13.png' },
  { id:'nueva-15', name:'Propuesta 14', image:'assets/nueva-15.png' },
  { id:'nueva-16', name:'Propuesta 15', image:'assets/nueva-16.png' },
  { id:'nueva-17', name:'Propuesta 16', image:'assets/nueva-17.png' }
];
const STORAGE_KEY = 'uvp_experiencias_respuestas_v1';
const DRAFT_KEY = 'uvp_experiencias_borrador_v1';
const steps = ['profile', 'impression', 'connection', 'effectiveness'];
let currentStep = 0;
let answers = loadDraft() || { proposals: {} };
let selectedProposalId = answers.selectedProposalId || null;

const $ = (selector) => document.querySelector(selector);
const show = (name) => document.querySelectorAll('[data-screen]').forEach(el => el.classList.toggle('hidden', el.dataset.screen !== name));
function renderProposalGrid(){ $('#proposal-grid').innerHTML=PROPOSALS.map(p=>`<button class="proposal-choice" type="button" data-proposal="${p.id}"><img src="${p.image}" alt="${escapeHtml(p.name)}"><span>${p.name}</span><small>Seleccionar esta pieza →</small></button>`).join(''); document.querySelectorAll('.proposal-choice').forEach(btn=>btn.onclick=()=>{selectedProposalId=btn.dataset.proposal;answers.selectedProposalId=selectedProposalId;saveDraft();currentStep=0;show('survey');renderStep();}); }

function loadDraft(){ try{return JSON.parse(localStorage.getItem(DRAFT_KEY));}catch(e){return null;} }
function saveDraft(){ localStorage.setItem(DRAFT_KEY, JSON.stringify(answers)); }
function optionGroup(name, options, type='radio', selected='') {
  return `<div class="options ${type === 'radio-scale' ? 'scale' : ''}">${options.map((option,i)=>{
    const value = typeof option === 'string' ? option : option.value, label = typeof option === 'string' ? option : option.label;
    const id = `${name}-${i}`; return `<div class="option"><input id="${id}" type="${type === 'checkbox' ? 'checkbox':'radio'}" name="${name}" value="${escapeHtml(value)}" ${Array.isArray(selected)&&selected.includes(value)?'checked':''} ${selected===value?'checked':''}><label for="${id}">${label}</label></div>`;
  }).join('')}</div>`;
}
function field(label, name, options, selected){ return `<div class="question"><span class="question-label">${label}</span>${optionGroup(name,options,'radio',selected||'')}</div>`; }
function textField(label,name,value=''){return `<div class="question"><label class="question-label" for="${name}">${label}</label><textarea class="text-area" id="${name}" name="${name}" maxlength="1000">${escapeHtml(value)}</textarea></div>`;}
function scaleField(label,name,value){return `<div class="question"><span class="question-label">${label}</span>${optionGroup(name,['1','2','3','4','5'],'radio-scale',value||'')}<div class="scale-caption"><span>1 · Nada</span><span>5 · Mucho</span></div></div>`;}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function renderStep(){
  const id=steps[currentStep], content=$('#step-content'); let html='';
  $('#step-number').textContent=currentStep+1; $('#step-total').textContent=steps.length; $('#progress-bar').style.width=`${((currentStep+1)/steps.length)*100}%`;
  const proposal=PROPOSALS.find(item=>item.id===selectedProposalId)||PROPOSALS[0], p=answers.proposals[proposal.id]||{};
  const proposalVisual=`<div class="visual-card"><img src="${escapeHtml(proposal.image)}" alt="${escapeHtml(proposal.name)}"></div>`;
  if(id==='profile') { $('#section-kicker').textContent='Tu perfil'; $('#section-title').textContent='Conocerte nos ayuda'; html=field('¿Qué edad tienes?','age',['14–16 años','17–18 años','19–23 años','24 años o más'],answers.age)+field('¿Cuál opción describe mejor tu situación actual?','situation',['Estudio secundaria','Estudio preparatoria','Estoy buscando universidad','Estudio una licenciatura','Soy madre, padre o tutor','Otro'],answers.situation); }
  if(id==='impression') { $('#section-kicker').textContent='Primera impresión'; $('#section-title').textContent='Mira antes de responder'; html=`${proposalVisual}${textField('¿Qué es lo primero que llama tu atención de esta imagen?','firstAttention',p.firstAttention)}${textField('¿Qué mensaje crees que intenta transmitir?','message',p.message)}${scaleField('¿Qué tan atractiva te parece visualmente?','attractiveness',p.attractiveness)}`; }
  if(id==='connection') { $('#section-kicker').textContent='Conexión emocional'; $('#section-title').textContent='¿Qué te hace sentir?'; html=`${proposalVisual.replace('visual-card','visual-card visual-card-compact')}<div class="question"><span class="question-label">¿Qué emociones o sensaciones te transmite esta imagen?</span><p class="question-help">Selecciona hasta dos opciones.</p>${optionGroup('emotions',['Inspiración','Entusiasmo','Confianza','Curiosidad','Sentido de pertenencia','Indiferencia','Confusión','Otra'],'checkbox',p.emotions||'')}<p class="check-note">Puedes elegir máximo dos.</p></div>${scaleField('¿Qué tanto te identificas con lo que muestra esta campaña?','identification',p.identification)}${scaleField('¿Qué tan auténtica o realista te parece la situación?','authenticity',p.authenticity)}`; }
  if(id==='effectiveness') { $('#section-kicker').textContent='Efectividad'; $('#section-title').textContent='Tu opinión final'; html=proposalVisual.replace('visual-card','visual-card visual-card-compact')+scaleField('Después de ver esta imagen, ¿qué tanto te interesa conocer más sobre la universidad?','interest',p.interest)+textField('¿Qué mejorarías de esta propuesta para que llamara más tu atención?','improvement',p.improvement)+field('En comparación con otras campañas universitarias, ¿cómo percibes esta propuesta?','comparison',['Mucho más interesante','Algo más interesante','Similar a otras campañas','Algo menos interesante','Mucho menos interesante','No recuerdo otras campañas'],p.comparison); }
  content.innerHTML=html; $('#back-button').style.visibility=currentStep?'visible':'hidden'; $('#next-button').innerHTML=currentStep===steps.length-1?'Enviar respuesta <span>✓</span>':'Continuar <span>→</span>'; window.scrollTo({top:0,behavior:'smooth'});
}
function readStep(){
  const data={}; document.querySelectorAll('#step-content input:checked, #step-content textarea').forEach(el=>{if(el.type==='checkbox'){data[el.name]=data[el.name]||[];data[el.name].push(el.value);}else data[el.name]=el.value;});
  if(currentStep===0) Object.assign(answers,data); else answers.proposals[selectedProposalId]=Object.assign(answers.proposals[selectedProposalId]||{},data); saveDraft(); return data;
}
function valid(data){
  const required=currentStep===0?['age','situation']:currentStep===1?['firstAttention','message','attractiveness']:currentStep===2?['emotions','identification','authenticity']:['interest','improvement','comparison'];
  const missing=required.some(k=>!data[k]||(Array.isArray(data[k])&&!data[k].length)); if(missing){alert('Completa las preguntas para continuar.');return false;} if(currentStep===2&&data.emotions.length>2){alert('Selecciona máximo dos emociones.');return false;} return true;
}
function submit(){const records=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');const id=`UVP-${Date.now().toString(36).toUpperCase()}`;const record={id,createdAt:new Date().toISOString(),...answers,selectedProposalId};records.push(record);localStorage.setItem(STORAGE_KEY,JSON.stringify(records)); localStorage.removeItem(DRAFT_KEY); $('#response-code').textContent=id; show('success'); sendToEndpoint(record);}
function sendToEndpoint(record){const endpoint=window.UVP_ENDPOINT||'';if(endpoint) fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(record)}).catch(()=>{});}
function download(type){const records=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(!records.length){alert('Todavía no hay respuestas guardadas.');return;}let data,ext,mime;if(type==='json'){data=JSON.stringify(records,null,2);ext='json';mime='application/json';}else{const rows=records.map(r=>{const p=r.proposals[r.selectedProposalId]||{};const proposal=PROPOSALS.find(x=>x.id===r.selectedProposalId)||{};return [r.id,r.createdAt,proposal.name,r.age,r.situation,p.firstAttention,p.message,p.attractiveness,(p.emotions||[]).join(' | '),p.identification,p.authenticity,p.interest,p.improvement,p.comparison].map(csv).join(',')});data=['id,fecha,pieza,edad,situacion,primera_atencion,mensaje,atractivo,emociones,identificacion,autenticidad,interes,mejoras,comparacion',...rows].join('\n');ext='csv';mime='text/csv;charset=utf-8';}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:mime}));a.download=`respuestas-uvp.${ext}`;a.click();URL.revokeObjectURL(a.href);}
function csv(v=''){return `"${String(v).replace(/"/g,'""')}"`;}

$('.start-button').onclick=()=>{renderProposalGrid();show('select');};$('#next-button').onclick=()=>{const data=readStep();if(!valid(data))return;if(currentStep<steps.length-1){currentStep++;renderStep();}else submit();};$('#back-button').onclick=()=>{readStep();if(currentStep){currentStep--;renderStep();}else{show('select');renderProposalGrid();}};$('.new-response').onclick=()=>{answers={proposals:{}};selectedProposalId=null;show('welcome');};$('#admin-link').onclick=()=>{show('admin');$('#response-count').textContent=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]').length;};$('#home-from-admin').onclick=()=>{show('welcome');window.scrollTo({top:0,behavior:'smooth'});};$('#download-csv').onclick=()=>download('csv');$('#download-json').onclick=()=>download('json');$('#clear-data').onclick=()=>{if(confirm('¿Borrar todas las respuestas de este navegador?')){localStorage.removeItem(STORAGE_KEY);$('#response-count').textContent='0';}};
document.addEventListener('change',e=>{if(e.target.matches('input[type=checkbox][name=emotions]')){const checked=[...document.querySelectorAll('input[name=emotions]:checked')];if(checked.length>2)e.target.checked=false;}});
