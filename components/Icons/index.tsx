interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  stroke?: string;
  onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  style?: React.CSSProperties;
}

const IconX = (props: IconProps) => {
  const {
    className,
    size = 20,
    strokeWidth = 2,
    stroke,
    style,
    onClick,
  } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      style={style}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M18 6l-12 12' />
      <path d='M6 6l12 12' />
    </svg>
  );
};

const IconShare = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' />
      <path d='M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' />
      <path d='M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' />
      <path d='M8.7 10.7l6.6 -3.4' />
      <path d='M8.7 13.3l6.6 3.4' />
    </svg>
  );
};

const IconCheck = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M5 12l5 5l10 -10' />
    </svg>
  );
};

const IconCopy = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z' />
      <path d='M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1' />
    </svg>
  );
};

const IconRobot = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M6 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z' />
      <path d='M12 2v2' />
      <path d='M9 12v9' />
      <path d='M15 12v9' />
      <path d='M5 16l4 -2' />
      <path d='M15 14l4 2' />
      <path d='M9 18h6' />
      <path d='M10 8v.01' />
      <path d='M14 8v.01' />
    </svg>
  );
};

const IconUser = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0' />
      <path d='M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2' />
    </svg>
  );
};

const IconUserCog = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0' />
      <path d='M6 21v-2a4 4 0 0 1 4 -4h2.5' />
      <path d='M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
      <path d='M19.001 15.5v1.5' />
      <path d='M19.001 21v1.5' />
      <path d='M22.032 17.25l-1.299 .75' />
      <path d='M17.27 20l-1.3 .75' />
      <path d='M15.97 17.25l1.3 .75' />
      <path d='M20.733 20l1.3 .75' />
    </svg>
  );
};

const IconUsers = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0' />
      <path d='M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2' />
      <path d='M16 3.13a4 4 0 0 1 0 7.75' />
      <path d='M21 21v-2a4 4 0 0 0 -3 -3.85' />
    </svg>
  );
};

const IconArrowDown = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M12 5l0 14' />
      <path d='M18 13l-6 6' />
      <path d='M6 13l6 6' />
    </svg>
  );
};

const IconCircleX = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' />
      <path d='M10 10l4 4m0 -4l-4 4' />
    </svg>
  );
};

const IconLoader2 = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M12 3a9 9 0 1 0 9 9' />
    </svg>
  );
};

const IconPlayerStop = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M5 5m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z' />
    </svg>
  );
};

const IconRepeat = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3' />
      <path d='M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3' />
    </svg>
  );
};

const IconSend = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M10 14l11 -11' />
      <path d='M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5' />
    </svg>
  );
};

const IconUpload = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2' />
      <path d='M7 9l5 -5l5 5' />
      <path d='M12 4l0 12' />
    </svg>
  );
};

const IconEdit = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1' />
      <path d='M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z' />
      <path d='M16 5l3 3' />
    </svg>
  );
};

const IconTrash = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M4 7l16 0' />
      <path d='M10 11l0 6' />
      <path d='M14 11l0 6' />
      <path d='M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12' />
      <path d='M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3' />
    </svg>
  );
};
const IconLogout = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2' />
      <path d='M9 12h12l-3 -3' />
      <path d='M18 15l3 -3' />
    </svg>
  );
};
const IconMoneybag = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5a3.5 3.5 0 0 1 -3.5 3.5h-1a3.5 3.5 0 0 1 -3.5 -3.5a1.5 1.5 0 0 1 1.5 -1.5z' />
      <path d='M4 17v-1a8 8 0 1 1 16 0v1a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z' />
    </svg>
  );
};
const IconPasswordUser = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M12 17v4' />
      <path d='M10 20l4 -2' />
      <path d='M10 18l4 2' />
      <path d='M5 17v4' />
      <path d='M3 20l4 -2' />
      <path d='M3 18l4 2' />
      <path d='M19 17v4' />
      <path d='M17 20l4 -2' />
      <path d='M17 18l4 2' />
      <path d='M9 6a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' />
      <path d='M7 14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2' />
    </svg>
  );
};
const IconSettings = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z' />
      <path d='M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' />
    </svg>
  );
};
const IconMessage = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M8 9h8' />
      <path d='M8 13h6' />
      <path d='M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z' />
    </svg>
  );
};
const IconMessageShare = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M8 9h8' />
      <path d='M8 13h6' />
      <path d='M13 18l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6' />
      <path d='M16 22l5 -5' />
      <path d='M21 21.5v-4.5h-4.5' />
    </svg>
  );
};
const IconPencil = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4' />
      <path d='M13.5 6.5l4 4' />
    </svg>
  );
};
const IconClipboard = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2' />
      <path d='M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z' />
    </svg>
  );
};
const IconDownload = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2' />
      <path d='M7 11l5 5l5 -5' />
      <path d='M12 4l0 12' />
    </svg>
  );
};
const IconBulbFilled = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path
        d='M4 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z'
        strokeWidth='0'
        fill='currentColor'
      />
      <path
        d='M12 2a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z'
        strokeWidth='0'
        fill='currentColor'
      />
      <path
        d='M21 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z'
        strokeWidth='0'
        fill='currentColor'
      />
      <path
        d='M4.893 4.893a1 1 0 0 1 1.32 -.083l.094 .083l.7 .7a1 1 0 0 1 -1.32 1.497l-.094 -.083l-.7 -.7a1 1 0 0 1 0 -1.414z'
        strokeWidth='0'
        fill='currentColor'
      />
      <path
        d='M17.693 4.893a1 1 0 0 1 1.497 1.32l-.083 .094l-.7 .7a1 1 0 0 1 -1.497 -1.32l.083 -.094l.7 -.7z'
        strokeWidth='0'
        fill='currentColor'
      />
      <path
        d='M14 18a1 1 0 0 1 1 1a3 3 0 0 1 -6 0a1 1 0 0 1 .883 -.993l.117 -.007h4z'
        strokeWidth='0'
        fill='currentColor'
      />
      <path
        d='M12 6a6 6 0 0 1 3.6 10.8a1 1 0 0 1 -.471 .192l-.129 .008h-6a1 1 0 0 1 -.6 -.2a6 6 0 0 1 3.6 -10.8z'
        strokeWidth='0'
        fill='currentColor'
      />
    </svg>
  );
};
const IconMenu = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M4 8l16 0' />
      <path d='M4 16l16 0' />
    </svg>
  );
};
const IconMistOff = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M12 5h9' />
      <path d='M3 10h7' />
      <path d='M18 10h1' />
      <path d='M5 15h5' />
      <path d='M14 15h1m4 0h2' />
      <path d='M3 20h9m4 0h3' />
      <path d='M3 3l18 18' />
    </svg>
  );
};
const IconPlus = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M12 5l0 14' />
      <path d='M5 12l14 0' />
    </svg>
  );
};
const IconSquareRoundedX = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M10 10l4 4m0 -4l-4 4' />
      <path d='M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z' />
    </svg>
  );
};
const IconChartPie = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-6.8a2 2 0 0 1 -2 -2v-7a.9 .9 0 0 0 -1 -.8' />
      <path d='M15 3.5a9 9 0 0 1 5.5 5.5h-4.5a1 1 0 0 1 -1 -1v-4.5' />
    </svg>
  );
};
const IconCreditCard = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z' />
      <path d='M3 10l18 0' />
      <path d='M7 15l.01 0' />
      <path d='M11 15l2 0' />
    </svg>
  );
};
const IconFiles = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M15 3v4a1 1 0 0 0 1 1h4' />
      <path d='M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z' />
      <path d='M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2' />
    </svg>
  );
};
const IconKey = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z' />
      <path d='M15 9h.01' />
    </svg>
  );
};
const IconMessages = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10' />
      <path d='M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2' />
    </svg>
  );
};
const IconNotes = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z' />
      <path d='M9 7l6 0' />
      <path d='M9 11l6 0' />
      <path d='M9 15l4 0' />
    </svg>
  );
};
const IconSettingsCog = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M12.003 21c-.732 .001 -1.465 -.438 -1.678 -1.317a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c.886 .215 1.325 .957 1.318 1.694' />
      <path d='M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' />
      <path d='M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
      <path d='M19.001 15.5v1.5' />
      <path d='M19.001 21v1.5' />
      <path d='M22.032 17.25l-1.299 .75' />
      <path d='M17.27 20l-1.3 .75' />
      <path d='M15.97 17.25l1.3 .75' />
      <path d='M20.733 20l1.3 .75' />
    </svg>
  );
};
const IconDots = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' />
      <path d='M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' />
      <path d='M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' />
    </svg>
  );
};

var Base = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    ></svg>
  );
};

var IconShieldLock = (props: IconProps) => {
  const { className, size = 20, strokeWidth = 2, stroke, onClick } = props;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      onClick={onClick}
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      stroke={stroke || 'hsl(var(--foreground))'}
      viewBox='0 0 24 24'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      {' '}
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3' />
      <path d='M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' />
      <path d='M12 12l0 2.5' />
    </svg>
  );
};

export {
  IconShare,
  IconCheck,
  IconCopy,
  IconRobot,
  IconUser,
  IconArrowDown,
  IconCircleX,
  IconLoader2,
  IconPlayerStop,
  IconRepeat,
  IconSend,
  IconUpload,
  IconEdit,
  IconTrash,
  IconLogout,
  IconMoneybag,
  IconPasswordUser,
  IconSettings,
  IconUserCog,
  IconMessage,
  IconMessageShare,
  IconPencil,
  IconX,
  IconClipboard,
  IconDownload,
  IconBulbFilled,
  IconMenu,
  IconMistOff,
  IconPlus,
  IconSquareRoundedX,
  IconChartPie,
  IconCreditCard,
  IconFiles,
  IconKey,
  IconMessages,
  IconNotes,
  IconSettingsCog,
  IconUsers,
  IconDots,
  IconShieldLock,
};
