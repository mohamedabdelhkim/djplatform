import { HeroSection } from "@/src/components/sections/HeroSection";
import { AboutSection } from "@/src/components/sections/AboutSection";
import { MusicSection } from "@/src/components/sections/MusicSection";
import { EventsSection } from "@/src/components/sections/EventsSection";
import { GallerySection } from "@/src/components/sections/GallerySection";
import { BookingSection } from "@/src/components/sections/BookingSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <MusicSection />
      <EventsSection />
      <GallerySection />
      <BookingSection />
    </>
  );
}
