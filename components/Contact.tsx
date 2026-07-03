"use client";

import { motion } from "framer-motion";
import { contact, profile } from "@/lib/content";
import SectionHeading from "./SectionHeading";

const links = [
  { label: "Email", value: contact.email, href: `mailto:${contact.email}`, cmd: "open --mail" },
  { label: "GitHub", value: "github.com/NaramCharan", href: contact.github, cmd: "git remote" },
  { label: "LinkedIn", value: "in/naramcharan", href: contact.linkedin, cmd: "connect --pro" },
  { label: "WhatsApp", value: "direct chat", href: contact.whatsapp, cmd: "ping --direct" },
];

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-28">
      <SectionHeading
        index="04"
        title="Establish Link"
        subtitle="Channels are open. Reach out for internships, collaborations, or to talk shop about ML."
      />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-xl border border-line bg-surface/70 shadow-[0_0_40px_-12px_rgba(34,211,238,0.3)]"
      >
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 border-b border-line bg-bg-2/80 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-cyan/80" />
          <span className="ml-2 mono text-[11px] tracking-wide text-text-muted">
            jarvis@naramcharan:~$ contact
          </span>
        </div>

        {/* Terminal body */}
        <div className="space-y-1.5 p-5 sm:p-6">
          <p className="mono text-sm text-cyan/80">
            $ whoami
            <br />
            <span className="text-text">{profile.fullName}</span>
            <span className="text-text-muted"> — {profile.role}</span>
          </p>
          <p className="mono pt-2 text-sm text-cyan/80">$ list --channels</p>

          <ul className="divide-y divide-line/60 pt-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 py-3 transition-colors duration-200 hover:bg-cyan/5"
                >
                  <span className="mono w-24 text-xs tracking-wide text-gold/90">
                    {l.cmd}
                  </span>
                  <span className="text-sm font-medium text-text group-hover:text-cyan-bright">
                    {l.label}
                  </span>
                  <span className="mono text-xs text-text-muted">{l.value}</span>
                  <span className="mono ml-auto text-xs text-cyan opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mono flex items-center pt-3 text-sm text-cyan/80">
            $ <span className="ml-1 inline-block h-4 w-2 animate-blink bg-cyan" />
          </p>
        </div>
      </motion.div>

      <p className="mt-10 text-center mono text-[11px] tracking-[0.25em] text-text-muted">
        DESIGNED & BUILT BY {profile.name.toUpperCase()} · POWERED BY J.A.R.V.I.S
      </p>
    </section>
  );
}
