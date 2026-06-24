import type { Metadata } from "next";
import ContactPage from "./client-page";

export const metadata: Metadata = {
  title: "Contact Us | BTech LEET",
  description:
    "Get in touch with the BTech LEET team. Ask about exams, counselling, premium notes, mock tests, or any other inquiry.",
};

export default function ContactPageWrapper() {
  return <ContactPage />;
}
