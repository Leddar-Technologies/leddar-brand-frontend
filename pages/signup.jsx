import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Button from "../components/ui/Button";
import { productTypes } from "../data/mockData";
import { submitAccessRequest } from "../store/slices/accessRequestSlice";

export default function Signup() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.accessRequest);

  // const [formData, setFormData] = useState({
  //   businessName: "",
  //   productType: productTypes[0],
  //   estimatedQuantity: "",
  //   email: "",
  //   whatsappNumber: "",
  //   additionalInfo: "",
  // });

  const [formData, setFormData] = useState({
    businessName: "",
    productType: productTypes[0],
    email: "",
    password: "", // Added to match Zod
    whatsapp: "", // Changed from whatsappNumber
    contactInfo: "", // Changed from additionalInfo
  });

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await dispatch(submitAccessRequest(formData)).unwrap();
      router.push("/signup-confirmation");
    } catch (err) {
      console.error(err);
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
                <option key={type} value={type}>
                  {type}
                </option>
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
              name="contactInfo"
              value={formData.contactInfo}
              onChange={updateField}
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Submitting Request..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
