import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";
import RedirectIfAuthed from "@/components/RedirectIfAuthed";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <RedirectIfAuthed>
      <RegisterForm />
    </RedirectIfAuthed>
  );
}
