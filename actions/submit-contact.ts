"use server";

import { redirect } from "next/navigation";
import { appendSubmission } from "@/lib/submissions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (email) params.set("email", email);

  if (!name || !email || !message) {
    redirect(`/contact-me-server-form?error=required&${params.toString()}`);
  }
  if (!EMAIL_RE.test(email)) {
    redirect(`/contact-me-server-form?error=email&${params.toString()}`);
  }

  await appendSubmission({ name, email, message });

  redirect("/contact-me-server-form?submitted=1");
}
