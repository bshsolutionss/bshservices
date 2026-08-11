import { makeServiceCategoryPage } from "@/lib/services-page-factory";

const { generateStaticParams, generateMetadata, ServicePage } =
  makeServiceCategoryPage("marketing");

export { generateStaticParams, generateMetadata };
export default ServicePage;
