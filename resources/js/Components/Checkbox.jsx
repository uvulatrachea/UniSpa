export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded-md border-slate-300 text-unispa-primary shadow-sm focus:ring-unispa-primary/40 ' +
                className
            }
        />
    );
}
