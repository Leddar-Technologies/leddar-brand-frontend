import { useState } from "react";
import { useRouter } from "next/router";
import Button from "../components/ui/Button";
import { productTypes } from "../data/mockData";
import { submitAccessRequest } from "../services/prototypeService";

export default function Signup() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    productType: productTypes[0],
    estimatedQuantity: "",
    email: "",
    whatsappNumber: "",
    additionalInfo: "",
  });

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await submitAccessRequest(formData);
      router.push("/signup-confirmation");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-atmosphere flex min-h-screen items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="card w-full max-w-xl p-8">
        <h1 className="text-2xl font-semibold text-ink">
          Request Access to Leddar.
        </h1>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="label">Business Name</label>
            <input
              className="input"
              name="businessName"
              value={formData.businessName}
              onChange={updateField}
              required
            />
          </div>
          <div>
            <label className="label">Product Type</label>
            <select
              className="input"
              name="productType"
              value={formData.productType}
              onChange={updateField}
              required
            >
              {productTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Estimated Quantity</label>
            <input
              className="input"
              name="estimatedQuantity"
              value={formData.estimatedQuantity}
              onChange={updateField}
              type="number"
              required
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              className="input"
              name="email"
              value={formData.email}
              onChange={updateField}
              type="email"
              required
            />
          </div>
          <div>
            <label className="label">WhatsApp Number</label>
            <input
              className="input"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={updateField}
              required
            />
          </div>
          <div>
            <label className="label">Additional Info</label>
            <textarea
              className="input min-h-24"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={updateField}
            />
          </div>
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Submitting Request..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
