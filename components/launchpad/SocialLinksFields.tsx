"use client";

type SocialLinksFieldsProps = {
  website: string;
  onWebsiteChange: (value: string) => void;
  twitter: string;
  onTwitterChange: (value: string) => void;
  telegram: string;
  onTelegramChange: (value: string) => void;
};

export default function SocialLinksFields({
  website,
  onWebsiteChange,
  twitter,
  onTwitterChange,
  telegram,
  onTelegramChange,
}: SocialLinksFieldsProps) {
  return (
    <div className="space-y-3">
      <SocialField label="Website" value={website} onChange={onWebsiteChange} placeholder="https://yourproject.com" />
      <SocialField
        label="Twitter / X"
        value={twitter}
        onChange={onTwitterChange}
        placeholder="https://x.com/yourproject"
      />
      <SocialField
        label="Telegram"
        value={telegram}
        onChange={onTelegramChange}
        placeholder="https://t.me/yourproject"
      />
    </div>
  );
}

function SocialField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">{label}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        placeholder={placeholder}
        className="mt-2 w-full border border-line bg-panel px-4 py-2.5 font-body text-sm text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
      />
    </div>
  );
}
