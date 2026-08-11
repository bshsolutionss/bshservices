import { makeServiceCategoryPage } from "@/lib/services-page-factory";

const { generateStaticParams, generateMetadata, ServicePage } =
  makeServiceCategoryPage("photography");

export { generateStaticParams, generateMetadata };
export default ServicePage;
