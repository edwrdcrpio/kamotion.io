import Link from "next/link"
import Image from "next/image"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <div className="flex items-center justify-center">
        <Image
          src="/Kamotion-Logo-v1.png"
          alt="Kamotion Logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
      </div>
      <span className="ml-2 text-xl font-bold font-flyover">
        kamotion.io
      </span>
    </Link>
  )
}
