export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'ui-error ' + className}
        >
            {message}
        </p>
    ) : null;
}
