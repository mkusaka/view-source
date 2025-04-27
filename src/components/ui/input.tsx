/** @jsxImportSource hono/jsx */
import type { FC, JSX } from 'hono/jsx';

// Pull the exact input props from Hono’s JSX
export type InputProps = JSX.IntrinsicElements['input'];

export const Input: FC<InputProps> = (props) => (
	<input
		{...props}
		// Hono’s JSX sees className, not React’s class
		className={`border rounded px-3 py-2 focus:outline-none focus:ring ${props.className ?? ''}`}
	/>
);
