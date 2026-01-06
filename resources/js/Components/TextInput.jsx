import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
  { type = 'text', className = '', isFocused = false, ...props },
  ref,
) {
  const localRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <input
      {...props}
      type={type}
      className={
        'w-full rounded-full border border-unispa-muted shadow-sm px-4 py-2 focus:border-unispa-primary focus:ring focus:ring-unispa-muted/70 focus:outline-none transition duration-200 ' +
        className
      }
      ref={localRef}
    />
  );
});