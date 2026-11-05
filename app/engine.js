(function(root) {
  'use strict';
  const materials = [
    {id:'blue',name:'Blå',color:'#4273ba',price:70000,freight:2000,lead:0},
    {id:'red',name:'Röd',color:'#ca5849',price:5000,freight:500,lead:0},
    {id:'green',name:'Grön',color:'#54896a',price:10000,freight:1000,lead:3},
    {id:'white',name:'Vit',color:'#e6e8e4',price:20000,freight:1000,lead:2},
    {id:'yellow',name:'Gul',color:'#deb54c',price:120000,freight:3000,lead:5},
    {id:'brown',name:'Brun',color:'#946c51',price:5000,freight:500,lead:0},
    {id:'window',name:'Fönster',color:'#83b9c4',price:30000,freight:1000,lead:2},
    {id:'door',name:'Dörr',color:'#bd8860',price:50000,freight:1000,lead:5},
    {id:'roof',name:'Tak',color:'#405563',price:100000,freight:3000,lead:0}
  ];
  const byId = Object.fromEntries(materials.map(m=>[m.id,m]));
  // En förenklad fasad, 8 kolumner och 6 rader. Läraren väljer fysisk modell separat.
  const target = [
    [null,null,'roof','roof','roof','roof',null,null],
    [null,'roof','roof','roof','roof','roof','roof',null],
    [null,'white','window','red','red','window','white',null],
    [null,'white','red','red','red','red','white',null],
    [null,'white','window','door','door','window','white',null],
    [null,'brown','brown','brown','brown','brown','brown',null]
  ].flat();
  function elapsed(s, now=Date.now()) {
    return s.startedAt ? Math.max(0,Math.floor(((s.finishedAt || now)-s.startedAt)/1000)) : 0;
  }
  function quote(lines) {
    let material=0, freight=0;
    for (const [id,q] of Object.entries(lines)) {
      if (!byId[id] || !Number.isInteger(q) || q<0 || q>999) throw Error('Ogiltig beställning.');
      if(q) {material+=q*byId[id].price;freight+=byId[id].freight;}
    }
    return {material,freight,total:material+freight};
  }
  function faults(board) {
    let missing=0,wrong=0; const rows=[];
    target.forEach((want,i)=> {
      const actual=board[i];
      if(want && !actual) {const cost=2*byId[want].price;missing+=cost;rows.push({i,type:'Saknas',id:want,cost});}
      else if(want && actual!==want) {const cost=byId[want].price;wrong+=cost;rows.push({i,type:'Fel komponent/färg',id:want,cost});}
      else if(!want && actual) {const cost=byId[actual].price;wrong+=cost;rows.push({i,type:'Extra komponent',id:actual,cost});}
    });
    return {missing,wrong,rows};
  }
  function totals(s,now=Date.now()) {
    let material=0,freight=0;
    for(const o of s.orders) {const q=quote(o.lines);material+=q.material;freight+=q.freight;}
    const visits=Math.max(0,s.visits-1)*10000;
    const overtime=Math.max(0,Math.ceil((elapsed(s,now)-s.duration*60)/60))*100000;
    let error;
    if(s.mode==='digital') error=faults(s.board);
    else {
      let missing=0,wrong=0;
      for(const m of materials) {missing+=(Number(s.errors[m.id]?.missing)||0)*m.price*2;wrong+=(Number(s.errors[m.id]?.wrong)||0)*m.price;}
      error={missing,wrong,rows:[]};
    }
    const defects=error.missing+error.wrong;
    const total=material+freight+visits+overtime+s.extraCost+defects;
    return {material,freight,visits,overtime,defects,total,profit:s.budget-total,error};
  }
  function inventory(s,now=Date.now()) {
    const stock=Object.fromEntries(materials.map(m=>[m.id,0]));
    const seconds=elapsed(s,now);
    for(const o of s.orders) for(const [id,q] of Object.entries(o.lines)) {
      const lead=id==='brown'?s.brownLead:byId[id].lead;
      if(seconds>=o.at+lead*60) stock[id]+=q;
    }
    if(s.mode==='digital') for(const id of s.board) if(id) stock[id]--;
    return stock;
  }
  const api={materials,byId,target,elapsed,quote,faults,totals,inventory};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.GameEngine=api;
})(typeof window!=='undefined'?window:globalThis);
