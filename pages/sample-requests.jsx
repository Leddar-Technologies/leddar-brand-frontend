import { useRouter } from "next/router";
import PageWrapper from "../components/layout/PageWrapper";
import SampleInfoPage from "../components/brand/SampleInfoPage";

export default function SampleOrderPage() {
  const router = useRouter();

  // mode = "payment" when the user arrives from QuoteForm ("Request Sample" button)
  // mode = "info"    when the user navigates here directly from the sidebar
  const mode = router.query.source === "new-order" ? "payment" : "info";

  return (
    <PageWrapper>
      <SampleInfoPage mode={mode} />
    </PageWrapper>
  );
}
