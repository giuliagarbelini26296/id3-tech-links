/* ID3 TECH Fast Assessment — offline-friendly, no third-party scripts or automatic transmission. */
(() => {
  'use strict';
  const questions = [
    {title:'Sistemas importantes', question:'Vocês sabem quais sistemas são essenciais para manter vendas e operação funcionando?', pillar:'Continuidade', advice:'Mapear sistemas e processos essenciais, definindo responsáveis.'},
    {title:'Acesso a sistemas', question:'Cada colaborador usa seu próprio acesso, com proteção extra nas contas importantes?', pillar:'Proteção de acessos', advice:'Revisar contas compartilhadas e ativar autenticação em dois fatores.'},
    {title:'Atualizações e falhas', question:'Existe uma rotina para atualizar computadores, sistemas e corrigir falhas de segurança?', pillar:'Prevenção', advice:'Criar rotina simples de atualizações e priorizar sistemas expostos.'},
    {title:'Backup e recuperação', question:'Os dados importantes têm backup e a recuperação já foi testada?', pillar:'Continuidade', advice:'Testar a restauração dos backups e estabelecer tempos de recuperação.'},
    {title:'Plano para incidentes', question:'Se um sistema parar ou ocorrer um ataque, sua equipe sabe quem acionar e o que fazer?', pillar:'Continuidade', advice:'Criar um plano enxuto de resposta a incidentes com contatos de emergência.'},
    {title:'Golpes e phishing', question:'Seu time recebe orientação prática para reconhecer e-mails falsos e tentativas de golpe?', pillar:'Pessoas', advice:'Realizar orientações periódicas e simulações proporcionais ao risco.'},
    {title:'Alertas e monitoramento', question:'Alguém acompanha alertas de segurança e comportamentos anormais nos principais sistemas?', pillar:'Prevenção', advice:'Definir responsáveis para alertas críticos e registros de incidentes.'},
    {title:'Responsabilidade e decisões', question:'Os responsáveis pela empresa e TI conversam sobre riscos, prioridades e investimentos de segurança?', pillar:'Governança', advice:'Levar riscos digitais para uma revisão periódica com os responsáveis pelo negócio.'}
  ];
  const answerOptions = [['Não / ainda não',0],['Parcialmente',2.5],['Sim / de forma regular',5]];
  const $ = id => document.getElementById(id);
  const form = $('assessmentForm');
  const questionWrap = $('questions');
  const escapeHTML = str => String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  questions.forEach((q, i) => {
    const section = document.createElement('section');
    section.className='question-card';
    section.innerHTML = `<h3><span class="qnum">${String(i+1).padStart(2,'0')}.</span>${escapeHTML(q.question)}</h3><div class="options" role="group" aria-label="${escapeHTML(q.title)}">${answerOptions.map(([text,score],k)=>`<label class="option"><input type="radio" name="q${i}" value="${score}" ${k===0 ? '' : ''}><span>${escapeHTML(text)}</span></label>`).join('')}</div>`;
    questionWrap.appendChild(section);
  });
  let current=1;
  let report='';
  function showStep(n) {
    current=n;
    for(let i=1;i<=3;i++){
      $('step'+i).classList.toggle('active',i===n);
      $('menu'+i).classList.toggle('current',i===n);
    }
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function validateCompany(){
    const fields=[...$('step1').querySelectorAll('input[required],select[required]')];
    const invalid=fields.find(el=>!el.checkValidity());
    if(invalid){invalid.reportValidity();invalid.focus();return false;}
    return true;
  }
  function updateProgress(){
    const count=questions.filter((q,i)=>form.querySelector(`input[name="q${i}"]:checked`)).length;
    $('progressLabel').textContent=`${count} de ${questions.length} perguntas`;
    $('progressFill').style.width=`${count/questions.length*100}%`;
    $('validationMsg').textContent='';
  }
  form.addEventListener('change',e=>{if(e.target.type==='radio')updateProgress()});
  $('start').addEventListener('click',()=>{if(validateCompany())showStep(2)});
  $('backTo1').addEventListener('click',()=>showStep(1));
  $('backTo2').addEventListener('click',()=>showStep(2));
  $('calculate').addEventListener('click',()=>{
    const answers=questions.map((q,i)=>form.querySelector(`input[name="q${i}"]:checked`));
    const missed=answers.findIndex(x=>!x);
    if(missed>=0){
      $('validationMsg').textContent=`Responda à pergunta ${missed+1} para continuar.`;
      questionWrap.children[missed].scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    const values=answers.map(a=>Number(a.value));
    const average=values.reduce((sum,x)=>sum+x,0)/values.length;
    let level,summary;
    if(average<2){level='Atenção prioritária';summary='As respostas indicam controles importantes ainda não estruturados. Comece pelo que sustenta sua operação.';}
    else if(average<3.5){level='Em evolução';summary='Já existem iniciativas, mas há oportunidades práticas de fortalecimento e validação.';}
    else{level='Base mais estruturada';summary='Sua empresa declara controles relevantes. O próximo passo é validar o que funciona na prática.';}
    $('score').textContent=average.toFixed(1).replace('.',',');
    $('level').textContent=level;
    $('summary').textContent=summary;
    const lowest=values.map((score,i)=>({score,i})).sort((a,b)=>a.score-b.score).slice(0,3);
    $('tips').replaceChildren();
    const used=new Set();
    lowest.forEach(item=>{
      const tip=questions[item.i].advice;
      if(used.has(tip))return;
      used.add(tip);const li=document.createElement('li');li.textContent=tip;$('tips').appendChild(li);
    });
    const data=new FormData(form);
    const selected=idx=>{const v=values[idx];return answerOptions.find(x=>x[1]===v)[0];};
    report=[
      'ID3 TECH — Fast Assessment (autoavaliação inicial)',
      'Nome: '+data.get('nome'), 'Empresa: '+data.get('empresa'), 'E-mail: '+data.get('email'),
      'Setor: '+data.get('setor'), 'Função: '+data.get('cargo'),
      'Faturamento anual: '+data.get('faturamento'), 'Equipe: '+data.get('colaboradores'),
      'Pontuação declarada: '+average.toFixed(1).replace('.',',')+' de 5',
      'Classificação: '+level, '',
      ...questions.map((q,i)=>`${i+1}. ${q.title}: ${selected(i)}`),
      '', 'Solicito uma conversa para avaliação consultiva conforme o porte da empresa.'
    ].join('\n');
    const minimalMessage=[
      'Olá! Preenchi o Fast Assessment da ID3 TECH e gostaria de conversar.',
      'Empresa: '+data.get('empresa'), 'Contato: '+data.get('nome'),
      'E-mail: '+data.get('email'),
      'Pontuação inicial: '+average.toFixed(1).replace('.',',')+'/5 ('+level+').',
      'Poderiam orientar os próximos passos?'
    ].join('\n');
    $('sendWhatsapp').dataset.url='https://wa.me/5511982457213?text='+encodeURIComponent(minimalMessage);
    $('sendEmail').dataset.url='mailto:contato@id3.tech?subject='+encodeURIComponent('Fast Assessment | '+data.get('empresa'))+'&body='+encodeURIComponent(report);
    $('consentMsg').textContent='';$('sendConsent').checked=false;
    showStep(3);
  });
  function authorizeSend(){
    if(!$('sendConsent').checked){$('consentMsg').textContent='Marque a autorização acima antes de compartilhar seus dados com a ID3 TECH.';$('sendConsent').focus();return false;}
    $('consentMsg').textContent='';return true;
  }
  $('sendWhatsapp').addEventListener('click',()=>{if(authorizeSend())window.open($('sendWhatsapp').dataset.url,'_blank','noopener,noreferrer')});
  $('sendEmail').addEventListener('click',()=>{if(authorizeSend())window.location.href=$('sendEmail').dataset.url});
  $('sendConsent').addEventListener('change',()=>{$('consentMsg').textContent=''});
  $('copyReport').addEventListener('click',async e=>{
    try{await navigator.clipboard.writeText(report);e.target.textContent='Resumo copiado ✓';}
    catch{const area=document.createElement('textarea');area.value=report;area.style.width='100%';area.style.minHeight='150px';area.setAttribute('aria-label','Texto da avaliação para copiar');e.target.after(area);area.select();e.target.disabled=true;}
  });
  updateProgress();
})();
