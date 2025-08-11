import { FloatingSaveWidget } from './floating-save-widget';

interface ContentSectionProps {
  title: string;
  desc: string;
  children: React.JSX.Element;
}

export default function ContentSection({
  title,
  desc,
  children,
}: ContentSectionProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex-none">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm">{desc}</p>
      </div>
      <div className="faded-bottom h-full w-full overflow-y-auto scroll-smooth pr-4 pb-12">
        <div>
          {children}
          <div className="mb-10" />
        </div>
      </div>
      <FloatingSaveWidget />
    </div>
  );
}
