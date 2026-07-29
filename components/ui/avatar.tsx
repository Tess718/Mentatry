import Image from "next/image";

export type AvatarStyle =
  | "bottts-neutral"
  | "adventurer-neutral"
  | "thumbs"
  | "fun-emoji"
  | "identicon";

interface AvatarProps {
  seed: string;
  size?: number;
  style?: AvatarStyle;
  className?: string;
}

export default function Avatar({
  seed,
  size = 40,
  style = "bottts-neutral",
  className,
}: AvatarProps) {
  // Using DiceBear 9.x gender-neutral styles with curated pop-brutalist pastel backgrounds
  const avatarUrl = `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,fde047,f472b6,a7f3d0`;

  return (
    <Image
      src={avatarUrl}
      alt={`Avatar for ${seed}`}
      width={size}
      height={size}
      className={`rounded-full object-cover border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${className || ""}`}
      unoptimized
      priority
    />
  );
}
