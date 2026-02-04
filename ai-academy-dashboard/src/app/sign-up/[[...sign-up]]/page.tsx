import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-card border border-border shadow-lg',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton: 'bg-background border border-border hover:bg-accent text-foreground',
            socialButtonsBlockButtonText: 'text-foreground font-medium',
            dividerLine: 'bg-border',
            dividerText: 'text-muted-foreground',
            formFieldLabel: 'text-foreground',
            formFieldInput: 'bg-background border-border text-foreground',
            formButtonPrimary: 'bg-[#0062FF] hover:bg-[#0052D9] text-white',
            footerActionLink: 'text-[#0062FF] hover:text-[#0052D9]',
            identityPreviewText: 'text-foreground',
            identityPreviewEditButton: 'text-[#0062FF]',
            formFieldAction: 'text-[#0062FF]',
            alertText: 'text-foreground',
            logoBox: 'hidden',
          },
          variables: {
            colorPrimary: '#0062FF',
            colorBackground: 'hsl(var(--card))',
            colorText: 'hsl(var(--foreground))',
            colorInputBackground: 'hsl(var(--background))',
            colorInputText: 'hsl(var(--foreground))',
            borderRadius: '0.5rem',
          },
        }}
      />
    </div>
  );
}
