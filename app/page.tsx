import { getFilteredEvents } from "@/app/eventFilter";
import { HomePageContent } from "@/components/HomePageContent";
import { REVALIDATE_SECONDS_MONTH } from "@/lib/constants";

export const revalidate = REVALIDATE_SECONDS_MONTH;

const HomePage = async () => {
  const initialData = await getFilteredEvents();

  return <HomePageContent initialData={initialData} />;
};

export default HomePage;
