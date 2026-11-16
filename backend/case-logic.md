# Finish Line: case logic for IFRS (CM01)

Backend reference only. This folder is in the private GitHub repository and is excluded from the website (see `.vercelignore`).

This file describes how each course case works, not its answers. The full cases and solutions are in `course/` (encrypted) and are opened on the site for accounts with course access.

Each case lists:
- **Step**: the ladder step it trains.
- **Kind**: `calc` (a number comes out), `judge` (a reasoned classification) or `read` (finding things in a real report).
- **Inputs**: the variables a generator can change.
- **Method**: the order of operations the solution follows.
- **Re-skin**: how to move it into the student's company universe (Verdant Capital, Synapse AI, Apex Vault, Terra Properties).

Rules for generators:
1. Numbers are always computed by code, never written by an AI.
2. Keep the structure of the course case. Change the names, the amounts and one twist at most.
3. Show the slide label of the step with every exercise.

---

## Topic 1: IFRS and the financial statements (slides 1–40)

| Case | Step | Kind | Logic |
|---|---|---|---|
| 1 L'Oréal 2023 | t1g | read | Locate in a real annual report: staff costs, two operating profit lines, the OCI presentation, net income versus comprehensive income, gross financial debt (non-current plus current borrowings), capital increase (statement of changes in equity versus cash flow statement), the cash flow method, why the add-back of D&A is positive, and the sign of investing cash flow. **Re-skin:** the same ten questions on any report in Further reading (Orange, Deutsche Telekom, IAG). |
| 2 By nature to by function | t1d | calc | **Inputs:** sales, other revenues, gain on disposal, raw materials, other purchases, other taxes, staff, other expenses, depreciation, the split of each expense between cost of sales and SG&A, financial income and expense, tax. **Method:** cost of sales = raw materials + the production share of each expense; SG&A = the rest; other income = other revenues + gain on disposal. Operating profit must be the same under both presentations (check). **Re-skin:** Apex Vault's income statement (production versus selling), with all lines generated so that operating profit matches. |
| 3 GSK, Air France-KLM, Vodafone, Danone | t1c, t1d, t1f | judge + read | GSK: is the order of balance sheet sections mandatory (no, IAS 1 allows either), and what net assets are. Air France: by nature or by function (look at the expense lines), why there are two operating lines, and whether a financial loss means distress. Vodafone: treasury shares, share issues and dividends read from the statement of changes in equity; "transfer to the IS" is OCI recycling. Danone: by function, plus other operating income. **Re-skin:** a true or false set per statement, in the style of the quiz slides. |

## Topic 2: Business combinations (slides 1–41)

The generator already exists in the site (types e1 to e4). Cases 1 to 9 match those types exactly.

| Case | Step | Logic |
|---|---|---|
| 1, 2 | e1 | Remove the investment against the subsidiary's equity at acquisition. Later years: add the subsidiary's post-acquisition earnings to group equity. A fair value above book value (Case 2) raises the asset to fair value. |
| 3, 4, 5 | e2 | Goodwill = price − fair value of identifiable net assets. Unrecognised brands and PP&E fair value uplifts are added first (the purchase price allocation). Case 5 fills a form with fields A to H. |
| 6, 7 | e3 | NCI share of equity, shown in equity. 100% of the subsidiary's assets and liabilities, and 100% of its income (Case 7), with the NCI share of net income shown separately. |
| 8, 9 | e4 | Equity method: the investment line = cost + share of the change in equity since acquisition (including OCI in Case 9). Variant (c): a higher price creates goodwill that stays inside the investment line. |
| 10, 11 | — | read: find consolidation-specific lines (goodwill, NCI, share of associates' profit) in a real report and size them with ratios. |

**Re-skin pairs:** Synapse AI buys FlowDesk, Apex Vault buys into Kestrel Grip, Terra Properties buys Hofgarten Living.

## Topic 3: Non-current assets and leases (slides 1–60)

| Case | Step | Kind | Inputs and method |
|---|---|---|---|
| 1A Malaga machine | t3b | calc | **Inputs:** price in foreign currency, FX rate, transport, installation, training (excluded from cost), residual value, units per year. **Method:** cost = price × FX + transport + installation; depreciable base = cost − residual value; yearly charge = base × units this year ÷ total units. **Re-skin:** Apex Vault's pole-forming machine bought in USD. |
| 1B Upgrade | t3b | calc | Capacity-increasing spend is capitalised. New base = carrying amount + spend − residual value, spread over the revised remaining units. |
| 1C Building and roof | t3b | calc | Component method: the roof (the estimated replacement cost) is depreciated over its own life, and the rest of the building over the building's life. **Re-skin:** a Terra Properties building with a façade or roof component. |
| 2A Patent | t3a/t3b | calc | Cost = upfront payment + PV of the fees (annuity factor). Liability = PV of the fees; interest = liability × rate; straight-line amortisation. **Re-skin:** Synapse AI licenses an AI model patent. |
| 2B, 2C Brands | t3a | judge | An internally generated brand is not an asset (cost can't be measured reliably). An acquired brand with an indefinite life is not amortised but tested every year. |
| 3 Bilbao aircraft | t3c | calc | Carrying amount = cost × remaining life ÷ total life. Recoverable amount = the higher of fair value less costs to sell and value in use (no cash flows here, so fair value). Loss = carrying − recoverable. The next charge = recoverable ÷ remaining life. **Re-skin:** an Apex Vault machine after a price fall. |
| 4 SEAT goodwill | t3d | calc + judge | **Inputs:** the cash flows of each year plus a terminal year, WACC, the offer price, selling costs, the carrying amount of net operating assets including goodwill. **Method:** VIU = PV of the explicit years + the terminal value (perpetuity ÷ WACC, discounted); FVLCS = offer − costs; recoverable = the higher of the two; the loss goes against goodwill first. Discussion: which assumption (WACC, growth, cash flows) could be bent to avoid a loss. **Re-skin:** the FlowDesk unit inside Synapse AI. |
| 5 Porto CGUs | t3d | calc | Test individual assets first where possible (the building in CGU B). Then each CGU: loss = carrying − VIU; allocate to goodwill first, then pro rata to the other assets, never below an asset's own recoverable amount. |
| 6, 7 Lease or service? | t3e | judge | Three tests: is there an identified asset, does the supplier have a substantive right to substitute it (practical ability *and* economic benefit), and does the customer direct the use. Case 6 = lease; Case 7 = service (substitution is easy and cheap). **Re-skin:** a Synapse AI office desk in a Terra Properties building versus a dedicated floor. |
| 8 RENT office | t3f | calc | Payments in advance for the first one, then in arrears. Lease liability = PV of the remaining payments; ROU asset = liability + first payment. Depreciation over the lease term (not the 40-year building life); interest = opening liability × rate. |
| 9 Burger Queen | t3f | calc | Short-term or low-value exemptions don't apply to the scooters (5 years). Lease term excludes an option that is not reasonably certain. ROU = PV of payments + initial direct costs − incentives received. |

## Topic 4: Financial debt and equity (slides 1–40)

| Case | Step | Kind | Logic |
|---|---|---|---|
| 1 Air France-KLM instruments | t4a, t4b | judge | IAS 32 test: does the issuer have a contractual obligation to deliver cash? Undated notes with deferrable interest = equity; a dated bond = debt; a convertible = compound (split it). |
| 2 Companies A to F | t4a | judge | Ordinary shares = equity. Non-cumulative, non-redeemable preference shares = equity. Redeemable at the holder's option = debt. Redeemable at the issuer's option = equity. Delivering a variable number of shares worth a fixed amount = debt. A fixed number of shares for fixed cash = equity. **Re-skin:** Synapse AI's funding round with six instrument variants. |
| 3 Airbus equity | t4d, t4e | read + calc | Par value, new shares issued (employee plans), issue price = increase in capital and share premium ÷ new shares; treasury shares = the change in the number of own shares; average price = amount ÷ shares. **Re-skin:** Synapse AI issues shares and buys some back. |
| 4 Hybrid feature | t4b | judge | Subordination and the deferral of interest protect senior lenders. |
| Exam bond question | (gap) | calc | The Nov 2023 exam has a bond at the effective interest rate (amortised cost). No course exercise trains it yet, so build a generator from slides 23 to 26. |

## Topic 5: KPIs and financial communication (slides 1–40)

| Case | Step | Kind | Inputs and method |
|---|---|---|---|
| 1 VW divisions | t5d, t5e | calc | ROCE after tax = NOPAT ÷ capital employed = NOPAT margin × CE turnover. EVA = NOPAT − WACC × CE. Compare the divisions. Statements are inside the exercise file (pictures). |
| 2 CleanMotors | t5c | calc + judge | **Inputs:** an income statement and a balance sheet for two years, and the tax rate. **Method:** NOPAT = operating profit × (1 − t); CE = equity + net debt including leases (or the operating side: fixed assets + working capital); then the company's two adjustments (exclude non-recurring items, exclude financial assets) and why they flatter ROCE. **Re-skin:** Apex Vault (manufacturing) or Terra Properties (heavy right-of-use assets). |
| 3 VW free cash flow | t5f | calc | FCFF = operating cash flow − capex (+ interest after tax, depending on the definition); FCFE = FCFF − interest after tax + net borrowing. Cash flow statement is inside the exercise file (picture). |
| 4 Lufthansa depreciation | t5d | calc | Restate depreciation with a longer life and the same residual value; the adjusted charge raises EBIT and the book value; ROCE before and after the change. **Re-skin:** Apex Vault machines on a 10-year versus a 15-year life. |

---

## Documents

All course documents are in. The real reports sit under `readings/` (public company documents). Slides, cases, solutions, the pre-requisite case, the 2023 exam, the IFRS 18 standard texts and the PwC note sit under `course/`, encrypted. Topic 4 now uses the student version of the slides.
