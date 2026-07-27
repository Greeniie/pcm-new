import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin, Youtube } from "lucide-react";
import content from "@/data/content.json";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Upcoming Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const { contact } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-maroon text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          {/* Brand — takes more space */}
          <div className="md:col-span-5">
            <Image
              src="/images/logo.png"
              alt="PCM"
              width={80}
              height={80}
              className="h-16 w-auto object-contain mb-5"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Raising multi-cultural people with the extra-ordinary grace of
              prosperity of the spirit, soul and body and for the expansion of
              God's Kingdom.
            </p>
          </div>

          {/* Location */}
          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Our Location
            </h3>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              {contact.address}
            </p>
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white text-xs font-semibold uppercase tracking-widest rounded-full hover:border-white hover:bg-white/10 transition-all"
            >
              Get Directions
            </a>
          </div>

          {/* Quick links + phones */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5 mb-8">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5">
              {contact.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:+234${phone.replace(/^0/, "")}`}
                  className="block text-white/60 hover:text-white text-sm transition-colors"
                >
                  {phone}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-white/30 text-xs">
            &copy; {year} Pentecostal Canaanland Mission Inc. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <a href={contact.facebook} target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook size={16} />
            </a>
            <a href={contact.instagram} target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href={contact.youtube} target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors" aria-label="YouTube">
              <Youtube size={16} />
            </a>
            <a href={`mailto:${contact.email}`}
              className="text-white/30 hover:text-white transition-colors" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
