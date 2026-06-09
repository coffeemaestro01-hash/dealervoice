import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    country: string;
    city: string;
    slug: string;
  }>;
}

export default async function DealerProfileRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/dealership/${slug}`);
}
