import Image from "next/image";

/**
 * Mobile-first photo gallery. Up to 3 images; on mobile shows the hero, on
 * sm+ shows hero on the left and two stacked thumbs on the right. Falls back
 * to a placeholder block when there are no photos.
 */
export function PhotoGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  if (photos.length === 0) {
    return (
      <div className="grid h-56 w-full place-items-center rounded-2xl bg-surface-muted text-text-muted sm:h-72">
        <PlaceholderIcon />
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

function PlaceholderIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
