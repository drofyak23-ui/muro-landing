import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4">
      <div className="animate-pulse-slow">
        <Image
          src="/muro-logo.svg"
          alt="MURO"
          width={400}
          height={400}
          priority
          className="w-[280px] md:w-[400px] h-auto select-none"
        />
      </div>
      <div className="text-[9px] md:text-[11px] text-neutral-600 tracking-[0.35em] uppercase text-center -mt-20 md:-mt-32">
        On-chain market intelligence
      </div>
      <div className="text-6xl md:text-8xl text-[#C9A86A] tracking-[0.3em] uppercase font-light text-center mt-20 md:mt-28">
        Coming Soon
      </div>
    </main>
  );
}