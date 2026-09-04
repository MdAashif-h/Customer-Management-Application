"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackgroundEffects } from "@/components/landing/background-effects";
import { CustomerForm } from "@/components/customers/customer-form";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default function NewCustomerPage() { return <div className="dashboard-page form-page"><BackgroundEffects /><DashboardSidebar mobileOpen={false} onClose={() => undefined} activeLabel="Customers" /><div className="dashboard-main"><main className="form-content"><Link href="/customers" className="form-breadcrumb"><ArrowLeft size={15} /> Customers <span>/</span> Add customer</Link><header className="form-header"><p>Customer workspace</p><h1>Add customer</h1><span>Create a new customer profile and keep your customer information organized.</span></header><CustomerForm /></main></div></div>; }