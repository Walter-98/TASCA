"""Run explicitly against a disposable local Worker, never against production.
The Worker should use OWNER_BOOTSTRAP_EMAIL=owner@example.test.
"""
import json,urllib.request,urllib.error,uuid,concurrent.futures
BASE='http://127.0.0.1:8787/api/'
A={'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':'owner@example.test','oai-authenticated-user-full-name':'Alice'}
B={'oai-authenticated-user-id':'test-bob','oai-authenticated-user-email':'bob@example.test','oai-authenticated-user-full-name':'Bob'}
C={'oai-authenticated-user-id':'test-carol','oai-authenticated-user-email':'carol@example.test','oai-authenticated-user-full-name':'Carol'}
def call(user,path='finance',v=None,status=200):
 headers={**user,'Content-Type':'application/json'}
 try:
  r=urllib.request.urlopen(urllib.request.Request(BASE+path,None if v is None else json.dumps(v).encode(),headers));assert r.status==status;return json.load(r)
 except urllib.error.HTTPError as e:
  body=e.read().decode();assert e.code==status,(status,e.code,body);return {}
call({},status=401)
# A different verified identity must not bootstrap legacy records.
assert not call(C)['accounts']
call(A)
p='test-'+str(uuid.uuid4())
def account(key,name):return {'action':'account','id':p+key,'name':name,'opening':100000,'opening_date':'2026-01-01','owner_id':'spoofed'}
call(A,'planning',account('private','Personale'))
call(A,'planning',account('shared','Comune'))
call(B,'planning',account('bob','Personale Bob'))
assert not any(a['id'] in [p+'private',p+'shared'] for a in call(B)['accounts'])
share={'account_id':p+'shared','email':'bob@example.test','action':'add'}
call(B,'sharing',share,403);call(A,'sharing',share)
assert any(a['id']==p+'shared' for a in call(B)['accounts'])
assert not any(a['id']==p+'private' for a in call(B)['accounts'])
call(B,'planning',account('shared','Tentativo'),403)
v={'id':p+'expense','type':'expense','amount':1234,'category':'Casa','description':'Spesa comune','date':'2026-09-13','account_id':p+'shared','author':'Falso','owner_id':'spoofed'}
call(B,'finance',v)
m=next(x for x in call(A)['movements'] if x['id']==p+'expense');assert m['author']=='Bob' and m['owner_id']=='test-bob'
call(C,'finance',v,403)
call(B,'finance',dict(v,amount=1600));assert next(x for x in call(A)['movements'] if x['id']==p+'expense')['amount']==1600
transfer={**v,'id':p+'transfer','type':'transfer','category':'Trasferimento','account_id':p+'private','to_account_id':p+'shared','description':'Versamento'}
call(A,'finance',transfer)
m=next(x for x in call(B)['movements'] if x['id']==p+'transfer');assert m['account_id'] is None and m['to_account_id']==p+'shared' and m['can_edit'] is False
call(B,'finance',{'action':'delete','id':p+'transfer'},403)
call(B,'finance',dict(transfer,account_id=p+'bob'),403)
private={**v,'id':p+'secret','account_id':p+'private'}
call(A,'finance',private);assert not any(x['id']==p+'secret' for x in call(B)['movements'])
call(B,'finance',private,403)
call(A,'finance',{'action':'budget','month':'2026-09','amount':50000});call(B,'finance',{'action':'budget','month':'2026-09','amount':20000})
assert next(x for x in call(A)['budgets'] if x['month']=='2026-09')['amount']==50000
assert next(x for x in call(B)['budgets'] if x['month']=='2026-09')['amount']==20000
r={'action':'recurring','id':p+'rule','type':'expense','amount':1000,'description':'Ricorrenza comune','category':'Casa','account_id':p+'shared','start_date':'2026-01-31','end_date':'2026-03-31','active':1}
call(A,'planning',r)
confirm={'action':'confirm','id':r['id'],'date':'2026-02-28'}
call(C,'planning',confirm,403)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: list(pool.map(lambda u:call(u,'planning',confirm),[A,B]))
assert len([x for x in call(A)['movements'] if x['id']=='rec:'+r['id']+':2026-02-28'])==1
call(A,'sharing',{**share,'action':'remove'})
assert not any(a['id']==p+'shared' for a in call(B)['accounts'])
assert not any(x['id']==v['id'] for x in call(B)['movements'])
call(B,'finance',v,403);call(B,'planning',confirm,403)
call(A,'sharing',share)
print('PASS: unauthenticated rejection, legacy isolation, account sharing, author attribution, personal budgets, transfer redaction, concurrent confirmation and revocation')
print('UI fixture shared account:',p+'shared')
