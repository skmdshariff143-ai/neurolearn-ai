import { Roadmap } from "@/components/roadmap";
import { StructuredTools } from "@/components/structured-tools";
import { CourseWorkspace } from "@/components/course-workspace";
export default function Page() {
  return (
    <>
      <Roadmap />
      <CourseWorkspace />
      <StructuredTools task="roadmap" />
    </>
  );
}
