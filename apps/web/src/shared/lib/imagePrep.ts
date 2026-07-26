/**
 * Подготовка картинки перед отправкой.
 *
 * До этого модуля сжимали только два места из шести: аватар, обложка профиля,
 * фото поста и фото в чате уходили оригиналом. С телефона это 4–8 МБ на
 * снимок — их потом отдавали целиком ради круглой аватарки в 44 пикселя.
 *
 * Заодно снимается EXIF. Пересжатие идёт через canvas, а он переносит только
 * пиксели, так что координаты съёмки в снимке не остаются. Для аватарки это
 * не мелочь: она публична и раньше могла нести GPS с телефона владельца.
 */

export type ImagePurpose = 'avatar' | 'banner' | 'wallpaper' | 'photo';

interface Preset {
  /** Предел большей стороны. */
  maxSide: number;
  /** Ориентир по весу; кодировщик подбирает качество под него. */
  maxBytes: number;
}

/**
 * Размеры выведены из того, как картинку показывают, а не «на всякий случай».
 * Аватар крупнее всего рисуется в 92 CSS-пикселя — 512 покрывает даже экран с
 * тройной плотностью и оставляет запас на будущее увеличение.
 */
const PRESETS: Record<ImagePurpose, Preset> = {
  avatar: { maxSide: 512, maxBytes: 80 * 1024 },
  banner: { maxSide: 1280, maxBytes: 300 * 1024 },
  wallpaper: { maxSide: 1600, maxBytes: 400 * 1024 },
  photo: { maxSide: 1920, maxBytes: 1024 * 1024 },
};

/**
 * Форматы, которые носят EXIF с координатами. Такие пересжимаем всегда, даже
 * если файл уже лёгкий: иначе снимок с телефона утечёт вместе с местом съёмки.
 */
const CARRIES_EXIF = new Set(['image/jpeg', 'image/heic', 'image/heif']);

/** Размер картинки без её отрисовки в документ. */
async function measure(file: File): Promise<{ w: number; h: number } | null> {
  if (typeof createImageBitmap !== 'function') return null;
  try {
    const bmp = await createImageBitmap(file);
    const size = { w: bmp.width, h: bmp.height };
    bmp.close?.();
    return size;
  } catch {
    return null;
  }
}

/**
 * Приводит картинку к пресету назначения. Не картинку возвращает как есть.
 *
 * Возвращает исходный файл, если пересжимать нечего: лишний проход через
 * кодировщик тратит батарею, теряет ещё поколение качества и на уже сжатом
 * файле нередко даёт результат крупнее исходного.
 */
export async function prepareImage(file: File, purpose: ImagePurpose): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  // Анимацию через canvas пересобрать нельзя — останется один кадр.
  if (file.type === 'image/gif') return file;

  const { maxSide, maxBytes } = PRESETS[purpose];

  if (!CARRIES_EXIF.has(file.type) && file.size <= maxBytes) {
    const size = await measure(file);
    if (size && Math.max(size.w, size.h) <= maxSide) return file;
  }

  try {
    const { default: imageCompression } = await import('browser-image-compression');
    const out = await imageCompression(file, {
      maxSizeMB: maxBytes / (1024 * 1024),
      maxWidthOrHeight: maxSide,
      useWebWorker: true,
      // WebP, а не AVIF: AVIF меньше процентов на тридцать, но кодирует
      // двенадцатимегапиксельный снимок на телефоне секундами. В мессенджере
      // отправка должна ощущаться мгновенной — эти секунды дороже килобайтов.
      fileType: 'image/webp',
      initialQuality: purpose === 'avatar' ? 0.86 : 0.82,
    });

    // Пересжатие иногда проигрывает исходнику. Но для форматов с EXIF всё
    // равно берём результат: там мы платим байтами за снятые координаты.
    if (out.size >= file.size && !CARRIES_EXIF.has(file.type)) return file;
    return new File([out], file.name.replace(/\.[^.]+$/, '') + '.webp', {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (e) {
    // Отправить оригинал лучше, чем не отправить ничего.
    console.error('Не удалось подготовить картинку:', e);
    return file;
  }
}
