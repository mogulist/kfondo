import { getFilteredEvents } from "@/app/eventFilter";
import { HomePageContent } from "@/components/HomePageContent";

export const revalidate = 3600;

const HomePage = async () => {
  const initialData = await getFilteredEvents();

  return <HomePageContent initialData={initialData} />;
};

export default HomePage;
