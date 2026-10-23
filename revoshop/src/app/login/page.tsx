import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import RedirectIfAuthed from "@/components/RedirectIfAuthed";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <RedirectIfAuthed>
      <LoginForm />
    </RedirectIfAuthed>
  );
}
