"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Menu, MoreHorizontal, Plus, Search, UsersRound } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { customers, type Customer, type CustomerStatus } from "@/data/customers";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";

type SortKey = "name" | "company" | "createdAt";
const pageSize = 10;
const companies = Array.from(new Set(customers.map((customer) => customer.company)));

function initials(name: string) { return name.split(" ").map((part) => part[0]).join(""); }

function CustomerActions({ customer, onDelete }: { customer: Customer; onDelete: (customer: Customer) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="relative" onClick={(event) => event.stopPropagation()}><button className="customer-action-button" onClick={() => setOpen(!open)} aria-label={`Actions for ${customer.name}`} aria-expanded={open}><MoreHorizontal size={17} /></button>{open && <div className="customer-action-menu"><Link href={`/customers/${customer.id}`}>View customer</Link><Link href={`/customers/${customer.id}/edit`}>Edit customer</Link><button onClick={() => { setOpen(false); onDelete(customer); }}>Delete customer</button></div>}</div>;
}

export function CustomersList() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CustomerStatus>("all");
  const [company, setCompany] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 250); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { setPage(1); }, [query, status, company]);

  const filtered = useMemo(() => customers.filter((customer) => {
    const matchesQuery = `${customer.name} ${customer.email} ${customer.company}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "all" || customer.status === status) && (company === "all" || customer.company === company);
  }).sort((a, b) => { const comparison = a[sortKey].localeCompare(b[sortKey]); return sortDirection === "asc" ? comparison : -comparison; }), [query, status, company, sortKey, sortDirection]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleCustomers = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = Boolean(query || status !== "all" || company !== "all");
  const clearFilters = () => { setQuery(""); setStatus("all"); setCompany("all"); };
  const changeSort = (key: SortKey) => { if (sortKey === key) setSortDirection(sortDirection === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDirection("asc"); } };

  return <div className="dashboard-page customers-page"><DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} activeLabel="Customers" /><div className="dashboard-main"><header className="customers-header"><button className="dashboard-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={18} /></button><div><p>Workspace / Customers</p><h1>Customers</h1><span>Manage and organize your customer relationships.</span></div><Button asChild><Link href="/customers/new"><Plus size={16} /> Add customer</Link></Button></header><main><div className="customer-summary"><UsersRound size={17} /><strong>{customers.length.toLocaleString()}</strong><span>total customers</span><i /> <strong>{customers.filter((customer) => customer.status === "active").length}</strong><span>active</span></div><section className="customer-toolbar" aria-label="Customer search and filters"><label className="customer-search"><Search size={17} /><span className="sr-only">Search customers</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers..." /></label><label className="customer-select"><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value as "all" | CustomerStatus)}><option value="all">All status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><ChevronDown size={14} /></label><label className="customer-select"><span className="sr-only">Filter by company</span><select value={company} onChange={(event) => setCompany(event.target.value)}><option value="all">All companies</option>{companies.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={14} /></label>{hasFilters && <button className="clear-filters" onClick={clearFilters}>Clear filters</button>}</section><section className="customer-list-card" aria-label="Customer list">{loading ? <CustomerSkeleton /> : filtered.length === 0 ? <div className="customer-empty"><span className="empty-icon"><Search size={19} /></span><h2>No customers found</h2><p>Try adjusting your search or filters.</p>{hasFilters && <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}</div> : <><div className="table-scroll"><table><thead><tr><th><SortButton label="Customer" active={sortKey === "name"} direction={sortDirection} onClick={() => changeSort("name")} /></th><th><SortButton label="Company" active={sortKey === "company"} direction={sortDirection} onClick={() => changeSort("company")} /></th><th>Email</th><th>Status</th><th><SortButton label="Created" active={sortKey === "createdAt"} direction={sortDirection} onClick={() => changeSort("createdAt")} /></th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleCustomers.map((customer) => <tr key={customer.id} onClick={() => { window.location.href = `/customers/${customer.id}`; }} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") window.location.href = `/customers/${customer.id}`; }}><td><div className="customer-person"><span className="dash-avatar">{initials(customer.name)}</span><span><strong>{customer.name}</strong><small>{customer.email}</small></span></div></td><td>{customer.company}</td><td>{customer.email}</td><td><span className={`status ${customer.status}`}><b />{customer.status === "active" ? "Active" : "Inactive"}</span></td><td>{customer.createdAt}</td><td><CustomerActions customer={customer} onDelete={setDeleteCustomer} /></td></tr>)}</tbody></table></div><div className="customer-pagination"><span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} customers</span><div><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={15} /> Previous</button><span className="page-number">{page} <small>of {pageCount}</small></span><button onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount} aria-label="Next page">Next <ChevronRight size={15} /></button></div></div></>}</section></main></div>{deleteCustomer && <div className="dialog-backdrop" role="presentation" onClick={() => setDeleteCustomer(null)}><div className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title" onClick={(event) => event.stopPropagation()}><span className="delete-mark">!</span><h2 id="delete-title">Delete customer?</h2><p>This is a visual prototype. No customer data will be changed.</p><div><Button variant="outline" onClick={() => setDeleteCustomer(null)}>Cancel</Button><Button onClick={() => setDeleteCustomer(null)} className="delete-confirm">Delete customer</Button></div></div></div>}</div>;
}

function SortButton({ label, active, direction, onClick }: { label: string; active: boolean; direction: "asc" | "desc"; onClick: () => void }) { return <button className="sort-button" onClick={onClick}>{label}{active && (direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}</button>; }
function CustomerSkeleton() { return <div className="customer-skeleton">{Array.from({ length: 7 }).map((_, index) => <div key={index}><span /><span /><span /><span /><span /></div>)}</div>; }