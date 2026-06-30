// import PageWrapper from "../components/layout/PageWrapper";
// import Button from "../components/ui/Button";

// export default function ProfilePage() {
//   return (
//     <PageWrapper>
//       <h1 className="page-title">Profile &amp; Settings</h1>
//       <div className="mt-6 grid gap-5 lg:grid-cols-2">
//         <section className="card p-6">
//           <h2 className="text-xl font-semibold text-ink">Business Info</h2>
//           <div className="mt-4 grid gap-4">
//             <div>
//               <label className="label">Business Name</label>
//               <input className="input" defaultValue="Zara Couture" />
//             </div>
//             <div>
//               <label className="label">Email</label>
//               <input
//                 className="input"
//                 defaultValue="operations@zaracouture.com"
//               />
//             </div>
//             <div>
//               <label className="label">WhatsApp Number</label>
//               <input className="input" defaultValue="+234 800 123 4567" />
//             </div>
//             <Button>Save Changes</Button>
//           </div>
//         </section>

//         <section className="card p-6">
//           <h2 className="text-xl font-semibold text-ink">Security</h2>
//           <div className="mt-4 grid gap-4">
//             <div>
//               <label className="label">Current Password</label>
//               <input className="input" type="password" />
//             </div>
//             <div>
//               <label className="label">New Password</label>
//               <input className="input" type="password" />
//             </div>
//             <div>
//               <label className="label">Confirm New Password</label>
//               <input className="input" type="password" />
//             </div>
//             <Button variant="accent">Update Password</Button>
//           </div>
//         </section>
//       </div>
//     </PageWrapper>
//   );
// }

// pages/profile.jsx — Brand app
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { getSession } from "../services/authService";
import axios from "axios";
import PhoneInput, { validatePhone, normalizePhone } from "../components/ui/PhoneInput";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function authHeaders() {
  const session = getSession();
  return { Authorization: `Bearer ${session?.token}` };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Profile fields
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/profile/brand`, { headers: authHeaders() })
      .then((res) => {
        const data = res.data.data;
        setProfile(data);
        setBusinessName(data.businessName || "");
        setContactName(data.contactName || "");
        setWhatsapp(data.whatsapp || "");
        setDescription(data.description || "");
      })
      .catch((err) => console.error("Profile load error:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      await axios.patch(
        `${API_URL}/profile/brand`,
        { businessName, contactName, whatsapp, description },
        { headers: authHeaders() },
      );
      setSaveSuccess("Profile updated successfully.");
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await axios.patch(
        `${API_URL}/profile/change-password`,
        { currentPassword, newPassword },
        { headers: authHeaders() },
      );
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (loading) return (
    <PageWrapper>
      <div className="mt-10 flex justify-center"><Spinner size="lg" className="text-gold" /></div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <h1 className="page-title">Profile & Settings</h1>
      <p className="page-subtitle mt-1">Manage your brand information and account settings.</p>

      <div className="mt-6 space-y-6">
        {/* Profile form */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Business Information</h2>
          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Business Name</label>
                <input className="input" value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div>
                <label className="label">Contact Name</label>
                <input className="input" value={contactName}
                  onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <PhoneInput
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={profile?.user?.email || ""} disabled
                  className="input opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea className="input min-h-20" value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your brand..." />
            </div>
            {saveError   ? <p className="text-sm text-[#B42318]">{saveError}</p>   : null}
            {saveSuccess ? <p className="text-sm text-success">{saveSuccess}</p>   : null}
            <Button type="submit" variant="accent" disabled={saving} className="w-full sm:w-auto">
              {saving ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="text-espresso" /><span>Saving...</span></span> : "Save Changes"}
            </Button>
          </form>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Change Password</h2>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Current Password</label>
                <input className="input" type="password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
              </div>
            </div>
            {passwordError   ? <p className="text-sm text-[#B42318]">{passwordError}</p>   : null}
            {passwordSuccess ? <p className="text-sm text-success">{passwordSuccess}</p>   : null}
            <Button type="submit" variant="outline" disabled={passwordLoading} className="w-full sm:w-auto">
              {passwordLoading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="text-gold" /><span>Updating...</span></span> : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
