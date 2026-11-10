"use server";

import { redirect } from "next/navigation";
import { appendSubmission } from "@/lib/submissions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact-me-server-form?error=required");
  }
  if (!EMAIL_RE.test(email)) {
    redirect("/contact-me-server-form?error=email");
  }

  await appendSubmission({ name, email, message });

  redirect("/contact-me-server-form?submitted=1");
}
