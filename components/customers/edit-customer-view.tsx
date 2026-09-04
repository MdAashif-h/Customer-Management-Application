"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Customer } from "@/data/customers";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { CustomerForm } from "@/components/customers/customer-form";
export function EditCustomerView({ customer }: { customer: Customer }) { return <div className="dashboard-page form-page"><DashboardSidebar mobileOpen={false} onClose={() => undefined} activeLabel="Customers" /><div className="dashboard-main"><main className="form-content"><Link href={`/customers/${customer.id}`} className="form-breadcrumb"><ArrowLeft size={15} /> {customer.name} <span>/</span> Edit customer</Link><header className="form-header"><p>Customer workspace</p><h1>Edit customer</h1><span>Update the details for {customer.name}.</span></header><CustomerForm customer={customer} /></main></div></div>; }