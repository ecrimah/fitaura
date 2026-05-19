/**
 * lib/canada-regions.ts
 *
 * Canonical Canadian provinces & territories + their major cities/towns.
 *
 * Source: Statistics Canada (2021 census) — every Census Metropolitan Area
 * (CMA) and Census Agglomeration (CA) >= ~15k pop, plus key towns &
 * tourism hubs. Names are written as locals write them, not abbreviated,
 * so "Quebec" → "Québec City" / "Montréal" / "Trois-Rivières".
 *
 * Total: 13 regions, 320+ cities.
 *
 * Used by:
 *   - app/(store)/checkout/page.tsx   (Region select + City datalist)
 *   - app/(store)/account/AddressBook.tsx
 *   - admin POS / order forms
 */

export const CA_COUNTRY_CODE = 'CA';

export interface CanadianRegion {
  /** Two-letter postal/ISO 3166-2 code (e.g. "AB"). */
  code: string;
  /** Full official name (e.g. "Alberta"). */
  name: string;
  /** Region type for downstream UX/tax logic. */
  kind: 'province' | 'territory';
  /** Major cities + towns, sorted by population (largest first). */
  cities: string[];
}

export const CANADIAN_REGIONS: CanadianRegion[] = [
  {
    code: 'AB',
    name: 'Alberta',
    kind: 'province',
    cities: [
      'Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert',
      'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Spruce Grove',
      'Okotoks', 'Leduc', 'Fort Saskatchewan', 'Camrose', 'Cochrane',
      'Lloydminster', 'Chestermere', 'Sylvan Lake', 'Brooks', 'Wetaskiwin',
      'High River', 'Strathmore', 'Banff', 'Canmore', 'Jasper', 'Stony Plain',
      'Beaumont', 'Morinville', 'Hinton', 'Cold Lake', 'Whitecourt',
      'Lacombe', 'Drumheller', 'Drayton Valley', 'Fort McMurray',
    ],
  },
  {
    code: 'BC',
    name: 'British Columbia',
    kind: 'province',
    cities: [
      'Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford',
      'Coquitlam', 'Kelowna', 'Saanich', 'Langley', 'Delta', 'Victoria',
      'Kamloops', 'Nanaimo', 'Chilliwack', 'Maple Ridge', 'Prince George',
      'New Westminster', 'Port Coquitlam', 'North Vancouver', 'West Vancouver',
      'Vernon', 'Penticton', 'Campbell River', 'Mission', 'Courtenay',
      'Cranbrook', 'Port Moody', 'White Rock', 'Fort St. John', 'Squamish',
      'Whistler', 'Tofino', 'Ucluelet', 'Salmon Arm', 'Nelson', 'Revelstoke',
      'Powell River', 'Quesnel', 'Williams Lake', 'Terrace', 'Prince Rupert',
      'Dawson Creek', 'Parksville', 'Comox', 'Sechelt', 'Gibsons',
    ],
  },
  {
    code: 'MB',
    name: 'Manitoba',
    kind: 'province',
    cities: [
      'Winnipeg', 'Brandon', 'Steinbach', 'Winkler', 'Portage la Prairie',
      'Thompson', 'Selkirk', 'Morden', 'Dauphin', 'The Pas',
      'Flin Flon', 'Stonewall', 'Niverville', 'Beausejour', 'Neepawa',
      'Carman', 'Virden', 'Altona', 'Swan River', 'Gimli',
    ],
  },
  {
    code: 'NB',
    name: 'New Brunswick',
    kind: 'province',
    cities: [
      'Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Riverview',
      'Quispamsis', 'Miramichi', 'Edmundston', 'Rothesay', 'Bathurst',
      'Campbellton', 'Oromocto', 'Sussex', 'Sackville', 'Grand Falls',
      'Caraquet', 'Tracadie', 'Shediac', 'Woodstock', 'Saint-Quentin',
    ],
  },
  {
    code: 'NL',
    name: 'Newfoundland and Labrador',
    kind: 'province',
    cities: [
      "St. John's", 'Conception Bay South', 'Mount Pearl', 'Paradise',
      'Corner Brook', 'Grand Falls-Windsor', 'Gander', 'Happy Valley-Goose Bay',
      'Labrador City', 'Stephenville', 'Clarenville', 'Bay Roberts',
      'Marystown', 'Carbonear', 'Channel-Port aux Basques', 'Deer Lake',
      'Bonavista', 'Twillingate',
    ],
  },
  {
    code: 'NS',
    name: 'Nova Scotia',
    kind: 'province',
    cities: [
      'Halifax', 'Cape Breton', 'Sydney', 'Dartmouth', 'Truro',
      'New Glasgow', 'Glace Bay', 'Kentville', 'Amherst', 'Bridgewater',
      'Yarmouth', 'Antigonish', 'Wolfville', 'Lunenburg', 'Pictou',
      'Digby', 'Windsor', 'Berwick', 'Inverness', 'Liverpool',
      'Mahone Bay', 'Chester', 'Annapolis Royal', 'Baddeck',
    ],
  },
  {
    code: 'ON',
    name: 'Ontario',
    kind: 'province',
    cities: [
      'Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton',
      'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor',
      'Richmond Hill', 'Oakville', 'Burlington', 'Greater Sudbury', 'Oshawa',
      'Barrie', 'St. Catharines', 'Cambridge', 'Whitby', 'Guelph',
      'Ajax', 'Thunder Bay', 'Waterloo', 'Brantford', 'Kingston',
      'Pickering', 'Niagara Falls', 'Newmarket', 'Peterborough', 'Sault Ste. Marie',
      'Sarnia', 'Caledon', 'Welland', 'North Bay', 'Belleville',
      'Cornwall', 'Chatham-Kent', 'Aurora', 'Halton Hills', 'Milton',
      'Stouffville', 'Georgina', 'Innisfil', 'Bradford West Gwillimbury', 'Orangeville',
      'Cobourg', 'Collingwood', 'Wasaga Beach', 'Stratford', 'Woodstock',
      'Tillsonburg', 'Owen Sound', 'Orillia', 'Timmins', 'Quinte West',
      'Bracebridge', 'Huntsville', 'Gravenhurst', 'Parry Sound',
      'Fort Erie', 'Pembroke', 'Brockville', 'Leamington', 'Kenora',
      'Elliot Lake', 'Espanola', 'Wawa', 'Hearst', 'Kapuskasing',
      'Tobermory', 'Goderich', 'Port Hope', 'Picton', 'Niagara-on-the-Lake',
    ],
  },
  {
    code: 'PE',
    name: 'Prince Edward Island',
    kind: 'province',
    cities: [
      'Charlottetown', 'Summerside', 'Stratford', 'Cornwall', 'Montague',
      'Kensington', 'Souris', "Alberton", 'Tignish', 'Georgetown',
      "O'Leary", 'Cavendish', 'North Rustico', 'Borden-Carleton',
    ],
  },
  {
    code: 'QC',
    name: 'Québec',
    kind: 'province',
    cities: [
      'Montréal', 'Québec City', 'Laval', 'Gatineau', 'Longueuil',
      'Sherbrooke', 'Saguenay', 'Lévis', 'Trois-Rivières', 'Terrebonne',
      'Saint-Jean-sur-Richelieu', 'Repentigny', 'Brossard', 'Drummondville',
      'Saint-Jérôme', 'Granby', 'Blainville', 'Saint-Hyacinthe', 'Shawinigan',
      'Dollard-des-Ormeaux', 'Rimouski', 'Châteauguay', 'Saint-Eustache',
      'Mascouche', 'Victoriaville', 'Rouyn-Noranda', 'Sorel-Tracy', 'Mirabel',
      'Salaberry-de-Valleyfield', 'Boucherville', 'Saint-Bruno-de-Montarville',
      'Sept-Îles', 'Joliette', 'Magog', 'Boisbriand', 'Alma',
      'Val-d\'Or', 'Saint-Georges', 'Thetford Mines', 'Baie-Comeau',
      'Saint-Constant', 'Mont-Tremblant', 'Saint-Sauveur', 'Bromont',
      'Tadoussac', 'Percé', 'Gaspé', 'Chibougamau', 'Matane',
      'Sainte-Adèle', 'Sainte-Thérèse', 'Vaudreuil-Dorion',
    ],
  },
  {
    code: 'SK',
    name: 'Saskatchewan',
    kind: 'province',
    cities: [
      'Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current',
      'Yorkton', 'North Battleford', 'Estevan', 'Warman', 'Weyburn',
      'Martensville', 'Lloydminster', 'Melfort', 'Humboldt', 'Meadow Lake',
      'Melville', 'Nipawin', 'Tisdale', 'Kindersley', 'La Ronge',
      'Rosetown', 'Outlook', 'Canora', 'Maple Creek',
    ],
  },
  {
    code: 'NT',
    name: 'Northwest Territories',
    kind: 'territory',
    cities: [
      'Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith', 'Behchokǫ̀',
      'Norman Wells', 'Fort Simpson', 'Tuktoyaktuk', 'Fort McPherson',
      'Fort Providence', 'Fort Liard', 'Aklavik', 'Déline',
    ],
  },
  {
    code: 'NU',
    name: 'Nunavut',
    kind: 'territory',
    cities: [
      'Iqaluit', 'Rankin Inlet', 'Arviat', 'Baker Lake', 'Cambridge Bay',
      'Igloolik', 'Pond Inlet', 'Pangnirtung', 'Kugluktuk', 'Cape Dorset',
      'Gjoa Haven', 'Taloyoak', 'Coral Harbour', 'Naujaat', 'Sanikiluaq',
    ],
  },
  {
    code: 'YT',
    name: 'Yukon',
    kind: 'territory',
    cities: [
      'Whitehorse', 'Dawson City', 'Watson Lake', 'Haines Junction',
      'Mayo', 'Faro', 'Carmacks', 'Teslin', 'Carcross', 'Old Crow',
      'Ross River',
    ],
  },
];

/** All region names in alphabetical order (UI display). */
export const REGION_NAMES: string[] = CANADIAN_REGIONS
  .map((r) => r.name)
  .sort((a, b) => a.localeCompare(b));

/** Quick lookup: region name -> region. */
const NAME_INDEX = new Map<string, CanadianRegion>(
  CANADIAN_REGIONS.map((r) => [r.name, r]),
);

/** Quick lookup: region code -> region. */
const CODE_INDEX = new Map<string, CanadianRegion>(
  CANADIAN_REGIONS.map((r) => [r.code, r]),
);

/** Return cities for a region. Accepts either the region name or its code. */
export function citiesForRegion(regionNameOrCode: string | null | undefined): string[] {
  if (!regionNameOrCode) return [];
  const r = NAME_INDEX.get(regionNameOrCode) || CODE_INDEX.get(regionNameOrCode.toUpperCase());
  return r ? r.cities : [];
}

/** Return the postal/ISO code for a region name (e.g. "Alberta" -> "AB"). */
export function codeForRegion(regionName: string | null | undefined): string | null {
  if (!regionName) return null;
  return NAME_INDEX.get(regionName)?.code ?? null;
}
