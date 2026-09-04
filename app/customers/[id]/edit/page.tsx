import { notFound } from "next/navigation";
import { customers, getCustomerDetails } from "@/data/customers";
import { EditCustomerView } from "@/components/customers/edit-customer-view";
export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const customer = customers.find((item) => item.id === id); if (!customer) notFound(); return <EditCustomerView customer={getCustomerDetails(customer)} />; }