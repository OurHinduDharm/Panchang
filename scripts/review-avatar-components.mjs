// Review only. Explicit component identities, never an English-date override.
import {resolveFestivalObservanceFromAnnualPanchang,resolveAnnualShuklaManvadi} from "../festival-rule-engine.mjs";
const profiles=new Map([
  ["मत्स्य जयंती",{id:"matsya",ruleId:"matsya-jayanti-aparahna",lunarMonth:"चैत्र",targetTithiIndex:2}],
  ["मत्स्य-अवतार जयंती",{id:"matsya",ruleId:"matsya-jayanti-aparahna",lunarMonth:"चैत्र",targetTithiIndex:2}],
  ["कूर्म अवतार जयंती",{id:"kurma",ruleId:"kurma-jayanti-sayahna-review",lunarMonth:"वैशाख",targetTithiIndex:14}],
  ["कूर्म जयंती",{id:"kurma",ruleId:"kurma-jayanti-sayahna-review",lunarMonth:"वैशाख",targetTithiIndex:14}],
  ["वराह जयंती",{id:"varaha",ruleId:"varaha-jayanti-aparahna",lunarMonth:"भाद्रपद",targetTithiIndex:2}],
  ["कल्कि जयंती",{id:"kalki",ruleId:"kalki-jayanti-sayahna-review",lunarMonth:"श्रावण",targetTithiIndex:5}]
]);
const manvadiNames=new Map([["स्वायम्भुव मन्वादि तिथि","स्वायम्भुव"],["रुद्र सावर्णि मन्वादि तिथि","रुद्रसावर्णि"]]);
export function buildAvatarComponentReview({annual,sourceMonths,year}) {
  const days=annual.dailyPanchang;
  const manvadi=resolveAnnualShuklaManvadi(days);
  const cards=[];
  for(const event of sourceMonths.flatMap(m=>m.events)){
    const names=String(event.title??"").split(/\s+\/\s+/).map(x=>x.trim());
    if(!names.some(x=>profiles.has(x)))continue;
    const components=names.map(title=>{
      const profile=profiles.get(title);
      if(profile){
        const result=resolveFestivalObservanceFromAnnualPanchang({...profile,dateType:"tithi",paksha:"शुक्ल पक्ष",monthKind:"regular"},year,days);
        return {title,selector:profile,selectedDate:result.selectedDate,status:result.status,warnings:result.warnings,selectionBasis:result.selectionBasis,publishable:false};
      }
      if(manvadiNames.has(title)){
        const occurrences=manvadi.filter(x=>x.name===manvadiNames.get(title));
        return {title,occurrences,selectedDate:occurrences.length===1?occurrences[0].selectedDate:null,status:"manual-review",publishable:false};
      }
      return {title,selectedDate:null,status:"manual-review",reason:"independent-component-rule-required",publishable:false};
    });
    cards.push({recordKey:event.date+"::"+event.title,sourceDate:event.date,
      // Preserve the original card verbatim; never assign its shared description
      // or article link to a component without an explicit content decision.
      sourceContent:event,components,selectedDate:null,status:"manual-review",publishable:false});
  }
  return {year,cards,status:"review-only-not-approved",publishable:false,
    counts:{cards:cards.length,components:cards.reduce((n,c)=>n+c.components.length,0),selected:cards.reduce((n,c)=>n+c.components.filter(x=>x.selectedDate).length,0)}};
}
