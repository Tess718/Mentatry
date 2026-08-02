import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Mentatry",
  description: "Privacy policy for the Mentatry platform.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="neo-box bg-cyan-100 border-4 border-black p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight mb-4 text-black">
          Privacy Policy
        </h1>
        <p className="text-xl font-bold text-slate-800">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="neo-box bg-white p-8 sm:p-12 space-y-8 prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-cyan-700 prose-a:font-bold">
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect information to provide better services to all our users. When you use Mentatry, we may collect the following types of information:
          </p>
          <ul>
            <li><strong>Account Information:</strong> If you create an account, we collect your name, email address, and authentication credentials (e.g., Google OAuth profile data).</li>
            <li><strong>Usage Data:</strong> We collect data about how you interact with the platform, such as quizzes created, answers submitted, and time spent on questions.</li>
            <li><strong>Guest Information:</strong> If you join a quiz as a guest, we collect a temporary display name and associate it with a temporary session token.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services.</li>
            <li>Generate AI quizzes based on the topics you request.</li>
            <li>Track participant scores, leaderboards, and analytics for hosts.</li>
            <li>Ensure the security and integrity of the platform.</li>
          </ul>
        </section>

        <section>
          <h2>3. AI and Third-Party Services</h2>
          <p>
            Mentatry uses artificial intelligence models to generate quiz content. 
            When you provide topics or source materials for quiz generation, that data is processed by our AI providers to create the questions and options. 
            We do not use your personal information to train these models.
          </p>
        </section>

        <section>
          <h2>4. Data Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We may share your information in the following situations:
          </p>
          <ul>
            <li><strong>With Quiz Hosts:</strong> If you participate in a quiz, the host will see your display name, answers, and scores.</li>
            <li><strong>With Service Providers:</strong> We share data with trusted third-party vendors (like database and hosting providers) that help us operate the service.</li>
            <li><strong>For Legal Reasons:</strong> We may disclose information if required by law or to protect our rights and the safety of our users.</li>
          </ul>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, or delete your personal data. 
            You can manage your account settings or contact us to exercise these rights.
          </p>
        </section>

        <section>
          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>
      </div>
    </div>
  );
}
