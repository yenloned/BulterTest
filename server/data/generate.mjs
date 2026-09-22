import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, 'tickets.json');

const statuses = ['Open', 'In Progress', 'Closed'];
const priorities = ['High', 'Medium', 'Low'];
const locations = [
  'Lobby G/F',
  'Car park B1',
  'Car park B2',
  'Office 3/F',
  'Office 8/F',
  'Office 15/F',
  'Rooftop',
  'Plant room B3',
  'Lift lobby 12/F',
  'Corridor 7/F',
  'Toilet 5/F',
  'Loading bay',
  'Fire stair A',
  'Podium 2/F',
  'Retail unit 1',
  'AHU room 10/F',
  'Switch room B1',
  'Pump room B2',
  'Staff pantry 6/F',
  'Reception',
];
const assignees = [
  'Chan W.',
  'Lee M.',
  'Wong K.',
  'Tam S.',
  'Ho J.',
  'Ng P.',
  'Cheung A.',
  'Unassigned',
];

const titles = [
  ['Aircon leaking on 15/F', 'HVAC'],
  ['Lobby light flickering', 'Electrical'],
  ['Car park gate broken', 'Security'],
  ['Water pump noise', 'Plumbing'],
  ['Lift button unresponsive', 'Lift'],
  ['Rooftop drain blocked', 'Civil'],
  ['Fire alarm false trigger', 'Safety'],
  ['Office AC not cooling', 'HVAC'],
  ['Chiller pressure alarm', 'HVAC'],
  ['Corridor emergency light out', 'Electrical'],
  ['Toilet flush continuous', 'Plumbing'],
  ['Lift door sensor fault', 'Lift'],
  ['CCTV camera offline', 'Security'],
  ['Exit sign missing', 'Safety'],
  ['Ceiling tile water stain', 'Civil'],
  ['Pantry drain smell', 'Plumbing'],
  ['AHU filter overdue', 'HVAC'],
  ['Socket sparking in pantry', 'Electrical'],
  ['Access card reader slow', 'Security'],
  ['Sprinkler head leaking', 'Safety'],
  ['Floor tile cracked near lift', 'Civil'],
  ['Pest sighting in refuse room', 'Pest'],
  ['Lobby glass smear / streaking', 'Cleaning'],
  ['Escalator handrail dirty', 'Cleaning'],
  ['Rodent bait station empty', 'Pest'],
  ['VAV box stuck open', 'HVAC'],
  ['Main switch room humidity high', 'Electrical'],
  ['Hot water boiler trip', 'Plumbing'],
  ['Lift shaft lighting dead', 'Lift'],
  ['Turnstile jam at lobby', 'Security'],
  ['Smoke detector dirty', 'Safety'],
  ['External cladding loose panel', 'Civil'],
  ['Carpet stain at reception', 'Cleaning'],
  ['Cockroach report 8/F pantry', 'Pest'],
  ['FCU dripping onto desk', 'HVAC'],
  ['Distribution board warm', 'Electrical'],
  ['Sump pump intermittent', 'Plumbing'],
  ['Lift arrival chime broken', 'Lift'],
  ['Perimeter fence sensor false', 'Security'],
  ['Fire hose reel pressure low', 'Safety'],
  ['Expansion joint seal failed', 'Civil'],
  ['Glass canopy bird droppings', 'Cleaning'],
  ['Ant trail near loading bay', 'Pest'],
  ['Fresh air fan vibration', 'HVAC'],
  ['UPS battery warning', 'Electrical'],
  ['Grease trap overflowing', 'Plumbing'],
  ['Goods lift floor uneven', 'Lift'],
  ['Boom barrier remote dead', 'Security'],
  ['Fire door not latching', 'Safety'],
  ['Balcony railing rust', 'Civil'],
  ['Marble floor polish needed', 'Cleaning'],
  ['Mosquito breeding in planter', 'Pest'],
  ['Condenser coil dirty', 'HVAC'],
  ['Emergency generator test overdue', 'Electrical'],
  ['Domestic cold water low pressure', 'Plumbing'],
  ['Lift cabin mirror cracked', 'Lift'],
  ['Visitor QR gate offline', 'Security'],
  ['Extinguisher tag expired', 'Safety'],
  ['Stair nosing worn', 'Civil'],
  ['Refuse chute jammed', 'Cleaning'],
  ['Termite mud tube found', 'Pest'],
  ['Thermostat reading wrong', 'HVAC'],
  ['Parking bay light out', 'Electrical'],
  ['Urinal sensor stuck', 'Plumbing'],
  ['Lift overload sensor trip', 'Lift'],
  ['Staff door maglock fail', 'Security'],
  ['CO detector fault plant room', 'Safety'],
  ['Paving slabs uneven podium', 'Civil'],
  ['Washroom soap dispenser empty', 'Cleaning'],
  ['Bee nest near rooftop', 'Pest'],
  ['Duct insulation torn', 'HVAC'],
  ['Lighting contactor chatter', 'Electrical'],
  ['Rainwater downpipe leak', 'Plumbing'],
  ['Lift intercom no audio', 'Lift'],
  ['Car park ANPR camera blur', 'Security'],
  ['Assembly point sign faded', 'Safety'],
  ['Window seal draft 15/F', 'Civil'],
  ['Escalator step cleaning due', 'Cleaning'],
  ['Bird nest in canopy', 'Pest'],
  ['Chilled water valve seize', 'HVAC'],
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateBetween() {
  const s = +new Date('2026-05-01');
  const e = +new Date('2026-09-20');
  return new Date(s + Math.random() * (e - s)).toISOString().slice(0, 10);
}

const tickets = titles.map(([title, category], i) => ({
  id: i + 1,
  title,
  status: rand(statuses),
  category,
  priority: rand(priorities),
  created: dateBetween(),
  location: rand(locations),
  assignee: rand(assignees),
}));

const sample = [
  { status: 'Open', priority: 'High', created: '2026-06-01' },
  { status: 'In Progress', priority: 'Medium', created: '2026-06-03' },
  { status: 'Closed', priority: 'High', created: '2026-05-28' },
  { status: 'Open', priority: 'Low', created: '2026-06-10' },
  { status: 'In Progress', priority: 'High', created: '2026-06-12' },
  { status: 'Open', priority: 'Medium', created: '2026-06-15' },
  { status: 'Closed', priority: 'High', created: '2026-05-20' },
  { status: 'Open', priority: 'Medium', created: '2026-06-18' },
];

sample.forEach((s, i) => Object.assign(tickets[i], s));

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(tickets, null, 2));
console.log(`Wrote ${tickets.length} tickets to ${outPath}`);
