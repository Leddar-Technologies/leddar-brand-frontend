import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Feather as Leather, Users, Award, ArrowRight } from "lucide-react";
import Spinner from "../components/ui/Spinner";
import { productTypes } from "../data/mockData";
import { submitAccessRequest } from "../services/prototypeService";
import { resetKycProfile, setLastBrandName } from "../services/authService";

export default function Signup() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [formData, setFormData] = useState({
    businessName: "",
    productType: "",
    estimatedQuantity: "",
    contactName: "",
    email: "",
    phone: "",
  });

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setResponseMessage("");

    try {
      await submitAccessRequest(formData);
      resetKycProfile();
      setLastBrandName(formData.businessName);
      router.push({
        pathname: "/signup-confirmation",
        query: {
          contactName: formData.contactName,
          businessName: formData.businessName,
        },
      });
    } catch (error) {
      setResponseMessage(
        error?.message ||
          "Unable to submit your application right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-atmosphere">
      <header className="border-b border-[#E8DED5] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-leather p-2">
              <Leather className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-ink">Leddar</h1>
          </div>
          <div className="text-sm text-[#5A4A44]">
            Premium Leather Manufacturing
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-ink lg:text-6xl">
                Premium Leather Manufacturing
                <span className="text-gold"> for Your Brand</span>
              </h2>
              <p className="mb-8 text-xl text-[#5A4A44]">
                Partner with Leddar to bring your leather product vision to
                life. From concept to creation, we deliver exceptional quality
                with personalized service for fashion entrepreneurs and
                retailers.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
                <Users className="mb-3 h-8 w-8 text-gold" />
                <h3 className="mb-2 font-semibold text-ink">
                  Expert Craftsmanship
                </h3>
                <p className="text-sm text-[#6A5B54]">
                  Skilled artisans with decades of experience.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
                <Award className="mb-3 h-8 w-8 text-gold" />
                <h3 className="mb-2 font-semibold text-ink">Premium Quality</h3>
                <p className="text-sm text-[#6A5B54]">
                  Only the finest materials and finishes.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8DED5] bg-white p-6 shadow-sm">
                <Leather className="mb-3 h-8 w-8 text-gold" />
                <h3 className="mb-2 font-semibold text-ink">
                  Custom Solutions
                </h3>
                <p className="text-sm text-[#6A5B54]">
                  Tailored manufacturing for your production needs.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DED5] bg-white p-8 shadow-lg">
            <div className="mb-6">
              <h3 className="mb-2 text-2xl font-bold text-ink">
                Partner Application
              </h3>
              <p className="text-[#5A4A44]">
                Apply for exclusive access to our B2B manufacturing portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3C2F2A]">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={updateField}
                  className="w-full rounded-lg border border-[#D7CBC1] px-4 py-3 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C49A3C55]"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3C2F2A]">
                  Product Type *
                </label>
                <select
                  name="productType"
                  required
                  value={formData.productType}
                  onChange={updateField}
                  className="w-full rounded-lg border border-[#D7CBC1] px-4 py-3 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C49A3C55]"
                >
                  <option value="">Select product type</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3C2F2A]">
                  Estimated Monthly Quantity *
                </label>
                <select
                  name="estimatedQuantity"
                  required
                  value={formData.estimatedQuantity}
                  onChange={updateField}
                  className="w-full rounded-lg border border-[#D7CBC1] px-4 py-3 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C49A3C55]"
                >
                  <option value="">Select quantity range</option>
                  <option value="50-100">50-100 units</option>
                  <option value="100-500">100-500 units</option>
                  <option value="500-1000">500-1000 units</option>
                  <option value="1000+">1000+ units</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3C2F2A]">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  required
                  value={formData.contactName}
                  onChange={updateField}
                  className="w-full rounded-lg border border-[#D7CBC1] px-4 py-3 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C49A3C55]"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3C2F2A]">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={updateField}
                  className="w-full rounded-lg border border-[#D7CBC1] px-4 py-3 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C49A3C55]"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#3C2F2A]">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={updateField}
                  className="w-full rounded-lg border border-[#D7CBC1] px-4 py-3 text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#C49A3C55]"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-leather px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#5A2F22] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-[#E8DED5] bg-[#FAF7F4] p-4 text-center sm:p-5">
              <p className="text-sm text-[#5A4A44]">Already have an account?</p>
              <Link
                href="/login"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[#D7CBC1] bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-gold hover:text-gold sm:w-auto sm:min-w-[180px]"
              >
                Go to Login
              </Link>
            </div>

            {responseMessage ? (
              <p className="mt-4 rounded-lg border border-[#B423181A] bg-[#B4231812] px-4 py-3 text-sm text-danger">
                {responseMessage}
              </p>
            ) : null}

            <p className="mt-4 text-center text-xs text-[#7F7068]">
              Applications are reviewed within 24-48 hours. You will receive
              access credentials once approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
