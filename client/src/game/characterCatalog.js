const SKIN = ['#f0c9a8','#e8bd9b','#d6a17e','#c88d6d','#b97855','#986447'];
const HAIR = ['#211b22','#38251e','#6c4930','#171820','#7b5a3c','#a57a4d','#4b3030'];
const MALE_CUTS = ['short','fade','curly','side-part','wavy'];
const FEMALE_CUTS = ['long','bob','wavy','ponytail','curly'];

function hslToHex(h,s,l){
  const a=s*Math.min(l,1-l);
  const f=n=>{
    const k=(n+h/30)%12;
    const color=l-a*Math.max(-1,Math.min(k-3,9-k,1));
    return Math.round(255*color).toString(16).padStart(2,'0');
  };
  return '#'+f(0)+f(8)+f(4);
}

function makeVariant(gender,index){
  const hue=(index*0.61803398875+(gender==='female'?0.17:0.03))%1;
  const saturation=.28+((index*7)%5)*.045;
  const lightness=.34+((index*3)%4)*.035;
  const outfit=hslToHex(hue*360,saturation,lightness);
  return Object.freeze({
    id:`${gender}-${String(index+1).padStart(3,'0')}`,
    gender,
    outfit,
    skin:SKIN[(index*5+(gender==='female'?2:0))%SKIN.length],
    hair:HAIR[(index*3+(gender==='female'?1:0))%HAIR.length],
    haircut:(gender==='female'?FEMALE_CUTS:MALE_CUTS)[index%(gender==='female'?FEMALE_CUTS:MALE_CUTS).length],
    height:.92+((index*11)%9)*.02,
    build:.92+((index*13)%8)*.025,
    accessory:index%4===0?'chain':index%4===1?'earring':index%4===2?'watch':'none'
  });
}

export const MALE_CUSTOMERS=Object.freeze(Array.from({length:100},(_,index)=>makeVariant('male',index)));
export const FEMALE_CUSTOMERS=Object.freeze(Array.from({length:100},(_,index)=>makeVariant('female',index)));

export function getCustomerAppearance(gender,index){
  const pool=gender==='female'?FEMALE_CUSTOMERS:MALE_CUSTOMERS;
  return pool[((index%pool.length)+pool.length)%pool.length];
}

export function getCustomerAppearanceByIndex(index){
  const gender=index%2===0?'male':'female';
  return getCustomerAppearance(gender,Math.floor(index/2));
}
