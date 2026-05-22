import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompanyDetailClient } from "@/components/companies/company-detail-client";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { companyId } = await params;
  const company = await db.company.findUnique({
    where: { id: companyId },
    include: { _count: { select: { projects: true } } },
  });

  if (!company || company.userId !== session.userId) notFound();

  // structuredClone serializes Dates to ISO strings when passed across the server→client boundary
  return <CompanyDetailClient company={JSON.parse(JSON.stringify(company))} />;
}
