const http=require('http');
const fs=require('fs');
const path=require('path');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'};
const symbols=['EUR/USD','GBP/USD','USD/JPY','XAU/USD'];
const demo={'EUR/USD':1.1624,'GBP/USD':1.3412,'USD/JPY':152.41,'XAU/USD':4142.8};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function quote(symbol){const key=process.env.TWELVE_DATA_API_KEY;if(!key)return {symbol,price:demo[symbol],source:'DEMO'};try{const u='https://api.twelvedata.com/price?symbol='+encodeURIComponent(symbol)+'&apikey='+encodeURIComponent(key);const r=await fetch(u);const d=await r.json();if(!r.ok||!d.price)throw new Error('quote');return {symbol,price:Number(d.price),source:'TWELVE_DATA'};}catch{return {symbol,price:demo[symbol],source:'DEMO_FALLBACK'};}}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://local');
if(url.pathname==='/health')return json(res,200,{ok:true,mode:'paper',database:Boolean(process.env.SUPABASE_URL),liveFeed:Boolean(process.env.TWELVE_DATA_API_KEY)});
if(url.pathname==='/api/config')return json(res,200,{supabaseUrl:process.env.SUPABASE_URL||'',supabasePublishableKey:process.env.SUPABASE_PUBLISHABLE_KEY||'',mode:'paper'});
if(url.pathname==='/api/markets'){const rows=[];for(const s of symbols)rows.push(await quote(s));return json(res,200,rows);}
const clean=url.pathname==='/'?'/public/index.html':'/public'+url.pathname;const full=path.join(__dirname,clean);fs.readFile(full,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream'});res.end(data);});
}catch{return json(res,500,{error:'Server error'});}});
server.listen(process.env.PORT||3000,()=>console.log('ForexHub Phase 2 monitoring running in PAPER mode'));
