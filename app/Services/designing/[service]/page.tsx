import { makeServiceCategoryPage } from "@/lib/services-page-factory";

const { generateStaticParams, generateMetadata, ServicePage } =
  makeServiceCategoryPage("designing");

export { generateStaticParams, generateMetadata };
export default ServicePage;
