interface WelcomeEmailProps {
  name: string;
  locale: string;
}

export function WelcomeEmail({ name, locale }: WelcomeEmailProps) {
  return (
    <div>
      <h1>Welcome{locale === "ar-AE" ? " مرحباً" : ""}, {name}!</h1>
      <p>
        Thank you for joining ECOMM. We&apos;re excited to have you on board.
      </p>
      <p>
        Start exploring our products curated for your region.
      </p>
    </div>
  );
}
