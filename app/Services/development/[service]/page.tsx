import { makeServiceCategoryPage } from "@/lib/services-page-factory";

const { generateStaticParams, generateMetadata, ServicePage } =
  makeServiceCategoryPage("development");

export { generateStaticParams, generateMetadata };
export default ServicePage;
