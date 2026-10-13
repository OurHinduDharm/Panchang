/*
 * Conservative Hindu vrata/parva name allowlist.
 * Unknown names are hidden until reviewed; this is safer than rendering
 * all library categories as Hindu festivals without auditing their metadata.
 */
const HINDU_FESTIVAL_TERMS = [
  /ekadashi|ekādaśī|एकादशी/i,
  /amla ekadashi|आमलकी एकादशी/i,
  /devshayani|dev shayani|देवशयनी/i,
  /parivartini|परिवर्तिनी/i,
  /prabodhini|प्रबोधिनी/i,
  /saphala|सफला/i,
  /shattila|षट्तिला/i,
  /vijaya ekadashi|विजया एकादशी/i,
  /pradosh|pradoṣ|प्रदोष/i,
  /purnima|pūrṇimā|पूर्णिमा/i,
  /amavasya|amāvasyā|अमावस्या/i,
  /sankranti|saṅkrānti|संक्रांति|संक्रान्ति/i,
  /navratri|navarātri|नवरात्रि|नवरात्र/i,
  /durga|दुर्गा|durga ashtami|दुर्गाष्टमी/i,
  /ram navami|rama navami|राम नवमी/i,
  /ramanavami|रामनवमी/i,
  /gudi padwa|गुड़ी पड़वा|गुड़ी पाड़वा/i,
  /ugadi|युगादि|उगादि/i,
  /yugadi|युगादि/i,
  /janmashtami|जन्माष्टमी/i,
  /krishna janma|कृष्ण जन्म/i,
  /shivratri|śivarātri|शिवरात्रि/i,
  /mahashivratri|महाशिवरात्रि/i,
  /ganesh|gaṇeś|गणेश/i,
  /hanuman|हनुमान/i,
  /hanuman jayanti|हनुमान जयंती/i,
  /shani jayanti|शनि जयंती/i,
  /diwali|deepavali|dīpāvalī|दीपावली|दिवाली/i,
  /holi|होली/i,
  /akshaya tritiya|अक्षय तृतीया/i,
  /dussehra|vijayadashami|दशहरा|विजयादशमी/i,
  /raksha bandhan|रक्षा बंधन|रक्षाबंधन/i,
  /guru purnima|गुरु पूर्णिमा/i,
  /nag panchami|नाग पंचमी/i,
  /vasant panchami|basant panchami|वसंत पंचमी|बसंत पंचमी/i,
  /saraswati puja|सरस्वती पूजा/i,
  /govardhan|गोवर्धन/i,
  /bhai dooj|भाई दूज/i,
  /dhanteras|धनतेरस/i,
  /tulsi vivah|तुलसी विवाह/i,
  /devutthana|dev uthani|देवउठनी|देवोत्थान/i,
  /chhath|छठ/i,
  /vat savitri|वट सावित्री/i,
  /karwa chauth|करवा चौथ/i,
  /sheetala|शीतला/i,
  /ganga dussehra|गंगा दशहरा/i,
  /narasimha|नरसिंह/i,
  /vamana|वामन/i,
  /parashurama|परशुराम/i,
  /putrada|पुत्रदा/i,
  /nirjala|निर्जला/i,
  /kamika|कामिका/i,
  /mokshada|मोक्षदा/i,
  /jaya ekadashi|जया एकादशी/i,
  /papankusha|पापांकुशा/i,
  /utpanna|उत्पन्ना/i,
  /vaikuntha|वैकुण्ठ|वैकुंठ/i,
  /annakut|अन्नकूट/i,
  /ratha yatra|रथयात्रा|रथ यात्रा/i,
  /janai purnima|जनै पूर्णिमा/i,
  /onam|ओणम/i,
  /pongal|पोंगल/i,
  /vishu|विषु/i,
  /bihu|बिहू/i,
  /jagannath|जगन्नाथ/i,
  /makar sankranti|मकर संक्रांति|मकर संक्रान्ति/i,
  /mesh sankranti|मेष संक्रांति|मेष संक्रान्ति/i,
  /chaitra navratri|चैत्र नवरात्रि|चैत्र नवरात्र/i,
  /kartik purnima|कार्तिक पूर्णिमा/i,
  /shravan somvar|सावन सोमवार|श्रावण सोमवार/i,
  /pitru paksha|pitṛ pakṣa|पितृ पक्ष/i,
  /mahalaya|महालय/i,
  /akshaya|अक्षय/i,
  /hariyali teej|हरियाली तीज/i,
  /hartalika teej|हरतालिका तीज/i,
  /teej|तीज/i,
  /adi amavasya|आदि अमावस्या/i,
  /vishwakarma puja|विश्वकर्मा पूजा/i,
  /balarama jayanti|बलराम जयंती/i,
  /skanda sashti|स्कन्द षष्ठी|स्कंद षष्ठी/i,
  /lalita jayanti|ललिता जयंती/i
];
const NON_HINDU_OR_CIVIC_TERMS =
  /eid|ramadan|ramzan|christmas|good friday|easter|buddha|guru nanak|vaisakhi|baisakhi|gandhi jayanti|independence day|republic day|constitution day|labour day|labor day|national holiday|government holiday|ईद|क्रिसमस|गांधी जयंती|स्वतंत्रता दिवस|गणतंत्र दिवस/i;

export function festivalName(item) {
  return String(item?.name || item?.title || "").trim();
}

export function isHinduFestival(item) {
  const name = festivalName(item);
  if (!name || NON_HINDU_OR_CIVIC_TERMS.test(name)) return false;

  const category = String(item?.category || "").toLowerCase();
  if (/islam|muslim|christian|christ|sikh|buddhist|national|government|civic|public holiday/.test(category)) {
    return false;
  }

  return HINDU_FESTIVAL_TERMS.some(pattern => pattern.test(name));
}
