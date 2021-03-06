import { Job } from '../data';
import _ from 'lodash';

const parseEncounter = db => ({
  time: db['duration'],
  zone: db['CurrentZoneName'],
  name: db['title'],
  duration: parseInt(db['DURATION']),
  damage: parseDamage(db),
  healing: parseHealing(db),
  tanking: parseTanking(db),
});

const parseCombatantData = (db, Damage) => ({
  name: parseName(db),
  job: parseJob(db),
  jobCN: parseJobCN(db),
  role: parseRole(db),
  roleCN: parseRoleCN(db),
  damage: parseDamage(db),
  healing: parseHealing(db),
  tanking: parseTanking(db, Damage),
  isMy: db['name'] === 'YOU',
});

// 分组：damage/healing/tanking

const parseDamage = db => ({
  total: parseInt(db['damage']),
  ps: parseInt(db['encdps']),
  ps10: parseInt(db['Last10DPS']),
  ps30: parseInt(db['Last30DPS']),
  ps60: parseInt(db['Last60DPS']),
  count: parseInt(db['swings']),
  percent: db['damage%'],
  criticals: db['crithit%'],
  directhit: db['DirectHitPct'],
  critdirecthit: db['CritDirectHitPct'],
  highest: parseHighest(db['maxhit']),
  kills: parseInt(db['kills']),
});

const parseHealing = db => ({
  total: parseInt(db['healed']),
  ps: parseInt(db['enchps']),
  count: parseInt(db['heals']),
  percent: db['healed%'],
  over: db['OverHealPct'],
  criticals: db['critheal%'],
  highest: parseHighest(db['maxheal']),
  deaths: parseInt(db['deaths']),
});

const parseTanking = (db, Damage) => ({
  total: parseInt(db['damagetaken']),
  percent: parseInt(db['damagetaken'] / Damage * 100) + '%',
  parry: db['ParryPct'],
  block: db['BlockPct'],
  dodge: parseInt(100 - db['IncToHit']) + '%',
});

// 处理Combatant数组

const parseCombatant = db => {
  let Combatant = [];
  let Damage = 0;
  _.forEach(db, item => {
    Damage = Damage + parseInt(item['damagetaken']);
  });
  _.forEach(db, item => {
    Combatant.push(parseCombatantData(item, Damage));
  });
  return Combatant;
};

export { parseCombatant, parseEncounter };

// 格式化方法

const parseName = db => {
  if (typeof db['name'] === 'undefined') return false;
  if (db['name'].indexOf('(') !== -1) {
    return '陆行鸟';
  } else if (db['name'].toLowerCase() === 'you') {
    return '我';
  } else if (db['name'].toLowerCase() === 'limit break') {
    return '极限技';
  } else {
    return db['name'];
  }
};

const parseRole = db => (db['Job'] !== '' ? Job[db['Job'].toLowerCase()].r : false);
const parseRoleCN = db => (db['Job'] !== '' ? Job[db['Job'].toLowerCase()].role : '其他');

const parseJob = db => {
  if (typeof db['Job'] !== 'undefined' && db['Job'] !== '') {
    return db['Job'].toLowerCase();
  } else if (typeof db['name'] !== 'undefined' && db['name'].indexOf('(') !== -1) {
    return 'pet';
  } else {
    return db['name'].replace(' ', '').toLowerCase();
  }
};

const parseJobCN = db => {
  if (typeof db['Job'] !== 'undefined' && db['Job'] !== '') {
    return Job[db['Job'].toLowerCase()].name;
  } else if (typeof db['name'] !== 'undefined') {
    try {
      return db['name'].indexOf('(') !== -1 ? 'Chocobo' : Job[db['name'].toLowerCase()].name;
    } catch (e) {}
  } else {
    return db['name'];
  }
};

const parseHighest = db => _.startCase(db).replace('Unknown', '其他');
