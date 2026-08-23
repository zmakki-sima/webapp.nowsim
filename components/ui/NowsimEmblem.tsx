type NowsimEmblemProps = {
  className?: string;
  id?: string;
};

export function NowsimEmblem({
  className,
  id = "nowsim-emblem-fade",
}: NowsimEmblemProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path d="M66.6166 106.586H0V199.85H66.6166V106.586Z" fill="currentColor" />
      <path
        d="M133.234 0H199.851V146.556L133.234 53.2932V0Z"
        fill={`url(#${id})`}
      />
      <path
        d="M133.232 146.556V53.293H66.6152V106.586L133.232 199.849H199.848V146.556H133.232Z"
        fill="currentColor"
      />
      <defs>
        <linearGradient
          id={id}
          x1="166.543"
          y1="-18.5046"
          x2="166.543"
          y2="166.541"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.2" stopColor="currentColor" />
          <stop offset="0.8" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
