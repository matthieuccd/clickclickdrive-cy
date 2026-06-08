import Image from "next/image";

/**
 * Mobile-first photo gallery. Up to 3 images; on mobile shows the hero, on
 * sm+ shows hero on the left and two stacked thumbs on the right. When the
 * school has zero photos, renders the site-wide schools fallback image
 * (downloaded once from Unsplash query "driving school car lesson" by the
 * blog hero script, or a placeholder until then).
 */
const SCHOOL_FALLBACK_PHOTO = "/schools/fallback.jpg";

export function PhotoGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  if (photos.length === 0) {
    return (
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-surface-muted sm:h-80">
        <Image
          src={SCHOOL_FALLBACK_PHOTO}
          alt={alt}
          fill
          sizes="(min-width: 640px) 64rem, 100vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-surface-muted sm:h-80">
        <Image
          src={photos[0]}
          alt={alt}
          fill
          sizes="(min-width: 640px) 64rem, 100vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  const [hero, ...rest] = photos;
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:grid-rows-2 sm:gap-3">
      <div className="relative h-56 overflow-hidden rounded-2xl bg-surface-muted sm:col-span-2 sm:row-span-2 sm:h-auto sm:min-h-72">
        <Image
          src={hero}
          alt={alt}
          fill
          sizes="(min-width: 640px) 42rem, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {rest.slice(0, 2).map((p, i) => (
        <div
          key={p}
          className="relative hidden h-36 overflow-hidden rounded-2xl bg-surface-muted sm:block sm:h-auto sm:min-h-32"
        >
          <Image
            src={p}
            alt={`${alt} ${i + 2}`}
            fill
            sizes="(min-width: 640px) 21rem, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

