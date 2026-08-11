import { makeServiceCategoryPage } from "@/lib/services-page-factory";

const { generateStaticParams, generateMetadata, ServicePage } =
  makeServiceCategoryPage("ai");

export { generateStaticParams, generateMetadata };
export default ServicePage;
