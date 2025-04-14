import env from "~/lib/env";

export default function resetPasswordTemplate(tokenId: string) {
  return (
    <div>
      <div>
        <h1>Your Origami Password Reset Link</h1>
      </div>
      <div>
        <p>Click the link below to set a new password</p>
        <a href={`${env.WEBSITE_URL}/forgot-password/${tokenId}`}>
          Reset Your Password
        </a>

        <p>Or, past this link into your browser:</p>
        <pre>
          {env.WEBSITE_URL}/forgot-password/{tokenId}
        </pre>
        <p>Best regards,</p>
        <p>Origami</p>
      </div>
    </div>
  );
}
