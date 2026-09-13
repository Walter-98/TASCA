# Tasca

Web app in italiano per entrate, spese, budget, conti personali e condivisi. Installabile dal browser su Android e iPhone: non serve una pubblicazione negli store.

## Come provarla sul telefono

Apri la versione di prova online indicata dal proprietario e accedi con il tuo account ChatGPT. Da Safari su iPhone: **Condividi → Aggiungi alla schermata Home**. Da Chrome su Android: **⋮ → Installa app / Aggiungi a schermata Home**. Tasca contiene anche un pulsante con queste istruzioni.

L’installazione aggiunge Tasca alla Home. Serve Internet per leggere e salvare i dati. Il service worker conserva soltanto la pagina offline e le icone, mai movimenti, conti, risposte API o pagine autenticate. Non ci sono scritture offline accodate.

## GitHub e costi di test

Puoi caricare questa cartella in un repository GitHub, conservare le versioni e far scaricare il codice con **Code → Download ZIP**. Non occorre un account sviluppatore negli store per testare la web app dal browser.

**GitHub Pages da solo non esegue Tasca:** offre hosting statico, mentre questa app usa API server e un database Cloudflare D1. Per testarla da più telefoni si usa un’istanza online, non il file ZIP aperto sul telefono. GitHub ospita il codice, non sostituisce il database o l’autenticazione.

La copia è predisposta per il runtime Sites/Cloudflare Workers. Fuori da Sites va configurato anche un servizio di autenticazione attendibile, oltre a Worker e D1. Non distribuire direttamente il Worker su Internet fidandoti di header inviati dal client. Gli eventuali limiti e costi di hosting dipendono dal servizio scelto; questo progetto non attiva acquisti o abbonamenti.

Riferimenti: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [installazione PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

## Conti condivisi

1. Il proprietario crea un conto e sceglie **Condividi**.
2. Aggiunge l’email dell’account ChatGPT del partecipante. Questo autorizza soltanto quel conto e non invia email.
3. Il proprietario autorizza la stessa persona ad aprire la sua istanza privata di Tasca tramite Sites. Per l’istanza creata con Codex può richiedere l’abilitazione nella conversazione di creazione. Finché manca questo accesso, la persona non può aprire l’app.
4. Al primo accesso l’invito viene associato all’identificativo stabile dell’utente. I conti personali, i movimenti senza conto e i budget personali non sono condivisi.

I partecipanti possono vedere, creare, modificare ed eliminare movimenti nel conto comune e usare le sue ricorrenze. Solo il proprietario può modificare il saldo iniziale o gestire i partecipanti. Rimuovere una persona revoca l’accesso al conto e mantiene lo storico. Ogni movimento mostra chi l’ha registrato e, se diverso, chi l’ha modificato per ultimo. Non è un registro di revisione immutabile.

L’aggiornamento avviene ogni 15 secondi quando la pagina è visibile e quando torna in primo piano. Le modifiche vengono inviate immediatamente al server. Nessuna notifica push o sincronizzazione in background a pagina chiusa.

Un trasferimento tra conto personale e conto comune è visibile anche dal lato comune, ma il riferimento al conto personale viene oscurato agli altri partecipanti. Per modificare o eliminare un trasferimento occorre poter accedere a entrambi i conti.

## Saldi e ricorrenze

- Il saldo iniziale è riferito all’inizio della data selezionata, prima dei movimenti di quel giorno.
- Il totale disponibile considera solo i movimenti fino a oggi, con giorno corrente nel fuso Europe/Rome.
- Il saldo mensile è entrate meno spese; i trasferimenti sono esclusi.
- Le ricorrenze mensili diventano movimenti solo alla conferma. Le date del giorno 31 vengono adattate all’ultimo giorno dei mesi più corti senza spostare le scadenze successive.
- Una conferma ripetuta non duplica il movimento; una scadenza saltata o il cui movimento è stato eliminato non viene ricreata automaticamente.

## Sviluppo locale

Richiede Node.js 22.13 o successivo (consigliato Node 24). Le dipendenze sono fissate in `package-lock.json`.

```sh
npm ci
npm test
npm run build
```

La configurazione portabile viene selezionata automaticamente in una copia nuova. Il database è dichiarato con il nome logico `DB` in `.openai/hosting.json`. Il file della copia distribuibile non contiene l’identificativo dell’istanza originale.

Prima di avviare il primo database locale, applica i file SQL di `drizzle/` nell’ordine numerico:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_dizzy_yellow_claw.sql
```

Ripeti sostituendo il nome con ciascun file successivo. Questo passaggio è per un database locale nuovo: **non riapplicare migrazioni già eseguite**. Le migrazioni di produzione vengono applicate dalla piattaforma Sites, una volta sola.

```sh
npm run dev
```

L’anteprima di sviluppo portabile include il mock di accesso Sites per loopback: aprire il link locale e seguire il flusso di accesso. Il mock è solo di sviluppo e non viene incorporato nella produzione. `npm run start` avvia il Worker compilato e non include il mock: i test API possono fornirgli identità simulate su localhost.

## Configurazione e protezione dei dati

Le API richiedono gli header di identità verificati dal gateway Sites. L’autorizzazione su conti, movimenti, ricorrenze e partecipanti è sempre verificata lato server.

`OWNER_BOOTSTRAP_EMAIL` è una variabile runtime privata usata per migrare i dati della precedente versione per un solo utente. Deve contenere l’email verificata del proprietario originario. Alla prima richiesta del proprietario, il trasferimento dei dati allo user ID stabile avviene in una transazione. Gli altri utenti non possono acquisire quei dati. Una nuova installazione senza dati preesistenti può lasciare la variabile vuota.

Sono forniti `.env.example` e `.dev.vars.example` con valori fittizi. Non pubblicare `.env`, `.dev.vars`, database locali, credenziali, esportazioni finanziarie o cartelle di cache. Conservare tutte le migrazioni e non modificare quelle già applicate.

## Contenuto della copia

Codice, dipendenze dichiarate, migrazioni, icone PWA, test e istruzioni. La copia non include dati finanziari, database, credenziali, cronologia Git o accessi all’istanza originale.
