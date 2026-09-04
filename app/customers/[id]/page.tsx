import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getCustomerDetails, customers } from "@/data/customers";
import { CustomerDetails } from "@/components/customers/customer-details";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = customers.find((item) => item.id === id);
  if (!customer) return <main className="customer-not-found"><div><span><Search size={20} /></span><h1>Customer not found</h1><p>The customer you&apos;re looking for doesn&apos;t exist or may have been removed.</p><Link href="/customers"><ArrowLeft size={15} /> Back to customers</Link></div></main>;
  return <CustomerDetails customer={getCustomerDetails(customer)} />;
}