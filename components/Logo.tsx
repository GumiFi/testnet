import Image from "next/image";
import logo from "@/public/brand/logo.png";

export default function Logo({
  className = "h-9 w-auto",
}: {
  className?: string;
}) {
  return <Image src={logo} alt="Gumifi" className={className} priority />;
}
