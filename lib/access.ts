import {env} from 'cloudflare:workers';
import {database,check,InputError} from './finance-db';
export type Identity={id:string,email:string,name:string};
export async function identity(req:Request):Promise<Identity>{
 const id=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email')?.toLowerCase();
 if(!id||!email)throw new AccessError('Accedi con il tuo account per aprire Tasca.',401);
 let name=req.headers.get('oai-authenticated-user-full-name')||email;
 if(req.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){try{name=decodeURIComponent(name);}catch{name=email;}}
 const u={id,email,name:name.slice(0,160)},db=database();
 // The verified owner's email bootstraps existing single-user records once. IDs own data thereafter.
 if(env.OWNER_BOOTSTRAP_EMAIL?.toLowerCase()===email){
  const state=await db.prepare("SELECT value FROM site_state WHERE key='legacy_owner'").first<{value:string}>();
  if(!state){await db.batch([
   db.prepare("INSERT OR IGNORE INTO site_state(key,value) VALUES('legacy_owner',?)").bind(id),
   db.prepare("UPDATE accounts SET owner_id=? WHERE owner_id IS NULL AND (SELECT value FROM site_state WHERE key='legacy_owner')=?").bind(id,id),
   db.prepare("UPDATE movements SET owner_id=?,author=?,updated_by=? WHERE owner_id IS NULL AND (SELECT value FROM site_state WHERE key='legacy_owner')=?").bind(id,u.name,u.name,id),
   db.prepare("UPDATE recurring SET owner_id=? WHERE owner_id IS NULL AND (SELECT value FROM site_state WHERE key='legacy_owner')=?").bind(id,id),
   db.prepare("INSERT OR IGNORE INTO personal_budgets(owner_id,month,amount) SELECT ?,month,amount FROM budgets WHERE (SELECT value FROM site_state WHERE key='legacy_owner')=?").bind(id,id)
  ]);}
 }
 await db.prepare('UPDATE account_members SET user_id=? WHERE email=? AND user_id IS NULL').bind(id,email).run();
 return u;
}
export class AccessError extends Error {constructor(message:string,public status=403){super(message);}}
export async function visibleAccounts(u:Identity){const rows=await database().prepare('SELECT a.* FROM accounts a WHERE a.owner_id=? OR EXISTS (SELECT 1 FROM account_members m WHERE m.account_id=a.id AND m.user_id=?) ORDER BY a.name').bind(u.id,u.id).all<any>();return rows.results;}
export async function permittedAccount(u:Identity,id:string){const a=await database().prepare('SELECT a.* FROM accounts a WHERE a.id=? AND (a.owner_id=? OR EXISTS(SELECT 1 FROM account_members m WHERE m.account_id=a.id AND m.user_id=?))').bind(id,u.id,u.id).first<any>();if(!a)throw new AccessError('Non hai accesso a questo conto.');return a;}
export async function ownAccount(u:Identity,id:string){const a=await permittedAccount(u,id);if(a.owner_id!==u.id)throw new AccessError('Solo il proprietario può modificare o condividere il conto.');return a;}
export async function permittedMovement(u:Identity,m:any){if(m.account_id)await permittedAccount(u,m.account_id);else if(m.owner_id!==u.id)throw new AccessError('Movimento non disponibile.');if(m.type==='transfer')await permittedAccount(u,m.to_account_id);}
export async function permittedRule(u:Identity,id:string){const r=await database().prepare('SELECT * FROM recurring WHERE id=?').bind(id).first<any>();if(!r)throw new AccessError('Ricorrenza non disponibile.');await permittedAccount(u,r.account_id);return r;}
