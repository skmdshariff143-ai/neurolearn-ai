export default function Page() {
  return (
    <article className="prose">
      <div className="eyebrow">Privacy information · Development preview</div>
      <h1 className="page-title">Learn without sharing your identity.</h1>
      <p>
        No name, email, age, or named account is needed for the guest
        demonstration. Do not enter sensitive personal details in lesson
        requests.
      </p>
      <h2>Data in your browser</h2>
      <p>
        Your preferences, assessment scores, weak concept identifiers, lesson
        history, and roadmap checkpoints are stored in local browser storage.
        Anyone with access to this browser profile may be able to read them.
        Settings lets you export progress and clear guest data. Clearing site
        storage also deletes your records.
      </p>
      <h2>Server requests and external services</h2>
      <p>
        PDF notes are parsed locally. Original files are not retained. Extracted
        text, page identifiers and courses are saved in this browser. Anyone
        using this browser profile can access them. Explicit hosted-save buttons
        send selected extracted text or course records to the private guest
        PostgreSQL repository, if configured. Classroom PDF consent sends up to
        three matching passages to the selected inference provider. LangSmith
        traces omit document content. Delete local and hosted copies separately;
        Settings can delete all hosted guest records.
      </p>
      <p>
        Topic, explanation language, level, and any text you submit go to the
        application server. In live mode they are sent to the configured Nebius
        or local inference provider. When you select research, your topic is
        sent to Tavily. Retrieved public sources may be cached for one hour. A
        session cookie supports request limiting. Optional LangSmith tracing
        redacts learner inputs and generated outputs in this implementation.
      </p>
      <h2>Children and production use</h2>
      <p>
        This development preview has no age verification, parent account, or
        production consent system. A public service onboarding children requires
        a documented legal and parental compliance review before launch. We have
        not completed that review.
      </p>
      <h2>Educational limits</h2>
      <p>
        Generated content can be wrong. Check important facts using
        authoritative references. Medical, legal, and other high-stakes learning
        content is general education and cannot replace advice from a qualified
        professional.
      </p>
      <h2>Retention</h2>
      <p>
        Browser data remains until you clear it. Optional hosted guest storage
        saves preferences and new server-graded curated assessment results after
        you enable it in Settings. A private HttpOnly cookie controls access and
        expires after 30 days. Losing that cookie loses access to the record.
        Hosted records remain until you delete them or an operator performs
        retention cleanup. Settings offers separate hosted deletion. Production
        hosted access requires an organizer demonstration code; there is no
        named account or cross-device recovery. Third-party retention depends on
        your configured service accounts and policies; review those policies
        before enabling them.
      </p>
    </article>
  );
}
