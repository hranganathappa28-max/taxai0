# TaxAI — Strategy: A Vertical Palantir for Baltic Finance

> **One line:** The auditable financial digital twin that *thinks before it books* —
> turning Lithuania's mandatory tax/accounting data streams into decision-grade
> intelligence for accountants, auditors, and CFOs.

*Working strategy doc. Synthesised from a competitive brainstorm + adversarially
verified web research (June 2026) + reality-checks against this codebase. Sections
marked ⚠️ contain facts to verify against primary sources before betting on them.*

---

## 0. TL;DR (the thesis)

1. **Category:** Not another ledger (incumbents own that) and not a horizontal data
   platform (Palantir/Quantexa own that). A new middle: a **vertical Palantir** — an
   ontology + intelligence layer on top of Lithuanian finance data.
2. **Moat:** Deterministic, audit-grade LT regulatory depth (SAF-T/i.SAF/SABIS/Sodra/GPM
   computed, hash-chained, *no hallucinated numbers*) — already more current than the
   incumbents and than a frontier model's training data.
3. **Why now:** A regulatory wave (2026 VAT/payroll reform → ~2028 B2B e-invoicing
   mandate → 2030 ViDA) forces every LT company into structured, real-time data —
   exactly what our twin consumes.
4. **Wedge (ICP):** Outsourced **accounting firms** (apskaitos biurai), not end-SMEs.
   One firm = 30–200 client companies = graph data + leverage in a single sale.
5. **Most defensible next feature:** the **entity-resolution counterparty graph**
   (VAT-carousel / UBO-ring detection) — incumbents can't, horizontals won't bother.

---

## 1. Category & vision

Decompose "Palantir" into five capabilities and we already hold the hardest:

| Palantir capability | Meaning | Our status |
|---|---|---|
| **Ontology** | Objects + events + relationships over messy data | ✅ FinTwin (event-sourced, hash-chained) |
| **Integration (Foundry)** | Many sources → one model, with lineage | 🟡 SAF-T / i.SAF / e-invoice / ERP ingestion |
| **Graph intelligence (Gotham)** | Entity resolution + link analysis | 🟡 fraud scan exists; true counterparty graph doesn't |
| **Operational AI (AIP)** | Grounded LLMs + write-back actions | 🟡 CFO copilot + `verifyNarrative()` grounding |
| **Provenance / governance** | Audit, lineage, access control | 🟡 hash-chain is a real start |

The vision is to complete the 🟡 rows **for Lithuanian finance specifically**, where the
horizontal giants will never go and the local incumbents technically cannot follow.

---

## 2. The regulatory tailwind (the "why now") — verified

| Obligation | Status | Date | Confidence |
|---|---|---|---|
| **B2G e-invoicing** (public sector) | Mandatory, *all* invoices (threshold removed) | since **2025-01-01**, via **SABIS** (replaced eSąskaita 2024-08-30) | HIGH |
| **B2B domestic e-invoicing** | Voluntary → planned mandate, **5-corner model, real-time to SABIS** | **~2028-01-01** | MED-HIGH ⚠️ (industry consensus; not yet legislated) |
| **ViDA** cross-border B2B | EU mandate (e-invoice + digital reporting) | **2030-07-01** | HIGH |
| **i.SAF** monthly invoice register | Mandatory, all VAT payers (LT + foreign) | by 20th monthly; penalties €200–6,000 | HIGH |
| **i.SAF-T** full accounting file | On VMI request (≈all mid/large co.) | within 30 days of request | HIGH |
| **VAT rates** | 21% std; 12%/5% reduced; **9% abolished** | 2026-01-01 | HIGH |
| **Payroll reform** | MMA €1,153; **three-tier GPM (20/25/32%)**; new NPD taper | 2026-01-01 | HIGH (secondary sources) |

**Strategic reading:** the ~2028 B2B mandate (real-time structured data to SABIS) *is*
our product's input. **2026–2027 is the build-and-land window** — ship the rails before
the mandate so we're the ready-made compliance-plus-intelligence layer, not a follower.

---

## 3. Competitive landscape

### 3a. Global segments

| Segment | Key players | Their killer mechanic | How we beat / steal |
|---|---|---|---|
| **Decision-intelligence / financial-crime graph** | **Quantexa** ⭐, Feedzai, Hawk:AI, Lucinity, ComplyAdvantage, NICE Actimize | Entity resolution → single view of entity → network analytics | Localize it: LT entity resolution (Registrų centras + JADIS UBOs + VAT chains) they'd never build for a 3M market |
| **AI audit & assurance** | **MindBridge** ⭐, DataSnipper, Caseware, Validis; Big4 (EY Helix, KPMG Clara, Deloitte Omnia) | Score **100% of transactions**, not a sample | Our twin already has every event → "100% coverage, *deterministically* scored" + LT rule depth |
| **Autonomous / agentic accounting** | Puzzle, Digits, Pilot, Truewind, Basis, Vic.ai, Docyt | LLM agents do bookkeeping/AP, human-in-loop | Their weakness = trust (numbers can hallucinate). Our `verifyNarrative()` / "thinks before it books" is the counter-position |
| **Treasury & FP&A** | **Agicap** ⭐ (13-wk cash), Kyriba, Trovata; Pigment, Anaplan, Causal, Runway | SME cash-flow forecasting & planning | We already have 13-week treasury + forecast; bundle into the twin, don't sell standalone |
| **E-invoicing / ViDA compliance** | Pagero, Sovos, Fonoa, Avalara, Comarch, Unifiedpost/Finbite | Cross-border e-invoice + tax-reporting networks | Partner/integrate for transport (Peppol AP); compete on the *intelligence* on top |

### 3b. Lithuania / Baltic incumbents

| Vendor | Positioning | Cloud? | AI? | Note |
|---|---|---|---|---|
| **Rivilė (GAMA / ERP)** ⭐ | **Market leader** — ~30,000 co. (~1 in 3 LT firms); "best-rated" (RAIT 2025) | Both (ERP SaaS; GAMA cloud-hosted) | **Yes** — demand/inventory forecasting, anomaly detection, AI-OCR (KTU, EU-funded) | GAMA ~€12/mo; ERP €19/user/mo. **The one to watch.** |
| **Finvalda** | SME full ERP; one of the two most-used | Hybrid (desktop + Finvalda WEB) | Power BI analytics (not native AI) | Mikro from €9/mo; strong accountant loyalty |
| **Optimum** | Cloud ERP + CRM | Native cloud | None known | 5,700+ companies |
| **Directo** | Cloud ERP, Estonian-origin, LT/LV/EE | Native cloud | None known | ~4,300 companies; multi-entity Baltic groups |
| **Merit Aktiva** | SME cloud accounting; #1 in Estonia | Native cloud | None known | €3.50/mo per extra company; multi-client model for accountants |
| **B1.lt → Site.pro** | Lightweight SaaS, i.MAS built in | Native SaaS | None known | Cheap; sole traders + accounting firms |
| **Stekas** | Niche (~2,000 orgs; Šiauliai/Panevėžys); ~€1.1M rev | Hybrid | **Yes — "Steko Gudrutis"** (Oct 2024, VilniusTech+EU): forecasting on ~20 indicators, **partner recommendation + registry verification** ⚠️ | Already gesturing at the counterparty wedge |
| **Pragma / Centas / Apskaita5** | Entry-level / open-source | Desktop (+web add-ons) | None | Centas €242 one-time; Pragma ~€50/mo rental |
| **Edrana Baltic** | Own ERP (**Profit-Web**, *not* Dynamics); acq. by Sygnity PL (Feb 2024, €2.7M) | Web | "exploring AI" (none shipped) | ~100 staff, 3,000+ clients |

**Takeaway:** incumbents own data + habits, and the leaders are **no longer asleep on
AI** — Rivilė ships forecasting/anomaly/OCR; Stekas ships Gudrutis (forecasting +
*partner recommendation + registry verification* — an early gesture at the counterparty
graph). **But none has the architecture that matters:** a deterministic, audit-grade twin
+ *cross-company* entity-resolution graph + provenance. Their AI is operational bolt-ons
on a single customer's own data. The window is real but the clock is ticking — move now.

### 3c. Pricing & TAM reality (sobering, but clarifying)

- **The market is price-anchored low:** Centas €242 one-time; Finvalda Mikro €9/mo;
  Merit €3.50/mo per extra company; Rivilė ERP €19/user/mo; Pragma ~€50/mo. You **cannot**
  win a per-seat price war with these.
- **LT accounting-software TAM is small** (~$13–16M ERP by 2028). So a "Palantir" premium
  must be **value/ROI-priced** (recovered VAT, fraud caught, audit hours saved,
  compliance-risk avoided), sold to **accounting firms** (higher ACV per logo), and/or
  expanded **Baltic → EU on the ViDA rails**. Don't sell a €20/mo ledger — sell a
  €X00–X,000/mo risk-and-compliance brain.

---

## 4. Where we already lead (moat evidence, checked against code)

| Claim | Evidence in `TaxAI.jsx` | Verdict |
|---|---|---|
| SABIS (not the dead eSąskaita) | `:10980` full SABIS routing, `esaskaitaDisconnected:"2024-08-30"` | ✅ current |
| 2026 VAT (9% abolished → 12/5) | `:15930` `VAT_RATES=[0.21,0.12,0.09,0.05,0]` + rules | ✅ current |
| GPM 2026 three-tier | `:710-712` 82,962 / 138,270 / 0.20-0.25-0.32 | ✅ matches reform |
| NPD 2026 taper | `:703-706` `747 − 0.42×(base−840)` | ⚠️ likely stale (2023 params); 2026 sources say `0.49`, anchor MMA €1,153 → **verify vs primary VMI order** |
| Stale glossary link | `:7571` `esaskaita.eu` (decommissioned) | 🔧 cosmetic cleanup |

This table *is* the pitch: the regulatory engine is genuinely current. Keeping it that
way (and proving it, transparently) is the moat.

---

## 5. Positioning, ICP & wedge

**Position:** *A vertical Palantir for Baltic finance — the auditable financial digital
twin that thinks before it books.*

**Beachhead ICP — outsourced accounting firms (apskaitos biurai), NOT end-SMEs:**
- One firm = 30–200 clients → graph data density + sales leverage in a single deal.
- They feel SAF-T/i.SAF/ViDA pain acutely and fear AI replacing them.
- **Sell "E-Auditor as your superpower"** (review 100% of every client's books in
  minutes) — augmentation, not replacement. Land here, expand to their clients.

**Avoid:** enterprise (Quantexa/Palantir turf) and consumer-SME self-serve (incumbent
churn turf) as *starting* points.

**Moat stack:** (1) LT regulatory engines computed not guessed · (2) deterministic
hash-chained twin · (3) counterparty graph · (4) accountant+auditor+CFO unified ·
(5) regulatory tailwind forcing digitization.

---

## 6. The three LT-specific wedges (from research)

1. **i.SAF Anomaly Intelligence ("VAT Twin").** Every VAT payer files invoice-level
   data to VMI monthly; incumbents just export the XML. Mirror it back: cross-reference
   purchase/sales registers vs Registrų centras company health → flag ghost suppliers /
   carousel risk *before VMI does*. Structurally impossible for incumbents (no
   multi-client dataset, no AI).
2. **Payroll-reform automation.** The 2026 three-tier GPM + new NPD taper breaks every
   legacy parameter table. An engine that auto-ingests VMI/Sodra changes and flags edge
   cases (part-timers near MMA, posted workers at 1.65×MMA) leapfrogs incumbents. The
   annual January reform cycle is a recurring lock-in moment. *(See our own NPD ⚠️.)*
3. **Unified compliance graph (PSD2 + Registrų centras + i.SAF).** Triangulate "what the
   bank received" vs "what was invoiced to VMI" vs "is this supplier solvent /
   non-sanctioned." Today only large audit firms assemble this by hand.

---

## 7. Architecture gap → phased roadmap

| Phase | Capability | Adds | Builds on |
|---|---|---|---|
| **0 (now)** | Harden twin as queryable **ontology** | first-class entities/events/relations | FinTwin |
| **1** ⭐ | **Entity resolution + counterparty graph** | VAT-carousel / UBO-ring detection; single view of counterparty | fraud scan + graph view |
| **2** | **Write-back / operational actions** | file i.SAF, submit SAF-T, send SEPA pain.001, dunning — hash-chain = audit trail | E-Accountant treasury/close |
| **3** | **Provenance + RBAC + data room** | every number clicks to source event; per-client access; audit-ready evidence pack | hash-chain |
| **4** | **Grounded agentic layer (AIP-equiv.)** | agents that *act* via tools; numbers stay deterministic + `verifyNarrative()`-checked | CFO copilot + 9-agent review |
| **5** | **ViDA / real-time-reporting rails** | EN 16931 + Peppol BIS 3.0 + 5-corner + SABIS/i.SAF real-time | SAF-T / e-invoice ingestion |

**Sequencing logic:** Phase 1 is the biggest differentiation and powers fraud + the
i.SAF wedge. Phase 5 timed to land *before* the ~2028 B2B mandate.

---

## 8. Integration targets (data sources)

| Source | Offers | Accessibility |
|---|---|---|
| **Registrų centras — JAR** | Company status, address, directors, capital | Public + **API** (registrucentras.lt/p/1110) |
| **Registrų centras — JADIS** (UBOs) | Beneficial owners | ⚠️ restricted post-CJEU 2022; legitimate-interest access |
| **Registrų centras — financial statements** | Annual B/S + P&L | Public; bulk open-data datasets exist |
| **PSD2 open banking** | Bank tx/balances (Swedbank, SEB, Luminor, etc.) | Via aggregators: **GoCardless, Salt Edge, Enable Banking, Noda** (buy, don't build) |
| **Sanctions / PEP** | EU consolidated list (free), OFAC, UN, FNTT | Free XML/CSV from EUR-Lex; commercial enrichment available |
| **i.MAS (VMI)** | Own i.SAF data submit/retrieve | API for **own-data** only (no cross-company) |

---

## 9. Risks, open questions, what NOT to build

- **Verify before betting:** ~2028 B2B mandate date (not yet legislated); NPD 2026 taper
  coefficient/anchor (our code may be stale — see §4).
- **Pricing/TAM trap:** market anchored at €9–50/mo; small LT TAM. Must price on value
  (fraud/VAT/compliance ROI) to firms, not per-seat — and plan Baltic→EU expansion.
- **Don't build:** a full GL to rip-and-replace incumbents; non-finance verticals; your
  own bank aggregation; sampling-based audit (we do 100%).
- **Key dependency:** data access (JADIS UBO restrictions could limit the graph's depth —
  design around public data first).
- **Competitive clock:** Rivilė (forecasting/anomaly) and Stekas (Gudrutis: partner
  recommendation + registry verification) are already shipping AI. Our edge is the
  *architecture* (twin + cross-company graph + provenance), not "we have AI." Move now.

---

## 10. Selected sources

- EU ViDA / EN 16931: ec.europa.eu (digital-building-blocks); Sovos; Avalara; vatcalc.com
- LT e-invoicing / SABIS: Pagero, Sovos, Comarch, Dynatos, edicomgroup, dddinvoices
- i.MAS / i.SAF / SAF-T: PwC LT, Avalara, rtcsuite, invoicedataextraction
- Payroll 2026: KPMG flash alert, Grant Thornton LT, Eurofast, 1office
- Data sources: registrucentras.lt, Bank of Lithuania (PSD2), Open Ownership
- LT incumbents: RAIT Group + Informacinės Konsultacijos 2025 usage study; rivile.lt
  (AI: rivile.lt/.../dirbtinis-intelektas); apskaitosmokykla.lt; konsultacijos.lt
- Competitors: Quantexa, MindBridge, Agicap; Stekas "Steko Gudrutis" (aktualijos.lt,
  Oct 2024); Edrana/Sygnity acquisition (cobalt.legal, Feb 2024) — vendor sites

*Note: secondary-source facts (esp. payroll coefficients, the 2028 date) should be
confirmed against primary VMI/Sodra/EU legislation before publication or product claims.*
