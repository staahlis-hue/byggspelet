'use strict';
const {test,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'bygglaget-api-'));process.env.BYGGLAGET_DATA=temp;
const {server}=require('../server.cjs');const ready=new Promise(r=>server.listen(0,'127.0.0.1',r));
let base;async function call(p,method='GET',body,key=''){await ready;base='http://127.0.0.1:'+server.address().port;const r=await fetch(base+'/api'+p,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
const names={architect:'Ada',calculator:'Bo',buyer:'Cia',builder:'Dan',manager:'Eva'};
after(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true});});
test('classroom, independent teams, authorization, order events, deduplication and saved data',async()=>{
const c=await call('/rooms','POST',{name:'Testklass'});assert.equal(c.status,201);const code=c.data.code,key=c.data.teacherToken,p='/rooms/'+code;
assert.equal((await call(p)).status,403);
const a=await call(p+'/teams','POST',{team:'Lag A',names,mode:'physical'}),b=await call(p+'/teams','POST',{team:'Lag B',names,mode:'digital'});assert.equal(a.status,201);assert.equal(b.status,201);
assert.equal((await call(p+'/teams','POST',{team:'Lag A',names,mode:'physical'})).status,409);
assert.equal((await call(p+'/teams/'+a.data.id,'GET',null,b.data.teamToken)).status,403);
const tp=p+'/teams/'+a.data.id,tk=a.data.teamToken;
assert.equal((await call(tp+'/orders','POST',{requestId:'before-start',lines:{red:1}},tk)).status,409);
let saved=await call(tp,'PATCH',{revision:0,patch:{team:'Lag Alfa',names:{...names,manager:'Elsa'}}},tk);assert.equal(saved.status,200);assert.equal(saved.data.state.names.manager,'Elsa');
assert.equal((await call(tp,'PATCH',{revision:0,patch:{notes:'stale'}},tk)).status,409);
await call(tp+'/start','POST',{},tk);
const abort=new AbortController(),events=await fetch(base+'/api'+p+'/events',{signal:abort.signal}),reader=events.body.getReader();await reader.read();
const order=await call(tp+'/orders','POST',{requestId:'unique-order-1',lines:{red:2,door:1}},tk);assert.equal(order.status,200);const event=await Promise.race([reader.read(),new Promise((_,reject)=>setTimeout(()=>reject(Error('SSE event timeout')),3000))]);assert.match(new TextDecoder().decode(event.value),/changed/);abort.abort();
const retry=await call(tp+'/orders','POST',{requestId:'unique-order-1',lines:{red:2,door:1}},tk);assert.equal(retry.data.state.orders.length,1);
assert.equal((await call(tp+'/orders','POST',{requestId:'bad-quantity',lines:{red:-1}},tk)).status,400);
assert.equal((await call(tp+'/handover','POST',{orderId:1,material:'door'},key)).status,409);
assert.equal((await call(tp+'/handover','POST',{orderId:1,material:'red'},tk)).status,403);
assert.equal((await call(tp+'/load','POST',{orderId:1,material:'red'},tk)).status,403);
assert.equal((await call(tp+'/load','POST',{orderId:1,material:'door'},key)).status,409);
const loaded=await call(tp+'/load','POST',{orderId:1,material:'red'},key);assert.equal(loaded.status,200);assert.ok(loaded.data.state.orders[0].loaded.red);
const loadedAgain=await call(tp+'/load','POST',{orderId:1,material:'red'},key);assert.equal(loadedAgain.data.revision,loaded.data.revision);
assert.equal((await call(tp+'/handover','POST',{orderId:1,material:'red'},key)).status,200);
const dash=await call(p,'GET',null,key);assert.equal(dash.data.teams.length,2);assert.equal(dash.data.deliveries.length,2);assert.equal(dash.data.teams.find(x=>x.id===b.data.id).state.orders.length,0);
const publicBoard=await call(p+'/board');assert.equal(publicBoard.status,200);const serialized=JSON.stringify(publicBoard.data);for(const secret of ['Ada','Elsa',key,tk])assert.ok(!serialized.includes(secret));
let team=await call(tp,'GET',null,tk);const forged=await call(tp,'PATCH',{revision:team.data.revision,patch:{finishedAt:Date.now(),extraCost:900000,orders:[]}},tk);assert.equal(forged.data.state.finishedAt,null);assert.equal(forged.data.state.extraCost,0);assert.equal(forged.data.state.orders.length,1);
const illegalBoard=Array(48).fill(null);illegalBoard[0]='blue';assert.equal((await call(tp,'PATCH',{revision:forged.data.revision,patch:{board:illegalBoard}},tk)).status,400);
team=await call(tp,'GET',null,tk);const finish=await call(tp,'PATCH',{revision:team.data.revision,patch:{finishedAt:Date.now()}},key);assert.equal(finish.status,200,JSON.stringify(finish.data));assert.ok(finish.data.state.finishedAt);assert.equal((await call(tp+'/orders','POST',{requestId:'after-finish',lines:{red:1}},tk)).status,409);
assert.equal((await call('/rooms/'+code+'/teams/'+b.data.id,'GET',null,key)).status,200);
const stored=JSON.parse(fs.readFileSync(path.join(temp,'classrooms.json'),'utf8'));assert.equal(stored.rooms[code].teams[a.data.id].state.orders.length,1);
});



