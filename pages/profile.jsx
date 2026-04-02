import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";

export default function ProfilePage() {
  return (
    <PageWrapper>
      <h1 className="page-title">Profile &amp; Settings</h1>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-xl font-semibold text-ink">Business Info</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="label">Business Name</label>
              <input className="input" defaultValue="Zara Couture" />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                defaultValue="operations@zaracouture.com"
              />
            </div>
            <div>
              <label className="label">WhatsApp Number</label>
              <input className="input" defaultValue="+234 800 123 4567" />
            </div>
            <Button>Save Changes</Button>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold text-ink">Security</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="label">Current Password</label>
              <input className="input" type="password" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input className="input" type="password" />
            </div>
            <Button variant="accent">Update Password</Button>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
