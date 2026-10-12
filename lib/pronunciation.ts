export const targets=['bake','cake','lake','rake','cape','tape','cave','wave','cap','ay','game','name','cane','lane','case','vase','date','gate','can'] as const;
export function feedbackFor(target:string,transcript:string){
 if(target==='ay'){
  const normalized=transcript.toLowerCase().replace(/[^a-z]/g,'');
  const status=!normalized?'unclear':['a','ay'].includes(normalized)?'match':'retry';
  return {target,transcript:transcript.slice(0,120),status,index:status==='match'?0:status==='unclear'?3:2,tip:'입을 살짝 벌려 ‘에’로 시작하고, 끊지 않고 ‘이’로 부드럽게 이어 /eɪ/ 소리를 내봐요.',english:status==='match'?"I heard ay! Great job!":status==='unclear'?"I couldn't hear clearly. Let's try again!":"Good try! Listen to ay, then say it again.",korean:status==='match'?'ei (에이) 소리로 인식됐어요! 잘했어요.':'좋은 시도예요! ei (에이) 소리를 듣고 다시 따라해봐요.'};
 }
 const words=transcript.toLowerCase().match(/[a-z]+/g)||[];
 const heard=words.filter(w=>!['i','said','say','it','a','the'].includes(w));
 const short:Record<string,string>={bake:'back',cake:'cack',lake:'lack',rake:'rack',cape:'cap',tape:'tap',cave:'calve',wave:'wave',game:'gam',name:'nam',cane:'can',lane:'lan',case:'cass',vase:'vas',date:'dat',gate:'gat'};
 const status=heard.length===1&&(heard[0]===target||(target==='vase'&&heard[0]==='vaz'))?'match':heard.length===0?'unclear':target!=='wave'&&heard.length===1&&heard[0]===short[target]?'vowel':'retry';
 const tips:Record<string,string>={game:'마지막 /m/은 입술을 닫고 목을 울려요.',name:'마지막 /m/은 입술을 닫고 목을 울려요.',cane:'마지막 /n/은 혀끝을 윗니 뒤에 대고 목을 울려요.',lane:'첫 /l/은 혀끝을 윗니 뒤에 대요. 마지막 /n/도 또렷하게 내요.',case:'마지막 /s/는 목을 울리지 않고 공기를 부드럽게 내보내요.',vase:'미국식 /veɪs/로 연습해요. 첫 /v/는 윗니를 아랫입술에 살짝 대고 목을 울려요.',date:'마지막 /t/는 혀끝으로 공기를 잠깐 막았다가 떼어요.',gate:'마지막 /t/는 혀끝으로 공기를 잠깐 막았다가 떼어요.',can:'짧은 /æ/ 소리를 내고 혀끝을 윗니 뒤에 대어 /n/으로 끝내요.',bake:'마지막 /k/는 혀 뒤쪽으로 공기를 잠깐 막았다가 떼어봐요.',cake:'마지막 /k/는 혀 뒤쪽으로 공기를 잠깐 막았다가 떼어봐요.',lake:'첫 /l/은 혀끝을 윗니 뒤에 대고 시작해요. 마지막 /k/도 짧게 내요.',rake:'첫 /r/은 혀가 입천장에 닿지 않게 해요. 마지막 /k/도 짧게 내요.',cape:'마지막 /p/는 입술을 닫았다가 짧게 터뜨려봐요.',tape:'마지막 /p/는 입술을 닫았다가 짧게 터뜨려봐요.',cave:'마지막 /v/는 윗니를 아랫입술에 살짝 대고 목을 울려봐요.',wave:'마지막 /v/는 윗니를 아랫입술에 살짝 대고 목을 울려봐요.',cap:'입을 넓게 벌려 짧은 /æ/ 소리를 낸 뒤, 입술을 닫아 /p/로 끝내요.'};
 return {target,transcript:transcript.slice(0,120),status,index:status==='match'?0:status==='vowel'?1:status==='unclear'?3:2,tip:status==='unclear'?'마이크 가까이에서 조용히 한 단어만 말해봐요.':status==='vowel'?'입을 살짝 벌려 ‘에’로 시작하고 ‘이’로 부드럽게 이어봐요.':tips[target],english:status==='match'?`I heard ${target}! Great job!`:status==='unclear'?"I couldn't hear clearly. Let's try again!":`Good try! Listen to ${target}, then say it again.`,korean:status==='match'?`${target}로 인식됐어요! 잘했어요. 한 번 더 연습해볼까요?`:status==='unclear'?'소리가 또렷하게 인식되지 않았어요. 괜찮아요, 다시 해봐요!':'좋은 시도예요! 미미의 발음을 듣고 다시 말해봐요.'};
}
