export default function PrimaryButton({ className = '', disabled, children, ...props }) {
  return (
    <button
      {...props}
      className={
        `ui-btn ui-btn-primary focus:outline-none focus:ring-2 focus:ring-unispa-accent focus:ring-offset-2` +
        ' ' +
        className
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}