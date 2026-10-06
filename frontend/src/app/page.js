
import BulkOrdersSection from "@/components/Bulkorderssection";
import ClientReviewsSection from "@/components/Clientreviewssection";
import ContactQuoteSection from "@/components/ContactQuoteSection";
import FabricCollections from "@/components/Fabriccollections";
import FeaturedProducts from "@/components/Featuredproducts";
import HeroSection from "@/components/Herosection";
import IndustriesWeServe from "@/components/Industriesweserve";
import LatestBlogSection from "@/components/LatestBlogSection";
import ManufacturingProcess from "@/components/Manufacturingproces";
import OurFacility from "@/components/Ourfacility";
import WhyChooseUs from "@/components/Whychooseus";
import WorldwideExport from "@/components/Worldwideexport";

export default function Home() {
  return (
    <main>
       <HeroSection />
      <WhyChooseUs />
      <FabricCollections />
      <FeaturedProducts />
      <ManufacturingProcess />
      <OurFacility />
      <IndustriesWeServe />
      <WorldwideExport />
      <BulkOrdersSection />
   <ClientReviewsSection />
   <LatestBlogSection />
   <ContactQuoteSection />
     
    </main>
  );
}