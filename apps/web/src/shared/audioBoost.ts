/**
 * Громкость голосовых.
 *
 * У элемента `<audio>` свойство volume ограничено единицей — им можно только
 * убавить. Тихую запись он громче не сделает, сколько ни просить. Поднять выше
 * исходного уровня умеет только Web Audio: пропускаем звук через усилитель, а
 * за ним через компрессор, который придавливает пики и не даёт им захрипеть.
 *
 * Компрессор здесь обязателен. Один усилитель на разговорной записи, где голос
 * скачет от шёпота до смеха, превратил бы громкие места в треск.
 */

let ctx: AudioContext | null = null;

/** Один контекст на вкладку: каждый новый удерживает аудиоустройство. */
function audioContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    typeof window !== 'undefined'
      ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/**
 * createMediaElementSource можно вызвать для элемента ровно один раз — повторный
 * вызов бросает исключение и глушит звук совсем. Помечаем обработанные.
 */
const wired = new WeakSet<HTMLMediaElement>();

/** Во сколько раз поднимаем. 2.2 — заметно громче, но ещё не «в упор». */
const VOICE_GAIN = 2.2;

export function boostAudio(el: HTMLMediaElement | null, gain = VOICE_GAIN): void {
  if (!el || wired.has(el)) return;
  const ac = audioContext();
  if (!ac) return;

  try {
    const source = ac.createMediaElementSource(el);
    const amp = ac.createGain();
    amp.gain.value = gain;

    const comp = ac.createDynamicsCompressor();
    // Порог ниже обычного: голосовые записывают на встроенный микрофон, у них
    // мал запас по уровню, и придавливать надо раньше.
    comp.threshold.value = -24;
    comp.knee.value = 30;
    comp.ratio.value = 12;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;

    source.connect(amp);
    amp.connect(comp);
    comp.connect(ac.destination);
    wired.add(el);
  } catch {
    // Элемент уже подключён к другому графу или браузер не дал — оставляем
    // как есть: тихо, но слышно. Молчание было бы хуже.
  }
}

/**
 * Браузеры создают контекст в состоянии suspended, пока не будет жеста
 * пользователя. Вызывать перед play(), иначе усиленный звук просто не пойдёт.
 */
export function resumeAudio(): void {
  const ac = ctx;
  if (ac && ac.state === 'suspended') void ac.resume();
}
