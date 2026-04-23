import { GenerateForm } from "@/app/app/generate/generate-form";

export const metadata = { title: "Generate Tasks" };

// Batch 5 replaces this with a demo-aware picker. For now it renders the real
// form, which will hit the MSW /api/ai/parse handler (added in Batch 3).
export default function TryGeneratePage() {
  return <GenerateForm />;
}
