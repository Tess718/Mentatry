import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Mentatry",
  description: "Terms of service for the Mentatry platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="neo-box bg-purple-200 border-4 border-black p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight mb-4 text-black">
          Terms of Service
        </h1>
        <p className="text-xl font-bold text-slate-800">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="neo-box bg-white p-8 sm:p-12 space-y-8 prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-purple-700 prose-a:font-bold">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Mentatry ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to all the terms and conditions, you may not access or use the Service.
          </p>
        </section>

        <section>
          <h2>2. Use of the Service</h2>
          <p>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for all activity that occurs under your account.
          </p>
          <ul>
            <li>You must not use the Service to distribute malicious content, spam, or abusive material.</li>
            <li>You must not attempt to gain unauthorized access to any part of the Service.</li>
            <li>You must not use the Service to infringe upon the intellectual property rights of others.</li>
          </ul>
        </section>

        <section>
          <h2>3. AI-Generated Content</h2>
          <p>
            Mentatry uses AI to generate quizzes and related content. While we strive for accuracy, we cannot guarantee the correctness, reliability, or appropriateness of AI-generated content. You are responsible for reviewing and verifying the content before sharing it with others.
          </p>
        </section>

        <section>
          <h2>4. User Content</h2>
          <p>
            You retain all rights to any content you submit or create on the platform ("User Content"). 
            By submitting User Content, you grant Mentatry a worldwide, non-exclusive, royalty-free license to use, reproduce, and display the content solely for the purpose of providing the Service.
          </p>
        </section>

        <section>
          <h2>5. Accounts and Security</h2>
          <p>
            You are responsible for safeguarding the password or credentials you use to access the Service. 
            We cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
          </p>
        </section>

        <section>
          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation a breach of the Terms.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall Mentatry, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2>8. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
