// Search the current book's real accounts; parents remain visible but cannot be posted.
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const h=escapeHtml;
const categories=[['','全部'],['asset','资产'],['liability','负债'],['equity','权益'],['cost','成本'],['income','收入'],['expense','费用']];
export function searchableAccounts(accounts){
  return accounts.map(a=>{
    const parents=accounts.filter(p=>p.code!==a.code&&a.code.startsWith(p.code)).sort((x,y)=>x.code.length-y.code.length);
    const fullName=[...parents.map(p=>p.name),a.name].join(' / ');
    return {...a,fullName,leaf:!accounts.some(p=>p.code!==a.code&&p.code.startsWith(a.code)),search:`${a.code} ${a.name} ${fullName}`.toLocaleLowerCase()};
  });
}
export function accountPickerField(accounts,code='',attrs=''){
  const account=accounts.find(a=>a.code===code);
  return `<div class="account-picker-field"><input type="hidden" class="voucher-account" data-account-value value="${h(code)}"><input type="search" class="account-picker-search" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-haspopup="listbox" autocomplete="off" placeholder="输入科目编码或名称搜索" value="${h(account?`${account.code} ${account.name}`:code)}" ${attrs}><span class="account-picker-arrow" aria-hidden="true">⌄</span></div>`;
}
export function bindAccountPicker(root,accounts,{onChange=()=>{},onCreate}={}){
  const data=searchableAccounts(accounts);
  const popup=document.createElement('div');popup.className='account-picker-popup';popup.hidden=true;root.append(popup);
  let field=null,query='',category='',index=0,results=[];
  const close=()=>{popup.hidden=true;field?.querySelector('[role=combobox]')?.setAttribute('aria-expanded','false');field=null;};
  const paint=()=>{
    const terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    results=data.filter(a=>(!category||a.category===category)&&terms.every(term=>a.search.includes(term)));
    index=Math.max(0,Math.min(index,results.length-1));
    popup.innerHTML=`<div class="account-picker-tabs">${categories.map(([id,label])=>`<button type="button" data-account-category="${id}" class="${id===category?'selected':''}">${label}</button>`).join('')}</div><div class="account-picker-options" role="listbox" aria-label="会计科目搜索结果">${results.length?results.map((a,i)=>`<button type="button" role="option" aria-selected="${i===index}" data-account-option="${h(a.code)}" class="${i===index?'highlighted':''}" ${!a.leaf||a.report_key==='prior_adjustment'?'disabled':''}><b>${h(a.code)}</b><span>${h(a.fullName)}</span>${!a.leaf?'<small>上级科目</small>':a.report_key==='prior_adjustment'?'<small>暂不支持记账</small>':''}</button>`).join(''):'<p class="account-picker-empty">没有匹配科目，请更换名称或编码</p>'}</div><div class="account-picker-footer"><span>共 ${results.length} 项 · ↑↓ 选择，Enter 确认</span>${onCreate?'<button type="button" data-account-create>＋ 新增科目</button>':''}</div>`;
  };
  const position=()=>{
    if(!field)return;
    const rect=field.getBoundingClientRect(),width=Math.min(570,Math.max(rect.width,400),innerWidth-24);
    popup.style.width=`${width}px`;popup.style.left=`${Math.max(12,Math.min(rect.left,innerWidth-width-12))}px`;
    const space=innerHeight-rect.bottom-12,above=space<260&&rect.top>260;
    popup.style.top=above?'auto':`${rect.bottom+3}px`;popup.style.bottom=above?`${innerHeight-rect.top+3}px`:'auto';
    popup.style.maxHeight=`${Math.max(180,Math.min(380,above?rect.top-16:space))}px`;
  };
  const open=(next,typing=false)=>{if(field!==next){field?.querySelector('[role=combobox]')?.setAttribute('aria-expanded','false');field=next;category='';index=0;query=typing?field.querySelector('[role=combobox]').value:'';}else if(typing)query=field.querySelector('[role=combobox]').value;field.querySelector('[role=combobox]').setAttribute('aria-expanded','true');paint();popup.hidden=false;position();};
  const select=code=>{
    const a=data.find(a=>a.code===code);if(!a?.leaf||a.report_key==='prior_adjustment'||!field)return;
    const changed=field;changed.querySelector('[data-account-value]').value=a.code;changed.querySelector('[role=combobox]').value=`${a.code} ${a.name}`;
    close();onChange(changed,a);changed.querySelector('[role=combobox]').focus();
  };
  root.addEventListener('focusin',e=>{if(e.target.matches('.account-picker-search'))open(e.target.closest('.account-picker-field'));});
  root.addEventListener('input',e=>{if(!e.target.matches('.account-picker-search')||e.isComposing)return;const f=e.target.closest('.account-picker-field');f.querySelector('[data-account-value]').value='';onChange(f,null);index=0;open(f,true);});
  root.addEventListener('compositionend',e=>{if(e.target.matches('.account-picker-search'))e.target.dispatchEvent(new Event('input',{bubbles:true}));});
  popup.addEventListener('pointerdown',e=>e.preventDefault());
  root.addEventListener('click',e=>{
    const option=e.target.closest('[data-account-option]');if(option&&!option.disabled){select(option.dataset.accountOption);return;}
    const tab=e.target.closest('[data-account-category]');if(tab){category=tab.dataset.accountCategory;index=0;paint();return;}
    if(e.target.closest('[data-account-create]')){close();onCreate?.();return;}
    if(e.target.matches('.account-picker-search'))open(e.target.closest('.account-picker-field'));
  });
  root.addEventListener('keydown',e=>{
    if(!e.target.matches('.account-picker-search')||e.isComposing)return;
    if(e.key==='Escape'||e.key==='Tab'){close();return;}
    if(!['ArrowDown','ArrowUp','Enter'].includes(e.key))return;
    e.preventDefault();if(!field)open(e.target.closest('.account-picker-field'));
    if(e.key==='Enter'){const selected=results[index];if(selected)select(selected.code);return;}
    const direction=e.key==='ArrowDown'?1:-1;
    for(let count=0;count<results.length;count++){index=(index+direction+results.length)%results.length;if(results[index].leaf&&results[index].report_key!=='prior_adjustment')break;}
    paint();popup.querySelector('.highlighted')?.scrollIntoView({block:'nearest'});
  });
  root.addEventListener('focusout',e=>{if(e.target.matches('.account-picker-search')&&!popup.contains(e.relatedTarget))close();});
  const surface=root.closest('.cw-shell')||root.closest('.modal')||root;
  surface.addEventListener('pointerdown',e=>{if(field&&!field.contains(e.target)&&!popup.contains(e.target))close();});
  surface.addEventListener('scroll',e=>{if(!popup.contains(e.target))close();},true);
  return {close};
}
