// function SpeakerSetting(text: string, onEndCallback?: () => void) {
//   const utterance = new SpeechSynthesisUtterance(text);
//   utterance.lang = "en-EN";

//   const setVoiceAndSpeak = () => {
//     const voices = window.speechSynthesis.getVoices();
//     const enVoice = voices.find((v) => v.lang.startsWith("en"));

//     if (enVoice) {
//       utterance.voice = enVoice;
//     } else {
//       console.warn("英語の音声が見つかりませんでした。");
//     }

//     if (onEndCallback) utterance.onend = onEndCallback;

//     window.speechSynthesis.speak(utterance);
//   };

//   // 音声リストが空だったらイベント待機
//   if (window.speechSynthesis.getVoices().length === 0) {
//     window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
//   } else {
//     setVoiceAndSpeak();
//   }
// }


// // 正解音を再生して5秒後に停止する関数
// const PlaySuccessSound = () => {
//   const audio = new Audio("/success.mp3"); // publicフォルダ内の音声ファイル
//   audio.play(); // 音声を再生

//   // 5秒後に音声を停止する
//   setTimeout(() => {
//     audio.pause(); // 音声を停止
//     audio.currentTime = 0; // 再生位置を先頭に戻す
//   }, 5000); // 5000ms = 5秒
// };

// // 不正解音を再生して5秒後に停止する関数
// const PlayFailureSound = () => {
//   const audio = new Audio("/failure.mp3"); // publicフォルダ内の音声ファイル
//   audio.play(); // 音声を再生

//   // 5秒後に音声を停止する
//   setTimeout(() => {
//     audio.pause(); // 音声を停止
//     audio.currentTime = 0; // 再生位置を先頭に戻す
//   }, 5000); // 5000ms = 5秒
// };

// export { SpeakerSetting, PlaySuccessSound, PlayFailureSound };
