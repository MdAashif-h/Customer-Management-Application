export type CustomerStatus = "active" | "inactive";

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: CustomerStatus;
  createdAt: string;
  phone?: string;
  jobTitle?: string;
  location?: string;
  preferredContact?: string;
};

export const customers: Customer[] = [
  { id: "olivia-martin", name: "Olivia Martin", email: "olivia@acme.com", company: "Acme Inc.", status: "active", createdAt: "Sep 04, 2026", phone: "+1 (415) 555-0182", jobTitle: "Customer Success Manager", location: "San Francisco, CA", preferredContact: "Email" },
  { id: "daniel-wilson", name: "Daniel Wilson", email: "daniel@northstar.com", company: "Northstar", status: "active", createdAt: "Sep 03, 2026" },
  { id: "sophia-brown", name: "Sophia Brown", email: "sophia@vertexlabs.com", company: "Vertex Labs", status: "inactive", createdAt: "Sep 02, 2026" },
  { id: "ethan-miller", name: "Ethan Miller", email: "ethan@brightline.com", company: "Brightline", status: "active", createdAt: "Sep 01, 2026" },
  { id: "emma-davis", name: "Emma Davis", email: "emma@horizon.com", company: "Horizon Co.", status: "active", createdAt: "Aug 30, 2026" },
  { id: "liam-thompson", name: "Liam Thompson", email: "liam@meridian.io", company: "Meridian", status: "active", createdAt: "Aug 28, 2026" },
  { id: "ava-johnson", name: "Ava Johnson", email: "ava@lumenworks.com", company: "Lumen Works", status: "inactive", createdAt: "Aug 27, 2026" },
  { id: "noah-williams", name: "Noah Williams", email: "noah@atlasgroup.com", company: "Atlas Group", status: "active", createdAt: "Aug 25, 2026" },
  { id: "mia-garcia", name: "Mia Garcia", email: "mia@oakandco.com", company: "Oak & Co.", status: "active", createdAt: "Aug 23, 2026" },
  { id: "james-anderson", name: "James Anderson", email: "james@pioneer.dev", company: "Pioneer", status: "inactive", createdAt: "Aug 21, 2026" },
  { id: "isabella-moore", name: "Isabella Moore", email: "isabella@northpoint.com", company: "Northpoint", status: "active", createdAt: "Aug 19, 2026" },
  { id: "benjamin-taylor", name: "Benjamin Taylor", email: "ben@copperfield.co", company: "Copperfield", status: "active", createdAt: "Aug 17, 2026" },
  { id: "charlotte-lee", name: "Charlotte Lee", email: "charlotte@fieldstone.com", company: "Fieldstone", status: "active", createdAt: "Aug 15, 2026" },
  { id: "henry-harris", name: "Henry Harris", email: "henry@verveagency.com", company: "Verve Agency", status: "inactive", createdAt: "Aug 13, 2026" },
  { id: "amelia-clark", name: "Amelia Clark", email: "amelia@silverline.com", company: "Silverline", status: "active", createdAt: "Aug 11, 2026" },
];

export function getCustomerDetails(customer: Customer) {
  return {
    ...customer,
    phone: customer.phone ?? "+1 (415) 555-0128",
    jobTitle: customer.jobTitle ?? "Operations Manager",
    location: customer.location ?? "New York, NY",
    preferredContact: customer.preferredContact ?? "Email",
  };
}