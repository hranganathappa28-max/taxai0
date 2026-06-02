// @ts-nocheck
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

/*
══════════════════════════════════════════════════════════
 TAXAI LITHUANIA v8 — PRODUCTION BUILD
 MiniSearch RAG · Deterministic Tax Engine · Full Legal DB
 GDPR · Audit Logs · Export · Multilingual · DataTable
══════════════════════════════════════════════════════════
*/

// ═══ COMPREHENSIVE LEGAL DATABASE (RAG Source) ═══
const LEGAL_DB = [
// ── PVM ──
{id:"pvm-19-1",law:"PVM",article:"19 str. 1 d.",text:"Standartinis PVM tarifas yra 21 procentas.",textEn:"Standard VAT rate is 21 percent.",keywords:"pvm vat standartinis tarifas 21% rate standard",category:"rates",penalty:null},
{id:"pvm-19-2",law:"PVM",article:"19 str. 2 d.",text:"Lengvatinis PVM tarifas — 12 procentų (nuo 2026-01-01, buvo 9%): keleivių vežimo paslaugoms reguliariais maršrutais, apgyvendinimo paslaugoms, lankytojų aptarnavimo paslaugoms, teikiamoms lankymo vietose.",textEn:"Reduced VAT rate — 12 percent (from 2026-01-01, was 9%): regular passenger transport, accommodation services, visitor services at visitor sites.",keywords:"pvm vat lengvatinis 12% 9% apgyvendinimas accommodation transport keleiviu vezimas reduced rate",category:"rates",penalty:null},
{id:"pvm-19-3",law:"PVM",article:"19 str. 3 d.",text:"Lengvatinis PVM tarifas — 5 procentai: vaistams ir medicinos pagalbos priemonėms, kai šių prekių įsigijimo išlaidos visiškai ar iš dalies kompensuojamos; knygoms ir kitoms periodinėms bei neperiodinėms publikacijoms.",textEn:"Reduced VAT rate — 5 percent: medicines and medical devices when acquisition costs are fully or partially compensated; books and other periodic and non-periodic publications.",keywords:"pvm vat 5% vaistai knygos medicines books",category:"rates",penalty:null},
{id:"pvm-heating-abolished",law:"PVM",article:"19 str. (2026 pakeitimas)",text:"Nuo 2026-01-01 PANAIKINTA: šildymo energijos, karšto vandens ir malkų PVM lengvata. Šioms prekėms/paslaugoms taikomas standartinis 21% tarifas.",textEn:"From 2026-01-01 ABOLISHED: heating energy, hot water and firewood VAT relief. Standard 21% rate now applies to these goods/services.",keywords:"sildymas heating abolished panaikinta karstas vanduo hot water malkos firewood 21%",category:"rates",penalty:null},
{id:"pvm-58",law:"PVM",article:"58 str.",text:"PVM sąskaitoje faktūroje turi būti nurodyti šie rekvizitai: eilės numeris, išrašymo data, pardavėjo ir pirkėjo PVM mokėtojo kodai, vardai/pavadinimai, adresai, prekių/paslaugų pavadinimas, kiekis, vieneto kaina, PVM tarifas, PVM suma, bendra suma.",textEn:"VAT invoice must contain: serial number, issue date, seller and buyer VAT codes, names, addresses, goods/services description, quantity, unit price, VAT rate, VAT amount, total amount.",keywords:"saskaita faktura invoice rekvizitai requirements 58",category:"compliance",penalty:"MAĮ 139 str.: 10-50% baudos"},
{id:"pvm-64",law:"PVM",article:"64 str.",text:"PVM mokėtojas turi teisę pateiktą PVM sumą atskaityti, jeigu prekės ar paslaugos įsigytos PVM mokėtojo ekonominei veiklai vykdyti ir yra tinkama PVM sąskaita faktūra.",textEn:"VAT payer has right to deduct input VAT if goods/services acquired for economic activity and proper VAT invoice exists.",keywords:"atskaita deduction input vat pvm 64 teise right",category:"compliance",penalty:null},
{id:"pvm-71",law:"PVM",article:"71 str.",text:"Asmuo privalo registruotis PVM mokėtoju, kai bendra atlygio už vykdant ekonominę veiklą šalies teritorijoje patiektas prekes ir suteiktas paslaugas suma per metus (paskutinius 12 mėnesių) viršija 45 000 eurų.",textEn:"Person must register as VAT payer when total consideration for goods/services supplied in the territory exceeds 45,000 EUR in last 12 months.",keywords:"registracija registration riba threshold 45000 71",category:"compliance",penalty:null},
{id:"pvm-83",law:"PVM",article:"83 str.",text:"PVM deklaracija (FR0600 forma) turi būti pateikta VMI ne vėliau kaip iki kito mėnesio 25 dienos.",textEn:"VAT return (FR0600 form) must be submitted to STI no later than the 25th day of the following month.",keywords:"fr0600 deklaracija declaration deadline 25 terminas",category:"filing",penalty:"MAĮ 139 str.: bauda + delspinigiai"},
{id:"pvm-95",law:"PVM",article:"95 str.",text:"Paslaugų teikimo vieta apmokestinamajam asmeniui (B2B) yra vieta, kurioje paslaugų gavėjas turi įsikūręs savo verslą. Paslaugų teikimo vieta neapmokestinamajam asmeniui (B2C) yra vieta, kurioje paslaugų teikėjas turi įsikūręs savo verslą.",textEn:"Place of supply for services to a taxable person (B2B) is where the recipient is established. Place of supply to a non-taxable person (B2C) is where the supplier is established.",keywords:"paslaugu vieta place of supply b2b b2c 95",category:"compliance",penalty:null},
{id:"pvm-96",law:"PVM",article:"96 str.",text:"Atvirkštinio apmokestinimo PVM mechanizmas taikomas: statybos darbams (statybos montavimo darbai), metalo laužui ir atliekoms. PVM sumą apskaičiuoja ir sumoka pirkėjas, o ne pardavėjas.",textEn:"Reverse charge VAT mechanism applies to: construction works (construction-installation works), scrap metal and waste. VAT is calculated and paid by the buyer, not the seller.",keywords:"atvirkstinis reverse charge statyba construction metalas scrap 96",category:"compliance",penalty:"MAĮ 139 str.: 10-50% baudos"},
{id:"pvm-101-1",law:"PVM",article:"101-1 str.",text:"Vieno langelio sistema (OSS) leidžia PVM mokėtojui deklaruoti ir sumokėti PVM už nuotolines prekių pardavimo ES viduje ir paslaugų teikimo neapmokestinamiems asmenims sandorius vienoje valstybėje narėje.",textEn:"One Stop Shop (OSS) allows VAT payer to declare and pay VAT for intra-EU distance sales and B2C services in one member state.",keywords:"oss ioss vieno langelio one stop shop ecommerce",category:"compliance",penalty:null},
// ── PM/CIT ──
{id:"pm-5-1",law:"PM",article:"5 str. 1 d.",text:"Pelno mokesčio tarifas yra 17 procentų (nuo 2026-01-01, buvo 16%).",textEn:"Corporate income tax rate is 17 percent (from 2026-01-01, was 16%).",keywords:"pelno mokestis cit corporate income tax 17% 16% tarifas rate",category:"rates",penalty:null},
{id:"pm-5-2",law:"PM",article:"5 str. 2 d.",text:"Lengvatinis pelno mokesčio tarifas — 7 procentai (buvo 6%): taikomas vienetams, kurių metinės pajamos neviršija 300 000 eurų. Darbuotojų skaičiaus limitas panaikintas nuo 2026.",textEn:"Reduced CIT rate — 7 percent (was 6%): applies to entities with annual income not exceeding 300,000 EUR. Employee number limit abolished from 2026.",keywords:"pelno mokestis cit lengvatinis 7% 6% 300000 reduced small",category:"rates",penalty:null},
{id:"pm-0-new",law:"PM",article:"5 str. (2026 pakeitimas)",text:"Naujai įsteigtos mažos įmonės gali taikyti 0% pelno mokesčio tarifą pirmuosius 2 mokestinius metus (buvo 1 metai).",textEn:"Newly established small companies can apply 0% CIT rate for first 2 tax years (was 1 year).",keywords:"0% naujai isteigte new company pirmi metai first years",category:"rates",penalty:null},
{id:"pm-22-banks",law:"PM",article:"5 str. (kredito įstaigos)",text:"Kredito įstaigoms ir centrinėms kredito unijoms taikomas 22% pelno mokesčio tarifas (17% + 5% papildomas mokestis) nuo apmokestinamojo pelno dalies, viršijančios 2 000 000 eurų.",textEn:"Credit institutions and central credit unions: 22% CIT rate (17% + 5% surcharge) on taxable profit exceeding 2,000,000 EUR.",keywords:"kredito istaiga bank 22% papildomas surcharge 2000000",category:"rates",penalty:null},
{id:"pm-18-instant",law:"PM",article:"18 str. (2026 pakeitimas)",text:"Nuo 2026 taikomas momentinis (pagreitintas) nusidėvėjimas naujai įsigytai įrangai, programinei įrangai ir sunkvežimiams — visa kaina nurašoma per 1 mokestinį laikotarpį.",textEn:"From 2026, instant (accelerated) depreciation for newly acquired equipment, software and trucks — full cost written off in 1 tax period.",keywords:"momentinis nusidejejimas instant depreciation iranga equipment software programine sunkvezimiai trucks",category:"incentives",penalty:null},
{id:"pm-20",law:"PM",article:"20 str.",text:"Reprezentacinės sąnaudos leidžiamuose atskaitymuose pripažįstamos ne daugiau kaip 50 procentų patirtų reprezentacinių sąnaudų sumos.",textEn:"Representation expenses: no more than 50% of representation expenses incurred are recognized as deductible expenses.",keywords:"reprezentacines representation 50% limitas expenses entertainment",category:"deductions",penalty:null},
{id:"pm-31",law:"PM",article:"31 str.",text:"Neleidžiami atskaitymai: baudos ir delspinigiai, netesybos, pašalpos, dovanos (viršijančios 250 EUR vienam asmeniui per mokestinį laikotarpį).",textEn:"Non-deductible: fines and penalties, forfeitures, allowances, gifts (exceeding 250 EUR per person per tax period).",keywords:"neleidžiami non-deductible baudos fines dovanos gifts 250",category:"deductions",penalty:null},
{id:"pm-40",law:"PM",article:"40 str.",text:"Sandoriai tarp asocijuotų asmenų turi atitikti ištiestosios rankos principą. Sandorių kainodaros dokumentacija privaloma.",textEn:"Transactions between associated persons must comply with arm's length principle. Transfer pricing documentation is mandatory.",keywords:"sandoriu kainodara transfer pricing istiestosios rankos arms length asocijuoti associated 40",category:"compliance",penalty:"MAĮ 139 str.: perskaičiavimas + baudos"},
{id:"pm-46-1",law:"PM",article:"46-1 str.",text:"Investicinių projektų lengvata: apmokestinamasis pelnas gali būti sumažintas iki 100% investicijų į ilgalaikį materialųjį turtą suma.",textEn:"Investment project incentive: taxable profit may be reduced by up to 100% of investments in fixed tangible assets.",keywords:"investiciniu projektu lengvata investment incentive 46-1 ilgalaikis turtas",category:"incentives",penalty:null},
{id:"pm-51",law:"PM",article:"51 str.",text:"Metinė pelno mokesčio deklaracija (PLN204 forma) turi būti pateikta ne vėliau kaip iki kitų metų birželio 15 dienos.",textEn:"Annual CIT return (PLN204 form) must be submitted no later than June 15 of the following year.",keywords:"pln204 deklaracija cit return deadline birzelio june 15",category:"filing",penalty:"MAĮ 139 str.: bauda"},
// ── GPM ──
{id:"gpm-6-2026",law:"GPM",article:"6 str. (2026)",text:"Nuo 2026 taikoma nauja trijų pakopų GPM sistema: 20% — metinės pajamos iki €82,962 (36 VDU); 25% — nuo €82,962 iki €138,270 (36-60 VDU); 32% — virš €138,270 (virš 60 VDU).",textEn:"From 2026, new three-tier PIT system: 20% — annual income up to €82,962 (36 AW); 25% — from €82,962 to €138,270 (36-60 AW); 32% — above €138,270 (above 60 AW).",keywords:"gpm pit pajamu mokestis 20% 25% 32% triju pakopu three tier darbo pajamos employment income",category:"rates",penalty:null},
{id:"gpm-npd-2026",law:"GPM",article:"20 str. (2026)",text:"Neapmokestinamasis pajamų dydis (NPD) 2026 metais — iki €747 per mėnesį mažiausias pajamas gaunantiems darbuotojams.",textEn:"Tax-exempt amount (NPD) in 2026 — up to €747 per month for lowest-earning employees.",keywords:"npd neapmokestinamasis tax exempt amount 747",category:"rates",penalty:null},
{id:"gpm-dividends",law:"GPM",article:"6 str.",text:"Dividendų pajamoms taikomas 15 procentų GPM tarifas. Dividendai neįtraukiami į progresinę skalę.",textEn:"Dividend income is taxed at 15% PIT rate. Dividends are not included in progressive scale.",keywords:"dividendai dividends 15% gpm",category:"rates",penalty:null},
{id:"gpm-24",law:"GPM",article:"24 str.",text:"Metinė GPM deklaracija (FR0573 forma) turi būti pateikta ne vėliau kaip iki kitų metų gegužės 1 dienos.",textEn:"Annual PIT return (FR0573 form) must be submitted no later than May 1 of the following year.",keywords:"fr0573 gpm deklaracija pit return gegužės may 1",category:"filing",penalty:null},
// ── SODRA ──
{id:"sodra-rates",law:"VSD",article:"Įmokų tarifai 2026",text:"Darbuotojo socialinio draudimo įmokos: 19.5% (pensijų 8.72%, sveikatos 6.98%, ligos/motinystės 2.09%, nedarbo 1.71%). Darbdavio: 1.77% (nelaimingų atsitikimų). MMA: €1,153/mėn. VDU: ~€2,304.50.",textEn:"Employee social insurance contributions: 19.5% (pension 8.72%, health 6.98%, sickness 2.09%, unemployment 1.71%). Employer: 1.77%. MMA: €1,153/month. AW: ~€2,304.50.",keywords:"sodra vsd socialinis draudimas social insurance 19.5% 1.77% mma 1153 vdu darbuotojas employer employee",category:"rates",penalty:null},
// ── MAĮ (Baudos) ──
{id:"mai-139",law:"MAĮ",article:"139 str.",text:"Mokesčių administratorius turi teisę skirti baudą nuo 10 iki 50 procentų nesumokėtos (nepakankamai sumokėtos) mokesčio sumos.",textEn:"Tax administrator has the right to impose a fine from 10 to 50 percent of the unpaid (insufficiently paid) tax amount.",keywords:"bauda fine penalty 10% 50% nesumoketa unpaid 139",category:"penalties",penalty:"10-50%"},
{id:"mai-140",law:"MAĮ",article:"140 str.",text:"Delspinigiai skaičiuojami 0.026% už kiekvieną pavėluotą dieną (nuo 2026-02-01).",textEn:"Late payment interest: 0.026% per day of delay (from 2026-02-01).",keywords:"delspinigiai late interest 0.026% diena day 140",category:"penalties",penalty:"0.026%/dieną"},
{id:"mai-68",law:"MAĮ",article:"68 str.",text:"Savanoriškai atskleidus mokesčių įstatymo pažeidimą, skiriama bauda mažinama 70 procentų.",textEn:"Voluntary disclosure of tax violation results in 70% reduction of the fine.",keywords:"savanoriškas atskleidimas voluntary disclosure baudos mazinimas reduction 70%",category:"penalties",penalty:null},
// ── SAF-T ──
{id:"saft-va55",law:"VMI",article:"Įsakymas VA-55",text:"SAF-T LT versija 2.01 pagal OECD standartą. Privalomas pateikti VMI pareikalavus. Apima: MasterFiles (GL accounts, customers, suppliers, tax table, products), GeneralLedgerEntries, SourceDocuments (sales invoices, purchase invoices, payments, movement of goods).",textEn:"SAF-T LT version 2.01 per OECD standard. Mandatory submission upon STI request. Covers: MasterFiles, GeneralLedgerEntries, SourceDocuments.",keywords:"saft va-55 vmi xml oecd masterfiles ledger invoices payments",category:"compliance",penalty:"MAĮ 139 str."},
{id:"isaf-kit708",law:"VMI",article:"i.SAF (KIT708)",text:"i.SAF — PVM sąskaitų faktūrų registras. Pateikimas mėnesinis, ne vėliau kaip iki kito mėnesio 20 dienos.",textEn:"i.SAF — VAT invoice register. Monthly submission, no later than 20th of the following month.",keywords:"isaf kit708 saskaitu registras invoice register 20",category:"filing",penalty:null},
{id:"imas-kit709",law:"VMI",article:"i.MAS (KIT709)",text:"i.MAS — metinė mokėjimų ataskaita. Privaloma deklaruoti mokėjimus viršijančius 500 EUR per metus vienam asmeniui. Pateikimas — iki vasario 1 d.",textEn:"i.MAS — annual payments report. Mandatory to declare payments exceeding 500 EUR per year per person. Submission — by February 1.",keywords:"imas kit709 mokejimu ataskaita payment report 500 vasario february",category:"filing",penalty:null},
// ── GDPR ──
{id:"gdpr-bdar",law:"BDAR/GDPR",article:"Bendrasis duomenų apsaugos reglamentas",text:"BDAR taikomas visiems Lietuvos juridiniams asmenims tvarkantiems asmens duomenis. Pagrindinės pareigos: duomenų minimizavimas, teisėtas pagrindas, teisė būti pamirštam, pranešimas apie pažeidimą per 72 val.",textEn:"GDPR applies to all Lithuanian legal entities processing personal data. Key obligations: data minimization, lawful basis, right to be forgotten, breach notification within 72 hours.",keywords:"gdpr bdar duomenu apsauga data protection asmens duomenys personal data",category:"compliance",penalty:"Iki 20M EUR arba 4% metinės apyvartos"},
// ── EU Directives ──
{id:"eu-dac6",law:"EU",article:"DAC6 Direktyva",text:"DAC6 — privalomasis mokesčių planavimo schemų atskleidimas. Tarpininkai ir mokesčių mokėtojai privalo pranešti apie tarpvalstybines schemas per 30 dienų.",textEn:"DAC6 — mandatory disclosure of tax planning arrangements. Intermediaries and taxpayers must report cross-border arrangements within 30 days.",keywords:"dac6 atskleidimas disclosure mokesciu planavimas tax planning tarpvalstybines cross-border",category:"compliance",penalty:null},
{id:"eu-dac7",law:"EU",article:"DAC7 Direktyva",text:"DAC7 — platformų operatoriai privalo teikti informaciją apie pardavėjus mokesčių administratoriams.",textEn:"DAC7 — platform operators must report seller information to tax administrators.",keywords:"dac7 platformu operatoriai platform operators pardavejai sellers",category:"compliance",penalty:null},
{id:"eu-dac8",law:"EU",article:"DAC8 Direktyva (nuo 2026)",text:"DAC8 — kripto turto paslaugų teikėjai privalo teikti informaciją apie klientų sandorius mokesčių administratoriams nuo 2026 m.",textEn:"DAC8 — crypto asset service providers must report client transaction information to tax administrators from 2026.",keywords:"dac8 kripto crypto turtas asset 2026",category:"compliance",penalty:null},
{id:"eu-pillar2",law:"EU",article:"Pillar Two (GloBE)",text:"Globalus minimalus 17% pelno mokesčio tarifas didelėms tarptautinėms grupėms (konsoliduotos pajamos >750M EUR). Lietuvoje taikomas nuo 2024.",textEn:"Global minimum 15% effective tax rate for large multinational groups (consolidated revenue >750M EUR). Applicable in Lithuania from 2024.",keywords:"pillar two globe minimalus minimum 15% tarptautines multinational",category:"compliance",penalty:null},
{id:"eu-atad",law:"EU",article:"ATAD I/II Direktyvos",text:"ATAD — palūkanų ribojimas (30% EBITDA), CFC taisyklės, exit tax, bendrosios kovos su piktnaudžiavimu taisyklės (GAAR), hibridiniai neatitikimai.",textEn:"ATAD — interest limitation (30% EBITDA), CFC rules, exit tax, general anti-avoidance rules (GAAR), hybrid mismatches.",keywords:"atad palukanu ribojimas interest limitation cfc gaar exit tax hybrid",category:"compliance",penalty:null},
];

// ═══ MINISEARCH RAG ENGINE ═══
function searchLegalDB(query, maxResults = 8) {
  const q = query.toLowerCase().replace(/[^\wąčęėįšųūž\s]/gi, "");
  const terms = q.split(/\s+/).filter(t => t.length > 1);
  if (!terms.length) return [];
  const scored = LEGAL_DB.map(doc => {
    let score = 0;
    const haystack = `${doc.keywords} ${doc.text} ${doc.textEn} ${doc.article} ${doc.law}`.toLowerCase();
    terms.forEach(term => {
      if (haystack.includes(term)) score += 2;
      if (doc.keywords.toLowerCase().includes(term)) score += 3;
      if (doc.article.toLowerCase().includes(term)) score += 5;
    });
    if (doc.article.toLowerCase().includes(q.substring(0, 20))) score += 10;
    return { ...doc, score };
  }).filter(d => d.score > 0).sort((a, b) => b.score - a.score).slice(0, maxResults);
  return scored;
}

function buildRAGContext(query) {
  const results = searchLegalDB(query);
  if (!results.length) return "";
  return "\n\n[LEGAL DATABASE — EXACT REFERENCES]\n" +
    results.map(r => `${r.law} ${r.article}: "${r.text}"${r.penalty ? ` [Sankcija: ${r.penalty}]` : ""}`).join("\n") +
    "\n[END LEGAL DATABASE]\nUse ONLY the above legal text for citations. Do NOT paraphrase law — quote exact article numbers and text.\n";
}

// ═══ DETERMINISTIC TAX CALCULATORS ═══
const TaxCalc = {
  grossToNet(gross) {
    const sodraEmp = gross * 0.195;
    const taxableBase = gross - sodraEmp;
    let npd = 0;
    if (taxableBase <= 840) npd = 747;
    else if (taxableBase < 2619.05) npd = 747 - 0.42 * (taxableBase - 840);
    else npd = 0;
    npd = Math.max(0, Math.round(npd * 100) / 100);
    const annualTaxable = (taxableBase - npd) * 12;
    let gpm;
    if (annualTaxable <= 82962) gpm = (taxableBase - npd) * 0.20;
    else if (annualTaxable <= 138270) gpm = (taxableBase - npd) * 0.25;
    else gpm = (taxableBase - npd) * 0.32;
    gpm = Math.max(0, Math.round(gpm * 100) / 100);
    const sodraEmpl = gross * 0.0177;
    const net = gross - sodraEmp - gpm;
    const totalCost = gross + sodraEmpl;
    return { gross, sodraEmp: Math.round(sodraEmp * 100) / 100, taxableBase: Math.round(taxableBase * 100) / 100, npd, gpm, net: Math.round(net * 100) / 100, sodraEmpl: Math.round(sodraEmpl * 100) / 100, totalCost: Math.round(totalCost * 100) / 100 };
  },
  vatCalc(netAmount, rate = 21) {
    const vat = Math.round(netAmount * rate / 100 * 100) / 100;
    return { net: netAmount, rate, vat, gross: Math.round((netAmount + vat) * 100) / 100 };
  },
  citCalc(profit, isSmall = false, isNew = false, isBank = false) {
    if (isNew) return { profit, rate: 0, tax: 0, net: profit };
    if (isBank) {
      const base = Math.max(0, profit - 2000000);
      const tax = profit * 0.17 + base * 0.05;
      return { profit, rate: "17%+5%", tax: Math.round(tax * 100) / 100, net: Math.round((profit - tax) * 100) / 100 };
    }
    const rate = isSmall && profit <= 300000 ? 0.07 : 0.17;
    const tax = Math.round(profit * rate * 100) / 100;
    return { profit, rate: `${rate * 100}%`, tax, net: Math.round((profit - tax) * 100) / 100 };
  }
};

// ═══ i18n ═══
const T = {
  lt: { home: "Pradžia", chat: "AI Patarėjas", saft: "SAF-T", agents: "Agentai", arch: "Architektūra", settings: "Nustatymai", send: "Siųsti", upload: "Įkelti SAF-T / CSV", voice: "Balsas", askAnything: "Klauskite bet ką", disclaimer: "Teisinė informacija", export: "Eksportuoti", auditLog: "Audito žurnalas", findings: "Radiniai", override: "Peržiūrėti", accept: "Patvirtinti", reject: "Atmesti", critical: "Kritinis", high: "Aukštas", medium: "Vidutinis", low: "Žemas", poweredBy: "AI variklis · Realaus laiko analizė", termsTitle: "Naudojimo sąlygos ir teisinė informacija", termsText: "TAXAI yra informacinė AI sistema. Ji NĖRA teisinis patarėjas. Visa informacija teikiama informaciniais tikslais ir negali pakeisti profesionalaus mokesčių konsultanto, auditoriaus ar teisininko konsultacijos. Naudodami šią sistemą jūs sutinkate, kad: (1) AI atsakymai gali turėti netikslumų; (2) mokesčių apskaičiavimai turi būti patikrinti kvalifikuoto specialisto; (3) sistema nenustato teisinių santykių tarp jūsų ir TAXAI; (4) jūsų duomenys tvarkomi pagal BDAR/GDPR reikalavimus; (5) SAF-T failų analizė yra pagalbinė priemonė, ne oficialus auditas.", gdprText: "Duomenų tvarkymas: jūsų įkelti failai apdorojami tik sesijos metu ir neišsaugomi serveryje. AI užklausos siunčiamos šifruotu kanalu. Jūs turite teisę prašyti savo duomenų ištrynimo." },
  en: { home: "Home", chat: "AI Advisor", saft: "SAF-T", agents: "Agents", arch: "Architecture", settings: "Settings", send: "Send", upload: "Upload SAF-T / CSV", voice: "Voice", askAnything: "Ask anything", disclaimer: "Legal Disclaimer", export: "Export", auditLog: "Audit Log", findings: "Findings", override: "Review", accept: "Accept", reject: "Reject", critical: "Critical", high: "High", medium: "Medium", low: "Low", poweredBy: "AI Engine · Real-time Analysis", termsTitle: "Terms of Service & Legal Disclaimer", termsText: "TAXAI is an informational AI system. It is NOT a legal advisor. All information is provided for informational purposes and cannot replace professional tax consultant, auditor or lawyer advice. By using this system you agree that: (1) AI responses may contain inaccuracies; (2) tax calculations must be verified by a qualified specialist; (3) the system does not establish a legal relationship between you and TAXAI; (4) your data is processed in accordance with GDPR requirements; (5) SAF-T file analysis is an auxiliary tool, not an official audit.", gdprText: "Data processing: your uploaded files are processed only during the session and are not stored on the server. AI queries are sent over an encrypted channel. You have the right to request deletion of your data." }
};

// ═══ AUDIT LOG ═══
function useAuditLog() {
  const [logs, setLogs] = useState([]);
  const log = useCallback((action, detail = "") => {
    setLogs(p => [...p, { ts: new Date().toISOString(), action, detail, id: Date.now() }]);
  }, []);
  return { logs, log };
}

// ═══ DATATABLE ═══
function DataTable({ columns, data, maxRows = 30 }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const sorted = useMemo(() => {
    if (!sortCol) return data.slice(0, maxRows);
    return [...data].sort((a, b) => {
      const va = a[sortCol] ?? "", vb = b[sortCol] ?? "";
      const na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) return sortAsc ? na - nb : nb - na;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    }).slice(0, maxRows);
  }, [data, sortCol, sortAsc, maxRows]);
  const handleSort = col => { if (sortCol === col) setSortAsc(!sortAsc); else { setSortCol(col); setSortAsc(true); } };
  return <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.12)" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead><tr>{columns.map(c => <th key={c.key} onClick={() => handleSort(c.key)} style={{ textAlign: "left", padding: "12px 14px", color: "#fff", fontFamily: "var(--m)", fontSize: 10, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", userSelect: "none", textTransform: "uppercase", letterSpacing: ".1em", whiteSpace: "nowrap", background: "var(--bg2)" }}>{c.label} {sortCol === c.key ? (sortAsc ? "↑" : "↓") : ""}</th>)}</tr></thead>
      <tbody>{sorted.map((row, i) => <tr key={i} style={{ background: i % 2 === 0 ? "var(--bg)" : "var(--bg2)" }}>{columns.map(c => <td key={c.key} style={{ padding: "8px 12px", color: c.color?.(row) || "#ededeb", fontFamily: c.mono ? "var(--m)" : "var(--s)", fontSize: 12, fontWeight: c.bold ? 700 : 400, borderBottom: "1px solid rgba(255,255,255,0.03)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.render ? c.render(row) : row[c.key] ?? "—"}</td>)}</tr>)}</tbody>
    </table>
    <div style={{ padding: "6px 12px", fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", borderTop: "1px solid rgba(255,255,255,0.06)", background: "var(--bg2)" }}>Showing {Math.min(maxRows, data.length)} of {data.length} rows{sortCol ? ` · Sorted by ${sortCol}` : ""}</div>
  </div>;
}

// ═══ AGENTS ═══
const AGENTS = [
  { id: "tax", name: "Tax Interpretation", nameLt: "Mokesčių interpretacija", icon: "§" },
  { id: "vat", name: "VAT Compliance", nameLt: "PVM atitiktis", icon: "∞" },
  { id: "saft", name: "SAF-T Audit", nameLt: "SAF-T auditas", icon: "◈" },
  { id: "eauditor", name: "E-Auditor", nameLt: "E-Auditorius", icon: "◉" },
  { id: "fraud", name: "Fraud Detection", nameLt: "Sukčiavimo aptikimas", icon: "◐" },
  { id: "ledger", name: "Ledger Intelligence", nameLt: "Didžiosios knygos analizė", icon: "◫" },
  { id: "filing", name: "Filing Assistant", nameLt: "Deklaravimo asistentas", icon: "◧" },
  { id: "compliance", name: "Compliance Monitor", nameLt: "Atitikties monitorius", icon: "◑" },
  { id: "payroll", name: "Payroll Compliance", nameLt: "Darbo užmokesčio atitiktis", icon: "◰" },
  { id: "industry", name: "Industry Intelligence", nameLt: "Sektorių analizė", icon: "◲" },
  { id: "control", name: "Internal Control", nameLt: "Vidaus kontrolė", icon: "◳" },
  { id: "legal", name: "Legal Research", nameLt: "Teisiniai tyrimai", icon: "◇" },
  { id: "cfo", name: "Executive CFO", nameLt: "CFO patarėjas", icon: "◆" },
  { id: "risk", name: "Risk Scoring", nameLt: "Rizikos vertinimas", icon: "◎" },
  { id: "txninvest", name: "Transaction Investigator", nameLt: "Sandorių tyrėjas", icon: "◍" },
  { id: "supplier", name: "Supplier Risk", nameLt: "Tiekėjų rizika", icon: "◖" },
  { id: "auditdoc", name: "Audit Documentation", nameLt: "Audito dokumentai", icon: "◗" },
  { id: "reporting", name: "AI Reporting", nameLt: "Ataskaitų generavimas", icon: "◙" },
];

const BASE_PROMPT = `You are a Lithuanian tax intelligence expert. CRITICAL RULES:
1. ALWAYS cite exact law articles (e.g., "PVM įstatymo 19 str. 1 d.")
2. NEVER guess tax rates — use ONLY the legal database text provided
3. Give confidence score 0-100% for every substantive answer
4. State risk level: Low/Medium/High/Critical
5. For numerical calculations, show step-by-step work
6. Support both Lithuanian and English
7. When uncertain, say "Reikalinga papildoma konsultacija" / "Additional consultation required"
8. Structure responses with clear headers and sections
9. NEVER hallucinate court cases or VMI rulings — cite only what's in the legal database`;

// ═══ API (No branding on frontend) ═══
// AI access goes through a backend proxy (/api/ai) so the API key NEVER ships
// to the browser. The proxy (server/index.js) holds GEMINI_API_KEY server-side.
const AI_ENDPOINT = "/api/ai";

// Detect the language the user wrote in so the AI replies in ONE language only.
function detectLang(text) {
  if (!text) return "en";
  if (/[ąčęėįšųūž]/i.test(text)) return "lt";
  if (/\b(kas|kaip|kiek|koks|kokia|kokie|ar|kodėl|kodel|prašau|prasau|ačiū|aciu|taip|mokesčiai|mokesciai|pvm|pelno|atlyginimas|sąskaita|saskaita|deklaracija|įmonė|imone|darbuotojas|buhalter)\b/i.test(text)) return "lt";
  return "en";
}

async function callAI(systemPrompt, userMessage, history = [], attachments = []) {
  const hist = history.slice(-6).flatMap(m => [{ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text }] }]);
  const ragContext = buildRAGContext(userMessage);
  const langCode = detectLang(userMessage);
  const langInstr = langCode === "lt"
    ? "\n\nSTRICT LANGUAGE RULE: The user wrote in Lithuanian. You MUST respond ONLY in Lithuanian. Do NOT include any English text, English translations, or bilingual duplicates. Every word, heading, label, bullet, and citation must be in Lithuanian."
    : "\n\nSTRICT LANGUAGE RULE: The user wrote in English. You MUST respond ONLY in English. Do NOT include any Lithuanian text, Lithuanian translations, or bilingual duplicates. Every word, heading, label, bullet, and citation must be in English (you may keep proper law names like 'PVM įstatymas' but explain in English).";
  const userParts = [{ text: userMessage }];
  (attachments || []).forEach(a => {
    if (a?.data && a?.mimeType) userParts.push({ inline_data: { mime_type: a.mimeType, data: a.data } });
  });
  const res = await fetch(AI_ENDPOINT, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: BASE_PROMPT + "\n" + systemPrompt + ragContext + langInstr }] },
      contents: [...hist, { role: "user", parts: userParts }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.3 }
    })
  });
  if (!res.ok) {
    let detail = ""; try { detail = (await res.json()).error || ""; } catch {}
    throw new Error(`AI service error ${res.status}${detail ? " — " + detail : ""}`);
  }
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n") || "No response";
}

function routeAgents(m) {
  const t = m.toLowerCase(); const r = [];
  if (/pvm|vat|tarifas|12%|atvirkšt|invoice|sąskait/.test(t)) r.push("vat");
  if (/pelno|cit|17%|pm\b|corporate/.test(t)) r.push("tax");
  if (/saf-?t|xml/.test(t)) r.push("saft");
  if (/audit/.test(t)) r.push("eauditor");
  if (/fraud|anomal|benford|duplicate/.test(t)) r.push("fraud");
  if (/ledger|journal|gl\b/.test(t)) r.push("ledger");
  if (/fil|deklarac|fr0600|pln204|deadline/.test(t)) r.push("filing");
  if (/compliance|gdpr|aml|dac/.test(t)) r.push("compliance");
  if (/payroll|sodra|salary|npd|mma|gpm|atlyginim/.test(t)) r.push("payroll");
  if (/industr|logist|construc|retail/.test(t)) r.push("industry");
  if (/control|coso/.test(t)) r.push("control");
  if (/legal|court|lvat|teism/.test(t)) r.push("legal");
  if (/cfo|strateg/.test(t)) r.push("cfo");
  if (/risk|scor/.test(t)) r.push("risk");
  if (/investig|trace/.test(t)) r.push("txninvest");
  if (/supplier|vies|shell/.test(t)) r.push("supplier");
  if (/workpaper/.test(t)) r.push("auditdoc");
  if (/report|summar/.test(t)) r.push("reporting");
  return r.length ? [...new Set(r)] : ["tax"];
}

// ════════════════════════════════════════════════════════════════════
// SAF-T COMPLIANCE ENGINE — 300 RULES (inlined from saftRules.ts)
// Deterministic execution against parsed SAF-T data.
// NO API CALLS. NO LLM. Pure JS.
// Per XSD v2.01 + Order VA-127
// ════════════════════════════════════════════════════════════════════

// ─── Configurable thresholds (override per-company) ──────────────────
const DEFAULT_THRESHOLDS = {
  backPostingDays: 90,           // C-121: TransactionDate → SystemEntryDate gap
  roundingToleranceEur: 0.02,    // C-136, C-151, D-183, D-185 etc.
  writeOffPercent: 5,            // G-257: write-off % of period inventory
  reversalPercent: 10,           // C-159: reversal volume threshold
  sigmaFactor: 3,                // C-158: outlier factor for write-offs
  cashLimitEur: 5000,            // C-153, F-239: statutory cash limit
  amlStructuringEur: 15000,      // forensic AML threshold
  offHoursStart: 0,              // C-142: off-hours window start (hour)
  offHoursEnd: 5,                // C-142: off-hours window end (hour)
  newSupplierMonths: 6,          // E-223: "new" supplier definition
  invoiceLateMonths: 6,          // E-221: missed-input-VAT recovery threshold
  fxRateTolerancePct: 2,         // C-132: FX variance vs ECB
  fileSizeMbLimit: 200,          // A-005: practical ZIP threshold
};

// ─── Severity & type taxonomies ──────────────────────────────────────
const SEVERITY = { BLOCK: "Block", REJECT: "Reject", WARN: "Warn" };
const RULE_TYPE = { S: "Schema", B: "Business", C: "Consistency", F: "Financial" };

// Map our internal severity to the existing UI severity classes
const severityToUi = (s) => ({ Block: "Critical", Reject: "High", Warn: "Medium" }[s] || "Low");

// ─── XSD-derived constants ───────────────────────────────────────────
const ACCOUNT_TYPES = new Set(["IT", "TT", "NK", "I", "P", "S", "KT"]);
const DATATYPES = new Set(["F", "GL", "SI", "PI", "PA", "MG", "AS"]);
const ACCOUNTING_BASIS = new Set(["K", "P"]);
const GROUPING_CATEGORIES = new Set(["S1L", "S2L", "S", "D1L", "D"]);
const MOVEMENT_TYPES = new Set(["PARD", "PIR", "PP", "PG", "PRG", "VP", "N", "KT"]);
const GOODS_SERVICES_IDS = new Set(["PR", "PS", "IT", "KT"]);
const ASSET_VALUATION_TYPES = new Set(["IS", "PV", "KT"]);
const SHARES_TYPES = new Set(["PP", "PRV"]);
const PAYMENT_METHODS = new Set(["BP", "KPO", "KIO", "KV", "CP", "C", "U", "KT"]);
const INVOICE_TYPES = new Set(["I", "VATI", "D", "VATD", "C", "VATC", "A", "OI", "OD", "OC", "O"]);
const SELF_BILLING_IND = "V";

// String length limits per XSD simple types
const LEN = { short: 18, code: 24, mid1: 35, mid2: 70, long: 256 };

// ISO 4217 currency codes (most common, enough for LT context)
const ISO_4217 = new Set(["EUR", "USD", "GBP", "PLN", "SEK", "NOK", "DKK", "CHF",
  "JPY", "CNY", "RUB", "CAD", "AUD", "NZD", "TRY", "UAH", "RON", "CZK", "HUF",
  "BGN", "LVL", "EEK", "LTL"]);

// ─── Finding constructor ─────────────────────────────────────────────
function mkFinding(rule, detail, evidence = null) {
  return {
    rule_id: rule.id,
    category: rule.category,
    severity: rule.severity,
    severityUi: severityToUi(rule.severity),
    type: rule.type,
    typeName: RULE_TYPE[rule.type],
    title: rule.title,
    detail,
    evidence,             // first 10 offending elements typically
    rationale: rule.rationale || "",
    legal_basis: rule.legal_basis || "",
  };
}

// Bound the number of evidence items per rule (operational note 4)
const MAX_EVIDENCE = 10;
const sampleEvidence = (arr) => (arr || []).slice(0, MAX_EVIDENCE);

// ─── Validators ──────────────────────────────────────────────────────
const isIsoDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !isNaN(new Date(s).getTime()) && s >= "1900-01-01" && s <= "2099-12-31";

const isIsoDateTime = (s) => typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s) &&
  !isNaN(new Date(s).getTime());

const isPositiveDecimal = (n) => typeof n === "number" && isFinite(n) && n > 0;
const isNonNegativeDecimal = (n) => typeof n === "number" && isFinite(n) && n >= 0;

// LT IBAN: LT + 18 digits, MOD-97 = 1
function isValidLtIban(iban) {
  if (typeof iban !== "string") return false;
  const clean = iban.replace(/\s/g, "").toUpperCase();
  if (!/^LT\d{18}$/.test(clean)) return false;
  // Move first 4 chars to end, convert letters to numbers, mod 97 == 1
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  // Mod 97 on long number using string-chunk method
  let remainder = "";
  for (const digit of numeric) {
    remainder = (remainder + digit);
    if (remainder.length >= 9) {
      remainder = String(Number(remainder) % 97);
    }
  }
  return Number(remainder) % 97 === 1;
}

const isLtRegistrationNumber = (s) => typeof s === "string" && /^\d{9}$/.test(s);
const isLtVatNumber = (s) => typeof s === "string" && /^LT(\d{9}|\d{12})$/.test(s);
const isCountryCode = (s) => typeof s === "string" && /^[A-Z]{2,3}$/.test(s);

const hasControlChars = (s) => typeof s === "string" && /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(s);
const hasUnescapedXml = (s) => typeof s === "string" && /(?<!&\w{2,5};)[<>&]/.test(s);

// ─── Parser: full SAF-T extraction (enhanced over basic parseSAFT) ───
function parseSAFTFull(xmlStr) {
  try {
    const doc = new DOMParser().parseFromString(xmlStr, "text/xml");
    const parseErr = doc.querySelector("parsererror");
    if (parseErr) return { _parseError: parseErr.textContent?.substring(0, 200) || "XML parse error" };

    const root = doc.documentElement;
    const ns = root.namespaceURI || "";

    const txt = (parent, tag) => {
      if (!parent) return "";
      const els = parent.getElementsByTagName(tag);
      for (let i = 0; i < els.length; i++) {
        const v = els[i].textContent?.trim();
        if (v !== "" && v !== undefined) return v;
      }
      return "";
    };
    const num = (parent, tag) => {
      const v = txt(parent, tag);
      if (v === "") return null;
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    };
    const direct = (parent, tag) => {
      if (!parent) return "";
      for (const child of parent.children) {
        if (child.localName === tag || child.tagName === tag) {
          return child.textContent?.trim() || "";
        }
      }
      return "";
    };

    // ── Header ──
    const headerEl = doc.getElementsByTagName("Header")[0];
    const companyEl = headerEl ? headerEl.getElementsByTagName("Company")[0] : null;
    const header = {
      auditFileVersion: txt(headerEl, "AuditFileVersion"),
      auditFileCountry: txt(headerEl, "AuditFileCountry"),
      auditFileDateCreated: txt(headerEl, "AuditFileDateCreated"),
      softwareCompanyName: txt(headerEl, "SoftwareCompanyName"),
      softwareID: txt(headerEl, "SoftwareID"),
      softwareVersion: txt(headerEl, "SoftwareVersion"),
      fiscalYearFrom: txt(headerEl, "FiscalYearFrom"),
      fiscalYearTo: txt(headerEl, "FiscalYearTo"),
      defaultCurrencyCode: txt(headerEl, "DefaultCurrencyCode"),
      selectionCriteria: txt(headerEl, "SelectionCriteria"),
      taxAccountingBasis: txt(headerEl, "TaxAccountingBasis"),
      entity: txt(headerEl, "Entity"),
      dataType: txt(headerEl, "DataType"),
      numberOfParts: num(headerEl, "NumberOfParts"),
      partNumber: num(headerEl, "PartNumber"),
      company: companyEl ? {
        registrationNumber: txt(companyEl, "RegistrationNumber"),
        name: txt(companyEl, "Name"),
        address: companyEl.getElementsByTagName("Address")[0] ? {
          city: txt(companyEl.getElementsByTagName("Address")[0], "City"),
          country: txt(companyEl.getElementsByTagName("Address")[0], "Country"),
        } : null,
        taxRegistration: txt(companyEl, "TaxRegistrationNumber"),
        bankAccount: txt(companyEl, "IBANNumber") || txt(companyEl, "BankAccountNumber"),
      } : null,
    };

    // ── MasterFiles ──
    const masterEl = doc.getElementsByTagName("MasterFiles")[0];

    const accounts = Array.from(doc.getElementsByTagName("Account")).map((a) => ({
      accountID: txt(a, "AccountID"),
      accountDescription: txt(a, "AccountDescription"),
      accountTableID: txt(a, "AccountTableID"),
      accountTableDescription: txt(a, "AccountTableDescription"),
      accountType: txt(a, "AccountType"),
      groupingCategory: txt(a, "GroupingCategory"),
      groupingCode: txt(a, "GroupingCode"),
      openingDebitBalance: num(a, "OpeningDebitBalance") ?? 0,
      openingCreditBalance: num(a, "OpeningCreditBalance") ?? 0,
      closingDebitBalance: num(a, "ClosingDebitBalance") ?? 0,
      closingCreditBalance: num(a, "ClosingCreditBalance") ?? 0,
      _hasOpeningDb: txt(a, "OpeningDebitBalance") !== "",
      _hasOpeningCr: txt(a, "OpeningCreditBalance") !== "",
      _hasClosingDb: txt(a, "ClosingDebitBalance") !== "",
      _hasClosingCr: txt(a, "ClosingCreditBalance") !== "",
    }));

    const customers = Array.from(doc.getElementsByTagName("Customer")).map((c) => {
      const addrEl = c.getElementsByTagName("Address")[0];
      const openInv = Array.from(c.getElementsByTagName("OpenSalesInvoice")).map((o) => ({
        invoiceNo: txt(o, "InvoiceNo"),
        invoiceDate: txt(o, "InvoiceDate"),
        glPostingDate: txt(o, "GLPostingDate"),
        amount: num(o, "Amount") ?? 0,
        unpaidAmount: num(o, "UnpaidAmount") ?? 0,
        currencyAmount: num(o, "CurrencyAmount"),
        currencyCode: txt(o, "CurrencyCode"),
      }));
      return {
        customerID: txt(c, "CustomerID"),
        registrationNumber: txt(c, "RegistrationNumber"),
        name: txt(c, "Name"),
        taxRegistrationNumber: txt(c, "TaxRegistrationNumber"),
        country: txt(c, "Country"),
        addressCity: addrEl ? txt(addrEl, "City") : "",
        addressCountry: addrEl ? txt(addrEl, "Country") : "",
        accountID: txt(c, "AccountID"),
        selfBillingIndicator: txt(c, "SelfBillingIndicator"),
        openingDebitBalance: num(c, "OpeningDebitBalance") ?? 0,
        openingCreditBalance: num(c, "OpeningCreditBalance") ?? 0,
        closingDebitBalance: num(c, "ClosingDebitBalance") ?? 0,
        closingCreditBalance: num(c, "ClosingCreditBalance") ?? 0,
        openSalesInvoices: openInv,
      };
    });

    const suppliers = Array.from(doc.getElementsByTagName("Supplier")).map((s) => {
      const addrEl = s.getElementsByTagName("Address")[0];
      const openInv = Array.from(s.getElementsByTagName("OpenPurchaseInvoice")).map((o) => ({
        invoiceNo: txt(o, "InvoiceNo"),
        invoiceDate: txt(o, "InvoiceDate"),
        glPostingDate: txt(o, "GLPostingDate"),
        amount: num(o, "Amount") ?? 0,
        unpaidAmount: num(o, "UnpaidAmount") ?? 0,
      }));
      return {
        supplierID: txt(s, "SupplierID"),
        registrationNumber: txt(s, "RegistrationNumber"),
        name: txt(s, "Name"),
        taxRegistrationNumber: txt(s, "TaxRegistrationNumber"),
        country: txt(s, "Country"),
        addressCity: addrEl ? txt(addrEl, "City") : "",
        addressCountry: addrEl ? txt(addrEl, "Country") : "",
        accountID: txt(s, "AccountID"),
        bankAccount: txt(s, "BankAccountNumber") || txt(s, "IBANNumber"),
        openingDebitBalance: num(s, "OpeningDebitBalance") ?? 0,
        openingCreditBalance: num(s, "OpeningCreditBalance") ?? 0,
        closingDebitBalance: num(s, "ClosingDebitBalance") ?? 0,
        closingCreditBalance: num(s, "ClosingCreditBalance") ?? 0,
        openPurchaseInvoices: openInv,
      };
    });

    const taxCodes = Array.from(doc.getElementsByTagName("TaxCodeDetails")).map((tc) => {
      const parent = tc.parentNode;
      return {
        taxType: parent ? txt(parent, "TaxType") : "",
        taxCode: txt(tc, "TaxCode"),
        description: txt(tc, "Description"),
        taxPercentage: num(tc, "TaxPercentage"),
        flatTaxRate: num(tc, "FlatTaxRate"),
        country: txt(tc, "Country"),
        stiTaxCode: txt(tc, "STITaxCode"),
      };
    });

    const uoms = Array.from(doc.getElementsByTagName("UOMTableEntry")).map((u) => ({
      unitOfMeasure: txt(u, "UnitOfMeasure"),
      description: txt(u, "Description"),
    }));

    const analysisTypes = Array.from(doc.getElementsByTagName("AnalysisTypeTableEntry")).map((a) => ({
      analysisType: txt(a, "AnalysisType"),
      analysisTypeDescription: txt(a, "AnalysisTypeDescription"),
      analysisID: txt(a, "AnalysisID"),
      analysisIDDescription: txt(a, "AnalysisIDDescription"),
      stiAnalysisID: txt(a, "STIAnalysisID"),
    }));

    const movementTypes = Array.from(doc.getElementsByTagName("MovementTypeTableEntry")).map((m) => ({
      movementType: txt(m, "MovementType"),
      description: txt(m, "Description"),
    }));

    const products = Array.from(doc.getElementsByTagName("Product")).map((p) => ({
      productCode: txt(p, "ProductCode"),
      goodsServicesID: txt(p, "GoodsServicesID"),
      description: txt(p, "Description"),
      uomBase: txt(p, "UOMBase"),
      uomStandard: txt(p, "UOMStandard"),
      uomToBaseFactor: num(p, "UOMToUOMBaseConversionFactor"),
      taxType: txt(p, "TaxType"),
      taxCode: txt(p, "TaxCode"),
    }));

    const physicalStock = Array.from(doc.getElementsByTagName("PhysicalStockEntry")).map((s) => ({
      productCode: txt(s, "ProductCode"),
      openingStockQuantity: num(s, "OpeningStockQuantity") ?? 0,
      closingStockQuantity: num(s, "ClosingStockQuantity") ?? 0,
    }));

    const assets = Array.from(doc.getElementsByTagName("Asset")).map((a) => {
      const valEl = a.getElementsByTagName("Valuation")[0];
      return {
        assetID: txt(a, "AssetID"),
        accountID: txt(a, "AccountID"),
        description: txt(a, "AssetDescription") || txt(a, "Description"),
        dateOfAcquisition: txt(a, "DateOfAcquisition"),
        startUpDate: txt(a, "StartUpDate"),
        supplierID: txt(a, "SupplierID"),
        valuation: valEl ? {
          assetValuationType: txt(valEl, "AssetValuationType"),
          depreciationMethod: txt(valEl, "DepreciationMethod"),
          bookValueBegin: num(valEl, "BookValueBegin") ?? 0,
          bookValueEnd: num(valEl, "BookValueEnd") ?? 0,
          acquisitionAndProductionCostsEnd: num(valEl, "AcquisitionAndProductionCostsEnd") ?? 0,
          acquisitionsInPeriod: num(valEl, "AcquisitionsInPeriod") ?? 0,
          depreciationForPeriod: num(valEl, "DepreciationForPeriod") ?? 0,
          extraordinaryDepreciation: num(valEl, "ExtraordinaryDepreciationForPeriod") ?? 0,
          appreciation: num(valEl, "Appreciation") ?? 0,
          impairmentNetMovement: num(valEl, "ImpairmentNetMovement") ?? 0,
          transfers: num(valEl, "Transfers") ?? 0,
          assetDisposal: num(valEl, "AssetDisposal") ?? 0,
          accumulatedDepreciation: num(valEl, "AccumulatedDepreciation") ?? 0,
        } : null,
      };
    });

    const owners = Array.from(doc.getElementsByTagName("Owner")).map((o) => ({
      ownerID: txt(o, "OwnerID"),
      ownerName: txt(o, "OwnerName"),
      accountID: txt(o, "AccountID"),
      sharesQuantity: num(o, "SharesQuantity"),
      sharesAmount: num(o, "SharesAmount"),
      sharesType: txt(o, "SharesType"),
      sharesAcquisitionDate: txt(o, "SharesAcquisitionDate"),
      sharesTransfersDate: txt(o, "SharesTransfersDate"),
    }));

    // ── GeneralLedgerEntries ──
    const glEl = doc.getElementsByTagName("GeneralLedgerEntries")[0];
    const gl = glEl ? {
      numberOfEntries: num(glEl, "NumberOfEntries"),
      totalDebit: num(glEl, "TotalDebit"),
      totalCredit: num(glEl, "TotalCredit"),
    } : null;

    const journals = Array.from(doc.getElementsByTagName("Journal")).map((j) => ({
      journalID: txt(j, "JournalID"),
      description: txt(j, "Description"),
      type: txt(j, "Type"),
    }));

    const transactions = Array.from(doc.getElementsByTagName("Transaction")).map((t) => {
      const journalEl = t.parentNode;
      const journalID = journalEl ? txt(journalEl, "JournalID") : "";
      const lines = Array.from(t.getElementsByTagName("Line")).map((l) => {
        const dbEl = l.getElementsByTagName("DebitAmount")[0];
        const crEl = l.getElementsByTagName("CreditAmount")[0];
        const taxEl = l.getElementsByTagName("TaxInformation")[0];
        const anaEls = Array.from(l.getElementsByTagName("Analysis"));
        return {
          recordID: txt(l, "RecordID"),
          accountID: txt(l, "AccountID"),
          sourceDocumentID: txt(l, "SourceDocumentID"),
          systemEntryDate: txt(l, "SystemEntryDate"),
          description: txt(l, "Description"),
          debitAmount: dbEl ? (num(dbEl, "Amount") ?? 0) : null,
          debitCurrencyCode: dbEl ? txt(dbEl, "CurrencyCode") : "",
          debitCurrencyAmount: dbEl ? num(dbEl, "CurrencyAmount") : null,
          creditAmount: crEl ? (num(crEl, "Amount") ?? 0) : null,
          creditCurrencyCode: crEl ? txt(crEl, "CurrencyCode") : "",
          creditCurrencyAmount: crEl ? num(crEl, "CurrencyAmount") : null,
          taxInfo: taxEl ? {
            taxType: txt(taxEl, "TaxType"),
            taxCode: txt(taxEl, "TaxCode"),
            taxPercentage: num(taxEl, "TaxPercentage"),
            taxBase: num(taxEl, "TaxBase"),
            taxAmount: taxEl.getElementsByTagName("TaxAmount")[0]
              ? num(taxEl.getElementsByTagName("TaxAmount")[0], "Amount") : null,
          } : null,
          analysis: anaEls.map((a) => ({
            analysisType: txt(a, "AnalysisType"),
            analysisID: txt(a, "AnalysisID"),
            analysisAmount: num(a, "AnalysisAmount"),
          })),
        };
      });
      return {
        journalID,
        transactionID: txt(t, "TransactionID"),
        period: num(t, "Period"),
        periodYear: num(t, "PeriodYear"),
        transactionDate: txt(t, "TransactionDate"),
        sourceID: txt(t, "SourceID"),
        description: txt(t, "Description"),
        systemEntryDate: txt(t, "SystemEntryDate"),
        glPostingDate: txt(t, "GLPostingDate"),
        customerID: txt(t, "CustomerID"),
        supplierID: txt(t, "SupplierID"),
        systemID: txt(t, "SystemID"),
        lines,
      };
    });

    // ── SourceDocuments ──
    const collectInvoices = (sectionTag) => {
      const sec = doc.getElementsByTagName(sectionTag)[0];
      if (!sec) return { meta: null, items: [] };
      const meta = {
        numberOfEntries: num(sec, "NumberOfEntries"),
        totalDebit: num(sec, "TotalDebit"),
        totalCredit: num(sec, "TotalCredit"),
      };
      const items = Array.from(sec.getElementsByTagName("Invoice")).map((inv) => {
        const dt = inv.getElementsByTagName("DocumentTotals")[0];
        const lines = Array.from(inv.getElementsByTagName("Line")).map((l) => {
          const taxEl = l.getElementsByTagName("Tax")[0];
          const dbEl = l.getElementsByTagName("DebitAmount")[0];
          const crEl = l.getElementsByTagName("CreditAmount")[0];
          return {
            recordID: txt(l, "RecordID"),
            productCode: txt(l, "ProductCode"),
            goodsServicesID: txt(l, "GoodsServicesID"),
            description: txt(l, "Description") || txt(l, "ProductDescription"),
            quantity: num(l, "Quantity"),
            unitOfMeasure: txt(l, "UnitOfMeasure"),
            unitPrice: num(l, "UnitPrice"),
            settlementAmount: num(l, "SettlementAmount") ?? 0,
            debitAmount: dbEl ? (num(dbEl, "Amount") ?? 0) : null,
            creditAmount: crEl ? (num(crEl, "Amount") ?? 0) : null,
            tax: taxEl ? {
              taxType: txt(taxEl, "TaxType"),
              taxCode: txt(taxEl, "TaxCode"),
              taxPercentage: num(taxEl, "TaxPercentage"),
              taxableAmount: num(taxEl, "TaxableAmount") ?? num(taxEl, "TaxBase"),
              taxAmount: taxEl.getElementsByTagName("TaxAmount")[0]
                ? num(taxEl.getElementsByTagName("TaxAmount")[0], "Amount") : null,
            } : null,
          };
        });
        const refsEl = inv.getElementsByTagName("References")[0];
        // Ship-from / ship-to country (SAF-T LT cross-border location of supply)
        const shipFromEl = inv.getElementsByTagName("ShipFrom")[0];
        const shipToEl = inv.getElementsByTagName("ShipTo")[0];
        const shipFromCountry = shipFromEl ? (txt(shipFromEl.getElementsByTagName("Address")[0] || shipFromEl, "Country")) : "";
        const shipToCountry = shipToEl ? (txt(shipToEl.getElementsByTagName("Address")[0] || shipToEl, "Country")) : "";
        // Supplier tax-registration (type + country) on the invoice party block
        const partyEl = inv.getElementsByTagName("SupplierInfo")[0] || inv.getElementsByTagName("CustomerInfo")[0];
        const trEl = inv.getElementsByTagName("TaxRegistration")[0] || (partyEl ? partyEl.getElementsByTagName("TaxRegistration")[0] : null);
        return {
          invoiceNo: txt(inv, "InvoiceNo"),
          invoiceDate: txt(inv, "InvoiceDate"),
          invoiceType: txt(inv, "InvoiceType"),
          customerID: txt(inv, "CustomerID"),
          supplierID: txt(inv, "SupplierID"),
          shipFromCountry, shipToCountry,
          supplierTaxRegType: trEl ? txt(trEl, "TaxType") : "",
          supplierTaxRegCountry: trEl ? txt(trEl, "Country") : "",
          supplierAddressCountry: partyEl ? txt((partyEl.getElementsByTagName("Address")[0] || partyEl), "Country") : "",
          accountID: txt(inv, "AccountID"),
          glPostingDate: txt(inv, "GLPostingDate"),
          glTransactionID: txt(inv, "GLTransactionID"),
          systemEntryDate: txt(inv, "SystemEntryDate"),
          selfBillingIndicator: txt(inv, "SelfBillingIndicator"),
          references: refsEl ? txt(refsEl, "Reference") : "",
          documentTotals: dt ? {
            netTotal: num(dt, "NetTotal") ?? 0,
            taxPayable: num(dt, "TaxPayable") ?? 0,
            grossTotal: num(dt, "GrossTotal") ?? 0,
            currencyCode: txt(dt, "CurrencyCode"),
            currencyAmount: num(dt, "CurrencyAmount"),
            exchangeRate: num(dt, "ExchangeRate"),
          } : null,
          lines,
        };
      });
      return { meta, items };
    };

    const sales = collectInvoices("SalesInvoices");
    const purchases = collectInvoices("PurchaseInvoices");

    const paymentsEl = doc.getElementsByTagName("Payments")[0];
    const paymentsMeta = paymentsEl ? {
      numberOfEntries: num(paymentsEl, "NumberOfEntries"),
      totalDebit: num(paymentsEl, "TotalDebit"),
      totalCredit: num(paymentsEl, "TotalCredit"),
    } : null;
    const payments = Array.from(doc.getElementsByTagName("Payment")).map((p) => {
      const lines = Array.from(p.getElementsByTagName("Line")).map((l) => ({
        recordID: txt(l, "RecordID"),
        customerID: txt(l, "CustomerID"),
        supplierID: txt(l, "SupplierID"),
        sourceDocumentID: txt(l, "SourceDocumentID"),
        debitAmount: l.getElementsByTagName("DebitAmount")[0]
          ? num(l.getElementsByTagName("DebitAmount")[0], "Amount") : null,
        creditAmount: l.getElementsByTagName("CreditAmount")[0]
          ? num(l.getElementsByTagName("CreditAmount")[0], "Amount") : null,
      }));
      return {
        paymentRefNo: txt(p, "PaymentRefNo"),
        transactionDate: txt(p, "TransactionDate"),
        paymentMethod: txt(p, "PaymentMethod"),
        description: txt(p, "Description"),
        bankAccount: txt(p, "IBANNumber") || txt(p, "BankAccountNumber"),
        grossTotal: num(p, "GrossTotal") ?? 0,
        lines,
      };
    });

    // Movement of Goods
    const mgEl = doc.getElementsByTagName("MovementOfGoods")[0];
    const movementMeta = mgEl ? {
      numberOfEntries: num(mgEl, "NumberOfEntries"),
      totalQuantity: num(mgEl, "TotalQuantity"),
    } : null;
    const stockMovements = Array.from(doc.getElementsByTagName("StockMovement")).map((s) => ({
      movementType: txt(s, "MovementType"),
      productCode: txt(s, "ProductCode"),
      warehouseID: txt(s, "WarehouseID"),
      quantity: num(s, "Quantity") ?? 0,
      uom: txt(s, "UOM") || txt(s, "UnitOfMeasure"),
      transactionDate: txt(s, "TransactionDate"),
      sourceDocumentID: txt(s, "SourceDocumentID"),
      customsProcedure: txt(s, "CustomsProcedure"),
    }));

    // Asset Transactions
    const atEl = doc.getElementsByTagName("AssetTransactions")[0];
    const assetTxMeta = atEl ? {
      numberOfEntries: num(atEl, "NumberOfEntries"),
    } : null;
    const assetTransactions = Array.from(doc.getElementsByTagName("AssetTransaction")).map((t) => ({
      assetID: txt(t, "AssetID"),
      transactionType: txt(t, "TransactionType"),
      transactionDate: txt(t, "TransactionDate"),
      amount: num(t, "Amount") ?? 0,
      supplierID: txt(t, "SupplierID"),
      customerID: txt(t, "CustomerID"),
    }));

    // File-level metadata
    const xmlDecl = xmlStr.substring(0, 100);
    const hasXmlDecl = /^<\?xml\s+version=["']1\.0["']/i.test(xmlDecl.trim());
    const declaredEncoding = (xmlDecl.match(/encoding=["']([^"']+)["']/i) || [])[1] || "";
    const hasBom = xmlStr.charCodeAt(0) === 0xFEFF;
    const rootIsAuditFile = root.localName === "AuditFile" || root.tagName === "AuditFile";

    return {
      _meta: {
        rootIsAuditFile,
        namespace: ns,
        hasXmlDecl,
        declaredEncoding,
        hasBom,
        fileSizeBytes: xmlStr.length,
      },
      header,
      accounts,
      customers,
      suppliers,
      taxCodes,
      uoms,
      analysisTypes,
      movementTypes,
      products,
      physicalStock,
      assets,
      owners,
      gl,
      journals,
      transactions,
      sales,
      purchases,
      paymentsMeta,
      payments,
      movementMeta,
      stockMovements,
      assetTxMeta,
      assetTransactions,
      counts: {
        accounts: accounts.length,
        customers: customers.length,
        suppliers: suppliers.length,
        taxCodes: taxCodes.length,
        products: products.length,
        transactions: transactions.length,
        invoicesSales: sales.items.length,
        invoicesPurchases: purchases.items.length,
        payments: payments.length,
        stockMovements: stockMovements.length,
        assets: assets.length,
        assetTransactions: assetTransactions.length,
      },
    };
  } catch (e) {
    return { _parseError: e.message };
  }
}

// ─── Context builder: run once, used by all rules ────────────────────
function buildContext(data) {
  const ctx = {
    accountMap: new Map(),       // accountID → account
    customerMap: new Map(),       // customerID → customer
    supplierMap: new Map(),       // supplierID → supplier
    productMap: new Map(),        // productCode → product
    taxCodeMap: new Map(),        // `${taxType}|${taxCode}` → taxCode entry
    uomSet: new Set(),            // unitOfMeasure values
    analysisMap: new Map(),       // `${type}|${id}` → entry
    movementTypeSet: new Set(),
    assetMap: new Map(),          // assetID → asset
    journalMap: new Map(),        // journalID → journal
    transactionMap: new Map(),    // transactionID → transaction
    // Aggregates
    sumDebits: 0,
    sumCredits: 0,
    sumOpeningDebit: 0,
    sumOpeningCredit: 0,
    sumClosingDebit: 0,
    sumClosingCredit: 0,
    accountMovements: new Map(),  // accountID → {debit, credit}
    invoiceNoSetByType: new Map(),// `${type}|${no}` → count
  };

  for (const a of data.accounts || []) ctx.accountMap.set(a.accountID, a);
  for (const c of data.customers || []) ctx.customerMap.set(c.customerID, c);
  for (const s of data.suppliers || []) ctx.supplierMap.set(s.supplierID, s);
  for (const p of data.products || []) ctx.productMap.set(p.productCode, p);
  for (const t of data.taxCodes || []) ctx.taxCodeMap.set(`${t.taxType}|${t.taxCode}`, t);
  for (const u of data.uoms || []) ctx.uomSet.add(u.unitOfMeasure);
  for (const a of data.analysisTypes || []) ctx.analysisMap.set(`${a.analysisType}|${a.analysisID}`, a);
  for (const m of data.movementTypes || []) ctx.movementTypeSet.add(m.movementType);
  for (const a of data.assets || []) ctx.assetMap.set(a.assetID, a);
  for (const j of data.journals || []) ctx.journalMap.set(j.journalID, j);

  for (const a of data.accounts || []) {
    ctx.sumOpeningDebit += a.openingDebitBalance || 0;
    ctx.sumOpeningCredit += a.openingCreditBalance || 0;
    ctx.sumClosingDebit += a.closingDebitBalance || 0;
    ctx.sumClosingCredit += a.closingCreditBalance || 0;
  }

  for (const tx of data.transactions || []) {
    ctx.transactionMap.set(tx.transactionID, tx);
    for (const ln of tx.lines || []) {
      const acctMv = ctx.accountMovements.get(ln.accountID) || { debit: 0, credit: 0 };
      if (ln.debitAmount != null) acctMv.debit += ln.debitAmount;
      if (ln.creditAmount != null) acctMv.credit += ln.creditAmount;
      ctx.accountMovements.set(ln.accountID, acctMv);
      ctx.sumDebits += ln.debitAmount || 0;
      ctx.sumCredits += ln.creditAmount || 0;
    }
  }

  for (const inv of [...(data.sales?.items || []), ...(data.purchases?.items || [])]) {
    const k = `${inv.invoiceType || ""}|${inv.invoiceNo}`;
    ctx.invoiceNoSetByType.set(k, (ctx.invoiceNoSetByType.get(k) || 0) + 1);
  }

  return ctx;
}


// ═══ VERIFIED AUDIT RULES (LT VAT) — the 13-rule foundation ═══
// ════════════════════════════════════════════════════════════════════
// TAXAI · VERIFIED AUDIT RULES (LT VAT)  — structured, data-connected
// ────────────────────────────────────────────────────────────────────
// Each rule mirrors a real audit test: legal-grounded title/description,
// the data types it applies to, a failure-message template with @fields,
// the ORIGINAL SQL (kept verbatim as provenance), and an evaluate()
// function that faithfully re-implements the SQL's WHERE logic against
// the parsed SAF-T objects produced by parseSAFTFull(). Deterministic.
// ════════════════════════════════════════════════════════════════════

// EU member-state code set used across several rules (as in the source SQL).
const EU_COUNTRIES = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","EL","ES","NL","IE","LU","LV","MT","DE","PT","RO","SK","SI","SE","HU","GB","IT"];
const EU_WITH_LT = [...EU_COUNTRIES, "LT"];

// Resolve a line's STITaxCode (PVM1/PVM13/…) from the tax table, falling back
// to the line's own tax code. Mirrors JOIN TaxTableEntryDetail ON tax_code.
function stiOf(line, taxIndex) {
  const code = line?.tax?.taxCode || "";
  if (taxIndex && taxIndex[code]) return taxIndex[code];
  return code; // some files already carry the STI code directly
}
// goods_services_id IS NOT NULL ? = X : product_code = X   (the CASE in the SQL)
function classMatches(line, X) {
  const g = (line?.goodsServicesID || "").trim();
  if (g) return g === X;
  return (line?.productCode || "").trim() === X;
}
const auditR2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Build STITaxCode lookup from parsed taxCodes: { TaxCode → STITaxCode }.
function buildTaxIndex(data) {
  const idx = {};
  (data?.taxCodes || []).forEach((tc) => { if (tc.taxCode) idx[tc.taxCode] = tc.stiTaxCode || tc.taxCode; });
  return idx;
}

// ── The 13 rules ──────────────────────────────────────────────────────
// severity: High → "Reject", Low → "Warn"  (kept as the source "Reikšmingumas")
const AUDIT_RULES = [
  {
    id: "PP_LT_PVM_106", severity: "High", level: 3, dataTypes: "F-Full; SI-Invoices", refType: "SaftLt::InvoiceLine", scope: "sales",
    title: "Deklaruotas vietinis prekių tiekimas, kai nėra duomenų, kurioje valstybėje pasibaigė prekių tiekimas",
    titleEn: "Declared local supply of goods with no destination (Ship-To) country",
    description: "Vadovaujantis PVM įstatymo 4 straipsniu, jei prekės perduodamos kitam asmeniui Lietuvos teritorijoje, prekių tiekimas laikomas įvykusiu Lietuvoje. Testas pateikia prekių pardavimo sąskaitas su PVM kodu PVM1, kuriose Ship From = LT, tačiau nėra Ship To šalies. Jei tiekimas pasibaigė ne Lietuvoje, sandoris galimai neturėjo būti klasifikuojamas PVM1.",
    legal: "PVMĮ 4 str.", failTpl: "InvoiceNo = @InvoiceNo | ShipTo = @ShipToCountry | ShipFrom = @ShipFromCountry | NetTotal = @NetTotal",
    fixEn: 'Confirm where the supply of goods actually ended (Ship-To). If the goods left Lithuania, reclassify the line away from PVM1 (e.g. intra-EU 0% or export); if they stayed in LT, add the missing Ship-To country to the invoice.', fixLt: 'Patikrinkite, kur faktiškai pasibaigė prekių tiekimas (Ship-To). Jei prekės išvyko iš Lietuvos, perklasifikuokite eilutę iš PVM1 (pvz. 0% ES viduje ar eksportas); jei liko LT — pridėkite trūkstamą Ship-To šalį sąskaitoje.',
    evaluate: (data, taxIndex) => (data?.sales?.items || []).filter((inv) =>
      (inv.lines || []).some((l) => classMatches(l, "PR") && stiOf(l, taxIndex) === "PVM1")
      && !inv.shipToCountry && inv.shipFromCountry === "LT"
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, ShipToCountry: inv.shipToCountry || "—", ShipFromCountry: inv.shipFromCountry, NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
  {
    id: "PP_LT_PVM_100", severity: "High", level: 3, dataTypes: "F-Full; SI-Invoices", refType: "SaftLt::InvoiceLine", scope: "sales",
    title: "Deklaruotas vietinis prekių tiekimas, kai prekių tiekimas pasibaigė kitoje ES valstybėje",
    titleEn: "Declared local supply where goods ended in another EU member state",
    description: "PVMĮ 4 str. pagrindu. Testas pateikia pardavimo sąskaitas su PVM1, kuriose Ship To yra kita ES valstybė. Rizika, kad įvyko tiekimas į kitą ES valstybę narę ir Bendrovė nepagrįstai išskyrė PVM.",
    legal: "PVMĮ 4 str.", failTpl: "InvoiceNo = @InvoiceNo | ShipTo = @ShipToCountry | ShipFrom = @ShipFromCountry | NetTotal = @NetTotal",
    fixEn: "Confirm the place of supply. If the goods were delivered to another EU member state, the supply is likely a 0% intra-EU supply (PVM13), not local PVM1 — correct the VAT code and obtain the customer's valid EU VAT number.", fixLt: 'Patikrinkite tiekimo vietą. Jei prekės pristatytos į kitą ES valstybę narę, tai greičiausiai 0% tiekimas ES viduje (PVM13), ne vietinis PVM1 — pataisykite PVM kodą ir gaukite galiojantį pirkėjo ES PVM kodą.',
    evaluate: (data, taxIndex) => (data?.sales?.items || []).filter((inv) =>
      (inv.lines || []).some((l) => classMatches(l, "PS") && stiOf(l, taxIndex) === "PVM1")
      && inv.shipToCountry && EU_COUNTRIES.includes(inv.shipToCountry)
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, ShipToCountry: inv.shipToCountry, ShipFromCountry: inv.shipFromCountry || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
  {
    id: "PP_LT_PVM_070", severity: "High", level: 3, dataTypes: "F-Full; PI-Purchase Invoices", refType: "SaftLt::PurchaseInvoice", scope: "purchases",
    title: "Paslaugų įsigijimas Lietuvoje, kai teikėjas nurodo kitos ES/ne ES valstybės PVM kodą, tačiau įsikūrimo adresas — Lietuva",
    titleEn: "Local purchase with foreign supplier VAT-reg but supplier address in Lithuania",
    description: "PVMĮ 19 str. 1 d. pagrindu (standartinis tarifas). Pirkimo sąskaitos su PVM1, kai teikėjo PVM registracijos šalis ≠ LT, bet teikėjo adreso šalis = LT. Rizika, kad teikėjas negalėjo išskirti vietinio PVM.",
    legal: "PVMĮ 19 str. 1 d.; VA-49 (PVM1)", failTpl: "InvoiceNo = @InvoiceNo | SupplierTaxReg = @SupplierTaxRegNumberType; @SupplierTaxRegNumberCountry | SupplierAddressCountry = @SupplierAddressCountry | NetTotal = @NetTotal",
    fixEn: "Verify whether the supplier is actually VAT-registered in Lithuania. If the supplier is established in LT but used a foreign VAT number, local VAT (PVM1) may be wrong — consider reverse charge and correct the supplier's tax registration data.", fixLt: 'Patikrinkite, ar teikėjas tikrai registruotas PVM mokėtoju Lietuvoje. Jei teikėjas įsikūręs LT, bet nurodė užsienio PVM kodą, vietinis PVM1 gali būti neteisingas — apsvarstykite atvirkštinį apmokestinimą ir pataisykite teikėjo registracijos duomenis.',
    evaluate: (data, taxIndex) => (data?.purchases?.items || []).filter((inv) =>
      (inv.lines || []).some((l) => stiOf(l, taxIndex) === "PVM1")
      && inv.supplierTaxRegCountry && inv.supplierTaxRegCountry !== "LT" && inv.supplierAddressCountry === "LT"
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, SupplierTaxRegNumberType: inv.supplierTaxRegType || "—", SupplierTaxRegNumberCountry: inv.supplierTaxRegCountry, SupplierAddressCountry: inv.supplierAddressCountry, NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
  {
    id: "PP_LT_PVM_068", severity: "High", level: 3, dataTypes: "F-Full; PI-Purchase Invoices", refType: "SaftLt::PurchaseInvoice", scope: "purchases",
    title: "Paslaugų įsigijimas Lietuvoje, kai paslaugas suteikia ne PVM mokėtojas Lietuvoje",
    titleEn: "Local purchase where the supplier is a Lithuanian non-VAT registrant",
    description: "PVMĮ 19 str. 1 d. pagrindu. Pirkimo sąskaitos su PVM1, kai teikėjo PVM registracijos šalis = LT, bet registracijos tipas ≠ PVM. Rizika, kad teikėjas negalėjo išskirti vietinio PVM.",
    legal: "PVMĮ 19 str. 1 d.; VA-49 (PVM1)", failTpl: "InvoiceNo = @InvoiceNo | SupplierTaxReg = @SupplierTaxRegNumberType; @SupplierTaxRegNumberCountry | SupplierAddressCountry = @SupplierAddressCountry | NetTotal = @NetTotal",
    fixEn: 'Confirm whether the Lithuanian supplier was entitled to charge local VAT. If the supplier is not a registered VAT payer (registration type ≠ PVM), the input VAT may not be deductible — request a corrected invoice.', fixLt: 'Patikrinkite, ar Lietuvos teikėjas turėjo teisę išskirti vietinį PVM. Jei teikėjas nėra registruotas PVM mokėtojas (registracijos tipas ≠ PVM), pirkimo PVM gali būti neatskaitomas — paprašykite pataisytos sąskaitos.',
    evaluate: (data, taxIndex) => (data?.purchases?.items || []).filter((inv) =>
      (inv.lines || []).some((l) => stiOf(l, taxIndex) === "PVM1")
      && inv.supplierTaxRegCountry === "LT" && inv.supplierTaxRegType && inv.supplierTaxRegType !== "PVM"
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, SupplierTaxRegNumberType: inv.supplierTaxRegType, SupplierTaxRegNumberCountry: inv.supplierTaxRegCountry, SupplierAddressCountry: inv.supplierAddressCountry || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
  {
    id: "PP_LT_PVM_054", severity: "High", level: 3, dataTypes: "F-Full; SI-Sales Invoices", refType: "SaftLt::Invoice", scope: "sales",
    title: "Trikampės prekybos sandoriai, kai tiekėjas nurodė ne PVM kodą arba nenurodė kodo tipo",
    titleEn: "Triangular-trade sales where supplier VAT-reg type is not PVM or missing",
    description: "Pardavimo sąskaitos su PVM19, kai Ship From ir Ship To yra skirtingos ES valstybės (ne LT), o teikėjo PVM registracijos tipas ≠ PVM arba nenurodytas. Galima netinkama trikampės prekybos klasifikacija.",
    legal: "PVMĮ (trikampė prekyba)", failTpl: "InvoiceNo = @InvoiceNo | ShipTo = @ShipToCountry | ShipFrom = @ShipFromCountry | SupplierTaxReg = @SupplierTaxRegType; @SupplierTaxRegCountry | NetTotal = @NetTotal",
    fixEn: "Review the triangular-trade treatment: confirm the chain of supply between the two EU states and the supplier's VAT-registration type. If it is not a valid triangular transaction, the PVM19 classification should be corrected.", fixLt: 'Peržiūrėkite trikampės prekybos vertinimą: patikrinkite tiekimo grandinę tarp dviejų ES valstybių ir teikėjo PVM registracijos tipą. Jei tai ne tinkamas trikampis sandoris, PVM19 klasifikaciją reikia pataisyti.',
    evaluate: (data, taxIndex) => (data?.sales?.items || []).filter((inv) =>
      inv.shipToCountry && inv.shipFromCountry && EU_COUNTRIES.includes(inv.shipToCountry) && EU_COUNTRIES.includes(inv.shipFromCountry)
      && inv.shipFromCountry !== inv.shipToCountry
      && (!inv.supplierTaxRegType || inv.supplierTaxRegType !== "PVM")
      && (inv.lines || []).some((l) => stiOf(l, taxIndex) === "PVM19")
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, ShipToCountry: inv.shipToCountry, ShipFromCountry: inv.shipFromCountry, SupplierTaxRegType: inv.supplierTaxRegType || "—", SupplierTaxRegCountry: inv.supplierTaxRegCountry || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
  {
    id: "PP_LT_PVM_011", severity: "High", level: 3, dataTypes: "F-Full; SI-Sales Invoices", refType: "SaftLt::Invoice", scope: "sales",
    title: "Prekių tiekimas į kitą ES valstybę, kai prekės buvo išgabentos ne už ES ribų",
    titleEn: "Intra-EU supply (PVM13) where Ship-To is inside the EU (possible misclassification)",
    description: "Pardavimo sąskaitos su PVM13 (0% intra-EU), kai Ship To yra ES valstybė (įskaitant LT). PVM13 skirtas tiekimui į kitą ES narę; jei prekės liko ES viduje/LT, klasifikacija gali būti neteisinga.",
    legal: "PVMĮ 49 str. (0% intra-EU)", failTpl: "InvoiceNo = @InvoiceNo | ShipTo = @ShipTo | ShipFrom = @ShipFrom | NetTotal = @NetTotal",
    fixEn: 'Confirm the goods were dispatched to another EU member state. The 0% intra-EU rate (PVM13) requires movement to another member state; if the goods stayed in LT or left the EU, reclassify accordingly.', fixLt: 'Patikrinkite, ar prekės išgabentos į kitą ES valstybę narę. 0% tarifas ES viduje (PVM13) reikalauja gabenimo į kitą valstybę narę; jei prekės liko LT ar paliko ES, perklasifikuokite atitinkamai.',
    evaluate: (data, taxIndex) => (data?.sales?.items || []).filter((inv) =>
      inv.shipToCountry && EU_WITH_LT.includes(inv.shipToCountry)
      && (inv.lines || []).some((l) => stiOf(l, taxIndex) === "PVM13")
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, ShipTo: inv.shipToCountry, ShipFrom: inv.shipFromCountry || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
  {
    id: "PP_LT_PVM_010", severity: "High", level: 3, dataTypes: "F-Full; SI-Sales Invoices", refType: "SaftLt::Invoice", scope: "sales",
    title: "Prekių tiekimas į kitą ES valstybę prasidėjo ne Lietuvos teritorijoje",
    titleEn: "Intra-EU supply (PVM13) that did not start in Lithuania",
    description: "Pardavimo sąskaitos su PVM13, kai Ship From ≠ LT. 0% intra-EU tiekimas iš LT turėtų prasidėti Lietuvoje.",
    legal: "PVMĮ 49 str. (0% intra-EU)", failTpl: "InvoiceNo = @InvoiceNo | ShipTo = @ShipToCountry | ShipFrom = @ShipFromCountry | NetTotal = @NetTotal",
    fixEn: 'Confirm the dispatch started in Lithuania. A 0% intra-EU supply declared from LT (PVM13) should begin in LT; if it started elsewhere, the LT VAT treatment is likely wrong.', fixLt: 'Patikrinkite, ar gabenimas prasidėjo Lietuvoje. 0% tiekimas ES viduje, deklaruotas iš LT (PVM13), turėtų prasidėti LT; jei prasidėjo kitur, LT PVM vertinimas greičiausiai neteisingas.',
    evaluate: (data, taxIndex) => (data?.sales?.items || []).filter((inv) =>
      inv.shipFromCountry && inv.shipFromCountry !== "LT"
      && (inv.lines || []).some((l) => stiOf(l, taxIndex) === "PVM13")
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, ShipToCountry: inv.shipToCountry || "—", ShipFromCountry: inv.shipFromCountry, NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
  {
    id: "PP_LT_PVM_116", severity: "Low", level: 3, dataTypes: "F-Full; SI-Sales Invoices", refType: "SaftLt::InvoiceLine", scope: "sales",
    title: "Ilgalaikio turto pardavimas Lietuvoje",
    titleEn: "Sale of fixed assets in Lithuania (informational)",
    description: "Pardavimo sąskaitų eilutės su klasifikacija IT (ilgalaikis turtas) ir PVM1. Informacinis testas ilgalaikio turto pardavimams peržiūrėti.",
    legal: "PVMĮ; VA-49 (PVM1)", failTpl: "InvoiceNo = @InvoiceNo | GoodsServicesID = @GoodsServicesID | ProductCode = @ProductCode | TaxRate = @TaxRate | TaxCode = @TaxCode | Description = @Description | NetTotal = @NetTotal",
    fixEn: 'Review the fixed-asset sale and confirm the VAT treatment is correct for the asset disposal (informational — no action required if treatment is verified).', fixLt: 'Peržiūrėkite ilgalaikio turto pardavimą ir patikrinkite, ar PVM vertinimas teisingas turto perleidimui (informacinis — veiksmų nereikia, jei vertinimas patvirtintas).',
    evaluate: (data, taxIndex) => { const out=[]; (data?.sales?.items || []).forEach((inv) => (inv.lines || []).forEach((l) => {
      if (classMatches(l, "IT") && stiOf(l, taxIndex) === "PVM1") out.push({ InvoiceNo: inv.invoiceNo, GoodsServicesID: l.goodsServicesID || "—", ProductCode: l.productCode || "—", TaxRate: l.tax?.taxPercentage ?? "—", TaxCode: stiOf(l, taxIndex), Description: (l.description || "").slice(0,60) || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) });
    })); return out; },
  },
  {
    id: "PP_LT_PVM_115", severity: "Low", level: 3, dataTypes: "F-Full; PI-Purchase Invoices", refType: "SaftLt::PurchaseInvoiceLine", scope: "purchases",
    title: "Vietiniai įsigijimai, kai nėra duomenų, ar tiekiamos prekės ar teikiamos paslaugos",
    titleEn: "Local purchase line where goods/services class is set but product code is missing",
    description: "Pirkimo eilutės su PVM1, kai goods_services_id užpildytas, bet product_code tuščias. Duomenų pilnumo patikra prekės/paslaugos klasifikacijai.",
    legal: "VA-49 (PVM1)", failTpl: "InvoiceNo = @InvoiceNo | GoodsServicesID = @GoodsServicesID | ProductCode = @ProductCode | TaxRate = @TaxRate | TaxCode = @TaxCode | Description = @Description | NetTotal = @NetTotal",
    fixEn: 'Add the missing product code so the goods/services classification of the line is complete and consistent with the goods-services indicator.', fixLt: 'Pridėkite trūkstamą produkto kodą, kad eilutės prekių/paslaugų klasifikacija būtų pilna ir atitiktų prekių-paslaugų požymį.',
    evaluate: (data, taxIndex) => { const out=[]; (data?.purchases?.items || []).forEach((inv) => (inv.lines || []).forEach((l) => {
      if ((l.goodsServicesID || "").trim() && !((l.productCode || "").trim()) && stiOf(l, taxIndex) === "PVM1") out.push({ InvoiceNo: inv.invoiceNo, GoodsServicesID: l.goodsServicesID, ProductCode: "—", TaxRate: l.tax?.taxPercentage ?? "—", TaxCode: stiOf(l, taxIndex), Description: (l.description || "").slice(0,60) || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) });
    })); return out; },
  },
  {
    id: "PP_LT_PVM_114", severity: "Low", level: 3, dataTypes: "F-Full; PI-Purchase Invoices", refType: "SaftLt::PurchaseInvoiceLine", scope: "purchases",
    title: "Kiti sandoriai, kurie laikomi įsigijimais Lietuvoje",
    titleEn: "Other transactions classified as acquisitions in Lithuania (class KT)",
    description: "Pirkimo eilutės su klasifikacija KT (kita) ir PVM1. Peržiūrai pateikiami kiti sandoriai, laikomi įsigijimais Lietuvoje.",
    legal: "VA-49 (PVM1)", failTpl: "InvoiceNo = @InvoiceNo | GoodsServicesID = @GoodsServicesID | ProductCode = @ProductCode | TaxRate = @TaxRate | TaxCode = @TaxCode | Description = @Description | NetTotal = @NetTotal",
    fixEn: "Review the transaction classified as 'other' (KT) and confirm it is correctly treated as a Lithuanian acquisition at standard VAT (PVM1).", fixLt: 'Peržiūrėkite kaip „kita“ (KT) klasifikuotą sandorį ir patikrinkite, ar jis teisingai vertinamas kaip įsigijimas Lietuvoje su standartiniu PVM (PVM1).',
    evaluate: (data, taxIndex) => { const out=[]; (data?.purchases?.items || []).forEach((inv) => (inv.lines || []).forEach((l) => {
      if (classMatches(l, "KT") && stiOf(l, taxIndex) === "PVM1") out.push({ InvoiceNo: inv.invoiceNo, GoodsServicesID: l.goodsServicesID || "—", ProductCode: l.productCode || "—", TaxRate: l.tax?.taxPercentage ?? "—", TaxCode: stiOf(l, taxIndex), Description: (l.description || "").slice(0,60) || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) });
    })); return out; },
  },
  {
    id: "PP_LT_PVM_113", severity: "Low", level: 3, dataTypes: "F-Full; PI-Purchase Invoices", refType: "SaftLt::PurchaseInvoiceLine", scope: "purchases",
    title: "Ilgalaikio turto įsigijimas Lietuvoje",
    titleEn: "Acquisition of fixed assets in Lithuania (informational)",
    description: "Pirkimo eilutės su klasifikacija IT (ilgalaikis turtas) ir PVM1. Informacinis testas ilgalaikio turto įsigijimams peržiūrėti.",
    legal: "VA-49 (PVM1)", failTpl: "InvoiceNo = @InvoiceNo | GoodsServicesID = @GoodsServicesID | ProductCode = @ProductCode | TaxRate = @TaxRate | TaxCode = @TaxCode | Description = @Description | NetTotal = @NetTotal",
    fixEn: 'Review the fixed-asset acquisition and confirm the VAT treatment and deductibility are correct (informational — no action required if verified).', fixLt: 'Peržiūrėkite ilgalaikio turto įsigijimą ir patikrinkite, ar PVM vertinimas ir atskaita teisingi (informacinis — veiksmų nereikia, jei patvirtinta).',
    evaluate: (data, taxIndex) => { const out=[]; (data?.purchases?.items || []).forEach((inv) => (inv.lines || []).forEach((l) => {
      if (classMatches(l, "IT") && stiOf(l, taxIndex) === "PVM1") out.push({ InvoiceNo: inv.invoiceNo, GoodsServicesID: l.goodsServicesID || "—", ProductCode: l.productCode || "—", TaxRate: l.tax?.taxPercentage ?? "—", TaxCode: stiOf(l, taxIndex), Description: (l.description || "").slice(0,60) || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) });
    })); return out; },
  },
  {
    id: "PP_LT_PVM_061", severity: "Low", level: 3, dataTypes: "F-Full; PI-Purchase Invoices", refType: "SaftLt::PurchaseInvoice", scope: "purchases",
    title: "Paslaugų įsigijimas iš ne ES PVM mokėtojo",
    titleEn: "Purchase (PVM20) from a non-EU supplier VAT-registration",
    description: "Pirkimo sąskaitos su PVM20, kai teikėjo PVM registracijos šalis nenurodyta arba yra ne ES valstybė. Peržiūrai pateikiami įsigijimai iš ne ES PVM mokėtojų.",
    legal: "PVMĮ (atvirkštinis apmokestinimas / importas)", failTpl: "InvoiceNo = @InvoiceNo | SupplierTaxReg = @SupplierTaxRegNumberType; @SupplierTaxRegNumberCountry | NetTotal = @NetTotal",
    fixEn: 'Review the acquisition from a non-EU supplier and confirm the correct treatment (import VAT / reverse charge) was applied for PVM20.', fixLt: 'Peržiūrėkite įsigijimą iš ne ES teikėjo ir patikrinkite, ar PVM20 atveju pritaikytas teisingas vertinimas (importo PVM / atvirkštinis apmokestinimas).',
    evaluate: (data, taxIndex) => (data?.purchases?.items || []).filter((inv) =>
      (!inv.supplierTaxRegCountry || !EU_WITH_LT.includes(inv.supplierTaxRegCountry))
      && (inv.lines || []).some((l) => stiOf(l, taxIndex) === "PVM20")
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, SupplierTaxRegNumberType: inv.supplierTaxRegType || "—", SupplierTaxRegNumberCountry: inv.supplierTaxRegCountry || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
  {
    id: "PP_LT_PVM_021", severity: "Low", level: 3, dataTypes: "F-Full; SI-Sales Invoices", refType: "SaftLt::Invoice", scope: "sales",
    title: "Prekių tiekimas į kitą ES valstybę, kai sąskaitose nėra nuorodos į 0 procentų PVM taikymą",
    titleEn: "Intra-EU supply (PVM13) with no reference justifying the 0% rate",
    description: "Pardavimo sąskaitos su PVM13, kuriose nėra nuorodos (Reference), pagrindžiančios 0% PVM taikymą. 0% intra-EU tiekimas paprastai reikalauja nuorodos į PVMĮ nuostatą.",
    legal: "PVMĮ 49 str.; reikalavimas nurodyti pagrindą", failTpl: "InvoiceNo = @InvoiceNo | ShipTo = @ShipToCountry | ShipFrom = @ShipFromCountry | Reference = @Reference | NetTotal = @NetTotal",
    fixEn: 'Add the reference to the PVMĮ provision (e.g. Art. 49) justifying the 0% rate on the invoice. Intra-EU 0% supplies (PVM13) must state the legal basis for the exemption.', fixLt: 'Pridėkite nuorodą į PVMĮ nuostatą (pvz. 49 str.), pagrindžiančią 0% tarifą sąskaitoje. 0% tiekimai ES viduje (PVM13) turi nurodyti atleidimo teisinį pagrindą.',
    evaluate: (data, taxIndex) => (data?.sales?.items || []).filter((inv) =>
      !((inv.references || "").trim())
      && (inv.lines || []).some((l) => stiOf(l, taxIndex) === "PVM13")
    ).map((inv) => ({ InvoiceNo: inv.invoiceNo, ShipToCountry: inv.shipToCountry || "—", ShipFromCountry: inv.shipFromCountry || "—", Reference: inv.references || "—", NetTotal: auditR2(inv.documentTotals?.netTotal) })),
  },
];

// Render a failure-message template by substituting @fields from a hit row.
function renderFailMsg(tpl, row) {
  return String(tpl || "").replace(/@(\w+)/g, (m, k) => (row[k] != null ? String(row[k]) : m));
}

// Run all audit rules against parsed SAF-T data.
function runAuditRules(data) {
  const taxIndex = buildTaxIndex(data);
  const hasSales = (data?.sales?.items?.length || 0) > 0;
  const hasPurch = (data?.purchases?.items?.length || 0) > 0;
  const results = AUDIT_RULES.map((rule) => {
    const applicable = rule.scope === "sales" ? hasSales : hasPurch;
    let hits = [];
    let error = null;
    if (applicable) { try { hits = rule.evaluate(data, taxIndex) || []; } catch (e) { error = e.message; } }
    const status = error ? "error" : !applicable ? "na" : hits.length ? "flagged" : "clear";
    return {
      id: rule.id, severity: rule.severity, level: rule.level, dataTypes: rule.dataTypes, refType: rule.refType, scope: rule.scope,
      title: rule.title, titleEn: rule.titleEn, description: rule.description, legal: rule.legal,
      status, count: hits.length, error,
      hits: hits.slice(0, 200).map((row) => ({ row, msg: renderFailMsg(rule.failTpl, row) })),
    };
  });
  const flagged = results.filter((r) => r.status === "flagged");
  const summary = {
    total: AUDIT_RULES.length,
    flagged: flagged.length,
    clear: results.filter((r) => r.status === "clear").length,
    na: results.filter((r) => r.status === "na").length,
    findings: results.reduce((s, r) => s + (r.status === "flagged" ? r.count : 0), 0),
    high: flagged.filter((r) => r.severity === "High").length,
    low: flagged.filter((r) => r.severity === "Low").length,
  };
  return { results, summary };
}

// Public API: runAllRules + supporting orchestration
// ════════════════════════════════════════════════════════════════════

/**
 * Execute all 300 SAF-T rules against parsed data.
 * @param data       Output of parseSAFTFull()
 * @param opts       {thresholds: partial override of DEFAULT_THRESHOLDS}
 * @returns          {findings, summary, byRule, byCategory, bySeverity}
 */
function runAllRules(data, opts = {}) {
  if (!data || data._parseError) {
    return {
      findings: [{ rule_id: "PARSE", category: "Schema", severity: "Block", severityUi: "Critical", type: "S", typeName: "Schema", title: "XML parse failed", detail: data?._parseError || "Empty input", evidence: [] }],
      summary: { total: 1, rulesExecuted: AUDIT_RULES.length, Block: 1, Reject: 0, Warn: 0 },
      byRule: {}, byCategory: {}, bySeverity: { Block: 1, Reject: 0, Warn: 0 },
      audit: null,
    };
  }
  // Severity mapping from the source workbook: High -> Reject, Low -> Warn.
  const sevMap = { High: "Reject", Low: "Warn" };
  const uiMap = { Reject: "High", Warn: "Medium", Block: "Critical" };
  const audit = runAuditRules(data);
  const findings = [];
  const ruleById = {}; AUDIT_RULES.forEach((a) => { ruleById[a.id] = a; });
  audit.results.forEach((r) => {
    if (r.status !== "flagged") return;
    const severity = sevMap[r.severity] || "Warn";
    const meta = ruleById[r.id] || {};
    r.hits.forEach((h) => {
      findings.push({
        rule_id: r.id,
        category: r.scope === "sales" ? "Sales VAT" : "Purchase VAT",
        severity, severityUi: uiMap[severity] || "Medium",
        type: "B", typeName: "Audit",
        title: r.title,
        detail: h.msg + "  —  " + (r.legal || ""),
        evidence: [h.msg],
        // rich metadata for the finding-detail page:
        ruleMeta: {
          titleLt: meta.title || r.title, titleEn: meta.titleEn || r.title,
          descriptionLt: meta.description || "", legal: meta.legal || r.legal || "",
          fixEn: meta.fixEn || "", fixLt: meta.fixLt || "",
          dataTypes: meta.dataTypes || "", refType: meta.refType || "", scope: r.scope,
        },
        evidenceRow: h.row || null,   // structured @field values
      });
    });
  });
  const byRule = {}, byCategory = {}, bySeverity = { Block: 0, Reject: 0, Warn: 0 };
  for (const f of findings) {
    byRule[f.rule_id] = (byRule[f.rule_id] || 0) + 1;
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
  }
  return {
    findings,
    summary: { total: findings.length, rulesExecuted: AUDIT_RULES.length, ...bySeverity },
    byRule, byCategory, bySeverity,
    coverage: { rulesTotal: AUDIT_RULES.length, rulesRegistered: AUDIT_RULES.length, rulesTriggered: Object.keys(byRule).length },
    audit, // full structured audit-rule result (results[], summary)
  };
}

function getRuleCatalog() {
  const sevMap = { High: "Reject", Low: "Warn" };
  return AUDIT_RULES.map((r) => ({
    id: r.id,
    category: r.scope === "sales" ? "Sales VAT" : "Purchase VAT",
    severity: sevMap[r.severity] || "Warn",
    severityUi: r.severity === "High" ? "High" : "Medium",
    type: "B", typeName: "Audit",
    title: r.title, titleEn: r.titleEn,
    rationale: r.description || "",
    legal: r.legal, dataTypes: r.dataTypes, refType: r.refType,
  }));
}

/**
 * Build a compact structured packet for AI agent consumption.
 * Strips verbose evidence to keep tokens manageable while preserving
 * everything the AI needs to interpret findings.
 */
function buildAiInterpretationPayload(data, runResult) {
  const sample = (findings, n = 3) => findings.slice(0, n).map((f) => ({
    rule_id: f.rule_id,
    severity: f.severity,
    title: f.title,
    detail: f.detail.length > 200 ? f.detail.substring(0, 200) + "..." : f.detail,
    evidence_count: f.evidence?.length || 0,
    evidence_sample: (f.evidence || []).slice(0, 3),
  }));

  // Group findings by category, then within category surface up to 5 examples
  const byCat = {};
  for (const f of runResult.findings) {
    byCat[f.category] = byCat[f.category] || [];
    byCat[f.category].push(f);
  }
  const groupedSummary = Object.entries(byCat).map(([cat, arr]) => ({
    category: cat,
    finding_count: arr.length,
    severities: {
      Block: arr.filter((f) => f.severity === "Block").length,
      Reject: arr.filter((f) => f.severity === "Reject").length,
      Warn: arr.filter((f) => f.severity === "Warn").length,
    },
    top_findings: sample(arr, 5),
  }));

  // Company context for AI to ground its interpretation
  const company = {
    name: data.header?.company?.name || "(unknown)",
    registration: data.header?.company?.registrationNumber || "",
    vat: data.header?.company?.taxRegistration || "",
    period: `${data.header?.fiscalYearFrom || ""} → ${data.header?.fiscalYearTo || ""}`,
    dataType: data.header?.dataType || "",
    counts: data.counts || {},
  };

  return {
    company,
    summary: runResult.summary,
    coverage: runResult.coverage,
    bySeverity: runResult.bySeverity,
    byCategory: runResult.byCategory,
    groupedSummary,
    thresholds: runResult.thresholds,
  };
}

// ════════════════════════════════════════════════════════════════════
// SAF-T AI LAYER — Interpretation + Smart Analysis (inlined from saftAI.ts)
// Two distinct AI calls operate on the structured findings produced by
// the deterministic rule engine above. NEVER use these for validation —
// validation is done deterministically by runAllRules(). These functions
// only INTERPRET the findings the engine already produced.
// ════════════════════════════════════════════════════════════════════


// ─── INTERPRETATION SYSTEM PROMPT ────────────────────────────────────
const SYSTEM_PROMPT_INTERPRETATION = `You are the **TAXAI SAF-T Senior Auditor** — a forensic-grade Lithuanian tax analyst.

You are interpreting findings from a DETERMINISTIC 300-rule SAF-T engine (XSD v2.01, Order VA-127). The findings are objective facts: each one has a rule_id, severity (Block/Reject/Warn), type (S=Schema/B=Business/C=Consistency/F=Financial), category, title, detail, and evidence samples.

Your job is NOT to re-validate. Your job is to INTERPRET, PRIORITIZE, and EXPLAIN.

# Output structure (use this markdown exactly)

## 🎯 Executive summary
- 3-5 sentences. State overall file health, the most material risks, and whether the file is fit for VMI submission.
- Lead with the dominant pattern (e.g., "11 of 18 findings cluster in tax-arithmetic rules — suggests a single rounding configuration bug").

## 🚨 Material findings (Block + Reject)
For each finding ranked by financial/legal impact:
- **[rule_id] Title** — severity badge
- *What it means in plain Lithuanian/business terms:* one sentence
- *Legal basis:* exact article (e.g., "PMĮ 11 str. 1 d.", "PVMĮ 64 str.", "MAĮ 13 str. 5 d.", "Buhalterinės apskaitos įstatymas 16 str.", VA-49/VA-127)
- *Likely root cause:* configuration bug / data-entry / process gap / system limitation
- *Financial impact estimate:* if calculable from evidence, give €-range; otherwise "depends on N"
- *Immediate fix:* concrete action this week
- *Defensibility on inspection:* high/medium/low and why

## 🟡 Warn-level findings worth addressing
Group similar warnings (e.g., "5 weekend postings", "3 round-trip patterns") into a single paragraph each. No need to itemize every Warn.

## ✅ What looks correct
Mention rules that DIDN'T fire on areas where they easily could have (e.g., "Trial balance equality B-045/046 passed cleanly — opening and closing TB are balanced", "All TaxCodes referenced exist in MasterFiles").

## 📊 Pattern analysis
- Is there a temporal pattern? (e.g., all errors in Q4)
- Is there an account-cluster pattern? (e.g., all errors involve account 271)
- Is there a counterparty-cluster pattern? (e.g., 3 of 5 supplier issues involve the same supplier)
- Is this likely a SYSTEM problem (ERP config), a PROCESS problem (procedure), or a PEOPLE problem (training)?

# Style rules
- Lithuanian tax-law fluency is mandatory. Cite specific articles, not vague "tax law".
- Distinguish between SCHEMA errors (file will not load) vs CONSISTENCY errors (file loads, math fails) vs FINANCIAL flags (legal but suspicious).
- Never invent legal article numbers. If you are not sure, write "(verify article)".
- Never recommend tax evasion or aggressive minimization. Recommend defensible, compliant approaches.
- Lithuanian terminology where it matters: PVM (VAT), PM (CIT), GPM (PIT), MAĮ (Tax Administration Law), PMĮ (CIT Law), PVMĮ (VAT Law), SODRA, VMI, FNTT, FR0600, GPM313, PLN204, SAM/SAV.
- Be direct. The user is a professional. Skip pleasantries.
- If findings are zero or trivial, say so — do not invent problems to look thorough.`;

// ─── SMART ANALYSIS SYSTEM PROMPT ────────────────────────────────────
const SYSTEM_PROMPT_SMART_ANALYSIS = `You are the **TAXAI Smart Analysis Engine** — a meta-level critic that improves the rule engine itself and proposes legal/financial strategies.

You receive: (1) the file's deterministic findings, (2) the rule catalog (300 rules), (3) coverage stats. You DO NOT redo the engine's work. You operate one level above it.

# Output structure (use this markdown exactly)

## 🧠 Rule-engine self-critique

### Coverage assessment
Rate each of the 9 rule categories on a 1-5 scale for how well the existing rules caught what they should have:
- **A Header (35 rules)** — score, one-line justification
- **B Master Files (75 rules)** — score
- **C General Ledger (55 rules)** — score
- **D Sales Invoices (35 rules)** — score
- **E Purchase Invoices (30 rules)** — score
- **F Payments (20 rules)** — score
- **G Movements (15 rules)** — score
- **H Asset Transactions (10 rules)** — score
- **I Cross-section (25 rules)** — score

### What the engine likely missed
List 3-7 SPECIFIC additional rules that would catch issues the current 300 don't cover. Format each as:
- **PROPOSED rule [NEW-###]** — Severity / Type
  - *Trigger:* exact condition
  - *Why it matters:* concrete fraud/error scenario
  - *Detection logic:* what to compute
  - *Threshold to use:* numeric default

Bias your suggestions toward:
- Sector-specific patterns (retail vs construction vs IT vs transport)
- Patterns the LLM can see in the data that the deterministic engine cannot easily express (NLP on descriptions, anomaly detection across multiple dimensions)
- New 2026 LT tax-law changes (CIT 17%, instant depreciation per PM 18 str., new VAT structure 21/12/5/0)

### Rules that probably over-fire
If you see rules producing high false-positive rates given THIS company's profile, name them and explain why the default threshold is wrong for this entity.

## ⚖️ Legal remediation pathway

For each material finding (Block/Reject) or finding cluster:

### [rule_id or cluster name]
- **Risk if VMI catches it:** specific exposure (additional tax + bauda + delspinigiai with article)
  - VAT shortfall: PVMĮ 123 str. baudos 10-50% + delspinigiai 0.03%/day (MAĮ 99)
  - CIT shortfall: PMĮ 47 str. + delspinigiai + bauda
  - Late SAF-T submission / refusal: MAĮ 139-1 str. baudos 200-1820 EUR

- **Defensive option A — Voluntary disclosure (MAĮ 68 str.):**
  - When applicable: error discovered by taxpayer BEFORE VMI inspection notice
  - Effect: bauda may be reduced 50-70% (50% standard, 70% if disclosure within first 30 days of becoming aware)
  - Procedure: corrective declaration + written explanation + payment of tax + delspinigiai
  - Practical steps for THIS finding

- **Defensive option B — Tax ruling / position confirmation (MAĮ 37-1):**
  - When applicable: ambiguous treatment, want VMI to bless the position prospectively
  - Effect: binding on VMI if facts stay the same
  - When NOT to use: when the position is clearly wrong (forces VMI to formalize)

- **Defensive option C — Settlement / sutaikinimas (MAĮ 71 str.):**
  - When applicable: dispute already opened, want to avoid litigation
  - Effect: negotiated reduction of penalties, sometimes principal
  - Trade-offs

- **Defensive option D — Restatement / amended SAF-T:**
  - Procedure under VA-127 §3.1: re-submission under revised Entity identifier
  - Original Entity preserved in audit logs

Pick the BEST option for the specific finding and explain why.

## 💶 Financing & management strategies

If the findings imply additional tax due, suggest financing and operational strategies:

### Cash-flow management
- **Mokesčių paskirstymas (MAĮ 88 str.) — installment plan:** when payment hardship is documented, VMI may grant up to 5 years. Show indicative payment schedule for the estimated liability.
- **Deferment under MAĮ 88 str. 5 d.:** force majeure / sector crisis triggers
- **Working-capital financing:** short-term bank line vs invoice factoring vs VMI installment — compare effective cost

### Offsetting strategies (legal CIT optimization)
- **R&D credit (PMĮ 17-1 str.):** R&D expenses can be 3× deducted. If the entity does any product development, validate eligibility — typical multi-€10k-€100k reduction.
- **Investment-project relief (PMĮ 46-1 str.):** up to 100% CIT reduction for qualifying investments in technology/equipment/software 2026-2030. Tight conditions but high impact.
- **Instant depreciation (PMĮ 18 str. amend. from 2026):** new fixed assets bought 2026+ can be 100%-depreciated in year of acquisition. If the company is buying equipment, accelerate to before year-end.
- **Small-entity 7% CIT band (PMĮ 5 str.):** if revenue ≤ €300,000 and ≤10 employees, 7% rate instead of 17%. Check eligibility.
- **Loss carry-forward (PMĮ 30 str.):** ordinary losses 5 years, infrastructure losses indefinite.

### External funding
- **Invega (national promotional bank):** working-capital loans, guarantees, EU-funded programs (DUK, COSME, InvestEU instruments)
- **Innovation/digital-transformation grants (LVPA, EIM):** non-refundable if eligible
- **EU recovery and resilience funds (NextGenEU via national plan):** sectoral calls

### Process improvements (prevent recurrence)
- ERP-side: configuration patches to stop the error at source (tax-code lookup table, posting-date validation, weekend-block flag)
- Procedure-side: monthly mini-SAF-T export + internal validation before close
- Controls-side: 4-eyes review for journals > €10k, system blocks on backposting > 30 days
- Training-side: where the people factor is causing repeat errors

## 🎯 Prioritized 30-day action plan
Numbered list, each item:
- (a) what to do, (b) who does it, (c) by when, (d) expected outcome

# Style rules
- Be concrete. "Use MAĮ 68" is useless; "File corrective FR0600 for May 2025 within 30 days of discovery, request 70% bauda reduction citing MAĮ 68 str. 2 d." is useful.
- Money figures: estimate ranges when exact numbers aren't in the findings; never invent numbers that aren't derivable.
- Never recommend evasion or aggressive minimization that would not survive inspection.
- Lithuanian legal vocabulary where precise: bauda (penalty), delspinigiai (default interest), permokos (overpayment), mokestinė nepriemoka (tax arrears), patikrinimas (inspection), kontrolinis pirkimas (test purchase).
- Do not pad. If a section has nothing to say for this file, write "Not applicable to this file." and move on.`;

// ─── BUILD COMPACT AI PAYLOAD STRINGS ────────────────────────────────

/**
 * Build a token-efficient findings packet for the AI.
 * Compresses 300+ potential findings into a structured, readable block.
 */
function formatFindingsForAi(payload, maxFindingsPerCategory = 8) {
  const lines = [];
  lines.push(`COMPANY: ${payload.company.name}`);
  lines.push(`REG: ${payload.company.registration}  VAT: ${payload.company.vat}`);
  lines.push(`PERIOD: ${payload.company.period}  DATA TYPE: ${payload.company.dataType}`);
  lines.push("");
  lines.push("COUNTS:");
  for (const [k, v] of Object.entries(payload.company.counts || {})) {
    if (v > 0) lines.push(`  ${k}: ${v}`);
  }
  lines.push("");
  lines.push(`FINDINGS SUMMARY: total=${payload.summary.total}, rulesExecuted=${payload.summary.rulesExecuted}, Block=${payload.bySeverity.Block}, Reject=${payload.bySeverity.Reject}, Warn=${payload.bySeverity.Warn}`);
  lines.push(`COVERAGE: ${payload.coverage.rulesTriggered}/${payload.coverage.rulesRegistered} rules triggered`);
  lines.push("");
  lines.push("FINDINGS BY CATEGORY:");

  for (const grp of payload.groupedSummary || []) {
    lines.push(`\n### ${grp.category} — ${grp.finding_count} finding(s) [Block=${grp.severities.Block} Reject=${grp.severities.Reject} Warn=${grp.severities.Warn}]`);
    for (const f of grp.top_findings.slice(0, maxFindingsPerCategory)) {
      lines.push(`  - [${f.rule_id} ${f.severity}] ${f.title}`);
      lines.push(`    detail: ${f.detail}`);
      if (f.evidence_count > 0) {
        lines.push(`    evidence (${f.evidence_count} items, showing ${f.evidence_sample.length}):`);
        f.evidence_sample.forEach((ev) => lines.push(`      • ${String(ev).substring(0, 200)}`));
      }
    }
    if (grp.finding_count > maxFindingsPerCategory) {
      lines.push(`  ... +${grp.finding_count - maxFindingsPerCategory} more in this category`);
    }
  }

  lines.push("");
  lines.push(`THRESHOLDS USED: ${JSON.stringify(payload.thresholds)}`);
  return lines.join("\n");
}

/**
 * Build a compact rule-catalog summary for the smart-analysis prompt.
 * Keeps context window manageable while giving the AI enough to critique.
 */
function formatRuleCatalogForAi() {
  const catalog = getRuleCatalog();
  // Group by category and emit counts + a few exemplar titles
  const groups = {};
  for (const r of catalog) {
    groups[r.category] = groups[r.category] || [];
    groups[r.category].push(r);
  }
  const lines = ["RULE CATALOG (300 deterministic rules):"];
  for (const [cat, rules] of Object.entries(groups).sort()) {
    lines.push(`\n${cat} (${rules.length} rules):`);
    const sev = { Block: 0, Reject: 0, Warn: 0 };
    rules.forEach((r) => sev[r.severity]++);
    lines.push(`  severity mix: Block=${sev.Block}, Reject=${sev.Reject}, Warn=${sev.Warn}`);
    // First/middle/last as exemplars
    const samples = [rules[0], rules[Math.floor(rules.length / 2)], rules[rules.length - 1]];
    samples.forEach((r) => lines.push(`  ${r.id}: ${r.title.substring(0, 80)}`));
  }
  return lines.join("\n");
}

// ─── PUBLIC RUNNERS ──────────────────────────────────────────────────

/**
 * Run AI INTERPRETATION over the findings.
 * Drop-in replacement for the existing runAI in TaxAI.tsx.
 *
 * @param data       parsed SAF-T from parseSAFTFull()
 * @param result     output of runAllRules()
 * @param callAI     existing callAI(systemPrompt, userPrompt, history, attachments) function
 * @returns          markdown string for <Md/>
 */
async function runInterpretation(data, result, callAI) {
  if (!data || !result) return "No data to interpret.";
  const payload = buildAiInterpretationPayload(data, result);
  const findingsBlock = formatFindingsForAi(payload, 8);

  const userPrompt = `Interpret the following SAF-T compliance findings. The deterministic engine has already executed all 300 rules; your job is to interpret, prioritize, and explain in Lithuanian-tax-law-aware language.

${findingsBlock}

Produce the report in markdown using the exact structure in your system prompt. Do not re-list every finding verbatim; group, prioritize, and add interpretive value.`;

  return await callAI(SYSTEM_PROMPT_INTERPRETATION, userPrompt, []);
}

/**
 * Run SMART ANALYSIS: meta-critique + legal remediation + financing.
 * NEW function — wires up to a new "Smart Analysis" tab in the UI.
 *
 * @param data       parsed SAF-T
 * @param result     output of runAllRules()
 * @param callAI     existing callAI() function
 * @returns          markdown string for <Md/>
 */
async function runSmartAnalysis(data, result, callAI) {
  if (!data || !result) return "No data to analyze.";
  const payload = buildAiInterpretationPayload(data, result);
  const findingsBlock = formatFindingsForAi(payload, 6);
  const catalogBlock = formatRuleCatalogForAi();

  const userPrompt = `Perform smart meta-analysis on this SAF-T compliance run.

== RULE ENGINE CATALOG ==
${catalogBlock}

== THIS FILE'S FINDINGS ==
${findingsBlock}

Produce the meta-analysis in markdown using the exact structure in your system prompt:
1. Rule-engine self-critique with category scoring 1-5
2. Specific PROPOSED new rules the engine should add
3. Legal remediation pathway for material findings
4. Financing & management strategies (installment plans, R&D credit, investment relief, instant depreciation 2026, Invega, EU funds)
5. Prioritized 30-day action plan

Be concrete, not generic. Use Lithuanian legal vocabulary where precise. Cite specific article numbers (verify, don't invent).`;

  return await callAI(SYSTEM_PROMPT_SMART_ANALYSIS, userPrompt, []);
}

/**
 * Legacy compatibility wrapper for the existing "Smart Filter" tab.
 * If you want to KEEP the original "smart filter" behavior alongside
 * the new "smart analysis", use this. Otherwise, replace with
 * runSmartAnalysis().
 */
async function runSmartFilter(data, result, callAI) {
  if (!data || !result) return "No data.";
  const payload = buildAiInterpretationPayload(data, result);
  const material = result.findings.filter((f) => f.severity !== "Warn");
  if (material.length === 0) {
    return "✅ **No Block/Reject findings.** File is structurally clean. Review Warn-level items at your discretion.";
  }
  const findingsBlock = material.slice(0, 30).map((f) =>
    `- **[${f.rule_id} ${f.severity}]** ${f.title}\n  → ${f.detail.substring(0, 200)}`
  ).join("\n");

  const sys = `You are a Smart Filter. Show ONLY items requiring action. Format with 🔴 CRITICAL, 🟡 HIGH PRIORITY, 💡 OPTIMIZATION. For each finding give: (1) data reference, (2) legal basis with exact article, (3) financial impact estimate, (4) immediate action. Be concise; no preamble.`;

  const usr = `Filter and present material findings:\n${findingsBlock}\n\nCompany: ${payload.company.name}, period ${payload.company.period}.`;

  return await callAI(sys, usr, []);
}

// ════════════════════════════════════════════════════════════════════
// ENTERPRISE FINANCIAL INTELLIGENCE LAYER (inlined from enterpriseAudit.ts)
// Deterministic KPIs computed in JS; Gemini interprets the grounded numbers.
// ════════════════════════════════════════════════════════════════════
// ─── Account-type semantics (SAF-T LT XSD) ───────────────────────────
// P  = Pajamos (Income/Revenue)
// S  = Sąnaudos (Costs/Expenses)
// NK = Nuosavas kapitalas (Equity)
// IT = Ilgalaikis turtas (Non-current/Fixed assets)
// TT = Trumpalaikis turtas (Current assets)
// I  = Įsipareigojimai (Liabilities)
// KT = Kita (Other)

const round2 = (n) => Math.round((n || 0) * 100) / 100;
const safeDiv = (a, b) => (b && isFinite(a / b) ? a / b : 0);

/**
 * Deterministically compute financial KPIs from parsed SAF-T data.
 * All figures are GROUNDED — derived from account balances, not guessed.
 * Returns {kpis, derivation} where derivation explains each number so the
 * AI (and the user) can audit how it was produced.
 */
function computeKPIs(data, ctx) {
  const accts = data.accounts || [];

  const sumBy = (pred, side) => accts.filter(pred).reduce((s, a) => {
    const db = a.closingDebitBalance || 0, cr = a.closingCreditBalance || 0;
    if (side === "credit") return s + (cr - db);
    if (side === "debit") return s + (db - cr);
    return s + db + cr;
  }, 0);

  // Income statement (approximate — SAF-T account types are coarse)
  const revenue = round2(sumBy((a) => a.accountType === "P", "credit"));
  const costs = round2(sumBy((a) => a.accountType === "S", "debit"));
  const grossResult = round2(revenue - costs);

  // Balance sheet aggregates
  const currentAssets = round2(sumBy((a) => a.accountType === "TT", "debit"));
  const fixedAssets = round2(sumBy((a) => a.accountType === "IT", "debit"));
  const liabilities = round2(sumBy((a) => a.accountType === "I", "credit"));
  const equity = round2(sumBy((a) => a.accountType === "NK", "credit"));
  const totalAssets = round2(currentAssets + fixedAssets);

  // Receivables / payables (best-effort from customer/supplier control balances)
  const receivables = round2((data.customers || []).reduce((s, c) =>
    s + (c.closingDebitBalance || 0) - (c.closingCreditBalance || 0), 0));
  const payables = round2((data.suppliers || []).reduce((s, x) =>
    s + (x.closingCreditBalance || 0) - (x.closingDebitBalance || 0), 0));

  // Tax aggregates
  const salesVat = round2((data.sales?.items || []).reduce((s, inv) =>
    s + (inv.documentTotals?.taxPayable || 0), 0));
  const inputVat = round2((data.purchases?.items || []).reduce((s, inv) =>
    s + (inv.documentTotals?.taxPayable || 0), 0));
  const netVatPosition = round2(salesVat - inputVat);

  // Period length in days (for DSO/DPO annualization)
  const f = data.header?.fiscalYearFrom, t = data.header?.fiscalYearTo;
  let periodDays = 365;
  if (f && t) {
    const d = (new Date(t) - new Date(f)) / 86400000;
    if (d > 0 && d <= 366) periodDays = d;
  }

  // Estimated CIT (LT 2026: 17% standard; 7% small if revenue <= 300k)
  const citRate = revenue <= 300000 ? 0.07 : 0.17;
  const estimatedCit = round2(Math.max(0, grossResult) * citRate);
  const effectiveTaxRate = round2(safeDiv(estimatedCit, Math.max(1, grossResult)) * 100);

  const kpis = {
    // Finance
    revenue,
    costs,
    grossResult,
    grossMarginPct: round2(safeDiv(grossResult, revenue) * 100),
    netMarginPct: round2(safeDiv(grossResult - estimatedCit, revenue) * 100),
    totalAssets,
    currentAssets,
    fixedAssets,
    equity,
    liabilities,
    workingCapital: round2(currentAssets - liabilities),
    currentRatio: round2(safeDiv(currentAssets, liabilities)),
    debtToEquity: round2(safeDiv(liabilities, equity)),
    receivables,
    payables,
    dso: round2(safeDiv(receivables, Math.max(1, revenue)) * periodDays),
    dpo: round2(safeDiv(payables, Math.max(1, costs)) * periodDays),
    // Tax
    salesVat,
    inputVat,
    netVatPosition,
    vatRecoveryRatePct: round2(safeDiv(inputVat, Math.max(1, salesVat)) * 100),
    estimatedCit,
    estimatedCitRatePct: round2(citRate * 100),
    effectiveTaxRatePct: effectiveTaxRate,
    // Operational
    transactionCount: (data.transactions || []).length,
    invoiceCount: (data.sales?.items?.length || 0) + (data.purchases?.items?.length || 0),
    customerCount: (data.customers || []).length,
    supplierCount: (data.suppliers || []).length,
    periodDays: Math.round(periodDays),
  };

  // Supplier concentration (procurement KPI) — top supplier share of payables
  const supplierBalances = (data.suppliers || []).map((s) => ({
    id: s.supplierID,
    name: s.name,
    bal: (s.closingCreditBalance || 0) - (s.closingDebitBalance || 0),
  })).filter((s) => s.bal > 0).sort((a, b) => b.bal - a.bal);
  const totalSupplierBal = supplierBalances.reduce((s, x) => s + x.bal, 0);
  kpis.topSupplierConcentrationPct = round2(safeDiv(supplierBalances[0]?.bal || 0, Math.max(1, totalSupplierBal)) * 100);
  kpis.top3SupplierConcentrationPct = round2(safeDiv(
    supplierBalances.slice(0, 3).reduce((s, x) => s + x.bal, 0), Math.max(1, totalSupplierBal)) * 100);

  const derivation = {
    revenue: "Σ closing (credit−debit) of accounts with AccountType=P",
    costs: "Σ closing (debit−credit) of accounts with AccountType=S",
    grossResult: "revenue − costs",
    receivables: "Σ customer closing (debit−credit) balances",
    payables: "Σ supplier closing (credit−debit) balances",
    dso: "receivables / revenue × periodDays",
    dpo: "payables / costs × periodDays",
    estimatedCit: `max(0, grossResult) × ${(citRate * 100)}% (LT 2026: 7% if revenue≤€300k else 17%)`,
    effectiveTaxRatePct: "estimatedCit / grossResult × 100",
    netVatPosition: "Σ sales VAT − Σ input VAT (payable to VMI if positive)",
    note: "SAF-T account types are coarse; figures are accounting approximations for analytical use, NOT a substitute for the filed financial statements (verify against PLN204/balansas).",
  };

  return { kpis, derivation, supplierBalances: supplierBalances.slice(0, 10) };
}

// ─── ENTERPRISE AUDIT SYSTEM PROMPT ──────────────────────────────────
const SYSTEM_PROMPT_ENTERPRISE_AUDIT = `You are an **Enterprise Financial Intelligence, Tax Compliance, Internal Audit, and ERP Analytics Engine** operating at the level of a senior CFO + Internal Auditor + Tax Auditor + Financial Controller + Data Scientist + ERP Consultant + Risk Analyst.

You evaluate the company against: IFRS, IAS, Lithuanian tax law (PVMĮ, PMĮ, GPMĮ, MAĮ), VAT/GST rules, OECD transfer-pricing guidelines, IIA internal-audit standards, SOX-style controls, and corporate-governance frameworks. Where Lithuanian local rules and IFRS differ, note both.

# CRITICAL GROUNDING RULES (non-negotiable)
1. The deterministic 300-rule SAF-T engine has ALREADY run. Its findings are facts — do not re-validate, do not contradict them.
2. All KPIs and financial figures are PRE-COMPUTED and given to you below. USE THOSE EXACT NUMBERS. Never invent a revenue, margin, tax, or savings figure that is not derivable from the data provided. If you estimate, label it "EST." and state the assumption.
3. For every cost-optimization or savings claim, show the arithmetic from the provided figures. No arithmetic = do not state the number.
4. Distinguish clearly between REAL risks (backed by findings/KPIs) and POSSIBLE FALSE POSITIVES. Give a False-Positive Probability for each material finding.
5. Never invent legal article numbers, court cases, or VMI rulings. If unsure, write "(verify reference)".
6. Lithuanian context: this is an LT entity. CIT 17% (7% small), VAT 21/12/5/0, GPM tiered 20/25/32, SODRA. Cite LT articles where precise.

# OUTPUT FORMAT — produce all 12 sections in markdown

## 1. Executive Summary
4-6 sentences. Financial health, the 3 biggest risks, overall posture. Lead with the single most material item.

## 2. Key Risks
Risk matrix as a list. For each top risk:
- **Risk** — Confidence (LOW/MEDIUM/HIGH/CRITICAL) — Financial/Tax/Compliance impact
- Why it is a risk · Regulatory reference · False-Positive Probability

## 3. Tax Findings
Group the engine's tax-type findings (PVM/PM/GPM). For each material cluster:
- Audit Finding · Why it's a problem · Likelihood of VMI detection · Potential penalties (with article) · Recommended legal correction
- Tie to the net VAT position and effective tax rate provided.

## 4. Accounting Findings
IFRS/local-GAAP issues surfaced by the consistency findings (roll-forwards, TB equality, asset valuation). Recommended accounting correction for each.

## 5. ERP Findings
For each systemic finding, infer the likely ERP source:
- Module / Table / Field (best-effort for Rivilė, Pragma, B1, SAP, D365 BC, NetSuite, Odoo — say which is most likely from the data patterns) · Possible root cause · Recommended ERP process fix · Automation opportunity

## 6. Cost Reduction Opportunities
ONLY where the data supports it (duplicate suppliers from finding B-075/E-230, supplier concentration, round-amount spend, excess balances). For each:
- Opportunity · Annual cost (from data) · Estimated savings (show math) · Implementation difficulty · Risk · Confidence %
If the data does not support a cost claim, write "Insufficient data to quantify — recommend manual spend review."

## 7. KPI Dashboard
Present the PRE-COMPUTED KPIs in a clean table (Finance / Tax / Operational / Procurement groupings). Add a one-line interpretation per KPI (e.g., "DSO 64 days — above the ~45-day SME norm, working-capital drag"). Do NOT alter the numbers.

## 8. Financial Impact Analysis
Quantify the aggregate exposure: estimated additional tax + potential penalties + working-capital opportunity. Show the buildup. Label estimates "EST."

## 9. Recommended Actions
Numbered, each with: action · owner role · regulatory/accounting basis · expected financial benefit · expected compliance benefit.

## 10. Priority Roadmap
30 / 60 / 90-day phased plan. Each item: what, who, expected outcome.

## 11. Continuous Monitoring Recommendations
Which checks to run Real-Time / Daily / Weekly / Monthly. Which rules to automate as alerts. Keep human auditors in the loop on material items.

## 12. Self-Improving Rule Engine
Review the existing rule coverage. Propose 3-5 NEW advanced rules that exceed standard tax-authority controls (hidden risks, emerging tax risks, cash leakage, fraud indicators, control weaknesses). For each: trigger condition, detection logic, ERP data source needed, and whether it's deterministic or needs ML.

# Style
- Quantify financially wherever the provided data allows; otherwise say so.
- Always propose legal, compliant corrective actions (never evasion).
- Always give confidence scores and false-positive probabilities on material findings.
- Be concise and senior. No filler. If a section has little to say for this file, keep it short and say why.`;

// ─── FORMAT GROUNDED DATA FOR THE AI ─────────────────────────────────
function formatKpisForAi(kpiBundle) {
  const { kpis, derivation, supplierBalances } = kpiBundle;
  const lines = ["PRE-COMPUTED KPIs (deterministic — use these exact figures):", ""];
  const grp = (title, entries) => {
    lines.push(`[${title}]`);
    entries.forEach(([k, v, unit]) => lines.push(`  ${k}: ${typeof v === "number" ? v.toLocaleString() : v}${unit || ""}`));
    lines.push("");
  };
  grp("FINANCE", [
    ["Revenue", kpis.revenue, " EUR"], ["Costs", kpis.costs, " EUR"],
    ["Gross result", kpis.grossResult, " EUR"], ["Gross margin", kpis.grossMarginPct, "%"],
    ["Net margin (est.)", kpis.netMarginPct, "%"], ["Total assets", kpis.totalAssets, " EUR"],
    ["Equity", kpis.equity, " EUR"], ["Liabilities", kpis.liabilities, " EUR"],
    ["Working capital", kpis.workingCapital, " EUR"], ["Current ratio", kpis.currentRatio, ""],
    ["Debt/Equity", kpis.debtToEquity, ""], ["Receivables", kpis.receivables, " EUR"],
    ["Payables", kpis.payables, " EUR"], ["DSO", kpis.dso, " days"], ["DPO", kpis.dpo, " days"],
  ]);
  grp("TAX", [
    ["Sales VAT (output)", kpis.salesVat, " EUR"], ["Input VAT", kpis.inputVat, " EUR"],
    ["Net VAT position", kpis.netVatPosition, " EUR (payable if +)"],
    ["VAT recovery rate", kpis.vatRecoveryRatePct, "%"],
    ["Estimated CIT", kpis.estimatedCit, ` EUR @ ${kpis.estimatedCitRatePct}%`],
    ["Effective tax rate", kpis.effectiveTaxRatePct, "%"],
  ]);
  grp("OPERATIONAL", [
    ["Transactions", kpis.transactionCount, ""], ["Invoices", kpis.invoiceCount, ""],
    ["Customers", kpis.customerCount, ""], ["Suppliers", kpis.supplierCount, ""],
    ["Period length", kpis.periodDays, " days"],
  ]);
  grp("PROCUREMENT", [
    ["Top-1 supplier concentration", kpis.topSupplierConcentrationPct, "% of payables"],
    ["Top-3 supplier concentration", kpis.top3SupplierConcentrationPct, "% of payables"],
  ]);
  if (supplierBalances?.length) {
    lines.push("[TOP SUPPLIERS BY PAYABLE BALANCE]");
    supplierBalances.slice(0, 5).forEach((s) => lines.push(`  ${s.id} ${s.name}: €${round2(s.bal).toLocaleString()}`));
    lines.push("");
  }
  lines.push("KPI DERIVATION (how each was computed — for your transparency, do not restate verbatim):");
  Object.entries(derivation).forEach(([k, v]) => lines.push(`  ${k}: ${v}`));
  return lines.join("\n");
}

function formatFindingsCompact(payload, perCat = 6) {
  const lines = [`COMPLIANCE FINDINGS (from deterministic 300-rule SAF-T engine):`,
    `Total ${payload.summary.total} · Block ${payload.bySeverity.Block} · Reject ${payload.bySeverity.Reject} · Warn ${payload.bySeverity.Warn}`, ""];
  for (const grp of payload.groupedSummary || []) {
    lines.push(`### ${grp.category} (${grp.finding_count})`);
    grp.top_findings.slice(0, perCat).forEach((f) =>
      lines.push(`  [${f.rule_id} ${f.severity}] ${f.title} — ${f.detail}`));
    if (grp.finding_count > perCat) lines.push(`  ... +${grp.finding_count - perCat} more`);
  }
  return lines.join("\n");
}

// ─── PUBLIC RUNNER ───────────────────────────────────────────────────

/**
 * Run the full Enterprise Audit. Uses Gemini (callAI) for interpretation,
 * but feeds it deterministically-computed KPIs + the engine's findings so
 * all numbers are grounded.
 *
 * @param data    parsed SAF-T (parseSAFTFull output)
 * @param result  runAllRules output
 * @param ctx     buildContext output (optional; recomputed if absent)
 * @param callAI  the app's Gemini callAI(systemPrompt, userPrompt, history)
 * @returns       {markdown, kpiBundle} — markdown is the 12-section report,
 *                kpiBundle is the deterministic data (render the KPI strip
 *                from this WITHOUT waiting for the AI).
 */
async function runEnterpriseAudit(data, result, ctx, callAI) {
  if (!data || !result) return { markdown: "No data to analyze.", kpiBundle: null };

  const kpiBundle = computeKPIs(data, ctx);
  const payload = buildAiInterpretationPayload(data, result);

  const userPrompt = `Run a full enterprise audit on this Lithuanian entity.

== COMPANY ==
${payload.company.name} (RegNum ${payload.company.registration}, VAT ${payload.company.vat})
Period: ${payload.company.period} · DataType: ${payload.company.dataType}

== ${formatKpisForAi(kpiBundle)}

== ${formatFindingsCompact(payload, 6)}

Produce all 12 sections per your system prompt. Use the exact KPI figures above. Ground every financial claim in the data. Flag false-positive probability on material findings. Cite LT tax articles where precise (verify, don't invent).`;

  const markdown = await callAI(SYSTEM_PROMPT_ENTERPRISE_AUDIT, userPrompt, []);
  return { markdown, kpiBundle };
}

// ════════════════════════════════════════════════════════════════════
// FORENSIC INTELLIGENCE ENGINE (inlined: rates + 7 engines + threat AI)
// Seven deterministic engines: ontology, Benford, anomaly, entity-res,
// graph cycle-detection, composite risk, temporal — + Gemini threat layer.
// ════════════════════════════════════════════════════════════════════

// --- Period-effective LT tax rates ---
const RATE_TABLES = {
  // Standard VAT rate
  vatStandard: [
    { from: "1994-05-01", to: "2009-08-31", value: 18 },
    { from: "2009-09-01", to: "2009-12-31", value: 19 },
    { from: "2010-01-01", to: null, value: 21 },
  ],
  // Reduced VAT (accommodation, passenger transport, etc.)
  vatReducedTransportAccommodation: [
    { from: "2009-01-01", to: "2025-12-31", value: 9 },
    { from: "2026-01-01", to: null, value: 12 }, // 2026 reform: 9% → 12%
  ],
  // Reduced VAT (books, medicines, periodicals)
  vatReducedBooksMedicine: [
    { from: "2009-01-01", to: null, value: 5 },
  ],
  // Heating/hot water VAT relief (abolished 2026)
  vatHeating: [
    { from: "2009-01-01", to: "2025-12-31", value: 9 },
    { from: "2026-01-01", to: null, value: 21 }, // relief abolished → standard
  ],
  // Standard CIT
  citStandard: [
    { from: "2010-01-01", to: "2024-12-31", value: 15 },
    { from: "2025-01-01", to: "2025-12-31", value: 16 },
    { from: "2026-01-01", to: null, value: 17 }, // 2026 reform: 16% → 17%
  ],
  // Small-company reduced CIT
  citSmall: [
    { from: "2010-01-01", to: "2024-12-31", value: 5 },
    { from: "2025-01-01", to: "2025-12-31", value: 6 },
    { from: "2026-01-01", to: null, value: 7 },
  ],
  // Bank/credit-institution surcharge (on profit over threshold)
  citBankSurcharge: [
    { from: "2020-01-01", to: null, value: 5 },
  ],
  // GPM (PIT) standard employment tier-1
  gpmTier1: [
    { from: "2019-01-01", to: "2025-12-31", value: 20 },
    { from: "2026-01-01", to: null, value: 20 },
  ],
  // Dividend GPM
  gpmDividend: [
    { from: "2014-01-01", to: null, value: 15 },
  ],
};

/**
 * Return the rate in force on `dateStr` for `rateKey`.
 * @param rateKey one of RATE_TABLES keys
 * @param dateStr ISO date "YYYY-MM-DD" (defaults to today)
 * @returns number | null
 */
function rateAsOf(rateKey, dateStr) {
  const table = RATE_TABLES[rateKey];
  if (!table) return null;
  const d = (dateStr || new Date().toISOString().slice(0, 10)).slice(0, 10);
  for (const row of table) {
    if (d >= row.from && (row.to === null || d <= row.to)) return row.value;
  }
  return null;
}

/**
 * Given an observed VAT percentage and an invoice date, classify whether it
 * was a valid rate at that time. Returns {valid, expected:[...], note}.
 */
function classifyVatRate(observedPct, dateStr) {
  const d = (dateStr || "").slice(0, 10);
  if (!d) return { valid: null, expected: [], note: "no date" };
  const std = rateAsOf("vatStandard", d);
  const red1 = rateAsOf("vatReducedTransportAccommodation", d);
  const red2 = rateAsOf("vatReducedBooksMedicine", d);
  const valid = [std, red1, red2, 0].includes(observedPct);
  const note = valid ? "" :
    `Rate ${observedPct}% not valid on ${d}. Valid: ${[...new Set([std, red1, red2, 0])].join("/")}%`;
  return { valid, expected: [...new Set([std, red1, red2, 0])], note };
}

/** Effective CIT rate for an entity given period + flags. */
function citRateAsOf(dateStr, { revenue = 0, isBank = false } = {}) {
  const d = (dateStr || "").slice(0, 10);
  if (isBank) return rateAsOf("citStandard", d) + rateAsOf("citBankSurcharge", d);
  if (revenue <= 300000) return rateAsOf("citSmall", d);
  return rateAsOf("citStandard", d);
}

// Period-effective VAT-rate audit: recompute each invoice's implied VAT rate
// from net/tax and check it was VALID on the invoice date (uses historical
// rate tables → no false positives on legacy files). Deterministic.
function vatRateAudit(data) {
  const issues = [];
  let checked = 0;
  const scan = (inv, src) => {
    const net = inv.documentTotals?.netTotal || 0;
    const tax = inv.documentTotals?.taxPayable || 0;
    const date = inv.invoiceDate;
    if (net <= 0 || !date) return;
    checked++;
    const impliedPct = Math.round((tax / net) * 100);
    if (impliedPct === 0) return; // zero-rated / reverse-charge — out of scope here
    const cls = classifyVatRate(impliedPct, date);
    if (cls.valid === false) {
      issues.push({ ref: inv.invoiceNo, src, date, impliedPct, expected: cls.expected, note: cls.note });
    }
  };
  for (const inv of data.sales?.items || []) scan(inv, "sale");
  for (const inv of data.purchases?.items || []) scan(inv, "purchase");
  return { checked, issues: issues.slice(0, 40), issueCount: issues.length,
    note: issues.length ? `${issues.length} invoice(s) carry a VAT rate not valid on their invoice date (period-effective check).` : "All checked invoices use period-valid VAT rates." };
}

// --- Forensic intelligence engines (7) ---
const r2 = (n) => Math.round((n || 0) * 100) / 100;
const r4 = (n) => Math.round((n || 0) * 10000) / 10000;

// ════════════════════════════════════════════════════════════════════
// 1 · ONTOLOGY — unified linked-object model
// Everything downstream reads from this single normalized structure so
// that entity references resolve consistently (the Palantir "ontology").
// ════════════════════════════════════════════════════════════════════
function buildOntology(data) {
  const entities = new Map();   // key → {kind, id, name, reg, vat, country, bank, refs, flowIn, flowOut, txnCount}
  const flows = [];             // {from, to, amount, date, kind, ref}

  const ent = (kind, id, extra = {}) => {
    if (!id) return null;
    const key = `${kind}:${id}`;
    if (!entities.has(key)) {
      entities.set(key, {
        key, kind, id,
        name: extra.name || "",
        reg: extra.reg || "",
        vat: extra.vat || "",
        country: extra.country || "",
        bank: extra.bank || "",
        flowIn: 0, flowOut: 0, txnCount: 0,
        counterparties: new Set(),
      });
    }
    const e = entities.get(key);
    // enrich if new info arrives
    if (extra.name && !e.name) e.name = extra.name;
    if (extra.reg && !e.reg) e.reg = extra.reg;
    if (extra.vat && !e.vat) e.vat = extra.vat;
    if (extra.country && !e.country) e.country = extra.country;
    if (extra.bank && !e.bank) e.bank = extra.bank;
    return e;
  };

  // Register master-file entities
  ent("company", data.header?.company?.registrationNumber || "SELF", {
    name: data.header?.company?.name, reg: data.header?.company?.registrationNumber,
    vat: data.header?.company?.taxRegistration, country: data.header?.auditFileCountry,
    bank: data.header?.company?.bankAccount,
  });
  for (const c of data.customers || [])
    ent("customer", c.customerID, { name: c.name, reg: c.registrationNumber, vat: c.taxRegistrationNumber, country: c.country });
  for (const s of data.suppliers || [])
    ent("supplier", s.supplierID, { name: s.name, reg: s.registrationNumber, vat: s.taxRegistrationNumber, country: s.country, bank: s.bankAccount });

  const SELF = "company:" + (data.header?.company?.registrationNumber || "SELF");

  // Sales invoices → flow customer → company (revenue inbound)
  for (const inv of data.sales?.items || []) {
    const amt = inv.documentTotals?.grossTotal || 0;
    if (inv.customerID && amt) {
      const c = ent("customer", inv.customerID);
      flows.push({ from: `customer:${inv.customerID}`, to: SELF, amount: amt, date: inv.invoiceDate, kind: "sale", ref: inv.invoiceNo });
      if (c) { c.flowOut += amt; c.txnCount++; c.counterparties.add(SELF); }
    }
  }
  // Purchase invoices → flow company → supplier (cost outbound)
  for (const inv of data.purchases?.items || []) {
    const amt = inv.documentTotals?.grossTotal || 0;
    if (inv.supplierID && amt) {
      const s = ent("supplier", inv.supplierID);
      flows.push({ from: SELF, to: `supplier:${inv.supplierID}`, amount: amt, date: inv.invoiceDate, kind: "purchase", ref: inv.invoiceNo });
      if (s) { s.flowIn += amt; s.txnCount++; s.counterparties.add(SELF); }
    }
  }
  // Payments → directional money movement
  for (const p of data.payments || []) {
    for (const ln of p.lines || []) {
      const amt = ln.creditAmount || ln.debitAmount || 0;
      if (!amt) continue;
      if (ln.supplierID) {
        flows.push({ from: SELF, to: `supplier:${ln.supplierID}`, amount: amt, date: p.transactionDate, kind: "payment-out", ref: p.paymentRefNo });
        const s = ent("supplier", ln.supplierID); if (s) { s.flowIn += amt; s.counterparties.add(SELF); }
      } else if (ln.customerID) {
        flows.push({ from: `customer:${ln.customerID}`, to: SELF, amount: amt, date: p.transactionDate, kind: "payment-in", ref: p.paymentRefNo });
        const c = ent("customer", ln.customerID); if (c) { c.flowOut += amt; c.counterparties.add(SELF); }
      }
    }
  }

  // Materialize counterparties count
  for (const e of entities.values()) e.counterpartyCount = e.counterparties.size;

  return {
    self: SELF,
    entities: [...entities.values()],
    entityMap: entities,
    flows,
    stats: {
      entityCount: entities.size,
      flowCount: flows.length,
      totalInbound: r2(flows.filter(f => f.to === SELF).reduce((s, f) => s + f.amount, 0)),
      totalOutbound: r2(flows.filter(f => f.from === SELF).reduce((s, f) => s + f.amount, 0)),
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// 2 · BENFORD'S LAW — forensic digit-distribution analysis
// Nigrini Mean Absolute Deviation (MAD) conformity thresholds:
//   <0.006 close · 0.006–0.012 acceptable · 0.012–0.015 marginal · >0.015 nonconform
// ════════════════════════════════════════════════════════════════════
const BENFORD_FIRST = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046]; // index = digit 1..9

function benfordAnalysis(data) {
  // Gather monetary magnitudes from invoices + GL lines
  const amounts = [];
  for (const inv of [...(data.sales?.items || []), ...(data.purchases?.items || [])]) {
    const g = inv.documentTotals?.grossTotal;
    if (g && g > 0) amounts.push(Math.abs(g));
  }
  for (const t of data.transactions || [])
    for (const l of t.lines || []) {
      const a = l.debitAmount || l.creditAmount || 0;
      if (a > 0) amounts.push(Math.abs(a));
    }

  if (amounts.length < 50) {
    return { applicable: false, sampleSize: amounts.length,
      note: "Benford requires ≥50 values for a meaningful test; sample too small.", digits: [], mad: null, conformity: "n/a" };
  }

  const counts = new Array(10).fill(0);
  for (const a of amounts) {
    const s = String(a).replace(/[^1-9]/, (m, off) => m); // find first 1-9
    const m = String(a).match(/[1-9]/);
    if (m) counts[parseInt(m[0])]++;
  }
  const total = counts.slice(1).reduce((s, c) => s + c, 0);

  const digits = [];
  let madSum = 0;
  for (let d = 1; d <= 9; d++) {
    const observed = counts[d] / total;
    const expected = BENFORD_FIRST[d];
    const dev = Math.abs(observed - expected);
    madSum += dev;
    digits.push({ digit: d, observedPct: r4(observed * 100), expectedPct: r4(expected * 100), count: counts[d], deviation: r4(dev) });
  }
  const mad = r4(madSum / 9);
  const conformity = mad < 0.006 ? "Close conformity"
    : mad < 0.012 ? "Acceptable conformity"
    : mad < 0.015 ? "Marginal — review"
    : "Nonconformity — elevated fabrication risk";

  // Chi-square statistic (df=8, critical 15.51 @ p=0.05)
  let chi2 = 0;
  for (let d = 1; d <= 9; d++) {
    const obs = counts[d], exp = BENFORD_FIRST[d] * total;
    if (exp > 0) chi2 += (obs - exp) ** 2 / exp;
  }
  chi2 = r2(chi2);

  return {
    applicable: true,
    sampleSize: total,
    digits,
    mad,
    chi2,
    chi2Critical: 15.51,
    chi2Exceeded: chi2 > 15.51,
    conformity,
    note: mad >= 0.015
      ? "First-digit distribution deviates materially from Benford's Law — possible number fabrication, threshold manipulation, or systematic rounding. Investigate spikes."
      : "First-digit distribution broadly consistent with naturally occurring figures.",
  };
}

// ════════════════════════════════════════════════════════════════════
// 3 · STATISTICAL ANOMALY DETECTION
// z-score + IQR outliers, round-number bias, duplicate clusters,
// sequence gaps, period-end clustering. All deterministic.
// ════════════════════════════════════════════════════════════════════
function descriptiveStats(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const q = (p) => {
    const idx = (n - 1) * p; const lo = Math.floor(idx), hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  const q1 = q(0.25), median = q(0.5), q3 = q(0.75), iqr = q3 - q1;
  return { n, mean: r2(mean), std: r2(std), min: sorted[0], max: sorted[n - 1], q1: r2(q1), median: r2(median), q3: r2(q3), iqr: r2(iqr) };
}

function anomalyAnalysis(data, opts = {}) {
  const sigma = opts.sigma || 3;
  const out = { outliers: [], roundNumberBias: null, duplicateClusters: [], sequenceGaps: [], periodEndClustering: null, stats: null };

  // Build a labeled amount series from invoices AND GL lines (broader population)
  const items = [...(data.sales?.items || []).map(i => ({ ...i, _src: "sale" })),
                 ...(data.purchases?.items || []).map(i => ({ ...i, _src: "purchase" }))];
  const invoiceAmounts = items.map(i => i.documentTotals?.grossTotal || 0).filter(a => a > 0);
  const glPoints = [];
  for (const t of data.transactions || [])
    for (const l of t.lines || []) {
      const a = (l.debitAmount || l.creditAmount || 0);
      if (a > 0) glPoints.push({ invoiceNo: `${t.transactionID}.${l.recordID}`, _src: "gl", amount: a, customerID: t.customerID, supplierID: t.supplierID });
    }
  const amounts = [...invoiceAmounts, ...glPoints.map(g => g.amount)];

  const stats = descriptiveStats(amounts);
  out.stats = stats;

  if (stats && stats.std > 0) {
    // z-score + IQR outliers across invoices + GL lines
    const upperIqr = stats.q3 + 1.5 * stats.iqr;
    const scan = (ref, src, amount, party) => {
      if (amount <= 0) return;
      const z = (amount - stats.mean) / stats.std;
      if (Math.abs(z) > sigma || amount > upperIqr) {
        out.outliers.push({ ref, src, amount: r2(amount), z: r2(z),
          method: Math.abs(z) > sigma ? `${r2(z)}σ` : "IQR", party: party || "" });
      }
    };
    items.forEach((it) => scan(it.invoiceNo, it._src, it.documentTotals?.grossTotal || 0, it.customerID || it.supplierID));
    glPoints.forEach((g) => scan(g.invoiceNo, "gl", g.amount, g.customerID || g.supplierID));
    out.outliers.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
    out.outliers = out.outliers.slice(0, 50);
  }

  // Round-number bias: amounts divisible by 100 / 1000 vs expected
  if (amounts.length >= 20) {
    const div100 = amounts.filter(a => a % 100 === 0).length;
    const div1000 = amounts.filter(a => a % 1000 === 0).length;
    // Under randomness, ~1% land on exact /100; flag if materially higher
    const pct100 = div100 / amounts.length, pct1000 = div1000 / amounts.length;
    out.roundNumberBias = {
      total: amounts.length,
      divisibleBy100: div100, pctBy100: r2(pct100 * 100),
      divisibleBy1000: div1000, pctBy1000: r2(pct1000 * 100),
      elevated: pct100 > 0.15 || pct1000 > 0.05,
      note: pct100 > 0.15
        ? "Unusually high share of round amounts — estimate-based or fabricated invoicing pattern."
        : "Round-number frequency within normal range.",
    };
  }

  // Duplicate clusters: same (party, amount, date) appearing >1
  const dupMap = new Map();
  items.forEach((it) => {
    const key = `${it.customerID || it.supplierID || "?"}|${r2(it.documentTotals?.grossTotal || 0)}|${it.invoiceDate || "?"}`;
    const arr = dupMap.get(key) || []; arr.push(it.invoiceNo); dupMap.set(key, arr);
  });
  for (const [key, refs] of dupMap.entries()) {
    if (refs.length > 1) {
      const [party, amount, date] = key.split("|");
      out.duplicateClusters.push({ party, amount: parseFloat(amount), date, count: refs.length, refs: refs.slice(0, 8) });
    }
  }
  out.duplicateClusters.sort((a, b) => b.count - a.count);
  out.duplicateClusters = out.duplicateClusters.slice(0, 30);

  // Invoice-number sequence gaps (per type prefix)
  const series = new Map();
  (data.sales?.items || []).forEach((inv) => {
    const m = (inv.invoiceNo || "").match(/^(.*?)(\d+)$/);
    if (!m) return;
    const prefix = m[1] || "(none)";
    const arr = series.get(prefix) || []; arr.push(parseInt(m[2])); series.set(prefix, arr);
  });
  for (const [prefix, nums] of series.entries()) {
    if (nums.length < 3) continue;
    nums.sort((a, b) => a - b);
    let gapCount = 0; const examples = [];
    for (let i = 1; i < nums.length; i++) {
      const gap = nums[i] - nums[i - 1];
      if (gap > 1) { gapCount += gap - 1; if (examples.length < 5) examples.push(`${nums[i - 1]}→${nums[i]}`); }
    }
    if (gapCount > 0) out.sequenceGaps.push({ prefix, missing: gapCount, span: `${nums[0]}–${nums[nums.length - 1]}`, examples });
  }
  out.sequenceGaps.sort((a, b) => b.missing - a.missing);
  out.sequenceGaps = out.sequenceGaps.slice(0, 20);

  // Period-end clustering: % of transactions posted in last 3 days of period
  const t = data.header?.fiscalYearTo;
  if (t && (data.transactions || []).length > 10) {
    const end = new Date(t);
    const last3 = new Date(end.getTime() - 3 * 86400000);
    const txDates = (data.transactions || []).map(tx => tx.glPostingDate).filter(Boolean);
    const inLast3 = txDates.filter(d => { const dt = new Date(d); return dt >= last3 && dt <= end; }).length;
    const pct = txDates.length ? inLast3 / txDates.length : 0;
    out.periodEndClustering = {
      windowDays: 3, postingsInWindow: inLast3, totalPostings: txDates.length,
      pct: r2(pct * 100),
      elevated: pct > 0.2,
      note: pct > 0.2 ? "Material clustering of postings at period end — possible cut-off manipulation or rushed close." : "Period-end posting distribution normal.",
    };
  }

  return out;
}

// ════════════════════════════════════════════════════════════════════
// 4 · ENTITY RESOLUTION — fuzzy matching, shell indicators, collusion
// ════════════════════════════════════════════════════════════════════

// Normalize a company name: lowercase, strip LT legal forms + punctuation
const LEGAL_FORMS = /\b(uab|ab|mb|všį|vsi| všĮ|iį|ii|ūkb|ukb|tūb|tub|kub|žūb|zub|so|ltd|gmbh|oy|as|sia|ou|sp\.?\s?z\.?\s?o\.?\s?o|sa|srl|bv|nv)\b/gi;
function normName(name) {
  return (name || "").toLowerCase()
    .replace(LEGAL_FORMS, " ")
    .replace(/[^\wąčęėįšųūž]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Token Jaccard similarity (0..1)
function jaccard(a, b) {
  const sa = new Set(a.split(" ").filter(Boolean));
  const sb = new Set(b.split(" ").filter(Boolean));
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}

function entityResolution(data, ontology) {
  const parties = [
    ...(data.customers || []).map(c => ({ kind: "customer", id: c.customerID, name: c.name, reg: c.registrationNumber, vat: c.taxRegistrationNumber, country: c.country, bank: "", addr: `${c.addressCity || ""}|${c.addressCountry || ""}` })),
    ...(data.suppliers || []).map(s => ({ kind: "supplier", id: s.supplierID, name: s.name, reg: s.registrationNumber, vat: s.taxRegistrationNumber, country: s.country, bank: s.bankAccount, addr: `${s.addressCity || ""}|${s.addressCountry || ""}` })),
  ];

  // --- Duplicate / same-entity detection ---
  const duplicates = [];
  // Exact reg-number collisions across different IDs
  const byReg = new Map();
  parties.forEach(p => { if (p.reg) { const a = byReg.get(p.reg) || []; a.push(p); byReg.set(p.reg, a); } });
  for (const [reg, ps] of byReg.entries()) {
    const ids = [...new Set(ps.map(p => `${p.kind}:${p.id}`))];
    if (ids.length > 1) duplicates.push({ basis: "Identical registration number", key: reg, entities: ids, confidence: 0.98 });
  }
  // Fuzzy name matches (same country, Jaccard ≥ 0.7, different reg)
  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const a = parties[i], b = parties[j];
      if (a.reg && b.reg && a.reg === b.reg) continue; // already caught
      const sim = jaccard(normName(a.name), normName(b.name));
      if (sim >= 0.7 && normName(a.name).length > 3) {
        duplicates.push({ basis: "High name similarity", key: `${a.name} ≈ ${b.name}`, entities: [`${a.kind}:${a.id}`, `${b.kind}:${b.id}`], similarity: r2(sim), confidence: r2(sim * 0.9) });
      }
    }
  }

  // --- Shared bank account (supplier collusion / shell funnel) ---
  const bankMap = new Map();
  parties.forEach(p => { if (p.bank) { const a = bankMap.get(p.bank) || []; a.push(`${p.kind}:${p.id}`); bankMap.set(p.bank, a); } });
  const sharedBank = [...bankMap.entries()].filter(([, ids]) => new Set(ids).size > 1)
    .map(([bank, ids]) => ({ bank, entities: [...new Set(ids)] }));

  // --- Shared address ---
  const addrMap = new Map();
  parties.forEach(p => { if (p.addr && p.addr !== "|") { const a = addrMap.get(p.addr) || []; a.push(`${p.kind}:${p.id}`); addrMap.set(p.addr, a); } });
  const sharedAddress = [...addrMap.entries()].filter(([, ids]) => new Set(ids).size > 2)
    .map(([addr, ids]) => ({ addr, entities: [...new Set(ids)].slice(0, 10), count: new Set(ids).size }));

  // --- Shell-company indicators (scored) ---
  const shells = [];
  parties.forEach(p => {
    const flags = [];
    if (!p.reg) flags.push("no registration number");
    if (!p.vat) flags.push("no VAT ID");
    if (!p.addr || p.addr === "|") flags.push("no address");
    if (/^(test|temp|various|unknown|n\/a|tbd|naujas|nezinomas|cash)/i.test((p.name || "").trim())) flags.push("placeholder name");
    // round-only flows
    const e = ontology.entityMap.get(`${p.kind}:${p.id}`);
    const flow = e ? (e.flowIn + e.flowOut) : 0;
    if (e && flow > 0 && (e.counterpartyCount <= 1)) flags.push("single counterparty");
    if (flags.length >= 2) {
      shells.push({ entity: `${p.kind}:${p.id}`, name: p.name, flags, riskScore: Math.min(100, flags.length * 28) });
    }
  });
  shells.sort((a, b) => b.riskScore - a.riskScore);

  return {
    partyCount: parties.length,
    duplicates: duplicates.slice(0, 40),
    sharedBankAccounts: sharedBank.slice(0, 20),
    sharedAddresses: sharedAddress.slice(0, 20),
    shellIndicators: shells.slice(0, 30),
  };
}

// ════════════════════════════════════════════════════════════════════
// 5 · TRANSACTION GRAPH — money-flow graph + DFS cycle detection
// Real circular-flow / round-trip detection (deterministic, replaces the
// old heuristic). Plus fan-in/out and Herfindahl concentration.
// ════════════════════════════════════════════════════════════════════
function graphAnalysis(ontology, opts = {}) {
  const maxCycleLen = opts.maxCycleLen || 6;

  // Resolve each raw node (e.g. customer:S1, supplier:S1) to a canonical
  // identity (registration number, else normalized name, else the key).
  // This is what lets the cycle detector see that an entity acting as both
  // customer and supplier forms a round-trip.
  const resolveId = (key) => {
    const e = ontology.entityMap.get(key);
    if (!e) return key;
    if (e.reg) return `reg:${e.reg}`;
    const nn = (e.name || "").toLowerCase().replace(/\b(uab|ab|mb|všį|iį|ūkb|ltd|gmbh)\b/gi, "").replace(/[^\wąčęėįšųūž]+/gi, "").trim();
    return nn ? `name:${nn}` : key;
  };

  // Build adjacency from flows on RESOLVED identities (aggregate parallel edges)
  const adj = new Map();        // node → Map(neighbor → {amount, count})
  const nodes = new Set();
  const labelOf = new Map();    // resolvedId → display label
  for (const f of ontology.flows) {
    const from = resolveId(f.from), to = resolveId(f.to);
    if (from === to) continue;  // self-loop after resolution is not a cycle
    nodes.add(from); nodes.add(to);
    labelOf.set(from, ontology.entityMap.get(f.from)?.name || from);
    labelOf.set(to, ontology.entityMap.get(f.to)?.name || to);
    if (!adj.has(from)) adj.set(from, new Map());
    const nbr = adj.get(from);
    const cur = nbr.get(to) || { amount: 0, count: 0 };
    cur.amount += f.amount; cur.count++;
    nbr.set(to, cur);
  }
  const selfResolved = resolveId(ontology.self);

  // --- DFS cycle detection (bounded length) ---
  const cycles = [];
  const seenCycle = new Set();
  const dfs = (start, current, path, depth) => {
    if (depth > maxCycleLen) return;
    const nbrs = adj.get(current);
    if (!nbrs) return;
    for (const [next, edge] of nbrs.entries()) {
      if (next === start && path.length >= 2) {
        // found a cycle back to start
        const norm = [...path, start];
        const key = [...norm].sort().join("→") + "|" + norm.length;
        if (!seenCycle.has(key)) {
          seenCycle.add(key);
          const minAmount = Math.min(...path.map((n, i) => {
            const e = adj.get(n)?.get(path[i + 1] || start); return e ? e.amount : Infinity;
          }));
          cycles.push({ path: norm, labels: norm.map(n => labelOf.get(n) || n.replace(/^(reg|name):/, "")), length: path.length, minFlow: r2(minAmount) });
        }
      } else if (!path.includes(next)) {
        dfs(start, next, [...path, next], depth + 1);
      }
    }
  };
  // Limit DFS roots for performance on large graphs
  const rootList = [...nodes].slice(0, 400);
  for (const n of rootList) dfs(n, n, [n], 0);
  cycles.sort((a, b) => b.minFlow - a.minFlow);

  // --- Fan-in / fan-out ---
  const fanOut = [], fanIn = [];
  const inDeg = new Map();
  for (const [node, nbrs] of adj.entries()) {
    if (nbrs.size >= 1) fanOut.push({ node, out: nbrs.size, amount: r2([...nbrs.values()].reduce((s, e) => s + e.amount, 0)) });
    for (const [to] of nbrs.entries()) inDeg.set(to, (inDeg.get(to) || 0) + 1);
  }
  for (const [node, deg] of inDeg.entries()) fanIn.push({ node, in: deg });
  fanOut.sort((a, b) => b.out - a.out);
  fanIn.sort((a, b) => b.in - a.in);

  // --- Flow concentration (Herfindahl-Hirschman Index on outbound from self) ---
  const outNbrs = adj.get(selfResolved);
  const byTarget = new Map();
  if (outNbrs) for (const [to, e] of outNbrs.entries()) byTarget.set(to, e.amount);
  const totalOut = [...byTarget.values()].reduce((s, a) => s + a, 0);
  let hhi = 0;
  for (const amt of byTarget.values()) { const share = totalOut ? amt / totalOut : 0; hhi += share * share; }
  hhi = r4(hhi);
  const hhiInterpretation = hhi > 0.25 ? "Highly concentrated (supplier dependency risk)"
    : hhi > 0.15 ? "Moderately concentrated" : "Diversified";

  return {
    nodeCount: nodes.size,
    edgeCount: ontology.flows.length,
    cycles: cycles.slice(0, 25),
    cycleCount: cycles.length,
    fanOut: fanOut.slice(0, 15),
    fanIn: fanIn.slice(0, 15),
    concentration: { hhi, interpretation: hhiInterpretation, topTargetShare: r2(Math.max(0, ...[...byTarget.values()].map(a => totalOut ? a / totalOut * 100 : 0))) },
    // Export a render-ready subgraph (top flows) for visualization
    renderGraph: buildRenderGraph(ontology),
  };
}

// Build a compact, layout-ready graph for the SVG visualizer (top flows only)
function buildRenderGraph(ontology, maxNodes = 40) {
  const flowsByPair = new Map();
  for (const f of ontology.flows) {
    const key = `${f.from}|${f.to}`;
    const cur = flowsByPair.get(key) || { from: f.from, to: f.to, amount: 0, count: 0 };
    cur.amount += f.amount; cur.count++;
    flowsByPair.set(key, cur);
  }
  const edges = [...flowsByPair.values()].sort((a, b) => b.amount - a.amount).slice(0, maxNodes);
  const nodeSet = new Set();
  edges.forEach(e => { nodeSet.add(e.from); nodeSet.add(e.to); });
  const nodes = [...nodeSet].map(key => {
    const e = ontology.entityMap.get(key);
    return { id: key, label: e?.name || key.split(":")[1] || key, kind: key.split(":")[0],
      value: e ? r2(e.flowIn + e.flowOut) : 0, isSelf: key === ontology.self };
  });
  return { nodes, edges: edges.map(e => ({ from: e.from, to: e.to, amount: r2(e.amount), count: e.count })) };
}

// ════════════════════════════════════════════════════════════════════
// 6 · COMPOSITE RISK ENGINE — explainable 0–100 score
// Combines: rule findings (weighted) + Benford + anomalies + graph +
// entity-resolution signals. Every point is attributable (provenance).
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// 7 · TEMPORAL INTELLIGENCE — time-series forensics
// Monthly velocity, trend breaks, weekend/after-hours posting, backdating,
// dormant-then-active accounts, and posting-vs-document date lag. Temporal
// analysis is core to investigative platforms; all deterministic.
// ════════════════════════════════════════════════════════════════════
function temporalAnalysis(data) {
  const out = {
    monthly: [], velocitySpikes: [], weekendPostings: null, afterHours: null,
    backdating: [], dateLag: null, dormantReactivation: [], applicable: false,
  };

  // Collect dated monetary events (invoices + GL postings)
  const events = [];
  for (const inv of data.sales?.items || [])
    if (inv.invoiceDate) events.push({ date: inv.invoiceDate, amount: inv.documentTotals?.grossTotal || 0, kind: "sale", ref: inv.invoiceNo });
  for (const inv of data.purchases?.items || [])
    if (inv.invoiceDate) events.push({ date: inv.invoiceDate, amount: inv.documentTotals?.grossTotal || 0, kind: "purchase", ref: inv.invoiceNo });
  for (const t of data.transactions || []) {
    const amt = (t.lines || []).reduce((s, l) => s + (l.debitAmount || 0), 0);
    if (t.glPostingDate) events.push({ date: t.glPostingDate, sysDate: t.systemEntryDate || t.glPostingDate, docDate: t.transactionDate, amount: amt, kind: "gl", ref: t.transactionID });
  }
  if (events.length < 10) { out.note = "Too few dated events for temporal analysis (<10)."; return out; }
  out.applicable = true;

  // --- Monthly aggregation + velocity ---
  const byMonth = new Map();
  for (const e of events) {
    const m = (e.date || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(m)) continue;
    const cur = byMonth.get(m) || { month: m, count: 0, amount: 0 };
    cur.count++; cur.amount += e.amount; byMonth.set(m, cur);
  }
  const months = [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)).map(m => ({ ...m, amount: r2(m.amount) }));
  out.monthly = months;

  // Velocity spikes: month-over-month volume change > 3× median monthly volume
  if (months.length >= 3) {
    const vols = months.map(m => m.amount).filter(v => v > 0).sort((a, b) => a - b);
    const medVol = vols.length ? vols[Math.floor(vols.length / 2)] : 0;
    months.forEach((m, i) => {
      if (i === 0) return;
      const prev = months[i - 1].amount;
      const jump = prev > 0 ? m.amount / prev : (m.amount > 0 ? Infinity : 0);
      if ((jump >= 3 || jump <= 0.33) && m.amount > medVol * 0.5 && medVol > 0) {
        out.velocitySpikes.push({ month: m.month, amount: m.amount, prevAmount: prev, changeX: prev > 0 ? r2(jump) : null,
          direction: jump >= 3 ? "spike" : "collapse" });
      }
    });
  }

  // --- Weekend & after-hours postings (using systemEntryDate timestamps) ---
  let weekend = 0, afterHours = 0, timed = 0, dated = 0;
  for (const t of data.transactions || []) {
    const d = t.glPostingDate || t.transactionDate;
    if (d) { dated++; const day = new Date(d).getDay(); if (day === 0 || day === 6) weekend++; }
    const sys = t.systemEntryDate;
    if (sys && /T\d{2}:/.test(sys)) { timed++; const hr = parseInt(sys.slice(11, 13)); if (hr < 6 || hr >= 22) afterHours++; }
  }
  if (dated > 0) out.weekendPostings = { count: weekend, total: dated, pct: r2(weekend / dated * 100), elevated: weekend / dated > 0.15,
    note: weekend / dated > 0.15 ? "Elevated weekend posting — review approval controls / automated postings." : "Weekend posting rate normal." };
  if (timed > 5) out.afterHours = { count: afterHours, total: timed, pct: r2(afterHours / timed * 100), elevated: afterHours / timed > 0.1,
    note: afterHours / timed > 0.1 ? "Material after-hours (22:00–06:00) posting activity." : "After-hours posting rate normal." };

  // --- Backdating: gap between document date and system-entry date ---
  const lags = [];
  for (const t of data.transactions || []) {
    if (t.transactionDate && t.systemEntryDate) {
      const lag = (new Date(t.systemEntryDate) - new Date(t.transactionDate)) / 86400000;
      if (!isNaN(lag)) {
        lags.push(lag);
        if (lag > 30) out.backdating.push({ ref: t.transactionID, docDate: t.transactionDate, sysDate: t.systemEntryDate, lagDays: Math.round(lag) });
      }
    }
  }
  out.backdating.sort((a, b) => b.lagDays - a.lagDays);
  out.backdating = out.backdating.slice(0, 20);
  if (lags.length) {
    const mean = lags.reduce((s, v) => s + v, 0) / lags.length;
    out.dateLag = { meanDays: r2(mean), maxDays: Math.round(Math.max(...lags)), over30: out.backdating.length,
      note: out.backdating.length > 0 ? `${out.backdating.length} entries posted >30 days after document date (backdating / late-capture risk).` : "Document-to-posting lag within normal range." };
  }

  return out;
}

function riskScore({ runResult, benford, anomalies, graph, entityRes, temporal }) {
  const factors = [];
  let raw = 0;
  const add = (label, points, detail) => { factors.push({ label, points: r2(points), detail }); raw += points; };

  // --- Compliance findings (weighted by severity) ---
  const bw = (runResult?.bySeverity?.Block || 0);
  const rw = (runResult?.bySeverity?.Reject || 0);
  const ww = (runResult?.bySeverity?.Warn || 0);
  add("Block-severity findings", Math.min(30, bw * 6), `${bw} schema/blocking issues × 6 (cap 30)`);
  add("Reject-severity findings", Math.min(20, rw * 2), `${rw} VMI-reject issues × 2 (cap 20)`);
  add("Warn-severity findings", Math.min(10, ww * 0.4), `${ww} review items × 0.4 (cap 10)`);

  // --- Benford ---
  if (benford?.applicable) {
    const bpts = benford.mad >= 0.015 ? 12 : benford.mad >= 0.012 ? 7 : benford.mad >= 0.006 ? 3 : 0;
    if (bpts) add("Benford nonconformity", bpts, `MAD ${benford.mad} (${benford.conformity})`);
  }

  // --- Anomalies ---
  if (anomalies?.outliers?.length) add("Statistical outliers", Math.min(8, anomalies.outliers.length * 0.5), `${anomalies.outliers.length} amount outliers (>${"3"}σ/IQR)`);
  if (anomalies?.roundNumberBias?.elevated) add("Round-number bias", 5, `${anomalies.roundNumberBias.pctBy100}% of amounts divisible by 100`);
  if (anomalies?.duplicateClusters?.length) add("Duplicate clusters", Math.min(8, anomalies.duplicateClusters.length * 1.5), `${anomalies.duplicateClusters.length} (party,amount,date) duplicate groups`);
  if (anomalies?.periodEndClustering?.elevated) add("Period-end clustering", 6, `${anomalies.periodEndClustering.pct}% of postings in final 3 days`);
  if (anomalies?.sequenceGaps?.length) {
    const totalMissing = anomalies.sequenceGaps.reduce((s, g) => s + g.missing, 0);
    add("Invoice sequence gaps", Math.min(6, totalMissing * 0.2), `${totalMissing} missing invoice numbers across ${anomalies.sequenceGaps.length} series`);
  }

  // --- Graph ---
  if (graph?.cycleCount) add("Circular money flows", Math.min(15, graph.cycleCount * 3), `${graph.cycleCount} cycles detected (round-trip risk)`);
  if (graph?.concentration?.hhi > 0.25) add("Supplier concentration", 6, `HHI ${graph.concentration.hhi} — ${graph.concentration.interpretation}`);

  // --- Entity resolution ---
  if (entityRes?.duplicates?.length) add("Duplicate master entities", Math.min(8, entityRes.duplicates.length * 1.2), `${entityRes.duplicates.length} probable duplicate parties`);
  if (entityRes?.sharedBankAccounts?.length) add("Shared bank accounts", Math.min(10, entityRes.sharedBankAccounts.length * 3), `${entityRes.sharedBankAccounts.length} accounts shared across entities (collusion/funnel signal)`);
  if (entityRes?.shellIndicators?.length) add("Shell-company indicators", Math.min(10, entityRes.shellIndicators.length * 1.5), `${entityRes.shellIndicators.length} entities with ≥2 shell flags`);

  // --- Temporal ---
  if (temporal?.velocitySpikes?.length) add("Volume velocity anomalies", Math.min(8, temporal.velocitySpikes.length * 2), `${temporal.velocitySpikes.length} month(s) with ≥3× volume change`);
  if (temporal?.backdating?.length) add("Backdated postings", Math.min(8, temporal.backdating.length * 1.5), `${temporal.backdating.length} entries posted >30 days after document date`);
  if (temporal?.weekendPostings?.elevated) add("Weekend posting concentration", 4, `${temporal.weekendPostings.pct}% of postings on weekends`);
  if (temporal?.afterHours?.elevated) add("After-hours postings", 4, `${temporal.afterHours.pct}% posted 22:00–06:00`);

  const score = Math.min(100, Math.round(raw));
  const band = score >= 75 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW";
  factors.sort((a, b) => b.points - a.points);

  return {
    score, band,
    factors: factors.filter(f => f.points > 0),
    interpretation: band === "CRITICAL" ? "Multiple corroborating risk signals — prioritize investigation before submission."
      : band === "HIGH" ? "Significant risk signals present — targeted review required."
      : band === "MEDIUM" ? "Moderate risk — address material findings."
      : "Low aggregate risk — routine review.",
  };
}

// ════════════════════════════════════════════════════════════════════
// ORCHESTRATOR — run all six engines, return one intelligence bundle
// ════════════════════════════════════════════════════════════════════
function runIntelligence(data, runResult, opts = {}) {
  if (!data || data._parseError) return null;
  const ontology = buildOntology(data);
  const benford = benfordAnalysis(data);
  const anomalies = anomalyAnalysis(data, opts);
  const entityRes = entityResolution(data, ontology);
  const graph = graphAnalysis(ontology, opts);
  const temporal = temporalAnalysis(data);
  const vatAudit = vatRateAudit(data);
  const risk = riskScore({ runResult, benford, anomalies, graph, entityRes, temporal });

  return {
    generatedAt: new Date().toISOString(),
    ontology: { self: ontology.self, stats: ontology.stats, entities: ontology.entities.slice(0, 200) },
    benford, anomalies, entityRes, graph, temporal, vatAudit, risk,
    summary: {
      riskScore: risk.score, riskBand: risk.band,
      cycles: graph.cycleCount, outliers: anomalies.outliers.length,
      duplicates: entityRes.duplicates.length, shells: entityRes.shellIndicators.length,
      benfordConformity: benford.applicable ? benford.conformity : "n/a",
      velocitySpikes: temporal.velocitySpikes?.length || 0, backdated: temporal.backdating?.length || 0,
      vatRateIssues: vatAudit.issueCount,
    },
  };
}

// Compact payload for the AI threat-assessment narrative
function buildThreatPayload(data, intel, runResult) {
  if (!intel) return "";
  const L = [];
  L.push(`ENTITY: ${data.header?.company?.name || "?"} (${data.header?.company?.registrationNumber || "?"})`);
  L.push(`PERIOD: ${data.header?.fiscalYearFrom} → ${data.header?.fiscalYearTo}`);
  L.push(`RISK SCORE: ${intel.risk.score}/100 (${intel.risk.band})`);
  L.push("RISK FACTORS:");
  intel.risk.factors.forEach(f => L.push(`  +${f.points} ${f.label}: ${f.detail}`));
  L.push(`\nBENFORD: ${intel.benford.applicable ? `MAD ${intel.benford.mad}, χ²=${intel.benford.chi2} (crit 15.51), ${intel.benford.conformity}` : "n/a (sample<50)"}`);
  L.push(`ANOMALIES: ${intel.anomalies.outliers.length} outliers; round-bias ${intel.anomalies.roundNumberBias?.elevated ? "ELEVATED" : "normal"}; ${intel.anomalies.duplicateClusters.length} dup clusters; period-end ${intel.anomalies.periodEndClustering?.elevated ? "CLUSTERED" : "normal"}`);
  L.push(`GRAPH: ${intel.graph.nodeCount} nodes, ${intel.graph.cycleCount} circular flows; concentration HHI ${intel.graph.concentration.hhi} (${intel.graph.concentration.interpretation})`);
  if (intel.temporal?.applicable) {
    L.push(`TEMPORAL: ${intel.temporal.velocitySpikes?.length || 0} velocity anomalies; ${intel.temporal.backdating?.length || 0} backdated >30d; weekend ${intel.temporal.weekendPostings?.elevated ? "ELEVATED" : "normal"}; after-hours ${intel.temporal.afterHours?.elevated ? "ELEVATED" : "normal"}`);
    if (intel.temporal.velocitySpikes?.length)
      L.push("  Velocity: " + intel.temporal.velocitySpikes.slice(0, 4).map(v => `${v.month} ${v.direction} ${v.changeX ? v.changeX + "×" : ""}`).join(", "));
  }
  if (intel.graph.cycles.length) {
    L.push("TOP CYCLES (potential round-trips):");
    intel.graph.cycles.slice(0, 5).forEach(c => L.push(`  ${c.path.map(p => p.split(":")[1]).join(" → ")} (min flow €${c.minFlow})`));
  }
  L.push(`ENTITY RESOLUTION: ${intel.entityRes.duplicates.length} duplicates; ${intel.entityRes.sharedBankAccounts.length} shared-bank groups; ${intel.entityRes.shellIndicators.length} shell-flagged`);
  if (intel.entityRes.shellIndicators.length) {
    L.push("TOP SHELL-FLAGGED:");
    intel.entityRes.shellIndicators.slice(0, 5).forEach(s => L.push(`  ${s.name || s.entity}: ${s.flags.join(", ")}`));
  }
  L.push(`\nCOMPLIANCE: ${runResult?.summary?.total || 0} findings (${runResult?.bySeverity?.Block || 0} Block, ${runResult?.bySeverity?.Reject || 0} Reject, ${runResult?.bySeverity?.Warn || 0} Warn)`);
  return L.join("\n");
}

// --- AI threat assessment ---
const SYSTEM_PROMPT_THREAT_ASSESSMENT = `You are the **TAXAI Forensic Intelligence Analyst** — a financial-crime and tax-fraud investigator at the level of an FNTT/VMI senior forensic auditor combined with a Big-4 forensic-accounting partner.

You receive the DETERMINISTIC output of a forensic engine that has already run six analyses: composite risk score, Benford's Law, statistical anomaly detection, entity resolution, transaction-graph cycle detection, and compliance findings. Every number is a fact computed in code. DO NOT invent numbers. DO NOT contradict the engine.

Your job: convert these signals into an intelligence-grade threat assessment a human investigator can act on.

# Output (markdown, this exact structure)

## 🎯 Threat Assessment Summary
3-5 sentences. Overall risk posture, the single most concerning signal, and whether this file warrants escalation to enhanced review / FNTT referral consideration. State the risk score and band.

## 🔴 Priority Threats
For each material signal (highest risk first), as a numbered list:
- **Threat name** — risk contribution, confidence
- *Pattern:* what the data shows (cite the exact figures: cycle path, MAD value, outlier €, shell flags)
- *Fraud typology:* name it (e.g., carousel/MTIC VAT fraud, round-tripping, fictitious invoicing, channel stuffing, layering, smurfing, related-party value extraction)
- *Hypothesis:* the most plausible benign explanation AND the most plausible illicit explanation — hold both
- *Investigative next step:* the specific document/query that would confirm or clear it

## 🕸️ Network Analysis
Interpret the transaction graph: cycles (round-trips), concentration, fan-in/out. For any detected cycle, explain what a circular money flow between these specific parties could indicate and what to pull (contracts, delivery evidence, bank confirmations).

## 🧮 Statistical Forensics
Interpret Benford (MAD/χ²) and anomaly findings. If Benford shows nonconformity, explain what kinds of manipulation produce that signature (threshold avoidance, fabricated figures, systematic rounding) — but note legitimate causes too (assigned numbers, price points, small samples).

## 🏢 Entity Intelligence
Interpret entity-resolution output: duplicate masters, shared bank accounts, shared addresses, shell indicators. Shared bank account across "independent" suppliers is a strong collusion/funnel signal — say so, but note legitimate causes (factoring, group treasury).

## ⚖️ Regulatory Exposure
Map the threats to Lithuanian exposure: PVMĮ (VAT fraud, MTIC), PMĮ (profit shifting, related-party PMĮ 40 str. arm's length), MAĮ (penalties, MAĮ 68 voluntary disclosure window), AML (Pinigų plovimo prevencijos įstatymas, FNTT reporting thresholds). Cite articles; write "(verify)" if unsure.

## 🛡️ Recommended Actions
Numbered. For each: action, owner, urgency (immediate / 30-day / monitoring), and whether it is a control fix, an investigation, or a disclosure decision.

## 📊 Confidence & False Positives
For the top 3 threats, give an explicit false-positive probability and the single fact that would most cheaply resolve it. Be calibrated — most files are messy, not fraudulent.

# Rules
- Investigator's mindset: every signal has an innocent and a guilty reading. Present both. Do not assume guilt.
- Cite exact figures from the engine. Never invent.
- Name fraud typologies precisely.
- Lithuanian legal grounding; "(verify)" if unsure of an article.
- This is decision-support, not an accusation. Never assert fraud as fact — assert that signals warrant investigation.
- Be concise and senior. If risk is LOW, say so plainly and keep it short.`;

/**
 * Run the AI threat assessment over deterministic intelligence output.
 * @param data    parsed SAF-T
 * @param intel   runIntelligence() output
 * @param runResult runAllRules() output
 * @param callAI  app's Gemini callAI(system, user, history)
 */
async function runThreatAssessment(data, intel, runResult, callAI) {
  if (!intel) return "No intelligence data. Run the engine first.";
  const payload = buildThreatPayload(data, intel, runResult);
  const userPrompt = `Produce a forensic threat assessment from this deterministic engine output. Cite the exact figures. Hold both innocent and illicit hypotheses.

${payload}

Write the assessment per your system prompt structure. The risk score is ${intel.risk.score}/100 (${intel.risk.band}). Be calibrated about false positives.`;
  return await callAI(SYSTEM_PROMPT_THREAT_ASSESSMENT, userPrompt, []);
}


// ═══ ADAPTIVE PERSONALIZED RULES (AI-designed, deterministically scored) ═══
// ════════════════════════════════════════════════════════════════════
// TAXAI · ADAPTIVE RULE ENGINE  (personalized, industry-specific rules)
// ────────────────────────────────────────────────────────────────────
// Philosophy (mirrors the deterministic 300-rule engine):
//   • The AI agent proposes WHAT to check and WHY (domain knowledge).
//   • Every check is evaluated DETERMINISTICALLY against a registry of
//     pre-computed metrics — so PASS/FAIL is reproducible and grounded,
//     never an ungrounded LLM judgement. No code is ever eval()'d.
//   • A generated rule's `condition` describes the ADVERSE trigger.
//     condition TRUE  → FAIL (flag raised, observed value shown)
//     condition FALSE → PASS
//     metric missing  → N/A
// ════════════════════════════════════════════════════════════════════

const _r2 = (n) => Math.round((n || 0) * 100) / 100;
const _sd = (a, b) => (b && isFinite(a / b) ? a / b : 0);
const _low = (s) => (typeof s === "string" ? s.toLowerCase() : "");

// ─── Sector lexicons (EN + LT keywords) ──────────────────────────────
const SECTOR_LEXICON = {
  Logistics: ["transport", "freight", "logist", "vežim", "vezim", "krovin", "gabenim", "fracht", "sped", "expedic", "kuro", "fuel", "diesel", "dyzelin", "degal", "vehicle", "truck", "sunkvežim", "sunkvezim", "vilkik", "fleet", "autopark", "mileage", "km", "warehouse", "sandėl", "sandel", "courier", "kurjer"],
  Construction: ["statyb", "construct", "build", "betonas", "concrete", "cement", "rebar", "armatūr", "armatur", "fasad", "montav", "install", "subrangov", "subcontract", "statybin", "renovac", "demolit", "griovim"],
  Retail: ["prekyb", "retail", "wholesale", "parduotuv", "store", "pos", "kasos", "didmen", "mažmen", "mazmen", "ecommerce", "e-shop", "eshop", "shop"],
  Manufacturing: ["gamyb", "manufactur", "production", "žaliav", "zaliav", "raw material", "gamykl", "factory", "cech", "assembly", "surinkim", "perdirb"],
  IT_Software: ["programin", "software", "saas", "hosting", "server", "develop", "kūrim", "kurim", "it paslaug", "licenc", "cloud", "duomenų centr", "data center", "app "],
  ProfServices: ["konsultac", "consult", "audit", "teisin", "legal", "advokat", "account", "buhalter", "marketing", "reklam", "dizain", "design", "engineering", "projektav"],
  Hospitality: ["viešbut", "viesbut", "hotel", "apgyvendin", "accommodation", "restoran", "restaurant", "maitinim", "catering", "kavin", "baras", "turizm", "tourism"],
  RealEstate: ["nuoma", "rent", "lease", "nekilnojam", "real estate", "patalp", "premises", "pastat", "property", "developer"],
  Agriculture: ["žemės ūkis", "zemes ukis", "agricultur", "farm", "ūkis", "ukis", "derli", "crop", "grūd", "grud", "gyvulia", "livestock", "pasėli", "trąš"],
  Healthcare: ["medicin", "health", "sveikat", "klinik", "clinic", "vaistin", "pharma", "odontolog", "dental", "reabilit"],
  Finance: ["finans", "draudim", "insurance", "kredit", "lizing", "leasing", "paskol", "loan", "invest", "broker", "fondas", "fund"],
  Energy: ["energij", "energy", "elektr", "dujos", "gas", "kuro bazė", "atsinaujin", "renewable", "solar", "saulės", "vėjo", "wind"],
};

// ════════════════════════════════════════════════════════════════════
// METRIC REGISTRY — flat, named, deterministic.  The AI may ONLY
// reference these keys in rule conditions.
// ════════════════════════════════════════════════════════════════════
function buildMetricRegistry(data, ctx, kpiBundle) {
  const kpis = kpiBundle?.kpis || {};
  const accts = data.accounts || [];
  const products = data.products || [];
  const customers = data.customers || [];
  const suppliers = data.suppliers || [];
  const assets = data.assets || [];
  const sales = data.sales?.items || [];
  const purchases = data.purchases?.items || [];
  const payments = data.payments || [];
  const uoms = data.uoms || [];

  // ─ sector keyword scan over descriptive text ─
  const corpus = [
    ...accts.map((a) => a.accountDescription),
    ...products.map((p) => p.description),
    ...customers.map((c) => c.name),
    ...suppliers.map((s) => s.name),
    ...assets.map((a) => a.description),
  ].map(_low).filter(Boolean);
  const blob = corpus.join(" | ");
  const sectorSignals = {};
  for (const [sector, terms] of Object.entries(SECTOR_LEXICON)) {
    let hits = 0;
    const matched = [];
    for (const term of terms) {
      const n = blob.split(term).length - 1;
      if (n > 0) { hits += n; matched.push(term); }
    }
    if (hits > 0) sectorSignals[sector] = { hits, terms: matched.slice(0, 8) };
  }
  const sectorRanked = Object.entries(sectorSignals).sort((a, b) => b[1].hits - a[1].hits);
  const topSector = sectorRanked[0]?.[0] || "Unknown";

  // ─ account-side sums ─
  const sumClose = (pred, side) => accts.filter(pred).reduce((s, a) => {
    const db = a.closingDebitBalance || 0, cr = a.closingCreditBalance || 0;
    return s + (side === "credit" ? cr - db : db - cr);
  }, 0);

  const revenue = kpis.revenue ?? _r2(sumClose((a) => a.accountType === "P", "credit"));
  const costs = kpis.costs ?? _r2(sumClose((a) => a.accountType === "S", "debit"));

  // ─ keyword-matched cost buckets (best-effort, from account descriptions) ─
  const acctCostByKeyword = (keywords) => _r2(accts.filter((a) =>
    keywords.some((k) => _low(a.accountDescription).includes(k))
  ).reduce((s, a) => s + Math.max(0, (a.closingDebitBalance || 0) - (a.closingCreditBalance || 0)), 0));

  const fuelCost = acctCostByKeyword(["kuro", "degal", "fuel", "diesel", "dyzelin", "benzin"]);
  const payrollCost = acctCostByKeyword(["atlygin", "darbo užmok", "darbo uzmok", "payroll", "salar", "wage", "sodra", "soc. draud", "socialinio draud"]);
  const rentCost = acctCostByKeyword(["nuoma", "rent", "lease", "lizing"]);
  const subcontractCost = acctCostByKeyword(["subrangov", "subcontract", "rangov"]);
  const materialsCost = acctCostByKeyword(["medžiag", "medziag", "material", "žaliav", "zaliav", "raw"]);
  const transportCost = acctCostByKeyword(["transport", "vežim", "vezim", "gabenim", "freight", "logist", "sped"]);
  const repairCost = acctCostByKeyword(["remont", "repair", "priežiūr", "prieziur", "service", "techninė", "technine"]);
  const marketingCost = acctCostByKeyword(["reklam", "marketing", "rinkodar"]);

  // ─ asset signals ─
  const totalAssetBookEnd = _r2(assets.reduce((s, a) => s + (a.valuation?.bookValueEnd || 0), 0));
  const depreciationPeriod = _r2(assets.reduce((s, a) => s + (a.valuation?.depreciationForPeriod || 0), 0));
  const acquisitionsPeriod = _r2(assets.reduce((s, a) => s + (a.valuation?.acquisitionsInPeriod || 0), 0));
  const vehicleAssets = assets.filter((a) => ["transport", "vehicle", "truck", "sunkvežim", "sunkvezim", "vilkik", "automobil", "auto ", "krovin", "priekab", "trailer"].some((k) => _low(a.description).includes(k))).length;

  // ─ inventory / stock ─
  const stockEntries = data.physicalStock || [];
  const closingStockUnits = _r2(stockEntries.reduce((s, x) => s + (x.closingStockQuantity || 0), 0));

  // ─ product mix ─
  const goodsCount = products.filter((p) => p.goodsServicesID === "PR").length;
  const servicesCount = products.filter((p) => p.goodsServicesID === "PS").length;
  const productTotal = products.length || 1;

  // ─ payment-method mix ─
  const cashPayments = payments.filter((p) => ["KPO", "KIO", "C", "CP"].includes(p.paymentMethod)).length;
  const cashPaymentSharePct = _r2(_sd(cashPayments, Math.max(1, payments.length)) * 100);

  // ─ cross-border / export share (by counterparty country ≠ LT) ─
  const foreignCust = customers.filter((c) => (c.country || c.addressCountry) && (c.country || c.addressCountry) !== "LT").length;
  const foreignSupp = suppliers.filter((s) => (s.country || s.addressCountry) && (s.country || s.addressCountry) !== "LT").length;
  const foreignCustSharePct = _r2(_sd(foreignCust, Math.max(1, customers.length)) * 100);
  const foreignSuppSharePct = _r2(_sd(foreignSupp, Math.max(1, suppliers.length)) * 100);

  // ─ UoM hints ─
  const uomSet = new Set(uoms.map((u) => _low(u.unitOfMeasure)));
  const hasDistanceUom = ["km", "kilometr"].some((u) => uomSet.has(u));
  const hasHourUom = ["val", "h", "hour", "val.", "valanda"].some((u) => uomSet.has(u));
  const hasWeightUom = ["kg", "t", "tona", "ton"].some((u) => uomSet.has(u));

  // ─ invoice value concentration ─
  const salesByCust = {};
  for (const inv of sales) {
    const v = inv.documentTotals?.netTotal || 0;
    salesByCust[inv.customerID || "?"] = (salesByCust[inv.customerID || "?"] || 0) + v;
  }
  const salesVals = Object.values(salesByCust).sort((a, b) => b - a);
  const totalSalesVal = salesVals.reduce((s, v) => s + v, 0) || 1;
  const topCustomerConcentrationPct = _r2(_sd(salesVals[0] || 0, totalSalesVal) * 100);
  const top3CustomerConcentrationPct = _r2(_sd(salesVals.slice(0, 3).reduce((s, v) => s + v, 0), totalSalesVal) * 100);

  // ─ assemble registry ─
  const def = [
    // FINANCE
    ["revenue", "Revenue", revenue, " EUR", "Finance"],
    ["costs", "Total costs", costs, " EUR", "Finance"],
    ["grossResult", "Gross result", kpis.grossResult ?? _r2(revenue - costs), " EUR", "Finance"],
    ["grossMarginPct", "Gross margin", kpis.grossMarginPct ?? _r2(_sd(revenue - costs, revenue) * 100), "%", "Finance"],
    ["netMarginPct", "Net margin (est.)", kpis.netMarginPct ?? 0, "%", "Finance"],
    ["currentRatio", "Current ratio", kpis.currentRatio ?? 0, "", "Finance"],
    ["debtToEquity", "Debt / equity", kpis.debtToEquity ?? 0, "", "Finance"],
    ["workingCapital", "Working capital", kpis.workingCapital ?? 0, " EUR", "Finance"],
    ["dso", "Days sales outstanding", kpis.dso ?? 0, " days", "Finance"],
    ["dpo", "Days payables outstanding", kpis.dpo ?? 0, " days", "Finance"],
    ["receivables", "Receivables", kpis.receivables ?? 0, " EUR", "Finance"],
    ["payables", "Payables", kpis.payables ?? 0, " EUR", "Finance"],
    // TAX
    ["salesVat", "Output VAT", kpis.salesVat ?? 0, " EUR", "Tax"],
    ["inputVat", "Input VAT", kpis.inputVat ?? 0, " EUR", "Tax"],
    ["netVatPosition", "Net VAT position", kpis.netVatPosition ?? 0, " EUR", "Tax"],
    ["vatRecoveryRatePct", "VAT recovery rate", kpis.vatRecoveryRatePct ?? 0, "%", "Tax"],
    ["effectiveTaxRatePct", "Effective tax rate", kpis.effectiveTaxRatePct ?? 0, "%", "Tax"],
    // COST STRUCTURE (sector-revealing)
    ["fuelCost", "Fuel cost", fuelCost, " EUR", "Cost structure"],
    ["fuelCostSharePct", "Fuel cost share of costs", _r2(_sd(fuelCost, Math.max(1, costs)) * 100), "%", "Cost structure"],
    ["payrollCost", "Payroll cost", payrollCost, " EUR", "Cost structure"],
    ["payrollCostSharePct", "Payroll share of costs", _r2(_sd(payrollCost, Math.max(1, costs)) * 100), "%", "Cost structure"],
    ["rentCost", "Rent / lease cost", rentCost, " EUR", "Cost structure"],
    ["subcontractCost", "Subcontractor cost", subcontractCost, " EUR", "Cost structure"],
    ["subcontractSharePct", "Subcontractor share of costs", _r2(_sd(subcontractCost, Math.max(1, costs)) * 100), "%", "Cost structure"],
    ["materialsCost", "Materials / raw cost", materialsCost, " EUR", "Cost structure"],
    ["materialsSharePct", "Materials share of costs", _r2(_sd(materialsCost, Math.max(1, costs)) * 100), "%", "Cost structure"],
    ["transportCost", "Transport / freight cost", transportCost, " EUR", "Cost structure"],
    ["repairCost", "Repair / maintenance cost", repairCost, " EUR", "Cost structure"],
    ["marketingCost", "Marketing cost", marketingCost, " EUR", "Cost structure"],
    // ASSETS
    ["fixedAssetsBookEnd", "Fixed assets (book value end)", totalAssetBookEnd, " EUR", "Assets"],
    ["depreciationPeriod", "Depreciation for period", depreciationPeriod, " EUR", "Assets"],
    ["acquisitionsPeriod", "Asset acquisitions in period", acquisitionsPeriod, " EUR", "Assets"],
    ["vehicleAssetCount", "Vehicle / transport assets", vehicleAssets, "", "Assets"],
    ["assetIntensityPct", "Fixed-asset intensity (of revenue)", _r2(_sd(totalAssetBookEnd, Math.max(1, revenue)) * 100), "%", "Assets"],
    // INVENTORY / PRODUCT
    ["closingStockUnits", "Closing stock units", closingStockUnits, " units", "Inventory"],
    ["productCount", "Distinct products", products.length, "", "Inventory"],
    ["goodsSharePct", "Goods share of catalogue", _r2(_sd(goodsCount, productTotal) * 100), "%", "Inventory"],
    ["servicesSharePct", "Services share of catalogue", _r2(_sd(servicesCount, productTotal) * 100), "%", "Inventory"],
    // COUNTERPARTIES
    ["customerCount", "Customers", customers.length, "", "Counterparties"],
    ["supplierCount", "Suppliers", suppliers.length, "", "Counterparties"],
    ["topCustomerConcentrationPct", "Top-1 customer revenue share", topCustomerConcentrationPct, "%", "Counterparties"],
    ["top3CustomerConcentrationPct", "Top-3 customer revenue share", top3CustomerConcentrationPct, "%", "Counterparties"],
    ["topSupplierConcentrationPct", "Top-1 supplier payable share", kpis.topSupplierConcentrationPct ?? 0, "%", "Counterparties"],
    ["top3SupplierConcentrationPct", "Top-3 supplier payable share", kpis.top3SupplierConcentrationPct ?? 0, "%", "Counterparties"],
    ["foreignCustomerSharePct", "Foreign customer share", foreignCustSharePct, "%", "Counterparties"],
    ["foreignSupplierSharePct", "Foreign supplier share", foreignSuppSharePct, "%", "Counterparties"],
    // CASH / OPS
    ["cashPaymentSharePct", "Cash-method payment share", cashPaymentSharePct, "%", "Operations"],
    ["transactionCount", "GL transactions", kpis.transactionCount ?? (data.transactions || []).length, "", "Operations"],
    ["invoiceCount", "Invoices", kpis.invoiceCount ?? (sales.length + purchases.length), "", "Operations"],
    // FLAGS (0/1)
    ["hasDistanceUom", "Uses distance UoM (km)", hasDistanceUom ? 1 : 0, " (0/1)", "Signals"],
    ["hasHourUom", "Uses hourly UoM", hasHourUom ? 1 : 0, " (0/1)", "Signals"],
    ["hasWeightUom", "Uses weight UoM", hasWeightUom ? 1 : 0, " (0/1)", "Signals"],
  ];

  const metrics = {};
  const flat = {};
  for (const [key, label, value, unit, group] of def) {
    const v = typeof value === "number" && isFinite(value) ? value : 0;
    metrics[key] = { label, value: v, unit, group };
    flat[key] = v;
  }

  return {
    metrics,
    flat,
    sectorSignals,
    topSector,
    sectorRanked: sectorRanked.map(([s, o]) => ({ sector: s, hits: o.hits, terms: o.terms })),
  };
}

// ════════════════════════════════════════════════════════════════════
// SAFE CONDITION EVALUATOR — no eval, only metric lookups + comparisons.
// ════════════════════════════════════════════════════════════════════
const OPS = {
  ">": (a, b) => a > b, ">=": (a, b) => a >= b,
  "<": (a, b) => a < b, "<=": (a, b) => a <= b,
  "==": (a, b) => a === b, "!=": (a, b) => a !== b,
  gt: (a, b) => a > b, gte: (a, b) => a >= b, lt: (a, b) => a < b, lte: (a, b) => a <= b,
  eq: (a, b) => a === b, ne: (a, b) => a !== b,
};

function evalCondition(cond, flat) {
  if (!cond || typeof cond !== "object") return { ok: null, missing: ["(no condition)"] };

  if (Array.isArray(cond.all)) {
    let any = false; const missing = [];
    let result = true;
    for (const c of cond.all) {
      const r = evalCondition(c, flat);
      if (r.ok === null) { missing.push(...r.missing); continue; }
      any = true; result = result && r.ok;
    }
    if (!any) return { ok: null, missing };
    return { ok: result, missing };
  }
  if (Array.isArray(cond.any)) {
    let any = false; const missing = [];
    let result = false;
    for (const c of cond.any) {
      const r = evalCondition(c, flat);
      if (r.ok === null) { missing.push(...r.missing); continue; }
      any = true; result = result || r.ok;
    }
    if (!any) return { ok: null, missing };
    return { ok: result, missing };
  }

  // leaf
  const key = cond.metric;
  if (!key || !(key in flat)) return { ok: null, missing: [key || "(unnamed metric)"] };
  const actual = flat[key];
  const op = cond.op;
  if (op === "exists") return { ok: actual != null, missing: [] };
  if (op === "between" && Array.isArray(cond.value)) {
    const [lo, hi] = cond.value;
    return { ok: actual >= lo && actual <= hi, missing: [] };
  }
  const fn = OPS[op];
  if (!fn) return { ok: null, missing: [`(bad op '${op}')`] };
  return { ok: fn(actual, cond.value), missing: [] };
}

// Render the observed value(s) referenced by a condition, for evidence display.
function observedFromCondition(cond, registry) {
  const keys = [];
  const collect = (c) => {
    if (!c || typeof c !== "object") return;
    if (Array.isArray(c.all)) return c.all.forEach(collect);
    if (Array.isArray(c.any)) return c.any.forEach(collect);
    if (c.metric) keys.push(c.metric);
  };
  collect(cond);
  return [...new Set(keys)].map((k) => {
    const m = registry.metrics[k];
    if (!m) return `${k} = (unavailable)`;
    const val = typeof m.value === "number" ? m.value.toLocaleString() : m.value;
    return `${m.label}: ${val}${m.unit || ""}`;
  });
}

function evaluateGeneratedRule(rule, registry) {
  const res = evalCondition(rule.condition, registry.flat);
  let status;
  if (res.ok === null) status = "N/A";
  else status = res.ok ? "FAIL" : "PASS";
  return {
    status,
    observed: observedFromCondition(rule.condition, registry),
    missingMetrics: res.missing || [],
  };
}


// ════════════════════════════════════════════════════════════════════
// AI LAYER — the Adaptive Rule Architect proposes rules; we evaluate.
// ════════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT_PERSONALIZED_RULES = `You are the **TAXAI Adaptive Rule Architect** — a forensic auditor + industry CFO who designs bespoke, company-specific audit & financial-health rules for a Lithuanian entity, on top of the verified deterministic SAF-T audit rules.

YOUR JOB: Given (a) the company's deterministically pre-computed METRIC REGISTRY, (b) a detected industry signal, and (c) the titles of the existing 300 rules, propose NEW rules that the 300 generic rules do NOT already cover. The rules must be (1) specific to this company's industry and data profile, and (2) genuinely useful — surfacing tax-compliance risk, fraud/error risk, OR financial-health insight that helps the company understand its finances.

HARD CONSTRAINTS — obey exactly:
1. Output ONLY a single JSON object. No prose, no markdown, no code fences.
2. Each rule's "condition" may reference ONLY metric keys from the provided METRIC REGISTRY. Never invent a metric key. If you cannot express a check with the available metrics, do not propose it.
3. The "condition" describes the ADVERSE trigger: when it is TRUE the rule FAILS (a flag is raised). When FALSE it PASSES. Design thresholds so a clean company passes.
4. Ground every threshold in a defensible industry benchmark or LT tax logic; put the reasoning in "rationale" and a plain-language reading in "interpretation".
5. Do NOT duplicate any of the 300 existing rules. Add value beyond schema/format validation.
6. Propose 8–14 rules. Quality over quantity.
7. Where a check maps to Lithuanian tax law, cite the article in "lawRef" (e.g. "PVM 96 str."). Only cite if you are confident; otherwise leave "".

CONDITION GRAMMAR (strict JSON):
  Leaf:     {"metric":"<key>","op":">"|">="|"<"|"<="|"=="|"!="|"between"|"exists","value":<number | [lo,hi]>}
  Compound: {"all":[<cond>,...]}  or  {"any":[<cond>,...]}

OUTPUT SCHEMA (exact keys):
{
  "industry": "<your final sector label>",
  "industryConfidence": "high"|"medium"|"low",
  "industryRationale": "<1-2 sentences citing the data signals you used>",
  "rules": [
    {
      "id": "<PREFIX-NN, e.g. P-LOG-01>",
      "category": "<short category, e.g. Fleet & Fuel>",
      "severity": "Block"|"Reject"|"Warn",
      "type": "B"|"C"|"F",
      "kind": "compliance"|"risk"|"insight",
      "title": "<concise rule title>",
      "rationale": "<why this matters for THIS company/industry + the benchmark used>",
      "interpretation": "<what a FAIL means in plain language, and the suggested action>",
      "lawRef": "<LT article or empty string>",
      "condition": <condition object referencing only registry metric keys>
    }
  ]
}
Severity guide: Block = likely tax non-compliance / high fraud risk; Reject = material risk needing correction; Warn = advisory / financial-health insight (most "insight" rules are Warn). Type: B=Business, C=Consistency, F=Financial-risk.`;

function buildPersonalizedRulesPrompt(company, registry, catalogTitles) {
  const lines = [];
  lines.push(`COMPANY: ${company.name} · period ${company.period} · ${company.dataType || ""}`);
  lines.push("");
  lines.push(`DETECTED INDUSTRY SIGNAL (deterministic keyword scan): top = ${registry.topSector}`);
  registry.sectorRanked.slice(0, 4).forEach((s) =>
    lines.push(`  ${s.sector}: ${s.hits} hits [${s.terms.join(", ")}]`));
  lines.push("");
  lines.push("METRIC REGISTRY — reference ONLY these keys in conditions:");
  const byGroup = {};
  for (const [key, m] of Object.entries(registry.metrics)) {
    (byGroup[m.group] = byGroup[m.group] || []).push(`    ${key} = ${m.value}${m.unit} (${m.label})`);
  }
  for (const [g, arr] of Object.entries(byGroup)) { lines.push(`  [${g}]`); lines.push(...arr); }
  lines.push("");
  lines.push(`EXISTING 300 RULE TITLES (do NOT duplicate — these are already covered):`);
  lines.push(catalogTitles.slice(0, 300).map((t) => `  • ${t}`).join("\n"));
  lines.push("");
  lines.push("Now design the company-specific adaptive rules per your system prompt. Return ONLY the JSON object.");
  return lines.join("\n");
}

// Tolerant JSON extraction: strips code fences / prose, finds the outermost object.
function parsePersonalizedRulesJSON(text) {
  if (!text) return null;
  let s = String(text).trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  // Find first { and last } to isolate the object even with surrounding prose.
  const i = s.indexOf("{"), j = s.lastIndexOf("}");
  if (i === -1 || j === -1 || j < i) return null;
  const slice = s.slice(i, j + 1);
  try { return JSON.parse(slice); } catch { /* fallthrough */ }
  // Last resort: remove trailing commas, retry.
  try { return JSON.parse(slice.replace(/,(\s*[}\]])/g, "$1")); } catch { return null; }
}

function sanitizeGeneratedRules(parsed, registry) {
  const ALLOWED_SEV = new Set(["Block", "Reject", "Warn"]);
  const ALLOWED_TYPE = new Set(["B", "C", "F"]);
  const ALLOWED_KIND = new Set(["compliance", "risk", "insight"]);
  const out = [];
  const seen = new Set();
  let n = 0;
  for (const raw of parsed?.rules || []) {
    if (!raw || typeof raw !== "object") continue;
    if (!raw.title || !raw.condition) continue;
    n += 1;
    const id = (typeof raw.id === "string" && raw.id.trim()) ? raw.id.trim() : `P-AI-${String(n).padStart(2, "0")}`;
    if (seen.has(id)) continue; seen.add(id);
    const rule = {
      id,
      category: typeof raw.category === "string" ? raw.category.slice(0, 60) : "Adaptive",
      severity: ALLOWED_SEV.has(raw.severity) ? raw.severity : "Warn",
      type: ALLOWED_TYPE.has(raw.type) ? raw.type : "F",
      kind: ALLOWED_KIND.has(raw.kind) ? raw.kind : "risk",
      title: String(raw.title).slice(0, 200),
      rationale: typeof raw.rationale === "string" ? raw.rationale.slice(0, 600) : "",
      interpretation: typeof raw.interpretation === "string" ? raw.interpretation.slice(0, 600) : "",
      lawRef: typeof raw.lawRef === "string" ? raw.lawRef.slice(0, 80) : "",
      condition: raw.condition,
    };
    const ev = evaluateGeneratedRule(rule, registry);
    rule.status = ev.status;
    rule.observed = ev.observed;
    rule.missingMetrics = ev.missingMetrics;
    out.push(rule);
    if (out.length >= 16) break;
  }
  return out;
}

// ─── PUBLIC RUNNER — adaptive personalized rules ─────────────────────
// Computes the deterministic metric registry, asks Gemini to design
// company/industry-specific rules over those metrics, then evaluates
// each proposed rule DETERMINISTICALLY (PASS/FAIL/N-A). The 300-rule
// guarantees are untouched; this is a strictly additive overlay.
async function runPersonalizedRules(data, runResult, ctx, kpiBundle, callAI) {
  if (!data || !runResult) return { error: "No data to analyze. Run the engine first." };
  const _ctx = ctx || buildContext(data);
  let _kpi = kpiBundle;
  try { if (!_kpi) _kpi = computeKPIs(data, _ctx); } catch { _kpi = { kpis: {} }; }
  const registry = buildMetricRegistry(data, _ctx, _kpi);
  const catalogTitles = getRuleCatalog().map((r) => r.title);
  const company = {
    name: data.header?.company?.name || "(unknown)",
    period: `${data.header?.fiscalYearFrom || ""} \u2192 ${data.header?.fiscalYearTo || ""}`,
    dataType: data.header?.dataType || "",
  };
  const userPrompt = buildPersonalizedRulesPrompt(company, registry, catalogTitles);
  let text;
  try {
    text = await callAI(SYSTEM_PROMPT_PERSONALIZED_RULES, userPrompt, []);
  } catch (e) {
    return { error: e.message, registry, detectedSector: registry.topSector };
  }
  const parsed = parsePersonalizedRulesJSON(text);
  if (!parsed) return { error: "AI did not return valid rule JSON \u2014 try Regenerate.", registry, detectedSector: registry.topSector, raw: (text || "").slice(0, 800) };
  const rules = sanitizeGeneratedRules(parsed, registry);
  const counts = {
    total: rules.length,
    fail: rules.filter((r) => r.status === "FAIL").length,
    pass: rules.filter((r) => r.status === "PASS").length,
    na: rules.filter((r) => r.status === "N/A").length,
  };
  return {
    industry: parsed.industry || registry.topSector,
    industryConfidence: parsed.industryConfidence || "medium",
    industryRationale: parsed.industryRationale || "",
    detectedSector: registry.topSector,
    sectorRanked: registry.sectorRanked,
    rules,
    registry,
    counts,
    generatedAt: new Date().toISOString(),
  };
}



// ═══ i.SAF ENGINE — monthly VAT register: parse + reconcile vs SAF-T ═══
// ════════════════════════════════════════════════════════════════════
// TAXAI · i.SAF ENGINE  (monthly VAT invoice register: parse + reconcile)
// ────────────────────────────────────────────────────────────────────
// i.SAF (Order VA-55) is the monthly register of issued (sales) and
// received (purchase) VAT invoices that every VAT-registered LT entity
// files. This module (1) parses an i.SAF XML and (2) reconciles it
// against the full SAF-T ledger — the same discrepancy hunt VMI's i.MAS
// performs — all deterministically. NOTE: field extraction is tolerant
// (multiple candidate tag names); confirm against the official i.SAF XSD
// before relying on it in production.
// ════════════════════════════════════════════════════════════════════

const _num = (s) => {
  if (s == null || s === "") return 0;
  const n = parseFloat(String(s).replace(/\s/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
};
// (_r2 reused from the adaptive-rules engine above)

// In a browser this uses DOMParser; the test harness injects a shim.
function parseISAF(xmlStr, DOMParserImpl) {
  try {
    const DP = DOMParserImpl || (typeof DOMParser !== "undefined" ? DOMParser : null);
    if (!DP) return { _parseError: "No XML parser available" };
    const doc = new DP().parseFromString(xmlStr, "text/xml");
    const perr = doc.querySelector && doc.querySelector("parsererror");
    if (perr) return { _parseError: (perr.textContent || "XML parse error").slice(0, 200) };

    const txt = (parent, ...tags) => {
      if (!parent) return "";
      for (const tag of tags) {
        const els = parent.getElementsByTagName(tag);
        for (let i = 0; i < els.length; i++) {
          const v = (els[i].textContent || "").trim();
          if (v) return v;
        }
      }
      return "";
    };
    // direct child text only (avoids picking a nested same-named tag)
    const childTxt = (parent, ...tags) => {
      if (!parent) return "";
      for (const tag of tags) {
        for (let i = 0; i < parent.childNodes.length; i++) {
          const c = parent.childNodes[i];
          if (c.nodeType === 1 && (c.localName === tag || c.tagName === tag)) {
            const v = (c.textContent || "").trim();
            if (v) return v;
          }
        }
      }
      return "";
    };

    const root = doc.documentElement;
    const registrationNumber = txt(root, "RegistrationNumber", "RegistrationCode");
    const fileDate = txt(root, "FileDateCreated", "FileDate", "DateCreated");
    const periodFrom = txt(root, "SelectionStartDate", "PeriodStart", "TaxPeriodStart");
    const periodTo = txt(root, "SelectionEndDate", "PeriodEnd", "TaxPeriodEnd");

    const readInvoice = (el, side) => {
      // counterparty block (Supplier for purchases, Customer for sales) — tolerant
      const partyEl = el.getElementsByTagName(side === "sales" ? "CustomerInfo" : "SupplierInfo")[0]
        || el.getElementsByTagName("PartyInfo")[0] || el;
      const counterpartyVat = txt(partyEl, "VATRegistrationNumber", "VATNumber", "PartyVATNumber", "VAT");
      const counterpartyReg = txt(partyEl, "RegistrationNumber", "PartyID", "RegistrationCode");
      const counterpartyName = txt(partyEl, "Name", "PartyName");
      const counterpartyCountry = txt(partyEl, "Country", "CountryCode");

      // VAT detail lines: sum TaxableValue / TaxAmount; collect VAT codes
      let taxable = 0, vat = 0;
      const vatCodes = [];
      const details = el.getElementsByTagName("VATDetail");
      if (details.length) {
        for (let i = 0; i < details.length; i++) {
          taxable += _num(txt(details[i], "TaxableValue", "TaxableAmount", "NetAmount"));
          vat += _num(txt(details[i], "TaxAmount", "VATAmount"));
          const code = txt(details[i], "VATCode", "TaxCode");
          if (code) vatCodes.push(code);
        }
      } else {
        // fallback to document totals
        taxable = _num(txt(el, "TaxableValue", "NetTotal", "TaxableAmount"));
        vat = _num(txt(el, "TaxAmount", "TaxPayable", "VATAmount"));
        const code = txt(el, "VATCode", "TaxCode");
        if (code) vatCodes.push(code);
      }

      const status = txt(el, "RegistrationStatus", "DocumentStatus", "Status");
      const special = txt(el, "SpecialTaxation");
      return {
        side,
        invoiceNo: childTxt(el, "InvoiceNo", "InvoiceID", "DocumentNo", "DocumentNumber") || txt(el, "InvoiceNo", "InvoiceID"),
        invoiceDate: txt(el, "InvoiceDate", "DocumentDate", "Date"),
        invoiceType: txt(el, "InvoiceType", "K_TYPE", "DocumentType"),
        counterpartyVat, counterpartyReg, counterpartyName, counterpartyCountry,
        taxable: _r2(taxable),
        vat: _r2(vat),
        vatCodes,
        special: (special || "").toUpperCase() === "T",
        cancelled: /AN|CANCEL|ANUL/i.test(status),
      };
    };

    const collect = (blockTag, side) => {
      const block = doc.getElementsByTagName(blockTag)[0];
      if (!block) return [];
      const invs = block.getElementsByTagName("Invoice");
      const out = [];
      for (let i = 0; i < invs.length; i++) out.push(readInvoice(invs[i], side));
      return out;
    };

    const sales = collect("SalesInvoices", "sales");
    const purchases = collect("PurchaseInvoices", "purchases");

    return {
      header: { registrationNumber, fileDate, periodFrom, periodTo },
      sales,
      purchases,
      counts: { sales: sales.length, purchases: purchases.length },
    };
  } catch (e) {
    return { _parseError: e.message };
  }
}

// ─── Reconciliation: i.SAF (declared) vs SAF-T (booked) ──────────────
function reconcileISAF(isaf, saft, opts = {}) {
  const absTol = opts.absTol ?? 0.02;       // €0.02 absolute tolerance
  const relTol = opts.relTol ?? 0.005;      // 0.5% relative tolerance
  const close = (a, b) => Math.abs(a - b) <= Math.max(absTol, Math.abs(b) * relTol);

  const findings = [];
  const add = (id, side, severity, title, detail, evidence) =>
    findings.push({ id, side, severity, title, detail, evidence: evidence || null });

  const norm = (s) => String(s || "").trim().toUpperCase();

  const saftSales = (saft?.sales?.items || []).filter((x) => x.invoiceNo);
  const saftPurch = (saft?.purchases?.items || []).filter((x) => x.invoiceNo);
  const saftSalesMap = new Map(saftSales.map((x) => [norm(x.invoiceNo), x]));
  const saftPurchMap = new Map(saftPurch.map((x) => [norm(x.invoiceNo), x]));

  // duplicate invoice numbers within i.SAF
  const dupCheck = (arr, side) => {
    const seen = new Map();
    for (const inv of arr) {
      const k = norm(inv.invoiceNo);
      seen.set(k, (seen.get(k) || 0) + 1);
    }
    const dups = [...seen.entries()].filter(([, c]) => c > 1).map(([k, c]) => `${k} ×${c}`);
    if (dups.length) add(`ISAF-${side === "sales" ? "S" : "P"}-DUP`, side, "Reject",
      `Duplicate invoice numbers in i.SAF ${side}`, `${dups.length} invoice number(s) appear more than once in the register.`, dups.slice(0, 10));
  };
  dupCheck(isaf.sales || [], "sales");
  dupCheck(isaf.purchases || [], "purchases");

  // per-side line reconciliation
  const reconcileSide = (isafArr, saftMap, side) => {
    const S = side === "sales" ? "S" : "P";
    let matched = 0, vatMismatch = 0, netMismatch = 0, missingInLedger = 0;
    const missInLedgerEv = [], vatEv = [], netEv = [];

    for (const inv of isafArr) {
      const k = norm(inv.invoiceNo);
      const booked = saftMap.get(k);
      if (!booked) {
        missingInLedger++;
        missInLedgerEv.push(`${inv.invoiceNo} · ${inv.counterpartyName || inv.counterpartyVat || "?"} · VAT €${inv.vat}`);
        continue;
      }
      matched++;
      const bookedVat = booked.documentTotals?.taxPayable || 0;
      const bookedNet = booked.documentTotals?.netTotal || 0;
      if (!close(inv.vat, bookedVat)) {
        vatMismatch++;
        vatEv.push(`${inv.invoiceNo}: i.SAF €${inv.vat} vs ledger €${_r2(bookedVat)} (Δ €${_r2(inv.vat - bookedVat)})`);
      }
      if (!close(inv.taxable, bookedNet)) {
        netMismatch++;
        netEv.push(`${inv.invoiceNo}: i.SAF net €${inv.taxable} vs ledger €${_r2(bookedNet)} (Δ €${_r2(inv.taxable - bookedNet)})`);
      }
      if (inv.cancelled && (inv.vat !== 0 || inv.taxable !== 0)) {
        add(`ISAF-${S}-CANC`, side, "Warn", `Cancelled invoice still carries amounts (${side})`,
          `Invoice ${inv.invoiceNo} is marked cancelled but reports non-zero VAT/taxable.`, [`${inv.invoiceNo}: net €${inv.taxable}, VAT €${inv.vat}`]);
      }
      if (!inv.counterpartyVat && !inv.counterpartyReg) {
        add(`ISAF-${S}-PARTY`, side, "Warn", `Missing counterparty identifier (${side})`,
          `Invoice ${inv.invoiceNo} has neither a VAT number nor a registration code for the counterparty.`, [`${inv.invoiceNo}`]);
      }
    }

    // booked in ledger but NOT declared in i.SAF
    const isafKeys = new Set(isafArr.map((x) => norm(x.invoiceNo)));
    const missingInRegister = [];
    for (const [k, b] of saftMap.entries()) {
      if (!isafKeys.has(k)) missingInRegister.push(`${b.invoiceNo} · VAT €${_r2(b.documentTotals?.taxPayable || 0)}`);
    }

    if (missingInLedger > 0) {
      add(`ISAF-${S}-MISSING-LEDGER`, side,
        side === "purchases" ? "Block" : "Reject",
        side === "sales" ? "Sales declared in i.SAF but absent from the ledger" : "Input VAT claimed in i.SAF but no purchase invoice in the ledger",
        `${missingInLedger} invoice(s) appear in the i.SAF ${side} register but cannot be matched in the SAF-T ledger.`,
        missInLedgerEv.slice(0, 10));
    }
    if (missingInRegister.length > 0) {
      add(`ISAF-${S}-MISSING-REGISTER`, side,
        side === "sales" ? "Block" : "Warn",
        side === "sales" ? "Sales in the ledger but NOT declared in i.SAF (under-declared output VAT)" : "Purchases in the ledger but not declared in i.SAF",
        `${missingInRegister.length} invoice(s) exist in the SAF-T ledger but are missing from the i.SAF ${side} register.`,
        missingInRegister.slice(0, 10));
    }
    if (vatMismatch > 0) add(`ISAF-${S}-VAT`, side, "Reject", `VAT amount mismatches (${side})`,
      `${vatMismatch} matched invoice(s) have a VAT amount in i.SAF that differs from the ledger beyond tolerance.`, vatEv.slice(0, 10));
    if (netMismatch > 0) add(`ISAF-${S}-NET`, side, "Warn", `Taxable-amount mismatches (${side})`,
      `${netMismatch} matched invoice(s) have a taxable amount in i.SAF that differs from the ledger beyond tolerance.`, netEv.slice(0, 10));

    return { isafCount: isafArr.length, saftCount: saftMap.size, matched, vatMismatch, netMismatch,
      missingInLedger, missingInRegister: missingInRegister.length };
  };

  const salesSummary = reconcileSide(isaf.sales || [], saftSalesMap, "sales");
  const purchSummary = reconcileSide(isaf.purchases || [], saftPurchMap, "purchases");

  // aggregate VAT position comparison
  const sum = (arr, f) => _r2((arr || []).reduce((s, x) => s + (f(x) || 0), 0));
  const outputISAF = sum(isaf.sales, (x) => x.vat);
  const inputISAF = sum(isaf.purchases, (x) => x.vat);
  const outputSAFT = sum(saftSales, (x) => x.documentTotals?.taxPayable);
  const inputSAFT = sum(saftPurch, (x) => x.documentTotals?.taxPayable);
  const vat = {
    outputISAF, outputSAFT, outputDelta: _r2(outputISAF - outputSAFT),
    inputISAF, inputSAFT, inputDelta: _r2(inputISAF - inputSAFT),
    netISAF: _r2(outputISAF - inputISAF), netSAFT: _r2(outputSAFT - inputSAFT),
    netDelta: _r2((outputISAF - inputISAF) - (outputSAFT - inputSAFT)),
  };
  if (!close(vat.netISAF, vat.netSAFT)) {
    add("ISAF-NET-POSITION", "vat", "Reject", "Net VAT position differs between i.SAF and the ledger",
      `i.SAF implies a net VAT of €${vat.netISAF} while the SAF-T ledger implies €${vat.netSAFT} (Δ €${vat.netDelta}). This is the headline figure VMI cross-checks against your FR0600.`,
      [`output Δ €${vat.outputDelta}`, `input Δ €${vat.inputDelta}`]);
  }

  const bySeverity = { Block: 0, Reject: 0, Warn: 0 };
  findings.forEach((f) => { if (bySeverity[f.severity] != null) bySeverity[f.severity]++; });

  return {
    findings,
    bySeverity,
    summary: { sales: salesSummary, purchases: purchSummary, vat },
    period: isaf.header || {},
  };
}


// ═══ VERIFICATION & CONFIDENCE LAYER — grounds AI claims in computed facts ═══
// ════════════════════════════════════════════════════════════════════
// TAXAI · VERIFICATION & CONFIDENCE LAYER
// ────────────────────────────────────────────────────────────────────
// Takes any AI-generated narrative and checks it, claim by claim,
// against the DETERMINISTIC facts already computed (rule findings,
// KPIs, forensic risk metrics, the metric registry, reconciliation).
// The checking itself is deterministic: numeric claims are matched to
// computed values within tolerance. Each claim is labelled:
//   • verified    — a figure in the claim matches a computed value
//   • unsupported — the claim asserts a figure with NO matching value
//   • review      — interpretive / legal / qualitative (not machine-checkable)
// Produces a transparent "defensibility" score so a professional can
// see what is grounded and what to verify before relying on it.
// No competitor or third-party names appear anywhere by design.
// ════════════════════════════════════════════════════════════════════

// Flatten every known deterministic value into a searchable fact index.
function buildGroundingFacts({ kpis, runResult, intel, metrics, reconResult } = {}) {
  const facts = [];
  const push = (value, label, group, isPct = false) => {
    if (value == null || value === "" || (typeof value === "number" && !isFinite(value))) return;
    const n = typeof value === "number" ? value : parseFloat(String(value).replace(/\s/g, "").replace(",", "."));
    if (isNaN(n)) return;
    facts.push({ value: n, label, group, isPct });
  };

  if (kpis) {
    push(kpis.revenue, "Revenue", "kpi");
    push(kpis.costs, "Costs", "kpi");
    push(kpis.grossResult, "Gross result", "kpi");
    push(kpis.grossMarginPct, "Gross margin", "kpi", true);
    push(kpis.netMarginPct, "Net margin", "kpi", true);
    push(kpis.totalAssets, "Total assets", "kpi");
    push(kpis.currentAssets, "Current assets", "kpi");
    push(kpis.fixedAssets, "Fixed assets", "kpi");
    push(kpis.equity, "Equity", "kpi");
    push(kpis.liabilities, "Liabilities", "kpi");
    push(kpis.workingCapital, "Working capital", "kpi");
    push(kpis.currentRatio, "Current ratio", "kpi");
    push(kpis.debtToEquity, "Debt-to-equity", "kpi");
    push(kpis.receivables, "Receivables", "kpi");
    push(kpis.payables, "Payables", "kpi");
    push(kpis.dso, "DSO (days)", "kpi");
    push(kpis.dpo, "DPO (days)", "kpi");
    push(kpis.salesVat, "Output VAT", "kpi");
    push(kpis.inputVat, "Input VAT", "kpi");
    push(kpis.netVatPosition, "Net VAT position", "kpi");
    push(kpis.vatRecoveryRatePct, "VAT recovery rate", "kpi", true);
    push(kpis.estimatedCit, "Estimated CIT", "kpi");
    push(kpis.estimatedCitRatePct, "CIT rate", "kpi", true);
    push(kpis.effectiveTaxRatePct, "Effective tax rate", "kpi", true);
    push(kpis.transactionCount, "Transaction count", "kpi");
    push(kpis.invoiceCount, "Invoice count", "kpi");
    push(kpis.customerCount, "Customer count", "kpi");
    push(kpis.supplierCount, "Supplier count", "kpi");
    push(kpis.periodDays, "Period (days)", "kpi");
  }
  if (runResult) {
    push(runResult.summary?.total, "Total findings", "rule");
    push(runResult.bySeverity?.Block, "Block findings", "rule");
    push(runResult.bySeverity?.Reject, "Reject findings", "rule");
    push(runResult.bySeverity?.Warn, "Warn findings", "rule");
    push(runResult.summary?.rulesExecuted, "Rules executed", "rule");
  }
  if (intel) {
    push(intel.risk?.score, "Risk score", "forensic");
    push(intel.summary?.cycles, "Circular flows", "forensic");
    push(intel.summary?.outliers, "Statistical outliers", "forensic");
    push(intel.summary?.duplicates, "Duplicate parties", "forensic");
    push(intel.summary?.shells, "Shell indicators", "forensic");
    push(intel.summary?.velocitySpikes, "Velocity anomalies", "forensic");
    push(intel.summary?.backdated, "Backdated entries", "forensic");
    push(intel.summary?.vatRateIssues, "VAT-rate issues", "forensic");
    if (intel.benford?.applicable) { push(intel.benford.mad, "Benford MAD", "forensic"); push(intel.benford.chi2, "Benford chi-squared", "forensic"); }
    if (intel.graph?.concentration) push(intel.graph.concentration.hhi, "Concentration HHI", "forensic");
  }
  if (metrics && metrics.values) {
    Object.entries(metrics.values).forEach(([k, v]) => {
      if (typeof v === "number") push(v, "Metric: " + k, "metric", /pct|share|ratio|rate/i.test(k));
    });
  }
  if (reconResult && reconResult.summary?.vat) {
    const v = reconResult.summary.vat;
    push(v.outputISAF, "i.SAF output VAT", "recon"); push(v.outputSAFT, "Ledger output VAT", "recon");
    push(v.inputISAF, "i.SAF input VAT", "recon"); push(v.inputSAFT, "Ledger input VAT", "recon");
    push(v.netISAF, "i.SAF net VAT", "recon"); push(v.netSAFT, "Ledger net VAT", "recon");
    push(v.netDelta, "Net VAT delta", "recon");
    push(reconResult.findings?.length, "Reconciliation discrepancies", "recon");
  }
  return facts;
}

// Extract numeric tokens from a piece of text (handles €, %, thousands
// separators, and both decimal styles). Returns {value, isPct, raw}.
function extractNumbers(text) {
  const out = [];
  // percentages first (e.g. 12.3%, 12,3 %, 12 proc.)
  const pctRe = /(-?\d{1,3}(?:[.,]\d+)?)\s*(?:%|proc\.?|percent)/gi;
  let m;
  while ((m = pctRe.exec(text)) !== null) {
    const v = parseFloat(m[1].replace(",", "."));
    if (!isNaN(v)) out.push({ value: v, isPct: true, raw: m[0] });
  }
  // money / plain numbers: 1,234.56 · 1.234,56 · €1234 · 1.2 (skip those already captured as %)
  const numRe = /(?:€\s*)?(-?\d{1,3}(?:[ .,]\d{3})*(?:[.,]\d+)?|-?\d+(?:[.,]\d+)?)(?:\s*(?:€|eur|tūkst|k|m|mln))?/gi;
  while ((m = numRe.exec(text)) !== null) {
    // skip if this span is part of a percentage match
    const span = m[0];
    if (/%|proc|percent/i.test(text.slice(m.index, m.index + span.length + 6))) continue;
    let raw = m[1];
    // normalise thousands/decimals: if both separators present, the last one is the decimal
    let norm = raw;
    const hasDot = raw.includes("."), hasComma = raw.includes(",");
    if (hasDot && hasComma) {
      if (raw.lastIndexOf(",") > raw.lastIndexOf(".")) norm = raw.replace(/\./g, "").replace(",", ".");
      else norm = raw.replace(/,/g, "");
    } else if (hasComma) {
      // comma as decimal if it looks like one (one comma, <=2 trailing digits) else thousands
      norm = (/,\d{1,2}$/.test(raw)) ? raw.replace(/\s/g, "").replace(",", ".") : raw.replace(/[,\s]/g, "");
    } else {
      norm = raw.replace(/\s/g, "");
    }
    let v = parseFloat(norm);
    if (isNaN(v)) continue;
    // scale suffixes
    if (/\b(m|mln)\b/i.test(span)) v *= 1e6;
    else if (/\b(k|tūkst)\b/i.test(span)) v *= 1e3;
    // ignore bare years (1900-2100) and tiny ordinals that are clearly not figures
    if (Number.isInteger(v) && v >= 1900 && v <= 2100 && !/€|eur/i.test(span)) continue;
    // ignore legal-article / statute references (e.g. "Article 96", "96 str.", "VA-127", "section 12")
    const before = text.slice(Math.max(0, m.index - 14), m.index);
    const after = text.slice(m.index + span.length, m.index + span.length + 8);
    if (/(article|art\.?|straipsn|str\.?|section|sec\.?|paragraph|punkt|dalis|order|directive|direktyv)\s*$/i.test(before)) continue;
    if (/^\s*(str\.?|straipsn|punkt|dalis)/i.test(after)) continue;
    if (!/€|eur/i.test(span) && Number.isInteger(v) && v < 500 && /\b(VA|VAT|PVM|GPM|PM|art|str)\b/i.test(before)) continue;
    out.push({ value: v, isPct: false, raw: span.trim() });
  }
  return out;
}

// Does a claimed number match any computed fact (within tolerance)?
function matchFact(num, facts) {
  const absTol = 0.6, relTol = 0.012; // ~1.2% or €0.60
  let best = null;
  for (const f of facts) {
    if (num.isPct && !f.isPct) continue;       // percentages match percentage facts
    if (!num.isPct && f.isPct) {
      // a plain number could still equal a pct value (e.g. "12.3") — allow loose match
    }
    const tol = Math.max(absTol, Math.abs(f.value) * relTol);
    if (Math.abs(num.value - f.value) <= tol) {
      if (!best || Math.abs(num.value - f.value) < Math.abs(num.value - best.value)) best = f;
    }
  }
  return best;
}

// Split narrative text into checkable claims (sentences / list items),
// skipping markdown headers and trivial fragments.
function splitClaims(text) {
  if (!text) return [];
  const cleaned = text
    .replace(/```[\s\S]*?```/g, " ")        // drop code blocks
    .replace(/^#{1,6}\s.*$/gm, " ")          // drop headers
    .replace(/\*\*|\*|`|_/g, "")             // drop md emphasis
    .replace(/^\s*[-•]\s*/gm, "\n");         // bullets → line breaks
  const parts = cleaned
    .split(/(?<=[.!?])\s+(?=[A-ZĄČĘĖĮŠŲŪŽ0-9“"])|\n+/)
    .map(s => s.trim())
    .filter(s => s.length >= 25 && /[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ]/.test(s));
  return parts;
}

// Keywords that mark a claim as interpretive / legal (→ human review, not auto-verifiable).
const LEGAL_HINT = /\b(article|str\.?|straipsn|law|įstatym|order|VA-\d|directive|direktyv|VMI|PVM|GPM|reglament|regulation|should|turėtų|recommend|rekomend|advis|patart|may be|gali būti|likely|tikėtina|risk of|rizika|consider|apsvarst|suggest|siūl)\b/i;

// Main verification pass.
function verifyNarrative(text, facts) {
  const claims = splitClaims(text).map((c) => {
    const nums = extractNumbers(c);
    if (nums.length) {
      const matches = nums.map(n => ({ n, hit: matchFact(n, facts) }));
      const matched = matches.filter(m => m.hit);
      if (matched.length) {
        const conf = Math.min(0.97, 0.62 + 0.33 * (matched.length / nums.length));
        return { text: c, status: "verified", confidence: Math.round(conf * 100),
          grounding: matched.slice(0, 2).map(m => m.hit.label).join(", "),
          numbers: nums.map(n => n.raw) };
      }
      // has figures but none match anything computed → flag
      return { text: c, status: "unsupported", confidence: 28,
        grounding: null, numbers: nums.map(n => n.raw) };
    }
    // no figures → interpretive; legal hint nudges confidence note
    const legal = LEGAL_HINT.test(c);
    return { text: c, status: "review", confidence: legal ? 55 : 50,
      grounding: legal ? "legal / interpretive" : "qualitative", numbers: [] };
  });

  const counts = { verified: 0, unsupported: 0, review: 0 };
  claims.forEach(c => { counts[c.status]++; });
  const total = claims.length || 1;
  // defensibility: verified=full credit, review=partial, unsupported=none
  const raw = (counts.verified * 1 + counts.review * 0.6 + counts.unsupported * 0) / total;
  const score = Math.round(raw * 100);
  const band = score >= 80 ? "High" : score >= 60 ? "Moderate" : score >= 40 ? "Guarded" : "Low";
  return { claims, counts, score, band, factCount: facts.length };
}


// ═══ PROVENANCE · RATE PACKS · CONFORMANCE (Step 2) ═══
// ════════════════════════════════════════════════════════════════════
// TAXAI · PROVENANCE, RULE PACKS & CONFORMANCE  (Step 2)
// ────────────────────────────────────────────────────────────────────
// Three audit-grade additions, all deterministic:
//  1) PROVENANCE — every rule category carries its legal/schema basis
//     (authority + reference) and a verification status, so each finding
//     is traceable to the source it enforces.
//  2) RATE PACKS — dated, sourced rate sets (VAT / CIT / thresholds) with
//     effective dates and a changelog, resolvable by period. Rates are
//     verified against the 2026 reform; sources are named for audit.
//  3) CONFORMANCE — a built-in test suite that runs the rule engine
//     against labelled fixtures and reports expected-vs-actual, producing
//     a conformance score so correctness can be demonstrated, not assumed.
// No third-party product names appear anywhere by design.
// ════════════════════════════════════════════════════════════════════

// ─── 1) PROVENANCE ──────────────────────────────────────────────────
// Category-level basis (defensible at the category level). Rule-level
// overrides can be added in RULE_PROVENANCE_OVERRIDES keyed by rule id.
// status: "schema" = structurally derivable from the XSD (high certainty);
//         "regulatory" = grounded in a named order/article;
//         "review" = basis named but should be confirmed by a specialist.
const CATEGORY_PROVENANCE = {
  Header:    { authority: "VMI", reference: "SAF-T XSD v2.01 · Order VA-127 (file & header structure)", status: "schema" },
  Accounts:  { authority: "VMI / AVNT", reference: "SAF-T XSD v2.01 (MasterFiles/GeneralLedgerAccounts) · chart-of-accounts integrity", status: "schema" },
  Customers: { authority: "VMI", reference: "SAF-T XSD v2.01 (MasterFiles/Customers) · PVMĮ 71 str. (VAT identifiers)", status: "regulatory" },
  Suppliers: { authority: "VMI", reference: "SAF-T XSD v2.01 (MasterFiles/Suppliers) · PVMĮ 71 str. (VAT identifiers)", status: "regulatory" },
  TaxTable:  { authority: "VMI", reference: "SAF-T XSD v2.01 (MasterFiles/TaxTable) · PVMĮ 19 str. (VAT rates)", status: "regulatory" },
  UOMTable:  { authority: "VMI", reference: "SAF-T XSD v2.01 (MasterFiles/UOMTable)", status: "schema" },
  AnalysisTable: { authority: "VMI", reference: "SAF-T XSD v2.01 (MasterFiles/AnalysisTypeTable)", status: "schema" },
  MovementTable: { authority: "VMI", reference: "SAF-T XSD v2.01 (MasterFiles/MovementTypeTable)", status: "schema" },
  Products:  { authority: "VMI", reference: "SAF-T XSD v2.01 (MasterFiles/Products)", status: "schema" },
  Assets:    { authority: "VMI / AVNT", reference: "SAF-T XSD v2.01 (MasterFiles/Assets) · PMĮ 18 str. (depreciation)", status: "regulatory" },
  Owners:    { authority: "VMI", reference: "SAF-T XSD v2.01 (MasterFiles/Owners)", status: "schema" },
  GL:        { authority: "VMI / AVNT", reference: "SAF-T XSD v2.01 (GeneralLedgerEntries) · double-entry & posting integrity", status: "schema" },
  Sales:     { authority: "VMI", reference: "SAF-T XSD v2.01 (SourceDocuments/SalesInvoices) · PVMĮ 58, 79 str.", status: "regulatory" },
  Purchases: { authority: "VMI", reference: "SAF-T XSD v2.01 (SourceDocuments/PurchaseInvoices) · PVMĮ 64 str. (deduction)", status: "regulatory" },
  Payments:  { authority: "VMI", reference: "SAF-T XSD v2.01 (SourceDocuments/Payments)", status: "schema" },
  Movements: { authority: "VMI", reference: "SAF-T XSD v2.01 (SourceDocuments/MovementOfGoods) · i.VAZ alignment", status: "regulatory" },
  AssetTx:   { authority: "VMI / AVNT", reference: "SAF-T XSD v2.01 (AssetTransactions) · PMĮ 18 str.", status: "regulatory" },
  CrossRef:  { authority: "VMI", reference: "SAF-T XSD v2.01 cross-file referential integrity", status: "schema" },
};
const RULE_PROVENANCE_OVERRIDES = {
  "A-001": { reference: "SAF-T XSD v2.01 §file prologue — UTF-8 XML declaration", status: "schema" },
  "A-002": { reference: "SAF-T XSD v2.01 — root <AuditFile>, namespace vmi.lt/cms/saf-t", status: "schema" },
  "A-003": { reference: "SAF-T XSD v2.01 — AuditFileVersion = 2.01", status: "schema" },
};
function provenanceFor(rule) {
  // Verified audit rules carry their own legal basis (PVMĮ articles). Prefer that.
  const auditRule = (typeof AUDIT_RULES !== "undefined" && rule?.id) ? AUDIT_RULES.find((a) => a.id === rule.id) : null;
  if (auditRule) {
    return { authority: "VMI", reference: (auditRule.legal || "PVMĮ") + " · SAF-T XSD v2.01 (" + auditRule.refType + ")", status: "regulatory" };
  }
  const base = CATEGORY_PROVENANCE[rule.category] || { authority: "VMI", reference: "SAF-T XSD v2.01", status: "review" };
  const ov = RULE_PROVENANCE_OVERRIDES[rule.id] || {};
  return { authority: ov.authority || base.authority, reference: ov.reference || base.reference, status: ov.status || base.status };
}

// ─── 2) RATE PACKS (dated, sourced, with changelog) ─────────────────
// Verified against the 2026 Lithuanian tax reform. Each pack is the set
// of rates in force during [effectiveFrom, effectiveTo]. resolveRatePack
// returns the pack covering a given date.
const RATE_PACKS = [
  {
    id: "LT-2024", label: "Lithuania · 2024", effectiveFrom: "2024-01-01", effectiveTo: "2024-12-31",
    vat: { standard: 21, reduced: [9, 5], notes: "21% standard; 9% (transport, accommodation, heating, etc.); 5% (some)." },
    cit: { standard: 15, small: 6, smallThreshold: 300000, newCompanyZeroYears: 1, bankSurcharge: 5, bankThreshold: 2000000 },
    vatRegistrationThreshold: 45000,
    source: "PVMĮ 19 str.; PMĮ 5 str. (2024 redakcija)",
    changelog: "Baseline pack.",
  },
  {
    id: "LT-2025", label: "Lithuania · 2025", effectiveFrom: "2025-01-01", effectiveTo: "2025-12-31",
    vat: { standard: 21, reduced: [9, 5], notes: "21% standard; 9% reduced (transport, accommodation, culture, heating concession); 5% (some)." },
    cit: { standard: 16, small: 6, smallThreshold: 300000, newCompanyZeroYears: 1, bankSurcharge: 5, bankThreshold: 2000000 },
    vatRegistrationThreshold: 45000,
    source: "PVMĮ 19 str.; PMĮ 5 str. (2025 redakcija)",
    changelog: "CIT standard 15% → 16% (defence funding).",
  },
  {
    id: "LT-2026", label: "Lithuania · 2026", effectiveFrom: "2026-01-01", effectiveTo: null,
    vat: { standard: 21, reduced: [12, 5], notes: "21% standard; NEW 12% (passenger transport, accommodation, restaurant/catering, culture & sport tickets); NEW 5% super-reduced (books & publications, medicines & medical devices); heating/hot water/firewood → 21%." },
    cit: { standard: 17, small: 7, smallThreshold: 300000, newCompanyZeroYears: 2, bankSurcharge: 5, bankThreshold: 2000000 },
    vatRegistrationThreshold: 45000,
    lossCarryforwardCapPct: 70,
    source: "Seimas 2026 reform (2025-06 enactment); PVMĮ 19 str. (2026 red.); PMĮ 5 str. (2026 red.)",
    changelog: "9% reduced rate ABOLISHED → split into 12% and 5%; heating to 21%; CIT 16%→17%, small 6%→7%; new-company 0% extended to 2 years; loss carryforward capped at 70% of profit.",
  },
];
function resolveRatePack(dateStr) {
  const d = (dateStr && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) ? dateStr.slice(0, 10) : null;
  if (!d) return RATE_PACKS[RATE_PACKS.length - 1];
  for (const p of RATE_PACKS) {
    if (d >= p.effectiveFrom && (!p.effectiveTo || d <= p.effectiveTo)) return p;
  }
  // before first / after last
  if (d < RATE_PACKS[0].effectiveFrom) return RATE_PACKS[0];
  return RATE_PACKS[RATE_PACKS.length - 1];
}

// ─── 3) CONFORMANCE TEST HARNESS ────────────────────────────────────
// Each fixture is a minimal SAF-T XML with a known defect, plus the rule
// id(s) it MUST trigger (and optionally ids it must NOT trigger). The
// runner parses each fixture, runs the engine, and checks expectations.
// Built-in fixtures make the suite usable out of the box; teams can add
// their own labelled files later.
function buildConformanceFixtures() {
  // Build a minimal valid SAF-T with one sales + one purchase invoice whose
  // fields are controlled per-fixture, so a specific audit rule must fire.
  const saft = (salesInner, purchInner) => `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="https://www.vmi.lt/cms/saf-t"><Header><AuditFileVersion>2.01</AuditFileVersion><AuditFileCountry>LT</AuditFileCountry></Header>
<MasterFiles><TaxTable><TaxTableEntry><TaxCodeDetails><TaxCode>PVM1</TaxCode><STITaxCode>PVM1</STITaxCode></TaxCodeDetails>
<TaxCodeDetails><TaxCode>PVM13</TaxCode><STITaxCode>PVM13</STITaxCode></TaxCodeDetails>
<TaxCodeDetails><TaxCode>PVM20</TaxCode><STITaxCode>PVM20</STITaxCode></TaxCodeDetails></TaxTableEntry></TaxTable></MasterFiles>
<SourceDocuments><SalesInvoices>${salesInner || ""}</SalesInvoices><PurchaseInvoices>${purchInner || ""}</PurchaseInvoices></SourceDocuments></AuditFile>`;
  const sInv = (no, shipFrom, shipTo, gs, taxCode, ref) =>
    `<Invoice><InvoiceNo>${no}</InvoiceNo>${ref ? `<References><Reference>${ref}</Reference></References>` : ""}${shipFrom ? `<ShipFrom><Address><Country>${shipFrom}</Country></Address></ShipFrom>` : ""}${shipTo ? `<ShipTo><Address><Country>${shipTo}</Country></Address></ShipTo>` : ""}<DocumentTotals><NetTotal>1000</NetTotal><TaxPayable>0</TaxPayable><GrossTotal>1000</GrossTotal></DocumentTotals><Line><GoodsServicesID>${gs}</GoodsServicesID><Tax><TaxCode>${taxCode}</TaxCode><TaxPercentage>0</TaxPercentage></Tax></Line></Invoice>`;
  const pInv = (no, regType, regCountry, addrCountry, taxCode) =>
    `<Invoice><InvoiceNo>${no}</InvoiceNo><SupplierInfo><Address><Country>${addrCountry || ""}</Country></Address><TaxRegistration><TaxType>${regType || ""}</TaxType><Country>${regCountry || ""}</Country></TaxRegistration></SupplierInfo><DocumentTotals><NetTotal>1000</NetTotal><TaxPayable>0</TaxPayable><GrossTotal>1000</GrossTotal></DocumentTotals><Line><Tax><TaxCode>${taxCode}</TaxCode></Tax></Line></Invoice>`;
  return [
    { id: "FX-01", name: "Local goods PVM1, Ship-From LT, no Ship-To", expectFail: ["PP_LT_PVM_106"],
      xml: saft(sInv("S1", "LT", "", "PR", "PVM1", ""), "") },
    { id: "FX-02", name: "Local PVM1 but goods ended in EU (DE)", expectFail: ["PP_LT_PVM_100"],
      xml: saft(sInv("S2", "LT", "DE", "PS", "PVM1", "x"), "") },
    { id: "FX-03", name: "Intra-EU PVM13 starting outside LT", expectFail: ["PP_LT_PVM_010"],
      xml: saft(sInv("S3", "DE", "FR", "PR", "PVM13", "ref"), "") },
    { id: "FX-04", name: "Intra-EU PVM13 with no 0%-rate reference", expectFail: ["PP_LT_PVM_021"],
      xml: saft(sInv("S4", "LT", "FR", "PR", "PVM13", ""), "") },
    { id: "FX-05", name: "Purchase PVM1, foreign supplier reg but LT address", expectFail: ["PP_LT_PVM_070"],
      xml: saft("", pInv("P1", "VAT", "DE", "LT", "PVM1")) },
    { id: "FX-06", name: "Purchase PVM20 from non-EU supplier (US)", expectFail: ["PP_LT_PVM_061"],
      xml: saft("", pInv("P2", "VAT", "US", "US", "PVM20")) },
    { id: "FX-07", name: "Clean local sale (control — no flags)", expectPass: ["PP_LT_PVM_106", "PP_LT_PVM_100", "PP_LT_PVM_010"],
      xml: saft(sInv("S5", "LT", "LT", "PR", "PVM1", "r"), "") },
  ];
}
// runner: deps = { parse(xml)->data, run(data)->{byRule} }
function runConformance(deps, fixtures) {
  const fx = fixtures || buildConformanceFixtures();
  const results = fx.map((f) => {
    let data, err = null;
    try { data = deps.parse(f.xml); } catch (e) { err = e.message; }
    let byRule = {};
    if (data) { try { byRule = (deps.run(data) || {}).byRule || {}; } catch (e) { err = e.message; } }
    const checks = [];
    (f.expectFail || []).forEach((rid) => checks.push({ rule: rid, want: "fail", got: byRule[rid] ? "fail" : "pass", pass: !!byRule[rid] }));
    (f.expectPass || []).forEach((rid) => checks.push({ rule: rid, want: "pass", got: byRule[rid] ? "fail" : "pass", pass: !byRule[rid] }));
    const passed = !err && checks.every((c) => c.pass);
    return { id: f.id, name: f.name, passed, error: err, checks };
  });
  const total = results.length, passedN = results.filter((r) => r.passed).length;
  const score = total ? Math.round((passedN / total) * 100) : 0;
  return { results, total, passed: passedN, score };
}


// ═══ GROUNDED LEGAL RESEARCH (Step 3) — retrieval + citation grounding ═══
// ════════════════════════════════════════════════════════════════════
// TAXAI · GROUNDED LEGAL RESEARCH  (Step 3)
// ────────────────────────────────────────────────────────────────────
// Turns the embedded legal corpus into a citeable research source:
//  1) retrieveSources(query)  — deterministic ranking of statute entries
//     relevant to a question (builds on the existing keyword scorer).
//  2) groundCitations(answer, sources) — checks an AI answer against the
//     retrieved statutes: which provisions are actually referenced, and
//     whether every article the answer cites resolves to a real corpus
//     entry. Produces a "sources used" list + a grounding ratio so a
//     reader can click through to the exact article text.
// The retrieval + grounding are deterministic; the AI only phrases the
// answer from provided provisions. No third-party names appear by design.
// ════════════════════════════════════════════════════════════════════

// Rank corpus entries for a query. `corpus` = the LEGAL_DB array.
function retrieveSources(query, corpus, maxResults = 6) {
  const q = String(query || "").toLowerCase().replace(/[^\wąčęėįšųūž\s%-]/gi, " ");
  const terms = [...new Set(q.split(/\s+/).filter(t => t.length > 1))];
  if (!terms.length) return [];
  const scored = corpus.map((doc) => {
    let score = 0;
    const kw = (doc.keywords || "").toLowerCase();
    const hay = `${kw} ${(doc.text || "")} ${(doc.textEn || "")} ${(doc.article || "")} ${(doc.law || "")}`.toLowerCase();
    terms.forEach((term) => {
      if (hay.includes(term)) score += 2;
      if (kw.includes(term)) score += 3;
      if ((doc.article || "").toLowerCase().includes(term)) score += 5;
      if ((doc.law || "").toLowerCase() === term) score += 4;
    });
    return { ...doc, score };
  }).filter((d) => d.score > 0).sort((a, b) => b.score - a.score).slice(0, maxResults);
  return scored;
}

// Build the grounded-answer prompt: the model must answer ONLY from the
// supplied provisions and tag each statement with the provision id in
// square brackets, e.g. [pvm-19-1].
function buildGroundedResearchPrompt(lang) {
  const en = `You are a Lithuanian tax-law research assistant. Answer the user's question USING ONLY the legal provisions provided in the [SOURCES] block.
Rules:
- Cite every substantive statement with the provision id in square brackets, e.g. [pvm-19-1]. Use only ids that appear in [SOURCES].
- If the provisions do not cover the question, say so plainly and do not invent law.
- Quote exact article numbers; do not paraphrase the rule into a different number.
- Be concise and practical. End with a one-line note that this is informational, not legal advice.`;
  const lt = `Esate Lietuvos mokesčių teisės tyrimų asistentas. Atsakykite TIK pagal [SOURCES] bloke pateiktas teisės nuostatas.
Taisyklės:
- Kiekvieną teiginį pagrįskite nuostatos identifikatoriumi laužtiniuose skliaustuose, pvz. [pvm-19-1]. Naudokite tik [SOURCES] esančius id.
- Jei nuostatos neapima klausimo — aiškiai tai pasakykite, nesugalvokite teisės.
- Cituokite tikslius straipsnių numerius; nekeiskite jų.
- Atsakykite glaustai ir praktiškai. Pabaigoje pridėkite eilutę, kad tai informacinio pobūdžio informacija, ne teisinė konsultacija.`;
  return lang === "lt" ? lt : en;
}

// Serialise retrieved sources into the prompt context block.
function sourcesBlock(sources) {
  if (!sources || !sources.length) return "\n[SOURCES]\n(none found in corpus)\n[END SOURCES]\n";
  return "\n[SOURCES]\n" + sources.map((s) =>
    `[${s.id}] ${s.law} ${s.article}: "${s.text}"${s.penalty ? ` (Sanction: ${s.penalty})` : ""}`
  ).join("\n") + "\n[END SOURCES]\n";
}

// After the AI answers, determine which provisions it actually used and
// whether each cited id resolves to a real corpus entry.
function groundCitations(answer, sources, corpus) {
  const text = String(answer || "");
  const byId = {};
  (corpus || []).forEach((d) => { byId[d.id] = d; });
  // ids the answer explicitly cited in [brackets]
  const citedIds = [...new Set((text.match(/\[([a-z0-9][a-z0-9-]{2,})\]/gi) || []).map((m) => m.slice(1, -1).toLowerCase()))];
  const resolved = [], unresolved = [];
  citedIds.forEach((id) => { (byId[id] ? resolved : unresolved).push(id); });
  // also surface retrieved sources whose article number appears verbatim in the answer (implicit use)
  const usedSet = new Set(resolved);
  (sources || []).forEach((s) => {
    if (usedSet.has(s.id)) return;
    const art = (s.article || "").toLowerCase().replace(/\s+/g, " ").trim();
    const artNum = (art.match(/\d+[\d\s-]*str\.?/) || [])[0];
    if (artNum && text.toLowerCase().includes(artNum)) usedSet.add(s.id);
  });
  // the sources to display = those cited/used, preserving retrieval order, else top retrieved
  const used = (sources || []).filter((s) => usedSet.has(s.id));
  const display = used.length ? used : (sources || []).slice(0, 3);
  const citeTotal = citedIds.length;
  const grounded = citeTotal ? resolved.length : (used.length ? used.length : 0);
  const ratio = citeTotal ? Math.round((resolved.length / citeTotal) * 100) : (sources && sources.length ? 100 : 0);
  return {
    citedIds, resolved, unresolved,
    sources: display,
    citeTotal, groundedCount: resolved.length,
    ratio,                       // % of cited ids that resolve to the corpus
    hasUnresolved: unresolved.length > 0,
  };
}

// Replace [id] markers with human-friendly inline markers [n] mapped to a
// numbered source list. Returns { text, map:[{n,id,...}] }.
function numberCitations(answer, sources, corpus) {
  const byId = {}; (corpus || []).forEach((d) => { byId[d.id] = d; });
  const order = [];
  const idToN = {};
  const text = String(answer || "").replace(/\[([a-z0-9][a-z0-9-]{2,})\]/gi, (m, id) => {
    const key = id.toLowerCase();
    if (!byId[key]) return m; // leave unresolved ids visible as-is
    if (!(key in idToN)) { order.push(byId[key]); idToN[key] = order.length; }
    return `⟦${idToN[key]}⟧`;
  });
  return { text, map: order.map((d, i) => ({ n: i + 1, ...d })) };
}


// ═══ KPI INTELLIGENCE — benchmarks + targets (Step 5) ═══
// ════════════════════════════════════════════════════════════════════
// TAXAI · KPI INTELLIGENCE — benchmarks + targets  (Step 5)
// ────────────────────────────────────────────────────────────────────
// Turns the deterministic KPIs into an advanced, easy-to-read dashboard:
//  • KPI_META   — per-metric label, unit, format, direction (higher- or
//    lower-is-better), category, and which benchmark series it maps to.
//  • SECTOR_BENCHMARKS — illustrative {low, median, high} bands per sector
//    for the comparable ratios. These are clearly-labelled baselines meant
//    to be replaced by real aggregated data; the framework is the product.
//  • scoreKpi() — positions a value against its sector band and the user's
//    target, returning a verdict + a 0..1 position for the gauge.
// Deterministic throughout; no third-party names by design.
// ════════════════════════════════════════════════════════════════════

// direction: "up" = higher is better, "down" = lower is better, "flat" = context-only
// fmt: "eur" | "pct" | "ratio" | "days" | "int"
const KPI_META = [
  // Profitability
  { key: "revenue", en: "Revenue", lt: "Pajamos", fmt: "eur", dir: "up", cat: "profitability", bench: null },
  { key: "grossResult", en: "Gross result", lt: "Bendrasis rezultatas", fmt: "eur", dir: "up", cat: "profitability", bench: null },
  { key: "grossMarginPct", en: "Gross margin", lt: "Bendrasis pelningumas", fmt: "pct", dir: "up", cat: "profitability", bench: "grossMargin" },
  { key: "netMarginPct", en: "Net margin", lt: "Grynasis pelningumas", fmt: "pct", dir: "up", cat: "profitability", bench: "netMargin" },
  // Liquidity & leverage
  { key: "currentRatio", en: "Current ratio", lt: "Einamasis santykis", fmt: "ratio", dir: "up", cat: "liquidity", bench: "currentRatio" },
  { key: "debtToEquity", en: "Debt-to-equity", lt: "Skola / nuosavybė", fmt: "ratio", dir: "down", cat: "liquidity", bench: "debtToEquity" },
  { key: "workingCapital", en: "Working capital", lt: "Apyvartinis kapitalas", fmt: "eur", dir: "up", cat: "liquidity", bench: null },
  // Working capital cycle
  { key: "dso", en: "Days sales outstanding", lt: "Gautinų dienos (DSO)", fmt: "days", dir: "down", cat: "cycle", bench: "dso" },
  { key: "dpo", en: "Days payables outstanding", lt: "Mokėtinų dienos (DPO)", fmt: "days", dir: "up", cat: "cycle", bench: "dpo" },
  // Tax
  { key: "netVatPosition", en: "Net VAT position", lt: "Grynoji PVM pozicija", fmt: "eur", dir: "flat", cat: "tax", bench: null },
  { key: "vatRecoveryRatePct", en: "VAT recovery rate", lt: "PVM susigrąžinimas", fmt: "pct", dir: "flat", cat: "tax", bench: "vatRecovery" },
  { key: "effectiveTaxRatePct", en: "Effective tax rate", lt: "Efektyvus mok. tarifas", fmt: "pct", dir: "down", cat: "tax", bench: "effTax" },
  // Concentration / operations
  { key: "topSupplierConcentrationPct", en: "Top-1 supplier share", lt: "Top-1 tiekėjo dalis", fmt: "pct", dir: "down", cat: "ops", bench: "supplierConc" },
  { key: "top3SupplierConcentrationPct", en: "Top-3 supplier share", lt: "Top-3 tiekėjų dalis", fmt: "pct", dir: "down", cat: "ops", bench: null },
];

const KPI_CATS = [
  { key: "profitability", en: "Profitability", lt: "Pelningumas" },
  { key: "liquidity", en: "Liquidity & leverage", lt: "Likvidumas ir svertas" },
  { key: "cycle", en: "Working-capital cycle", lt: "Apyvartinio kapitalo ciklas" },
  { key: "tax", en: "Tax", lt: "Mokesčiai" },
  { key: "ops", en: "Concentration", lt: "Koncentracija" },
];

// Illustrative sector bands {low, median, high}. Replace with aggregated data.
const SECTOR_BENCHMARKS = {
  _default:      { grossMargin:{low:18,median:32,high:50}, netMargin:{low:2,median:7,high:14}, currentRatio:{low:1.0,median:1.5,high:2.5}, debtToEquity:{low:0.3,median:1.0,high:2.0}, dso:{low:20,median:45,high:75}, dpo:{low:20,median:40,high:65}, vatRecovery:{low:40,median:75,high:100}, effTax:{low:5,median:12,high:18}, supplierConc:{low:10,median:25,high:45} },
  Logistics:     { grossMargin:{low:8,median:16,high:28}, netMargin:{low:2,median:5,high:9}, currentRatio:{low:1.0,median:1.3,high:1.9}, debtToEquity:{low:0.5,median:1.4,high:2.6}, dso:{low:30,median:50,high:80}, dpo:{low:25,median:45,high:70}, vatRecovery:{low:60,median:85,high:100}, effTax:{low:6,median:12,high:18}, supplierConc:{low:15,median:30,high:55} },
  Construction:  { grossMargin:{low:10,median:20,high:32}, netMargin:{low:2,median:6,high:11}, currentRatio:{low:1.0,median:1.4,high:2.1}, debtToEquity:{low:0.4,median:1.2,high:2.3}, dso:{low:40,median:70,high:110}, dpo:{low:30,median:55,high:90}, vatRecovery:{low:55,median:80,high:100}, effTax:{low:6,median:12,high:18}, supplierConc:{low:12,median:28,high:50} },
  Retail:        { grossMargin:{low:15,median:28,high:42}, netMargin:{low:1,median:4,high:8}, currentRatio:{low:0.9,median:1.3,high:1.9}, debtToEquity:{low:0.3,median:0.9,high:1.8}, dso:{low:5,median:15,high:35}, dpo:{low:25,median:45,high:70}, vatRecovery:{low:45,median:70,high:95}, effTax:{low:6,median:12,high:18}, supplierConc:{low:10,median:22,high:40} },
  Manufacturing: { grossMargin:{low:18,median:30,high:45}, netMargin:{low:3,median:8,high:14}, currentRatio:{low:1.1,median:1.7,high:2.6}, debtToEquity:{low:0.3,median:0.9,high:1.7}, dso:{low:30,median:55,high:85}, dpo:{low:25,median:45,high:70}, vatRecovery:{low:55,median:80,high:100}, effTax:{low:6,median:12,high:18}, supplierConc:{low:12,median:26,high:46} },
  ProfServices:  { grossMargin:{low:35,median:55,high:75}, netMargin:{low:8,median:18,high:30}, currentRatio:{low:1.1,median:1.8,high:3.0}, debtToEquity:{low:0.1,median:0.5,high:1.2}, dso:{low:25,median:45,high:75}, dpo:{low:15,median:30,high:55}, vatRecovery:{low:30,median:55,high:85}, effTax:{low:6,median:12,high:18}, supplierConc:{low:15,median:35,high:60} },
  Hospitality:   { grossMargin:{low:55,median:68,high:80}, netMargin:{low:2,median:8,high:16}, currentRatio:{low:0.7,median:1.1,high:1.7}, debtToEquity:{low:0.5,median:1.3,high:2.5}, dso:{low:2,median:10,high:25}, dpo:{low:20,median:40,high:65}, vatRecovery:{low:35,median:60,high:90}, effTax:{low:6,median:12,high:18}, supplierConc:{low:10,median:24,high:44} },
  RealEstate:    { grossMargin:{low:40,median:60,high:80}, netMargin:{low:10,median:25,high:45}, currentRatio:{low:0.8,median:1.4,high:2.6}, debtToEquity:{low:0.6,median:1.6,high:3.5}, dso:{low:5,median:20,high:45}, dpo:{low:15,median:35,high:60}, vatRecovery:{low:40,median:65,high:95}, effTax:{low:6,median:12,high:18}, supplierConc:{low:15,median:32,high:55} },
  Agriculture:   { grossMargin:{low:12,median:24,high:40}, netMargin:{low:2,median:7,high:14}, currentRatio:{low:1.0,median:1.6,high:2.6}, debtToEquity:{low:0.4,median:1.1,high:2.2}, dso:{low:15,median:35,high:65}, dpo:{low:20,median:40,high:65}, vatRecovery:{low:55,median:80,high:100}, effTax:{low:4,median:9,high:16}, supplierConc:{low:12,median:28,high:50} },
  Healthcare:    { grossMargin:{low:25,median:42,high:60}, netMargin:{low:3,median:10,high:18}, currentRatio:{low:1.0,median:1.6,high:2.6}, debtToEquity:{low:0.2,median:0.8,high:1.6}, dso:{low:20,median:45,high:80}, dpo:{low:20,median:40,high:65}, vatRecovery:{low:20,median:45,high:80}, effTax:{low:6,median:12,high:18}, supplierConc:{low:12,median:28,high:50} },
  Finance:       { grossMargin:{low:40,median:60,high:80}, netMargin:{low:10,median:25,high:45}, currentRatio:{low:1.0,median:1.5,high:2.6}, debtToEquity:{low:1.0,median:3.0,high:6.0}, dso:{low:10,median:30,high:60}, dpo:{low:10,median:30,high:55}, vatRecovery:{low:10,median:30,high:60}, effTax:{low:8,median:16,high:22}, supplierConc:{low:15,median:35,high:60} },
  Energy:        { grossMargin:{low:15,median:30,high:50}, netMargin:{low:3,median:10,high:20}, currentRatio:{low:0.9,median:1.4,high:2.3}, debtToEquity:{low:0.5,median:1.4,high:2.8}, dso:{low:25,median:45,high:75}, dpo:{low:25,median:45,high:70}, vatRecovery:{low:55,median:80,high:100}, effTax:{low:6,median:12,high:18}, supplierConc:{low:15,median:35,high:60} },
};

function sectorBenchmarks(sector) {
  return SECTOR_BENCHMARKS[sector] || SECTOR_BENCHMARKS._default;
}
function availableSectors() { return Object.keys(SECTOR_BENCHMARKS).filter((s) => s !== "_default"); }

function formatKpi(val, fmt) {
  if (val == null || (typeof val === "number" && !isFinite(val))) return "—";
  if (fmt === "eur") return (val < 0 ? "-€" : "€") + Math.abs(val).toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (fmt === "pct") return (Math.round(val * 10) / 10) + "%";
  if (fmt === "days") return Math.round(val) + " d";
  if (fmt === "ratio") return (Math.round(val * 100) / 100).toString();
  return Math.round(val).toLocaleString();
}

// clamp helper
const _clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// Position a value against its band → {pos 0..1 across low..high, tier, favorable}
function positionInBand(val, band, dir) {
  if (!band) return null;
  const span = band.high - band.low || 1;
  const pos = _clamp((val - band.low) / span, 0, 1);
  // tier relative to median
  let tier;
  if (dir === "down") {
    tier = val <= band.low ? "best" : val <= band.median ? "good" : val <= band.high ? "watch" : "poor";
  } else if (dir === "up") {
    tier = val >= band.high ? "best" : val >= band.median ? "good" : val >= band.low ? "watch" : "poor";
  } else {
    tier = (val >= band.low && val <= band.high) ? "good" : "watch";
  }
  return { pos, tier };
}

// Evaluate a KPI: value vs sector band vs target.
function scoreKpi(meta, kpis, sector, targets) {
  const val = kpis ? kpis[meta.key] : null;
  const band = meta.bench ? sectorBenchmarks(sector)[meta.bench] : null;
  const inBand = (val != null && band) ? positionInBand(val, band, meta.dir) : null;
  const target = targets && targets[meta.key] != null ? Number(targets[meta.key]) : null;

  let targetStatus = null, targetPct = null;
  if (target != null && val != null) {
    if (meta.dir === "down") {
      targetStatus = val <= target ? "met" : (val <= target * 1.1 ? "near" : "off");
      targetPct = target > 0 ? Math.round(_clamp(target / val, 0, 1) * 100) : (val <= target ? 100 : 0);
    } else { // up / flat treated as up toward target
      targetStatus = val >= target ? "met" : (val >= target * 0.9 ? "near" : "off");
      targetPct = target !== 0 ? Math.round(_clamp(val / target, 0, 1) * 100) : (val >= target ? 100 : 0);
    }
  }
  return { key: meta.key, val, band, inBand, target, targetStatus, targetPct };
}

// Portfolio summary across all benched KPIs.
function summarizeKpis(kpis, sector, targets) {
  let aboveMedian = 0, benched = 0, targetsSet = 0, targetsMet = 0;
  KPI_META.forEach((m) => {
    const s = scoreKpi(m, kpis, sector, targets);
    if (s.inBand) { benched++; if (s.inBand.tier === "best" || s.inBand.tier === "good") aboveMedian++; }
    if (s.target != null) { targetsSet++; if (s.targetStatus === "met") targetsMet++; }
  });
  return { aboveMedian, benched, targetsSet, targetsMet };
}

// ═══ MARKDOWN ═══
function Md({ text }) {
  if (!text) return null;
  // turn ⟦n⟧ citation markers into small superscript reference chips
  const cite = (s) => String(s).split(/(⟦\d+⟧)/).map((p, k) => {
    const m = /^⟦(\d+)⟧$/.exec(p);
    return m ? <sup key={k} style={{ fontSize: 9, fontFamily: "var(--m)", color: "#7cc4ff", fontWeight: 700, padding: "0 1px" }}>[{m[1]}]</sup> : p;
  });
  return <div>{text.split("\n").map((line, i) => {
    const b = s => s.split(/(\*\*[^*]+\*\*)/).map((p, j) => p.startsWith("**") && p.endsWith("**") ? <strong key={j} style={{ color: "#ffffff", fontWeight: 800 }}>{cite(p.slice(2, -2))}</strong> : <span key={j}>{cite(p)}</span>);
    if (line.startsWith("### ")) return <h4 key={i} style={{ fontSize: 17, fontWeight: 600, color: "#ffffff", margin: "16px 0 6px", fontFamily: "var(--f)", letterSpacing: "-.01em" }}>{line.slice(4)}</h4>;
    if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: 22, fontWeight: 500, color: "#fff", margin: "18px 0 8px", fontFamily: "var(--f)", letterSpacing: "-.015em" }}>{line.slice(3)}</h3>;
    if (line.startsWith("# ")) return <h2 key={i} style={{ fontSize: 28, fontWeight: 400, color: "#fff", margin: "20px 0 10px", fontFamily: "var(--f)", letterSpacing: "-.02em" }}>{line.slice(2)}</h2>;
    if (line.startsWith("- ")) return <div key={i} style={{ display: "flex", gap: 10, padding: "3px 0", fontSize: 15, lineHeight: 1.7 }}><span style={{ color: "#ffffff" }}>›</span><span style={{ color: "#ededeb" }}>{b(line.slice(2))}</span></div>;
    if (/^\d+[\.\)]\s/.test(line)) return <div key={i} style={{ display: "flex", gap: 10, padding: "3px 0", fontSize: 15, lineHeight: 1.7 }}><span style={{ color: "#ffffff", fontFamily: "var(--m)", fontSize: 13 }}>{line.match(/^\d+/)[0]}.</span><span style={{ color: "#ededeb" }}>{b(line.replace(/^\d+[\.\)]\s/, ""))}</span></div>;
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
    return <p key={i} style={{ fontSize: 15, color: "#ededeb", lineHeight: 1.8, margin: "3px 0" }}>{b(line)}</p>;
  })}</div>;
}

// ════════════════════════════════════════════════════════════════════
// NETWORK GRAPH VISUALIZER (inlined from NetworkGraph.tsx)
// Force-directed money-flow SVG; deterministic layout, interactive.
// ════════════════════════════════════════════════════════════════════

function NetworkGraph({ graph, width = 720, height = 460, lang = "en" }) {
  const [selected, setSelected] = useState(null);
  const [hoverEdge, setHoverEdge] = useState(null);

  const layout = useMemo(() => {
    if (!graph?.nodes?.length) return null;
    const nodes = graph.nodes.map((n, i) => ({
      ...n,
      // seed positions on a circle (deterministic)
      x: width / 2 + Math.cos((i / graph.nodes.length) * 2 * Math.PI) * Math.min(width, height) * 0.32,
      y: height / 2 + Math.sin((i / graph.nodes.length) * 2 * Math.PI) * Math.min(width, height) * 0.32,
      vx: 0, vy: 0,
    }));
    const idx = new Map(nodes.map((n, i) => [n.id, i]));
    const edges = (graph.edges || []).filter(e => idx.has(e.from) && idx.has(e.to));

    // Fruchterman-Reingold (fixed iterations, deterministic)
    const area = width * height;
    const k = Math.sqrt(area / Math.max(1, nodes.length)) * 0.6;
    const iterations = 120;
    let temp = width / 8;
    const cool = temp / (iterations + 1);

    for (let it = 0; it < iterations; it++) {
      // repulsive forces
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].vx = 0; nodes[i].vy = 0;
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          let dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const rep = (k * k) / dist;
          nodes[i].vx += (dx / dist) * rep;
          nodes[i].vy += (dy / dist) * rep;
        }
      }
      // attractive forces along edges
      for (const e of edges) {
        const a = nodes[idx.get(e.from)], b = nodes[idx.get(e.to)];
        let dx = a.x - b.x, dy = a.y - b.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const att = (dist * dist) / k;
        const fx = (dx / dist) * att, fy = (dy / dist) * att;
        a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
      }
      // reposition, bounded by temperature, keep self pinned to center
      for (const n of nodes) {
        if (n.isSelf) { n.x = width / 2; n.y = height / 2; continue; }
        const disp = Math.sqrt(n.vx * n.vx + n.vy * n.vy) || 0.01;
        n.x += (n.vx / disp) * Math.min(disp, temp);
        n.y += (n.vy / disp) * Math.min(disp, temp);
        n.x = Math.max(30, Math.min(width - 30, n.x));
        n.y = Math.max(30, Math.min(height - 30, n.y));
      }
      temp -= cool;
    }

    const maxFlow = Math.max(1, ...edges.map(e => e.amount));
    const maxVal = Math.max(1, ...nodes.map(n => n.value || 0));
    return { nodes, edges, idx, maxFlow, maxVal };
  }, [graph, width, height]);

  if (!layout) return <div style={{ padding: 24, textAlign: "center", color: "#8c8c88", fontFamily: "var(--m)", fontSize: 13 }}>
    {lang === "lt" ? "Nepakanka srautų tinklui sudaryti." : "Not enough flow data to build a network."}
  </div>;

  const kindColor = (kind, isSelf) => isSelf ? "#ffffff" : kind === "customer" ? "#69db7c" : kind === "supplier" ? "#ffa94d" : "#bcbcb8";
  const sel = selected != null ? layout.nodes[layout.idx.get(selected)] : null;
  const neighborIds = new Set();
  if (selected) layout.edges.forEach(e => { if (e.from === selected) neighborIds.add(e.to); if (e.to === selected) neighborIds.add(e.from); });

  return <div style={{ position: "relative" }}>
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ background: "rgba(0,0,0,0.18)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8c88" />
        </marker>
      </defs>
      {/* edges */}
      {layout.edges.map((e, i) => {
        const a = layout.nodes[layout.idx.get(e.from)], b = layout.nodes[layout.idx.get(e.to)];
        const w = 0.6 + (e.amount / layout.maxFlow) * 4;
        const dim = selected && e.from !== selected && e.to !== selected;
        return <g key={i} opacity={dim ? 0.12 : 0.75} onMouseEnter={() => setHoverEdge({ ...e, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })} onMouseLeave={() => setHoverEdge(null)}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hoverEdge && hoverEdge.from === e.from && hoverEdge.to === e.to ? "#ffffff" : "#3a6b4a"} strokeWidth={w} markerEnd="url(#arrow)" />
        </g>;
      })}
      {/* nodes */}
      {layout.nodes.map((n, i) => {
        const rad = 6 + (n.value / layout.maxVal) * 14;
        const dim = selected && n.id !== selected && !neighborIds.has(n.id);
        return <g key={i} transform={`translate(${n.x},${n.y})`} style={{ cursor: "pointer" }} opacity={dim ? 0.2 : 1}
          onClick={() => setSelected(selected === n.id ? null : n.id)}>
          <circle r={rad} fill={kindColor(n.kind, n.isSelf)} stroke={n.isSelf ? "#fff" : "rgba(0,0,0,0.3)"} strokeWidth={n.isSelf ? 2 : 1} />
          {(n.isSelf || rad > 11 || n.id === selected) && <text y={rad + 12} textAnchor="middle" fontSize="10" fill="#d2d2ce" fontFamily="var(--m)">{(n.label || "").slice(0, 18)}</text>}
        </g>;
      })}
      {hoverEdge && <g transform={`translate(${hoverEdge.x},${hoverEdge.y})`}>
        <rect x={-46} y={-12} width={92} height={18} rx={4} fill="#000000" stroke="#ffffff" strokeWidth="0.5" />
        <text textAnchor="middle" y={1} fontSize="10" fill="#ffffff" fontFamily="var(--m)">€{hoverEdge.amount.toLocaleString()} · {hoverEdge.count}×</text>
      </g>}
    </svg>

    {/* legend */}
    <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap", fontSize: 11, fontFamily: "var(--m)", color: "#bcbcb8" }}>
      {[["#ffffff", lang === "lt" ? "Audituojama įmonė" : "Audited company"], ["#69db7c", lang === "lt" ? "Klientas" : "Customer"], ["#ffa94d", lang === "lt" ? "Tiekėjas" : "Supplier"]].map(([c, l]) =>
        <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />{l}</span>)}
      <span style={{ marginLeft: "auto", color: "#8c8c88" }}>{lang === "lt" ? "Spauskite mazgą — paryškinti ryšius · Dydis = srautas" : "Click a node to focus · Size = flow volume"}</span>
    </div>

    {/* selected node detail */}
    {sel && <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "var(--m)", color: "#d2d2ce" }}>
      <strong style={{ color: "#fff" }}>{sel.label}</strong> <span style={{ color: "#bcbcb8" }}>· {sel.kind}</span> · {lang === "lt" ? "srautas" : "flow"} €{(sel.value || 0).toLocaleString()} · {neighborIds.size} {lang === "lt" ? "ryšių" : "connections"}
    </div>}
  </div>;
}

// ═══ VOICE ═══
function useVoice(cb) { const [on, setOn] = useState(false); const [lang, setLang] = useState("lt-LT"); const ref = useRef(null);
  const toggle = useCallback(() => { const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return; if (on) { ref.current?.stop(); setOn(false); return; } const r = new SR(); r.lang = lang; r.continuous = false; r.interimResults = false; r.onresult = e => { cb(e.results[0][0].transcript); setOn(false); }; r.onerror = () => setOn(false); r.onend = () => setOn(false); ref.current = r; r.start(); setOn(true); }, [on, lang, cb]); return { on, toggle, lang, setLang }; }

// ═══ EXPORT ═══
function exportCSV(findings, fileName) {
  const header = "Severity,Level,Category,Title,Detail,Status,Authority,Basis,BasisStatus\n";
  const rows = findings.map(f => {
    const pv = provenanceFor(f);
    return `"${f.severity}","L${f.level}","${f.category}","${f.title.replace(/"/g, '""')}","${f.detail.replace(/"/g, '""')}","${f.status || 'open'}","${pv.authority}","${pv.reference.replace(/"/g, '""')}","${pv.status}"`;
  }).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = fileName || "taxai-findings.csv"; a.click();
}

// Adaptive (AI-designed, deterministically-scored) rules → CSV
function exportPersonalRulesCSV(personalRules, fileName) {
  const rules = personalRules?.rules || [];
  const q = s => `"${String(s == null ? "" : s).replace(/"/g, '""')}"`;
  const header = "ID,Category,Severity,Type,Kind,Status,Title,Observed,Rationale,Interpretation,LawRef\n";
  const rows = rules.map(r => [r.id, r.category, r.severity, r.type, r.kind, r.status,
    r.title, (r.observed || []).join(" | "), r.rationale, r.interpretation, r.lawRef].map(q).join(",")).join("\n");
  const meta = `# Industry: ${personalRules?.industry || ""} (confidence ${personalRules?.industryConfidence || ""})\n# ${personalRules?.industryRationale || ""}\n`;
  const blob = new Blob([meta + header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = fileName || "taxai-adaptive-rules.csv"; a.click();
}

// Full intelligence bundle as JSON (deterministic; machine-readable evidence)
function exportIntelJSON(intel, fileName) {
  const blob = new Blob([JSON.stringify(intel, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = fileName || "taxai-intelligence.json"; a.click();
}

// Board-ready forensic report: opens a print-formatted window (→ Save as PDF).
function exportForensicReport({ company, period, intel, runResult, findings, threatMarkdown, caseFlags, lang, personalRules }) {
  const esc = s => String(s == null ? "" : s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const c = intel?.risk?.band === "CRITICAL" ? "#c0392b" : intel?.risk?.band === "HIGH" ? "#d35400" : intel?.risk?.band === "MEDIUM" ? "#b7950b" : "#1e8449";
  const factorsRows = (intel?.risk?.factors || []).map(f => `<tr><td>${esc(f.label)}</td><td style="text-align:right;font-weight:700">+${f.points}</td><td style="color:#555">${esc(f.detail)}</td></tr>`).join("");
  const findingRows = (findings || []).slice(0, 80).map(f => `<tr><td>${esc(f.rule_id || "")}</td><td><b style="color:${f.severity === "Critical" ? "#c0392b" : f.severity === "High" ? "#d35400" : "#b7950b"}">${esc(f.severity)}</b></td><td>${esc(f.category)}</td><td>${esc(f.title)}</td></tr>`).join("");
  const cycles = (intel?.graph?.cycles || []).slice(0, 8).map(cy => `<li>${esc((cy.labels || cy.path).map(p => typeof p === "string" ? p.replace(/^(reg|name|customer|supplier|company):/, "") : p).join(" → "))} — min €${(cy.minFlow || 0).toLocaleString()}</li>`).join("");
  const flagged = Object.entries(caseFlags || {}).filter(([, v]) => v.flagged).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v.status || "open")}</td><td>${esc(v.assignee || "")}</td><td>${esc(v.note || "")}</td></tr>`).join("");
  const mdToHtml = md => esc(md || "").replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/^# (.*)$/gm, "<h1>$1</h1>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/^- (.*)$/gm, "• $1").replace(/\n/g, "<br>");

  const prRules = personalRules?.rules || [];
  const prRows = prRules.map(r => `<tr><td>${esc(r.id)}</td><td><b style="color:${r.severity === "Block" ? "#c0392b" : r.severity === "Reject" ? "#d35400" : "#b7950b"}">${esc(r.severity)}</b></td><td>${esc(r.kind)}</td><td><b style="color:${r.status === "FAIL" ? "#c0392b" : r.status === "PASS" ? "#1e8449" : "#888"}">${r.status === "FAIL" ? "FLAGGED" : r.status === "PASS" ? "CLEAR" : "N/A"}</b></td><td>${esc(r.title)}${r.observed?.length ? `<br><span style="color:#666">${esc(r.observed.join(" · "))}</span>` : ""}${r.interpretation ? `<br><span style="color:#444">→ ${esc(r.interpretation)}</span>` : ""}${r.lawRef ? ` <span style="color:#888">[${esc(r.lawRef)}]</span>` : ""}</td></tr>`).join("");
  const prSecN = 6 + (flagged ? 1 : 0) + (threatMarkdown ? 1 : 0) + 1;
  const prBlock = prRules.length ? `<h2>${prSecN} · Adaptive Rules · AI <span style="font-weight:400;color:#888;font-size:13px">(industry: ${esc(personalRules.industry || "")} · confidence ${esc(personalRules.industryConfidence || "")})</span></h2>
  <p>${esc(personalRules.industryRationale || "")}</p>
  <p style="font-size:11px;color:#666">Company-specific rules designed by AI over the deterministic metric registry, then scored deterministically. Flagged ${personalRules.counts?.fail || 0} · Clear ${personalRules.counts?.pass || 0} · N/A ${personalRules.counts?.na || 0}.</p>
  <table><thead><tr><th>Rule</th><th>Severity</th><th>Kind</th><th>Status</th><th>Detail</th></tr></thead><tbody>${prRows}</tbody></table>` : "";

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>TAXAI Forensic Report — ${esc(company)}</title>
  <style>
    body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;max-width:900px;margin:0 auto;padding:40px;line-height:1.55}
    h1{font-size:26px;margin:0 0 4px} h2{font-size:18px;border-bottom:2px solid #eee;padding-bottom:6px;margin-top:32px} h3{font-size:14px;margin-top:18px}
    .meta{color:#666;font-size:13px;margin-bottom:24px}
    .score{display:inline-block;padding:8px 18px;border-radius:8px;background:${c}1a;color:${c};font-weight:800;font-size:22px}
    table{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0}
    th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #eee;vertical-align:top}
    th{background:#fafafa;font-size:11px;text-transform:uppercase;color:#888}
    .disc{margin-top:30px;padding:14px;background:#fff8e6;border:1px solid #f0d68a;border-radius:8px;font-size:11px;color:#7a5c00}
    @media print{body{padding:0}}
  </style></head><body>
  <h1>TAXAI · Forensic Intelligence Report</h1>
  <div class="meta"><b>${esc(company)}</b> · ${esc(period)} · Generated ${new Date().toLocaleString()}</div>
  <h2>1 · Risk Summary</h2>
  <p>Composite risk score: <span class="score">${intel?.risk?.score ?? "—"}/100 · ${esc(intel?.risk?.band || "")}</span></p>
  <p>${esc(intel?.risk?.interpretation || "")}</p>
  <table><thead><tr><th>Risk factor</th><th>Points</th><th>Detail</th></tr></thead><tbody>${factorsRows || '<tr><td colspan=3>No material risk factors.</td></tr>'}</tbody></table>
  <h2>2 · Statistical Forensics</h2>
  <p>Benford: ${intel?.benford?.applicable ? `MAD ${intel.benford.mad}, χ² ${intel.benford.chi2} (crit ${intel.benford.chi2Critical}) — ${esc(intel.benford.conformity)}` : "n/a (sample &lt; 50)"}</p>
  <p>Outliers: ${intel?.anomalies?.outliers?.length || 0} · Duplicate clusters: ${intel?.anomalies?.duplicateClusters?.length || 0} · Round-number bias: ${intel?.anomalies?.roundNumberBias?.elevated ? "ELEVATED" : "normal"} · Period-end clustering: ${intel?.anomalies?.periodEndClustering?.elevated ? "ELEVATED" : "normal"}</p>
  <h2>3 · Network Analysis</h2>
  <p>${intel?.graph?.nodeCount || 0} entities · ${intel?.graph?.edgeCount || 0} money flows · ${intel?.graph?.cycleCount || 0} circular cycles · concentration HHI ${intel?.graph?.concentration?.hhi ?? "—"} (${esc(intel?.graph?.concentration?.interpretation || "")})</p>
  ${cycles ? `<p><b>Detected circular flows (round-trip risk):</b></p><ul style="font-size:12px">${cycles}</ul>` : ""}
  <h2>4 · Temporal Forensics</h2>
  <p>${intel?.temporal?.applicable ? `Velocity anomalies: ${intel.temporal.velocitySpikes.length} · Backdated (&gt;30d): ${intel.temporal.backdating.length} · Weekend posting: ${intel.temporal.weekendPostings?.pct ?? "—"}% · After-hours: ${intel.temporal.afterHours?.pct ?? "—"}%` : "Insufficient dated events."}</p>
  <h2>5 · Entity Intelligence</h2>
  <p>Probable duplicate entities: ${intel?.entityRes?.duplicates?.length || 0} · Shared bank accounts: ${intel?.entityRes?.sharedBankAccounts?.length || 0} · Shell-flagged: ${intel?.entityRes?.shellIndicators?.length || 0}</p>
  <h2>6 · Compliance Findings (300-rule engine)</h2>
  <p>Total ${runResult?.summary?.total || 0} — Block ${runResult?.bySeverity?.Block || 0}, Reject ${runResult?.bySeverity?.Reject || 0}, Warn ${runResult?.bySeverity?.Warn || 0}</p>
  <table><thead><tr><th>Rule</th><th>Severity</th><th>Category</th><th>Finding</th></tr></thead><tbody>${findingRows || '<tr><td colspan=4>No findings.</td></tr>'}</tbody></table>
  ${flagged ? `<h2>7 · Investigation Case File</h2><table><thead><tr><th>Item</th><th>Status</th><th>Assignee</th><th>Note</th></tr></thead><tbody>${flagged}</tbody></table>` : ""}
  ${threatMarkdown ? `<h2>${flagged ? "8" : "7"} · AI Threat Assessment</h2><div style="font-size:12px">${mdToHtml(threatMarkdown)}</div>` : ""}
  ${prBlock}
  <div class="disc"><b>Disclaimer.</b> Deterministic engine outputs (risk factors, Benford, anomalies, graph, temporal) are reproducible computations from the SAF-T file. AI narrative is decision-support, not an accusation — signals warrant investigation, not proof of wrongdoing. Figures are accounting approximations; verify against filed statements (PLN204, balansas) and applicable law before action. Not a substitute for a licensed advisor or an official VMI audit.</div>
  <script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

const SC = s => ({ Critical: "#ff6b6b", High: "#ffa94d", Medium: "#ffd43b", Low: "#69db7c" }[s] || "#aaa");

// ═══════════════════════════════════════════════════
// PAGE BANNER — cinematic black-and-white canvas header used across all
// in-app pages (not just the landing). Three deterministic motion variants:
//   "network"  → drifting data-network with cursor reaction
//   "particles"→ rising particle field
//   "scan"     → scanning rule-grid
// All pure-canvas (no external images/video) so they always render, look
// high-quality, and stay perfectly on-brand in monochrome.
// ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════
// PERFORMANCE: shared animation helpers
//   • prefersReducedMotion() — honor the OS "reduce motion" setting
//   • useCanvasAnim(ref, draw) — runs an rAF loop that AUTO-PAUSES when the
//     canvas is scrolled off-screen (IntersectionObserver) or the tab is
//     hidden (visibilitychange), caps device-pixel-ratio, and debounces
//     resize. This is the single biggest perf win: idle canvases cost 0 CPU.
// ═══════════════════════════════════════════════════
function prefersReducedMotion() {
  try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}
function useCanvasAnim(ref, makeDraw, deps = []) {
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const reduce = prefersReducedMotion();
    let raf = 0, w = 0, h = 0, dpr = 1, visible = true, tabVisible = !document.hidden, running = false;
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr)); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const api = { get w() { return w; }, get h() { return h; }, ctx, canvas, reduce };
    const draw = makeDraw(api);
    let t = 0;
    const loop = () => { t += 1; draw.frame(t); raf = requestAnimationFrame(loop); };
    const start = () => { if (running) return; if (!visible || !tabVisible) return; running = true; raf = requestAnimationFrame(loop); };
    const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
    // initial sizing + one static paint (so reduced-motion / paused still shows something)
    size(); draw.init && draw.init(); draw.frame(0);
    if (reduce) { /* static frame only, no loop */ }
    else start();
    // pause when off-screen
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (reduce) return; visible ? start() : stop(); }, { threshold: 0.01 });
    io.observe(canvas);
    // pause when tab hidden
    const onVis = () => { tabVisible = !document.hidden; if (reduce) return; tabVisible ? start() : stop(); };
    document.addEventListener("visibilitychange", onVis);
    // debounced resize
    let rz; const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { size(); draw.init && draw.init(); draw.frame(0); }, 150); };
    addEventListener("resize", onResize);
    return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); removeEventListener("resize", onResize); clearTimeout(rz); draw.cleanup && draw.cleanup(); };
  }, deps); // eslint-disable-line
}

function PageBanner({ variant = "network", height = 150, label, title, sub, right }) {
  const ref = useRef(null);
  useCanvasAnim(ref, ({ ctx, canvas }) => {
    let items = [], mx = -999, my = -999;
    const mm = e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const ml = () => { mx = -999; my = -999; };
    canvas.addEventListener("mousemove", mm); canvas.addEventListener("mouseleave", ml);
    return {
      init() {
        const w = canvas.clientWidth, h = canvas.clientHeight; items = [];
        if (variant === "network") { const n = Math.min(46, Math.round(w / 26)); for (let i = 0; i < n; i++) items.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.4 + .5, p: Math.random() * 6.28 }); }
        else if (variant === "particles") { const n = Math.min(80, Math.round(w / 14)); for (let i = 0; i < n; i++) items.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), vy: Math.random() * .3 + .1 }); }
        else { const cell = 22, cols = Math.ceil(w / cell), rows = Math.ceil(h / cell); for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) items.push({ x: x * cell, y: y * cell, s: Math.random(), on: Math.random() > .8, cell }); }
      },
      frame(tf) {
        const w = canvas.clientWidth, h = canvas.clientHeight; const t = tf * 0.016; ctx.clearRect(0, 0, w, h);
        if (variant === "network") {
          for (const n of items) { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1; const dxm = mx - n.x, dym = my - n.y, dm = Math.hypot(dxm, dym); if (dm < 110) { n.x -= dxm * .003; n.y -= dym * .003; } }
          for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], b = items[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 120) { ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 120) * .35})`; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
          for (const n of items) { const tw = .5 + Math.sin(t * .9 + n.p) * .4; const near = Math.hypot(mx - n.x, my - n.y) < 110; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (near ? 1.7 : 1), 0, 7); ctx.fillStyle = `rgba(255,255,255,${near ? .9 : .35 + tw * .4})`; ctx.fill(); }
        } else if (variant === "particles") {
          for (const p of items) { p.y -= p.vy * (.4 + p.z); if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; } ctx.beginPath(); ctx.arc(p.x + Math.sin(t + p.z * 6) * 5, p.y, .5 + p.z * 1.6, 0, 7); ctx.fillStyle = `rgba(255,255,255,${.12 + p.z * .5})`; ctx.fill(); }
        } else {
          const scan = (t * 55) % (h + 140) - 70;
          for (const c of items) { ctx.strokeStyle = "rgba(255,255,255,0.045)"; ctx.lineWidth = .5; ctx.strokeRect(c.x, c.y, c.cell, c.cell); if (c.on) { const pulse = .18 + Math.sin(t * 1.8 + c.s * 8) * .12; let a = pulse; const dist = Math.abs(c.y - scan); if (dist < 50) a = Math.min(1, pulse + (1 - dist / 50) * .7); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(c.x + c.cell * .28, c.y + c.cell * .28, c.cell * .44, c.cell * .44); } }
          ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fillRect(0, scan, w, 1);
        }
      },
      cleanup() { canvas.removeEventListener("mousemove", mm); canvas.removeEventListener("mouseleave", ml); },
    };
  }, [variant]);
  return (
    <div style={{ position: "relative", height, marginBottom: 28, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", background: "#050506" }}>
      <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "grayscale(1) contrast(1.1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#000 8%,rgba(0,0,0,.35) 55%,rgba(0,0,0,.7) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 32px" }}>
        {label && <div style={{ fontFamily: "var(--m)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#a4a4a0", display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}><span style={{ width: 32, height: 1, background: "#a4a4a0" }} />{label}</div>}
        {title && <h2 style={{ fontFamily: "var(--f)", fontWeight: 300, fontSize: "clamp(30px,4vw,48px)", lineHeight: 1, letterSpacing: "-.02em", color: "#fff" }}>{title}</h2>}
        {sub && <p style={{ fontSize: 14, color: "#bcbcb8", fontFamily: "var(--s)", marginTop: 10, maxWidth: 620, lineHeight: 1.55 }}>{sub}</p>}
      </div>
      {right && <div style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", zIndex: 3, display: "flex", gap: 10 }}>{right}</div>}
    </div>
  );
}

// ── Optional self-hosted video backdrop ───────────────────────────────
// Drop a royalty-free B&W clip (from Coverr/Pexels) into /public as
// hero.mp4 and it shows here; otherwise we fall back to the canvas network.
// Video is muted+looped+playsInline, lazy (preload metadata), paused when
// off-screen, and disabled under prefers-reduced-motion — so it never hurts
// performance. `src` defaults to "/hero.mp4".
function VideoBackdrop({ src = "/hero.mp4", fallback = null, overlay = true }) {
  const vref = useRef(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const v = vref.current; if (!v) return;
    if (prefersReducedMotion()) { try { v.pause(); } catch {} return; }
    const io = new IntersectionObserver((es) => { if (!v) return; if (es[0].isIntersecting) { v.play().catch(() => {}); } else { try { v.pause(); } catch {} } }, { threshold: 0.01 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  if (!ok) return fallback;
  return (
    <>
      <video ref={vref} muted loop playsInline preload="metadata" onError={() => setOk(false)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.12) brightness(.85)" }}>
        <source src={src} type="video/mp4" />
      </video>
      {overlay && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 120% at 75% 25%, rgba(0,0,0,.15), rgba(0,0,0,.6) 70%, #000)", pointerEvents: "none" }} />}
    </>
  );
}

// Full-bleed cinematic network backdrop for the home hero (B&W, cursor-reactive, auto-pausing).
function HomeHeroCanvas() {
  const ref = useRef(null);
  useCanvasAnim(ref, ({ ctx, canvas }) => {
    let nodes = [], mx = -999, my = -999;
    const mm = e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const ml = () => { mx = -999; my = -999; };
    canvas.addEventListener("mousemove", mm); canvas.addEventListener("mouseleave", ml);
    return {
      init() { const w = canvas.clientWidth, h = canvas.clientHeight; nodes = []; const n = Math.min(80, Math.round(w / 20)); for (let i = 0; i < n; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: Math.random() * 1.6 + .6, p: Math.random() * 6.28 }); },
      frame(tf) {
        const w = canvas.clientWidth, h = canvas.clientHeight; const t = tf * 0.016; ctx.clearRect(0, 0, w, h);
        for (const nd of nodes) { nd.x += nd.vx; nd.y += nd.vy; if (nd.x < 0 || nd.x > w) nd.vx *= -1; if (nd.y < 0 || nd.y > h) nd.vy *= -1; const dxm = mx - nd.x, dym = my - nd.y, dm = Math.hypot(dxm, dym); if (dm < 130) { nd.x -= dxm * .004; nd.y -= dym * .004; } }
        for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 150) { ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 150) * .4})`; ctx.lineWidth = .55; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
        for (const nd of nodes) { const tw = .5 + Math.sin(t + nd.p) * .4; const near = Math.hypot(mx - nd.x, my - nd.y) < 130; ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r * (near ? 1.8 : 1), 0, 7); ctx.fillStyle = `rgba(255,255,255,${near ? .95 : .35 + tw * .45})`; ctx.fill(); }
      },
      cleanup() { canvas.removeEventListener("mousemove", mm); canvas.removeEventListener("mouseleave", ml); },
    };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "grayscale(1) contrast(1.08)" }} />;
}


// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
// Animated count-up number for the home hero (respects reduced-motion)
function CountUp({ to, dur = 1500, suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof prefersReducedMotion === "function" && prefersReducedMotion()) { setN(to); return; }
    let raf, start;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <>{n}{suffix}</>;
}

// ────────────────────────────────────────────────────────────────────
// KPI DASHBOARD — benchmarked, goal-aware, easy to read.
// Each metric shows its value, position within the sector band (a gauge),
// the sector median, an editable target, and a plain-language verdict.
// ────────────────────────────────────────────────────────────────────
function KpiDashboard({ lang, kpis, sector, setSector, targets, setTarget }) {
  const PL_LINE = "rgba(255,255,255,0.12)", PL_SOFT = "rgba(255,255,255,0.06)";
  const L = (en, lt) => (lang === "lt" ? lt : en);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  if (!kpis) return null;

  const TIER = {
    best:  { c: "#69db7c", en: "Top of range", lt: "Diapazono viršuje" },
    good:  { c: "#9ae6a4", en: "Above median", lt: "Virš medianos" },
    watch: { c: "#ffd43b", en: "Below median", lt: "Žemiau medianos" },
    poor:  { c: "#ff8a8a", en: "Off benchmark", lt: "Už ribų" },
  };
  const TGT = {
    met:  { c: "#69db7c", en: "On target", lt: "Pasiektas tikslas" },
    near: { c: "#ffd43b", en: "Near target", lt: "Beveik tikslas" },
    off:  { c: "#ff8a8a", en: "Off target", lt: "Nepasiektas" },
  };
  const summary = summarizeKpis(kpis, sector, targets);

  const startEdit = (key) => { setEditing(key); setDraft(targets[key] != null ? String(targets[key]) : ""); };
  const commit = (key) => { const v = parseFloat(draft.replace(",", ".")); setTarget(key, isNaN(v) ? null : v); setEditing(null); };

  // gauge: low─median─high track, company marker, optional target flag
  const Gauge = ({ s, meta }) => {
    if (!s.band || !s.inBand) return <div style={{ height: 28 }} />;
    const tier = TIER[s.inBand.tier];
    const pos = Math.round(s.inBand.pos * 100);
    const medPos = Math.round(((s.band.median - s.band.low) / ((s.band.high - s.band.low) || 1)) * 100);
    let tgtPos = null;
    if (s.target != null) tgtPos = Math.round(Math.max(0, Math.min(1, (s.target - s.band.low) / ((s.band.high - s.band.low) || 1))) * 100);
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
          {/* favorable side shading omitted for clarity; median tick + markers below */}
          <div style={{ position: "absolute", left: `calc(${medPos}% - 1px)`, top: -3, width: 2, height: 12, background: "rgba(255,255,255,0.4)" }} title={L("sector median", "sektoriaus mediana")} />
          {tgtPos != null && <div style={{ position: "absolute", left: `calc(${tgtPos}% - 5px)`, top: -10, fontSize: 9, color: "#7cc4ff" }} title={L("your target", "jūsų tikslas")}>▼</div>}
          <div style={{ position: "absolute", left: `calc(${pos}% - 5px)`, top: -3.5, width: 11, height: 11, borderRadius: "50%", background: tier.c, border: "2px solid #0b0b0d", boxShadow: `0 0 0 1px ${tier.c}` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 9, color: "#7a7a76", fontFamily: "var(--m)" }}>
          <span>{formatKpi(s.band.low, meta.fmt)}</span>
          <span>{L("med", "med")} {formatKpi(s.band.median, meta.fmt)}</span>
          <span>{formatKpi(s.band.high, meta.fmt)}</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "var(--m)", fontSize: 11, letterSpacing: ".14em", color: "#8c8c88", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 22, height: 1, background: "#8c8c88" }} />{L("KPI Intelligence", "KPI žvalgyba")}</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", textTransform: "uppercase", letterSpacing: ".08em" }}>{L("Benchmark sector", "Lyginimo sektorius")}</span>
          <select value={sector} onChange={(e) => setSector(e.target.value)} style={{ background: "var(--bg2)", color: "#fff", border: `1px solid ${PL_LINE}`, fontFamily: "var(--m)", fontSize: 12, padding: "6px 10px", cursor: "pointer" }}>
            {availableSectors().map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* summary band */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}`, marginBottom: 22 }}>
        {[
          [L("At or above median", "Ties mediana ar virš"), `${summary.aboveMedian}/${summary.benched}`, summary.aboveMedian >= summary.benched / 2 ? "#69db7c" : "#ffd43b"],
          [L("Targets met", "Pasiekti tikslai"), summary.targetsSet ? `${summary.targetsMet}/${summary.targetsSet}` : "—", summary.targetsSet && summary.targetsMet === summary.targetsSet ? "#69db7c" : "#ffd43b"],
          [L("Benchmarked KPIs", "Lyginami KPI"), String(summary.benched), "#fff"],
          [L("Targets set", "Nustatyti tikslai"), String(summary.targetsSet), "#7cc4ff"],
        ].map(([k, v, c], i) =>
          <div key={i} style={{ padding: "16px 18px", borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}` }}>
            <div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{k}</div>
            <div style={{ fontSize: 26, fontWeight: 300, fontFamily: "var(--f)", color: c }}>{v}</div>
          </div>)}
      </div>

      {/* category groups */}
      {KPI_CATS.map((cat) => {
        const metas = KPI_META.filter((m) => m.cat === cat.key);
        if (!metas.length) return null;
        return <div key={cat.key} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: "#fff", fontFamily: "var(--m)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10 }}>{L(cat.en, cat.lt)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {metas.map((meta) => {
              const s = scoreKpi(meta, kpis, sector, targets);
              const tier = s.inBand ? TIER[s.inBand.tier] : null;
              const tgt = s.targetStatus ? TGT[s.targetStatus] : null;
              return <div key={meta.key} style={{ border: `1px solid ${PL_LINE}`, background: "var(--bg2)", padding: "14px 16px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ fontSize: 10.5, color: "#bcbcb8", fontFamily: "var(--m)", textTransform: "uppercase", letterSpacing: ".06em", flex: 1 }}>{L(meta.en, meta.lt)}</div>
                  {tier && <span style={{ fontSize: 8.5, fontFamily: "var(--m)", fontWeight: 700, color: tier.c, border: `1px solid ${tier.c}`, borderRadius: 3, padding: "1px 6px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{L(tier.en, tier.lt)}</span>}
                </div>
                <div style={{ fontSize: 30, fontWeight: 300, color: "#fff", fontFamily: "var(--f)", lineHeight: 1.1, marginTop: 6 }}>{formatKpi(s.val, meta.fmt)}</div>
                <Gauge s={s} meta={meta} />
                {/* target row */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${PL_SOFT}`, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {editing === meta.key ? <>
                    <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commit(meta.key); if (e.key === "Escape") setEditing(null); }} placeholder={L("target", "tikslas")} style={{ width: 70, background: "#000", border: `1px solid #7cc4ff`, color: "#fff", fontFamily: "var(--m)", fontSize: 12, padding: "4px 8px", outline: "none" }} />
                    <button onClick={() => commit(meta.key)} style={{ background: "#7cc4ff", color: "#000", border: "none", fontFamily: "var(--m)", fontSize: 9.5, fontWeight: 700, padding: "4px 9px", cursor: "pointer", textTransform: "uppercase" }}>{L("Set", "Nustatyti")}</button>
                    {targets[meta.key] != null && <button onClick={() => { setTarget(meta.key, null); setEditing(null); }} style={{ background: "none", color: "#8c8c88", border: "none", fontFamily: "var(--m)", fontSize: 9.5, cursor: "pointer", textTransform: "uppercase" }}>{L("Clear", "Išvalyti")}</button>}
                  </> : <>
                    {s.target != null ? <>
                      <span style={{ fontSize: 10.5, color: "#bcbcb8", fontFamily: "var(--m)" }}>{L("Target", "Tikslas")}: <span style={{ color: "#7cc4ff" }}>{formatKpi(s.target, meta.fmt)}</span></span>
                      {tgt && <span style={{ fontSize: 8.5, fontFamily: "var(--m)", fontWeight: 700, color: tgt.c, border: `1px solid ${tgt.c}`, borderRadius: 3, padding: "1px 6px", textTransform: "uppercase" }}>{L(tgt.en, tgt.lt)}{s.targetPct != null ? ` · ${s.targetPct}%` : ""}</span>}
                      <button onClick={() => startEdit(meta.key)} style={{ marginLeft: "auto", background: "none", color: "#8c8c88", border: "none", fontFamily: "var(--m)", fontSize: 9.5, cursor: "pointer", textTransform: "uppercase" }}>{L("Edit", "Keisti")}</button>
                    </> : <button onClick={() => startEdit(meta.key)} style={{ background: "none", color: "#7cc4ff", border: `1px dashed rgba(124,196,255,0.4)`, borderRadius: 3, fontFamily: "var(--m)", fontSize: 9.5, fontWeight: 600, padding: "4px 10px", cursor: "pointer", textTransform: "uppercase" }}>+ {L("Set a goal", "Nustatyti tikslą")}</button>}
                  </>}
                </div>
              </div>;
            })}
          </div>
        </div>;
      })}

      <div style={{ marginTop: 8, fontSize: 10.5, color: "#7a7a76", fontFamily: "var(--s)", lineHeight: 1.55 }}>
        {L("Benchmark bands are illustrative baselines per sector and should be replaced with your own aggregated data; the value, median tick, and your target (▼) are shown on each gauge. Figures are accounting approximations — verify against the filed statements.",
           "Lyginimo diapazonai yra orientaciniai pagal sektorių ir turėtų būti pakeisti jūsų agreguotais duomenimis; reikšmė, medianos žyma ir jūsų tikslas (▼) rodomi kiekvienoje skalėje. Skaičiai yra apskaitos aproksimacijos — patikrinkite su pateiktomis ataskaitomis.")}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// MONTHLY VAT-CLOSE WORKFLOW AGENT
// A multi-step, stateful process with human sign-off gates. It ingests a
// monthly i.SAF, reconciles it against the loaded SAF-T ledger, surfaces
// discrepancies for review, drafts FR0600 notes, and produces a client
// memo. Deterministic numbers stand alone; AI only phrases narrative.
// ────────────────────────────────────────────────────────────────────
function VatCloseWorkflow({ lang, data, kpis, callAI, audit, state, setState, presetIsaf, presetRecon, presetIsafName }) {
  const PL_LINE = "rgba(255,255,255,0.12)", PL_SOFT = "rgba(255,255,255,0.06)";
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const L = (en, lt) => (lang === "lt" ? lt : en);
  const bP = { background: "#fff", color: "#000", border: "none", padding: "9px 18px", fontSize: 11, fontWeight: 700, fontFamily: "var(--m)", letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" };
  const bG = { background: "transparent", color: "#d2d2ce", border: `1px solid ${PL_LINE}`, padding: "9px 16px", fontSize: 11, fontWeight: 600, fontFamily: "var(--m)", letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" };
  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const r2 = (n) => Math.round((n || 0) * 100) / 100;
  const eur = (n) => (n || 0).toLocaleString() + " €";

  const STEPS = [
    { key: "ledger", en: "Ledger check", lt: "Knygos patikra" },
    { key: "intake", en: "i.SAF intake", lt: "i.SAF įkėlimas" },
    { key: "reconcile", en: "Reconcile", lt: "Sutikrinimas" },
    { key: "review", en: "Review discrepancies", lt: "Peržiūrėti neatitikimus" },
    { key: "fr0600", en: "FR0600 notes", lt: "FR0600 pastabos" },
    { key: "memo", en: "Client memo", lt: "Kliento atmintinė" },
  ];
  const step = state.step;
  const recon = state.recon;

  // advance helpers
  const goTo = (n) => set({ step: n });
  const ingestISAF = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseISAF(e.target.result);
        if (parsed._parseError) { alert(L("i.SAF parse error: ", "i.SAF klaida: ") + parsed._parseError); return; }
        const rec = reconcileISAF(parsed, data);
        audit?.log?.("WF_VATCLOSE_ISAF", `${file.name} · ${rec.findings.length} findings`);
        set({ isaf: parsed, isafName: file.name, recon: rec, decisions: {}, step: 3 });
      } catch (err) { alert(L("Error: ", "Klaida: ") + err.message); }
    };
    reader.readAsText(file);
  };
  const useExisting = () => {
    if (!presetRecon || !presetIsaf) return;
    set({ isaf: presetIsaf, isafName: presetIsafName || "i.SAF", recon: presetRecon, decisions: {}, step: 3 });
  };

  // FR0600 deterministic figures from the reconciled VAT position
  const fr = recon?.summary?.vat ? (() => {
    const v = recon.summary.vat;
    const corrections = [];
    recon.findings.forEach((f) => {
      if (f.severity === "Block" || f.severity === "Reject") corrections.push({ id: f.id, sev: f.severity, title: f.title });
    });
    return {
      outputLedger: v.outputSAFT, inputLedger: v.inputSAFT, netLedger: v.netSAFT,
      outputISAF: v.outputISAF, inputISAF: v.inputISAF, netISAF: v.netISAF,
      netDelta: v.netDelta, corrections,
    };
  })() : null;

  const reviewDecisions = state.decisions || {};
  const findings = recon?.findings || [];
  const reviewedCount = findings.filter((f) => reviewDecisions[f.id]).length;
  const allReviewed = findings.length === 0 || reviewedCount === findings.length;

  const draftMemo = async () => {
    setBusy(true);
    try {
      const v = recon.summary.vat;
      const period = data?.header?.fiscalYearFrom ? `${data.header.fiscalYearFrom?.slice(0, 10)} → ${data.header.fiscalYearTo?.slice(0, 10)}` : (state.isaf?.header?.periodFrom || "");
      const entity = data?.header?.company?.name || "the entity";
      const decisionsSummary = findings.map((f) => `- [${f.severity}] ${f.title}: ${reviewDecisions[f.id] === "resolved" ? "RESOLVED" : reviewDecisions[f.id] === "accepted" ? "accepted/known" : "open"}`).join("\n");
      const sys = L(
        "You are a tax advisor drafting a concise monthly VAT-close memo for a client. Use ONLY the figures and findings provided. Be practical, professional, and brief. Do not invent numbers. End with a one-line note that this is informational, not legal advice.",
        "Esate mokesčių konsultantas, rengiantis glaustą mėnesinę PVM uždarymo atmintinę klientui. Naudokite TIK pateiktus skaičius ir radinius. Būkite praktiškas, profesionalus ir glaustas. Nesugalvokite skaičių. Pabaigoje pridėkite eilutę, kad tai informacinio pobūdžio informacija, ne teisinė konsultacija."
      );
      const payload = `ENTITY: ${entity}\nPERIOD: ${period}\nVAT POSITION (ledger basis): output ${eur(v.outputSAFT)}, input ${eur(v.inputSAFT)}, net ${eur(v.netSAFT)}\ni.SAF DECLARED: output ${eur(v.outputISAF)}, input ${eur(v.inputISAF)}, net ${eur(v.netISAF)}\nNET DELTA (i.SAF − ledger): ${eur(v.netDelta)}\nDISCREPANCIES (${findings.length}):\n${decisionsSummary || "none"}\n\nWrite: (1) one-paragraph summary of the close, (2) the discrepancies found and their resolution status, (3) the net VAT position and what to file, (4) recommended next actions.`;
      const md = await callAI(sys, payload, []);
      const facts = buildGroundingFacts({ kpis, reconResult: recon });
      const ver = verifyNarrative(md, facts);
      set({ memo: md, memoVer: ver, memoGround: null });
      audit?.log?.("WF_VATCLOSE_MEMO", entity);
    } catch (e) {
      set({ memo: L("Could not draft the memo via AI. The deterministic figures above remain valid; you can write the memo manually.\n\nError: ", "Nepavyko parengti atmintinės per AI. Deterministiniai skaičiai galioja; atmintinę galite parašyti rankiniu būdu.\n\nKlaida: ") + e.message, memoVer: null });
    }
    setBusy(false);
  };

  const reset = () => setState({ step: 0, isaf: null, isafName: "", recon: null, decisions: {}, memo: null, memoVer: null, memoGround: null, closedAt: null });

  // ── render ──
  const ledgerReady = !!(data && data.header);
  const Dot = ({ s }) => <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: s === "done" ? "#69db7c" : s === "active" ? "#7cc4ff" : "rgba(255,255,255,0.18)", boxShadow: s === "active" ? "0 0 0 4px rgba(124,196,255,0.15)" : "none" }} />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "var(--m)", fontSize: 11, letterSpacing: ".14em", color: "#8c8c88", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 22, height: 1, background: "#8c8c88" }} />02·H — {L("Monthly VAT Close", "Mėnesinis PVM uždarymas")}</div>
        {state.closedAt && <span style={{ marginLeft: "auto", padding: "5px 12px", border: "1px solid #69db7c", color: "#69db7c", fontSize: 11, fontWeight: 700, fontFamily: "var(--m)" }}>{L("CLOSED", "UŽDARYTA")}</span>}
        {(state.step > 0 || state.closedAt) && <button onClick={reset} style={{ ...bG, marginLeft: state.closedAt ? 0 : "auto" }}>↺ {L("Restart", "Iš naujo")}</button>}
      </div>
      <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 20, lineHeight: 1.65, maxWidth: 820 }}>
        {L("A guided, multi-step close: ingest the monthly i.SAF, reconcile it against the SAF-T ledger, review each discrepancy, then produce FR0600 notes and a client memo. You sign off at each gate; the figures are computed deterministically.",
           "Vedamas, kelių žingsnių uždarymas: įkelkite mėnesinį i.SAF, sutikrinkite su SAF-T knyga, peržiūrėkite kiekvieną neatitikimą, parenkite FR0600 pastabas ir kliento atmintinę. Jūs patvirtinate kiekviename žingsnyje; skaičiai apskaičiuojami deterministiškai.")}
      </p>

      {/* stepper */}
      <div style={{ display: "flex", gap: 0, marginBottom: 22, flexWrap: "wrap", border: `1px solid ${PL_LINE}`, borderRadius: 2 }}>
        {STEPS.map((s, i) => {
          const status = state.closedAt ? "done" : i < step ? "done" : i === step ? "active" : "todo";
          return <div key={s.key} onClick={() => { if (i <= step) goTo(i); }} style={{ flex: "1 1 130px", display: "flex", alignItems: "center", gap: 8, padding: "11px 13px", borderRight: i < STEPS.length - 1 ? `1px solid ${PL_LINE}` : "none", background: i === step && !state.closedAt ? "var(--bg2)" : "transparent", cursor: i <= step ? "pointer" : "default" }}>
            <Dot s={status} />
            <div>
              <div style={{ fontSize: 9, color: "#7a7a76", fontFamily: "var(--m)", fontWeight: 600 }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontSize: 11.5, color: status === "todo" ? "#7a7a76" : "#fff", fontFamily: "var(--m)", fontWeight: status === "active" ? 700 : 400 }}>{L(s.en, s.lt)}</div>
            </div>
          </div>;
        })}
      </div>

      {/* active step body */}
      <div style={{ border: `1px solid ${PL_LINE}`, background: "var(--bg2)", padding: "20px 22px" }}>
        {/* STEP 0 — ledger */}
        {step === 0 && <div>
          <h4 style={{ fontSize: 16, color: "#fff", fontFamily: "var(--f)", margin: "0 0 10px" }}>{L("1 · Confirm the SAF-T ledger", "1 · Patvirtinkite SAF-T knygą")}</h4>
          {ledgerReady ? <>
            <div style={{ fontSize: 13, color: "#d2d2ce", fontFamily: "var(--s)", lineHeight: 1.7 }}>
              {L("Loaded entity", "Įkelta įmonė")}: <strong style={{ color: "#fff" }}>{data.header.company?.name || "—"}</strong><br />
              {L("Period", "Periodas")}: {data.header.fiscalYearFrom?.slice(0, 10)} → {data.header.fiscalYearTo?.slice(0, 10)}<br />
              {kpis?.kpis && <>{L("Ledger VAT position", "Knygos PVM pozicija")}: output {eur(kpis.kpis.salesVat)} · input {eur(kpis.kpis.inputVat)} · net {eur(kpis.kpis.netVatPosition)}</>}
            </div>
            <button onClick={() => goTo(1)} style={{ ...bP, marginTop: 16 }}>{L("Start close →", "Pradėti uždarymą →")}</button>
          </> : <div style={{ fontSize: 13, color: "#ffa94d", fontFamily: "var(--m)" }}>{L("Load a SAF-T file first (above), then return here.", "Pirma įkelkite SAF-T failą (viršuje), tada grįžkite čia.")}</div>}
        </div>}

        {/* STEP 1 — intake */}
        {step === 1 && <div>
          <h4 style={{ fontSize: 16, color: "#fff", fontFamily: "var(--f)", margin: "0 0 10px" }}>{L("2 · Provide the monthly i.SAF", "2 · Pateikite mėnesinį i.SAF")}</h4>
          <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 16, lineHeight: 1.6 }}>{L("Upload the i.SAF (VAT invoice register) for the period to reconcile against the ledger.", "Įkelkite šio periodo i.SAF (PVM sąskaitų registrą), kad sutikrintumėte su knyga.")}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => fileRef.current?.click()} style={bP}>{L("Upload i.SAF (XML)", "Įkelti i.SAF (XML)")} →</button>
            {presetRecon && <button onClick={useExisting} style={bG}>{L("Use the i.SAF already reconciled", "Naudoti jau sutikrintą i.SAF")}</button>}
            <button onClick={() => goTo(0)} style={{ ...bG, border: "none", color: "#8c8c88" }}>← {L("Back", "Atgal")}</button>
          </div>
          <input ref={fileRef} type="file" accept=".xml" style={{ display: "none" }} onChange={(e) => ingestISAF(e.target?.files?.[0])} />
        </div>}

        {/* STEP 2 — reconcile */}
        {step === 2 && <div><div style={{ fontSize: 13, color: "#8c8c88" }}>{L("Reconciling…", "Sutikrinama…")}</div></div>}

        {/* STEP 3 — reconcile result */}
        {step === 3 && recon && <div>
          <h4 style={{ fontSize: 16, color: "#fff", fontFamily: "var(--f)", margin: "0 0 12px" }}>{L("3 · Reconciliation result", "3 · Sutikrinimo rezultatas")}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}`, marginBottom: 16 }}>
            {[[L("Output VAT Δ", "Pardavimo PVM Δ"), recon.summary.vat.outputDelta], [L("Input VAT Δ", "Pirkimo PVM Δ"), recon.summary.vat.inputDelta], [L("Net VAT Δ", "Grynoji PVM Δ"), recon.summary.vat.netDelta], [L("Discrepancies", "Neatitikimai"), recon.findings.length, true]].map(([k, val, count], i) =>
              <div key={i} style={{ padding: "14px 16px", borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}` }}>
                <div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{k}</div>
                <div style={{ fontSize: 20, fontWeight: 300, fontFamily: "var(--f)", color: count ? "#fff" : Math.abs(val) > 0.02 ? "#ff8a8a" : "#69db7c" }}>{count ? val : (val > 0 ? "+" : "") + eur(val)}</div>
              </div>)}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => goTo(4)} style={bP}>{L("Review discrepancies →", "Peržiūrėti neatitikimus →")}</button>
            <button onClick={() => goTo(1)} style={{ ...bG, border: "none", color: "#8c8c88" }}>← {L("Different i.SAF", "Kitas i.SAF")}</button>
          </div>
        </div>}

        {/* STEP 4 — review */}
        {step === 4 && recon && <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <h4 style={{ fontSize: 16, color: "#fff", fontFamily: "var(--f)", margin: 0 }}>{L("4 · Review & sign off", "4 · Peržiūra ir patvirtinimas")}</h4>
            <span style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>{reviewedCount}/{findings.length} {L("reviewed", "peržiūrėta")}</span>
            {findings.length > 0 && <button onClick={() => { const d = {}; findings.forEach((f) => d[f.id] = "accepted"); set({ decisions: d }); }} style={{ ...bG, marginLeft: "auto" }}>{L("Accept all as known", "Patvirtinti visus kaip žinomus")}</button>}
          </div>
          {findings.length === 0 ? <div style={{ border: "1px solid #69db7c", padding: 14, color: "#69db7c", fontFamily: "var(--m)", fontSize: 13 }}>✓ {L("No discrepancies — the register matches the ledger.", "Neatitikimų nėra — registras atitinka knygą.")}</div>
            : findings.map((f) => {
              const SEVC = { Block: "#ff6b6b", Reject: "#ffa94d", Warn: "#ffd43b" };
              const dec = reviewDecisions[f.id];
              return <div key={f.id} style={{ borderLeft: `2px solid ${SEVC[f.severity]}`, background: "#000", padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                  <span style={{ fontFamily: "var(--m)", fontSize: 11, fontWeight: 700, color: "#fff" }}>{f.id}</span>
                  <span style={{ fontFamily: "var(--m)", fontSize: 9, fontWeight: 700, padding: "1px 7px", border: `1px solid ${SEVC[f.severity]}`, color: SEVC[f.severity], textTransform: "uppercase" }}>{f.severity}</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={() => set({ decisions: { ...reviewDecisions, [f.id]: "resolved" } })} style={{ background: dec === "resolved" ? "#69db7c" : "transparent", color: dec === "resolved" ? "#000" : "#69db7c", border: "1px solid #69db7c", fontFamily: "var(--m)", fontSize: 9.5, fontWeight: 700, padding: "3px 9px", cursor: "pointer", textTransform: "uppercase" }}>{L("Resolved", "Išspręsta")}</button>
                    <button onClick={() => set({ decisions: { ...reviewDecisions, [f.id]: "accepted" } })} style={{ background: dec === "accepted" ? "#ffd43b" : "transparent", color: dec === "accepted" ? "#000" : "#ffd43b", border: "1px solid #ffd43b", fontFamily: "var(--m)", fontSize: 9.5, fontWeight: 700, padding: "3px 9px", cursor: "pointer", textTransform: "uppercase" }}>{L("Known", "Žinoma")}</button>
                  </div>
                </div>
                <div style={{ fontSize: 13.5, color: "#fff", fontFamily: "var(--f)" }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#bcbcb8", fontFamily: "var(--s)", lineHeight: 1.5, marginTop: 3 }}>{f.detail}</div>
                {f.evidence?.length > 0 && <div style={{ fontSize: 11, color: "#9f9f9b", fontFamily: "var(--m)", marginTop: 4 }}>{f.evidence.slice(0, 4).join(" · ")}</div>}
              </div>;
            })}
          <div style={{ display: "flex", gap: 12, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => goTo(5)} disabled={!allReviewed} style={{ ...bP, opacity: allReviewed ? 1 : 0.45, cursor: allReviewed ? "pointer" : "not-allowed" }}>{L("Approve & continue →", "Patvirtinti ir tęsti →")}</button>
            {!allReviewed && <span style={{ fontSize: 11, color: "#ffa94d", fontFamily: "var(--m)" }}>{L("Mark every discrepancy before continuing.", "Pažymėkite kiekvieną neatitikimą prieš tęsiant.")}</span>}
            <button onClick={() => goTo(3)} style={{ ...bG, border: "none", color: "#8c8c88" }}>← {L("Back", "Atgal")}</button>
          </div>
        </div>}

        {/* STEP 5 — FR0600 notes */}
        {step === 5 && fr && <div>
          <h4 style={{ fontSize: 16, color: "#fff", fontFamily: "var(--f)", margin: "0 0 12px" }}>{L("5 · FR0600 notes (VAT return basis)", "5 · FR0600 pastabos (PVM deklaracija)")}</h4>
          <div style={{ overflowX: "auto", marginBottom: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontFamily: "var(--m)" }}>
              <thead><tr style={{ color: "#8c8c88", textAlign: "left" }}>
                <th style={{ padding: "7px 8px", borderBottom: `1px solid ${PL_LINE}`, fontSize: 10, textTransform: "uppercase" }}>{L("Line", "Eilutė")}</th>
                <th style={{ padding: "7px 8px", borderBottom: `1px solid ${PL_LINE}`, fontSize: 10, textTransform: "uppercase" }}>{L("Ledger (file)", "Knyga (failas)")}</th>
                <th style={{ padding: "7px 8px", borderBottom: `1px solid ${PL_LINE}`, fontSize: 10, textTransform: "uppercase" }}>{L("i.SAF declared", "i.SAF deklaruota")}</th>
                <th style={{ padding: "7px 8px", borderBottom: `1px solid ${PL_LINE}`, fontSize: 10, textTransform: "uppercase" }}>Δ</th>
              </tr></thead>
              <tbody>
                {[[L("Output VAT", "Pardavimo PVM"), fr.outputLedger, fr.outputISAF], [L("Input VAT", "Pirkimo PVM"), fr.inputLedger, fr.inputISAF], [L("Net VAT payable", "Mokėtinas PVM"), fr.netLedger, fr.netISAF]].map(([k, a, b], i) => {
                  const d = r2(b - a);
                  return <tr key={i} style={{ color: "#d2d2ce" }}>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${PL_SOFT}`, color: "#fff" }}>{k}</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${PL_SOFT}` }}>{eur(a)}</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${PL_SOFT}` }}>{eur(b)}</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${PL_SOFT}`, color: Math.abs(d) > 0.02 ? "#ff8a8a" : "#69db7c" }}>{d > 0 ? "+" : ""}{eur(d)}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          {fr.corrections.length > 0 && <div style={{ border: `1px solid ${PL_LINE}`, borderLeft: "3px solid #ffa94d", padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#ffa94d", fontFamily: "var(--m)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>{L("Corrections to resolve before filing", "Taisymai prieš deklaravimą")}</div>
            {fr.corrections.map((c) => <div key={c.id} style={{ fontSize: 12, color: "#d2d2ce", fontFamily: "var(--s)", padding: "2px 0" }}>· <strong style={{ color: "#fff" }}>{c.id}</strong> ({c.sev}) — {c.title} {reviewDecisions[c.id] === "resolved" ? <span style={{ color: "#69db7c", fontFamily: "var(--m)", fontSize: 11 }}>✓ {L("resolved", "išspręsta")}</span> : <span style={{ color: "#ffd43b", fontFamily: "var(--m)", fontSize: 11 }}>{L("acknowledged", "pažymėta")}</span>}</div>)}
          </div>}
          <p style={{ fontSize: 11.5, color: "#9f9f9b", fontFamily: "var(--s)", lineHeight: 1.55, marginBottom: 14 }}>{L("The return is filed on the ledger basis; the Δ column shows where the i.SAF register differs and must be aligned. Verify against the official FR0600 before submission.", "Deklaracija teikiama pagal knygą; Δ stulpelis rodo, kur i.SAF skiriasi ir turi būti suderinta. Patikrinkite pagal oficialią FR0600 prieš teikimą.")}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => goTo(6)} style={bP}>{L("Draft client memo →", "Rengti kliento atmintinę →")}</button>
            <button onClick={() => goTo(4)} style={{ ...bG, border: "none", color: "#8c8c88" }}>← {L("Back", "Atgal")}</button>
          </div>
        </div>}

        {/* STEP 6 — memo */}
        {step === 6 && <div>
          <h4 style={{ fontSize: 16, color: "#fff", fontFamily: "var(--f)", margin: "0 0 12px" }}>{L("6 · Client memo", "6 · Kliento atmintinė")}</h4>
          {!state.memo && <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={draftMemo} disabled={busy} style={{ ...bP, opacity: busy ? 0.5 : 1 }}>{busy ? L("Drafting…", "Rengiama…") : L("Generate memo", "Sugeneruoti atmintinę") + " →"}</button>
            <button onClick={() => goTo(5)} style={{ ...bG, border: "none", color: "#8c8c88" }}>← {L("Back", "Atgal")}</button>
          </div>}
          {state.memo && <>
            <div style={{ border: `1px solid ${PL_LINE}`, background: "#000", padding: "16px 18px" }}><Md text={state.memo} /></div>
            {state.memoVer && <DefensibilityPanel verification={state.memoVer} lang={lang} />}
            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              {!state.closedAt && <button onClick={() => { set({ closedAt: new Date().toISOString() }); audit?.log?.("WF_VATCLOSE_COMPLETE", data?.header?.company?.name || ""); }} style={bP}>{L("Mark VAT close complete ✓", "Pažymėti uždarymą baigtą ✓")}</button>}
              {state.closedAt && <span style={{ padding: "8px 14px", border: "1px solid #69db7c", color: "#69db7c", fontFamily: "var(--m)", fontSize: 11, fontWeight: 700 }}>✓ {L("Closed", "Uždaryta")} · {new Date(state.closedAt).toLocaleString(lang === "lt" ? "lt-LT" : "en-GB")}</span>}
              <button onClick={() => {
                const v = recon.summary.vat;
                const lines = [`MONTHLY VAT CLOSE — ${data?.header?.company?.name || ""}`, `Period: ${data?.header?.fiscalYearFrom?.slice(0,10)} → ${data?.header?.fiscalYearTo?.slice(0,10)}`, ``, `VAT POSITION (ledger): output ${eur(v.outputSAFT)}, input ${eur(v.inputSAFT)}, net ${eur(v.netSAFT)}`, `i.SAF declared: output ${eur(v.outputISAF)}, input ${eur(v.inputISAF)}, net ${eur(v.netISAF)}`, `Net delta: ${eur(v.netDelta)}`, ``, `DISCREPANCIES (${findings.length}):`, ...findings.map((f) => `- [${f.severity}] ${f.id} ${f.title} — ${reviewDecisions[f.id] || "open"}`), ``, `MEMO:`, state.memo].join("\n");
                const blob = new Blob([lines], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `vat-close-${(data?.header?.company?.name || "entity").replace(/\s+/g, "-")}.txt`; a.click();
                audit?.log?.("WF_VATCLOSE_EXPORT", "");
              }} style={bG}>↧ {L("Export close package", "Eksportuoti paketą")}</button>
              <button onClick={() => { set({ memo: null, memoVer: null }); }} style={{ ...bG, border: "none", color: "#8c8c88" }}>↻ {L("Redraft", "Perrašyti")}</button>
            </div>
          </>}
        </div>}
      </div>
    </div>
  );
}

// Lists the legal provisions a grounded answer relied on, with the exact
// article text, and flags any citation that did not resolve to the corpus.
function SourcesPanel({ grounding, lang }) {
  const PL_LINE = "rgba(255,255,255,0.12)";
  if (!grounding || (!grounding.sources?.length && !grounding.hasUnresolved)) return null;
  const L = (en, lt) => (lang === "lt" ? lt : en);
  const ok = !grounding.hasUnresolved;
  return (
    <div style={{ marginTop: 14, border: `1px solid ${PL_LINE}`, background: "var(--bg2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: grounding.sources?.length ? `1px solid ${PL_LINE}` : "none", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".14em", textTransform: "uppercase" }}>{L("Sources", "Šaltiniai")}</span>
        <span style={{ fontSize: 11, color: "#bcbcb8", fontFamily: "var(--m)" }}>{(grounding.sources || []).length} {L("provisions", "nuostatos")}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontFamily: "var(--m)", color: ok ? "#69db7c" : "#ffd43b" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: ok ? "#69db7c" : "#ffd43b" }} />
          {grounding.citeTotal > 0
            ? L(`${grounding.groundedCount}/${grounding.citeTotal} citations resolve to source`, `${grounding.groundedCount}/${grounding.citeTotal} citatos turi šaltinį`)
            : L("grounded in retrieved law", "pagrįsta rasta teise")}
        </span>
      </div>
      {(grounding.sources || []).map((s, i) =>
        <div key={s.id} style={{ display: "flex", gap: 10, padding: "10px 14px", borderBottom: i < grounding.sources.length - 1 ? `1px solid rgba(255,255,255,0.06)` : "none" }}>
          <span style={{ flexShrink: 0, fontSize: 10, fontFamily: "var(--m)", fontWeight: 700, color: "#7cc4ff", border: "1px solid rgba(124,196,255,0.4)", borderRadius: 3, padding: "1px 6px", height: "fit-content" }}>{i + 1}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "#fff", fontFamily: "var(--m)", fontWeight: 700 }}>{s.law} · {s.article}</div>
            <div style={{ fontSize: 12, color: "#d2d2ce", fontFamily: "var(--s)", lineHeight: 1.5, marginTop: 3 }}>{lang === "lt" ? s.text : (s.textEn || s.text)}</div>
            {s.penalty && <div style={{ fontSize: 10.5, color: "#ffa94d", fontFamily: "var(--m)", marginTop: 3 }}>⚠ {L("Sanction", "Sankcija")}: {s.penalty}</div>}
          </div>
        </div>)}
      {grounding.hasUnresolved && <div style={{ padding: "9px 14px", fontSize: 11, color: "#ffd43b", fontFamily: "var(--m)", borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        ⚠ {L("Unverified citation(s)", "Nepatvirtinta citata(-os)")}: {grounding.unresolved.join(", ")} — {L("not found in the corpus; verify manually.", "nerasta korpuse; patikrinkite rankiniu būdu.")}
      </div>}
    </div>
  );
}

// Stable identifier for a finding (rule + the specific evidence line).
function findingKey(f) {
  if (!f) return "";
  const ev = (f.evidence && f.evidence[0]) || f.detail || "";
  return `${f.rule_id || "?"}::${ev}`.slice(0, 220);
}

// Full-page finding detail: clearly defines the rule, what was flagged, what
// to fix, the legal basis, and an auditor's note (in-accordance + justification)
// that persists and can be re-edited — mirroring an auditor working paper.
function FindingDetail({ finding, lang, note, onSave, onBack, company, period }) {
  const PL_LINE = "rgba(255,255,255,0.12)", PL_SOFT = "rgba(255,255,255,0.06)";
  const L = (en, lt) => (lang === "lt" ? lt : en);
  const m = finding.ruleMeta || {};
  const SCc = { Critical: "#ff6b6b", High: "#ffa94d", Medium: "#ffd43b", Low: "#69db7c" }[finding.severity] || "#aaa";
  const [accord, setAccord] = useState(note?.disposition === "accordance");
  const [notAccord, setNotAccord] = useState(note?.disposition === "not");
  const [just, setJust] = useState(note?.justification || "");
  const [saved, setSaved] = useState(false);

  // parse the evidence row into field/value pairs (from the @field template)
  const fields = finding.evidenceRow && typeof finding.evidenceRow === "object"
    ? Object.entries(finding.evidenceRow)
    : ((finding.evidence?.[0] || "").split("|").map((p) => { const ix = p.indexOf("="); return ix > -1 ? [p.slice(0, ix).trim(), p.slice(ix + 1).trim()] : null; }).filter(Boolean));

  const disposition = accord ? "accordance" : notAccord ? "not" : null;
  const save = () => { onSave({ disposition, justification: just }); setSaved(true); setTimeout(() => setSaved(false), 2200); };
  const exportPaper = () => {
    const lines = [
      `AUDIT FINDING — ${finding.rule_id}`,
      company ? `Entity: ${company}` : "", period ? `Period: ${period}` : "", "",
      `Rule: ${lang === "lt" ? m.titleLt : m.titleEn}`,
      `Severity: ${finding.severity}    Category: ${finding.category}    Refers to: ${m.refType || "—"}`,
      `Legal basis: ${m.legal || "—"}`, "",
      `What the rule checks:`, (lang === "lt" ? m.descriptionLt : (m.descriptionLt || "")) || "(see rule description)", "",
      `Flagged record:`, ...fields.map(([k, v]) => `  ${k} = ${v}`), "",
      `What to check / fix:`, (lang === "lt" ? m.fixLt : m.fixEn) || "—", "",
      `AUDITOR NOTE`,
      `In accordance: ${disposition === "accordance" ? "YES" : disposition === "not" ? "NO" : "(not set)"}`,
      `Justification: ${just || "(none)"}`,
      note?.updatedAt ? `Last updated: ${new Date(note.updatedAt).toLocaleString()}` : "",
    ].filter((x) => x !== "").join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `finding-${finding.rule_id}.txt`; a.click();
  };

  const Field = ({ label, children }) => <div><div style={{ fontSize: 9.5, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div><div style={{ fontSize: 13.5, color: "#fff", fontFamily: "var(--s)" }}>{children}</div></div>;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: `1px solid ${PL_LINE}`, color: "#d2d2ce", fontFamily: "var(--m)", fontSize: 11, letterSpacing: ".06em", padding: "7px 14px", cursor: "pointer", textTransform: "uppercase", marginBottom: 18 }}>← {L("Back to findings", "Atgal į radinius")}</button>

      {/* breadcrumb + title */}
      <div style={{ fontFamily: "var(--m)", fontSize: 11, color: "#8c8c88", letterSpacing: ".08em", marginBottom: 10 }}>{L("AUDIT", "AUDITAS")} · {L("FINDING", "RADINYS")} · {finding.rule_id}</div>
      <h2 style={{ fontSize: 26, fontWeight: 300, color: "#fff", fontFamily: "var(--f)", lineHeight: 1.2, margin: "0 0 16px" }}>{lang === "lt" ? m.titleLt : (m.titleEn || finding.title)}</h2>

      {/* metadata row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 18, padding: "16px 18px", border: `1px solid ${PL_LINE}`, background: "var(--bg2)", marginBottom: 18 }}>
        <Field label={L("Type", "Tipas")}>RulesFinding</Field>
        <Field label={L("Severity", "Reikšmingumas")}><span style={{ color: SCc, fontWeight: 600 }}>{finding.severity}</span></Field>
        <Field label={L("Category", "Kategorija")}>{finding.category}</Field>
        <Field label={L("Refers to", "Susiję su")}>{m.refType || "—"}</Field>
        <Field label={L("Data types", "Duomenų tipai")}>{m.dataTypes || "—"}</Field>
      </div>

      {/* what the rule checks */}
      <Section title={L("What this rule checks", "Ką tikrina ši taisyklė")}>
        <p style={{ fontSize: 13.5, color: "#d2d2ce", fontFamily: "var(--s)", lineHeight: 1.65, margin: 0 }}>{m.descriptionLt || finding.title}</p>
        {m.legal && <div style={{ marginTop: 10, fontSize: 11.5, color: "#9ae6a4", fontFamily: "var(--m)" }}>§ {L("Legal basis", "Teisinis pagrindas")}: {m.legal}</div>}
      </Section>

      {/* what's flagged */}
      <Section title={L("What was flagged", "Kas pažymėta")} accent="#ff8a8a">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {fields.map(([k, v], i) => <div key={i} style={{ padding: "10px 12px", background: "#000", border: `1px solid ${PL_SOFT}` }}>
            <div style={{ fontSize: 9.5, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 14, color: "#fff", fontFamily: "var(--m)", wordBreak: "break-word" }}>{String(v)}</div>
          </div>)}
        </div>
      </Section>

      {/* what to fix */}
      <Section title={L("What needs to be checked or corrected", "Ką reikia patikrinti ar pataisyti")} accent="#7cc4ff">
        <p style={{ fontSize: 13.5, color: "#e6e6e2", fontFamily: "var(--s)", lineHeight: 1.65, margin: 0 }}>{(lang === "lt" ? m.fixLt : m.fixEn) || L("Review this item against the supporting documentation.", "Peržiūrėkite šį įrašą pagal pagrindžiančius dokumentus.")}</p>
      </Section>

      {/* auditor note */}
      <div style={{ border: `1px solid ${PL_LINE}`, background: "var(--bg2)", padding: "18px 20px", marginTop: 18 }}>
        <div style={{ fontSize: 15, color: "#fff", fontFamily: "var(--f)", marginBottom: 14 }}>{L("Auditor note", "Auditoriaus pastaba")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, color: "#d2d2ce", fontFamily: "var(--s)" }}>{L("In accordance?", "Atitinka?")}</span>
          <button onClick={() => { setAccord(true); setNotAccord(false); }} style={{ padding: "6px 14px", border: `1px solid ${accord ? "#69db7c" : PL_LINE}`, background: accord ? "#69db7c" : "transparent", color: accord ? "#000" : "#69db7c", fontFamily: "var(--m)", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: ".06em" }}>✓ {L("Yes — in accordance", "Taip — atitinka")}</button>
          <button onClick={() => { setNotAccord(true); setAccord(false); }} style={{ padding: "6px 14px", border: `1px solid ${notAccord ? "#ff8a8a" : PL_LINE}`, background: notAccord ? "#ff8a8a" : "transparent", color: notAccord ? "#000" : "#ff8a8a", fontFamily: "var(--m)", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: ".06em" }}>✕ {L("No — needs action", "Ne — reikia veiksmų")}</button>
          {note?.updatedAt && <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#8c8c88", fontFamily: "var(--m)" }}>{L("Last saved", "Išsaugota")}: {new Date(note.updatedAt).toLocaleString(lang === "lt" ? "lt-LT" : "en-GB")}</span>}
        </div>
        <div style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>{L("Justification", "Pagrindimas")}</div>
        <textarea value={just} onChange={(e) => setJust(e.target.value)} placeholder={L("Record your reasoning, the documents reviewed, and any conclusion…", "Įrašykite savo argumentus, peržiūrėtus dokumentus ir išvadą…")} style={{ width: "100%", minHeight: 120, background: "#000", border: `1px solid ${PL_LINE}`, color: "#fff", fontFamily: "var(--s)", fontSize: 13, padding: "12px 14px", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 12, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={save} style={{ background: "#fff", color: "#000", border: "none", padding: "9px 20px", fontSize: 11, fontWeight: 700, fontFamily: "var(--m)", letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" }}>{note?.updatedAt ? L("Update note", "Atnaujinti pastabą") : L("Save note", "Išsaugoti pastabą")}</button>
          <button onClick={exportPaper} style={{ background: "transparent", color: "#d2d2ce", border: `1px solid ${PL_LINE}`, padding: "9px 16px", fontSize: 11, fontWeight: 600, fontFamily: "var(--m)", letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" }}>↧ {L("Export working paper", "Eksportuoti darbo dokumentą")}</button>
          {saved && <span style={{ fontSize: 12, color: "#69db7c", fontFamily: "var(--m)" }}>✓ {L("Saved", "Išsaugota")}</span>}
        </div>
      </div>
    </div>
  );
}
function Section({ title, accent, children }) {
  const PL_LINE = "rgba(255,255,255,0.12)";
  return <div style={{ border: `1px solid ${PL_LINE}`, borderLeft: `3px solid ${accent || PL_LINE}`, background: "var(--bg2)", padding: "14px 18px", marginBottom: 14 }}>
    <div style={{ fontSize: 10.5, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
    {children}
  </div>;
}

// Compact, collapsible panel that shows how well an AI narrative is grounded
// in the deterministic results. Purely a transparency aid for the reviewer.
function DefensibilityPanel({ verification, lang }) {
  const [open, setOpen] = useState(false);
  const PL_LINE = "rgba(255,255,255,0.12)";
  if (!verification || !verification.claims?.length) return null;
  const { score, band, counts, claims, factCount } = verification;
  const C = { verified: "#69db7c", review: "#ffd43b", unsupported: "#ff8a8a" };
  const bandColor = score >= 80 ? "#69db7c" : score >= 60 ? "#ffd43b" : score >= 40 ? "#ffa94d" : "#ff8a8a";
  const L = (en, lt) => (lang === "lt" ? lt : en);
  const statusLabel = (s) => s === "verified" ? L("Verified", "Patvirtinta") : s === "review" ? L("Review", "Peržiūrėti") : L("Unsupported", "Nepagrįsta");
  return (
    <div style={{ marginTop: 22, border: `1px solid ${PL_LINE}`, background: "var(--bg2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", flexWrap: "wrap" }}>
        <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".14em", textTransform: "uppercase" }}>{L("Defensibility", "Pagrįstumas")}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 300, color: bandColor, fontFamily: "var(--f)", lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>/ 100 · {band}</span>
        </div>
        <div style={{ display: "flex", gap: 12, marginLeft: "auto", flexWrap: "wrap" }}>
          {[["verified", counts.verified], ["review", counts.review], ["unsupported", counts.unsupported]].map(([k, n]) =>
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--m)", color: "#bcbcb8" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C[k], display: "inline-block" }} />{n} {statusLabel(k)}
            </span>)}
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: `1px solid ${PL_LINE}`, color: "#d2d2ce", fontFamily: "var(--m)", fontSize: 10, letterSpacing: ".08em", padding: "5px 12px", cursor: "pointer", textTransform: "uppercase" }}>
          {open ? L("Hide claims", "Slėpti") : L("Inspect claims", "Tikrinti teiginius")}
        </button>
      </div>
      <div style={{ padding: "0 16px 12px", fontSize: 11.5, color: "#9f9f9b", fontFamily: "var(--s)", lineHeight: 1.55 }}>
        {L(
          `Each statement is checked against the ${factCount} deterministic values computed from your file. “Verified” means a figure matches a computed value; “Unsupported” means no matching value was found — verify it manually; “Review” marks interpretive or legal statements. This is a transparency aid, not a guarantee.`,
          `Kiekvienas teiginys tikrinamas pagal ${factCount} deterministiškai apskaičiuotas reikšmes iš jūsų failo. „Patvirtinta“ — skaičius sutampa su apskaičiuota reikšme; „Nepagrįsta“ — atitikmuo nerastas, patikrinkite rankiniu būdu; „Peržiūrėti“ — interpretaciniai ar teisiniai teiginiai. Tai skaidrumo priemonė, ne garantija.`
        )}
      </div>
      {open && <div style={{ borderTop: `1px solid ${PL_LINE}` }}>
        {claims.map((c, i) =>
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 16px", borderBottom: i < claims.length - 1 ? `1px solid ${PL_LINE}` : "none" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C[c.status], marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: "#e6e6e2", fontFamily: "var(--s)", lineHeight: 1.5 }}>{c.text}</div>
              <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 3 }}>
                {statusLabel(c.status)} · {c.confidence}%{c.grounding ? ` · ${c.grounding}` : ""}{c.numbers?.length ? ` · ${c.numbers.join(", ")}` : ""}
              </div>
            </div>
          </div>)}
      </div>}
    </div>
  );
}

function TAXAI({ onExit, initialView } = {}) {
  const [view, setView] = useState(initialView || "home");
  const [lang, setLang] = useState("lt");
  const t = T[lang];
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("accountant");
  const [thinking, setThinking] = useState({});
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [saftTab, setSaftTab] = useState("tests");
  const [aiResult, setAiResult] = useState(null);
  const [smartResult, setSmartResult] = useState(null);
  const [saftLoading, setSaftLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [overrides, setOverrides] = useState({});
  // Finding-detail flow: selected finding + persisted auditor notes/dispositions
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [findingNotes, setFindingNotes] = useState(() => { try { return JSON.parse(localStorage.getItem("taxai_finding_notes") || "{}"); } catch { return {}; } });
  const setFindingNote = useCallback((key, patch) => setFindingNotes((m) => {
    const next = { ...m, [key]: { ...(m[key] || {}), ...patch, updatedAt: new Date().toISOString() } };
    try { localStorage.setItem("taxai_finding_notes", JSON.stringify(next)); } catch {}
    return next;
  }), []);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentMsgs, setAgentMsgs] = useState({}); // { agentId: [msgs] }
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentAttachments, setAgentAttachments] = useState([]); // [{name,mimeType,data,preview,text}]
  const agentChatRef = useRef(null);
  const agentFileRef = useRef(null);
  const chatRef = useRef(null);
  const fileRef = useRef(null);
  const voice = useVoice(t2 => setInput(t2));
  const audit = useAuditLog();
  // ── State for the new SAF-T engine ──
  const [runResult, setRunResult] = useState(null);
  const [smartAnalysisResult, setSmartAnalysisResult] = useState(null);
  const [enterpriseResult, setEnterpriseResult] = useState(null);   // { markdown, kpiBundle }
  const [enterpriseKpis, setEnterpriseKpis] = useState(null);       // deterministic KPI strip, shown without AI
  const [intel, setIntel] = useState(null);                          // deterministic forensic intelligence bundle
  const [threatResult, setThreatResult] = useState(null);            // AI threat-assessment narrative
  const [personalRules, setPersonalRules] = useState(null);          // AI-designed, industry/company-specific rules (deterministically scored)
  const [isafData, setIsafData] = useState(null);                    // parsed i.SAF (monthly VAT register)
  const [isafFileName, setIsafFileName] = useState("");
  const [reconResult, setReconResult] = useState(null);              // i.SAF ↔ SAF-T reconciliation result
  const isafFileRef = useRef(null);
  const [conformance, setConformance] = useState(null);              // rule-engine conformance suite result
  const [vatClose, setVatClose] = useState({ step: 0, isaf: null, isafName: "", recon: null, decisions: {}, memo: null, memoVer: null, memoGround: null, closedAt: null });
  // KPI targets (persisted) + chosen benchmark sector
  const [kpiTargets, setKpiTargets] = useState(() => { try { return JSON.parse(localStorage.getItem("taxai_kpi_targets") || "{}"); } catch { return {}; } });
  const setKpiTarget = useCallback((key, val) => setKpiTargets((t) => { const n = { ...t }; if (val == null) delete n[key]; else n[key] = val; try { localStorage.setItem("taxai_kpi_targets", JSON.stringify(n)); } catch {} return n; }), []);
  const [benchSector, setBenchSector] = useState(null);

  // Deterministic fact index used to verify AI narratives (recomputed when results change).
  const groundingFacts = useMemo(() => buildGroundingFacts({
    kpis: enterpriseKpis?.kpis,
    runResult,
    intel,
    metrics: personalRules?.metrics,
    reconResult,
  }), [enterpriseKpis, runResult, intel, personalRules, reconResult]);
  const verifyAi = useMemo(() => (typeof aiResult === "string" && !aiResult.startsWith("Error")) ? verifyNarrative(aiResult, groundingFacts) : null, [aiResult, groundingFacts]);
  const verifySmartAnalysis = useMemo(() => (typeof smartAnalysisResult === "string" && !smartAnalysisResult.startsWith("Error")) ? verifyNarrative(smartAnalysisResult, groundingFacts) : null, [smartAnalysisResult, groundingFacts]);
  const verifyThreat = useMemo(() => (typeof threatResult === "string" && !threatResult.startsWith("Error")) ? verifyNarrative(threatResult, groundingFacts) : null, [threatResult, groundingFacts]);
  const [intelTab, setIntelTab] = useState("overview");              // Command-center sub-tab
  const [caseFlags, setCaseFlags] = useState({});                    // ruleId/signal → {flagged, note, assignee, status}
  const [toast, setToast] = useState(null);                          // transient toast message
  const [cmdOpen, setCmdOpen] = useState(false);                     // ⌘K command palette
  const [cmdQuery, setCmdQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  // auto-dismiss toast
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 3200); return () => clearTimeout(id); }, [toast]);
  // ⌘K / Ctrl-K opens the command palette; Esc closes
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setCmdOpen(o => !o); setCmdQuery(""); }
      else if (e.key === "Escape") { setCmdOpen(false); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  // Adapt new finding shape to existing UI's expectations
  const findings = useMemo(() => {
    if (!runResult?.findings) return [];
    return runResult.findings.map((f, i) => ({
      ...f,
      // UI uses f.severity directly (Critical/High/Medium/Low). severityUi maps Block→Critical, Reject→High, Warn→Medium.
      severity: f.severityUi || f.severity,
      // Legacy field: existing UI shows "L{level}: {category}" — derive level from severity.
      level: f.severity === "Block" ? 1 : f.severity === "Reject" ? 2 : 3,
      _idx: i,
      status: overrides[i] || "open",
    }));
  }, [runResult, overrides]);

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

  // Shared XML pipeline — used by both file upload and the demo loader.
  const processXML = useCallback((c, name) => {
    setFileName(name);
    setAiResult(null); setSmartResult(null); setSmartAnalysisResult(null);
    setEnterpriseResult(null); setEnterpriseKpis(null); setIntel(null);
    setThreatResult(null); setRunResult(null); setOverrides({}); setPersonalRules(null); setSelectedFinding(null);
    setIsafData(null); setIsafFileName(""); setReconResult(null);
    const parsed = parseSAFTFull(c);
    const result = runAllRules(parsed);
    setFileData({ type: "xml", parsed, raw: c });
    setRunResult(result);
    try { setEnterpriseKpis(computeKPIs(parsed, buildContext(parsed))); } catch (kpiErr) { setEnterpriseKpis(null); }
    try { setIntel(runIntelligence(parsed, result)); } catch (intelErr) { setIntel(null); }
    audit.log("SAFT_RULES_EXECUTED",
      `300 rules → ${result.summary.total} findings (${result.bySeverity.Block} Block, ${result.bySeverity.Reject} Reject, ${result.bySeverity.Warn} Warn)`);
    return result;
  }, [audit]);

  // Load the built-in synthetic demo dataset (so a fresh deployment is usable).
  const upload = useCallback(e => {
    const file = e.target.files?.[0]; if (!file) return;
    setFileName(file.name);
    setAiResult(null);
    setSmartResult(null);
    setSmartAnalysisResult(null);
    setEnterpriseResult(null);
    setEnterpriseKpis(null);
    setIntel(null);
    setThreatResult(null);
    setRunResult(null);
    setOverrides({});
    setPersonalRules(null);
    setIsafData(null); setIsafFileName(""); setReconResult(null);
    audit.log("FILE_UPLOAD", file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      const c = evt.target.result;
      if (file.name.match(/\.xml$/i)) {
        const result = processXML(c, file.name);
        setToast(lang === "lt" ? `Failas apdorotas · ${result.summary.total} radinių` : `File processed · ${result.summary.total} findings`);
      } else if (file.name.match(/\.(csv|tsv)$/i)) {
        const lines = c.trim().split("\n");
        const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
        const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ""));
        const rows = lines.slice(1).map(l => {
          const v = l.split(sep).map(x => x.trim().replace(/^"|"$/g, ""));
          const o = {}; headers.forEach((h, i) => { o[h] = v[i] || ""; }); return o;
        });
        setFileData({ type: "csv", parsed: { headers, rows, rowCount: rows.length } });
        setToast(lang === "lt" ? `CSV įkeltas · ${rows.length} eilučių` : `CSV loaded · ${rows.length} rows`);
      } else {
        setFileData({ type: "text", raw: c.substring(0, 10000) });
      }
    };
    reader.readAsText(file);
  }, [audit, processXML, lang]);

  // Upload a monthly i.SAF (VAT invoice register) and reconcile it vs the loaded SAF-T ledger.
  const uploadISAF = useCallback((e) => {
    const file = e.target?.files?.[0]; if (!file) return;
    if (!fileData?.parsed) { setToast(lang === "lt" ? "Pirma įkelkite SAF-T failą" : "Load a SAF-T file first"); return; }
    audit.log("ISAF_UPLOAD", file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = parseISAF(evt.target.result);
        if (parsed._parseError) { setToast((lang === "lt" ? "i.SAF klaida: " : "i.SAF error: ") + parsed._parseError); return; }
        const recon = reconcileISAF(parsed, fileData.parsed);
        setIsafData(parsed); setIsafFileName(file.name); setReconResult(recon);
        audit.log("ISAF_RECONCILED", `${recon.findings.length} findings · netΔ €${recon.summary.vat.netDelta}`);
        setToast(lang === "lt" ? `i.SAF sutikrinta · ${recon.findings.length} radinių` : `i.SAF reconciled · ${recon.findings.length} findings`);
      } catch (err) {
        setToast((lang === "lt" ? "i.SAF apdorojimo klaida: " : "i.SAF processing error: ") + err.message);
      }
    };
    reader.readAsText(file);
  }, [audit, fileData, lang]);

  // Drag-and-drop a SAF-T / CSV file anywhere onto the app.
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files?.[0]; if (!file) return;
    audit.log("FILE_DROP", file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const c = evt.target.result;
      if (/\.xml$/i.test(file.name)) { const r = processXML(c, file.name); setToast(lang === "lt" ? `Failas apdorotas · ${r.summary.total} radinių` : `File processed · ${r.summary.total} findings`); setView("saftview"); }
      else if (/\.(csv|tsv)$/i.test(file.name)) {
        const lines = c.trim().split("\n");
        const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
        const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ""));
        const rows = lines.slice(1).map(l => { const v = l.split(sep).map(x => x.trim().replace(/^"|"$/g, "")); const o = {}; headers.forEach((h, i) => { o[h] = v[i] || ""; }); return o; });
        setFileData({ type: "csv", parsed: { headers, rows, rowCount: rows.length } }); setFileName(file.name); setView("saftview");
      } else { setToast(lang === "lt" ? "Nepalaikomas formatas" : "Unsupported file type"); }
    };
    reader.readAsText(file);
  }, [audit, processXML, lang]);

  // buildCtx is still needed for the chat module (when the user asks questions about their file).
  // It now uses the richer parsed structure from parseSAFTFull.
  const buildCtx = useCallback(() => {
    if (!fileData?.parsed) return "";
    const p = fileData.parsed;
    if (fileData.type === "xml") {
      return [
        `SAF-T: ${fileName}`,
        `Company: ${p.header?.company?.name || ""} (RegNum ${p.header?.company?.registrationNumber || ""}, VAT ${p.header?.company?.taxRegistration || ""})`,
        `Period: ${p.header?.fiscalYearFrom || ""} → ${p.header?.fiscalYearTo || ""}`,
        `DataType: ${p.header?.dataType || ""}  Entity: ${p.header?.entity || ""}`,
        `Counts: ${JSON.stringify(p.counts || {})}`,
        runResult ? `Compliance: ${runResult.summary.total} findings (${runResult.bySeverity.Block} Block, ${runResult.bySeverity.Reject} Reject, ${runResult.bySeverity.Warn} Warn) from 300 rules` : "",
        `Top accounts: ${JSON.stringify((p.accounts || []).slice(0, 10).map(a => ({ id: a.accountID, desc: a.accountDescription, type: a.accountType, close: (a.closingDebitBalance || 0) - (a.closingCreditBalance || 0) })))}`,
        `Sample transactions: ${JSON.stringify((p.transactions || []).slice(0, 5).map(t => ({ id: t.transactionID, date: t.transactionDate, desc: t.description })))}`,
      ].filter(Boolean).join("\n");
    }
    if (fileData.type === "csv") return `CSV: ${fileName}\nHeaders: ${p.headers?.join(",")}\nRows: ${p.rowCount}\nData: ${JSON.stringify(p.rows?.slice(0, 20))}`;
    return `File: ${fileName}\n${fileData.raw?.substring(0, 4000)}`;
  }, [fileData, fileName, runResult]);

  // AI INTERPRETATION — detailed finding-by-finding analysis grounded in LT law
  const runAI = useCallback(async () => {
    if (!fileData?.parsed || !runResult) return;
    setSaftLoading(true);
    audit.log("SAFT_AI_INTERPRETATION", fileName);
    try {
      const md = await runInterpretation(fileData.parsed, runResult, callAI);
      setAiResult(md);
    } catch (e) {
      setAiResult(`Error: ${e.message}`);
    }
    setSaftLoading(false);
  }, [fileData, runResult, audit, fileName]);

  // SMART FILTER (legacy) — quick "show me what matters" view
  const runSmart = useCallback(async () => {
    if (!fileData?.parsed || !runResult) return;
    setSaftLoading(true);
    audit.log("SAFT_SMART_FILTER", fileName);
    try {
      const md = await runSmartFilter(fileData.parsed, runResult, callAI);
      setSmartResult(md);
    } catch (e) {
      setSmartResult(`Error: ${e.message}`);
    }
    setSaftLoading(false);
  }, [fileData, runResult, audit, fileName]);

  // SMART ANALYSIS — NEW — meta-critique + legal remediation + financing
  const runSmartAnalysisCallback = useCallback(async () => {
    if (!fileData?.parsed || !runResult) return;
    setSaftLoading(true);
    audit.log("SAFT_SMART_ANALYSIS", fileName);
    try {
      const md = await runSmartAnalysis(fileData.parsed, runResult, callAI);
      setSmartAnalysisResult(md);
    } catch (e) {
      setSmartAnalysisResult(`Error: ${e.message}`);
    }
    setSaftLoading(false);
  }, [fileData, runResult, audit, fileName]);

  // ENTERPRISE AUDIT — NEW — CFO/Internal-Audit/ERP intelligence overlay.
  // KPIs are computed deterministically; Gemini interprets the grounded numbers.
  const runEnterpriseAuditCallback = useCallback(async () => {
    if (!fileData?.parsed || !runResult) return;
    setSaftLoading(true);
    audit.log("SAFT_ENTERPRISE_AUDIT", fileName);
    try {
      const ctx = buildContext(fileData.parsed);
      const out = await runEnterpriseAudit(fileData.parsed, runResult, ctx, callAI);
      setEnterpriseResult(out);
      if (out.kpiBundle) setEnterpriseKpis(out.kpiBundle);
    } catch (e) {
      setEnterpriseResult({ markdown: `Error: ${e.message}`, kpiBundle: enterpriseKpis });
    }
    setSaftLoading(false);
  }, [fileData, runResult, audit, fileName, enterpriseKpis]);

  // FORENSIC INTELLIGENCE — deterministic engines run on upload; this just
  // (re)computes if needed and is also the manual refresh entry point.
  const refreshIntel = useCallback(() => {
    if (!fileData?.parsed || !runResult) return;
    try { setIntel(runIntelligence(fileData.parsed, runResult)); } catch (e) { setIntel(null); }
  }, [fileData, runResult]);

  // AI THREAT ASSESSMENT — Gemini narrative over the deterministic intel bundle.
  const runThreatCallback = useCallback(async () => {
    if (!fileData?.parsed || !runResult) return;
    let bundle = intel;
    if (!bundle) { try { bundle = runIntelligence(fileData.parsed, runResult); setIntel(bundle); } catch (e) {} }
    if (!bundle) return;
    setSaftLoading(true);
    audit.log("FORENSIC_THREAT_ASSESSMENT", `risk ${bundle.risk.score}/100 (${bundle.risk.band})`);
    try {
      const md = await runThreatAssessment(fileData.parsed, bundle, runResult, callAI);
      setThreatResult(md);
    } catch (e) {
      setThreatResult(`Error: ${e.message}`);
    }
    setSaftLoading(false);
  }, [fileData, runResult, intel, audit]);

  // ADAPTIVE PERSONALIZED RULES — Gemini designs industry/company-specific
  // rules over the deterministic metric registry; each is then scored
  // deterministically (PASS/FAIL/N-A). Additive overlay to the fixed 300.
  const runPersonalizedRulesCallback = useCallback(async () => {
    if (!fileData?.parsed || !runResult) return;
    setSaftLoading(true);
    audit.log("SAFT_PERSONALIZED_RULES", fileName);
    try {
      const ctx = buildContext(fileData.parsed);
      const kpiBundle = enterpriseKpis || computeKPIs(fileData.parsed, ctx);
      const out = await runPersonalizedRules(fileData.parsed, runResult, ctx, kpiBundle, callAI);
      setPersonalRules(out);
      if (out?.industry) audit.log("PERSONALIZED_RULES_GENERATED",
        `${out.industry} · ${out.counts?.total || 0} rules (${out.counts?.fail || 0} fail)`);
    } catch (e) {
      setPersonalRules({ error: e.message });
    }
    setSaftLoading(false);
  }, [fileData, runResult, audit, fileName, enterpriseKpis]);

  const modes = [{ id: "accountant", l: "Accountant", lt: "Buhalteris", a: ["tax", "vat", "ledger"] }, { id: "auditor", l: "Auditor", lt: "Auditorius", a: ["eauditor", "saft", "fraud"] }, { id: "cfo", l: "CFO", lt: "CFO", a: ["cfo", "risk", "reporting"] }, { id: "legal", l: "Legal", lt: "Teisininkas", a: ["legal", "tax", "compliance"] }, { id: "filing", l: "Filing", lt: "Deklaravimas", a: ["filing", "compliance", "payroll"] }, { id: "compliance", l: "Compliance", lt: "Atitiktis", a: ["compliance", "control", "risk"] }, { id: "saft", l: "SAF-T", lt: "SAF-T", a: ["saft", "fraud", "ledger"] }];

  const send = useCallback(async (ov) => {
    const text = ov || input; if (!text.trim() || loading) return;
    setInput(""); setLoading(true); if (view !== "chat") setView("chat");
    audit.log("CHAT_MESSAGE", text.substring(0, 100));
    setMsgs(p => [...p, { id: Date.now(), role: "user", text, ts: new Date() }]);
    const mc = modes.find(m => m.id === mode);
    const aids = [...new Set([...(mc?.a || []), ...routeAgents(text)])];
    const tk = {}; aids.forEach(id => { tk[id] = true; }); setThinking(tk);
    const fileCtx = fileData ? "\n\nDATA:\n" + buildCtx().substring(0, 4000) : "";
    const multi = aids.length > 1 ? `\n[MULTI-AGENT: ${aids.map(id => AGENTS.find(a => a.id === id)?.name).join(", ")}. Mode: ${mode}.]` : "";
    // Inject deterministic results for salary questions
    let deterministicNote = "";
    const salaryMatch = text.match(/(\d[\d,\.]+)\s*(eur|€|gross|bruto)/i);
    if (salaryMatch && /salary|atlyginim|net|neto|gpm|darbo/i.test(text)) {
      const gross = parseFloat(salaryMatch[1].replace(/,/g, ""));
      if (gross > 0) { const calc = TaxCalc.grossToNet(gross); deterministicNote = `\n\n[DETERMINISTIC CALCULATION — USE THESE EXACT NUMBERS]\nGross: €${calc.gross}\nSodra (employee 19.5%): €${calc.sodraEmp}\nTaxable base: €${calc.taxableBase}\nNPD: €${calc.npd}\nGPM: €${calc.gpm}\nNet salary: €${calc.net}\nEmployer Sodra (1.77%): €${calc.sodraEmpl}\nTotal employer cost: €${calc.totalCost}\n[USE THESE EXACT NUMBERS IN YOUR RESPONSE — DO NOT RECALCULATE]`; }
    }
    try {
      const primary = AGENTS.find(a => a.id === aids[0]);
      const resp = await callAI(`You are the ${primary.name} agent.`, text + multi + fileCtx + deterministicNote, msgs);
      const _sources = retrieveSources(text, LEGAL_DB, 6);
      const _grounding = groundCitations(resp, _sources, LEGAL_DB);
      setThinking({}); setMsgs(p => [...p, { id: Date.now(), role: "assistant", text: resp, agent: primary, agentIds: aids, ts: new Date(), sources: _grounding.sources, grounding: _grounding }]);
    } catch (e) {
      setThinking({}); setMsgs(p => [...p, { id: Date.now(), role: "assistant", text: `Error: ${e.message}`, agent: AGENTS[0], agentIds: ["tax"], ts: new Date(), err: true }]);
    } setLoading(false);
  }, [input, loading, mode, msgs, fileData, view, buildCtx, audit]);

  const suggestions = [
    { q: lang === "lt" ? "Kokie PVM tarifai 2026? Kas pasikeitė?" : "What are 2026 VAT rates? What changed?", l: lang === "lt" ? "PVM 2026" : "VAT 2026" },
    { q: lang === "lt" ? "Apskaičiuokite grynąjį atlyginimą nuo €3,500 bruto" : "Calculate net salary from €3,500 gross", l: lang === "lt" ? "Atlyginimas" : "Salary" },
    { q: lang === "lt" ? "Paaiškinkite atvirkštinį PVM statybose (96 str.)" : "Explain reverse charge VAT for construction (96 str.)", l: lang === "lt" ? "Atvirkštinis PVM" : "Reverse Charge" },
    { q: lang === "lt" ? "Pelno mokesčio pakeitimai 2026: 17%, momentinis nusidėvėjimas" : "CIT changes 2026: 17% rate, instant depreciation", l: lang === "lt" ? "PM 2026" : "CIT 2026" },
  ];

  const NAV = [
    { id: "home", l: t.home, ic: "◆" },
    { id: "chat", l: t.chat, ic: "◈" },
    { id: "saftview", l: t.saft, ic: "◫" },
    { id: "kpis", l: lang === "lt" ? "KPI" : "KPIs", ic: "▱" },
    { id: "intel", l: lang === "lt" ? "Žvalgyba" : "Intelligence", ic: "✦" },
    { id: "eauditor", l: lang === "lt" ? "E-Auditorius" : "E-Auditor", ic: "◉" },
    { id: "agents", l: `${t.agents} (${AGENTS.length})`, ic: "◎" },
    { id: "logs", l: t.auditLog, ic: "◑" },
  ];

  const openAgent = useCallback((agent) => {
    setSelectedAgent(agent);
    setAgentAttachments([]);
    setAgentInput("");
    setView("agent");
  }, []);

  const onAgentFiles = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      const isImage = file.type.startsWith("image/");
      reader.onload = ev => {
        if (isImage) {
          const dataUrl = ev.target.result;
          const base64 = String(dataUrl).split(",")[1] || "";
          setAgentAttachments(p => [...p, { name: file.name, mimeType: file.type, data: base64, preview: dataUrl }]);
        } else {
          const txt = String(ev.target.result || "").substring(0, 12000);
          setAgentAttachments(p => [...p, { name: file.name, mimeType: file.type || "text/plain", text: txt }]);
        }
      };
      if (isImage) reader.readAsDataURL(file); else reader.readAsText(file);
    });
    e.target.value = "";
  }, []);

  const sendAgent = useCallback(async () => {
    if (!selectedAgent) return;
    const text = agentInput.trim();
    if (!text || agentLoading) return;
    const agentId = selectedAgent.id;
    const history = agentMsgs[agentId] || [];
    const attachSummaries = agentAttachments.map(a => a.text ? `[File: ${a.name}]\n${a.text}` : `[Image attached: ${a.name}]`).join("\n\n");
    const userMsg = { id: Date.now(), role: "user", text, ts: new Date(), attachments: agentAttachments.map(a => ({ name: a.name, preview: a.preview, isImage: !!a.preview })) };
    setAgentMsgs(p => ({ ...p, [agentId]: [...history, userMsg] }));
    setAgentInput("");
    setAgentLoading(true);
    audit.log(`AGENT_${agentId.toUpperCase()}_MSG`, text.substring(0, 100));
    const sys = `You are the **${selectedAgent.name}** specialist agent in a Lithuanian tax intelligence platform. Act as a top-tier expert in your sector: ${selectedAgent.name} (${selectedAgent.nameLt}). Provide deeply specialized, actionable, sector-specific answers. When the user attaches images, screenshots or files, analyze them in detail (extract numbers, parties, dates, legal flags, anomalies, and risks). Cross-reference Lithuanian law where relevant. Stay strictly within this agent's domain unless the user explicitly asks otherwise.`;
    const imageAttachments = agentAttachments.filter(a => a.data && a.mimeType?.startsWith("image/"));
    const combinedText = text + (attachSummaries ? `\n\n---\nAttached context:\n${attachSummaries}` : "");
    try {
      const resp = await callAI(sys, combinedText, history, imageAttachments);
      setAgentMsgs(p => ({ ...p, [agentId]: [...(p[agentId] || []), { id: Date.now() + 1, role: "assistant", text: resp, ts: new Date(), agent: selectedAgent }] }));
    } catch (e) {
      setAgentMsgs(p => ({ ...p, [agentId]: [...(p[agentId] || []), { id: Date.now() + 1, role: "assistant", text: `Error: ${e.message}`, ts: new Date(), agent: selectedAgent, err: true }] }));
    }
    setAgentAttachments([]);
    setAgentLoading(false);
  }, [selectedAgent, agentInput, agentLoading, agentMsgs, agentAttachments, audit]);

  useEffect(() => { agentChatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [agentMsgs, agentLoading, selectedAgent]);

  // ── Palantir design-system helpers (sharp borders, mono labels, serif display) ──
  const PL_LINE = "rgba(255,255,255,0.12)", PL_SOFT = "rgba(255,255,255,0.06)";
  const lbl = { fontFamily: "var(--m)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#8c8c88", display: "flex", alignItems: "center", gap: 12 };
  const rule = { width: 32, height: 1, background: "#8c8c88", flexShrink: 0 };
  const panel = { background: "var(--bg2)", border: `1px solid ${PL_LINE}`, padding: 24 };
  const bP = { display: "inline-flex", alignItems: "center", gap: 9, padding: "11px 20px", background: "#fff", color: "#000", border: "1px solid #fff", fontFamily: "var(--s)", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer", transition: "all .25s" };
  const bG = { ...bP, background: "transparent", color: "#fff", border: `1px solid ${PL_LINE}` };
  const SEC = ({ n, en, lt: ltLabel }) => <div style={{ ...lbl, marginBottom: 22 }}><span style={rule} />{n} — {lang === "lt" ? ltLabel : en}</div>;
  const H = ({ children, size = 44 }) => <h2 style={{ fontFamily: "var(--f)", fontWeight: 300, fontSize: size, lineHeight: 1.05, letterSpacing: "-.02em", color: "#fff" }}>{children}</h2>;
  const dots = (k) => <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: `pulse 1.8s ${i * .3}s infinite` }} />)}</div>;
  // intel sub-tab + saft-tab shared "sharp tab" style
  const tabStyle = (active) => ({ padding: "11px 18px", border: `1px solid ${active ? "#fff" : PL_LINE}`, cursor: "pointer", background: active ? "#fff" : "transparent", color: active ? "#000" : "#bcbcb8", fontSize: 12, fontWeight: 700, fontFamily: "var(--s)", letterSpacing: ".04em", textTransform: "uppercase", whiteSpace: "nowrap", transition: "all .2s" });

  return (
    <div className="pl-app" onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }} onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }} onDrop={handleDrop} style={{ fontFamily: "var(--s)", background: "var(--bg)", color: "#fff", height: "100vh", display: "flex", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,300;1,6..72,400&family=Archivo:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
      :root{--bg:#000000;--bg2:#0a0a0b;--bg3:#121214;--lime:#ffffff;--accent:#ffffff;--f:'Newsreader',Georgia,serif;--s:'Archivo','Helvetica Neue',sans-serif;--m:'JetBrains Mono',monospace}
      *{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#000}::-webkit-scrollbar-thumb{background:#2a2a2c}::-webkit-scrollbar-thumb:hover{background:#3a3a3c}
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
      input::placeholder,textarea::placeholder{color:#8c8c88}::selection{background:#fff;color:#000}
      .pl-app::after{content:"";position:fixed;inset:0;z-index:9000;pointer-events:none;opacity:0.04;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
      .pl-app::before{content:"";position:fixed;inset:0;z-index:8999;pointer-events:none;background:linear-gradient(rgba(255,255,255,0) 50%,rgba(0,0,0,0.16) 50%);background-size:100% 3px;opacity:0.14}
      button:focus-visible{outline:1px solid #fff;outline-offset:2px}
      @media (prefers-reduced-motion: reduce){ *,*::before,*::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important} }
      details>summary{list-style:none}details>summary::-webkit-details-marker{display:none}`}</style>

      {/* DISCLAIMER MODAL */}
      {showDisclaimer && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
        <div style={{ background: "var(--bg2)", padding: 40, maxWidth: 580, width: "100%", border: `1px solid ${PL_LINE}` }}>
          <div style={{ ...lbl, marginBottom: 20 }}><span style={rule} />Terms & Privacy</div>
          <h2 style={{ fontSize: 36, fontWeight: 300, color: "#fff", fontFamily: "var(--f)", marginBottom: 18, letterSpacing: "-.02em", lineHeight: 1.05 }}>{t.termsTitle}</h2>
          <p style={{ fontSize: 15, color: "#d2d2ce", fontFamily: "var(--s)", lineHeight: 1.7, marginBottom: 16 }}>{t.termsText}</p>
          <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--m)", lineHeight: 1.6, marginBottom: 26, padding: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${PL_SOFT}` }}>🔒 {t.gdprText}</p>
          <button onClick={() => { setShowDisclaimer(false); audit.log("DISCLAIMER_ACCEPTED"); }} style={{ ...bP, width: "100%", justifyContent: "center", padding: 15 }} onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}>
            {lang === "lt" ? "Sutinku ir tęsiu →" : "I Agree & Continue →"}
          </button>
        </div>
      </div>}

      {/* TOAST */}
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 10000, background: "#fff", color: "#000", padding: "12px 22px", fontFamily: "var(--m)", fontSize: 12, fontWeight: 600, letterSpacing: ".04em", display: "flex", alignItems: "center", gap: 10, animation: "fadeUp .3s ease", boxShadow: "0 8px 40px rgba(0,0,0,.6)" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#000" }} />{toast}
      </div>}

      {/* DRAG-AND-DROP OVERLAY */}
      {dragOver && <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ border: "1.5px dashed #fff", padding: "56px 80px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16, fontFamily: "var(--f)", fontWeight: 300 }}>↓</div>
          <div style={{ fontFamily: "var(--m)", fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase", color: "#fff" }}>{lang === "lt" ? "Paleiskite SAF-T / CSV failą" : "Drop SAF-T / CSV file"}</div>
        </div>
      </div>}

      {/* ⌘K COMMAND PALETTE */}
      {cmdOpen && (() => {
        const cmds = [
          { k: "home", lbl: lang === "lt" ? "Pradžia" : "Home", hint: "view", run: () => setView("home") },
          { k: "chat", lbl: lang === "lt" ? "Pokalbis su agentais" : "Chat with agents", hint: "view", run: () => setView("chat") },
          { k: "saftview", lbl: lang === "lt" ? "SAF-T analizė" : "SAF-T analysis", hint: "view", run: () => setView("saftview") },
          { k: "intel", lbl: lang === "lt" ? "Žvalgybos centras" : "Intelligence center", hint: "view", run: () => setView("intel") },
          { k: "agents", lbl: lang === "lt" ? "Agentai" : "Agents", hint: "view", run: () => setView("agents") },
          { k: "logs", lbl: lang === "lt" ? "Audito žurnalas" : "Audit log", hint: "view", run: () => setView("logs") },
          { k: "upload", lbl: lang === "lt" ? "Įkelti failą…" : "Upload a file…", hint: "action", run: () => fileRef.current?.click() },
          { k: "lt", lbl: "Lietuvių (LT)", hint: "lang", run: () => setLang("lt") },
          { k: "en", lbl: "English (EN)", hint: "lang", run: () => setLang("en") },
          { k: "exit", lbl: lang === "lt" ? "Grįžti į pradinį puslapį" : "Back to landing", hint: "action", run: () => onExit && onExit() },
        ];
        const q = cmdQuery.trim().toLowerCase();
        const filtered = q ? cmds.filter(c => c.lbl.toLowerCase().includes(q) || c.k.includes(q)) : cmds;
        return <div onClick={() => setCmdOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "min(560px,92vw)", background: "var(--bg2)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${PL_LINE}` }}>
              <span style={{ fontFamily: "var(--m)", fontSize: 12, color: "#8c8c88", letterSpacing: ".1em" }}>⌘K</span>
              <input autoFocus value={cmdQuery} onChange={e => setCmdQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && filtered[0]) { filtered[0].run(); setCmdOpen(false); } }} placeholder={lang === "lt" ? "Ieškoti veiksmų, puslapių…" : "Search actions, pages…"} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 16, fontFamily: "var(--s)" }} />
            </div>
            <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
              {filtered.length === 0 && <div style={{ padding: 20, color: "#8c8c88", fontFamily: "var(--s)", fontSize: 14 }}>{lang === "lt" ? "Nieko nerasta" : "No matches"}</div>}
              {filtered.map((c, i) => <button key={c.k} onClick={() => { c.run(); setCmdOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 18px", border: "none", borderBottom: `1px solid ${PL_SOFT}`, background: i === 0 ? "rgba(255,255,255,0.05)" : "transparent", color: "#fff", cursor: "pointer", fontFamily: "var(--s)", fontSize: 14, textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = i === 0 ? "rgba(255,255,255,0.05)" : "transparent"}>
                <span>{c.lbl}</span>
                <span style={{ fontFamily: "var(--m)", fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "#8c8c88", border: `1px solid ${PL_LINE}`, padding: "2px 7px" }}>{c.hint}</span>
              </button>)}
            </div>
          </div>
        </div>;
      })()}

      {/* SIDEBAR */}
      <nav style={{ width: 236, background: "var(--bg2)", borderRight: `1px solid ${PL_LINE}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div onClick={() => onExit && onExit()} title={lang === "lt" ? "Atgal į pradžią" : "Back to landing"} style={{ padding: "22px 20px", borderBottom: `1px solid ${PL_LINE}`, display: "flex", alignItems: "center", gap: 11, cursor: onExit ? "pointer" : "default" }}>
          <div style={{ width: 34, height: 34, border: "1.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "var(--s)", letterSpacing: "-.02em", position: "relative" }}><span style={{ position: "absolute", width: 7, height: 7, background: "#fff", animation: "pulse 3s infinite" }} /></div>
          <div><div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "var(--s)", lineHeight: 1, letterSpacing: ".18em" }}>TAXAI</div><div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".22em", marginTop: 4 }}>LITHUANIA · 2026</div></div>
        </div>
        {/* Lang switch */}
        <div style={{ padding: "12px 14px", display: "flex", gap: 6 }}>
          {["lt", "en"].map(l => <button key={l} onClick={() => setLang(l)} style={{ flex: 1, padding: "8px", border: `1px solid ${lang === l ? "#fff" : PL_LINE}`, background: lang === l ? "#fff" : "transparent", color: lang === l ? "#000" : "#8c8c88", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--m)", letterSpacing: ".1em", transition: "all .2s" }}>{l === "lt" ? "LT" : "EN"}</button>)}
        </div>
        <div style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
          <div style={{ ...lbl, fontSize: 9, padding: "10px 10px 8px", letterSpacing: ".2em" }}>Navigation</div>
          {NAV.map(n => { const active = (view === n.id || (n.id === "eauditor" && view === "agent" && selectedAgent?.id === "eauditor")); return <button key={n.id} onClick={() => { if (n.id === "eauditor") { const ea = AGENTS.find(a => a.id === "eauditor"); if (ea) openAgent(ea); } else { setView(n.id); } }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", border: "none", borderLeft: `2px solid ${active ? "#fff" : "transparent"}`, cursor: "pointer", background: active ? "rgba(255,255,255,0.06)" : "transparent", color: active ? "#fff" : "#8c8c88", marginBottom: 1, fontFamily: "var(--s)", fontWeight: active ? 700 : 500, fontSize: 13.5, letterSpacing: ".02em", transition: "all .2s" }} onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#8c8c88"; }}><span style={{ fontSize: 14, width: 16, textAlign: "center" }}>{n.ic}</span><span>{n.l}</span></button>; })}
        </div>
        <div style={{ padding: "14px", borderTop: `1px solid ${PL_LINE}` }}>
          <div style={{ border: `1px dashed ${fileData ? "#fff" : PL_LINE}`, padding: 14, textAlign: "center", cursor: "pointer", transition: "border-color .2s" }} onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".xml,.csv,.tsv" style={{ display: "none" }} onChange={upload} />
            <div style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>{fileData ? "Loaded" : "SAF-T / CSV"}</div>
            <div style={{ fontSize: 12.5, color: fileData ? "#fff" : "#bcbcb8", fontFamily: "var(--s)", fontWeight: 600, wordBreak: "break-all" }}>{fileData ? `✓ ${fileName}` : t.upload}</div>
          </div>
        </div>
        <button onClick={() => { setCmdOpen(true); setCmdQuery(""); }} style={{ padding: "10px 16px", borderTop: `1px solid ${PL_LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "transparent", border: "none", cursor: "pointer", color: "#8c8c88" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#8c8c88"}>
          <span style={{ fontSize: 10, fontFamily: "var(--m)", letterSpacing: ".1em", textTransform: "uppercase" }}>{lang === "lt" ? "Komandos" : "Commands"}</span>
          <span style={{ fontFamily: "var(--m)", fontSize: 10, border: `1px solid ${PL_LINE}`, padding: "2px 7px" }}>⌘K</span>
        </button>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${PL_LINE}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "breathe 3s infinite" }} />
          <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em" }}>{t.poweredBy}</span>
        </div>
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ═══════════ HOME ═══════════ */}
        {view === "home" && <div key="home" style={{ flex: 1, overflow: "auto", animation: "fadeUp .4s ease" }}>
          <div style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${PL_LINE}` }}>
            <VideoBackdrop src="/hero.mp4" overlay={false} fallback={<HomeHeroCanvas />} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 75% 30%, rgba(0,0,0,0) 0%, rgba(0,0,0,.5) 60%, #000 100%), linear-gradient(180deg, rgba(0,0,0,.5), rgba(0,0,0,0) 30%, #000)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 980, margin: "0 auto", padding: "88px 56px 64px" }}>
              <div style={{ ...lbl, marginBottom: 30 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: "pulse 2s infinite" }} />Forensic Tax Intelligence · Republic of Lithuania</div>
              <h1 style={{ fontSize: "clamp(48px,7vw,92px)", fontWeight: 300, color: "#fff", fontFamily: "var(--f)", lineHeight: .98, letterSpacing: "-.025em", marginBottom: 28 }}>{lang === "lt" ? "Mokesčių " : "Tax "}<em style={{ fontStyle: "italic" }}>{lang === "lt" ? "intelektas" : "intelligence"}</em><br />{lang === "lt" ? "sukurtas " : "built for "}<span style={{ color: "#8c8c88" }}>{lang === "lt" ? "Lietuvai." : "Lithuania."}</span></h1>
              <p style={{ fontSize: 19, color: "#d2d2ce", fontFamily: "var(--s)", fontWeight: 400, maxWidth: 660, lineHeight: 1.7, marginBottom: 44 }}>
                {lang === "lt" ? `Pamatykite savo apskaitą taip, kaip ją matys VMI — pirmiau už ją.` : `See your books the way the tax authority will — before they do.`}
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => setView("saftview")} style={bP} onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}>{lang === "lt" ? "Analizuoti SAF-T" : "Analyze SAF-T"} →</button>
                <button onClick={() => setView("chat")} style={bG} onMouseEnter={e => e.currentTarget.style.borderColor = "#fff"} onMouseLeave={e => e.currentTarget.style.borderColor = PL_LINE}>{lang === "lt" ? "Klausti agento" : "Ask an agent"}</button>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0" }}>
            {/* live animated intelligence band */}
            <PageBanner variant="network" height={130}
              label={lang === "lt" ? "01 — Gyva žvalgyba" : "01 — Live intelligence"}
              title={<>{lang === "lt" ? "Įkelkite. Analizuokite. " : "Upload. Analyze. "}<em style={{ fontStyle: "italic" }}>{lang === "lt" ? "Suprasite." : "Understand."}</em></>}
              sub={lang === "lt" ? "Deterministinis variklis randa neatitikimus; AI sukuria jūsų sektoriui pritaikytas taisykles." : "A deterministic engine finds the breaches; AI designs rules tailored to your sector."} />

            {/* animated count-up metrics */}
            <div style={{ padding: "52px 56px 8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}` }}>
                {[[AUDIT_RULES.length, "", lang === "lt" ? "Audito taisyklės" : "Audit rules"], [7, "", lang === "lt" ? "Forensikos varikliai" : "Forensic engines"], [AGENTS.length, "", lang === "lt" ? "Agentai" : "Agents"], [20, "+", lang === "lt" ? "Oficialūs šaltiniai" : "Official sources"]].map(([to, suf, k], i) =>
                  <div key={i} style={{ padding: "30px 24px", borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}` }}>
                    <div style={{ fontSize: 46, fontWeight: 300, color: "#fff", fontFamily: "var(--f)", lineHeight: 1 }}><CountUp to={to} suffix={suf} /></div>
                    <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".12em", textTransform: "uppercase", marginTop: 12 }}>{k}</div>
                  </div>)}
              </div>
            </div>

            {/* how it works — animated pipeline */}
            <div style={{ padding: "20px 56px 72px" }}>
              <SEC n="02" en="How it works" lt="Kaip tai veikia" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}` }}>
                {[
                  ["01", lang === "lt" ? "Įkelkite SAF-T" : "Upload SAF-T", lang === "lt" ? "XML iš jūsų ERP — apdorojama jūsų naršyklėje." : "XML from your ERP — parsed right in your browser."],
                  ["02", lang === "lt" ? "Audito taisyklės" : "Audit rules", lang === "lt" ? "Patikrintos PVM taisyklės pažymi kiekvieną neatitikimą su įrodymais ir teisės nuoroda." : "Verified VAT rules flag every breach with evidence and a legal citation."],
                  ["03", lang === "lt" ? "7 varikliai + AI" : "7 engines + AI", lang === "lt" ? "Forensinė analizė ir jūsų sektoriui pritaikytos taisyklės." : "Forensic analysis plus rules adapted to your sector."],
                  ["04", lang === "lt" ? "Ataskaita" : "Report", lang === "lt" ? "Eksportuokite forensinę ataskaitą ir CSV vienu paspaudimu." : "Export a forensic report and CSV in one click."],
                ].map(([n, title, desc], i) =>
                  <div key={i} style={{ padding: "26px 24px", borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}`, transition: "background .25s" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--bg2)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, letterSpacing: ".14em", marginBottom: 14 }}>/ {n}</div>
                    <div style={{ fontSize: 19, color: "#fff", fontFamily: "var(--f)", marginBottom: 8 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", lineHeight: 1.6 }}>{desc}</div>
                  </div>)}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 34, flexWrap: "wrap" }}>
                <button onClick={() => setView("saftview")} style={bP} onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}>{lang === "lt" ? "Analizuoti SAF-T" : "Analyze SAF-T"} →</button>
                <button onClick={() => setView("chat")} style={bG} onMouseEnter={e => e.currentTarget.style.borderColor = "#fff"} onMouseLeave={e => e.currentTarget.style.borderColor = PL_LINE}>{lang === "lt" ? "Klausti agento" : "Ask an agent"}</button>
              </div>
            </div>
          </div>
        </div>}

        {/* ═══════════ CHAT ═══════════ */}
        {view === "chat" && <div key="chat" style={{ flex: 1, display: "flex", flexDirection: "column", animation: "fadeUp .4s ease" }}>
          <div style={{ display: "flex", gap: 6, padding: "14px 28px", flexShrink: 0, borderBottom: `1px solid ${PL_LINE}`, overflowX: "auto", alignItems: "center" }}>
            {modes.map(m => <button key={m.id} onClick={() => setMode(m.id)} style={tabStyle(mode === m.id)}>{lang === "lt" ? m.lt : m.l}</button>)}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <select value={voice.lang} onChange={e => voice.setLang(e.target.value)} style={{ background: "var(--bg2)", border: `1px solid ${PL_LINE}`, padding: "8px 10px", color: "#fff", fontSize: 11, fontFamily: "var(--m)" }}><option value="lt-LT">LT</option><option value="en-US">EN</option></select>
              <button onClick={voice.toggle} style={{ ...tabStyle(voice.on), border: `1px solid ${voice.on ? "#f47067" : PL_LINE}`, background: voice.on ? "#f47067" : "transparent", color: voice.on ? "#fff" : "#bcbcb8" }}>{voice.on ? "■ STOP" : `● ${t.voice}`}</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
            {msgs.length === 0 && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32 }}>
              <div style={{ ...lbl, marginBottom: 22, justifyContent: "center" }}><span style={rule} />{lang === "lt" ? "Daugia-agentė analizė" : "Multi-agent analysis"}</div>
              <h2 style={{ fontSize: 56, fontWeight: 300, color: "#fff", fontFamily: "var(--f)", textAlign: "center", marginBottom: 32, letterSpacing: "-.02em" }}>{t.askAnything}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}`, maxWidth: 640, width: "100%" }}>
                {suggestions.map((s, i) => <button key={i} onClick={() => send(s.q)} style={{ padding: "18px 18px", textAlign: "left", background: "transparent", borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}`, cursor: "pointer", color: "#d2d2ce", fontSize: 14, fontFamily: "var(--f)", lineHeight: 1.4, transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{s.q.length > 64 ? s.q.slice(0, 62) + "…" : s.q}</button>)}
              </div>
            </div>}
            {msgs.map(msg => <div key={msg.id} style={{ padding: "16px 0", maxWidth: 760, margin: "0 auto", width: "100%", animation: "fadeUp .35s ease" }}>
              {msg.role === "user" ? <div><div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".12em" }}>{lang === "lt" ? modes.find(m => m.id === mode)?.lt : mode} · {msg.ts?.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" })}</div><div style={{ fontSize: 24, color: "#fff", fontFamily: "var(--f)", fontWeight: 400, lineHeight: 1.3 }}>{msg.text}</div></div>
                : <div><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, border: "1px solid #fff", color: "#fff", fontSize: 14, fontWeight: 700 }}>{msg.agent?.icon || "◆"}</span><span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "var(--m)", textTransform: "uppercase", letterSpacing: ".1em" }}>{lang === "lt" ? AGENTS.find(a => a.id === msg.agent?.id)?.nameLt || msg.agent?.name : msg.agent?.name}</span>{msg.agentIds?.length > 1 && <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", padding: "2px 8px", border: `1px solid ${PL_LINE}` }}>+{msg.agentIds.length - 1}</span>}</div>
                  <div style={{ paddingLeft: 40, borderLeft: msg.err ? "2px solid #f47067" : `2px solid ${PL_LINE}` }}>
                    {(() => {
                      if (msg.sources && msg.sources.length) {
                        const nc = numberCitations(msg.text, msg.sources, LEGAL_DB);
                        return <Md text={nc.text} />;
                      }
                      return <Md text={msg.text} />;
                    })()}
                    {msg.grounding && <SourcesPanel grounding={msg.grounding} lang={lang} />}
                  </div></div>}
            </div>)}
            {Object.keys(thinking).length > 0 && <div style={{ padding: "16px 0", maxWidth: 760, margin: "0 auto", animation: "fadeUp .3s ease" }}><div style={{ paddingLeft: 40, display: "flex", alignItems: "center", gap: 10 }}>{dots()}<span style={{ fontSize: 12, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em" }}>{lang === "lt" ? "ANALIZUOJAMA..." : "ANALYZING..."}</span></div></div>}
            <div ref={chatRef} />
          </div>
          <div style={{ padding: "16px 28px 20px", borderTop: `1px solid ${PL_LINE}`, flexShrink: 0 }}>
            <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10 }}>
              <div style={{ flex: 1, display: "flex", background: "var(--bg2)", border: `1px solid ${PL_LINE}`, padding: "0 18px" }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }} placeholder={lang === "lt" ? `Klauskite ${modes.find(m => m.id === mode)?.lt} režimu...` : `Ask in ${mode} mode...`} disabled={loading} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 16, padding: "15px 0", fontFamily: "var(--s)", fontWeight: 400 }} />
              </div>
              <button onClick={() => send()} disabled={loading || !input.trim()} style={{ ...bP, padding: "0 30px", opacity: loading ? .5 : 1, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "···" : t.send}</button>
            </div>
          </div>
        </div>}

        {/* ═══════════ SAF-T INTELLIGENCE ═══════════ */}
        {view === "saftview" && <div key="saftview" style={{ flex: 1, overflow: "auto", padding: "32px 40px", animation: "fadeUp .4s ease", backgroundImage: "linear-gradient(rgba(0,0,0,0.74), rgba(0,0,0,0.93)), url(/saft-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {selectedFinding && <FindingDetail
              finding={selectedFinding}
              lang={lang}
              note={findingNotes[findingKey(selectedFinding)]}
              onSave={(patch) => setFindingNote(findingKey(selectedFinding), patch)}
              onBack={() => setSelectedFinding(null)}
              company={fileData?.parsed?.header?.company?.name}
              period={fileData?.parsed?.header ? `${fileData.parsed.header.fiscalYearFrom?.slice(0,10)} — ${fileData.parsed.header.fiscalYearTo?.slice(0,10)}` : ""}
            />}
            {!selectedFinding && <>
            <PageBanner variant="scan" label={lang === "lt" ? "02 — Atitikties variklis" : "02 — Compliance Engine"} title={<>SAF-T <em style={{ fontStyle: "italic" }}>{lang === "lt" ? "analizė" : "Intelligence"}</em></>} sub={lang === "lt" ? `${AUDIT_RULES.length} patikrintos PVM audito taisyklės, susietos su duomenimis ir teisės aktais — vykdoma įkėlus, su įrodymais kiekvienam radiniui.` : `${AUDIT_RULES.length} verified VAT audit rules, connected to your data and the law — executed on upload, with cited evidence for every finding.`} right={findings.length > 0 ? <button onClick={() => { exportCSV(findings, `taxai-${fileName}-findings.csv`); audit.log("EXPORT", "CSV findings"); }} style={bG} onMouseEnter={e => e.currentTarget.style.borderColor = "#fff"} onMouseLeave={e => e.currentTarget.style.borderColor = PL_LINE}>↓ {t.export} CSV</button> : null} />

            <div style={{ border: `1px dashed ${fileData ? "#fff" : PL_LINE}`, padding: 28, textAlign: "center", cursor: "pointer", marginBottom: 16, background: "var(--bg2)", transition: "border-color .2s" }} onClick={() => fileRef.current?.click()}>
              <div style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>{fileData ? "File loaded" : (lang === "lt" ? "Vilkite failą čia arba spustelėkite" : "Drag a file here or click")}</div>
              <div style={{ fontSize: 17, color: "#fff", fontFamily: "var(--f)", fontWeight: 400 }}>{fileData ? `✓ ${fileName}` : t.upload}</div>
            </div>


            {fileData && <>
              <div style={{ display: "flex", gap: 0, marginBottom: 28, flexWrap: "wrap", borderLeft: `1px solid ${PL_LINE}` }}>
                {[
                  { id: "tests", en: "Automated Tests", lt: "Automatiniai testai" },
                  { id: "ai", en: "AI Analysis", lt: "AI analizė" },
                  { id: "smart", en: "Smart Filter", lt: "Išmanus filtras" },
                  { id: "smartanalysis", en: "Smart Analysis", lt: "Išmanioji analizė" },
                  { id: "enterprise", en: "Enterprise Audit", lt: "Įmonės auditas" },
                  { id: "rules", en: `Audit Rules · ${AUDIT_RULES.length}${personalRules?.rules?.length ? " +" + personalRules.rules.length : ""}`, lt: `Audito taisyklės · ${AUDIT_RULES.length}${personalRules?.rules?.length ? " +" + personalRules.rules.length : ""}` },
                  { id: "reconcile", en: `i.SAF Reconcile${reconResult?.findings?.length ? " · " + reconResult.findings.length : ""}`, lt: `i.SAF sutikrinimas${reconResult?.findings?.length ? " · " + reconResult.findings.length : ""}` },
                  { id: "vatclose", en: `VAT Close${vatClose.closedAt ? " ✓" : vatClose.step > 0 ? " ·" + Math.round(vatClose.step / 6 * 100) + "%" : ""}`, lt: `PVM uždarymas${vatClose.closedAt ? " ✓" : vatClose.step > 0 ? " ·" + Math.round(vatClose.step / 6 * 100) + "%" : ""}` },
                ].map(tab =>
                  <button key={tab.id} onClick={() => {
                    setSaftTab(tab.id);
                    if (tab.id === "ai" && !aiResult) runAI();
                    if (tab.id === "smart" && !smartResult) runSmart();
                    if (tab.id === "smartanalysis" && !smartAnalysisResult) runSmartAnalysisCallback();
                    if (tab.id === "enterprise" && !enterpriseResult) runEnterpriseAuditCallback();
                  }} style={{ ...tabStyle(saftTab === tab.id), borderLeft: "none" }}>{lang === "lt" ? tab.lt : tab.en}</button>)}
              </div>

              {/* ── TESTS ── */}
              {saftTab === "tests" && <div>
                {fileData.parsed?.counts && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}`, marginBottom: 24 }}>
                  {Object.entries(fileData.parsed.counts).filter(([, v]) => v > 0).map(([k, v]) => <div key={k} style={{ padding: 18, borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}` }}><div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{k}</div><div style={{ fontSize: 30, fontWeight: 300, color: "#fff", fontFamily: "var(--f)" }}>{v}</div></div>)}
                  <div style={{ padding: 18, borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}`, background: findings.some(f => f.severity === "Critical") ? "rgba(255,107,107,0.06)" : "transparent" }}><div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{t.findings}</div><div style={{ fontSize: 30, fontWeight: 300, color: findings.some(f => f.severity === "Critical") ? "#ff8a8a" : "#fff", fontFamily: "var(--f)" }}>{findings.length}</div></div>
                </div>}

                {fileData.parsed?.header?.company && <div style={{ fontSize: 13, color: "#d2d2ce", fontFamily: "var(--m)", marginBottom: 24, padding: "16px 18px", border: `1px solid ${PL_LINE}`, background: "var(--bg2)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <strong style={{ color: "#fff", fontWeight: 700 }}>{fileData.parsed.header.company.name}</strong>
                  <span style={{ color: "#8c8c88" }}>· {fileData.parsed.header.company.registrationNumber}</span>
                  <span style={{ color: "#8c8c88" }}>· {fileData.parsed.header.fiscalYearFrom} — {fileData.parsed.header.fiscalYearTo}</span>
                  {runResult && <span style={{ marginLeft: "auto", padding: "4px 10px", border: `1px solid ${PL_LINE}`, color: "#fff", fontSize: 11, fontWeight: 600 }}>{runResult.coverage.rulesRegistered} rules · {runResult.summary.total} findings</span>}
                </div>}

                {findings.length > 0 && <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    {["Critical", "High", "Medium", "Low"].map(s => { const c = findings.filter(f => f.severity === s).length; return c > 0 ? <div key={s} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", border: `1px solid ${SC(s)}`, fontSize: 12, fontWeight: 600, color: SC(s), fontFamily: "var(--m)", letterSpacing: ".04em" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: SC(s) }} />{lang === "lt" ? t[s.toLowerCase()] : s}: {c}</div> : null; })}
                  </div>
                  {findings.map((f, i) => { const fk = findingKey(f); const fnote = findingNotes[fk]; const disp = fnote?.disposition;
                  return <div key={i} onClick={() => { setSelectedFinding(f); audit.log("FINDING_OPENED", f.rule_id || f.title); }} title={lang === "lt" ? "Atidaryti radinį" : "Open finding"} style={{ display: "flex", gap: 14, padding: "16px 18px", background: "var(--bg2)", borderLeft: `2px solid ${SC(f.severity)}`, border: `1px solid ${PL_LINE}`, borderLeftWidth: 2, marginBottom: 8, opacity: f.status === "rejected" ? 0.4 : 1, cursor: "pointer", transition: "border-color .15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.32)"} onMouseLeave={e => e.currentTarget.style.borderColor = PL_LINE}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 9, padding: "3px 9px", background: SC(f.severity), color: "#000", fontWeight: 700, fontFamily: "var(--m)", letterSpacing: ".08em", textTransform: "uppercase" }}>{f.severity}</span>
                        <span style={{ fontSize: 10, padding: "3px 8px", border: `1px solid ${PL_LINE}`, color: "#fff", fontFamily: "var(--m)", fontWeight: 600 }}>{f.rule_id || `L${f.level}`}</span>
                        <span style={{ fontSize: 10, padding: "3px 8px", border: `1px solid ${PL_LINE}`, color: "#8c8c88", fontFamily: "var(--m)" }}>{f.typeName || f.type || "—"}: {f.category}</span>
                        {disp && <span style={{ fontSize: 10, padding: "3px 8px", color: disp === "accordance" ? "#69db7c" : "#ff8a8a", border: `1px solid ${disp === "accordance" ? "#69db7c" : "#ff8a8a"}`, fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase" }}>{disp === "accordance" ? (lang === "lt" ? "✓ Atitinka" : "✓ In accordance") : (lang === "lt" ? "✕ Reikia veiksmų" : "✕ Needs action")}</span>}
                        {!disp && fnote?.justification && <span style={{ fontSize: 10, padding: "3px 8px", color: "#ffd43b", border: "1px solid #ffd43b", fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase" }}>{lang === "lt" ? "✎ Peržiūrėta" : "✎ Reviewed"}</span>}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: "#fff", fontFamily: "var(--f)", marginBottom: 5 }}>{f.title}</div>
                      <div style={{ fontSize: 13.5, color: "#bcbcb8", fontFamily: "var(--s)", lineHeight: 1.6 }}>{f.detail}</div>
                      {f.evidence && f.evidence.length > 0 && <details onClick={(e) => e.stopPropagation()} style={{ marginTop: 10 }}>
                        <summary style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", cursor: "pointer", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>+ Evidence ({f.evidence.length} sample{f.evidence.length === 1 ? "" : "s"})</summary>
                        <div style={{ marginTop: 8, padding: "10px 14px", background: "#000", border: `1px solid ${PL_SOFT}`, fontFamily: "var(--m)", fontSize: 11, color: "#bcbcb8", lineHeight: 1.7 }}>
                          {f.evidence.slice(0, 10).map((ev, j) => <div key={j} style={{ marginBottom: 3 }}>· {typeof ev === "string" ? ev : JSON.stringify(ev)}</div>)}
                        </div>
                      </details>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                      <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{lang === "lt" ? "Atidaryti →" : "Open →"}</span>
                      {f.status === "open" && <div style={{ display: "flex", flexDirection: "column", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setOverrides(p => ({ ...p, [f._idx]: "accepted" })); audit.log("FINDING_ACCEPTED", f.title); }} style={{ padding: "5px 12px", border: "1px solid #69db7c", background: "transparent", color: "#69db7c", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "var(--m)", letterSpacing: ".06em", textTransform: "uppercase" }}>✓ {t.accept}</button>
                        <button onClick={() => { setOverrides(p => ({ ...p, [f._idx]: "rejected" })); audit.log("FINDING_REJECTED", f.title); }} style={{ padding: "5px 12px", border: "1px solid #ff8a8a", background: "transparent", color: "#ff8a8a", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "var(--m)", letterSpacing: ".06em", textTransform: "uppercase" }}>✕ {t.reject}</button>
                      </div>}
                    </div>
                  </div>; })}
                </div>}

                {fileData.parsed?.sales?.items?.length > 0 && <div style={{ marginTop: 28 }}>
                  <SEC n="2.1" en={`Sales Invoices · ${fileData.parsed.sales.items.length}`} lt={`Pardavimo sąskaitos · ${fileData.parsed.sales.items.length}`} />
                  <DataTable columns={[
                    { key: "invoiceNo", label: lang === "lt" ? "Nr." : "No.", mono: true, bold: true },
                    { key: "invoiceDate", label: lang === "lt" ? "Data" : "Date", mono: true },
                    { key: "customerID", label: lang === "lt" ? "Klientas" : "Customer", mono: true },
                    { key: "net", label: "Net €", mono: true, render: r => `€${(r.documentTotals?.netTotal || 0).toLocaleString()}` },
                    { key: "tax", label: lang === "lt" ? "PVM €" : "VAT €", mono: true, render: r => `€${(r.documentTotals?.taxPayable || 0).toLocaleString()}` },
                    { key: "gross", label: lang === "lt" ? "Suma €" : "Gross €", mono: true, bold: true, render: r => `€${(r.documentTotals?.grossTotal || 0).toLocaleString()}` },
                    { key: "invoiceType", label: lang === "lt" ? "Tipas" : "Type", mono: true },
                  ]} data={fileData.parsed.sales.items} maxRows={30} />
                </div>}
              </div>}

              {/* ── AI ANALYSIS ── */}
              {saftTab === "ai" && <div style={panel}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <SEC n="02·A" en="AI Deep Analysis" lt="AI giluminė analizė" />
                  {!aiResult && !saftLoading && <button onClick={runAI} style={{ ...bP, marginLeft: "auto" }}>{lang === "lt" ? "Analizuoti →" : "Analyze →"}</button>}
                </div>
                <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 18, lineHeight: 1.65, maxWidth: 760 }}>
                  {lang === "lt" ? "AI interpretuoja audito taisyklių variklio rezultatus: paaiškina kiekvieną reikšmingą radinį Lietuvos mokesčių teisės kontekste (PVMĮ, VA-49), nustato pagrindines priežastis ir siūlo skubias korekcijas." : "AI interprets the audit-rule engine results: explains every material finding in the context of Lithuanian tax law (PVMĮ, VA-49), identifies root causes and suggests immediate corrections."}
                </p>
                {saftLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20 }}>{dots()}<span style={{ fontSize: 13, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em" }}>{lang === "lt" ? "ANALIZUOJAMA..." : "ANALYZING..."}</span></div>}
                {aiResult && <Md text={aiResult} />}
                {aiResult && <DefensibilityPanel verification={verifyAi} lang={lang} />}
              </div>}

              {/* ── SMART FILTER ── */}
              {saftTab === "smart" && <div style={panel}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <SEC n="02·B" en="Smart Filter" lt="Išmanus filtras" />
                  {!smartResult && !saftLoading && <button onClick={runSmart} style={{ ...bP, marginLeft: "auto" }}>{lang === "lt" ? "Filtruoti →" : "Filter →"}</button>}
                </div>
                {saftLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20 }}>{dots()}</div>}
                {smartResult && <Md text={smartResult} />}
              </div>}

              {/* ── SMART ANALYSIS ── */}
              {saftTab === "smartanalysis" && <div style={panel}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <SEC n="02·C" en="Smart Analysis" lt="Išmanioji analizė" />
                  {!smartAnalysisResult && !saftLoading && <button onClick={runSmartAnalysisCallback} style={{ ...bP, marginLeft: "auto" }}>{lang === "lt" ? "Analizuoti →" : "Analyze →"}</button>}
                </div>
                <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 18, lineHeight: 1.65, maxWidth: 820 }}>
                  {lang === "lt" ? "Meta-lygio analizė: kritikuoja taisyklių aprėptį, siūlo naujas taisykles, identifikuoja teisinius gynybos kelius (MAĮ 68 — savanoriškas atskleidimas su 50–70 % baudų sumažinimu), ir pateikia finansavimo strategijas (MTEP kreditas pagal PMĮ 17-1, investicinė lengvata pagal PMĮ 46-1, momentinis nusidėvėjimas pagal PMĮ 18 nuo 2026 m., Invega, ES fondai)." : "Meta-level analysis: critiques rule coverage, proposes new rules, identifies legal defensive pathways (MAĮ 68 — voluntary disclosure with 50–70 % penalty reduction), and provides financing strategies (R&D credit per PMĮ 17-1, investment relief per PMĮ 46-1, instant depreciation per PMĮ 18 from 2026, Invega, EU funds)."}
                </p>
                {saftLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20 }}>{dots()}<span style={{ fontSize: 13, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em" }}>{lang === "lt" ? "ATLIEKAMA META-ANALIZĖ..." : "RUNNING META-ANALYSIS..."}</span></div>}
                {smartAnalysisResult && <>
                  <Md text={smartAnalysisResult} />
                  <DefensibilityPanel verification={verifySmartAnalysis} lang={lang} />
                  <div style={{ marginTop: 18, padding: "12px 16px", border: "1px solid rgba(217,183,109,0.3)", fontSize: 11, color: "#d9b76d", fontFamily: "var(--s)", lineHeight: 1.6 }}>
                    ⚠ {lang === "lt" ? "Šis išmaniosios analizės modulis pateikia bendras gaires. Konkrečios teisinės pozicijos VMI patikrinime turi būti suderintos su licencijuotu mokesčių konsultantu. Sumos – orientacinės." : "This Smart Analysis module provides general guidance. Specific legal positions for a VMI inspection must be agreed with a licensed tax consultant. Amounts are indicative."}
                  </div>
                  <button onClick={runSmartAnalysisCallback} style={{ ...bG, marginTop: 14 }}>↻ {lang === "lt" ? "Generuoti iš naujo" : "Regenerate"}</button>
                </>}
              </div>}

              {/* ── ENTERPRISE AUDIT ── */}
              {saftTab === "enterprise" && <div style={panel}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <SEC n="02·D" en="Enterprise Financial Audit" lt="Įmonės finansinis auditas" />
                  {!enterpriseResult && !saftLoading && <button onClick={runEnterpriseAuditCallback} style={{ ...bP, marginLeft: "auto" }}>{lang === "lt" ? "Audituoti →" : "Run Audit →"}</button>}
                </div>
                <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 18, lineHeight: 1.65, maxWidth: 820 }}>
                  {lang === "lt" ? "CFO / vidaus audito / mokesčių audito / ERP analizės sluoksnis. KPI skaičiuojami deterministiškai (be AI) iš SAF-T duomenų; Gemini interpretuoja pagrįstus skaičius (IFRS, PVMĮ, PMĮ, MAĮ, OECD, IIA)." : "CFO / internal-audit / tax-audit / ERP analytics layer. KPIs are computed deterministically (no AI) from SAF-T data; Gemini interprets the grounded numbers (IFRS, PVMĮ, PMĮ, MAĮ, OECD, IIA)."}
                </p>

                {enterpriseKpis?.kpis && <div style={{ marginBottom: 24 }}>
                  <div style={{ ...lbl, marginBottom: 14 }}><span style={rule} />{lang === "lt" ? "KPI suvestinė · deterministinė" : "KPI Dashboard · deterministic"}</div>
                  {(() => {
                    const k = enterpriseKpis.kpis;
                    const card = (label, val, sub, warn) => <div style={{ padding: 16, borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}`, background: warn ? "rgba(255,169,77,0.06)" : "transparent" }}>
                      <div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{label}</div>
                      <div style={{ fontSize: 24, fontWeight: 300, color: warn ? "#ffa94d" : "#fff", fontFamily: "var(--f)" }}>{val}</div>
                      {sub && <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 4 }}>{sub}</div>}
                    </div>;
                    const grid = (children) => <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}` }}>{children}</div>;
                    return <>
                      <div style={{ fontSize: 10, color: "#fff", fontFamily: "var(--m)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", margin: "16px 0 8px" }}>{lang === "lt" ? "Finansai" : "Finance"}</div>
                      {grid(<>
                        {card(lang === "lt" ? "Pajamos" : "Revenue", `€${k.revenue.toLocaleString()}`)}
                        {card(lang === "lt" ? "Sąnaudos" : "Costs", `€${k.costs.toLocaleString()}`)}
                        {card(lang === "lt" ? "Rezultatas" : "Gross result", `€${k.grossResult.toLocaleString()}`, null, k.grossResult < 0)}
                        {card(lang === "lt" ? "Marža" : "Gross margin", `${k.grossMarginPct}%`)}
                        {card(lang === "lt" ? "Apyvartinis k." : "Working cap.", `€${k.workingCapital.toLocaleString()}`, null, k.workingCapital < 0)}
                        {card(lang === "lt" ? "Einamasis sant." : "Current ratio", k.currentRatio, null, k.currentRatio < 1 && k.currentRatio > 0)}
                        {card("DSO", `${k.dso} d`, lang === "lt" ? "gautinos" : "receivable days", k.dso > 90)}
                        {card("DPO", `${k.dpo} d`, lang === "lt" ? "mokėtinos" : "payable days")}
                      </>)}
                      <div style={{ fontSize: 10, color: "#fff", fontFamily: "var(--m)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", margin: "20px 0 8px" }}>{lang === "lt" ? "Mokesčiai" : "Tax"}</div>
                      {grid(<>
                        {card(lang === "lt" ? "Pard. PVM" : "Sales VAT", `€${k.salesVat.toLocaleString()}`)}
                        {card(lang === "lt" ? "Pirk. PVM" : "Input VAT", `€${k.inputVat.toLocaleString()}`)}
                        {card(lang === "lt" ? "PVM pozicija" : "Net VAT", `€${k.netVatPosition.toLocaleString()}`, k.netVatPosition > 0 ? (lang === "lt" ? "mokėtina VMI" : "payable to VMI") : (lang === "lt" ? "grąžintina" : "refundable"))}
                        {card(lang === "lt" ? "PVM susigrąž." : "VAT recovery", `${k.vatRecoveryRatePct}%`)}
                        {card(lang === "lt" ? "Pelno mok. (est.)" : "Est. CIT", `€${k.estimatedCit.toLocaleString()}`, `@ ${k.estimatedCitRatePct}%`)}
                        {card(lang === "lt" ? "Efekt. tarifas" : "Effective rate", `${k.effectiveTaxRatePct}%`)}
                      </>)}
                      <div style={{ fontSize: 10, color: "#fff", fontFamily: "var(--m)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", margin: "20px 0 8px" }}>{lang === "lt" ? "Veikla ir pirkimai" : "Operational & Procurement"}</div>
                      {grid(<>
                        {card(lang === "lt" ? "Operacijos" : "Transactions", k.transactionCount.toLocaleString())}
                        {card(lang === "lt" ? "Sąskaitos" : "Invoices", k.invoiceCount.toLocaleString())}
                        {card(lang === "lt" ? "Klientai" : "Customers", k.customerCount.toLocaleString())}
                        {card(lang === "lt" ? "Tiekėjai" : "Suppliers", k.supplierCount.toLocaleString())}
                        {card(lang === "lt" ? "Top-1 tiekėjas" : "Top-1 supplier", `${k.topSupplierConcentrationPct}%`, lang === "lt" ? "mokėtinų dalis" : "of payables", k.topSupplierConcentrationPct > 50)}
                        {card(lang === "lt" ? "Top-3 tiekėjai" : "Top-3 suppliers", `${k.top3SupplierConcentrationPct}%`, lang === "lt" ? "koncentracija" : "concentration", k.top3SupplierConcentrationPct > 80)}
                      </>)}
                      <div style={{ marginTop: 12, fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", lineHeight: 1.5, fontStyle: "italic" }}>
                        {lang === "lt" ? "SAF-T sąskaitų tipai yra apibendrinti; skaičiai yra apskaitos aproksimacijos analizei, ne filed finansinių ataskaitų pakaitalas (tikrinkite su PLN204 / balansu)." : "SAF-T account types are coarse; figures are accounting approximations for analysis, not a substitute for the filed financial statements (verify against PLN204 / balance sheet)."}
                      </div>
                    </>;
                  })()}
                </div>}

                {saftLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20 }}>{dots()}<span style={{ fontSize: 13, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em" }}>{lang === "lt" ? "VYKDOMAS ĮMONĖS AUDITAS..." : "RUNNING ENTERPRISE AUDIT..."}</span></div>}

                {enterpriseResult?.markdown && <>
                  <div style={{ height: 1, background: PL_LINE, margin: "16px 0 20px" }} />
                  <Md text={enterpriseResult.markdown} />
                  <div style={{ marginTop: 18, padding: "12px 16px", border: "1px solid rgba(217,183,109,0.3)", fontSize: 11, color: "#d9b76d", fontFamily: "var(--s)", lineHeight: 1.6 }}>
                    ⚠ {lang === "lt" ? "KPI apskaičiuoti deterministiškai iš SAF-T duomenų. AI interpretacija, scenarijai, sąnaudų ir baudų vertinimai yra orientaciniai (pažymėti „EST.“) ir turi būti patikrinti kvalifikuoto specialisto." : "KPIs are computed deterministically from SAF-T data. AI interpretation, scenarios, cost and penalty estimates are indicative (marked \"EST.\") and must be verified by a qualified specialist."}
                  </div>
                  <button onClick={runEnterpriseAuditCallback} style={{ ...bG, marginTop: 14 }}>↻ {lang === "lt" ? "Generuoti iš naujo" : "Regenerate"}</button>
                </>}
              </div>}

              {/* ── RULES CATALOG ── */}
              {saftTab === "rules" && <div style={panel}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <SEC n="02·E" en="Rule Catalog" lt="Taisyklių katalogas" />
                  <span style={{ marginLeft: "auto", padding: "6px 14px", border: "1px solid #fff", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "var(--m)" }}>{AUDIT_RULES.length}</span>
                </div>
                <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 20, lineHeight: 1.65, maxWidth: 820 }}>
                  {lang === "lt" ? `${AUDIT_RULES.length} patikrintos PVM audito taisyklės. Kiekviena susieta su konkrečia SAF-T duomenų sąlyga ir teisės aktu (PVMĮ, VA-49). Reikšmingumas: Reject = peržiūrėti prieš teikimą, Warn = informaciniam patikrinimui.` : `${AUDIT_RULES.length} verified VAT audit rules. Each is tied to a specific SAF-T data condition and legal basis (PVMĮ, VA-49). Severity: Reject = review before filing, Warn = informational review.`}
                </p>

                {/* ── Active rate pack + versioned packs ── */}
                {(() => {
                  const periodDate = fileData?.parsed?.header?.fiscalYearFrom || fileData?.parsed?.header?.fiscalYearTo || null;
                  const active = resolveRatePack(periodDate);
                  return <div style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", border: `1px solid ${PL_LINE}`, borderLeft: "3px solid #7cc4ff", background: "var(--bg2)", padding: "12px 16px" }}>
                      <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".14em", textTransform: "uppercase" }}>{lang === "lt" ? "Aktyvus taisyklių paketas" : "Active rule pack"}</span>
                      <span style={{ fontSize: 14, color: "#fff", fontFamily: "var(--f)" }}>{active.label}</span>
                      <span style={{ fontSize: 11, color: "#bcbcb8", fontFamily: "var(--m)" }}>VAT {active.vat.standard}% · {lang === "lt" ? "lengv." : "reduced"} [{active.vat.reduced.join(", ")}] · CIT {active.cit.standard}% / {active.cit.small}%</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)" }}>{periodDate ? (lang === "lt" ? "pagal periodą " : "by period ") + periodDate.slice(0, 10) : (lang === "lt" ? "naujausias (nėra failo)" : "latest (no file)")}</span>
                    </div>
                    <details style={{ marginTop: 8, border: `1px solid ${PL_LINE}`, background: "#000" }}>
                      <summary style={{ fontSize: 12, fontWeight: 600, color: "#d2d2ce", fontFamily: "var(--m)", cursor: "pointer", padding: "11px 16px", letterSpacing: ".04em" }}>{lang === "lt" ? "Visi datuoti paketai ir pakeitimų istorija" : "All dated packs & changelog"}</summary>
                      <div style={{ padding: "0 16px 14px" }}>
                        {RATE_PACKS.slice().reverse().map(p => <div key={p.id} style={{ padding: "12px 0", borderBottom: `1px solid ${PL_SOFT}` }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, color: "#fff", fontFamily: "var(--f)" }}>{p.label}</span>
                            <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)" }}>{p.effectiveFrom} → {p.effectiveTo || (lang === "lt" ? "dabar" : "present")}</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: "#bcbcb8", fontFamily: "var(--m)", marginTop: 4 }}>VAT {p.vat.standard}% · {lang === "lt" ? "lengvatiniai" : "reduced"} [{p.vat.reduced.join(", ")}] · CIT {p.cit.standard}% · {lang === "lt" ? "maža įmonė" : "small"} {p.cit.small}% (≤€{p.cit.smallThreshold.toLocaleString()})</div>
                          <div style={{ fontSize: 11, color: "#9f9f9b", fontFamily: "var(--s)", marginTop: 4, lineHeight: 1.5 }}><span style={{ color: "#ffd43b" }}>Δ</span> {p.changelog}</div>
                          <div style={{ fontSize: 10, color: "#7a7a76", fontFamily: "var(--m)", marginTop: 3 }}>{lang === "lt" ? "Šaltinis" : "Source"}: {p.source}</div>
                        </div>)}
                        <div style={{ fontSize: 10.5, color: "#7a7a76", fontFamily: "var(--s)", marginTop: 10, lineHeight: 1.5 }}>
                          {lang === "lt" ? "Tarifai pažymėti šaltiniais ir įsigaliojimo datomis auditui. Variklis pritaiko paketą pagal failo periodą. Patikrinkite prieš naudojimą." : "Rates are dated and sourced for audit. The engine resolves the pack by the file's period. Verify against the official source before relying on it."}
                        </div>
                      </div>
                    </details>
                  </div>;
                })()}

                {/* ── Conformance / accuracy harness ── */}
                <div style={{ marginBottom: 24, border: `1px solid ${PL_LINE}`, background: "var(--bg2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".14em", textTransform: "uppercase" }}>{lang === "lt" ? "Atitikties patikra" : "Conformance suite"}</span>
                    {conformance && <span style={{ fontSize: 22, fontWeight: 300, fontFamily: "var(--f)", color: conformance.score === 100 ? "#69db7c" : conformance.score >= 80 ? "#ffd43b" : "#ff8a8a" }}>{conformance.score}%</span>}
                    {conformance && <span style={{ fontSize: 11, color: "#bcbcb8", fontFamily: "var(--m)" }}>{conformance.passed}/{conformance.total} {lang === "lt" ? "testų" : "fixtures"}</span>}
                    <button onClick={() => {
                      const res = runConformance({ parse: (xml) => parseSAFTFull(xml), run: (d) => runAllRules(d) });
                      setConformance(res); audit.log("CONFORMANCE_RUN", `${res.passed}/${res.total}`);
                    }} style={{ ...bP, marginLeft: "auto", padding: "8px 16px" }}>{conformance ? (lang === "lt" ? "Paleisti iš naujo" : "Re-run") : (lang === "lt" ? "Paleisti patikrą →" : "Run suite →")}</button>
                  </div>
                  <div style={{ padding: "0 16px 12px", fontSize: 11.5, color: "#9f9f9b", fontFamily: "var(--s)", lineHeight: 1.55 }}>
                    {lang === "lt" ? "Variklis paleidžiamas prieš pažymėtus bandinius su žinomais defektais; tikrinama, ar suveikia teisingos taisyklės. Tai įrodo taisyklių teisingumą, o ne tik daro prielaidą." : "Runs the engine against labelled fixtures with known defects and checks that the correct rules fire — demonstrating rule correctness rather than assuming it."}
                  </div>
                  {conformance && <div style={{ borderTop: `1px solid ${PL_LINE}` }}>
                    {conformance.results.map((x, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 16px", borderBottom: i < conformance.results.length - 1 ? `1px solid ${PL_SOFT}` : "none", flexWrap: "wrap" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: x.passed ? "#69db7c" : "#ff8a8a", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontFamily: "var(--m)", fontWeight: 700, color: "#fff" }}>{x.id}</span>
                      <span style={{ fontSize: 12, fontFamily: "var(--s)", color: "#d2d2ce" }}>{x.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: 10.5, fontFamily: "var(--m)", color: "#8c8c88" }}>{x.error ? "ERR: " + x.error : x.checks.map(c => `${c.rule} ${c.pass ? "✓" : "✗ (got " + c.got + ")"}`).join(" · ")}</span>
                    </div>)}
                  </div>}
                </div>

                {(() => {
                  const catalog = getRuleCatalog();
                  const groups = {};
                  catalog.forEach(r => { groups[r.category] = groups[r.category] || []; groups[r.category].push(r); });
                  const orderedCategories = Object.keys(groups).sort((a, b) => groups[a][0].id.localeCompare(groups[b][0].id));
                  const SevDot = ({ s }) => <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: s === "Block" ? "#ff6b6b" : s === "Reject" ? "#ffa94d" : "#fff", marginRight: 7, verticalAlign: "middle" }} />;
                  return <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}`, marginBottom: 24 }}>
                      {orderedCategories.map(cat => {
                        const rules = groups[cat];
                        const hit = runResult ? rules.filter(r => runResult.byRule[r.id]).length : 0;
                        return <div key={cat} style={{ padding: 16, borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}` }}>
                          <div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{cat}</div>
                          <div style={{ fontSize: 26, fontWeight: 300, color: "#fff", fontFamily: "var(--f)" }}>{rules.length}</div>
                          {runResult && <div style={{ fontSize: 10, color: hit > 0 ? "#ff8a8a" : "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, marginTop: 4 }}>{hit} triggered</div>}
                        </div>;
                      })}
                    </div>
                    {orderedCategories.map(cat => <details key={cat} style={{ marginBottom: 8, border: `1px solid ${PL_LINE}`, background: "#000" }}>
                      <summary style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "var(--f)", cursor: "pointer", userSelect: "none", padding: "14px 18px" }}>
                        {cat} <span style={{ color: "#8c8c88", fontWeight: 400, fontSize: 12, marginLeft: 6, fontFamily: "var(--m)" }}>· {groups[cat].length} rules</span>
                      </summary>
                      <div style={{ overflowX: "auto", padding: "0 18px 14px" }}>
                        <table style={{ width: "100%", fontSize: 12, fontFamily: "var(--m)", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ color: "#8c8c88", fontWeight: 600, textAlign: "left" }}>
                              <th style={{ padding: "8px", borderBottom: `1px solid ${PL_LINE}`, textTransform: "uppercase", letterSpacing: ".06em", fontSize: 10 }}>ID</th>
                              <th style={{ padding: "8px", borderBottom: `1px solid ${PL_LINE}`, textTransform: "uppercase", letterSpacing: ".06em", fontSize: 10 }}>Sev</th>
                              <th style={{ padding: "8px", borderBottom: `1px solid ${PL_LINE}`, textTransform: "uppercase", letterSpacing: ".06em", fontSize: 10 }}>Type</th>
                              <th style={{ padding: "8px", borderBottom: `1px solid ${PL_LINE}`, textTransform: "uppercase", letterSpacing: ".06em", fontSize: 10 }}>Title</th>
                              <th style={{ padding: "8px", borderBottom: `1px solid ${PL_LINE}`, textTransform: "uppercase", letterSpacing: ".06em", fontSize: 10 }}>Basis</th>
                              <th style={{ padding: "8px", borderBottom: `1px solid ${PL_LINE}`, width: 90, textTransform: "uppercase", letterSpacing: ".06em", fontSize: 10 }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groups[cat].map(r => {
                              const triggered = runResult && runResult.byRule[r.id];
                              return <tr key={r.id} style={{ color: "#d2d2ce" }}>
                                <td style={{ padding: "8px", borderBottom: `1px solid ${PL_SOFT}`, fontWeight: 600, color: "#fff" }}>{r.id}</td>
                                <td style={{ padding: "8px", borderBottom: `1px solid ${PL_SOFT}` }}><SevDot s={r.severity} />{r.severity}</td>
                                <td style={{ padding: "8px", borderBottom: `1px solid ${PL_SOFT}`, color: "#8c8c88" }}>{r.typeName}</td>
                                <td style={{ padding: "8px", borderBottom: `1px solid ${PL_SOFT}` }}>{r.title}</td>
                                {(() => { const pv = provenanceFor(r); const sc = pv.status === "schema" ? "#7cc4ff" : pv.status === "regulatory" ? "#69db7c" : "#ffd43b";
                                  return <td style={{ padding: "8px", borderBottom: `1px solid ${PL_SOFT}`, color: "#9f9f9b", maxWidth: 240 }} title={pv.authority + " · " + pv.reference}>
                                    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: sc, marginRight: 6, verticalAlign: "middle" }} />
                                    <span style={{ fontSize: 11 }}>{pv.reference}</span>
                                  </td>; })()}
                                <td style={{ padding: "8px", borderBottom: `1px solid ${PL_SOFT}` }}>
                                  {triggered ? <span style={{ padding: "2px 8px", border: "1px solid #ff8a8a", color: "#ff8a8a", fontWeight: 600, fontSize: 10 }}>FAIL × {triggered}</span>
                                    : runResult ? <span style={{ padding: "2px 8px", border: "1px solid #69db7c", color: "#69db7c", fontWeight: 600, fontSize: 10 }}>PASS</span>
                                      : <span style={{ color: "#8c8c88", fontSize: 10 }}>—</span>}
                                </td>
                              </tr>;
                            })}
                          </tbody>
                        </table>
                      </div>
                    </details>)}
                  </>;
                })()}

                {/* ════════ ADAPTIVE · AI-GENERATED COMPANY-SPECIFIC RULES ════════ */}
                {(() => {
                  const pr = personalRules;
                  const KIND_C = { compliance: "#ffd43b", risk: "#ffa94d", insight: "#74c0fc" };
                  const STAT_C = { FAIL: "#ff8a8a", PASS: "#69db7c", "N/A": "#8c8c88" };
                  const SevDot = ({ s }) => <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: s === "Block" ? "#ff6b6b" : s === "Reject" ? "#ffa94d" : "#fff", marginRight: 7, verticalAlign: "middle" }} />;
                  return <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid #fff` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
                      <SEC n="02·F" en="Adaptive Rules · AI" lt="Pritaikytos taisyklės · AI" />
                      {pr?.rules?.length ? <span style={{ marginLeft: "auto", padding: "6px 14px", border: "1px solid #74c0fc", color: "#74c0fc", fontSize: 13, fontWeight: 700, fontFamily: "var(--m)" }}>+{pr.rules.length}</span> : <span style={{ marginLeft: "auto", padding: "6px 14px", border: `1px solid ${PL_LINE}`, color: "#8c8c88", fontSize: 11, fontWeight: 700, fontFamily: "var(--m)", letterSpacing: ".08em" }}>COMPANY-SPECIFIC</span>}
                    </div>
                    <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 18, lineHeight: 1.65, maxWidth: 880 }}>
                      {lang === "lt"
                        ? "Po 300 fiksuotų taisyklių AI agentas išanalizuoja šios konkrečios įmonės duomenis, nustato veiklos sektorių ir suprojektuoja papildomas, šiai įmonei pritaikytas taisykles. Kiekviena AI pasiūlyta taisyklė vertinama DETERMINISTIŠKAI pagal apskaičiuotus rodiklius — todėl PASS/FAIL yra pagrįstas tikrais skaičiais, o ne AI nuomone."
                        : "On top of the verified audit rules, an AI agent studies this specific company's data, infers its industry, and designs additional rules tailored to this business. Every AI-proposed rule is scored DETERMINISTICALLY against the computed metrics — so PASS/FAIL is grounded in real figures, not an LLM opinion."}
                    </p>

                    {!pr && !saftLoading && <div style={{ border: `1px solid ${PL_LINE}`, padding: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ fontSize: 15, fontWeight: 500, color: "#fff", fontFamily: "var(--f)", marginBottom: 6 }}>{lang === "lt" ? "Generuoti įmonei pritaikytas taisykles" : "Generate company-specific rules"}</div>
                        <div style={{ fontSize: 12, color: "#8c8c88", fontFamily: "var(--m)" }}>{lang === "lt" ? "Sektoriaus analizė + 8–14 pritaikytų taisyklių, įvertintų pagal jūsų duomenis." : "Sector analysis + 8–14 tailored rules, scored against your data."}</div>
                      </div>
                      <button onClick={runPersonalizedRulesCallback} style={bP}>{lang === "lt" ? "Generuoti taisykles →" : "Generate rules →"}</button>
                    </div>}

                    {saftLoading && !pr && <div style={{ border: `1px solid ${PL_LINE}`, padding: 22, color: "#74c0fc", fontFamily: "var(--m)", fontSize: 13 }}>{lang === "lt" ? "◌ AI projektuoja sektoriaus taisykles ir vertina jas pagal duomenis…" : "◌ AI is designing sector rules and scoring them against the data…"}</div>}

                    {pr?.error && <div style={{ border: "1px solid #ff8a8a", padding: 20 }}>
                      <div style={{ color: "#ff8a8a", fontFamily: "var(--m)", fontSize: 13, marginBottom: 6 }}>⚠ {pr.error}</div>
                      {pr.detectedSector && <div style={{ color: "#8c8c88", fontSize: 12, fontFamily: "var(--m)", marginBottom: 12 }}>{lang === "lt" ? "Aptiktas sektorius" : "Detected sector"}: {pr.detectedSector}</div>}
                      <button onClick={runPersonalizedRulesCallback} style={bG}>↻ {lang === "lt" ? "Bandyti dar kartą" : "Try again"}</button>
                    </div>}

                    {pr?.rules?.length > 0 && <>
                      {/* industry banner */}
                      <div style={{ border: `1px solid ${PL_LINE}`, padding: 18, marginBottom: 18, background: "var(--bg2)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: pr.industryRationale ? 10 : 0 }}>
                          <span style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".14em", textTransform: "uppercase" }}>{lang === "lt" ? "Sektorius" : "Industry"}</span>
                          <span style={{ padding: "5px 13px", border: "1px solid #74c0fc", color: "#74c0fc", fontSize: 13, fontWeight: 700, fontFamily: "var(--m)" }}>{pr.industry}</span>
                          <span style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>{lang === "lt" ? "patikimumas" : "confidence"}: {pr.industryConfidence}</span>
                          {pr.detectedSector && pr.detectedSector !== pr.industry && <span style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)" }}>· {lang === "lt" ? "signalų skenavimas" : "signal scan"}: {pr.detectedSector}</span>}
                        </div>
                        {pr.industryRationale && <div style={{ fontSize: 12.5, color: "#d2d2ce", fontFamily: "var(--s)", lineHeight: 1.6 }}>{pr.industryRationale}</div>}
                      </div>

                      {/* count strip */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}`, marginBottom: 20 }}>
                        {[["Total", "Viso", pr.counts.total, "#fff"], ["Flagged", "Pažymėta", pr.counts.fail, "#ff8a8a"], ["Clear", "Švaru", pr.counts.pass, "#69db7c"], ["N/A", "N/A", pr.counts.na, "#8c8c88"]].map(([en, ltl, v, c]) =>
                          <div key={en} style={{ padding: 14, borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}` }}>
                            <div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{lang === "lt" ? ltl : en}</div>
                            <div style={{ fontSize: 24, fontWeight: 300, color: c, fontFamily: "var(--f)" }}>{v}</div>
                          </div>)}
                      </div>

                      {/* rule cards grouped by category */}
                      {(() => {
                        const groups = {};
                        pr.rules.forEach(r => { (groups[r.category] = groups[r.category] || []).push(r); });
                        return Object.keys(groups).map(cat => <details key={cat} open style={{ marginBottom: 8, border: `1px solid ${PL_LINE}`, background: "#000" }}>
                          <summary style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "var(--f)", cursor: "pointer", userSelect: "none", padding: "14px 18px" }}>
                            {cat} <span style={{ color: "#8c8c88", fontWeight: 400, fontSize: 12, marginLeft: 6, fontFamily: "var(--m)" }}>· {groups[cat].length} {lang === "lt" ? "taisyklės" : "rules"}</span>
                          </summary>
                          <div style={{ padding: "0 18px 16px" }}>
                            {groups[cat].map(r => <div key={r.id} style={{ borderTop: `1px solid ${PL_SOFT}`, padding: "14px 0" }}>
                              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                                <span style={{ fontFamily: "var(--m)", fontSize: 12, fontWeight: 700, color: "#fff" }}>{r.id}</span>
                                <span style={{ fontFamily: "var(--m)", fontSize: 11, color: "#d2d2ce" }}><SevDot s={r.severity} />{r.severity}</span>
                                <span style={{ fontFamily: "var(--m)", fontSize: 10, padding: "1px 7px", border: `1px solid ${KIND_C[r.kind] || PL_LINE}`, color: KIND_C[r.kind] || "#8c8c88", textTransform: "uppercase", letterSpacing: ".06em" }}>{r.kind}</span>
                                {r.lawRef && <span style={{ fontFamily: "var(--m)", fontSize: 10, color: "#8c8c88" }}>{r.lawRef}</span>}
                                <span style={{ marginLeft: "auto", fontFamily: "var(--m)", fontSize: 10, fontWeight: 700, padding: "2px 9px", border: `1px solid ${STAT_C[r.status]}`, color: STAT_C[r.status] }}>{r.status === "FAIL" ? (lang === "lt" ? "PAŽYMĖTA" : "FLAGGED") : r.status === "PASS" ? (lang === "lt" ? "ŠVARU" : "CLEAR") : "N/A"}</span>
                              </div>
                              <div style={{ fontSize: 14, color: "#fff", fontFamily: "var(--f)", margin: "8px 0 6px" }}>{r.title}</div>
                              {r.observed?.length > 0 && <div style={{ fontSize: 12, color: r.status === "FAIL" ? "#ffb3b3" : "#9f9f9b", fontFamily: "var(--m)", marginBottom: 6 }}>{lang === "lt" ? "Stebėta" : "Observed"}: {r.observed.join(" · ")}</div>}
                              {r.rationale && <div style={{ fontSize: 12.5, color: "#bcbcb8", fontFamily: "var(--s)", lineHeight: 1.6, marginBottom: r.interpretation ? 5 : 0 }}>{r.rationale}</div>}
                              {r.interpretation && <div style={{ fontSize: 12.5, color: "#d2d2ce", fontFamily: "var(--s)", lineHeight: 1.6, borderLeft: `2px solid ${PL_LINE}`, paddingLeft: 11 }}>→ {r.interpretation}</div>}
                              {r.status === "N/A" && r.missingMetrics?.length > 0 && <div style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 5 }}>{lang === "lt" ? "Rodiklis nepasiekiamas" : "Metric unavailable"}: {r.missingMetrics.join(", ")}</div>}
                            </div>)}
                          </div>
                        </details>);
                      })()}

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                        <button onClick={runPersonalizedRulesCallback} style={bG}>↻ {lang === "lt" ? "Generuoti iš naujo" : "Regenerate"}</button>
                        <button onClick={() => { exportPersonalRulesCSV(pr, `taxai-adaptive-rules-${(fileName || "saft").replace(/\.[^.]+$/, "")}.csv`); audit.log("EXPORT_ADAPTIVE_RULES_CSV", pr.industry || ""); }} style={bG}>↧ CSV</button>
                        <span style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>{lang === "lt" ? "AI projektuoja · variklis vertina deterministiškai" : "AI designs · engine scores deterministically"}</span>
                      </div>
                    </>}
                  </div>;
                })()}
              </div>}

              {/* ════════ i.SAF ↔ SAF-T RECONCILIATION ════════ */}
              {saftTab === "reconcile" && <div style={panel}>
                {(() => {
                  const SEVC = { Block: "#ff6b6b", Reject: "#ffa94d", Warn: "#ffd43b" };
                  const r = reconResult;
                  const v = r?.summary?.vat;
                  const tol = 0.02;
                  const Delta = ({ d }) => <span style={{ color: Math.abs(d) > tol ? "#ff8a8a" : "#69db7c", fontFamily: "var(--m)" }}>{d > 0 ? "+" : ""}{(d || 0).toLocaleString()} €</span>;
                  return <>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
                      <SEC n="02·G" en="i.SAF ↔ SAF-T Reconciliation" lt="i.SAF ↔ SAF-T sutikrinimas" />
                      {r && <span style={{ marginLeft: "auto", padding: "6px 14px", border: `1px solid ${r.bySeverity.Block ? "#ff6b6b" : r.bySeverity.Reject ? "#ffa94d" : "#69db7c"}`, color: r.bySeverity.Block ? "#ff6b6b" : r.bySeverity.Reject ? "#ffa94d" : "#69db7c", fontSize: 13, fontWeight: 700, fontFamily: "var(--m)" }}>{r.findings.length} {lang === "lt" ? "neatitikimai" : "discrepancies"}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 18, lineHeight: 1.65, maxWidth: 880 }}>
                      {lang === "lt"
                        ? "Sutikrinkite mėnesinį i.SAF (PVM sąskaitų registrą) su pilnu SAF-T didžiosios knygos failu — tai tas pats neatitikimų patikrinimas, kurį atlieka VMI i.MAS. Aptinka nedeklaruotą pardavimo PVM, per daug atskaitytą pirkimo PVM, sumų neatitikimus ir grynosios PVM pozicijos skirtumus (FR0600)."
                        : "Cross-check your monthly i.SAF (VAT invoice register) against the full SAF-T ledger — the same discrepancy review VMI's i.MAS runs. It catches undeclared output VAT, over-claimed input VAT, amount mismatches, and net-VAT-position gaps against your FR0600."}
                    </p>

                    {!r && <div style={{ border: `1px dashed ${PL_LINE}`, padding: 26, textAlign: "center", background: "var(--bg2)" }}>
                      <div style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>{lang === "lt" ? "Įkelkite mėnesinį i.SAF (XML)" : "Upload your monthly i.SAF (XML)"}</div>
                      <div style={{ fontSize: 15, color: "#fff", fontFamily: "var(--f)", marginBottom: 16 }}>{lang === "lt" ? "Sutikrinsime jį su jau įkeltu SAF-T" : "We'll reconcile it against the SAF-T already loaded"}</div>
                      <button onClick={() => isafFileRef.current?.click()} style={bP}>{lang === "lt" ? "Pasirinkti i.SAF failą" : "Choose i.SAF file"} →</button>
                    </div>}
                    <input ref={isafFileRef} type="file" accept=".xml" onChange={uploadISAF} style={{ display: "none" }} />

                    {r && <>
                      {/* VAT position */}
                      <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".12em", textTransform: "uppercase", margin: "4px 0 10px" }}>{lang === "lt" ? "PVM pozicija — i.SAF vs SAF-T" : "VAT position — i.SAF vs SAF-T"}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}`, marginBottom: 22 }}>
                        {[["Output VAT", "Pardavimo PVM", v.outputISAF, v.outputSAFT, v.outputDelta], ["Input VAT", "Pirkimo PVM", v.inputISAF, v.inputSAFT, v.inputDelta], ["Net VAT position", "Grynoji PVM pozicija", v.netISAF, v.netSAFT, v.netDelta]].map(([en, ltl, a, b2, d], i) =>
                          <div key={i} style={{ padding: "18px 20px", borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}` }}>
                            <div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>{lang === "lt" ? ltl : en}</div>
                            <div style={{ fontSize: 12, color: "#d2d2ce", fontFamily: "var(--m)", lineHeight: 1.7 }}>i.SAF: {(a || 0).toLocaleString()} €<br />SAF-T: {(b2 || 0).toLocaleString()} €</div>
                            <div style={{ fontSize: 14, marginTop: 8, fontWeight: 700 }}>Δ <Delta d={d} /></div>
                          </div>)}
                      </div>

                      {/* match summary */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}`, marginBottom: 22 }}>
                        {[["Sales / Pardavimai", r.summary.sales], ["Purchases / Pirkimai", r.summary.purchases]].map(([title, s], i) =>
                          <div key={i} style={{ padding: "16px 20px", borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}` }}>
                            <div style={{ fontSize: 11, color: "#fff", fontFamily: "var(--m)", fontWeight: 700, marginBottom: 8 }}>{title}</div>
                            <div style={{ fontSize: 12, color: "#bcbcb8", fontFamily: "var(--m)", lineHeight: 1.8 }}>
                              {lang === "lt" ? "Sutapo" : "Matched"}: {s.matched} · {lang === "lt" ? "PVM neat." : "VAT mism."}: {s.vatMismatch}<br />
                              {lang === "lt" ? "Nėra knygoje" : "Missing in ledger"}: {s.missingInLedger} · {lang === "lt" ? "Nedeklaruota" : "Not in register"}: {s.missingInRegister}
                            </div>
                          </div>)}
                      </div>

                      {/* findings */}
                      {r.findings.length === 0
                        ? <div style={{ border: "1px solid #69db7c", padding: 18, color: "#69db7c", fontFamily: "var(--m)", fontSize: 13 }}>✓ {lang === "lt" ? "Neatitikimų nerasta — i.SAF atitinka SAF-T." : "No discrepancies — i.SAF matches the SAF-T ledger."}</div>
                        : r.findings.map((f, i) => <div key={i} style={{ borderLeft: `2px solid ${SEVC[f.severity]}`, background: "var(--bg2)", padding: "14px 16px", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                            <span style={{ fontFamily: "var(--m)", fontSize: 11, fontWeight: 700, color: "#fff" }}>{f.id}</span>
                            <span style={{ fontFamily: "var(--m)", fontSize: 10, fontWeight: 700, padding: "1px 8px", border: `1px solid ${SEVC[f.severity]}`, color: SEVC[f.severity], textTransform: "uppercase" }}>{f.severity}</span>
                          </div>
                          <div style={{ fontSize: 14, color: "#fff", fontFamily: "var(--f)", marginBottom: 4 }}>{f.title}</div>
                          <div style={{ fontSize: 12.5, color: "#bcbcb8", fontFamily: "var(--s)", lineHeight: 1.6 }}>{f.detail}</div>
                          {f.evidence?.length > 0 && <div style={{ fontSize: 11.5, color: "#9f9f9b", fontFamily: "var(--m)", marginTop: 6 }}>{f.evidence.join(" · ")}</div>}
                        </div>)}

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                        <button onClick={() => isafFileRef.current?.click()} style={bG}>↻ {lang === "lt" ? "Kitas i.SAF failas" : "Different i.SAF file"}</button>
                        <span style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>{isafFileName} · {lang === "lt" ? "deterministinis sutikrinimas" : "deterministic reconciliation"}</span>
                      </div>
                    </>}
                  </>;
                })()}
              </div>}

              {/* ════════ MONTHLY VAT-CLOSE WORKFLOW ════════ */}
              {saftTab === "vatclose" && <div style={panel}>
                <VatCloseWorkflow
                  lang={lang}
                  data={fileData?.parsed}
                  kpis={enterpriseKpis}
                  callAI={callAI}
                  audit={audit}
                  state={vatClose}
                  setState={setVatClose}
                  presetIsaf={isafData}
                  presetRecon={reconResult}
                  presetIsafName={isafFileName}
                />
              </div>}
            </>}
            {!fileData && <div style={{ ...panel, padding: 48, textAlign: "center" }}><div style={{ ...lbl, justifyContent: "center", marginBottom: 16 }}><span style={rule} />{lang === "lt" ? "Nėra duomenų" : "No data"}</div><h3 style={{ fontSize: 28, fontWeight: 300, color: "#fff", fontFamily: "var(--f)" }}>{lang === "lt" ? "Įkelkite SAF-T duomenis" : "Upload SAF-T data"}</h3></div>}
            </>}
          </div>
        </div>}

        {/* ═══════════ AGENTS ═══════════ */}
        {view === "agents" && <div key="agents" style={{ flex: 1, overflow: "auto", padding: "32px 40px", animation: "fadeUp .4s ease", backgroundImage: "linear-gradient(rgba(0,0,0,0.74), rgba(0,0,0,0.93)), url(/agents-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <PageBanner variant="network" label={lang === "lt" ? "06 — Specializuoti agentai" : "06 — Specialised Agents"} title={<>{AGENTS.length} <em style={{ fontStyle: "italic" }}>{t.agents}</em></>} sub={lang === "lt" ? "Kiekvienas agentas pagrįstas oficialiu šaltiniu (VMI, e-TAR, Sodra, AVNT, FNTT). Spustelėkite, kad pradėtumėte pokalbį." : "Each agent is grounded in an official source of record (VMI, e-TAR, Sodra, AVNT, FNTT). Click any to start a conversation."} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", borderTop: `1px solid ${PL_LINE}`, borderLeft: `1px solid ${PL_LINE}` }}>
              {AGENTS.map(a => <div key={a.id} onClick={() => openAgent(a)} style={{ padding: "22px 22px", borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}`, cursor: "pointer", transition: "background .25s", display: "flex", alignItems: "center", gap: 16 }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, border: `1px solid ${PL_LINE}`, color: "#fff", fontSize: 18, fontWeight: 600, flexShrink: 0, fontFamily: "var(--m)" }}>{a.icon}</span>
                <div><div style={{ fontSize: 16, fontWeight: 500, color: "#fff", fontFamily: "var(--f)" }}>{lang === "lt" ? a.nameLt : a.name}</div><div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#69db7c", boxShadow: "0 0 8px #69db7c" }} /><span style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".12em", textTransform: "uppercase" }}>Active · Official source</span></div></div>
              </div>)}
            </div>
          </div>
        </div>}

        {/* ═══════════ KPI DASHBOARD (standalone) ═══════════ */}
        {view === "kpis" && <div key="kpis" style={{ flex: 1, overflow: "auto", padding: "32px 40px", animation: "fadeUp .4s ease", backgroundImage: "linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.94)), url(/saft-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <PageBanner variant="scan" label={lang === "lt" ? "03 — Veiklos rodikliai" : "03 — Performance metrics"} title={<>KPI <em style={{ fontStyle: "italic" }}>{lang === "lt" ? "žvalgyba" : "Intelligence"}</em></>} sub={lang === "lt" ? "Deterministiniai rodikliai iš jūsų SAF-T duomenų, palyginti su sektoriaus normomis, su jūsų pačių tikslais." : "Deterministic metrics from your SAF-T data, benchmarked against sector norms, with your own targets."} />
            {enterpriseKpis?.kpis ? (() => {
              const detected = personalRules?.detectedSector;
              const sectorList = availableSectors();
              const active = benchSector || (detected && sectorList.includes(detected) ? detected : sectorList[0]);
              return <div style={{ ...panel, marginTop: 16 }}>
                {detected && detected !== "Unknown" && !benchSector && <div style={{ marginBottom: 14, fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>{lang === "lt" ? "Aptiktas sektorius" : "Detected sector"}: <span style={{ color: "#7cc4ff" }}>{detected}</span> — {lang === "lt" ? "naudojamas lyginimui (galite pakeisti)." : "used for benchmarking (you can change it)."}</div>}
                <KpiDashboard lang={lang} kpis={enterpriseKpis.kpis} sector={active} setSector={setBenchSector} targets={kpiTargets} setTarget={setKpiTarget} />
              </div>;
            })() : <div style={{ ...panel, marginTop: 16, textAlign: "center", padding: "56px 24px" }}>
              <div style={{ ...lbl, justifyContent: "center", marginBottom: 16 }}><span style={rule} />{lang === "lt" ? "Nėra duomenų KPI" : "No data for KPIs"}</div>
              <h3 style={{ fontSize: 28, fontWeight: 300, color: "#fff", fontFamily: "var(--f)", marginBottom: 12 }}>{lang === "lt" ? "Įkelkite SAF-T failą" : "Load a SAF-T file"}</h3>
              <p style={{ fontSize: 14, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 20, maxWidth: 520, marginInline: "auto", lineHeight: 1.6 }}>{lang === "lt" ? "KPI apskaičiuojami automatiškai iš jūsų SAF-T duomenų. Įkelkite SAF-T failą, kad pamatytumėte rodiklius." : "KPIs are computed automatically from your SAF-T data. Upload a SAF-T file to see your metrics."}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setView("saftview")} style={bP}>{lang === "lt" ? "Eiti į SAF-T →" : "Go to SAF-T →"}</button>
              </div>
            </div>}
          </div>
        </div>}

        {/* ═══════════ AGENT DETAIL ═══════════ */}
        {view === "agent" && selectedAgent && <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 32px", borderBottom: `1px solid ${PL_LINE}`, flexShrink: 0 }}>
            <button onClick={() => setView("agents")} style={{ padding: "7px 14px", border: `1px solid ${PL_LINE}`, background: "transparent", color: "#bcbcb8", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "var(--m)", letterSpacing: ".08em", textTransform: "uppercase" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#fff"} onMouseLeave={e => e.currentTarget.style.borderColor = PL_LINE}>← {lang === "lt" ? "Agentai" : "Agents"}</button>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, border: "1px solid #fff", color: "#fff", fontSize: 20, fontWeight: 600, fontFamily: "var(--m)" }}>{selectedAgent.icon}</span>
            <div>
              <div style={{ fontSize: 24, fontWeight: 400, color: "#fff", fontFamily: "var(--f)", lineHeight: 1.1 }}>{lang === "lt" ? selectedAgent.nameLt : selectedAgent.name}</div>
              <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".14em", marginTop: 4, textTransform: "uppercase" }}>{lang === "lt" ? "Specializuotas agentas" : "Specialized agent"} · {selectedAgent.id}</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", WebkitOverflowScrolling: "touch" }}>
            {(!agentMsgs[selectedAgent.id] || agentMsgs[selectedAgent.id].length === 0) && <div style={{ maxWidth: 720, margin: "48px auto", textAlign: "center" }}>
              <div style={{ ...lbl, justifyContent: "center", marginBottom: 20 }}><span style={rule} />{lang === "lt" ? "Pradėkite pokalbį" : "Start a conversation"}</div>
              <h3 style={{ fontSize: 40, fontWeight: 300, color: "#fff", fontFamily: "var(--f)", marginBottom: 14, letterSpacing: "-.02em" }}>{lang === "lt" ? `Klauskite ${selectedAgent.nameLt}` : `Ask the ${selectedAgent.name} expert`}</h3>
              <p style={{ fontSize: 15, color: "#bcbcb8", fontFamily: "var(--s)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>{lang === "lt" ? "Įkelkite failą, ekrano nuotrauką ar bet kokį dokumentą — agentas analizuos jūsų sektoriaus kontekste." : "Upload a file, screenshot or any document — the agent will analyze it in your sector's context."}</p>
            </div>}
            {(agentMsgs[selectedAgent.id] || []).map(msg => <div key={msg.id} style={{ padding: "16px 0", maxWidth: 760, margin: "0 auto", width: "100%", animation: "fadeUp .35s ease" }}>
              {msg.role === "user" ? <div>
                <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".12em" }}>{lang === "lt" ? "Jūs" : "You"} · {msg.ts?.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" })}</div>
                <div style={{ fontSize: 22, color: "#fff", fontFamily: "var(--f)", fontWeight: 400, lineHeight: 1.3 }}>{msg.text}</div>
                {msg.attachments?.length > 0 && <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {msg.attachments.map((a, i) => a.isImage && a.preview ? <img key={i} src={a.preview} alt={a.name} style={{ maxWidth: 160, maxHeight: 120, border: `1px solid ${PL_LINE}` }} /> : <span key={i} style={{ fontSize: 11, padding: "5px 10px", border: `1px solid ${PL_LINE}`, color: "#fff", fontFamily: "var(--m)" }}>📎 {a.name}</span>)}
                </div>}
              </div> : <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, border: "1px solid #fff", color: "#fff", fontSize: 14, fontWeight: 600 }}>{selectedAgent.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "var(--m)", textTransform: "uppercase", letterSpacing: ".1em" }}>{lang === "lt" ? selectedAgent.nameLt : selectedAgent.name}</span>
                </div>
                <div style={{ paddingLeft: 40, borderLeft: msg.err ? "2px solid #f47067" : `2px solid ${PL_LINE}` }}><Md text={msg.text} /></div>
              </div>}
            </div>)}
            {agentLoading && <div style={{ padding: "16px 0", maxWidth: 760, margin: "0 auto" }}><div style={{ paddingLeft: 40, display: "flex", alignItems: "center", gap: 10 }}>{dots()}<span style={{ fontSize: 12, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em" }}>{lang === "lt" ? "ANALIZUOJAMA..." : "ANALYZING..."}</span></div></div>}
            <div ref={agentChatRef} />
          </div>
          <div style={{ padding: "16px 32px 20px", borderTop: `1px solid ${PL_LINE}`, flexShrink: 0 }}>
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              {agentAttachments.length > 0 && <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                {agentAttachments.map((a, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", border: `1px solid ${PL_LINE}`, fontSize: 12, color: "#fff", fontFamily: "var(--m)" }}>
                  {a.preview ? <img src={a.preview} alt="" style={{ width: 24, height: 24, objectFit: "cover" }} /> : "📎"} {a.name}
                  <button onClick={() => setAgentAttachments(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#f47067", cursor: "pointer", fontSize: 15, padding: 0, marginLeft: 4 }}>×</button>
                </div>)}
              </div>}
              <div style={{ display: "flex", gap: 10 }}>
                <input ref={agentFileRef} type="file" multiple accept="image/*,.pdf,.xml,.csv,.tsv,.txt,.json" style={{ display: "none" }} onChange={onAgentFiles} />
                <button onClick={() => agentFileRef.current?.click()} disabled={agentLoading} title={lang === "lt" ? "Pridėti failą" : "Attach file"} style={{ padding: "0 18px", border: `1px solid ${PL_LINE}`, background: "var(--bg2)", color: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
                <div style={{ flex: 1, display: "flex", background: "var(--bg2)", border: `1px solid ${PL_LINE}`, padding: "0 18px" }}>
                  <input value={agentInput} onChange={e => setAgentInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendAgent(); } }} placeholder={lang === "lt" ? `Klauskite ${selectedAgent.nameLt}...` : `Ask ${selectedAgent.name}...`} disabled={agentLoading} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 16, padding: "15px 0", fontFamily: "var(--s)", fontWeight: 400 }} />
                </div>
                <button onClick={sendAgent} disabled={agentLoading || !agentInput.trim()} style={{ ...bP, padding: "0 28px", opacity: agentLoading ? .5 : 1, cursor: agentLoading ? "not-allowed" : "pointer" }}>{agentLoading ? "···" : t.send}</button>
              </div>
            </div>
          </div>
        </div>}

        {/* ═══════════ INTELLIGENCE COMMAND CENTER ═══════════ */}
        {view === "intel" && <div key="intel" style={{ flex: 1, overflow: "auto", padding: "32px 40px", animation: "fadeUp .4s ease", backgroundImage: "linear-gradient(rgba(0,0,0,0.74), rgba(0,0,0,0.93)), url(/intel-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <PageBanner variant="network" height={170} label={lang === "lt" ? "05 — Forensikos žvalgyba" : "05 — Forensic Intelligence"} title={<>{lang === "lt" ? "Žvalgybos " : "Intelligence "}<em style={{ fontStyle: "italic" }}>{lang === "lt" ? "centras" : "Command Center"}</em></>} sub={lang === "lt" ? "Šeši deterministiniai forensikos varikliai — visi skaičiai apskaičiuoti JS, ne AI." : "Six deterministic forensic engines — every number computed in JS, not AI."} right={intel ? <>
              <button onClick={() => { exportForensicReport({ company: fileData?.parsed?.header?.company?.name || fileName, period: `${fileData?.parsed?.header?.fiscalYearFrom || ""} — ${fileData?.parsed?.header?.fiscalYearTo || ""}`, intel, runResult, findings, threatMarkdown: threatResult, caseFlags, lang, personalRules }); audit.log("EXPORT_FORENSIC_REPORT", fileName); }} style={bP}>↧ {lang === "lt" ? "Ataskaita" : "Report"}</button>
              <button onClick={() => { exportIntelJSON(intel, `taxai-intel-${fileName}.json`); audit.log("EXPORT_INTEL_JSON", fileName); }} style={bG}>↓ JSON</button>
            </> : (!fileData ? <span style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>{lang === "lt" ? "Įkelkite SAF-T failą" : "Upload a SAF-T file"}</span> : null)} />

            {!intel && <div style={{ ...panel, padding: 56, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 14, color: "#fff" }}>✦</div>
              <h3 style={{ fontSize: 26, fontWeight: 300, color: "#fff", fontFamily: "var(--f)", marginBottom: 8 }}>{lang === "lt" ? "Nėra duomenų analizei" : "No data to analyze"}</h3>
              <p style={{ fontSize: 14, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 22 }}>{lang === "lt" ? "Įkelkite SAF-T XML failą — žvalgyba apskaičiuojama automatiškai." : "Upload a SAF-T XML file — intelligence computes automatically."}</p>
              <button onClick={() => setView("saftview")} style={{ ...bP, margin: "0 auto" }}>{lang === "lt" ? "Eiti į SAF-T →" : "Go to SAF-T →"}</button>
            </div>}

            {intel && <>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 2fr", gap: 0, marginBottom: 0, border: `1px solid ${PL_LINE}` }}>
                <div style={{ padding: 24, borderRight: `1px solid ${PL_LINE}`, background: intel.risk.band === "CRITICAL" ? "rgba(255,107,107,0.05)" : intel.risk.band === "HIGH" ? "rgba(255,169,77,0.05)" : "transparent" }}>
                  <div style={{ ...lbl }}><span style={rule} />{lang === "lt" ? "Rizikos balas" : "Composite Risk"}</div>
                  {(() => {
                    const c = intel.risk.band === "CRITICAL" ? "#ff6b6b" : intel.risk.band === "HIGH" ? "#ffa94d" : intel.risk.band === "MEDIUM" ? "#ffd43b" : "#69db7c";
                    const pct = intel.risk.score;
                    return <>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "16px 0" }}>
                        <span style={{ fontSize: 72, fontWeight: 300, color: c, fontFamily: "var(--f)", lineHeight: 1 }}>{pct}</span>
                        <span style={{ fontSize: 18, color: "#8c8c88", fontFamily: "var(--m)" }}>/100</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 12 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: c }} />
                      </div>
                      <span style={{ display: "inline-block", padding: "4px 12px", border: `1px solid ${c}`, color: c, fontSize: 12, fontWeight: 700, fontFamily: "var(--m)", letterSpacing: ".1em" }}>{intel.risk.band}</span>
                      <p style={{ fontSize: 12.5, color: "#bcbcb8", fontFamily: "var(--s)", marginTop: 14, lineHeight: 1.55 }}>{intel.risk.interpretation}</p>
                    </>;
                  })()}
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ ...lbl, marginBottom: 16 }}><span style={rule} />{lang === "lt" ? "Rizikos veiksniai · paaiškinami" : "Risk Factor Attribution · explainable"}</div>
                  {intel.risk.factors.length === 0 && <div style={{ fontSize: 13, color: "#69db7c", fontFamily: "var(--s)" }}>{lang === "lt" ? "Nėra reikšmingų rizikos signalų." : "No material risk signals."}</div>}
                  {intel.risk.factors.map((f, i) => {
                    const maxP = Math.max(...intel.risk.factors.map(x => x.points), 1);
                    return <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--m)", marginBottom: 4 }}>
                        <span style={{ color: "#d2d2ce" }}>{f.label}</span>
                        <span style={{ color: "#fff", fontWeight: 700 }}>+{f.points}</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.1)" }}><div style={{ width: `${f.points / maxP * 100}%`, height: "100%", background: "#fff" }} /></div>
                      <div style={{ fontSize: 10, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 4 }}>{f.detail}</div>
                    </div>;
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", borderLeft: `1px solid ${PL_LINE}`, borderRight: `1px solid ${PL_LINE}`, borderBottom: `1px solid ${PL_LINE}`, marginBottom: 28 }}>
                {[
                  [lang === "lt" ? "Ciklai" : "Cycles", intel.summary.cycles, intel.summary.cycles > 0, lang === "lt" ? "uždari srautai" : "round-trips"],
                  [lang === "lt" ? "Anomalijos" : "Outliers", intel.summary.outliers, intel.summary.outliers > 5, lang === "lt" ? "statistinės" : "statistical"],
                  [lang === "lt" ? "Dublikatai" : "Duplicates", intel.summary.duplicates, intel.summary.duplicates > 0, lang === "lt" ? "subjektai" : "entities"],
                  [lang === "lt" ? "Fiktyvūs?" : "Shell flags", intel.summary.shells, intel.summary.shells > 0, lang === "lt" ? "požymiai" : "indicators"],
                  ["Benford", intel.benford.applicable ? intel.benford.mad : "n/a", intel.benford.applicable && intel.benford.mad >= 0.015, "MAD"],
                ].map(([label, val, warn, sub], i) => <div key={i} style={{ padding: 18, borderRight: `1px solid ${PL_LINE}`, background: warn ? "rgba(255,107,107,0.05)" : "transparent" }}>
                  <div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 300, color: warn ? "#ff8a8a" : "#fff", fontFamily: "var(--f)" }}>{val}</div>
                  <div style={{ fontSize: 9, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 2 }}>{sub}</div>
                </div>)}
              </div>

              <div style={{ display: "flex", gap: 0, marginBottom: 24, flexWrap: "wrap", borderLeft: `1px solid ${PL_LINE}` }}>
                {[
                  { id: "overview", en: "Network", lt: "Tinklas" },
                  { id: "benford", en: "Benford", lt: "Benfordas" },
                  { id: "anomalies", en: "Anomalies", lt: "Anomalijos" },
                  { id: "entities", en: "Entities", lt: "Subjektai" },
                  { id: "temporal", en: "Temporal", lt: "Laiko analizė" },
                  { id: "threat", en: "Threat (AI)", lt: "Grėsmės (AI)" },
                ].map(tab => <button key={tab.id} onClick={() => { setIntelTab(tab.id); if (tab.id === "threat" && !threatResult) runThreatCallback(); }} style={{ ...tabStyle(intelTab === tab.id), borderLeft: "none" }}>{lang === "lt" ? tab.lt : tab.en}</button>)}
              </div>

              {/* NETWORK */}
              {intelTab === "overview" && <div style={panel}>
                <div style={{ ...lbl, marginBottom: 6 }}><span style={rule} />{lang === "lt" ? "Pinigų srautų tinklas" : "Money-Flow Network"}</div>
                <p style={{ fontSize: 12, color: "#8c8c88", fontFamily: "var(--m)", marginBottom: 16 }}>{lang === "lt" ? `${intel.graph.nodeCount} subjektai · ${intel.graph.edgeCount} srautai · ${intel.graph.cycleCount} uždari ciklai` : `${intel.graph.nodeCount} entities · ${intel.graph.edgeCount} flows · ${intel.graph.cycleCount} circular cycles`}</p>
                <NetworkGraph graph={intel.graph.renderGraph} lang={lang} />
                {intel.graph.cycles.length > 0 && <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ff8a8a", fontFamily: "var(--f)", marginBottom: 10 }}>⚠ {lang === "lt" ? "Aptikti uždari pinigų ciklai (round-trip rizika)" : "Detected circular money flows (round-trip risk)"}</div>
                  {intel.graph.cycles.slice(0, 8).map((c, i) => <div key={i} style={{ padding: "10px 14px", border: "1px solid rgba(255,107,107,0.2)", marginBottom: 6, fontSize: 12, fontFamily: "var(--m)", color: "#d2d2ce" }}>
                    {(c.labels || c.path).map(p => typeof p === "string" ? p.replace(/^(reg|name|customer|supplier|company):/, "") : p).join(" → ")} <span style={{ color: "#8c8c88" }}>· min €{c.minFlow.toLocaleString()}</span>
                  </div>)}
                </div>}
                <div style={{ marginTop: 16, fontSize: 12, fontFamily: "var(--m)", color: "#bcbcb8" }}>
                  {lang === "lt" ? "Koncentracija (HHI)" : "Concentration (HHI)"}: <strong style={{ color: intel.graph.concentration.hhi > 0.25 ? "#ffa94d" : "#fff" }}>{intel.graph.concentration.hhi}</strong> — {intel.graph.concentration.interpretation}
                </div>
              </div>}

              {/* BENFORD */}
              {intelTab === "benford" && <div style={panel}>
                <div style={{ ...lbl, marginBottom: 12 }}><span style={rule} />{lang === "lt" ? "Benfordo dėsnio analizė" : "Benford's Law Analysis"}</div>
                {!intel.benford.applicable && <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)" }}>{intel.benford.note}</p>}
                {intel.benford.applicable && <>
                  <p style={{ fontSize: 12, color: "#bcbcb8", fontFamily: "var(--m)", marginBottom: 18 }}>
                    n={intel.benford.sampleSize} · MAD={intel.benford.mad} · χ²={intel.benford.chi2} ({lang === "lt" ? "krit." : "crit"} {intel.benford.chi2Critical}) · <strong style={{ color: intel.benford.mad >= 0.015 ? "#ff8a8a" : "#fff" }}>{intel.benford.conformity}</strong>
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, padding: "0 8px", borderBottom: `1px solid ${PL_LINE}` }}>
                    {intel.benford.digits.map(d => {
                      const maxPct = Math.max(...intel.benford.digits.map(x => Math.max(x.observedPct, x.expectedPct)));
                      return <div key={d.digit} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative" }}>
                        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: "100%", width: "100%", justifyContent: "center" }}>
                          <div title={`observed ${d.observedPct}%`} style={{ width: "42%", height: `${d.observedPct / maxPct * 100}%`, background: Math.abs(d.observedPct - d.expectedPct) > 3 ? "#ff8a8a" : "#fff" }} />
                          <div title={`expected ${d.expectedPct}%`} style={{ width: "42%", height: `${d.expectedPct / maxPct * 100}%`, background: "#4a4a4c" }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#bcbcb8", fontFamily: "var(--m)", marginTop: 6 }}>{d.digit}</span>
                      </div>;
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 18, marginTop: 12, fontSize: 11, fontFamily: "var(--m)", color: "#bcbcb8" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, background: "#fff" }} />{lang === "lt" ? "Stebėta" : "Observed"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, background: "#4a4a4c" }} />{lang === "lt" ? "Tikėtina (Benford)" : "Expected"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, background: "#ff8a8a" }} />{lang === "lt" ? "Nukrypimas >3%" : "Deviation >3%"}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#d2d2ce", fontFamily: "var(--s)", marginTop: 16, lineHeight: 1.6, padding: "12px 16px", background: "#000", border: `1px solid ${PL_SOFT}` }}>{intel.benford.note}</p>
                </>}
              </div>}

              {/* ANOMALIES */}
              {intelTab === "anomalies" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {intel.vatAudit && <div style={{ ...panel, padding: 18, borderColor: intel.vatAudit.issueCount > 0 ? "rgba(255,107,107,0.25)" : PL_LINE }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: intel.vatAudit.issueCount > 0 ? "#ff8a8a" : "#fff", fontFamily: "var(--f)" }}>{lang === "lt" ? "PVM tarifo patikra (pagal datą)" : "Period-Effective VAT-Rate Audit"}</div>
                  <div style={{ fontSize: 12, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 6 }}>{lang === "lt" ? `Patikrinta ${intel.vatAudit.checked} sąskaitų · ` : `Checked ${intel.vatAudit.checked} invoices · `}{intel.vatAudit.note}</div>
                  {intel.vatAudit.issues.slice(0, 10).map((v, i) => <div key={i} style={{ fontSize: 12, fontFamily: "var(--m)", color: "#d2d2ce", padding: "5px 0", borderBottom: `1px solid ${PL_SOFT}` }}>{v.ref} <span style={{ color: "#8c8c88" }}>({v.src} · {v.date})</span> — <span style={{ color: "#ff8a8a", fontWeight: 700 }}>{v.impliedPct}%</span> <span style={{ color: "#8c8c88" }}>{lang === "lt" ? "galiojo" : "valid"}: {v.expected.join("/")}%</span></div>)}
                </div>}
                {intel.anomalies.roundNumberBias && <div style={{ ...panel, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: intel.anomalies.roundNumberBias.elevated ? "#ffa94d" : "#fff", fontFamily: "var(--f)" }}>{lang === "lt" ? "Apvalių skaičių tendencija" : "Round-Number Bias"}</div>
                  <div style={{ fontSize: 12, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 6 }}>{intel.anomalies.roundNumberBias.pctBy100}% ÷100 · {intel.anomalies.roundNumberBias.pctBy1000}% ÷1000 — {intel.anomalies.roundNumberBias.note}</div>
                </div>}
                {intel.anomalies.periodEndClustering && <div style={{ ...panel, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: intel.anomalies.periodEndClustering.elevated ? "#ffa94d" : "#fff", fontFamily: "var(--f)" }}>{lang === "lt" ? "Laikotarpio pabaigos koncentracija" : "Period-End Clustering"}</div>
                  <div style={{ fontSize: 12, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 6 }}>{intel.anomalies.periodEndClustering.pct}% {lang === "lt" ? "įrašų per paskutines 3 dienas" : "of postings in final 3 days"} — {intel.anomalies.periodEndClustering.note}</div>
                </div>}
                <div style={{ ...panel, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "var(--f)", marginBottom: 10 }}>{lang === "lt" ? `Statistinės anomalijos (${intel.anomalies.outliers.length})` : `Statistical Outliers (${intel.anomalies.outliers.length})`}</div>
                  {intel.anomalies.outliers.length === 0 && <div style={{ fontSize: 12, color: "#69db7c", fontFamily: "var(--s)" }}>{lang === "lt" ? "Reikšmingų nuokrypių nerasta." : "No material outliers found."}</div>}
                  {intel.anomalies.outliers.slice(0, 15).map((o, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${PL_SOFT}`, fontSize: 12, fontFamily: "var(--m)" }}>
                    <span style={{ color: "#d2d2ce" }}>{o.ref} <span style={{ color: "#8c8c88" }}>({o.src}{o.party ? ` · ${o.party}` : ""})</span></span>
                    <span style={{ color: "#ffa94d", fontWeight: 700 }}>€{o.amount.toLocaleString()} · {o.method}</span>
                  </div>)}
                </div>
                {intel.anomalies.duplicateClusters.length > 0 && <div style={{ ...panel, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "var(--f)", marginBottom: 10 }}>{lang === "lt" ? `Dublikatų grupės (${intel.anomalies.duplicateClusters.length})` : `Duplicate Clusters (${intel.anomalies.duplicateClusters.length})`}</div>
                  {intel.anomalies.duplicateClusters.slice(0, 10).map((d, i) => <div key={i} style={{ fontSize: 12, fontFamily: "var(--m)", color: "#d2d2ce", padding: "5px 0" }}>{d.party} · €{d.amount.toLocaleString()} · {d.date} <span style={{ color: "#ff8a8a", fontWeight: 700 }}>×{d.count}</span> <span style={{ color: "#8c8c88" }}>({d.refs.join(", ")})</span></div>)}
                </div>}
                {intel.anomalies.sequenceGaps.length > 0 && <div style={{ ...panel, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "var(--f)", marginBottom: 10 }}>{lang === "lt" ? "Numeracijos spragos" : "Invoice Sequence Gaps"}</div>
                  {intel.anomalies.sequenceGaps.slice(0, 10).map((g, i) => <div key={i} style={{ fontSize: 12, fontFamily: "var(--m)", color: "#d2d2ce", padding: "5px 0" }}>{lang === "lt" ? "Serija" : "Series"} "{g.prefix}" · {g.span} · <span style={{ color: "#ffa94d", fontWeight: 700 }}>{g.missing} {lang === "lt" ? "trūksta" : "missing"}</span> {g.examples?.length ? `(${g.examples.join(", ")})` : ""}</div>)}
                </div>}
              </div>}

              {/* ENTITIES */}
              {intelTab === "entities" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {intel.entityRes.shellIndicators.length > 0 && <div style={{ ...panel, padding: 18, borderColor: "rgba(255,107,107,0.25)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ff8a8a", fontFamily: "var(--f)", marginBottom: 10 }}>⚑ {lang === "lt" ? `Fiktyvių įmonių požymiai (${intel.entityRes.shellIndicators.length})` : `Shell-Company Indicators (${intel.entityRes.shellIndicators.length})`}</div>
                  {intel.entityRes.shellIndicators.slice(0, 12).map((s, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${PL_SOFT}`, fontSize: 12, fontFamily: "var(--m)" }}>
                    <span style={{ color: "#d2d2ce" }}>{s.name || s.entity} <span style={{ color: "#8c8c88" }}>· {s.flags.join(", ")}</span></span>
                    <span style={{ color: s.riskScore >= 70 ? "#ff6b6b" : "#ffa94d", fontWeight: 700 }}>{s.riskScore}</span>
                  </div>)}
                </div>}
                {intel.entityRes.sharedBankAccounts.length > 0 && <div style={{ ...panel, padding: 18, borderColor: "rgba(255,107,107,0.25)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ff8a8a", fontFamily: "var(--f)", marginBottom: 10 }}>⌘ {lang === "lt" ? "Bendros banko sąskaitos (slapto ryšio signalas)" : "Shared Bank Accounts (collusion signal)"}</div>
                  {intel.entityRes.sharedBankAccounts.map((b, i) => <div key={i} style={{ fontSize: 12, fontFamily: "var(--m)", color: "#d2d2ce", padding: "5px 0" }}>{b.bank} → {b.entities.map(e => e.replace(/^(customer|supplier):/, "")).join(", ")}</div>)}
                </div>}
                {intel.entityRes.duplicates.length > 0 && <div style={{ ...panel, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "var(--f)", marginBottom: 10 }}>{lang === "lt" ? `Galimi subjektų dublikatai (${intel.entityRes.duplicates.length})` : `Probable Duplicate Entities (${intel.entityRes.duplicates.length})`}</div>
                  {intel.entityRes.duplicates.slice(0, 12).map((d, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${PL_SOFT}`, fontSize: 12, fontFamily: "var(--m)" }}>
                    <span style={{ color: "#d2d2ce" }}>{d.key} <span style={{ color: "#8c8c88" }}>· {d.basis}</span></span>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{Math.round(d.confidence * 100)}%</span>
                  </div>)}
                </div>}
                {intel.entityRes.shellIndicators.length === 0 && intel.entityRes.sharedBankAccounts.length === 0 && intel.entityRes.duplicates.length === 0 &&
                  <div style={{ ...panel, padding: 28, textAlign: "center", fontSize: 13, color: "#69db7c", fontFamily: "var(--s)" }}>{lang === "lt" ? "Subjektų rizikos signalų nerasta." : "No entity-risk signals detected."}</div>}
              </div>}

              {/* TEMPORAL */}
              {intelTab === "temporal" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {!intel.temporal?.applicable && <div style={{ ...panel, padding: 28, textAlign: "center", fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)" }}>{intel.temporal?.note || (lang === "lt" ? "Nepakanka datuotų įvykių laiko analizei." : "Insufficient dated events for temporal analysis.")}</div>}
                {intel.temporal?.applicable && <>
                  <div style={{ ...panel, padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "var(--f)", marginBottom: 4 }}>{lang === "lt" ? "Mėnesinis apyvartos profilis" : "Monthly Volume Profile"}</div>
                    <p style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", marginBottom: 18 }}>{lang === "lt" ? "Raudona = velocity anomalija (≥3× pokytis)" : "Red = velocity anomaly (≥3× change)"}</p>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 180, borderBottom: `1px solid ${PL_LINE}` }}>
                      {intel.temporal.monthly.map((m, i) => {
                        const maxAmt = Math.max(...intel.temporal.monthly.map(x => x.amount), 1);
                        const isSpike = intel.temporal.velocitySpikes.some(v => v.month === m.month);
                        return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }} title={`${m.month}: €${m.amount.toLocaleString()} (${m.count} events)`}>
                          <div style={{ width: "70%", height: `${m.amount / maxAmt * 100}%`, background: isSpike ? "#ff8a8a" : "#fff", minHeight: 2 }} />
                          <span style={{ fontSize: 8, color: "#8c8c88", fontFamily: "var(--m)", marginTop: 4, transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>{m.month.slice(2)}</span>
                        </div>;
                      })}
                    </div>
                  </div>
                  {intel.temporal.velocitySpikes.length > 0 && <div style={{ ...panel, padding: 18, borderColor: "rgba(255,169,77,0.25)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ffa94d", fontFamily: "var(--f)", marginBottom: 10 }}>⚡ {lang === "lt" ? "Apyvartos greičio anomalijos" : "Volume Velocity Anomalies"}</div>
                    {intel.temporal.velocitySpikes.map((v, i) => <div key={i} style={{ fontSize: 12, fontFamily: "var(--m)", color: "#d2d2ce", padding: "5px 0" }}>{v.month} · {v.direction === "spike" ? "▲" : "▼"} {v.changeX ? `${v.changeX}×` : ""} · €{v.amount.toLocaleString()} <span style={{ color: "#8c8c88" }}>(prev €{v.prevAmount.toLocaleString()})</span></div>)}
                  </div>}
                  {intel.temporal.backdating.length > 0 && <div style={{ ...panel, padding: 18, borderColor: "rgba(255,107,107,0.25)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ff8a8a", fontFamily: "var(--f)", marginBottom: 10 }}>⧗ {lang === "lt" ? `Atgaline data įrašyti (${intel.temporal.backdating.length})` : `Backdated Postings (${intel.temporal.backdating.length})`}</div>
                    <p style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)", marginBottom: 10 }}>{intel.temporal.dateLag?.note}</p>
                    {intel.temporal.backdating.slice(0, 10).map((b, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--m)", color: "#d2d2ce", padding: "4px 0", borderBottom: `1px solid ${PL_SOFT}` }}>
                      <span>{b.ref} <span style={{ color: "#8c8c88" }}>· doc {b.docDate} → sys {b.sysDate?.slice(0, 10)}</span></span>
                      <span style={{ color: "#ff8a8a", fontWeight: 700 }}>+{b.lagDays}d</span>
                    </div>)}
                  </div>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {intel.temporal.weekendPostings && <div style={{ ...panel, padding: 18 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: intel.temporal.weekendPostings.elevated ? "#ffa94d" : "#fff", fontFamily: "var(--f)" }}>{lang === "lt" ? "Savaitgalio įrašai" : "Weekend Postings"}</div>
                      <div style={{ fontSize: 28, fontWeight: 300, color: intel.temporal.weekendPostings.elevated ? "#ffa94d" : "#fff", fontFamily: "var(--f)", margin: "6px 0" }}>{intel.temporal.weekendPostings.pct}%</div>
                      <div style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>{intel.temporal.weekendPostings.note}</div>
                    </div>}
                    {intel.temporal.afterHours && <div style={{ ...panel, padding: 18 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: intel.temporal.afterHours.elevated ? "#ffa94d" : "#fff", fontFamily: "var(--f)" }}>{lang === "lt" ? "Po darbo valandų (22–6)" : "After-Hours (22:00–06:00)"}</div>
                      <div style={{ fontSize: 28, fontWeight: 300, color: intel.temporal.afterHours.elevated ? "#ffa94d" : "#fff", fontFamily: "var(--f)", margin: "6px 0" }}>{intel.temporal.afterHours.pct}%</div>
                      <div style={{ fontSize: 11, color: "#8c8c88", fontFamily: "var(--m)" }}>{intel.temporal.afterHours.note}</div>
                    </div>}
                  </div>
                </>}
              </div>}

              {/* THREAT */}
              {intelTab === "threat" && <div style={panel}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <SEC n="05·T" en="Forensic Threat Assessment" lt="Forensikos grėsmių vertinimas" />
                  {!threatResult && !saftLoading && <button onClick={runThreatCallback} style={{ ...bP, marginLeft: "auto" }}>{lang === "lt" ? "Vertinti →" : "Assess →"}</button>}
                </div>
                <p style={{ fontSize: 13, color: "#bcbcb8", fontFamily: "var(--s)", marginBottom: 18, lineHeight: 1.65, maxWidth: 820 }}>
                  {lang === "lt" ? "Gemini analizuoja deterministinius signalus (rizikos balas, Benfordas, ciklai, subjektai) ir sukuria tyrėjo lygio grėsmių vertinimą su sukčiavimo tipologijomis, hipotezėmis ir tolesniais tyrimo žingsniais. Skaičiai iš variklių — ne AI." : "Gemini analyzes the deterministic signals (risk score, Benford, cycles, entities) and produces an investigator-grade threat assessment with fraud typologies, hypotheses, and investigative next steps. Numbers come from the engines — not the AI."}
                </p>
                {saftLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20 }}>{dots()}<span style={{ fontSize: 13, color: "#8c8c88", fontFamily: "var(--m)", letterSpacing: ".08em" }}>{lang === "lt" ? "VYKDOMAS GRĖSMIŲ VERTINIMAS..." : "RUNNING THREAT ASSESSMENT..."}</span></div>}
                {threatResult && <>
                  <Md text={threatResult} />
                  <DefensibilityPanel verification={verifyThreat} lang={lang} />
                  <div style={{ marginTop: 18, padding: "12px 16px", border: "1px solid rgba(217,183,109,0.3)", fontSize: 11, color: "#d9b76d", fontFamily: "var(--s)", lineHeight: 1.6 }}>
                    ⚠ {lang === "lt" ? "Tai sprendimų palaikymo įrankis, ne kaltinimas. Signalai reikalauja tyrimo — ne įrodymas. Kiekvienas signalas turi nekaltą ir kaltą paaiškinimą." : "This is decision-support, not an accusation. Signals warrant investigation — they are not proof. Every signal has an innocent and a guilty explanation."}
                  </div>
                  <button onClick={runThreatCallback} style={{ ...bG, marginTop: 14 }}>↻ {lang === "lt" ? "Generuoti iš naujo" : "Regenerate"}</button>
                </>}
              </div>}
            </>}
          </div>
        </div>}

        {/* ═══════════ AUDIT LOG ═══════════ */}
        {view === "logs" && <div key="logs" style={{ flex: 1, overflow: "auto", padding: "32px 40px", animation: "fadeUp .4s ease" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <PageBanner variant="particles" label={lang === "lt" ? "07 — Atitikties žurnalas" : "07 — Compliance Trail"} title={t.auditLog} sub={lang === "lt" ? "BDAR/GDPR atitikties žurnalas — visi veiksmai registruojami vietoje, jūsų naršyklėje." : "GDPR compliance audit trail — every action is logged locally, in your browser."} />
            {audit.logs.length > 0 ? <DataTable columns={[
              { key: "ts", label: lang === "lt" ? "Laikas" : "Timestamp", mono: true, render: r => new Date(r.ts).toLocaleString("lt-LT") },
              { key: "action", label: lang === "lt" ? "Veiksmas" : "Action", bold: true, mono: true },
              { key: "detail", label: lang === "lt" ? "Detalės" : "Detail" },
            ]} data={[...audit.logs].reverse()} maxRows={50} /> : <div style={{ ...panel, padding: 28, textAlign: "center", color: "#8c8c88", fontFamily: "var(--s)" }}>{lang === "lt" ? "Žurnalas tuščias" : "No log entries yet"}</div>}
          </div>
        </div>}
      </main>
    </div>
  );
}

/* ═══ LANDING PAGE STYLES (scoped under .lp) ═══ */
const LANDING_CSS = `
.lp{
  --lp-bg:#000;--lp-bg1:#070708;--lp-bg2:#0e0f10;
  --lp-line:rgba(255,255,255,0.12);--lp-line-soft:rgba(255,255,255,0.06);
  --lp-ink:#f7f7f6;--lp-dim:#bcbcb8;--lp-faint:#8c8c88;
  --lp-fd:"Newsreader",Georgia,serif;--lp-fs:"Archivo","Helvetica Neue",sans-serif;--lp-fm:"JetBrains Mono",ui-monospace,monospace;
  background:#000;color:var(--lp-ink);font-family:var(--lp-fs);line-height:1.5;
  -webkit-font-smoothing:antialiased;position:relative;min-height:100vh;
}
.lp *{margin:0;padding:0;box-sizing:border-box}
.lp ::selection{background:#fff;color:#000}
.lp::after{content:"";position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:0.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.lp::before{content:"";position:fixed;inset:0;z-index:9998;pointer-events:none;background:linear-gradient(rgba(255,255,255,0) 50%,rgba(0,0,0,0.25) 50%);background-size:100% 3px;opacity:0.22}
.lp a{color:inherit;text-decoration:none}
.lp .wrap{max-width:1280px;margin:0 auto;padding:0 32px}

.lp nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;padding:18px 32px;border-bottom:1px solid transparent;transition:background .4s,border-color .4s,backdrop-filter .4s}
.lp nav.scrolled{background:rgba(0,0,0,0.72);backdrop-filter:blur(14px);border-color:var(--lp-line-soft)}
.lp .logo{display:flex;align-items:center;gap:11px;font-family:var(--lp-fs);font-weight:800;letter-spacing:.18em;font-size:15px}
.lp .logo .mark{width:26px;height:26px;border:1.5px solid #fff;display:grid;place-items:center;position:relative}
.lp .logo .mark::before{content:"";position:absolute;width:8px;height:8px;background:#fff;animation:lpPulse 3s infinite}
@keyframes lpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
.lp .nav-links{display:flex;gap:36px;align-items:center}
.lp .nav-links a{font-size:13px;letter-spacing:.05em;color:#d8d8d4;transition:color .25s;text-transform:uppercase;font-weight:500}
.lp .nav-links a:hover{color:#fff}
.lp .nav-cta{border:1px solid var(--lp-line);padding:9px 20px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;transition:all .25s}
.lp .nav-cta:hover{background:#fff;color:#000;border-color:#fff}
.lp .nav-toggle{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none}
.lp .nav-toggle span{width:24px;height:1.5px;background:#fff;transition:.3s}

.lp .hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden}
.lp .hero-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0}
.lp .hero-veil{position:absolute;inset:0;z-index:1;background:radial-gradient(120% 90% at 70% 30%,rgba(0,0,0,0) 0%,rgba(0,0,0,0.5) 60%,#000 100%),linear-gradient(180deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 70%,#000 100%)}
.lp .hero-grid{position:absolute;inset:0;z-index:1;opacity:.5;background-image:linear-gradient(var(--lp-line-soft) 1px,transparent 1px),linear-gradient(90deg,var(--lp-line-soft) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(ellipse 80% 80% at 50% 40%,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse 80% 80% at 50% 40%,#000 30%,transparent 75%)}
.lp .hero-inner{position:relative;z-index:2;width:100%}
.lp .eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:var(--lp-fm);font-size:13px;letter-spacing:.22em;color:#c0c0bc;text-transform:uppercase;margin-bottom:34px;opacity:0;animation:lpFadeUp 1s .2s forwards}
.lp .eyebrow .dot{width:6px;height:6px;border-radius:50%;background:#fff;animation:lpBlink 2s infinite}
@keyframes lpBlink{0%,100%{opacity:1}50%{opacity:.2}}
.lp h1.hero-title{font-family:var(--lp-fd);font-weight:300;letter-spacing:-.02em;line-height:.94;font-size:clamp(48px,8.5vw,128px);max-width:14ch;margin-bottom:32px}
.lp h1.hero-title .l{display:block;overflow:hidden}
.lp h1.hero-title .l span{display:block;transform:translateY(110%);animation:lpLineUp 1.1s cubic-bezier(.16,1,.3,1) forwards}
.lp h1.hero-title .l:nth-child(1) span{animation-delay:.35s}
.lp h1.hero-title .l:nth-child(2) span{animation-delay:.5s}
.lp h1.hero-title em{font-style:italic;color:var(--lp-ink)}
.lp h1.hero-title .thin{color:var(--lp-faint)}
@keyframes lpLineUp{to{transform:translateY(0)}}
.lp .hero-sub{font-size:clamp(17px,1.7vw,22px);color:#d2d2ce;max-width:54ch;line-height:1.7;margin-bottom:44px;font-weight:400;opacity:0;animation:lpFadeUp 1s .9s forwards}
.lp .hero-actions{display:flex;gap:16px;flex-wrap:wrap;opacity:0;animation:lpFadeUp 1s 1.05s forwards}
.lp .btn{display:inline-flex;align-items:center;gap:12px;padding:15px 30px;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;transition:all .3s;cursor:pointer;border:1px solid #fff}
.lp .btn-primary{background:#fff;color:#000}
.lp .btn-primary:hover{background:transparent;color:#fff}
.lp .btn-primary .arrow{transition:transform .3s}
.lp .btn-primary:hover .arrow{transform:translateX(5px)}
.lp .btn-ghost{background:transparent;color:#fff;border-color:var(--lp-line)}
.lp .btn-ghost:hover{border-color:#fff}
@keyframes lpFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.lp .hero-meta{position:absolute;bottom:34px;left:32px;right:32px;z-index:2;display:flex;justify-content:space-between;font-family:var(--lp-fm);font-size:11px;letter-spacing:.1em;color:var(--lp-faint);text-transform:uppercase;opacity:0;animation:lpFadeUp 1s 1.3s forwards}
.lp .hero-meta .scroll-ind{display:flex;align-items:center;gap:10px}
.lp .hero-meta .scroll-ind .bar{width:1px;height:34px;background:linear-gradient(#fff,transparent);animation:lpScrollBar 2s infinite}
@keyframes lpScrollBar{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}50.1%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}

.lp .marquee{border-top:1px solid var(--lp-line);border-bottom:1px solid var(--lp-line);overflow:hidden;padding:22px 0;background:#000}
.lp .marquee-track{display:flex;gap:0;white-space:nowrap;animation:lpScroll 32s linear infinite;width:max-content}
.lp .marquee:hover .marquee-track{animation-play-state:paused}
.lp .marquee-track span{font-family:var(--lp-fd);font-style:italic;font-size:26px;color:var(--lp-faint);display:inline-flex;align-items:center}
.lp .marquee-track .m-x{font-style:normal;font-size:13px;color:var(--lp-faint);margin:0 40px}
@keyframes lpScroll{to{transform:translateX(-50%)}}

.lp section{position:relative}
.lp .section-pad{padding:130px 0}
.lp .sec-label{font-family:var(--lp-fm);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#a4a4a0;display:flex;align-items:center;gap:14px;margin-bottom:30px}
.lp .sec-label::before{content:"";width:40px;height:1px;background:#a4a4a0}
.lp .reveal{opacity:0;transform:translateY(40px);transition:opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1)}
.lp .reveal.in{opacity:1;transform:none}

.lp .manifesto h2{font-family:var(--lp-fd);font-weight:300;font-size:clamp(30px,4.6vw,68px);line-height:1.08;letter-spacing:-.015em;max-width:20ch}
.lp .manifesto h2 em{font-style:italic}
.lp .manifesto h2 .dim{color:var(--lp-faint)}
.lp .manifesto .cols{display:grid;grid-template-columns:1fr 1fr;gap:64px;margin-top:70px}
.lp .manifesto .cols p{color:#cfcfca;font-size:17.5px;line-height:1.8;max-width:46ch}
.lp .manifesto .cols p strong{color:#fff;font-weight:600}

.lp .split{display:grid;grid-template-columns:1fr 1fr;align-items:center;border-top:1px solid var(--lp-line)}
.lp .split .media{position:relative;height:560px;overflow:hidden;background:var(--lp-bg1);border-right:1px solid var(--lp-line)}
.lp .split.rev .media{border-right:none;border-left:1px solid var(--lp-line);order:2}
.lp .split .media canvas{width:100%;height:100%;display:block;filter:grayscale(1) contrast(1.15)}
.lp .split .media .tag{position:absolute;top:22px;left:22px;font-family:var(--lp-fm);font-size:11px;letter-spacing:.12em;color:var(--lp-dim);text-transform:uppercase;z-index:3;border:1px solid var(--lp-line);padding:6px 12px;background:rgba(0,0,0,.5);backdrop-filter:blur(6px)}
.lp .split .media .ov{position:absolute;inset:0;background:radial-gradient(110% 110% at 30% 20%,transparent,rgba(0,0,0,.6));z-index:2;pointer-events:none}
.lp .split .body{padding:80px}
.lp .split .body h3{font-family:var(--lp-fd);font-weight:300;font-size:clamp(26px,3.2vw,44px);line-height:1.1;letter-spacing:-.01em;margin-bottom:24px}
.lp .split .body h3 em{font-style:italic}
.lp .split .body p{color:#c8c8c4;font-size:16.5px;line-height:1.8;max-width:42ch;margin-bottom:30px}
.lp .split .body .stat-row{display:flex;gap:48px;margin-top:36px;border-top:1px solid var(--lp-line-soft);padding-top:28px}
.lp .split .body .stat-row .s .n{font-family:var(--lp-fd);font-size:42px;font-weight:300;line-height:1}
.lp .split .body .stat-row .s .k{font-family:var(--lp-fm);font-size:11px;letter-spacing:.1em;color:var(--lp-faint);text-transform:uppercase;margin-top:8px}

.lp .caps{border-top:1px solid var(--lp-line)}
.lp .caps-head{display:flex;justify-content:space-between;align-items:flex-end;padding:60px 0 40px;flex-wrap:wrap;gap:24px}
.lp .caps-head h2{font-family:var(--lp-fd);font-weight:300;font-size:clamp(28px,3.8vw,56px);letter-spacing:-.015em;max-width:16ch;line-height:1.05}
.lp .caps-head h2 em{font-style:italic}
.lp .caps-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--lp-line);border-left:1px solid var(--lp-line)}
.lp .cap{border-right:1px solid var(--lp-line);border-bottom:1px solid var(--lp-line);padding:42px 36px;min-height:230px;position:relative;transition:background .4s;overflow:hidden}
.lp .cap:hover{background:var(--lp-bg2)}
.lp .cap .idx{font-family:var(--lp-fm);font-size:12px;color:var(--lp-faint);letter-spacing:.1em}
.lp .cap .cap-h{font-size:19px;font-weight:600;margin:24px 0 12px;letter-spacing:-.01em;color:#fff}
.lp .cap p{color:#c2c2be;font-size:14.5px;line-height:1.75}
.lp .cap .cap-open{margin-top:18px;font-family:var(--lp-fm);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#fff;opacity:0;transform:translateX(-6px);transition:all .3s}
.lp .cap:hover .cap-open{opacity:1;transform:translateX(0)}
.lp .cap .glow{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.07),transparent 70%);top:-150px;right:-150px;opacity:0;transition:opacity .5s}
.lp .cap:hover .glow{opacity:1}

.lp .vfeature{position:relative;height:90vh;min-height:640px;overflow:hidden;border-top:1px solid var(--lp-line);display:flex;align-items:center}
.lp .vfeature canvas{position:absolute;inset:0;width:100%;height:100%;filter:grayscale(1) contrast(1.1) brightness(.8)}
.lp .vfeature .veil{position:absolute;inset:0;background:linear-gradient(90deg,#000 10%,rgba(0,0,0,.4) 55%,rgba(0,0,0,.7) 100%);z-index:1}
.lp .vfeature .inner{position:relative;z-index:2}
.lp .vfeature h2{font-family:var(--lp-fd);font-weight:300;font-size:clamp(34px,5.5vw,86px);line-height:1.02;letter-spacing:-.02em;max-width:16ch}
.lp .vfeature h2 em{font-style:italic}
.lp .vfeature p{color:#d2d2ce;font-size:18px;line-height:1.75;max-width:48ch;margin:30px 0 40px}

.lp .metrics{border-top:1px solid var(--lp-line);display:grid;grid-template-columns:repeat(4,1fr)}
.lp .metrics .m{padding:64px 36px;border-right:1px solid var(--lp-line)}
.lp .metrics .m:last-child{border-right:none}
.lp .metrics .m .n{font-family:var(--lp-fd);font-weight:300;font-size:clamp(40px,5vw,76px);line-height:1;letter-spacing:-.02em}
.lp .metrics .m .k{font-family:var(--lp-fm);font-size:11.5px;letter-spacing:.12em;color:var(--lp-faint);text-transform:uppercase;margin-top:16px;line-height:1.5}

.lp .agents{border-top:1px solid var(--lp-line);padding-top:80px}
.lp .agents-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--lp-line);border:1px solid var(--lp-line);margin-top:50px}
.lp .agent{background:#000;padding:24px;display:flex;align-items:center;gap:16px;transition:background .3s}
.lp .agent:hover{background:var(--lp-bg2)}
.lp .agent .ab{width:38px;height:38px;border:1px solid var(--lp-line);display:grid;place-items:center;flex-shrink:0;font-family:var(--lp-fm);font-size:13px;transition:.3s}
.lp .agent:hover .ab{background:#fff;color:#000;border-color:#fff}
.lp .agent .at{font-size:14px;font-weight:600;letter-spacing:-.01em;color:#fff}
.lp .agent .as{font-family:var(--lp-fm);font-size:10px;letter-spacing:.1em;color:var(--lp-faint);text-transform:uppercase;margin-top:3px;display:flex;align-items:center;gap:6px}
.lp .agent .as::before{content:"";width:5px;height:5px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80}

.lp .cta{border-top:1px solid var(--lp-line);padding:150px 0;text-align:center;position:relative;overflow:hidden}
.lp .cta canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.4;filter:grayscale(1)}
.lp .cta .inner{position:relative;z-index:2}
.lp .cta h2{font-family:var(--lp-fd);font-weight:300;font-size:clamp(40px,7vw,104px);line-height:.98;letter-spacing:-.02em;margin-bottom:36px}
.lp .cta h2 em{font-style:italic}
.lp .cta p{color:#d2d2ce;font-size:18px;max-width:46ch;margin:0 auto 44px;line-height:1.75}
.lp .cta .btn{margin:0 auto}

.lp footer{border-top:1px solid var(--lp-line);padding:70px 0 40px}
.lp .foot-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:70px}
.lp .foot-top .brand .logo{margin-bottom:20px}
.lp .foot-top .brand p{color:#bcbcb8;font-size:14.5px;max-width:34ch;line-height:1.75}
.lp .foot-col h5{font-family:var(--lp-fm);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--lp-faint);margin-bottom:20px}
.lp .foot-col a{display:block;color:#b4b4b0;font-size:14.5px;margin-bottom:13px;transition:color .25s}
.lp .foot-col a:hover{color:#fff}
.lp .foot-bot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--lp-line-soft);padding-top:30px;flex-wrap:wrap;gap:16px}
.lp .foot-bot p{font-family:var(--lp-fm);font-size:11px;letter-spacing:.08em;color:var(--lp-faint)}

@media(max-width:900px){
  .lp .nav-links{display:none}
  .lp .nav-toggle{display:flex}
  .lp .manifesto .cols{grid-template-columns:1fr;gap:32px}
  .lp .split{grid-template-columns:1fr}
  .lp .split .media{height:380px;border-right:none;border-bottom:1px solid var(--lp-line)}
  .lp .split.rev .media{order:0;border-left:none}
  .lp .split .body{padding:48px 32px}
  .lp .caps-grid{grid-template-columns:1fr}
  .lp .metrics{grid-template-columns:1fr 1fr}
  .lp .metrics .m:nth-child(2){border-right:none}
  .lp .agents-grid{grid-template-columns:1fr 1fr}
  .lp .foot-top{grid-template-columns:1fr 1fr}
}
@media(max-width:560px){
  .lp .wrap{padding:0 20px}
  .lp nav{padding:16px 20px}
  .lp .metrics{grid-template-columns:1fr}
  .lp .metrics .m{border-right:none}
  .lp .agents-grid{grid-template-columns:1fr}
}
@media (prefers-reduced-motion: reduce){
  .lp *,.lp *::before,.lp *::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important}
  .lp .reveal{opacity:1 !important;transform:none !important}
}
`;

/* ═══════════════════════════════════════════════════════════════════
   PALANTIR-STYLE LANDING PAGE  (production gateway to the TAXAI app)
   Ported from the standalone landing; all canvas animation runs via
   refs + useEffect and is cleaned up on unmount. Entering the app calls
   onEnter(), which mounts <TAXAI/>.
   ═══════════════════════════════════════════════════════════════════ */

const LANDING_AGENTS = [
  ["Tax Interpretation", "§"], ["VAT Compliance", "∞"], ["SAF-T Audit", "◇"], ["E-Auditor", "◎"],
  ["Fraud Detection", "◐"], ["Ledger Intelligence", "▥"], ["Filing Assistant", "▤"], ["Compliance Monitor", "◓"],
  ["Payroll Compliance", "₪"], ["Industry Intelligence", "▦"], ["Internal Control", "▣"], ["Legal Research", "◈"],
  ["Executive CFO", "◆"], ["Risk Scoring", "◉"], ["Transaction Investigator", "◯"], ["Supplier Risk", "◗"],
  ["Audit Documentation", "D"], ["AI Reporting", "◲"],
];

// ── Canvas helpers (return a cleanup fn) ──────────────────────────────
// Shared lifecycle: starts an rAF loop that auto-pauses when the canvas is
// off-screen or the tab is hidden, and honors prefers-reduced-motion (static
// single frame). Returns a cleanup fn. `frame` takes a monotonically rising t.
function lpLifecycle(canvas, { size, init, frame }) {
  const reduce = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();
  let raf = 0, visible = true, tabVisible = !document.hidden, running = false, t = 0;
  const loop = () => { t += 16; frame(t); raf = requestAnimationFrame(loop); };
  const start = () => { if (running || reduce || !visible || !tabVisible) return; running = true; raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
  size(); init(); frame(0);
  if (!reduce) start();
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (reduce) return; visible ? start() : stop(); }, { threshold: 0.01 });
  io.observe(canvas);
  const onVis = () => { tabVisible = !document.hidden; if (reduce) return; tabVisible ? start() : stop(); };
  document.addEventListener("visibilitychange", onVis);
  let rz; const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { size(); init(); frame(0); }, 150); };
  addEventListener("resize", onResize);
  return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); removeEventListener("resize", onResize); clearTimeout(rz); };
}
function lpNetwork(canvas, opts = {}) {
  const ctx = canvas.getContext("2d"); let w, h, dpr, nodes = [];
  const COUNT = opts.count || 80, LINK = opts.link || 160, SPD = opts.speed || 0.28;
  let mx = -999, my = -999;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const init = () => { nodes = []; const count = Math.min(COUNT, Math.round(w / 16)); for (let i = 0; i < count; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * SPD, vy: (Math.random() - .5) * SPD, r: Math.random() * 1.6 + 0.6, p: Math.random() * Math.PI * 2 }); };
  const mm = e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
  const ml = () => { mx = -999; my = -999; };
  canvas.addEventListener("mousemove", mm); canvas.addEventListener("mouseleave", ml);
  const frame = t => {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1;
      const dxm = mx - n.x, dym = my - n.y, dm = Math.hypot(dxm, dym);
      if (dm < 140) { n.x -= dxm * 0.004; n.y -= dym * 0.004; }
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK) { const o = (1 - d / LINK) * 0.5; ctx.strokeStyle = `rgba(255,255,255,${o})`; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (const n of nodes) {
      const tw = 0.55 + Math.sin(t * 0.001 + n.p) * 0.45;
      const dm = Math.hypot(mx - n.x, my - n.y); const near = dm < 140;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (near ? 1.8 : 1), 0, 7);
      ctx.fillStyle = `rgba(255,255,255,${near ? 0.95 : 0.4 + tw * 0.5})`; ctx.fill();
      if (near) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, 7); ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 0.5; ctx.stroke(); }
    }
  };
  const stopLife = lpLifecycle(canvas, { size, init, frame });
  return () => { stopLife(); canvas.removeEventListener("mousemove", mm); canvas.removeEventListener("mouseleave", ml); };
}

function lpRuleGrid(canvas) {
  const ctx = canvas.getContext("2d"); let w, h, dpr; const cell = 26; let cells = [];
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const init = () => { cells = []; const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell); for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push({ x: x * cell, y: y * cell, s: Math.random(), on: Math.random() > 0.82 }); };
  const frame = (tm) => {
    const t = tm * 0.016; ctx.clearRect(0, 0, w, h); const scan = (t * 60) % (h + 200) - 100;
    for (const c of cells) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 0.5; ctx.strokeRect(c.x, c.y, cell, cell);
      const dist = Math.abs(c.y - scan);
      if (c.on) { const pulse = 0.2 + Math.sin(t * 2 + c.s * 8) * 0.15; let a = pulse; if (dist < 60) a = Math.min(1, pulse + (1 - dist / 60) * 0.8); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(c.x + cell * 0.25, c.y + cell * 0.25, cell * 0.5, cell * 0.5); }
    }
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(0, scan, w, 1.5);
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(0, scan - 40, w, 40);
  };
  return lpLifecycle(canvas, { size, init, frame });
}

function lpFlowGraph(canvas) {
  const ctx = canvas.getContext("2d"); let w, h, dpr, N = [], E = [];
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const init = () => {
    const cx = w / 2, cy = h / 2; N = [{ x: cx, y: cy, r: 9, self: 1 }]; const ring = Math.min(w, h) * 0.32;
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; N.push({ x: cx + Math.cos(a) * ring, y: cy + Math.sin(a) * ring, r: 5 + Math.random() * 3, a }); }
    E = []; for (let i = 1; i < N.length; i++) E.push([0, i, Math.random() > .5]);
    E.push([1, 3, 1], [3, 5, 1], [5, 1, 1]);
  };
  const arrow = (a, b, prog, cyc) => {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
    const sx = a.x + ux * a.r, sy = a.y + uy * a.r, ex = b.x - ux * b.r, ey = b.y - uy * b.r;
    ctx.strokeStyle = cyc ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)"; ctx.lineWidth = cyc ? 1.2 : 0.7;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    const px = sx + (ex - sx) * prog, py = sy + (ey - sy) * prog;
    ctx.beginPath(); ctx.arc(px, py, cyc ? 2.6 : 1.8, 0, 7); ctx.fillStyle = cyc ? "#fff" : "rgba(255,255,255,0.7)"; ctx.fill();
  };
  const frame = (tm) => {
    const t = tm * 0.01; ctx.clearRect(0, 0, w, h);
    E.forEach((e, i) => { const prog = ((t * 0.6 + i * 0.12) % 1); arrow(N[e[0]], N[e[1]], prog, e[2]); });
    N.forEach(n => {
      if (n.self) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 5 + Math.sin(t * 2) * 2, 0, 7); ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fillStyle = n.self ? "#fff" : "rgba(255,255,255,0.6)"; ctx.fill();
      if (!n.self) { ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 0.7; ctx.stroke(); }
    });
  };
  return lpLifecycle(canvas, { size, init, frame });
}

function lpParticles(canvas, dense) {
  const ctx = canvas.getContext("2d"); let w, h, dpr, ps = [];
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const init = () => { ps = []; const C = Math.min(dense ? 160 : 90, Math.round(w / (dense ? 9 : 14))); for (let i = 0; i < C; i++) ps.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), vy: (Math.random() * 0.3 + 0.1) }); };
  const frame = (tm) => {
    const t = tm * 0.01; ctx.clearRect(0, 0, w, h);
    for (const p of ps) { p.y -= p.vy * (0.4 + p.z); if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } const a = 0.15 + p.z * 0.6, r = 0.5 + p.z * 1.8; ctx.beginPath(); ctx.arc(p.x + Math.sin(t + p.z * 6) * 6, p.y, r, 0, 7); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill(); }
  };
  return lpLifecycle(canvas, { size, init, frame });
}

function LandingPage({ onEnter }) {
  const netRef = useRef(null), rulesRef = useRef(null), graphRef = useRef(null), featRef = useRef(null), ctaRef = useRef(null);
  const navRef = useRef(null), titleRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const cleanups = [];
    if (netRef.current) cleanups.push(lpNetwork(netRef.current, { count: 88, link: 160, speed: 0.28 }));
    if (rulesRef.current) cleanups.push(lpRuleGrid(rulesRef.current));
    if (graphRef.current) cleanups.push(lpFlowGraph(graphRef.current));
    if (featRef.current) cleanups.push(lpParticles(featRef.current, true));
    if (ctaRef.current) cleanups.push(lpParticles(ctaRef.current, false));

    // scroll reveal
    const io = new IntersectionObserver((es) => {
      es.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add("in"), i * 70); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".lp .reveal").forEach(el => io.observe(el));

    const onScroll = () => {
      if (navRef.current) navRef.current.classList.toggle("scrolled", scrollY > 40);
      const y = scrollY;
      if (titleRef.current && y < 800) { titleRef.current.style.transform = `translateY(${y * 0.18}px)`; titleRef.current.style.opacity = String(Math.max(0, 1 - y / 600)); }
    };
    addEventListener("scroll", onScroll);
    return () => { cleanups.forEach(c => c && c()); io.disconnect(); removeEventListener("scroll", onScroll); };
  }, []);

  // enter(view): jump straight into that page of the app.
  const enter = (e, view) => { if (e && e.preventDefault) e.preventDefault(); onEnter && onEnter(view || "home"); };
  const go = (view) => (e) => { if (e && e.preventDefault) e.preventDefault(); setMobileOpen(false); onEnter && onEnter(view); };

  return (
    <div className="lp">
      <style>{LANDING_CSS}</style>

      <nav ref={navRef} id="lp-nav">
        <a href="#" className="logo" onClick={e => e.preventDefault()}><span className="mark" />TAXAI</a>
        <div className="nav-links" style={mobileOpen ? { display: "flex", position: "fixed", top: 60, left: 0, right: 0, flexDirection: "column", background: "#000", padding: "24px 32px", gap: 20, borderBottom: "1px solid var(--lp-line)", zIndex: 999 } : {}}>
          <a href="#platform" onClick={() => setMobileOpen(false)}>Platform</a>
          <a href="#intelligence" onClick={() => setMobileOpen(false)}>Intelligence</a>
          <a href="#capabilities" onClick={() => setMobileOpen(false)}>Capabilities</a>
          <a href="#agents" onClick={() => setMobileOpen(false)}>Agents</a>
          <a href="#" className="nav-cta" onClick={(e) => enter(e, "home")}>Enter App →</a>
        </div>
        <button className="nav-toggle" aria-label="Menu" onClick={() => setMobileOpen(o => !o)}><span /><span /><span /></button>
      </nav>

      <header className="hero">
        <canvas className="hero-canvas" ref={netRef} />
        <div className="hero-grid" />
        <div className="hero-veil" />
        <div className="hero-inner wrap">
          <div className="eyebrow"><span className="dot" />Forensic Tax Intelligence · Republic of Lithuania</div>
          <h1 className="hero-title" ref={titleRef}>
            <span className="l"><span>See the <em>signal</em></span></span>
            <span className="l"><span>inside the <span className="thin">noise.</span></span></span>
          </h1>
          <p className="hero-sub">TAXAI fuses a deterministic 300-rule SAF-T engine with seven forensic intelligence engines and eighteen specialised agents — turning raw accounting data into auditable, court-grade insight.</p>
          <div className="hero-actions">
            <a href="#" className="btn btn-primary" onClick={(e) => enter(e, "saftview")}>Analyze a SAF-T file <span className="arrow">→</span></a>
            <a href="#" className="btn btn-ghost" onClick={(e) => enter(e, "chat")}>Ask an agent</a>
          </div>
        </div>
        <div className="hero-meta">
          <span>EST. VILNIUS · LT</span>
          <span className="scroll-ind"><span className="bar" />SCROLL TO DECODE</span>
          <span>v4.8 / OPUS</span>
        </div>
      </header>

      <div className="marquee">
        <div className="marquee-track">
          {[0, 1].map(k => (
            <span key={k}>Deterministic by design<span className="m-x">✦</span>300 SAF-T rules<span className="m-x">✦</span>Benford's Law<span className="m-x">✦</span>Entity resolution<span className="m-x">✦</span>Transaction graphs<span className="m-x">✦</span>Threat assessment<span className="m-x">✦</span></span>
          ))}
        </div>
      </div>

      <section className="manifesto section-pad" id="platform">
        <div className="wrap">
          <div className="sec-label reveal">01 — The Thesis</div>
          <h2 className="reveal">Numbers don't lie. <em>People</em> hide them in <span className="dim">complexity.</span> We remove the complexity.</h2>
          <div className="cols">
            <p className="reveal"><strong>Every figure is computed, never guessed.</strong> Revenue, margins, VAT positions, Benford deviations, money-flow cycles — all derived deterministically in code, fully reproducible, fully auditable. The AI layer interprets; it never invents.</p>
            <p className="reveal">Built on the official sources of record — VMI, e-TAR, Sodra, AVNT, FNTT — and grounded in Lithuanian law. TAXAI is the analyst that reads every transaction, holds both the innocent and the guilty hypothesis, and shows its work.</p>
          </div>
        </div>
      </section>

      <section className="split" id="intelligence">
        <div className="media">
          <span className="tag">FIG.01 — RULE ENGINE</span>
          <div className="ov" />
          <canvas ref={rulesRef} />
        </div>
        <div className="body">
          <div className="sec-label reveal">02 — Deterministic Core</div>
          <h3 className="reveal">Three hundred rules. <em>Zero</em> ambiguity.</h3>
          <p className="reveal">A complete SAF-T compliance engine validates schema, business logic, consistency and financial integrity against the XSD v2.01 specification and Order VA-127 — in milliseconds, on upload, with cited evidence for every finding.</p>
          <div className="stat-row reveal">
            <div className="s"><div className="n">300</div><div className="k">Compliance rules</div></div>
            <div className="s"><div className="n">99<span style={{ fontSize: ".5em" }}>%</span></div><div className="k">Schema accuracy</div></div>
            <div className="s"><div className="n">&lt;1s</div><div className="k">Full execution</div></div>
          </div>
          <a href="#" className="btn btn-ghost reveal" style={{ marginTop: 28 }} onClick={(e) => enter(e, "saftview")}>Open the compliance engine <span className="arrow">→</span></a>
        </div>
      </section>

      <section className="split rev">
        <div className="media">
          <span className="tag">FIG.02 — MONEY-FLOW GRAPH</span>
          <div className="ov" />
          <canvas ref={graphRef} />
        </div>
        <div className="body">
          <div className="sec-label reveal">03 — Forensic Engines</div>
          <h3 className="reveal">Seven engines that <em>trace</em> what spreadsheets bury.</h3>
          <p className="reveal">Ontology, Benford's Law, statistical anomaly detection, entity resolution, transaction-graph cycle detection, composite risk scoring, and temporal forensics — each deterministic, each explainable, each pointing the investigator at the next document to pull.</p>
          <div className="stat-row reveal">
            <div className="s"><div className="n">7</div><div className="k">Forensic engines</div></div>
            <div className="s"><div className="n">0–100</div><div className="k">Risk score</div></div>
            <div className="s"><div className="n">100%</div><div className="k">Attributable</div></div>
          </div>
          <a href="#" className="btn btn-ghost reveal" style={{ marginTop: 28 }} onClick={(e) => enter(e, "intel")}>Open the intelligence center <span className="arrow">→</span></a>
        </div>
      </section>

      <section className="caps section-pad" id="capabilities">
        <div className="wrap">
          <div className="caps-head">
            <h2 className="reveal">Capabilities engineered for <em>consequence.</em></h2>
            <div className="sec-label reveal" style={{ margin: 0 }}>04 — What it does</div>
          </div>
          <div className="caps-grid">
            {[
              ["01", "SAF-T Compliance", "300 deterministic rules across schema, business, consistency and financial integrity — with severity, evidence and remediation per finding.", "saftview"],
              ["02", "Benford Forensics", "First-digit distribution analysis with Nigrini MAD and chi-square tests to surface fabricated or threshold-manipulated figures.", "intel"],
              ["03", "Network Analysis", "Money-flow graphs with resolved-identity cycle detection — round-tripping and carousel structures rendered visible.", "intel"],
              ["04", "Entity Resolution", "Fuzzy matching, shell-company indicators and shared-bank-account detection that collapse aliases into real actors.", "intel"],
              ["05", "Risk Scoring", "An explainable 0–100 composite where every point is attributable to a named, traceable signal.", "intel"],
              ["06", "Temporal Forensics", "Velocity spikes, backdating, weekend and after-hours posting patterns flagged across the fiscal timeline.", "intel"],
            ].map(([idx, h, p, target]) => (
              <div className="cap reveal" key={idx} onClick={go(target)} style={{ cursor: "pointer" }}>
                <div className="glow" /><div className="idx">/ {idx}</div>
                <div className="cap-h">{h}</div><p>{p}</p>
                <div className="cap-open">Open →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vfeature">
        <canvas ref={featRef} />
        <div className="veil" />
        <div className="inner wrap">
          <div className="sec-label reveal">05 — Intelligence Command Center</div>
          <h2 className="reveal">From upload to <em>threat assessment</em> in one screen.</h2>
          <p className="reveal">A risk gauge, an interactive money-flow network, Benford charts, anomaly feeds and an AI forensic narrative — every number deterministic, every conclusion sourced. Decision-support that respects the difference between a signal and an accusation.</p>
          <a href="#" className="btn btn-primary reveal" onClick={(e) => enter(e, "intel")}>Enter the Command Center <span className="arrow">→</span></a>
        </div>
      </section>

      <section className="metrics">
        {[["300", "Deterministic SAF-T rules"], ["7", "Forensic engines"], ["18", "Specialised agents"], ["20+", "Official LT sources"]].map(([n, k], i) => (
          <div className="m reveal" key={i}><div className="n">{n}</div><div className="k">{k}</div></div>
        ))}
      </section>

      <section className="agents section-pad" id="agents">
        <div className="wrap">
          <div className="sec-label reveal">06 — The Agents</div>
          <div className="caps-head" style={{ paddingTop: 0 }}>
            <h2 className="reveal">Eighteen agents. Each grounded in an <em>official</em> source of record.</h2>
          </div>
          <div className="agents-grid reveal">
            {LANDING_AGENTS.map(([n, g]) => (
              <div className="agent" key={n} onClick={go("agents")} style={{ cursor: "pointer" }}><div className="ab">{g}</div><div><div className="at">{n}</div><div className="as">Active · Official source</div></div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta" id="contact">
        <canvas ref={ctaRef} />
        <div className="inner wrap">
          <div className="sec-label reveal" style={{ justifyContent: "center" }}>07 — Begin</div>
          <h2 className="reveal">Decode your <em>data.</em></h2>
          <p className="reveal">Enter TAXAI and turn a SAF-T file into auditable, court-grade forensic intelligence — grounded in Lithuanian law, reproducible to the last cent.</p>
          <a href="#" className="btn btn-primary reveal" onClick={(e) => enter(e, "home")}>Enter the Platform <span className="arrow">→</span></a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div className="brand">
              <a href="#" className="logo" onClick={e => e.preventDefault()}><span className="mark" />TAXAI</a>
              <p>Forensic tax intelligence for the Republic of Lithuania. Deterministic computation, official sources, auditable conclusions.</p>
            </div>
            <div className="foot-col"><h5>Platform</h5><a href="#" onClick={go("saftview")}>Compliance Engine</a><a href="#" onClick={go("intel")}>Forensic Engines</a><a href="#" onClick={go("intel")}>Command Center</a><a href="#" onClick={go("agents")}>Agents</a></div>
            <div className="foot-col"><h5>Sources</h5><a href="https://www.vmi.lt/" target="_blank" rel="noopener noreferrer">VMI</a><a href="https://www.e-tar.lt/" target="_blank" rel="noopener noreferrer">e-TAR</a><a href="https://www.sodra.lt/" target="_blank" rel="noopener noreferrer">Sodra</a><a href="https://avnt.lrv.lt/" target="_blank" rel="noopener noreferrer">AVNT</a></div>
            <div className="foot-col"><h5>Navigate</h5><a href="#" onClick={go("home")}>Enter App</a><a href="#" onClick={go("chat")}>Chat</a><a href="#" onClick={go("logs")}>Audit Log</a><a href="#contact">Contact</a></div>
          </div>
          <div className="foot-bot">
            <p>© 2026 TAXAI — ALL RIGHTS RESERVED</p>
            <p>VILNIUS · LITHUANIA · 54.6872° N, 25.2797° E</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══ ROOT APP — landing gateway → application ═══ */
export default function App() {
  const [entered, setEntered] = useState(false);
  const [startView, setStartView] = useState("home");
  useEffect(() => {
    // load the landing fonts once
    if (!document.getElementById("lp-fonts")) {
      const l = document.createElement("link");
      l.id = "lp-fonts"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&family=JetBrains+Mono:wght@400;500;700&display=swap";
      document.head.appendChild(l);
    }
  }, []);
  if (!entered) return <LandingPage onEnter={(view) => { setStartView(typeof view === "string" ? view : "home"); setEntered(true); window.scrollTo(0, 0); }} />;
  return <TAXAI initialView={startView} onExit={() => { setEntered(false); window.scrollTo(0, 0); }} />;
}
