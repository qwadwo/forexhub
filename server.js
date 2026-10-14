const http = require('http');
const fs = require('fs');
const path = require('path');

const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'};
const server = http.createServer((req,res)=>{
  if(req.url === '/health') { res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify({ok:true, mode:'paper', database: Boolean(process.env.SUPABASE_URL)})); }
  if(req.url === '/api/config') { res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-store'}); return res.end(JSON.stringify({supabaseUrl:process.env.SUPABASE_URL || '', supabasePublishableKey:process.env.SUPABASE_PUBLISHABLE_KEY || '', mode:'paper'})); }
  const clean = req.url.split('?')[0];
  const file = clean === '/' ? '/public/index.html' : '/public' + clean;
  const full = path.join(__dirname, file);
  fs.readFile(full, (err,data)=>{
    if(err){ res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type':types[path.extname(full)] || 'application/octet-stream'}); res.end(data);
  });
});
server.listen(process.env.PORT || 3000, ()=>console.log('ForexHub running in PAPER mode'));
