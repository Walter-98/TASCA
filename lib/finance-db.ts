import {env} from 'cloudflare:workers';
import {AccessError} from './access';
import {validDate} from './finance';
export function database(){if(!env.DB)throw Error('Database unavailable');return env.DB;}
export function check(ok:unknown,message='Controlla i dati inseriti.'):asserts ok {if(!ok)throw new InputError(message);}
export class InputError extends Error {}
export function cents(v:unknown,negative=false){check(Number.isSafeInteger(v)&&Math.abs(v as number)<=100000000000&&(negative||(v as number)>0));}
export function label(v:unknown,max=160):asserts v is string {check(typeof v==='string'&&v.trim().length>0&&v.length<=max);}
export function id(v:unknown):asserts v is string {check(typeof v==='string'&&/^[\w:-]{1,120}$/.test(v));}
export async function checkAccount(account:unknown,date:string){if(!account)return;id(account);const row=await database().prepare('SELECT * FROM accounts WHERE id=?').bind(account).first<{opening_date:string}>();check(row,'Il conto selezionato non esiste.');check(date>=row.opening_date,'La data precede il saldo iniziale del conto. Modifica la data o il saldo iniziale.');}
export async function validateMovement(v:any){check(v&&['income','expense','transfer'].includes(v.type));cents(v.amount);label(v.description);label(v.category,50);check(validDate(v.date));id(v.id);await checkAccount(v.account_id,v.date);if(v.type==='transfer'){check(v.account_id&&v.to_account_id&&v.account_id!==v.to_account_id,'Scegli due conti diversi.');await checkAccount(v.to_account_id,v.date);}}
export function mutationAllowed(req:Request){const origin=req.headers.get('origin');return !origin||new URL(origin).host===new URL(req.url).host;}
export function failure(e:unknown){console.error(e);return Response.json({error:e instanceof AccessError||e instanceof InputError?e.message:'Operazione non riuscita. I dati inseriti sono ancora qui: riprova.'},{status:e instanceof AccessError?e.status:e instanceof InputError?400:503});}
