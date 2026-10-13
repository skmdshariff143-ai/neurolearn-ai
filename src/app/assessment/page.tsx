import { Assessment } from "@/components/assessment";
import { StructuredTools } from "@/components/structured-tools";
export default function Page() {
  return (
    <>
      <Assessment />
      <StructuredTools task="evaluate" />
      <StructuredTools task="diagnostic" />
    </>
  );
}
