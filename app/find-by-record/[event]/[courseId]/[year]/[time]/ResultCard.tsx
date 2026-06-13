type ResultCardProps = {
  main: React.ReactNode;
  label: string;
  subLabel?: string;
  className?: string;
  testId?: string;
};

const ResultCard = ({
  main,
  label,
  subLabel,
  className = "",
  testId = "",
}: ResultCardProps) => (
  <div
    className={`flex-1 bg-card shadow-md rounded-xl p-5 flex flex-col items-center border border-primary/30 dark:border-primary/40 ${className}`}
  >
    <div
      className="text-3xl font-extrabold text-primary mb-1"
      data-testid={`${testId}-main`}
    >
      {main}
    </div>
    <div
      className="text-base font-medium text-muted-foreground mb-1"
      data-testid={`${testId}-label`}
    >
      {label}
    </div>
    {subLabel && (
      <div
        className="text-xs text-gray-500 dark:text-gray-400"
        data-testid={`${testId}-subLabel`}
      >
        {subLabel}
      </div>
    )}
  </div>
);

export default ResultCard;
