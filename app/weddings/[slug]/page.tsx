import { redirect } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

export default function WeddingsAliasPage({ params }: PageProps) {
  redirect(`/w/${params.slug}`);
}
