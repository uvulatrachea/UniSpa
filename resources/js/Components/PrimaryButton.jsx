export default function PrimaryButton({ className = '', disabled, children, ...props }) {
  return (
    <button
      {...props}
      className={
        `inline-flex items-center rounded-full bg-unispa-primary px-6 py-3 font-semibold uppercase tracking-widest text-white transition-transform transform hover:scale-105 hover:bg-unispa-primaryDark focus:outline-none focus:ring-2 focus:ring-unispa-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed` +
        ' ' +
        className
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}