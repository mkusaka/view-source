/** @jsxImportSource hono/jsx */
import type { FC, JSX } from 'hono/jsx';

export type ButtonProps = JSX.IntrinsicElements['button'];

export const Button: FC<ButtonProps> = (props) => (
	<button {...props} className={`bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 focus:outline-none ${props.className ?? ''}`}>
		{props.children}
	</button>
);
