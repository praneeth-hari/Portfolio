/*
 * Renders a responsive <picture> with AVIF and WebP sources derived from a
 * base asset path in public/, falling back to the original image.
 */
const BASE = import.meta.env.BASE_URL;

function swapExt(path, ext, suffix = '') {
  return path.replace(/(\.[^.]+)$/, `${suffix}.${ext}`);
}

export default function OptimizedImage({
  src,
  alt,
  widths,
  sizes,
  width,
  height,
  className,
  loading = 'eager',
  decoding = 'async',
  fetchPriority,
  onError,
  ...rest
}) {
  const fullSrc = BASE + src;
  const avifSet = widths?.length
    ? widths
        .map((w, i) => `${BASE}${swapExt(src, 'avif', i < widths.length - 1 ? `-${w}` : '')} ${w}w`)
        .join(', ')
    : `${BASE}${swapExt(src, 'avif')}`;
  const webpSet = widths?.length
    ? widths
        .map((w, i) => `${BASE}${swapExt(src, 'webp', i < widths.length - 1 ? `-${w}` : '')} ${w}w`)
        .join(', ')
    : `${BASE}${swapExt(src, 'webp')}`;

  return (
    <picture style={{ display: 'contents' }}>
      <source type="image/avif" srcSet={avifSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSet} sizes={sizes} />
      <img
        className={className}
        src={fullSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        onError={onError}
        {...rest}
      />
    </picture>
  );
}
