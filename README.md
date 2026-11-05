# Bygglaget – gemensamt klassrum

Eleverna skapar egna lag, fördelar de fem rollerna och skickar materialbeställningar till en gemensam server. Läraren följer lagen och beställningarna i realtid. En separat tavellvy visar leveransnedräkningar.

## Starta på lärarens dator

1. Kör `Starta klassrum.ps1` i PowerShell, eller `node server.cjs` om Node.js finns i PATH. Skriptet kan även använda den Node-runtime som finns på denna dator.
2. Öppna http://127.0.0.1:4173 på serverdatorn.
3. Under För läraren: ange lektionsnamn, budget, kontraktstid och brun leveranstid. Klicka Skapa klassrum.
4. Dela klassrumsnumret och elevadressen som visas i lärarvyn. Serverfönstret visar datorns möjliga nätverksadresser.
5. Spara lärarnyckeln från lärarvyn om du vill kunna återansluta från en annan webbläsare eller efter att lärarfliken har stängts.

Servern måste fortsätta vara igång under lektionen. Alla datorer använder samma serveradress. `127.0.0.1` fungerar bara på serverdatorn. Skolans nätverk och brandvägg måste tillåta anslutningar till serverdatorns port 4173; detta har inte verifierats mellan skolans datorer. Appen ändrar inga brandväggsinställningar. Om Node.js saknas behövs det för servern.

## Elevernas flöde

1. Öppna elevadressen och ange klassrumsnumret.
2. Välj lagnamn och fysiskt eller digitalt spelläge. Ange fem olika elever eller unika alias och fördela rollerna själva.
3. Registrera laget. Laget syns nu i lärarvyn.
4. Laguppställningen kan justeras innan start. Den låses när eleverna startar projektet och klockan.
5. Använd en gemensam dator per lag. Arbetsvyn anger vilken elev som använder datorn. Endast inköparens arbetsvy skickar beställningar.
6. En beställning räknas som skickad först när servern har bekräftat den. Om kontakten bryts visas ett fel. Återförsök av samma order i samma flik ger ingen dubbelbeställning.
7. Samma webbläsare kommer ihåg lagets anslutning. Startsidan visar Fortsätt med ert lag.

Lagen väljer själva deltagare och roller, utan lärargodkännande. Budget, kontraktstid och brun leveranstid bestäms av läraren för hela klassrummet. Eleverna väljer inte byggprofiler eller svårighetsgrader.

## Lärarens översikt

- Alla lag och respektive rollinnehavare visas i en gemensam vy.
- Nya order visas direkt via serverhändelser (SSE). Automatisk avstämning sker också var femte sekund.
- Orderrader visar lag, beställningsnummer, material, antal och återstående leveranstid.
- Markera utlämnat används när läraren har lämnat över materialet. Knappen blir tillgänglig när leveranstiden gått ut.
- Dölj utlämnat håller orderkön ren. Avmarkera för att se tidigare utlämningar.
- Öppna lagets kontrollrum för byggstopp, störningslösning, besiktning och projektavslut. Elever kan inte avsluta projekt via serverns API.

Levererat i lagets spel betyder att den planerade leveranstiden gått ut. Utlämnat i lärarvyn betyder att läraren har bekräftat den faktiska utlämningen. Digitala klossar blir byggbara när den planerade tiden gått ut.

## Visa leveranser på tavlan

Klicka Visa på tavlan i lärarvyn. Tavlan öppnas i en ny flik med stora nedräkningar och en helskärmsknapp. Den kan också öppnas på en annan dator via adressen `/classroom.html?room=KLASSRUMSNUMMER&view=board` på samma server.

Välj Alla lag eller ett enskilt lag. Elevnamn och lärarnyckel visas inte på tavlan. Den visar lagnamn, material, antal, beställningsnummer och leveransstatus. När tiden löpt ut visas Klart för leverans. Utlämnade rader döljs som standard.

## Två spellägen

Fysiskt: läraren förbereder originalmodell, kamera och klosslager. Arkitekten registrerar modellbesök och tar foton utanför appen. Läraren lämnar ut fysiskt material och registrerar besiktningsfel.

Digitalt: spelet använder en förenklad husfasad med 8 × 6 rutor och en standardform per material. Arkitekten besöker originalet och sparar ett fasadfoto. Byggaren placerar levererade klossar. Borttagna klossar återförs till lagret. Besiktningen jämför färg och placering automatiskt. Ingen 3D, rotation eller bärighetskontroll.

## Sparande och behörigheter

Klassrummens spel och beställningar sparas i `data/classrooms.json` på serverdatorn. Filen laddas igen vid serverstart. Den innehåller elevuppgifter samt lag- och lärarnycklar och är undantagen från Git. Använd förnamn eller alias. Ingen extern molntjänst används.

Lärarnyckeln krävs för läraröversikt och läraråtgärder. Varje lag har en separat nyckel och kan inte läsa ett annat lags projekt. Lagets dator delar arbetsvyer mellan rollerna; de är inte personliga inloggningar. Läraren kontrollerar att rätt elev arbetar i rätt roll och att bara arkitekten ser originalet.

Vid anslutningsfel visas status tydligt. Redigerade anteckningar och byggändringar kan väntas in för omsändning så länge fliken hålls öppen, men osparade ändringar kan förloras om den stängs. Beställningar kräver serverbekräftelse. Klockan och leveranstiderna baseras på servern och fortsätter även när en elevflik är stängd.

Detta är en lokal klassrumslösning för skolans nätverk, utan extern publicering. För internetdrift behövs separat hosting och HTTPS.

## Regeltolkningar

- Första modellbesöket gratis, sedan 10 000 $ per besök.
- Brun leveranstid saknas i underlaget. Läraren väljer, förvalt 0 minuter.
- En last = ett materialslag i en beställning. Ny beställning ger en ny leveransavgift.
- Påbörjad övertidsminut kostar 100 000 $.
- Saknad komponent kostar 2 × originalets pris. Fel färg eller ersatt komponent kostar 1 × originalets pris utan dubbeldebitering.
- Extra digital komponent kostar sitt eget pris som tolkning av felplacering.
- Alla order debiteras även om materialet inte hunnit fram. Överskriden budget kan leda till förlust.
- Byggstopp stoppar köp, modellbesök och montering; kontraktstid och beställda leveranser fortsätter.

## Lokalt övningsspel

Det ursprungliga spelet finns kvar via länken Lokalt övningsspel eller genom att öppna `app/index.html` direkt. Det använder webbläsarens lokala lagring och syns inte i klassrummets lärarvy.

## Kontroller

- `tests/engine.test.cjs`: 10 tester av priser, leveranser, övertid och byggfel.
- `tests/classroom-api.test.cjs`: lagisolering, behörigheter, SSE-händelser, ordervalidering, idempotens, utlämning, sparande och låst slutresultat.
- `tests/classroom-browser.cjs`: separata elev-, lärar- och tavelfönster genom hela flödet. Kräver Playwright och installerad Edge enligt denna dators runtime.
- `tests/browser-smoke.cjs`: det ursprungliga övningsspelets båda lägen.

Testfilerna körs med Node.js. Vid problem med nätverkssökvägar: `node -e "require(process.argv[1])" "FULLSTÄNDIG_SÖKVÄG_TILL_TESTFILEN"`.

## Notiser och lastning

Läraren får en notis i översikten när ett lag skickar en ny beställning. Notisen innehåller lagnamn, ordernummer och materialrader.

När en materialrads leveranstid löpt ut kan läraren trycka på **Lastad och klar för leverans** på den raden. Då får laget en notis i sin spelvy med ordernummer, material och antal. En beställning med olika leveranstider kan ge flera lastningsbesked, ett per materialrad. Därefter kan läraren markera materialet som utlämnat.

Notiserna visas som meddelanden i spelet och sparas i en notishistorik via knappen **Notiser**. Samma händelse ger inte upprepade notiser vid liveuppdateringar eller sidladdning. Redan befintliga order utlöser inte en notis första gången man öppnar notisfunktionen.

**Aktivera skrivbordsnotiser** är ett frivilligt tillval. Webbläsaren ber då om tillåtelse. Om tillåtelse ges visas även en skrivbordsnotis när spelfliken ligger i bakgrunden. På vanliga HTTP-adresser i skolans nätverk kan webbläsaren sakna stöd; notiserna i spelet fungerar ändå. Dessa är livebesked medan sidan är öppen, inte push till en stängd webbläsare.

Notishistoriken sparas i den aktuella webbläsaren och delas inte mellan olika enheter. Tavellvyn visar lastningsstatus men inga popupnotiser. Digitalt byggmaterial blir fortfarande tillgängligt när den planerade leveranstiden har gått ut.
